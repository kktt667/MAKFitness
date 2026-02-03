'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface SelectProps {
  value?: string
  onChange: (value: string) => void
  options: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder = 'Select an option',
  disabled,
  className,
}: SelectProps) {
  return (
    <div className={cn('relative', className)}>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn(
          'flex h-12 w-full appearance-none rounded-3xl border-2 border-neutral-200 bg-white px-4 py-2 pr-10 text-base',
          'text-neutral-900',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'transition-colors cursor-pointer',
          !value && 'text-neutral-400'
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400 pointer-events-none"
      />
    </div>
  )
}
