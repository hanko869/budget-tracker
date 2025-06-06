'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TeamWithExpenditures } from '@/lib/supabase'

interface SpendingChartProps {
  teamsData: TeamWithExpenditures[]
}

export default function SpendingChart({ teamsData }: SpendingChartProps) {
  // Generate chart data for the current month
  const generateChartData = () => {
    const data = []
    
    // Simple approach: Use current date to determine month/year
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1 // JavaScript months are 0-based
    
    // Get number of days in current month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate()

    // Generate data for each day of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      // Create date string in YYYY-MM-DD format to match database storage
      const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`

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
    return today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  return (
    <div className="w-full h-96">
      <div className="text-sm text-gray-600 mb-2 text-center">
        {getCurrentMonthName()} - Daily Spending Trends
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
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
} 