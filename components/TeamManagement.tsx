'use client'

import { useState } from 'react'
import { Plus, Edit2, Trash2, Save, X, Users } from 'lucide-react'
import { dbOperations, type Team } from '@/lib/supabase'

interface TeamManagementProps {
  teams: Team[]
  onTeamsUpdate: () => void
}

export default function TeamManagement({ teams, onTeamsUpdate }: TeamManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const [newTeam, setNewTeam] = useState({
    name: '',
    budget: 0,
    color: '#3b82f6'
  })
  const [loading, setLoading] = useState(false)

  // Predefined colors for teams
  const colorOptions = [
    '#3b82f6', // blue
    '#10b981', // green
    '#f59e0b', // amber
    '#ef4444', // red
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f97316', // orange
  ]

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeam.name || newTeam.budget <= 0) {
      alert('Please provide a valid team name and budget.')
      return
    }

    setLoading(true)
    try {
      const result = await dbOperations.createTeam({
        name: newTeam.name,
        budget: newTeam.budget,
        color: newTeam.color
      })

      if (result) {
        alert('✅ Team created successfully!')
        setNewTeam({ name: '', budget: 0, color: '#3b82f6' })
        setShowAddForm(false)
        onTeamsUpdate()
      } else {
        alert('❌ Error creating team.')
      }
    } catch (error) {
      console.error('Error creating team:', error)
      alert('❌ Error creating team.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditName = (team: Team) => {
    setEditingTeamId(team.id)
    setEditingName(team.name)
  }

  const handleSaveName = async (teamId: string) => {
    if (!editingName.trim()) {
      alert('Team name cannot be empty.')
      return
    }

    setLoading(true)
    try {
      const result = await dbOperations.updateTeamName(teamId, editingName)
      
      if (result) {
        alert('✅ Team name updated successfully!')
        setEditingTeamId(null)
        onTeamsUpdate()
      } else {
        alert('❌ Error updating team name.')
      }
    } catch (error) {
      console.error('Error updating team name:', error)
      alert('❌ Error updating team name.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteTeam = async (team: Team) => {
    const confirmed = confirm(
      `Are you sure you want to delete team "${team.name}"?\n\n` +
      `This will also delete ALL expenditures for this team. This action cannot be undone.`
    )

    if (!confirmed) return

    setLoading(true)
    try {
      const success = await dbOperations.deleteTeam(team.id)
      
      if (success) {
        alert('✅ Team deleted successfully!')
        onTeamsUpdate()
      } else {
        alert('❌ Error deleting team.')
      }
    } catch (error) {
      console.error('Error deleting team:', error)
      alert('❌ Error deleting team.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold flex items-center space-x-2">
          <Users className="w-5 h-5" />
          <span>Team Management</span>
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm transition-colors"
          disabled={loading}
        >
          <Plus className="w-4 h-4" />
          <span>Add Team</span>
        </button>
      </div>

      {/* Add Team Form */}
      {showAddForm && (
        <form onSubmit={handleAddTeam} className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-4">Create New Team</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Name
              </label>
              <input
                type="text"
                value={newTeam.name}
                onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter team name"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Budget (U)
              </label>
              <input
                type="number"
                value={newTeam.budget}
                onChange={(e) => setNewTeam({ ...newTeam, budget: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter budget"
                min="0"
                step="100"
                required
                disabled={loading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Team Color
              </label>
              <div className="flex items-center space-x-2">
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTeam({ ...newTeam, color })}
                    className={`w-8 h-8 rounded-full border-2 ${
                      newTeam.color === color ? 'border-gray-800' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                    disabled={loading}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
              disabled={loading}
            >
              <Save className="w-4 h-4" />
              <span>Create Team</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false)
                setNewTeam({ name: '', budget: 0, color: '#3b82f6' })
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 text-sm"
              disabled={loading}
            >
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </button>
          </div>
        </form>
      )}

      {/* Teams List */}
      <div className="space-y-3">
        {teams.map((team) => (
          <div key={team.id} className="border border-gray-200 rounded-lg p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div 
                className="w-6 h-6 rounded-full" 
                style={{ backgroundColor: team.color }}
              />
              {editingTeamId === team.id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  disabled={loading}
                />
              ) : (
                <div>
                  <h4 className="font-medium">{team.name}</h4>
                  <p className="text-sm text-gray-600">Budget: {team.budget.toLocaleString()}U/month</p>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              {editingTeamId === team.id ? (
                <>
                  <button
                    onClick={() => handleSaveName(team.id)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingTeamId(null)
                      setEditingName('')
                    }}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleEditName(team)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>No teams found. Create your first team!</p>
        </div>
      )}
    </div>
  )
} 