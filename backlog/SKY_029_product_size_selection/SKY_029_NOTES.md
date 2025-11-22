# SKY-029: Product Size Selection Not Displaying

## Problema
Los productos de artmonkeys tienen metadata con opciones de tamaño configuradas en DB, pero el frontend no muestra el selector de tamaños.

## Metadata en DB
```json
{
  "sizes": [
    {"id": "small", "dimensions": "30 × 40 cm", "price": 8500, "stock": 1, "label": "Small"},
    {"id": "medium", "dimensions": "50 × 70 cm", "price": 12750, "stock": 1, "label": "Medium"},
    {"id": "large", "dimensions": "100 × 140 cm", "price": 21250, "stock": 1, "label": "Large"}
  ]
}
```

## Productos Afectados
- Toro (id: 19)
- Samurai (id: 20)
- Chamán (id: 21)

## Código Relevante
- `app/[locale]/[tenantId]/page.tsx:220-263` - Mapea metadata.sizes a formato Artwork
- `components/gallery-v2/GalleryGrid.tsx` - Debería renderizar size selector
- Query en `page.tsx:95` incluye metadata en select

## Hipótesis
1. GalleryGrid o sus componentes hijos no implementan UI para size selection
2. Puede que el componente espere sizes en formato diferente
3. Componente no está leyendo la prop sizes

## Próximos Pasos
1. **Sentinela**: Investigar y reportar estado actual del UI
2. **Pixel** (si necesario): Implementar size selector UI
3. **Sentinela**: Tests E2E del flujo completo

## Estado
- [x] Metadata actualizada en DB
- [x] Código de page.tsx mapea sizes correctamente
- [x] Investigación completada: UI falta en GalleryGrid
- [ ] UI muestra selector de tamaños (bloqueado en Pixel)
- [ ] Tests E2E verifican funcionalidad (ready to run post-implementation)
