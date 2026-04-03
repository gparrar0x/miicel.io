# Memory Index

## Project
- [project_micelio_api_hang_root_cause.md](project_micelio_api_hang_root_cause.md) — Root cause: @skywalking/core imports `next/headers` at module level; transpilePackages bundles it into Node.js Lambda routes, hanging AsyncLocalStorage
