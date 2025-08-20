'use client'

import { useMemo } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TeamWithExpenditures } from '@/lib/supabase'

interface SpendingChartProps {
  teamsData: TeamWithExpenditures[]
  selectedYear?: number
  selectedMonth?: number
}

export default function SpendingChart({ teamsData, selectedYear, selectedMonth }: SpendingChartProps) {
  // Generate chart data for the selected month (memoized to avoid expensive recompute on every render)
  const chartData = useMemo(() => {
    const data = [] as any[]

    const today = new Date()
    const year = selectedYear ?? today.getFullYear()
    const month = selectedMonth ?? today.getMonth()
    const monthForCalc = month + 1

    const daysInMonth = new Date(year, monthForCalc, 0).getDate()

    // Pre-aggregate: date -> teamName -> total
    const byDate = new Map<string, Map<string, number>>()
    for (const team of teamsData) {
      for (const exp of team.expenditures) {
        let tm = byDate.get(exp.date)
        if (!tm) {
          tm = new Map<string, number>()
          byDate.set(exp.date, tm)
        }
        tm.set(team.name, (tm.get(team.name) || 0) + exp.amount)
      }
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${monthForCalc.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
      const dayData: Record<string, number | string> = { date: dateStr, day }
      const tm = byDate.get(dateStr)
      if (tm) {
        for (const team of teamsData) {
          const val = tm.get(team.name) || 0
          dayData[team.name] = val
        }
      } else {
        for (const team of teamsData) {
          dayData[team.name] = 0
        }
      }
      data.push(dayData)
    }

    return data
  }, [teamsData, selectedYear, selectedMonth])
  
  // Get selected month name for display
  const getMonthName = () => {
    const year = selectedYear ?? new Date().getFullYear()
    const month = selectedMonth ?? new Date().getMonth()
    const date = new Date(year, month)
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="w-full h-96">
      <div className="text-sm text-gray-600 mb-2 text-center">
        {getMonthName()} - Daily Spending Trends
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
            domain={[1, 'dataMax']}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}U`}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [`${value}U`, name]}
            labelFormatter={(label) => `Day ${label}`}
          />
          <Legend />
          {teamsData.map(team => (
            <Line
              key={team.id}
              type="monotone"
              dataKey={team.name}
              stroke={team.color}
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              isAnimationActive={false}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 