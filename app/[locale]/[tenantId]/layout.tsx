export default function TenantLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Layout anidado - html/body están en [locale]/layout.tsx
  return <>{children}</>
}
