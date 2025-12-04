# Miicel.io Component Specifications

**Target:** Next.js + Tailwind CSS + TypeScript
**Status:** Ready for implementation
**Output:** Reusable components with accessibility built-in

---

## 1. Base Configuration (Tailwind)

### tailwind.config.ts
```typescript
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      noir: '#0F0F0F',
      charcoal: '#1A1A1A',
      slate: '#2D2D2D',
      stone: '#F5F5F5',
      alabaster: '#FAFAFA',
      gold: '#B8860B',
      'gold-light': '#D4AF37',
      'gold-dark': '#8B6508',
      emerald: '#2D5F4F',
      'emerald-light': '#4A8B6F',
      coral: '#D97760',
      'coral-light': '#E89080',
      'slate-blue': '#4A5F7F',
      'slate-blue-light': '#6B84A8',
      white: '#FFFFFF',
      transparent: 'transparent',
    },
    fontSize: {
      'xs': '11px',
      'sm': '12px',
      'base': '14px',
      'lg': '16px',
      'xl': '20px',
      '2xl': '28px',
      '3xl': '36px',
      '4xl': '48px',
    },
    lineHeight: {
      tight: '1.2',
      snug: '1.25',
      normal: '1.5',
    },
    letterSpacing: {
      tighter: '-0.02em',
      normal: '0',
      wide: '0.05em',
    },
    spacing: {
      0: '0',
      1: '4px',
      2: '8px',
      3: '12px',
      4: '16px',
      6: '24px',
      8: '32px',
      12: '48px',
      16: '64px',
    },
    borderRadius: {
      'xs': '4px',
      'sm': '6px',
      'md': '8px',
      'lg': '12px',
      full: '9999px',
    },
    boxShadow: {
      'xs': '0 1px 2px rgba(15, 15, 15, 0.04)',
      'sm': '0 2px 4px rgba(15, 15, 15, 0.08)',
      'md': '0 4px 8px rgba(15, 15, 15, 0.12)',
      'lg': '0 8px 16px rgba(15, 15, 15, 0.16)',
      'xl': '0 12px 24px rgba(15, 15, 15, 0.20)',
      'inset': 'inset 0 1px 0 rgba(15, 15, 15, 0.05)',
    },
    fontFamily: {
      display: ['Cinzel', 'serif'],
      body: ['Inter', 'sans-serif'],
      mono: ['Source Code Pro', 'monospace'],
    },
    transitionTimingFunction: {
      'out': 'cubic-bezier(0.2, 0, 0, 1)',
      'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
  plugins: [],
}
```

---

## 2. Component Library

### Button Component

#### Primary Button
```tsx
// components/Button/Button.tsx
import { ReactNode } from 'react'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  ariaLabel?: string
  testId?: string
}

export function Button({
  children,
  disabled = false,
  type = 'button',
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  ariaLabel,
  testId,
  onClick,
}: ButtonProps) {
  const baseStyles = [
    'font-body font-medium',
    'transition-all duration-200 ease-out',
    'focus:outline-2 focus:outline-offset-2 focus:outline-gold',
    'disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none',
  ].join(' ')

  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const variantStyles = {
    primary: [
      'bg-gold text-white',
      'hover:bg-gold-light hover:shadow-md',
      'active:scale-98 active:bg-gold-dark',
    ].join(' '),
    secondary: [
      'bg-transparent border border-gray-300 text-noir',
      'hover:bg-stone hover:border-gold',
      'active:bg-slate active:border-gold-dark',
    ].join(' '),
    ghost: [
      'bg-transparent text-noir',
      'hover:text-gold hover:bg-gold/5',
      'active:text-gold-dark',
    ].join(' '),
  }

  const widthStyle = fullWidth ? 'w-full' : ''

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      data-testid={testId || `btn-${children?.toString().toLowerCase().replace(/\s/g, '-')}`}
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${widthStyle} rounded-sm`}
    >
      {children}
    </button>
  )
}
```

### Form Components

#### Text Input
```tsx
// components/Form/Input.tsx
import { InputHTMLAttributes, Ref, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helpText?: string
  testId?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helpText, testId, ...props }, ref: Ref<HTMLInputElement>) => {
    const inputId = props.id || testId || props.name

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-noir tracking-wide"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          data-testid={testId}
          className={[
            'px-4 py-3 text-base font-body',
            'border rounded-sm',
            'transition-all duration-200 ease-out',
            'focus:outline-2 focus:outline-offset-0 focus:outline-gold',
            !error && 'border-gray-medium hover:border-gray-dark',
            error && 'border-coral focus:outline-coral',
            props.disabled && 'bg-stone border-gray-light text-gray-tertiary',
            'placeholder:text-gray-tertiary',
          ].join(' ')}
          {...props}
        />
        {error && (
          <span className="text-sm text-coral" role="alert">
            {error}
          </span>
        )}
        {helpText && !error && (
          <span className="text-sm text-gray-secondary">{helpText}</span>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
```

#### Select / Dropdown
```tsx
// components/Form/Select.tsx
import { SelectHTMLAttributes, Ref, forwardRef } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
  error?: string
  testId?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, options, error, testId, ...props }, ref: Ref<HTMLSelectElement>) => {
    const selectId = props.id || testId || props.name

    return (
      <div className="flex flex-col gap-2">
        {label && (
          <label
            htmlFor={selectId}
            className="text-sm font-medium text-noir tracking-wide"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          data-testid={testId}
          className={[
            'px-4 py-3 text-base font-body',
            'border rounded-sm',
            'transition-all duration-200 ease-out',
            'focus:outline-2 focus:outline-offset-0 focus:outline-gold',
            !error && 'border-gray-medium',
            error && 'border-coral focus:outline-coral',
            'bg-white text-noir',
            'cursor-pointer',
          ].join(' ')}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        {error && (
          <span className="text-sm text-coral" role="alert">
            {error}
          </span>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
```

### Card Components

#### Standard Card
```tsx
// components/Card/Card.tsx
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  title?: string
  subtitle?: string
  hoverable?: boolean
  testId?: string
  className?: string
}

export function Card({
  children,
  title,
  subtitle,
  hoverable = false,
  testId,
  className = '',
}: CardProps) {
  return (
    <div
      data-testid={testId}
      className={[
        'bg-white border border-gray-light rounded-md p-6',
        'shadow-xs',
        'transition-all duration-200 ease-out',
        hoverable && 'hover:border-gray-dark hover:shadow-md',
        className,
      ].join(' ')}
    >
      {title && (
        <div className="mb-4">
          <h3 className="font-display font-semibold text-xl text-noir">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-secondary mt-1">{subtitle}</p>
          )}
        </div>
      )}
      {children}
    </div>
  )
}
```

#### Stat Card
```tsx
// components/Card/StatCard.tsx
import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  trend?: {
    direction: 'up' | 'down'
    percent: number
    period: string
  }
  icon?: ReactNode
  testId?: string
}

export function StatCard({ label, value, trend, icon, testId }: StatCardProps) {
  return (
    <div
      data-testid={testId || `card-stat-${label.toLowerCase().replace(/\s/g, '-')}`}
      className={[
        'bg-white border border-gray-light rounded-md p-5',
        'shadow-xs',
        'hover:border-gray-dark hover:shadow-md',
        'transition-all duration-200 ease-out',
        'flex flex-col gap-3',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <span className="text-sm font-medium text-gray-secondary tracking-wide">
          {label}
        </span>
        {icon && <div className="text-gold">{icon}</div>}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="font-display font-semibold text-2xl text-noir">
          {value}
        </span>
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-sm">
          <span
            className={
              trend.direction === 'up' ? 'text-emerald' : 'text-coral'
            }
          >
            {trend.direction === 'up' ? '↑' : '↓'} {trend.percent}%
          </span>
          <span className="text-gray-tertiary">{trend.period}</span>
        </div>
      )}
    </div>
  )
}
```

### Navigation Components

#### Sidebar Nav Item
```tsx
// components/Nav/SidebarItem.tsx
import { ReactNode } from 'react'

interface SidebarItemProps {
  label: string
  icon: ReactNode
  href?: string
  active?: boolean
  onClick?: () => void
  testId?: string
}

export function SidebarItem({
  label,
  icon,
  href,
  active = false,
  onClick,
  testId,
}: SidebarItemProps) {
  const baseStyles = [
    'w-full px-4 py-3 rounded-sm mb-2',
    'text-sm font-medium font-body',
    'transition-all duration-200 ease-out',
    'flex items-center gap-3',
    'focus:outline-2 focus:outline-offset-2 focus:outline-gold',
  ].join(' ')

  const activeStyles = active
    ? 'bg-gold text-white'
    : 'text-gray-secondary hover:bg-stone'

  const element = href ? 'a' : 'button'
  const Component = element as any

  return (
    <Component
      href={href}
      onClick={onClick}
      data-testid={testId || `nav-${label.toLowerCase().replace(/\s/g, '-')}`}
      className={`${baseStyles} ${activeStyles}`}
    >
      <span className="flex-shrink-0 w-5 h-5">{icon}</span>
      <span>{label}</span>
    </Component>
  )
}
```

### Status Badges

```tsx
// components/Badge/Badge.tsx
interface BadgeProps {
  status: 'success' | 'warning' | 'error' | 'info'
  label: string
  testId?: string
}

export function Badge({ status, label, testId }: BadgeProps) {
  const statusStyles = {
    success: 'bg-emerald text-white',
    warning: 'bg-coral text-white',
    error: 'bg-coral text-white',
    info: 'bg-slate-blue text-white',
  }

  return (
    <span
      data-testid={testId || `badge-${status}`}
      className={[
        'inline-block px-3 py-1 rounded-xs',
        'text-sm font-medium',
        statusStyles[status],
      ].join(' ')}
    >
      {label}
    </span>
  )
}
```

---

## 3. Dashboard Layout Components

### Header / Hero
```tsx
// components/Layout/DashboardHeader.tsx
interface DashboardHeaderProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function DashboardHeader({
  title,
  subtitle,
  actions,
}: DashboardHeaderProps) {
  return (
    <div className="bg-alabaster border-b border-gray-light px-8 py-8 mb-8">
      <div className="max-w-6xl mx-auto flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-4xl text-noir">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-gray-secondary mt-2">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex gap-4">{actions}</div>}
      </div>
    </div>
  )
}
```

### Responsive Grid
```tsx
// components/Layout/Grid.tsx
import { ReactNode } from 'react'

interface GridProps {
  children: ReactNode
  cols?: number
  gap?: 'sm' | 'md' | 'lg'
}

export function Grid({ children, cols = 3, gap = 'lg' }: GridProps) {
  const gapMap = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-6',
  }

  return (
    <div
      className={[
        'grid',
        `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`,
        gapMap[gap],
      ].join(' ')}
    >
      {children}
    </div>
  )
}
```

### Container
```tsx
// components/Layout/Container.tsx
interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className = '' }: ContainerProps) {
  return (
    <div className={`max-w-6xl mx-auto px-6 sm:px-8 ${className}`}>
      {children}
    </div>
  )
}
```

---

## 4. Example Dashboard Page

```tsx
// pages/dashboard.tsx
import { DashboardHeader } from '@/components/Layout/DashboardHeader'
import { Container } from '@/components/Layout/Container'
import { Grid } from '@/components/Layout/Grid'
import { StatCard } from '@/components/Card/StatCard'
import { Card } from '@/components/Card/Card'
import { Button } from '@/components/Button/Button'
import { SidebarItem } from '@/components/Nav/SidebarItem'
import { Badge } from '@/components/Badge/Badge'

export default function Dashboard() {
  return (
    <div className="bg-alabaster min-h-screen">
      <DashboardHeader
        title="Admin Dashboard"
        subtitle="Manage your miicel.io platform"
        actions={
          <Button variant="primary" size="md">
            Create Tenant
          </Button>
        }
      />

      <Container className="pb-12">
        {/* Stats Section */}
        <div className="mb-8">
          <h2 className="font-display font-semibold text-3xl text-noir mb-6">
            Key Metrics
          </h2>
          <Grid cols={4} gap="lg">
            <StatCard
              label="Total Tenants"
              value="1,234"
              trend={{ direction: 'up', percent: 12, period: 'vs last month' }}
              testId="stat-tenants"
            />
            <StatCard
              label="Revenue"
              value="$45.2K"
              trend={{ direction: 'up', percent: 8, period: 'vs last month' }}
              testId="stat-revenue"
            />
            <StatCard
              label="Active Users"
              value="8.9K"
              trend={{ direction: 'down', percent: 2, period: 'vs last month' }}
              testId="stat-users"
            />
            <StatCard
              label="Support Tickets"
              value="23"
              testId="stat-tickets"
            />
          </Grid>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="font-display font-semibold text-3xl text-noir mb-6">
            Quick Actions
          </h2>
          <Grid cols={3} gap="lg">
            <Button variant="secondary" fullWidth testId="btn-new-tenant">
              Create New Tenant
            </Button>
            <Button variant="secondary" fullWidth testId="btn-view-reports">
              View Reports
            </Button>
            <Button variant="secondary" fullWidth testId="btn-settings">
              Settings
            </Button>
          </Grid>
        </div>

        {/* Recent Activity */}
        <Card
          title="Recent Activity"
          subtitle="Last 10 events"
          testId="card-activity"
        >
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between py-3 border-b border-gray-light last:border-0"
              >
                <div>
                  <p className="font-medium text-noir">Event {i}</p>
                  <p className="text-sm text-gray-secondary">2 hours ago</p>
                </div>
                <Badge status="success" label="Completed" />
              </div>
            ))}
          </div>
        </Card>
      </Container>
    </div>
  )
}
```

---

## 5. Accessibility Checklist

- [ ] All buttons have `aria-label` or visible text
- [ ] Form inputs have associated `<label>` elements
- [ ] Focus indicators visible and 2px outline
- [ ] Color contrast ≥ 4.5:1 (WCAG AA)
- [ ] Error messages use `role="alert"`
- [ ] Loading states announced with `aria-busy`
- [ ] Keyboard navigation works (Tab order logical)
- [ ] Screen reader tested (VoiceOver, NVDA)
- [ ] All interactive elements min 44x44px touch target
- [ ] No focus trap in modals/dropdowns

---

## 6. Next Steps for Pixel

1. Implement component library in `/src/components`
2. Export from `/src/components/index.ts`
3. Test with `data-testid` in Playwright (Sentinela)
4. Build dashboard pages using components
5. Integrate with API responses (Kokoro)
6. Performance audit before launch (Hermes)

**Estimate:** 40-50 hours for full implementation + tests

---

**Ready to build. Let's ship.**
