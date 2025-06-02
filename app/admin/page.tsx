'use client'

import { useState, useEffect } from 'react'
import { teams, Expenditure, dbOperations } from '@/lib/supabase'
import { Lock, Plus, Edit, Trash2, Save, X, Calculator } from 'lucide-react'

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [expenditures, setExpenditures] = useState<Expenditure[]>([])
  const [editingExpenditure, setEditingExpenditure] = useState<Expenditure | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [newExpenditure, setNewExpenditure] = useState({
    team_id: '',
    unit_price: '',
    quantity: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadExpenditures()
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    // Simple authentication for demo purposes
    // In production, use proper authentication with Supabase Auth
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid credentials')
    }
  }

  const loadExpenditures = async () => {
    setLoading(true)
    try {
      const data = await dbOperations.getExpenditures()
      setExpenditures(data)
    } catch (error) {
      console.error('Error loading expenditures:', error)
      alert('Error loading expenditures. Please try again.')
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
        await loadExpenditures() // Refresh the list
        setNewExpenditure({
          team_id: '',
          unit_price: '',
          quantity: '',
          description: '',
          date: new Date().toISOString().split('T')[0]
        })
        setShowAddForm(false)
        alert('Expenditure added successfully!')
      } else {
        alert('Error adding expenditure. Please try again.')
      }
    } catch (error) {
      console.error('Error adding expenditure:', error)
      alert('Error adding expenditure. Please try again.')
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
      // Recalculate total amount
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
        await loadExpenditures() // Refresh the list
        setEditingExpenditure(null)
        alert('Expenditure updated successfully!')
      } else {
        alert('Error updating expenditure. Please try again.')
      }
    } catch (error) {
      console.error('Error updating expenditure:', error)
      alert('Error updating expenditure. Please try again.')
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
        await loadExpenditures() // Refresh the list
        alert('Expenditure deleted successfully!')
      } else {
        alert('Error deleting expenditure. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting expenditure:', error)
      alert('Error deleting expenditure. Please try again.')
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
            <Lock className="mx-auto h-12 w-12 text-primary-600" />
            <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to manage budget expenditures
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="sr-only">Username</label>
              <input
                id="username"
                name="username"
                type="text"
                required
                className="input-field"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input-field"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <button type="submit" className="btn-primary w-full">
                Sign in
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <div className="flex space-x-4">
              <a href="/" className="btn-secondary">
                Back to Dashboard
              </a>
              <button
                onClick={() => setIsAuthenticated(false)}
                className="btn-secondary"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
            <span className="text-gray-700">Processing...</span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add Expenditure Button */}
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <Plus className="h-4 w-4" />
            <span>Add Expenditure</span>
          </button>
        </div>

        {/* Add Expenditure Form */}
        {showAddForm && (
          <div className="card mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Expenditure</h3>
            <form onSubmit={handleAddExpenditure} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                  <select
                    value={newExpenditure.team_id}
                    onChange={(e) => setNewExpenditure({...newExpenditure, team_id: e.target.value})}
                    className="input-field"
                    required
                    disabled={loading}
                  >
                    <option value="">Select Team</option>
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
                    value={newExpenditure.unit_price}
                    onChange={(e) => setNewExpenditure({...newExpenditure, unit_price: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 10.00"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={newExpenditure.quantity}
                    onChange={(e) => setNewExpenditure({...newExpenditure, quantity: e.target.value})}
                    className="input-field"
                    placeholder="e.g., 10"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newExpenditure.date}
                    onChange={(e) => setNewExpenditure({...newExpenditure, date: e.target.value})}
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newExpenditure.description}
                    onChange={(e) => setNewExpenditure({...newExpenditure, description: e.target.value})}
                    className="input-field"
                    placeholder="e.g., Facebook Ads, Software License, etc."
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Total Calculation Display */}
              {(newExpenditure.unit_price && newExpenditure.quantity) && (
                <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-5 w-5 text-primary-600" />
                    <span className="text-sm font-medium text-primary-700">Calculation:</span>
                  </div>
                  <div className="mt-2 text-sm text-primary-600">
                    {newExpenditure.unit_price}U × {newExpenditure.quantity} = 
                    <span className="font-bold text-lg text-primary-700 ml-2">
                      {calculateTotal(newExpenditure.unit_price, newExpenditure.quantity).toFixed(2)}U
                    </span>
                  </div>
                </div>
              )}

              <div className="flex space-x-2">
                <button type="submit" className="btn-primary flex items-center space-x-2" disabled={loading}>
                  <Save className="h-4 w-4" />
                  <span>Save</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="btn-secondary flex items-center space-x-2"
                  disabled={loading}
                >
                  <X className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Expenditures Table */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenditures</h3>
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
                {expenditures.map((expenditure) => (
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
                        className="text-primary-600 hover:text-primary-900"
                        disabled={loading}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteExpenditure(expenditure.id)}
                        className="text-danger-600 hover:text-danger-900"
                        disabled={loading}
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

        {/* Edit Modal */}
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
                    className="input-field"
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
                    className="input-field"
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
                    className="input-field"
                    required
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={editingExpenditure.date}
                    onChange={(e) => setEditingExpenditure({...editingExpenditure, date: e.target.value})}
                    className="input-field"
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
                    className="input-field"
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
                  <button type="submit" className="btn-primary flex items-center space-x-2" disabled={loading}>
                    <Save className="h-4 w-4" />
                    <span>Update</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingExpenditure(null)}
                    className="btn-secondary flex items-center space-x-2"
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
      </main>
    </div>
  )
} 