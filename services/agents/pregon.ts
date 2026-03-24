import { join } from 'node:path'
import { loadAgentDefinitions } from '@/lib/agents/loader'
import type { AgentDefinition } from '@/lib/agents/types'
import { getToolsForAgent } from '@/lib/agents/tools/registry'

export function loadPregonAgent(): AgentDefinition | null {
  const definitionsDir = join(process.cwd(), 'lib', 'agents', 'definitions')
  const agents = loadAgentDefinitions(definitionsDir)
  const agent = agents['pregon-marketing-specialist']

  if (!agent) return null

  return {
    ...agent,
    tools: getToolsForAgent('pregon-marketing-specialist'),
  }
}
