'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, Users } from 'lucide-react'
import TeamCard from '@/components/TeamCard'
import SpendingChart from '@/components/SpendingChart'
import { teams, dbOperations, type TeamWithExpenditures, type Expenditure } from '@/lib/supabase'

export default function Dashboard() {
  const [teamsData, setTeamsData] = useState<TeamWithExpenditures[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const expenditures = await dbOperations.getExpenditures()
      
      const teamsWithData = teams.map(team => {
        const teamExpenditures = expenditures.filter(exp => exp.team_id === team.id)
        const totalSpent = teamExpenditures.reduce((sum, exp) => sum + exp.amount, 0)
        const remaining = team.budget - totalSpent
        const percentageUsed = (totalSpent / team.budget) * 100

        return {
          ...team,
          expenditures: teamExpenditures,
          totalSpent,
          remaining,
          percentageUsed
        }
      })

      setTeamsData(teamsWithData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalBudget = teams.reduce((sum, team) => sum + team.budget, 0)
  const totalSpent = teamsData.reduce((sum, team) => sum + team.totalSpent, 0)
  const totalRemaining = totalBudget - totalSpent

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Budget Tracker</h1>
            <p className="text-gray-600 mt-2">Monitor team spending and budget allocation</p>
          </div>
          <a 
            href="/admin" 
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Admin Panel</span>
          </a>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{totalBudget.toLocaleString()}U</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">{totalSpent.toLocaleString()}U</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-green-600">{totalRemaining.toLocaleString()}U</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Teams</p>
                <p className="text-2xl font-bold text-gray-900">{teams.length}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Daily Spending Trends</h3>
            <SpendingChart teamsData={teamsData} />
          </div>
          
          <div className="card">
            <h3 className="text-lg font-semibold mb-4">Budget Overview</h3>
            <div className="space-y-4">
              {teamsData.map(team => (
                <div key={team.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <span className="font-medium">{team.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{team.totalSpent.toLocaleString()}U / {team.budget.toLocaleString()}U</p>
                    <p className="text-sm text-gray-600">{team.percentageUsed.toFixed(1)}% used</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teamsData.map(team => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      </div>
    </div>
  )
} 