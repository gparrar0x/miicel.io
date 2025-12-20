export function MicelioLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Red de micelio - nodos conectados */}
      <circle cx="16" cy="8" r="2.5" fill="currentColor" />
      <circle cx="8" cy="16" r="2" fill="currentColor" />
      <circle cx="24" cy="16" r="2" fill="currentColor" />
      <circle cx="10" cy="24" r="2.5" fill="currentColor" />
      <circle cx="22" cy="24" r="2.5" fill="currentColor" />
      <circle cx="16" cy="20" r="1.5" fill="currentColor" />

      {/* Conexiones */}
      <path
        d="M16 10.5V18.5M14.5 19L10.5 22.5M17.5 19L21.5 22.5M10 16L14.5 19M22 16L17.5 19M13.5 9L9.5 14.5M18.5 9L22.5 14.5"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.6"
      />
    </svg>
  )
}
