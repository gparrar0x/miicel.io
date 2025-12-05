import * as React from 'react'

import { cn } from '@/lib/utils'

type CardProps = React.ComponentProps<'div'> & { 'data-testid'?: string }

function Card({ className, 'data-testid': testId, ...props }: CardProps) {
  return (
    <div
      data-slot="card"
      data-testid={testId || 'card'}
      className={cn(
        'bg-white text-mii-gray-900 flex flex-col gap-4 rounded-[8px] border border-mii-gray-200 p-5 shadow-mii transition duration-200 hover:shadow-[0_2px_6px_rgba(0,0,0,0.08)] hover:bg-mii-gray-50',
        className,
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        'grid auto-rows-min grid-rows-[auto_auto] items-start gap-2',
        className,
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-title"
      className={cn('text-[18px] font-semibold leading-tight text-mii-gray-900', className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-description"
      className={cn('text-sm text-mii-gray-500', className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-action"
      className={cn('self-start justify-self-end', className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-content"
      className={cn('mt-2 flex flex-col gap-3', className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="card-footer"
      className={cn('flex items-center gap-3 pt-3 border-t border-mii-gray-200', className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
}
