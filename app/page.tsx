'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, Users } from 'lucide-react'
import TeamCard from '@/components/TeamCard'
import SpendingChart from '@/components/SpendingChart'
import { dbOperations, type TeamWithExpenditures, type Team } from '@/lib/supabase'

export default function Dashboard() {
  const [teamsData, setTeamsData] = useState<TeamWithExpenditures[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeAndLoadData()
  }, [])

  const initializeAndLoadData = async () => {
    try {
      setLoading(true)
      
      // Initialize teams if needed
      await dbOperations.initializeTeams()
      
      // Load teams and expenditures
      const [teamsResult, expenditures] = await Promise.all([
        dbOperations.getTeams(),
        dbOperations.getExpenditures()
      ])
      
      setTeams(teamsResult)
      
      const teamsWithData = teamsResult.map(team => {
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
      // Fallback to static data if database fails
      const { defaultTeams } = await import('@/lib/supabase')
      setTeams(defaultTeams)
      const staticTeamsData = defaultTeams.map(team => ({
        ...team,
        expenditures: [],
        totalSpent: 0,
        remaining: team.budget,
        percentageUsed: 0
      }))
      setTeamsData(staticTeamsData)
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
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Admin Panel</span>
          </a>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Budget</p>
                <p className="text-2xl font-bold text-gray-900">{totalBudget.toLocaleString()}U</p>
              </div>
              <DollarSign className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Spent</p>
                <p className="text-2xl font-bold text-red-600">{totalSpent.toLocaleString()}U</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-green-600">{totalRemaining.toLocaleString()}U</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
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
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Spending Trends</h3>
            <SpendingChart teamsData={teamsData} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
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

        {/* Database Status */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-800">
                <strong>Database Status:</strong> {totalSpent > 0 ? 'Connected to Supabase! 🎉' : 'Using fallback data - Add Supabase environment variables to enable database features.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 