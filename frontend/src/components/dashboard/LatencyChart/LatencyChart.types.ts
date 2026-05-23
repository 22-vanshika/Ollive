import type { LatencyDataPoint } from '@/types'

export interface LatencyChartProps {
  data: LatencyDataPoint[]
  isLoading: boolean
}
