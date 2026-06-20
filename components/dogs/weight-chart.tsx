'use client'

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'

export type WeightPoint = { date: string; lbs: number }

export default function WeightChart({ data }: { data: WeightPoint[] }) {
  if (data.length < 2) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Add at least 2 weigh-ins to see the trend chart.
      </p>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
        />
        <YAxis
          tick={{ fontSize: 11 }}
          className="text-muted-foreground"
          unit=" lbs"
          domain={['auto', 'auto']}
        />
        <Tooltip
          formatter={(value) => [`${value} lbs`, 'Weight']}
          contentStyle={{ fontSize: 12 }}
        />
        <Line
          type="monotone"
          dataKey="lbs"
          strokeWidth={2}
          dot={{ r: 3 }}
          className="stroke-primary"
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
