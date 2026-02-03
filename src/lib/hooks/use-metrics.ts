'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { MetricDefinition } from '@/types/metrics'

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const supabase = createClient()

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const { data, error } = await supabase
          .from('metric_definitions')
          .select('*')
          .order('sort_order', { ascending: true })

        if (error) throw error

        setMetrics(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [supabase])

  return { metrics, loading, error }
}
