import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { AgentDefinition } from './types'

const MODEL_MAP: Record<string, string> = {
  sonnet: 'claude-sonnet-4-6',
  opus: 'claude-opus-4-6',
  haiku: 'claude-haiku-4-5',
}

export function parseAgentDefinition(mdContent: string): Partial<AgentDefinition> {
  const frontmatterMatch = mdContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!frontmatterMatch) {
    return { systemPrompt: mdContent.trim() }
  }

  const [, frontmatter, body] = frontmatterMatch
  const fields: Record<string, string> = {}

  for (const line of frontmatter.split('\n')) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    const value = line.slice(colonIdx + 1).trim()
    fields[key] = value
  }

  const rawModel = fields.model ?? 'sonnet'
  const model = MODEL_MAP[rawModel] ?? rawModel

  return {
    name: fields.name,
    description: fields.description,
    model,
    systemPrompt: body.trim(),
    tools: [],
  }
}

export function loadAgentDefinitions(definitionsDir: string): Record<string, AgentDefinition> {
  const agents: Record<string, AgentDefinition> = {}

  let files: string[]
  try {
    files = readdirSync(definitionsDir).filter((f) => f.endsWith('.md'))
  } catch {
    return agents
  }

  for (const file of files) {
    const content = readFileSync(join(definitionsDir, file), 'utf-8')
    const parsed = parseAgentDefinition(content)

    if (!parsed.name || !parsed.systemPrompt) continue

    agents[parsed.name] = {
      name: parsed.name,
      description: parsed.description ?? '',
      systemPrompt: parsed.systemPrompt,
      model: parsed.model ?? 'claude-sonnet-4-6',
      tools: parsed.tools ?? [],
      maxTokens: parsed.maxTokens,
    }
  }

  return agents
}
