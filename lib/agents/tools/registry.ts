import type { ToolDefinition } from '../types'
import { webSearchTool } from './web'

export function getToolsForAgent(agentName: string): ToolDefinition[] {
  const registry: Record<string, ToolDefinition[]> = {
    'oraculo-research-specialist': [webSearchTool],
    'pregon-marketing-specialist': [webSearchTool],
  }
  return registry[agentName] ?? []
}
