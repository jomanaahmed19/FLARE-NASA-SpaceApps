import { NextRequest, NextResponse } from 'next/server'
import {
  runScientificAgentTurn,
  runKidsGuideTurn,
  buildLiveLLMSystemPrompt,
  checkSafetyGuardrails,
  type AIChatRequest,
  type AIChatResponse,
  type AISection,
  type AgentHistoryItem,
  type AgentToolCallRecord,
  type AgentClientAction,
  type AgentCitation,
  type AgentSessionAdaptation,
  type ExplanationLevel,
} from '@/lib/ai/flareAgentEngine'

export type {
  AIChatRequest,
  AIChatResponse,
  AISection,
  AgentHistoryItem,
  AgentToolCallRecord,
  AgentClientAction,
  AgentCitation,
  AgentSessionAdaptation,
  ExplanationLevel,
}

// ── Live Gemini Cloud LLM Caller (gemini-2.5-flash -> gemini-2.0-flash fallback) ──

async function callGeminiWithTools(
  systemPrompt: string,
  userMessage: string,
  history: AgentHistoryItem[]
): Promise<{ text: string; modelUsed: string }> {
  const apiKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    ''

  if (!apiKey || apiKey === 'your_api_key_here') {
    throw new Error('GEMINI_API_KEY not configured')
  }

  const contents = [
    ...history.slice(-10).map((h) => ({
      role: h.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: h.text }],
    })),
    { role: 'user', parts: [{ text: userMessage }] },
  ]

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: {
      temperature: 0.35,
      maxOutputTokens: 1400,
    },
  }

  const candidateModels = ['gemini-2.5-flash', 'gemini-2.0-flash']
  let lastError = 'Unknown Gemini API error'

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const errText = await res.text()
        lastError = `Gemini (${modelName}) HTTP ${res.status}: ${errText.slice(0, 180)}`
        continue
      }

      const data = await res.json()
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? ''
      if (text) {
        return { text, modelUsed: modelName }
      }
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err)
    }
  }

  throw new Error(lastError)
}

// ── GET /api/ai-chat — Agent Capabilities & Configuration Status ─────────────

export async function GET(): Promise<NextResponse> {
  const rawKey =
    process.env.GEMINI_API_KEY?.trim() ||
    process.env.GOOGLE_AI_API_KEY?.trim() ||
    ''
  const hasCloudKey = Boolean(rawKey && rawKey !== 'your_api_key_here')

  return NextResponse.json({
    agentName: 'FLARE Unified AI Agent',
    modes: ['science', 'kids'],
    cloudLlmConfigured: hasCloudKey,
    providerLabel: hasCloudKey
      ? 'Live Gemini Cloud LLM + FLARE Tool Engine'
      : 'Local FLARE Scientific Agent Engine (Configure GEMINI_API_KEY in .env.local for Cloud LLM)',
    availableTools: [
      'run_combustion_simulation',
      'compare_combustion_states',
      'search_nasa_experiments',
      'retrieve_research_library',
      'analyze_material_properties',
      'generate_research_report',
      'navigate_or_configure_flare',
    ],
  })
}

// ── POST /api/ai-chat — Unified Multi-Turn Agent Endpoint ────────────────────

export async function POST(
  req: NextRequest
): Promise<NextResponse<AIChatResponse>> {
  try {
    const body = (await req.json()) as AIChatRequest
    const mode = body.mode === 'kids' ? 'kids' : 'science'
    const message = (body.message ?? '').trim()
    const context = body.context ?? {}
    const history = Array.isArray(body.history) ? body.history : []
    const preferredLevel = body.sessionPreferences?.explanationLevel

    if (!message) {
      return NextResponse.json(
        {
          mode,
          reply: 'Please enter a question or command so I can assist you.',
          text: 'Please enter a question or command so I can assist you.',
          isDemo: true,
          providerLabel: 'Validation Error',
          error: 'Empty message',
        },
        { status: 400 }
      )
    }

    const rawKey =
      process.env.GEMINI_API_KEY?.trim() ||
      process.env.GOOGLE_AI_API_KEY?.trim() ||
      ''
    const hasCloudKey = Boolean(rawKey && rawKey !== 'your_api_key_here')

    // 1. Check safety guardrails FIRST (before any LLM or tool execution)
    const safety = checkSafetyGuardrails(message, mode)
    if (!safety.safe) {
      return NextResponse.json({
        mode,
        reply: safety.redirectReply!,
        text: safety.redirectReply!,
        mood: 'concerned',
        followUps: safety.followUps,
        safetyRedirected: true,
        isDemo: !hasCloudKey,
        providerLabel: 'FLARE Safety Guardrail Engine',
      })
    }

    // 2. Execute the FLARE Agent Engine turn (runs real server-side tools:
    //    D² Law simulation, counterfactual state comparisons, NASA archive search,
    //    material thermochemistry, and multi-turn adaptation)
    const engineResult =
      mode === 'kids'
        ? runKidsGuideTurn(message, context, history, preferredLevel)
        : runScientificAgentTurn(message, context, history, preferredLevel)

    // 3. If a server-side GEMINI_API_KEY is configured, enhance the synthesis
    //    using the live Gemini LLM grounded in the exact tool outputs

    if (hasCloudKey) {
      try {
        const systemPrompt = buildLiveLLMSystemPrompt(
          mode,
          context,
          engineResult.toolCalls ?? [],
          engineResult.adaptation!
        )
        const llmOut = await callGeminiWithTools(systemPrompt, message, history)
        return NextResponse.json({
          ...engineResult,
          reply: llmOut.text,
          text: llmOut.text,
          isDemo: false,
          providerLabel: `Live Gemini (${llmOut.modelUsed}) + FLARE Tool Engine`,
        })
      } catch (llmErr) {
        console.warn(
          '[FLARE AI Agent] Cloud LLM call failed, using verified Local FLARE Agent Engine:',
          llmErr
        )
      }
    }

    // 4. Return the verified Local FLARE Agent Engine response with full tool outputs,
    //    client actions, citations, and honest provenance badging
    return NextResponse.json({
      ...engineResult,
      isDemo: true,
      providerLabel:
        'FLARE Local Agent Engine · Real D² Law & NASA Tools (Set GEMINI_API_KEY for Cloud LLM)',
    })
  } catch (err) {
    console.error('[FLARE AI Agent] Route error:', err)
    return NextResponse.json(
      {
        mode: 'science',
        reply:
          'I encountered an unexpected error while processing your request. Please try again.',
        text: 'I encountered an unexpected error while processing your request. Please try again.',
        isDemo: true,
        providerLabel: 'Error Recovery',
        error: 'Server error',
      },
      { status: 500 }
    )
  }
}
