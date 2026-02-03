'use client'

import * as React from 'react'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils/cn'

export interface CounterProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  unit?: string
  className?: string
  disabled?: boolean
}

export function Counter({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  unit,
  className,
  disabled,
}: CounterProps) {
  const handleIncrement = () => {
    if (value < max) {
      onChange(value + step)
    }
  }

  const handleDecrement = () => {
    if (value > min) {
      onChange(value - step)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    if (!isNaN(newValue) && newValue >= min && newValue <= max) {
      onChange(newValue)
    }
  }

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className={cn(
          'h-10 w-10 rounded-full bg-pastel-pink flex items-center justify-center',
          'transition-colors hover:bg-primary-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-95'
        )}
      >
        <Minus className="h-4 w-4 text-primary-700" />
      </button>

      <div className="flex items-center gap-1 min-w-[80px] justify-center">
        <input
          type="number"
          value={value}
          onChange={handleInputChange}
          disabled={disabled}
          className={cn(
            'w-16 text-center text-2xl font-semibold text-neutral-900',
            'bg-transparent border-none focus:outline-none',
            'disabled:opacity-50'
          )}
          min={min}
          max={max}
        />
        {unit && <span className="text-sm text-neutral-500">{unit}</span>}
      </div>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className={cn(
          'h-10 w-10 rounded-full bg-pastel-mint flex items-center justify-center',
          'transition-colors hover:bg-accent-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-95'
        )}
      >
        <Plus className="h-4 w-4 text-accent-700" />
      </button>
    </div>
  )
}
