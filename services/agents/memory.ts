import { createServiceRoleClient } from '@/lib/supabase/server'

export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
  agent?: string
  timestamp: string
}

export async function getOrCreateConversation(
  tenantId: number,
  threadId: string,
  channel = 'api',
): Promise<{ id: string; messages: ConversationMessage[] }> {
  const db = createServiceRoleClient()

  const { data: existing, error: fetchErr } = await db
    .from('agent_conversations')
    .select('id, messages')
    .eq('tenant_id', tenantId)
    .eq('thread_id', threadId)
    .single()

  if (fetchErr && fetchErr.code !== 'PGRST116') {
    throw new Error(`memory.getOrCreate fetch: ${fetchErr.message}`)
  }

  if (existing) {
    return {
      id: existing.id as string,
      messages: (existing.messages as ConversationMessage[]) ?? [],
    }
  }

  const { data: created, error: insertErr } = await db
    .from('agent_conversations')
    .insert({ tenant_id: tenantId, thread_id: threadId, from_channel: channel })
    .select('id')
    .single()

  if (insertErr || !created) {
    throw new Error(`memory.getOrCreate insert: ${insertErr?.message}`)
  }

  return { id: created.id as string, messages: [] }
}

export async function appendMessages(
  conversationId: string,
  newMessages: ConversationMessage[],
  lastAgentName?: string,
): Promise<void> {
  const db = createServiceRoleClient()

  const { data: current, error: fetchErr } = await db
    .from('agent_conversations')
    .select('messages')
    .eq('id', conversationId)
    .single()

  if (fetchErr || !current) {
    throw new Error(`memory.append fetch: ${fetchErr?.message}`)
  }

  const merged = [...((current.messages as ConversationMessage[]) ?? []), ...newMessages]

  const { error: updateErr } = await db
    .from('agent_conversations')
    .update({
      messages: merged,
      updated_at: new Date().toISOString(),
      ...(lastAgentName ? { agent_name: lastAgentName } : {}),
    })
    .eq('id', conversationId)

  if (updateErr) {
    throw new Error(`memory.append update: ${updateErr.message}`)
  }
}

export async function listConversations(
  tenantId: number,
  limit = 20,
): Promise<Array<{ id: string; thread_id: string; status: string; updated_at: string }>> {
  const db = createServiceRoleClient()

  const { data, error } = await db
    .from('agent_conversations')
    .select('id, thread_id, status, updated_at')
    .eq('tenant_id', tenantId)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(`memory.list: ${error.message}`)
  }

  return (data ?? []) as Array<{
    id: string
    thread_id: string
    status: string
    updated_at: string
  }>
}
