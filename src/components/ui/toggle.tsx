'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface ToggleProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  label?: string
  disabled?: boolean
  className?: string
}

export function Toggle({ checked, onCheckedChange, label, disabled, className }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        'group inline-flex items-center gap-3 cursor-pointer',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      <div
        className={cn(
          'relative h-8 w-14 rounded-full transition-all border-2',
          checked
            ? 'bg-primary-500 border-primary-600 shadow-glow'
            : 'bg-neutral-300 border-neutral-400',
          disabled && 'cursor-not-allowed'
        )}
      >
        <div
          className={cn(
            'absolute top-0.5 h-6 w-6 rounded-full shadow-soft-lg transition-all flex items-center justify-center font-bold text-xs',
            checked
              ? 'translate-x-7 bg-white text-primary-600'
              : 'translate-x-0.5 bg-neutral-100 text-neutral-500'
          )}
        >
          {checked ? '✓' : ''}
        </div>
      </div>
      {label && (
        <span className="text-base text-neutral-700 select-none">{label}</span>
      )}
    </button>
  )
}
