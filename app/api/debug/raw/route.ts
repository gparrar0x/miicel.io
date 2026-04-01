/** Absolute minimum Node.js serverless — native Response, zero imports */
export async function GET() {
  return new Response(JSON.stringify({ raw: true, ts: Date.now() }), {
    headers: { 'content-type': 'application/json' },
  })
}
// Node 20.x redeploy trigger
