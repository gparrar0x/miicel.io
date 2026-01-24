# Documentación miicel.io

> Multi-tenant e-commerce SaaS
> Última actualización: 2025-01-24

---

## Para Claude Code (empezar aquí)

| Archivo | Propósito |
|---------|-----------|
| `CLAUDE.md` | Instrucciones principales + delegation matrix |
| `REPO_GUIDELINES.md` | Convenciones de código y commits |

---

## Onboarding Desarrolladores

| Orden | Documento | Qué Aprenderás | Tiempo |
|-------|-----------|----------------|--------|
| 1 | [CLAUDE.md](../CLAUDE.md) | Setup, commands, architecture | 10 min |
| 2 | [REPO_GUIDELINES.md](../REPO_GUIDELINES.md) | Code style, testing, PRs | 5 min |
| 3 | [QUICKSTART_E2E.md](./guides/QUICKSTART_E2E.md) | E2E testing setup | 10 min |

---

## Backlog

```
docs/backlog/
├── active/     # Issues en progreso
├── done/       # Completados
└── archive/    # Histórico
```

**Estructura por issue:**
```
MII_{#}_{slug}/
├── NOTES.md           # Contexto, decisiones
├── tasks/
│   ├── AURORA.md      # Design tasks
│   ├── KOKORO.md      # Backend tasks
│   ├── PIXEL.md       # Frontend tasks
│   ├── SENTINELA.md   # E2E tests
│   └── HERMES.md      # Deploy tasks
└── assets/            # Wireframes, specs
```

---

## Referencia por Área

### Templates
- [templates/PIXEL_TEMPLATES.md](./templates/PIXEL_TEMPLATES.md) — Frontend patterns
- [templates/KOKORO_TEMPLATES.md](./templates/KOKORO_TEMPLATES.md) — Backend patterns
- [templates/SENTINELA_TEMPLATES.md](./templates/SENTINELA_TEMPLATES.md) — E2E test patterns
- [templates/DESIGN_SPEC.md](./templates/DESIGN_SPEC.md) — Design spec format

### Guías Técnicas
- [MERCADOPAGO_WEBHOOK_SETUP.md](./MERCADOPAGO_WEBHOOK_SETUP.md) — Payment webhooks
- [DATABASE_PAYMENT_MODEL.md](./DATABASE_PAYMENT_MODEL.md) — Payment DB schema
- [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md) — Deploy process
- [ADMIN_THEME_EDITOR.md](./ADMIN_THEME_EDITOR.md) — Theme customization

### Testing
- [guides/QUICKSTART_E2E.md](./guides/QUICKSTART_E2E.md) — E2E setup
- [testing/API_TESTING_ORDERS.md](./testing/API_TESTING_ORDERS.md) — API test examples

### Producto
- [PRODUCT_OVERVIEW_VENDIO.md](./PRODUCT_OVERVIEW_VENDIO.md) — Product vision
- [ROADMAP.md](./ROADMAP.md) — Feature roadmap
- [VENDIO_USER_FLOWS.md](./VENDIO_USER_FLOWS.md) — User journeys

---

## Quick Links

| Necesito... | Ir a... |
|-------------|---------|
| Crear issue para agente | `docs/backlog/active/` + Linear |
| Ver ejemplo de template | `docs/backlog/done/SKY_043_gallery_template/` |
| Entender test patterns | `docs/templates/SENTINELA_TEMPLATES.md` |
| Setup MercadoPago | `docs/MERCADOPAGO_WEBHOOK_SETUP.md` |
| Deploy a Vercel | `docs/VERCEL_DEPLOYMENT_GUIDE.md` |

---

## Sistema Multi-Agente

Este proyecto hereda el sistema multi-agente de Skywalking:
- **Metodología completa:** `/CLAUDE.md` (root del monorepo)
- **Agentes disponibles:** Aurora, Kokoro, Pixel, Sentinela, Hermes, Flux

---

**Mantenido por:** Mentat
