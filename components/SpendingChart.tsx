'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TeamWithExpenditures } from '@/lib/supabase'

interface SpendingChartProps {
  teamsData: TeamWithExpenditures[]
}

export default function SpendingChart({ teamsData }: SpendingChartProps) {
  // Generate chart data for the last 30 days
  const generateChartData = () => {
    const days = 30
    const data = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]

      const dayData: any = {
        date: dateStr,
        day: date.getDate(),
      }

      teamsData.forEach(team => {
        const dayExpenses = team.expenditures
          .filter(exp => exp.date === dateStr)
          .reduce((sum, exp) => sum + exp.amount, 0)
        dayData[team.name] = dayExpenses
      })

      data.push(dayData)
    }

    return data
  }

  const chartData = generateChartData()

  return (
    <div className="w-full h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => `${value}`}
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
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 