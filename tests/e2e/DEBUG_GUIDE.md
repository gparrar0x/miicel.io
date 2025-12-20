# Guía de Debug para Tests E2E con MercadoPago

## Ejecutar Test con Debug Simultáneo

### Opción 1: Modo UI (Recomendado para debugging visual)
```bash
npm run test:e2e:ui -- --project=mercadopago-sandbox tests/e2e/specs/complete-purchase-flow-mercadopago-sandbox.spec.ts
```
- Abre interfaz visual de Playwright
- Puedes ejecutar paso a paso
- Verás el navegador en tiempo real

### Opción 2: Modo Headed con Logs (Para debug colaborativo)
```bash
# Terminal 1: Ejecutar test
npm run test:e2e -- --project=mercadopago-sandbox tests/e2e/specs/complete-purchase-flow-mercadopago-sandbox.spec.ts --headed --reporter=list,html 2>&1 | tee test-debug.log

# Terminal 2: Ver logs en tiempo real
tail -f test-debug.log | grep -E "✓|❌|📍|⏳|Error:|Timeout|MercadoPago"
```

### Opción 3: Modo Headless con Logs Detallados
```bash
npm run test:e2e -- --project=mercadopago-sandbox tests/e2e/specs/complete-purchase-flow-mercadopago-sandbox.spec.ts --reporter=list,html,json 2>&1 | tee test-debug.log
```

## Archivos de Debug Generados

### Durante la Ejecución
- `test-debug.log` - Logs completos de la ejecución
- `mp-debug-*.png` - Screenshots automáticos en puntos clave
- `mp-form-not-found.png` - Screenshot cuando no encuentra formulario

### Después de la Ejecución
- `tests/test-results/` - Screenshots y videos de fallos
- `tests/reports/index.html` - Reporte HTML interactivo
- `tests/test-results.json` - Resultados en JSON

## Ver Logs en Tiempo Real

```bash
# Ver todos los logs
tail -f test-debug.log

# Ver solo logs importantes
tail -f test-debug.log | grep -E "✓|❌|📍|⏳|Error:|Timeout"

# Ver logs de MercadoPago específicamente
tail -f test-debug.log | grep -i "mercadopago\|MP\|payment"
```

## Ver Reporte HTML

```bash
# Abrir reporte HTML después de ejecución
npm run test:e2e:report

# O directamente
open tests/reports/index.html
```

## Debugging Específico

### Ver Screenshots de Fallos
```bash
# Listar screenshots recientes
find tests/test-results -name "*.png" -type f -mmin -10 | sort

# Ver el más reciente
open $(find tests/test-results -name "*.png" -type f -mmin -10 | sort | tail -1)
```

### Ver Videos de Ejecución
```bash
# Listar videos recientes
find tests/test-results -name "*.webm" -type f -mmin -10 | sort

# Ver el más reciente
open $(find tests/test-results -name "*.webm" -type f -mmin -10 | sort | tail -1)
```

### Ver Contexto de Error
```bash
# Ver archivo de contexto de error
find tests/test-results -name "error-context.md" -exec cat {} \;
```

## Logs Importantes a Buscar

- `📍 MercadoPago page loaded` - URL de MP cuando carga
- `📄 Page title` - Título de la página de MP
- `✓ Selected payment method` - Cuando selecciona método de pago
- `✓ Found card field` - Cuando encuentra campo de tarjeta
- `⏳ Waiting for redirect` - Esperando redirect de vuelta
- `❌ Could not find` - Errores de elementos no encontrados
- `Timeout` - Timeouts en esperas

## Comandos Útiles

```bash
# Limpiar resultados anteriores
rm -rf tests/test-results/* tests/reports/*

# Ejecutar solo un test específico
npm run test:e2e -- --project=mercadopago-sandbox tests/e2e/specs/complete-purchase-flow-mercadopago-sandbox.spec.ts -g "should complete full purchase"

# Ejecutar con más tiempo
PLAYWRIGHT_TIMEOUT=120000 npm run test:e2e -- --project=mercadopago-sandbox tests/e2e/specs/complete-purchase-flow-mercadopago-sandbox.spec.ts

# Ver variables de entorno configuradas
grep MERCADOPAGO .env
```

