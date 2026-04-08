/**
 * Glitch — SVG particle constellation overlay
 * Shared visual element for Micelio (light) and Espora (dark) landing pages.
 * Design spec: docs/design/MICELIO_ESPORA_DESIGN.md §1
 *
 * data-testid: glitch-hero
 */

interface GlitchProps {
  variant?: 'micelio' | 'espora'
  className?: string
}

// 12 particles positioned on 8px grid snap
const PARTICLES = [
  { x: 150, y: 100 },
  { x: 300, y: 200 },
  { x: 450, y: 120 },
  { x: 600, y: 280 },
  { x: 750, y: 160 },
  { x: 900, y: 240 },
  { x: 200, y: 360 },
  { x: 400, y: 400 },
  { x: 550, y: 320 },
  { x: 700, y: 440 },
  { x: 850, y: 360 },
  { x: 1050, y: 200 },
]

// 8 connecting edges between nearby particles
const EDGES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 4],
  [3, 5],
  [4, 5],
  [6, 8],
  [7, 9],
  [8, 10],
]

export function Glitch({ variant = 'micelio', className = '' }: GlitchProps) {
  return (
    <div
      className={`glitch glitch--${variant} ${className}`}
      role="presentation"
      aria-hidden="true"
      data-testid="glitch-hero"
    >
      <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" className="h-full w-full">
        {PARTICLES.map((p, i) => (
          <circle
            key={`p-${i}`}
            className="glitch__particle"
            cx={p.x}
            cy={p.y}
            r={i % 3 === 0 ? 4 : 3}
          />
        ))}
        {EDGES.map(([a, b], i) => (
          <line
            key={`e-${i}`}
            className="glitch__edge"
            x1={PARTICLES[a].x}
            y1={PARTICLES[a].y}
            x2={PARTICLES[b].x}
            y2={PARTICLES[b].y}
            style={{ '--edge-index': i } as React.CSSProperties}
          />
        ))}
      </svg>
    </div>
  )
}
