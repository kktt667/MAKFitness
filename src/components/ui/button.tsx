import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', fullWidth, children, ...props }, ref) => {
    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-4xl font-medium transition-all',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
          'disabled:opacity-50 disabled:pointer-events-none',
          'active:scale-95',

          // Variants
          {
            // Primary
            'bg-primary-500 text-white shadow-soft hover:bg-primary-600 hover:shadow-soft-lg':
              variant === 'primary',
            // Secondary
            'bg-accent-500 text-white shadow-soft hover:bg-accent-600 hover:shadow-soft-lg':
              variant === 'secondary',
            // Outline
            'border-2 border-primary-500 text-primary-500 hover:bg-primary-50':
              variant === 'outline',
            // Ghost
            'text-primary-500 hover:bg-primary-50': variant === 'ghost',
          },

          // Sizes
          {
            'h-10 px-4 text-sm': size === 'sm',
            'h-12 px-6 text-base': size === 'md',
            'h-14 px-8 text-lg': size === 'lg',
          },

          // Full width
          fullWidth && 'w-full',

          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }
