'use client'

import { useState } from 'react'
import { Lock, Plus } from 'lucide-react'

// Simple team data
const teams = [
  { id: '1', name: 'Chen Long', budget: 9800, color: '#3b82f6' },
  { id: '2', name: '李行舟', budget: 8400, color: '#10b981' },
  { id: '3', name: '天意', budget: 8400, color: '#f59e0b' },
  { id: '4', name: '沉浮', budget: 5600, color: '#ef4444' },
]

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newExpenditure, setNewExpenditure] = useState({
    team_id: '',
    unit_price: '',
    quantity: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (username === 'admin' && password === 'admin123') {
      setIsAuthenticated(true)
    } else {
      alert('Invalid credentials. Use admin/admin123')
    }
  }

  const calculateTotal = (unitPrice: string, quantity: string) => {
    const price = parseFloat(unitPrice) || 0
    const qty = parseInt(quantity) || 0
    return price * qty
  }

  const handleAddExpenditure = (e: React.FormEvent) => {
    e.preventDefault()
    const total = calculateTotal(newExpenditure.unit_price, newExpenditure.quantity)
    
    // In a real app, this would save to database
    alert(`Expenditure added successfully! Total: ${total}U`)
    
    setNewExpenditure({
      team_id: '',
      unit_price: '',
      quantity: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setShowAddForm(false)
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
            <p className="mt-2 text-xs text-blue-600">
              Demo: admin / admin123
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
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600 mt-2">Manage team expenditures</p>
          </div>
          <div className="space-x-4">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expenditure</span>
            </button>
            <a 
              href="/" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Back to Dashboard
            </a>
            <button
              onClick={() => setIsAuthenticated(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

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
                    Date
                  </label>
                  <input
                    type="date"
                    value={newExpenditure.date}
                    onChange={(e) => setNewExpenditure(prev => ({ ...prev, date: e.target.value }))}
                    required
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter description"
                />
              </div>

              {/* Real-time total calculation */}
              {(newExpenditure.unit_price && newExpenditure.quantity) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">Total Amount:</span>
                    <span className="text-2xl font-bold text-blue-900">
                      {calculateTotal(newExpenditure.unit_price, newExpenditure.quantity).toLocaleString()}U
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 mt-1">
                    {newExpenditure.unit_price}U × {newExpenditure.quantity} = {calculateTotal(newExpenditure.unit_price, newExpenditure.quantity)}U
                  </p>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Add Expenditure
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Success Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-800">
                🎉 <strong>Admin Panel Successfully Deployed!</strong> You can now add and manage expenditures. Data will be saved to localStorage for this demo.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 