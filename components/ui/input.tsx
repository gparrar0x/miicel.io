import * as React from 'react'

import { cn } from '@/lib/utils'

type InputProps = React.ComponentProps<'input'> & { 'data-testid'?: string }

function Input({ className, type = 'text', id, 'data-testid': testId, ...props }: InputProps) {
  const computedTestId = testId || (id ? `input-${id}` : undefined)

  return (
    <input
      type={type}
      id={id}
      data-slot="input"
      data-testid={computedTestId}
      className={cn(
        'w-full min-w-0 rounded-[4px] border border-mii-gray-200 bg-white px-4 py-3 text-mii-gray-900 placeholder:text-mii-gray-500 text-sm shadow-mii transition',
        'focus-visible:border-mii-blue focus-visible:ring-2 focus-visible:ring-mii-blue focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'aria-invalid:border-destructive aria-invalid:focus-visible:ring-destructive/70',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:bg-mii-gray-100',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
