'use client'

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import KidsCompanion, { type CompanionMood } from './KidsCompanion'
import { useFlareAI } from '@/hooks/useFlareAI'
import type { AgentClientAction } from '@/lib/ai/flareAgentEngine'
import { KIDS_WORLDS, type KidsWorldId } from '@/data/kidsWorlds'
import { AgentStatusMark, LatticeLoader } from '@/components/ui/reactbits/MotionPrimitives'

const STARTER_SUGGESTIONS = [
  'Why does fire make a round ball in space?',
  'What are the 3 ingredients of the Fire Triangle?',
  'How do astronauts stay safe from fire on the ISS?',
  'What is a secret invisible cool flame?',
  'Compare cloth, paper, and plastic in the chamber!',
  'Tell me a surprising space fire fact!',
]

export interface KidsAskSparkyProps {
  gravity?: 'earth' | 'space'
  o2Level?: 'low' | 'normal' | 'high'
  fuel?: 'cloth' | 'paper' | 'plastic'
  selectedWorldId?: KidsWorldId
  onSelectWorld?: (worldId: KidsWorldId) => void
  onOpenLab?: (
    focus?: 'gravity' | 'oxygen' | 'fuel',
    gravity?: 'space' | 'earth',
    o2?: 'low' | 'normal' | 'high'
  ) => void
}

function formatKidsText(text: string) {
  const paragraphs = text.split('\n\n')
  return paragraphs.map((para, pIdx) => {
    const parts = para.split(/(\*\*[^*]+\*\*)/g)
    return (
      <p key={pIdx} className={pIdx > 0 ? 'mt-2.5' : ''}>
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <strong key={idx} className="font-extrabold text-slate-950">
                {part.slice(2, -2)}
              </strong>
            )
          }
          return part
        })}
      </p>
    )
  })
}

export default function KidsAskSparky({
  gravity = 'space',
  o2Level = 'normal',
  fuel = 'cloth',
  selectedWorldId = 'meet-the-flame',
  onSelectWorld,
  onOpenLab,
}: KidsAskSparkyProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const handleClientAction = useCallback(
    (action: AgentClientAction) => {
      const payload = action.payload ?? {}
      if (action.type === 'kids_select_world' && payload.worldId && onSelectWorld) {
        onSelectWorld(payload.worldId as KidsWorldId)
      } else if (action.type === 'kids_open_sandbox' && onOpenLab) {
        onOpenLab(
          (payload.focus as 'gravity' | 'oxygen' | 'fuel' | undefined) ?? 'gravity',
          payload.gravity as 'space' | 'earth' | undefined,
          payload.o2 as 'low' | 'normal' | 'high' | undefined
        )
      }
    },
    [onSelectWorld, onOpenLab]
  )

  const {
    messages,
    isLoading,
    isDemo,
    providerLabel,
    sendMessage,
    executeAction,
    clearMessages,
  } = useFlareAI({
    mode: 'kids',
    onClientAction: handleClientAction,
  })

  const currentWorld = useMemo(
    () => KIDS_WORLDS.find((w) => w.id === selectedWorldId) ?? KIDS_WORLDS[0],
    [selectedWorldId]
  )

  const context = useMemo(
    () => ({
      gravity,
      o2Level,
      fuel,
      selectedWorldId,
      selectedWorldTitle: currentWorld.title,
    }),
    [gravity, o2Level, fuel, selectedWorldId, currentWorld.title]
  )

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  const send = useCallback(
    (text: string) => {
      if (!text.trim() || isLoading) return
      sendMessage(text.trim(), context)
      setInput('')
    },
    [sendMessage, context, isLoading]
  )

  const autoPromptSentRef = useRef(false)
  useEffect(() => {
    if (typeof window === 'undefined' || autoPromptSentRef.current) return
    const sp = new URLSearchParams(window.location.search)
    const promptParam = sp.get('ai_prompt')
    if (promptParam && promptParam.trim()) {
      autoPromptSentRef.current = true
      sendMessage(promptParam.trim(), context)
    }
  }, [sendMessage, context])

  const lastSparkyMood: CompanionMood = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].from === 'assistant' && messages[i].mood) {
        return messages[i].mood as CompanionMood
      }
    }
    return 'wave'
  }, [messages])

  const modeBadgeText =
    isDemo === false
      ? '✦ Live Gemini AI + FLARE Kids Safety Guardrails'
      : providerLabel ?? '🛡️ FLARE Kids Science Guide · Safe Interactive Agent'

  return (
    <div
      className="flex flex-col w-full max-w-4xl mx-auto px-2 sm:px-4 pb-safe"
      style={{ height: 'calc(100dvh - 145px)', minHeight: 460 }}
    >
      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-t-[28px] px-5 sm:px-6 py-4 flex-shrink-0 border-2 border-violet-300 bg-white shadow-sm">
        <div className="flex items-center gap-3.5">
          <KidsCompanion mood={isLoading ? 'thinking' : lastSparkyMood} size={54} />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-space-grotesk text-lg sm:text-xl font-black text-slate-900">
                Ask Sparky
              </h1>
              <span className="rounded-full bg-violet-100 border border-violet-300 px-2.5 py-0.5 text-[11px] font-extrabold text-violet-900">
                Kids Science Guide
              </span>
            </div>
            <p className="text-xs font-bold text-slate-600">
              Exploring:{' '}
              <span className="text-violet-700 font-extrabold">{currentWorld.title}</span> ·
              Sandbox:{' '}
              <span className="text-orange-700 font-extrabold">
                {gravity === 'space' ? 'Space 0g' : 'Earth 1g'} / {o2Level} O₂ / {fuel}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={clearMessages}
              className="rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-300 px-3 py-1 text-xs font-extrabold text-slate-700 cursor-pointer transition-colors"
            >
              Start Fresh ↺
            </button>
          )}
          <AgentStatusMark
            state={isLoading ? 'executing_tools' : messages.length > 0 ? 'completed' : 'idle'}
            variant="kids"
            isLiveCloud={isDemo === false}
          />
        </div>
      </div>

      {/* ── Provenance & Safety Strip ── */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-2 flex-shrink-0 bg-amber-50 border-x-2 border-b border-violet-300 text-xs font-extrabold text-amber-950">
        <span>{modeBadgeText}</span>
        <span className="text-[11px] font-bold text-amber-800">
          🛡️ Never play with real fire · Virtual space chamber only!
        </span>
      </div>

      {/* ── Messages Stage ── */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 flex flex-col gap-4 border-x-2 border-violet-300 bg-[#fffdf9]">
        {/* Intro message from Sparky (always visible at top) */}
        <div className="flex items-start gap-3">
          <KidsCompanion mood="wave" size={44} />
          <div className="flex-1 max-w-2xl">
            <div className="rounded-3xl rounded-tl-sm px-5 py-4 text-sm font-medium leading-relaxed text-slate-800 bg-sky-50 border-2 border-sky-200 shadow-sm">
              <p className="font-extrabold text-slate-900 mb-1">
                Hi Space Explorer! 👋 I&apos;m Sparky, your FLARE Science Guide!
              </p>
              <p>
                I can explain how fire behaves in outer space, test different fuels in our virtual
                chamber, tell stories from real NASA space experiments, or open any of the{' '}
                <strong>5 Science Worlds</strong> for you! What are you curious about today?
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Conversation Turns */}
        {messages.map((msg) => (
          <div key={msg.id}>
            {msg.from === 'assistant' ? (
              <div className="flex items-start gap-3">
                <KidsCompanion
                  mood={(msg.mood as CompanionMood) ?? 'explain'}
                  size={44}
                />
                <div className="flex-1 max-w-2xl space-y-2.5">
                  {/* Adaptation or Safety Badge */}
                  {msg.safetyRedirected && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 border-2 border-rose-300 px-3 py-1 text-xs font-extrabold text-rose-900">
                      <span>🛡️</span>
                      <span>Space Safety Rule Activated</span>
                    </div>
                  )}
                  {msg.adaptation?.adaptedToConfusion && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border-2 border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-900">
                      <span>💡</span>
                      <span>Super-Simple Analogy Mode!</span>
                    </div>
                  )}
                  {msg.adaptation?.handledCorrection && (
                    <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 border-2 border-emerald-300 px-3 py-1 text-xs font-extrabold text-emerald-900">
                      <span>✓</span>
                      <span>Updated with your new setting!</span>
                    </div>
                  )}

                  {/* Sparky Speech Bubble */}
                  <div
                    className={`rounded-3xl rounded-tl-sm px-5 py-4 text-sm font-medium leading-relaxed shadow-sm border-2 ${
                      msg.safetyRedirected
                        ? 'bg-rose-50 border-rose-300 text-slate-900'
                        : 'bg-sky-50 border-sky-200 text-slate-800'
                    }`}
                  >
                    {formatKidsText(msg.text ?? msg.reply ?? '')}
                  </div>

                  {/* Interactive Kids Universe Actions (Open Sandbox / Jump to Science World) */}
                  {msg.clientActions && msg.clientActions.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {msg.clientActions.map((act, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => executeAction(msg.id, act)}
                          className="inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-black bg-[#fde047] hover:bg-yellow-300 text-[#071126] border-2 border-amber-400 shadow-sm cursor-pointer transition-transform hover:-translate-y-0.5"
                        >
                          <span>🚀</span>
                          <span>{act.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Follow-up Question Chips */}
                  {msg.followUps && msg.followUps.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-0.5">
                      {msg.followUps.map((fu) => (
                        <button
                          key={fu}
                          type="button"
                          onClick={() => send(fu)}
                          className="text-xs font-extrabold rounded-full px-3.5 py-1.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 bg-white border-2 border-sky-300 text-sky-900 hover:bg-sky-100 shadow-sm"
                        >
                          {fu}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-end">
                <div className="rounded-3xl rounded-tr-sm px-5 py-3 text-sm font-bold leading-relaxed text-white max-w-md bg-orange-500 border-2 border-orange-600 shadow-sm">
                  {msg.text}
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex items-start gap-3">
            <KidsCompanion mood="thinking" size={44} />
            <div className="rounded-3xl rounded-tl-sm px-4 py-3 flex items-center bg-sky-50 border-2 border-sky-200">
              <LatticeLoader
                variant="kids"
                label="Sparky is checking the space combustion chamber…"
              />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* ── Quick Helper Strip (when chatting) ── */}
      {messages.length > 0 && !isLoading && (
        <div className="flex flex-wrap items-center gap-2 px-5 py-2 bg-violet-50 border-x-2 border-t border-violet-200">
          <span className="text-xs font-extrabold text-violet-900">Need help?</span>
          <button
            type="button"
            onClick={() => send("I'm confused, can you explain that more simply?")}
            className="rounded-full bg-white hover:bg-amber-50 border border-amber-300 px-3 py-1 text-xs font-extrabold text-amber-900 cursor-pointer transition-colors"
          >
            💡 Explain it simpler!
          </button>
          <button
            type="button"
            onClick={() => send('Tell me another cool space fire fact!')}
            className="rounded-full bg-white hover:bg-sky-50 border border-sky-300 px-3 py-1 text-xs font-extrabold text-sky-900 cursor-pointer transition-colors"
          >
            🌟 Surprise me!
          </button>
        </div>
      )}

      {/* ── Input bar ── */}
      <div className="flex gap-2 sm:gap-2.5 px-3 sm:px-5 py-3 sm:py-4 flex-shrink-0 rounded-b-[28px] bg-white border-2 border-violet-300 shadow-sm pb-safe">
        <input
          type="text"
          aria-label="Ask Sparky a science question"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') send(input)
          }}
          placeholder="Ask Sparky about space flames, oxygen, astronauts, or say 'I don't get it'..."
          className="flex-1 rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm font-semibold text-slate-900 placeholder-slate-400 bg-slate-50 border-2 border-slate-200 focus:border-violet-500 outline-none transition-all duration-200"
        />
        <button
          type="button"
          onClick={() => send(input)}
          disabled={!input.trim() || isLoading}
          className="min-h-[44px] rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer disabled:opacity-40 bg-orange-500 hover:bg-orange-600 text-white shadow-sm shrink-0"
        >
          Ask 🚀
        </button>
      </div>

      {/* ── Starter suggestions (only when fresh) ── */}
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 mt-3.5 justify-center">
          {STARTER_SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => send(s)}
              className="text-xs font-extrabold rounded-full px-3.5 py-1.5 cursor-pointer transition-all duration-200 hover:-translate-y-0.5 bg-white/95 border-2 border-violet-300 text-violet-900 hover:bg-violet-50 shadow-sm"
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
