'use client'

import { useState, useEffect } from 'react'
import { Plus, DollarSign, TrendingUp, Users } from 'lucide-react'
import TeamCard from '@/components/TeamCard'
import SpendingChart from '@/components/SpendingChart'
import MonthSelector from '@/components/MonthSelector'
import { dbOperations, type TeamWithExpenditures, type Team, type Member, type MemberWithSpending } from '@/lib/supabase'

interface TeamWithMembers extends Team {
  members: MemberWithSpending[]
  totalBudget: number
  totalSpent: number
  remaining: number
}

export default function Dashboard() {
  const [teamsData, setTeamsData] = useState<TeamWithExpenditures[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [teamsWithMembers, setTeamsWithMembers] = useState<TeamWithMembers[]>([])
  const [loading, setLoading] = useState(true)
  
  // Month selection state
  const now = new Date()
  const [selectedYear, setSelectedYear] = useState(now.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth())

  useEffect(() => {
    initializeAndLoadData()
  }, [selectedYear, selectedMonth])

  const initializeAndLoadData = async () => {
    try {
      setLoading(true)
      
      // Initialize teams if needed
      await dbOperations.initializeTeams()
      
      // Load teams, members and expenditures for selected month
      const [teamsResult, expenditures, allMembers] = await Promise.all([
        dbOperations.getTeams(),
        dbOperations.getExpenditures(selectedYear, selectedMonth),
        dbOperations.getTeamMembers()
      ])
      
      setTeams(teamsResult)
      
      // Process teams with member data
      const teamsWithMemberData = await Promise.all(
        teamsResult.map(async (team) => {
          const teamMembers = allMembers.filter(m => m.team_id === team.id)
          
          // Get all team expenditures
          const teamExpenditures = expenditures.filter(exp => exp.team_id === team.id)
          const unassignedSpending = teamExpenditures
            .filter(exp => !exp.member_id)
            .reduce((sum, exp) => sum + exp.amount, 0)
          
          // Get member spending data
          const membersWithSpending = await Promise.all(
            teamMembers.map(async (member) => {
              const memberExp = expenditures.filter(exp => exp.member_id === member.id)
              const totalSpent = memberExp.reduce((sum, exp) => sum + exp.amount, 0)
              
              return {
                ...member,
                totalSpent,
                remaining: null, // No budget limit
                percentageUsed: null // No percentage since budget is unlimited
              } as MemberWithSpending
            })
          )
          
          // Calculate team totals based on members (no budget limits now)
          const totalBudget = 0 // No budget limits for members
          
          const memberSpending = membersWithSpending.reduce((sum, m) => sum + m.totalSpent, 0)
          const totalSpent = memberSpending + unassignedSpending
          
          return {
            ...team,
            members: membersWithSpending,
            totalBudget,
            totalSpent,
            remaining: totalBudget - totalSpent
          } as TeamWithMembers
        })
      )
      
      setTeamsWithMembers(teamsWithMemberData)
      
      // Keep the old teamsData format for compatibility with existing components
      const teamsWithData = teamsResult.map(team => {
        const teamData = teamsWithMemberData.find(t => t.id === team.id)!
        const teamExpenditures = expenditures.filter(exp => exp.team_id === team.id)
        
        return {
          ...team,
          expenditures: teamExpenditures,
          totalSpent: teamData.totalSpent,
          remaining: teamData.remaining,
          percentageUsed: teamData.totalBudget > 0 ? (teamData.totalSpent / teamData.totalBudget) * 100 : 0
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

  const handleMonthChange = (year: number, month: number) => {
    setSelectedYear(year)
    setSelectedMonth(month)
  }

  const totalBudget = teamsWithMembers.reduce((sum, team) => sum + team.totalBudget, 0)
  const totalSpent = teamsWithMembers.reduce((sum, team) => sum + team.totalSpent, 0)
  const totalRemaining = totalBudget - totalSpent
  const totalMembers = teamsWithMembers.reduce((sum, team) => sum + team.members.length, 0)
  
  // Get selected month name
  const selectedMonthName = new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric',
    timeZone: 'Asia/Shanghai'
  })

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

  if (!loading && teams.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Teams Found</h1>
          <p className="text-gray-600">No teams are present in the database. Please add teams in Supabase.</p>
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
            <p className="text-gray-600 mt-2">Monitor team spending and budget allocation (Beijing Time UTC+8)</p>
          </div>
          <MonthSelector 
            currentMonth={selectedMonth}
            currentYear={selectedYear}
            onMonthChange={handleMonthChange}
          />
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Status</p>
                <p className="text-2xl font-bold text-gray-900">Unlimited</p>
                <p className="text-xs text-gray-500">No budget limits</p>
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
                <p className="text-sm font-medium text-gray-600">Members</p>
                <p className="text-2xl font-bold text-gray-900">{totalMembers}</p>
              </div>
              <Users className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Daily Spending Trends</h3>
            <SpendingChart teamsData={teamsData} selectedYear={selectedYear} selectedMonth={selectedMonth} />
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Team Overview</h3>
            <div className="space-y-4">
              {teamsWithMembers.map(team => (
                <div key={team.id} className="group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <span className="font-medium">{team.name}</span>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{team.totalSpent.toLocaleString()}U / {team.totalBudget.toLocaleString()}U</p>
                      <p className="text-sm text-gray-600">
                        {team.totalBudget > 0 ? ((team.totalSpent / team.totalBudget) * 100).toFixed(1) : 0}% used
                      </p>
                    </div>
                  </div>
                  
                  {/* Member details on hover */}
                  <div className="hidden group-hover:block mt-2 ml-7 space-y-1">
                    {team.members.map(member => (
                      <div key={member.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-600">{member.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-gray-700">
                            {member.totalSpent.toFixed(0)}U spent
                          </span>
                        </div>
                      </div>
                    ))}
                    {/* Show unassigned spending if any */}
                    {(() => {
                      const unassigned = teamsData.find(t => t.id === team.id)?.expenditures
                        .filter(exp => !exp.member_id)
                        .reduce((sum, exp) => sum + exp.amount, 0) || 0
                      return unassigned > 0 ? (
                        <div className="flex items-center justify-between text-sm border-t pt-1 mt-1">
                          <span className="text-gray-500 italic">Unassigned</span>
                          <span className="text-gray-700">{unassigned.toFixed(0)}U</span>
                        </div>
                      ) : null
                    })()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Team Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {teamsWithMembers.map(team => (
            <TeamCard 
              key={team.id} 
              team={{
                ...team,
                budget: team.totalBudget,
                expenditures: teamsData.find(t => t.id === team.id)?.expenditures || [],
                totalSpent: team.totalSpent,
                remaining: team.remaining,
                percentageUsed: team.totalBudget > 0 ? (team.totalSpent / team.totalBudget) * 100 : 0
              }} 
              members={team.members}
            />
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
                <strong>Database Status:</strong> {(() => {
                  const { isDatabaseConnected } = require('@/lib/supabase')
                  return isDatabaseConnected() ? 'Connected to Supabase! 🎉' : 'Using fallback data - Add Supabase environment variables to enable database features.'
                })()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 