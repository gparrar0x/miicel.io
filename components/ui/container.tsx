import { cn } from '@/lib/utils'

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  'data-testid'?: string
}

export function Container({ className, children, 'data-testid': testId, ...props }: ContainerProps) {
  return (
    <div
      data-testid={testId || 'container'}
      className={cn('mx-auto w-full max-w-mii-content px-mii-page', className)}
      {...props}
    >
      {children}
    </div>
  )
}
