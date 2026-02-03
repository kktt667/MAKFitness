'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils/cn'

const REACTION_EMOJIS = ['🔥', '💪', '✨', '🫶', '🎉', '👏']

interface ReactionBarProps {
  reactions: Array<{ emoji: string; count: number; userReacted: boolean }>
  onReact: (emoji: string) => void
  onRemove: (emoji: string) => void
  disabled?: boolean
}

export function ReactionBar({ reactions, onReact, onRemove, disabled }: ReactionBarProps) {
  const [showPicker, setShowPicker] = useState(false)

  const handleEmojiClick = (emoji: string) => {
    const reaction = reactions.find((r) => r.emoji === emoji)
    if (reaction?.userReacted) {
      onRemove(emoji)
    } else {
      onReact(emoji)
    }
    setShowPicker(false)
  }

  return (
    <div className="relative">
      <div className="flex flex-wrap items-center gap-2">
        {reactions.map((reaction) => (
          <button
            key={reaction.emoji}
            type="button"
            onClick={() => handleEmojiClick(reaction.emoji)}
            disabled={disabled}
            className={cn(
              'px-3 py-1.5 rounded-full text-sm font-medium transition-all',
              'flex items-center gap-1.5',
              'active:scale-95',
              reaction.userReacted
                ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-300'
                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <span className="text-base">{reaction.emoji}</span>
            <span>{reaction.count}</span>
          </button>
        ))}

        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          disabled={disabled}
          className={cn(
            'h-8 w-8 rounded-full bg-neutral-100 hover:bg-neutral-200',
            'flex items-center justify-center transition-colors',
            'active:scale-95',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <span className="text-lg">+</span>
        </button>
      </div>

      {showPicker && (
        <div className="absolute bottom-full mb-2 left-0 bg-white rounded-3xl shadow-soft-lg p-3 flex gap-2 animate-scale-in z-10">
          {REACTION_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="h-10 w-10 rounded-full bg-neutral-100 hover:bg-primary-100 flex items-center justify-center transition-colors active:scale-95"
            >
              <span className="text-2xl">{emoji}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
