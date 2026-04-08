export function MicelioLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Red de micelio: nodos interconectados */}
      <g
        transform="translate(128,128)"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      >
        {/* Central node */}
        <circle cx="0" cy="0" r="8" fill="currentColor" />
        {/* Inner ring (6 nodes) */}
        <circle cx="0" cy="-52" r="6" fill="currentColor" />
        <circle cx="45" cy="-26" r="6" fill="currentColor" />
        <circle cx="45" cy="26" r="6" fill="currentColor" />
        <circle cx="0" cy="52" r="6" fill="currentColor" />
        <circle cx="-45" cy="26" r="6" fill="currentColor" />
        <circle cx="-45" cy="-26" r="6" fill="currentColor" />
        {/* Inner connections */}
        <line x1="0" y1="0" x2="0" y2="-52" />
        <line x1="0" y1="0" x2="45" y2="-26" />
        <line x1="0" y1="0" x2="45" y2="26" />
        <line x1="0" y1="0" x2="0" y2="52" />
        <line x1="0" y1="0" x2="-45" y2="26" />
        <line x1="0" y1="0" x2="-45" y2="-26" />
        {/* Inner ring connections */}
        <line x1="0" y1="-52" x2="45" y2="-26" />
        <line x1="45" y1="-26" x2="45" y2="26" />
        <line x1="45" y1="26" x2="0" y2="52" />
        <line x1="0" y1="52" x2="-45" y2="26" />
        <line x1="-45" y1="26" x2="-45" y2="-26" />
        <line x1="-45" y1="-26" x2="0" y2="-52" />
        {/* Outer nodes */}
        <circle cx="0" cy="-95" r="4" fill="currentColor" />
        <circle cx="82" cy="-48" r="4" fill="currentColor" />
        <circle cx="82" cy="48" r="4" fill="currentColor" />
        <circle cx="0" cy="95" r="4" fill="currentColor" />
        <circle cx="-82" cy="48" r="4" fill="currentColor" />
        <circle cx="-82" cy="-48" r="4" fill="currentColor" />
        {/* Outer connections */}
        <line x1="0" y1="-52" x2="0" y2="-95" />
        <line x1="45" y1="-26" x2="82" y2="-48" />
        <line x1="45" y1="26" x2="82" y2="48" />
        <line x1="0" y1="52" x2="0" y2="95" />
        <line x1="-45" y1="26" x2="-82" y2="48" />
        <line x1="-45" y1="-26" x2="-82" y2="-48" />
      </g>
    </svg>
  )
}
