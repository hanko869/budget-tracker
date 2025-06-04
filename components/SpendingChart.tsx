'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TeamWithExpenditures } from '@/lib/supabase'

interface SpendingChartProps {
  teamsData: TeamWithExpenditures[]
}

export default function SpendingChart({ teamsData }: SpendingChartProps) {
  // Generate chart data for the current month (Beijing time)
  const generateChartData = () => {
    const data = []
    const today = new Date()
    
    // Get Beijing time
    const beijingTime = new Date(today.getTime() + (8 * 60 * 60 * 1000) - (today.getTimezoneOffset() * 60 * 1000))
    
    // Get current month and year in Beijing time
    const currentMonth = beijingTime.getMonth()
    const currentYear = beijingTime.getFullYear()
    
    // Get number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()

    // Generate data for each day of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day)
      const dateStr = date.toISOString().split('T')[0]

      const dayData: any = {
        date: dateStr,
        day: day,
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
  
  // Get current month name for display
  const getCurrentMonthName = () => {
    const today = new Date()
    const beijingTime = new Date(today.getTime() + (8 * 60 * 60 * 1000) - (today.getTimezoneOffset() * 60 * 1000))
    return beijingTime.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="w-full h-96">
      <div className="text-sm text-gray-600 mb-2 text-center">
        {getCurrentMonthName()} - Beijing Time (UTC+8)
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
            labelFormatter={(label) => `June ${label}, 2025`}
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
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 