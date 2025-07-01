'use client'

import { useState, useEffect } from 'react'
import { Lock, Plus, Edit, Trash2, Save, X, Calculator, Settings, BarChart3 } from 'lucide-react'
import { dbOperations, isDatabaseConnected, type Team, type Expenditure } from '@/lib/supabase'
import { getBeiJingDate } from '@/lib/timezone'
import { useRouter } from 'next/navigation'

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [teams, setTeams] = useState<Team[]>([])
  const [expenditures, setExpenditures] = useState<Expenditure[]>([])
  const [editingExpenditure, setEditingExpenditure] = useState<Expenditure | null>(null)
  const [editingTeam, setEditingTeam] = useState<Team | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showBudgetManagement, setShowBudgetManagement] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newExpenditure, setNewExpenditure] = useState({
    team_id: '',
    unit_price: '',
    quantity: '',
    description: '',
    date: getBeiJingDate()
  })
  const [teamFilter, setTeamFilter] = useState<string>('all')
  const router = useRouter()

  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadData()
  }, [])

  // Get current month name
  const currentMonth = new Date().toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric',
    timeZone: 'Asia/Shanghai'
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === '654321') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid credentials')
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      await dbOperations.initializeTeams()
      const [teamsData, expendituresData] = await Promise.all([
        dbOperations.getTeams(),
        dbOperations.getExpenditures()
      ])
      setTeams(teamsData)
      setExpenditures(expendituresData)
    } catch (error) {
      console.error('Error loading data:', error)
      alert('Error loading data. Database may not be connected yet.')
    } finally {
      setLoading(false)
    }
  }

  const calculateTotal = (unitPrice: string, quantity: string) => {
    const price = parseFloat(unitPrice) || 0
    const qty = parseInt(quantity) || 0
    return price * qty
  }

  const handleAddExpenditure = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const unitPrice = parseFloat(newExpenditure.unit_price)
      const quantity = parseInt(newExpenditure.quantity)
      const totalAmount = unitPrice * quantity

      const expenditureData = {
        team_id: newExpenditure.team_id,
        amount: totalAmount,
        unit_price: unitPrice,
        quantity: quantity,
        description: newExpenditure.description,
        date: newExpenditure.date,
      }

      const result = await dbOperations.addExpenditure(expenditureData)
      
      if (result) {
        await loadData() // Refresh the data
        setNewExpenditure({
          team_id: '',
          unit_price: '',
          quantity: '',
          description: '',
          date: getBeiJingDate()
        })
        setShowAddForm(false)
        alert('✅ Expenditure added successfully to database!')
      } else {
        alert('❌ Error: Could not save to database. Please check if environment variables are set in Vercel.')
      }
    } catch (error) {
      console.error('Error adding expenditure:', error)
      alert('❌ Database Error: ' + (error instanceof Error ? error.message : 'Unknown error') + '\n\nPlease check if Supabase environment variables are configured in Vercel.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditExpenditure = (expenditure: Expenditure) => {
    setEditingExpenditure(expenditure)
  }

  const handleUpdateExpenditure = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingExpenditure) return

    setLoading(true)
    try {
      const totalAmount = editingExpenditure.unit_price * editingExpenditure.quantity
      
      const updates = {
        team_id: editingExpenditure.team_id,
        amount: totalAmount,
        unit_price: editingExpenditure.unit_price,
        quantity: editingExpenditure.quantity,
        description: editingExpenditure.description,
        date: editingExpenditure.date,
      }

      const result = await dbOperations.updateExpenditure(editingExpenditure.id, updates)
      
      if (result) {
        await loadData()
        setEditingExpenditure(null)
        alert('Expenditure updated successfully!')
      } else {
        alert('Error updating expenditure.')
      }
    } catch (error) {
      console.error('Error updating expenditure:', error)
      alert('Error updating expenditure.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExpenditure = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expenditure?')) return

    setLoading(true)
    try {
      const success = await dbOperations.deleteExpenditure(id)
      
      if (success) {
        await loadData()
        alert('Expenditure deleted successfully!')
      } else {
        alert('Error deleting expenditure.')
      }
    } catch (error) {
      console.error('Error deleting expenditure:', error)
      alert('Error deleting expenditure.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTeamBudget = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingTeam) return

    setLoading(true)
    try {
      const result = await dbOperations.updateTeamBudget(editingTeam.id, editingTeam.budget)
      
      if (result) {
        await loadData()
        setEditingTeam(null)
        alert('✅ Team budget updated successfully!')
      } else {
        alert('❌ Error updating team budget.')
      }
    } catch (error) {
      console.error('Error updating team budget:', error)
      alert('❌ Database Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  const getTeamName = (teamId: string) => {
    return teams.find(team => team.id === teamId)?.name || 'Unknown'
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <Lock className="mx-auto h-12 w-12 text-blue-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage budget expenditures
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Processing...</span>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage team expenditures and budgets (Beijing Time UTC+8)</p>
            <p className="text-sm text-blue-600 mt-1 font-medium">
              Managing data for: {currentMonth}
            </p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              disabled={loading}
            >
              <Plus className="w-4 h-4" />
              <span>Add Expenditure</span>
            </button>
            <button
              onClick={() => setShowBudgetManagement(!showBudgetManagement)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              disabled={loading}
            >
              <Settings className="w-4 h-4" />
              <span>Manage Budgets</span>
            </button>
            <button
              onClick={() => router.push('/')}
              className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
            >
              <BarChart3 className="w-5 h-5" />
              <span>View Dashboard</span>
            </button>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Budget Management */}
        {showBudgetManagement && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Budget Management</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {teams.map(team => (
                <div key={team.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-3">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: team.color }}
                    ></div>
                    <h4 className="font-medium">{team.name}</h4>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 mb-2">
                    {team.budget.toLocaleString()}U
                  </p>
                  <button
                    onClick={() => setEditingTeam(team)}
                    disabled={loading}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm transition-colors"
                  >
                    Edit Budget
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Add New Expenditure</h3>
            <form onSubmit={handleAddExpenditure} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Team
                  </label>
                  <select
                    value={newExpenditure.team_id}
                    onChange={(e) => setNewExpenditure(prev => ({ ...prev, team_id: e.target.value }))}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select team</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date (Beijing Time)
                  </label>
                  <input
                    type="date"
                    value={newExpenditure.date}
                    onChange={(e) => setNewExpenditure(prev => ({ ...prev, date: e.target.value }))}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit Price (U)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={newExpenditure.unit_price}
                    onChange={(e) => setNewExpenditure(prev => ({ ...prev, unit_price: e.target.value }))}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={newExpenditure.quantity}
                    onChange={(e) => setNewExpenditure(prev => ({ ...prev, quantity: e.target.value }))}
                    required
                    disabled={loading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newExpenditure.description}
                  onChange={(e) => setNewExpenditure(prev => ({ ...prev, description: e.target.value }))}
                  required
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>

              {/* Real-time total calculation */}
              {(newExpenditure.unit_price && newExpenditure.quantity) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Calculation:</span>
                  </div>
                  <div className="mt-2 text-sm text-blue-600">
                    {newExpenditure.unit_price}U × {newExpenditure.quantity} = 
                    <span className="font-bold text-lg text-blue-700 ml-2">
                      {calculateTotal(newExpenditure.unit_price, newExpenditure.quantity).toFixed(2)}U
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Expenditure</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={loading}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenditures Table */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Expenditures</h3>
            <select
              value={teamFilter}
              onChange={e => setTeamFilter(e.target.value)}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value="all">All Teams</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Team
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenditures
                  .filter(exp => teamFilter === 'all' || exp.team_id === teamFilter)
                  .map((expenditure) => (
                  <tr key={expenditure.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getTeamName(expenditure.team_id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {expenditure.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.unit_price?.toFixed(2) || 'N/A'}U
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.quantity || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {expenditure.amount.toFixed(2)}U
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expenditure.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEditExpenditure(expenditure)}
                        disabled={loading}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpenditure(expenditure.id)}
                        disabled={loading}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Expenditure Modal */}
        {editingExpenditure && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Expenditure</h3>
              <form onSubmit={handleUpdateExpenditure} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select
                    value={editingExpenditure.team_id}
                    onChange={(e) => setEditingExpenditure({...editingExpenditure, team_id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={loading}
                  >
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>{team.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price (U)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingExpenditure.unit_price}
                    onChange={(e) => setEditingExpenditure({...editingExpenditure, unit_price: parseFloat(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={editingExpenditure.quantity}
                    onChange={(e) => setEditingExpenditure({...editingExpenditure, quantity: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date (Beijing Time)</label>
                  <input
                    type="date"
                    value={editingExpenditure.date}
                    onChange={(e) => setEditingExpenditure({...editingExpenditure, date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={editingExpenditure.description}
                    onChange={(e) => setEditingExpenditure({...editingExpenditure, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                    disabled={loading}
                  />
                </div>
                
                {/* Total Display in Edit Modal */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                    <span className="text-lg font-bold text-gray-900">
                      {(editingExpenditure.unit_price * editingExpenditure.quantity).toFixed(2)}U
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2" disabled={loading}>
                    <Save className="h-4 w-4" />
                    <span>Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingExpenditure(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Team Budget Modal */}
        {editingTeam && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Team Budget</h3>
              <form onSubmit={handleUpdateTeamBudget} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-md">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: editingTeam.color }}
                    ></div>
                    <span className="font-medium">{editingTeam.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget (U)</label>
                  <input
                    type="number"
                    step="100"
                    min="0"
                    value={editingTeam.budget}
                    onChange={(e) => setEditingTeam({...editingTeam, budget: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-lg font-semibold"
                    required
                    disabled={loading}
                  />
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-sm text-blue-800">
                    This will update the monthly budget cap for <strong>{editingTeam.name}</strong> team.
                  </p>
                </div>

                <div className="flex space-x-2">
                  <button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2" disabled={loading}>
                    <Save className="h-4 w-4" />
                    <span>Update Budget</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingTeam(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
                    disabled={loading}
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Database Status */}
        <div className={`mt-8 border rounded-lg p-4 ${isDatabaseConnected() ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {isDatabaseConnected() ? (
                <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className={`text-sm ${isDatabaseConnected() ? 'text-green-800' : 'text-yellow-800'}`}>
                <strong>Database Status:</strong> {isDatabaseConnected() ? 'Connected to Supabase! 🎉' : 'Using fallback mode (localStorage)'}
              </p>
              <p className={`text-xs mt-1 ${isDatabaseConnected() ? 'text-green-600' : 'text-yellow-600'}`}>
                {isDatabaseConnected() 
                  ? `Real-time database operations enabled. ${expenditures.length} expenditures, ${teams.length} teams.`
                  : 'Add Supabase environment variables in Vercel to enable database features.'
                }
              </p>
              {isDatabaseConnected() && (
                <p className="text-xs text-green-600 mt-1">
                  URL: {process.env.NEXT_PUBLIC_SUPABASE_URL}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 