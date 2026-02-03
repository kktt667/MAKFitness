'use client'

import * as React from 'react'
import { cn } from '@/lib/utils/cn'

export interface EmojiPickerProps {
  options: string[]
  value?: string
  onChange: (emoji: string) => void
  multiple?: boolean
  className?: string
  disabled?: boolean
}

export function EmojiPicker({
  options,
  value,
  onChange,
  multiple = false,
  className,
  disabled,
}: EmojiPickerProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {options.map((emoji) => {
        const isSelected = value === emoji

        return (
          <button
            key={emoji}
            type="button"
            onClick={() => onChange(emoji)}
            disabled={disabled}
            className={cn(
              'h-14 w-14 rounded-3xl flex items-center justify-center text-3xl',
              'transition-all transform',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              isSelected
                ? 'bg-primary-100 scale-110 shadow-soft'
                : 'bg-neutral-100 hover:bg-neutral-200 hover:scale-105',
              'active:scale-95'
            )}
          >
            {emoji}
          </button>
        )
      })}
    </div>
  )
}
