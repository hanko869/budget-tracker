'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, Users } from 'lucide-react'

// Simple team data
const teams = [
  { id: '1', name: 'Chen Long', budget: 9800, color: '#3b82f6' },
  { id: '2', name: '李行舟', budget: 8400, color: '#10b981' },
  { id: '3', name: '天意', budget: 8400, color: '#f59e0b' },
  { id: '4', name: '沉浮', budget: 5600, color: '#ef4444' },
]

export default function Dashboard() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const totalBudget = teams.reduce((sum, team) => sum + team.budget, 0)

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
                <p className="text-2xl font-bold text-red-600">0U</p>
              </div>
              <TrendingUp className="w-8 h-8 text-red-600" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Remaining</p>
                <p className="text-2xl font-bold text-green-600">{totalBudget.toLocaleString()}U</p>
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

        {/* Team Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teams.map(team => (
            <div key={team.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-4 h-4 rounded-full" 
                    style={{ backgroundColor: team.color }}
                  ></div>
                  <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
                </div>
                <span className="text-sm text-gray-500">{team.budget.toLocaleString()}U Budget</span>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Spent</span>
                  <span className="font-medium">0U</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Remaining</span>
                  <span className="font-medium text-green-600">{team.budget.toLocaleString()}U</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full" 
                    style={{ backgroundColor: team.color, width: '0%' }}
                  ></div>
                </div>
                <div className="text-sm text-gray-500">0% of budget used</div>
              </div>
            </div>
          ))}
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                🎉 <strong>Budget Tracker Successfully Deployed!</strong> Your application is now live and working. Go to Admin Panel to add expenditures.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 