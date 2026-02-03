'use client'

import { MetricDefinition } from '@/types/metrics'
import { Toggle } from '@/components/ui/toggle'
import { Slider } from '@/components/ui/slider'
import { Counter } from '@/components/ui/counter'
import { EmojiPicker } from '@/components/ui/emoji-picker'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'

interface MetricInputProps {
  metric: MetricDefinition
  value: any
  onChange: (value: any) => void
  disabled?: boolean
}

export function MetricInput({ metric, value, onChange, disabled }: MetricInputProps) {
  switch (metric.input_type) {
    case 'boolean':
      return (
        <div className="flex items-center justify-between p-4 bg-white rounded-3xl">
          <div className="flex-1">
            <h4 className="font-medium text-neutral-900">{metric.display_name}</h4>
            {metric.description && (
              <p className="text-sm text-neutral-500 mt-1">{metric.description}</p>
            )}
          </div>
          <Toggle
            checked={value || false}
            onCheckedChange={onChange}
            disabled={disabled}
          />
        </div>
      )

    case 'slider':
      const sliderConfig = metric.config
      return (
        <div className="p-4 bg-white rounded-3xl space-y-3">
          <div>
            <h4 className="font-medium text-neutral-900">{metric.display_name}</h4>
            {metric.description && (
              <p className="text-sm text-neutral-500 mt-1">{metric.description}</p>
            )}
          </div>
          <Slider
            value={value || sliderConfig.min || 1}
            onValueChange={onChange}
            min={sliderConfig.min}
            max={sliderConfig.max}
            step={1}
            labels={sliderConfig.labels}
            disabled={disabled}
          />
        </div>
      )

    case 'number':
      const numberConfig = metric.config
      return (
        <div className="p-4 bg-white rounded-3xl space-y-3">
          <div>
            <h4 className="font-medium text-neutral-900">{metric.display_name}</h4>
            {metric.description && (
              <p className="text-sm text-neutral-500 mt-1">{metric.description}</p>
            )}
          </div>
          <div className="flex justify-center">
            <Counter
              value={value || 0}
              onChange={onChange}
              min={numberConfig.min || 0}
              max={numberConfig.max || 100}
              step={1}
              unit={numberConfig.unit}
              disabled={disabled}
            />
          </div>
        </div>
      )

    case 'emoji':
      const emojiConfig = metric.config
      return (
        <div className="p-4 bg-white rounded-3xl space-y-3">
          <div>
            <h4 className="font-medium text-neutral-900">{metric.display_name}</h4>
            {metric.description && (
              <p className="text-sm text-neutral-500 mt-1">{metric.description}</p>
            )}
          </div>
          <EmojiPicker
            options={emojiConfig.options || []}
            value={value}
            onChange={onChange}
            disabled={disabled}
          />
        </div>
      )

    case 'select':
      const selectConfig = metric.config
      return (
        <div className="p-4 bg-white rounded-3xl space-y-3">
          <div>
            <h4 className="font-medium text-neutral-900">{metric.display_name}</h4>
            {metric.description && (
              <p className="text-sm text-neutral-500 mt-1">{metric.description}</p>
            )}
          </div>
          <Select
            value={value}
            onChange={onChange}
            options={selectConfig.options || []}
            placeholder={`Select ${metric.display_name.toLowerCase()}`}
            disabled={disabled}
          />
        </div>
      )

    case 'text':
      return (
        <div className="p-4 bg-white rounded-3xl space-y-3">
          <div>
            <h4 className="font-medium text-neutral-900">{metric.display_name}</h4>
            {metric.description && (
              <p className="text-sm text-neutral-500 mt-1">{metric.description}</p>
            )}
          </div>
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={metric.config.placeholder}
            disabled={disabled}
          />
        </div>
      )

    default:
      return null
  }
}
