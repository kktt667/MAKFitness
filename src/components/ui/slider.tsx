'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface SliderProps {
  value: number
  onValueChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  labels?: string[]
  className?: string
  disabled?: boolean
}

export function Slider({
  value,
  onValueChange,
  min = 1,
  max = 5,
  step = 1,
  labels,
  className,
  disabled,
}: SliderProps) {
  const percentage = ((value - min) / (max - min)) * 100

  return (
    <div className={cn('w-full', className)}>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onValueChange(Number(e.target.value))}
          disabled={disabled}
          className="w-full h-2 bg-neutral-200 rounded-full appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          style={{
            background: `linear-gradient(to right, var(--color-primary-500) 0%, var(--color-primary-500) ${percentage}%, var(--color-neutral-200) ${percentage}%, var(--color-neutral-200) 100%)`,
          }}
        />
        <style jsx>{`
          input[type='range']::-webkit-slider-thumb {
            appearance: none;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            border: 2px solid var(--color-primary-500);
          }
          input[type='range']::-moz-range-thumb {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background: white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            border: 2px solid var(--color-primary-500);
          }
        `}</style>
      </div>

      {labels && labels.length > 0 && (
        <div className="flex justify-between mt-2">
          {labels.map((label, index) => (
            <span
              key={index}
              className={cn(
                'text-xs',
                index + min === value ? 'text-primary-500 font-semibold' : 'text-neutral-400'
              )}
            >
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
