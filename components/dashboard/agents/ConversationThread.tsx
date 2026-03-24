'use client'

import { Send } from 'lucide-react'
import { useRef, useState } from 'react'
import { toast } from 'sonner'
import { AgentBadge } from '@/components/dashboard/agents/AgentBadge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { ConversationDetail, ConversationMessage } from '@/services/agents/dashboard'

interface ConversationThreadProps {
  conversation: ConversationDetail
  tenantId: number
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ConversationThread({ conversation, tenantId }: ConversationThreadProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>(conversation.messages ?? [])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async () => {
    const text = input.trim()
    if (!text || sending) return

    const userMsg: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setSending(true)
    scrollToBottom()

    try {
      const res = await fetch('/api/agents/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          thread_id: conversation.thread_id,
          tenant_id: String(tenantId),
          message: text,
        }),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to send')
      }

      const { content: reply, agent } = await res.json()

      const assistantMsg: ConversationMessage = {
        role: 'assistant',
        content: reply,
        agent,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, assistantMsg])
      scrollToBottom()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message')
      // Remove optimistic user message on failure
      setMessages((prev) => prev.filter((m) => m !== userMsg))
      setInput(text)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      data-testid="conversation-thread"
      className="flex h-[calc(100vh-12rem)] flex-col rounded-lg border border-border bg-[var(--color-bg-primary)]"
    >
      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <p
              data-testid="thread-empty"
              className="text-center text-sm text-muted-foreground py-8"
            >
              No messages yet.
            </p>
          )}
          {messages.map((msg, i) => (
            <div
              // biome-ignore lint/suspicious/noArrayIndexKey: messages lack stable IDs
              key={i}
              data-testid={`message-${msg.role}-${i}`}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`flex max-w-[75%] flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                {msg.role === 'assistant' && msg.agent && (
                  <AgentBadge agentName={msg.agent} className="mb-0.5" />
                )}
                <div
                  className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-foreground text-background'
                      : 'bg-secondary text-foreground'
                  }`}
                >
                  {msg.content}
                </div>
                <span className="text-xs text-muted-foreground">{formatTime(msg.timestamp)}</span>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex gap-2">
          <Input
            data-testid="conversation-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message…"
            disabled={sending}
            className="flex-1"
          />
          <Button
            data-testid="btn-send-message"
            onClick={handleSend}
            disabled={!input.trim() || sending}
            size="icon"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
