import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cn } from '@/lib/utils'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type ButtonSize = 'md' | 'sm' | 'lg' | 'icon'

const base =
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition duration-200 ease-out disabled:pointer-events-none disabled:opacity-60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2'

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-mii-blue text-white rounded-[4px] shadow-mii hover:bg-mii-blue-hover hover:shadow-mii-md active:scale-[0.98] focus-visible:outline-mii-blue',
  secondary:
    'border border-mii-gray-200 text-mii-gray-900 rounded-[4px] bg-white hover:bg-mii-gray-50 hover:border-mii-blue focus-visible:outline-mii-blue',
  ghost:
    'text-mii-gray-700 rounded-[4px] hover:bg-mii-gray-50 focus-visible:outline-mii-blue',
  destructive:
    'bg-destructive text-white rounded-[4px] hover:bg-destructive/90 shadow-mii focus-visible:outline-destructive',
}

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-12 px-6 py-3 text-sm',
  sm: 'h-10 px-4 py-2 text-sm',
  lg: 'h-14 px-8 py-3.5 text-base',
  icon: 'h-12 w-12 rounded-full',
}

interface ButtonProps extends React.ComponentProps<'button'> {
  asChild?: boolean
  variant?: ButtonVariant
  size?: ButtonSize
  'data-testid'?: string
}

function Button({
  className,
  variant = 'primary',
  size = 'md',
  asChild = false,
  'data-testid': testId,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const computedTestId = testId || `btn-${variant}`

  return (
    <Comp
      data-testid={computedTestId}
      data-slot="button"
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  )
}

export { Button }
