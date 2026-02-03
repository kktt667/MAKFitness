export type InputType = 'boolean' | 'number' | 'emoji' | 'slider' | 'text' | 'select'

export type MetricCategory = 'movement' | 'soft_health' | 'food' | 'lifestyle' | 'social'

export interface MetricDefinition {
  id: string
  key: string
  category: MetricCategory
  display_name: string
  description?: string
  input_type: InputType
  config: MetricConfig
  default_enabled: boolean
  sort_order: number
}

export interface MetricConfig {
  min?: number
  max?: number
  unit?: string
  placeholder?: string
  options?: string[]
  labels?: string[]
}

export interface UserMetricPreference {
  id: string
  user_id: string
  group_id: string
  metric_key: string
  enabled: boolean
  sort_order: number
}

export interface MetricValue {
  [key: string]: boolean | number | string
}
