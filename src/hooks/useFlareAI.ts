'use client'

import { useState, useCallback, useRef } from 'react'
import type {
  AISection,
  AgentHistoryItem,
  AgentToolCallRecord,
  AgentClientAction,
  AgentCitation,
  AgentSessionAdaptation,
  ExplanationLevel,
  AIChatResponse,
} from '@/app/api/ai-chat/route'

export interface AIMessage {
  id: string
  from: 'user' | 'assistant'
  text?: string
  reply?: string
  sections?: AISection[]
  toolCalls?: AgentToolCallRecord[]
  clientActions?: Array<AgentClientAction & { executed?: boolean }>
  citations?: AgentCitation[]
  followUps?: string[]
  adaptation?: AgentSessionAdaptation
  mood?: AIChatResponse['mood']
  isDemo?: boolean
  providerLabel?: string
  safetyRedirected?: boolean
  error?: boolean
  timestamp: number
}

interface UseFlareAIOptions {
  mode: 'science' | 'kids'
  initialMessages?: AIMessage[]
  onClientAction?: (action: AgentClientAction) => void
}

export function useFlareAI({
  mode,
  initialMessages = [],
  onClientAction,
}: UseFlareAIOptions) {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [isDemo, setIsDemo] = useState<boolean | null>(null)
  const [providerLabel, setProviderLabel] = useState<string>('')
  const [explanationLevel, setExplanationLevel] =
    useState<ExplanationLevel>('standard')

  const historyRef = useRef<AgentHistoryItem[]>([])

  const executeAction = useCallback(
    (msgId: string, action: AgentClientAction) => {
      onClientAction?.(action)
      setMessages((prev) =>
        prev.map((m) =>
          m.id !== msgId
            ? m
            : {
              ...m,
              clientActions: m.clientActions?.map((a) =>
                a.id === action.id ? { ...a, executed: true } : a
              ),
            }
        )
      )
    },
    [onClientAction]
  )

  const sendMessage = useCallback(
    async (
      text: string,
      context: Record<string, unknown>,
      levelOverride?: ExplanationLevel
    ) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      const effectiveLevel = levelOverride ?? explanationLevel
      if (levelOverride) {
        setExplanationLevel(levelOverride)
      }

      const userMsg: AIMessage = {
        id: `u-${Date.now()}`,
        from: 'user',
        text: trimmed,
        reply: trimmed,
        timestamp: Date.now(),
      }

      setMessages((prev) => [...prev, userMsg])
      setIsLoading(true)

      const priorHistory = [...historyRef.current.slice(-10)]
      historyRef.current = [
        ...priorHistory,
        { role: 'user', text: trimmed },
      ]

      try {
        const res = await fetch('/api/ai-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            mode,
            message: trimmed,
            context,
            history: priorHistory,
            sessionPreferences: {
              explanationLevel: effectiveLevel,
            },
          }),
        })

        const data = (await res.json()) as AIChatResponse

        if (!res.ok || data.error) {
          throw new Error(data.error ?? 'Failed to reach FLARE AI Agent')
        }

        setIsDemo(data.isDemo ?? true)
        setProviderLabel(data.providerLabel ?? '')

        if (data.adaptation?.explanationLevel) {
          setExplanationLevel(data.adaptation.explanationLevel)
        }

        const assistantReply =
          data.reply ??
          data.text ??
          (data.sections ? data.sections.map((s) => s.text).join(' ') : '')

        historyRef.current = [
          ...historyRef.current,
          {
            role: 'assistant',
            text: assistantReply,
            topic: data.adaptation?.activeTopic,
            toolNames: data.toolCalls?.map((t) => t.name),
          },
        ]

        const msgId = `a-${Date.now()}`
        const processedActions = (data.clientActions ?? []).map((act) => {
          if (act.autoExecuted && !act.requiresConfirmation && onClientAction) {
            onClientAction(act)
            return { ...act, executed: true }
          }
          return { ...act, executed: false }
        })

        const assistantMsg: AIMessage = {
          id: msgId,
          from: 'assistant',
          text: assistantReply,
          reply: assistantReply,
          sections: data.sections,
          toolCalls: data.toolCalls,
          clientActions: processedActions,
          citations: data.citations,
          followUps: data.followUps,
          adaptation: data.adaptation,
          mood: data.mood,
          isDemo: data.isDemo,
          providerLabel: data.providerLabel,
          safetyRedirected: data.safetyRedirected,
          timestamp: Date.now(),
        }

        setMessages((prev) => [...prev, assistantMsg])
      } catch (err) {
        console.error('[useFlareAI] Error:', err)
        const errorMsg: AIMessage = {
          id: `e-${Date.now()}`,
          from: 'assistant',
          text: 'I encountered a connection issue while processing that request. Please try sending your message again.',
          reply:
            'I encountered a connection issue while processing that request. Please try sending your message again.',
          error: true,
          isDemo: true,
          timestamp: Date.now(),
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setIsLoading(false)
      }
    },
    [mode, isLoading, explanationLevel, onClientAction]
  )

  const clearMessages = useCallback(() => {
    setMessages(initialMessages)
    historyRef.current = []
  }, [initialMessages])

  return {
    messages,
    isLoading,
    isDemo,
    providerLabel,
    explanationLevel,
    setExplanationLevel,
    sendMessage,
    executeAction,
    clearMessages,
  }
}
