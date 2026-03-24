import type { ToolDefinition } from '../types'

const PERPLEXITY_API_URL = 'https://api.perplexity.ai/chat/completions'

export const webSearchTool: ToolDefinition = {
  name: 'web_search',
  description: 'Search the web for real-time information, facts, and current data',
  input_schema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'The search query',
      },
    },
    required: ['query'],
  },
  execute: async (input) => {
    const { query } = input as { query: string }
    const apiKey = process.env.PERPLEXITY_API_KEY

    if (!apiKey) {
      return 'web_search not configured: PERPLEXITY_API_KEY missing. Cannot perform real-time search.'
    }

    const response = await fetch(PERPLEXITY_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'sonar',
        messages: [{ role: 'user', content: query }],
        max_tokens: 1024,
      }),
    })

    if (!response.ok) {
      return `web_search error: ${response.status} ${response.statusText}`
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return data.choices?.[0]?.message?.content ?? 'No results found.'
  },
}
