'use client'

import { useState } from 'react'
import { TeamWithExpenditures } from '@/lib/supabase'
import { ChevronDown, ChevronUp, Calculator } from 'lucide-react'

interface TeamCardProps {
  team: TeamWithExpenditures
}

export default function TeamCard({ team }: TeamCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-danger-500'
    if (percentage >= 75) return 'bg-warning-500'
    return 'bg-success-500'
  }

  const getProgressBgColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-danger-100'
    if (percentage >= 75) return 'bg-warning-100'
    return 'bg-success-100'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{team.name}</h3>
        <div 
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: team.color }}
        ></div>
      </div>

      <div className="space-y-4">
        {/* Budget Overview */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Budget</p>
            <p className="text-lg font-bold text-gray-900">{team.budget.toLocaleString()}U</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Spent</p>
            <p className="text-lg font-bold text-danger-600">{team.totalSpent.toLocaleString()}U</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Remaining</p>
            <p className="text-lg font-bold text-success-600">{team.remaining.toLocaleString()}U</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Budget Usage</span>
            <span className="text-sm text-gray-600">{team.percentageUsed.toFixed(1)}%</span>
          </div>
          <div className={`w-full ${getProgressBgColor(team.percentageUsed)} rounded-full h-3`}>
            <div
              className={`h-3 rounded-full transition-all duration-300 ${getProgressColor(team.percentageUsed)}`}
              style={{ width: `${Math.min(team.percentageUsed, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Expenditures Section */}
        {team.expenditures.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-gray-700">
                Expenses ({team.expenditures.length})
              </h4>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
              >
                <span>{isExpanded ? 'Hide Details' : 'Show Details'}</span>
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>
            </div>

            {!isExpanded ? (
              /* Collapsed View - Recent Expenses */
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {team.expenditures.slice(-3).reverse().map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600 truncate">{exp.description}</span>
                    <span className="font-medium text-gray-900">{exp.amount.toFixed(2)}U</span>
                  </div>
                ))}
                {team.expenditures.length > 3 && (
                  <div className="text-xs text-gray-500 text-center pt-1">
                    +{team.expenditures.length - 3} more expenses
                  </div>
                )}
              </div>
            ) : (
              /* Expanded View - Detailed Expenses */
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {team.expenditures.slice().reverse().map((exp) => (
                  <div key={exp.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <div className="flex justify-between items-start mb-2">
                      <h5 className="font-medium text-gray-900 text-sm">{exp.description}</h5>
                      <span className="text-xs text-gray-500">{exp.date}</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">Unit Price:</span>
                        <div className="font-medium text-gray-900">
                          {exp.unit_price?.toFixed(2) || 'N/A'}U
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <div className="font-medium text-gray-900">
                          {exp.quantity || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total:</span>
                        <div className="font-bold text-gray-900">
                          {exp.amount.toFixed(2)}U
                        </div>
                      </div>
                    </div>

                    {/* Calculation Display */}
                    {exp.unit_price && exp.quantity && (
                      <div className="mt-2 flex items-center space-x-1 text-xs text-gray-600">
                        <Calculator className="h-3 w-3" />
                        <span>
                          {exp.unit_price.toFixed(2)}U × {exp.quantity} = {exp.amount.toFixed(2)}U
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* No Expenses Message */}
        {team.expenditures.length === 0 && (
          <div className="text-center py-4 text-gray-500 text-sm">
            No expenses recorded yet
          </div>
        )}
      </div>
    </div>
  )
} 