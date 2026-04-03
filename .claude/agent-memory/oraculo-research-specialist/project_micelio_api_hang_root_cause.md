---
name: Micelio API hang root cause
description: Root cause of all Node.js API route handlers hanging on Vercel — @skywalking/core/supabase/server imports cookies from next/headers at module level, transpilePackages bundles it into every Lambda
type: project
---

Root cause confirmed 2026-04-02: `@skywalking/core/src/supabase/server.ts` line 33 has a static top-level `import { cookies } from 'next/headers'`. When `transpilePackages: ['@skywalking/core']` is set in next.config.ts, Turbopack bundles this module into every Node.js Lambda function — even routes that never call createClient(). The `cookies()` call inside Next.js RSC context depends on AsyncLocalStorage, which is not available in the Vercel Lambda cold-start environment, causing the function to hang indefinitely with 0ms CPU.

**Why:** The micelio `lib/supabase/server.ts` tried to fix this with a dynamic import of the core module, but Turbopack's static analysis still inlines the import because transpilePackages forces full bundling of the package tree.

**Edge runtime works** because it uses a completely different execution path that does not depend on Next.js AsyncLocalStorage infrastructure.

**RSC pages work** because they run in the Next.js server infrastructure where AsyncLocalStorage is properly initialized.

**Fix options (in priority order):**
1. Remove `@skywalking/core` from `transpilePackages` and add it to `serverExternalPackages` instead — this keeps it as an external Node module, avoiding the module-level import problem.
2. Fix `@skywalking/core/supabase/server.ts` to NOT import `cookies` at module level (lazy import inside the function body).
3. As a temporary workaround: add `export const runtime = 'edge'` only to routes that don't need full Node.js. Not scalable.

**How to apply:** When any agent touches next.config.ts, API routes, or @skywalking/core, flag this root cause. Never add next/headers imports at module level in shared packages that are used via transpilePackages.
