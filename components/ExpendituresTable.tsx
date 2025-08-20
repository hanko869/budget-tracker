'use client'

import React, { memo, useMemo } from 'react'
import { type Expenditure, type Team, type Member } from '@/lib/supabase'

interface ExpendituresTableProps {
  rows: Expenditure[]
  teams: Team[]
  members: Member[]
  loading: boolean
  onEdit: (expenditure: Expenditure) => void
  onDelete: (id: string) => void
}

const ExpendituresTableComponent: React.FC<ExpendituresTableProps> = ({ rows, teams, members, loading, onEdit, onDelete }) => {
  const teamNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const t of teams) map.set(t.id, t.name)
    return map
  }, [teams])

  const memberNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const m of members) map.set(m.id, m.name)
    return map
  }, [members])

  const getTeamName = (teamId: string, expenditure?: any) => {
    const name = teamNameById.get(teamId)
    return name || expenditure?.team_name_historical || 'Unknown Team (Deleted)'
  }

  const getMemberName = (memberId: string | undefined, expenditure?: any) => {
    if (!memberId) return expenditure?.member_name_historical || 'Unassigned'
    const name = memberNameById.get(memberId)
    return name || expenditure?.member_name_historical || 'Unknown Member (Deleted)'
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {rows.map((expenditure) => (
              <tr key={expenditure.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getTeamName(expenditure.team_id, expenditure)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{getMemberName(expenditure.member_id, expenditure)}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{expenditure.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expenditure.unit_price?.toFixed(2) || 'N/A'}U</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expenditure.quantity || 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expenditure.amount.toFixed(2)}U</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expenditure.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => onEdit(expenditure)} disabled={loading} className="text-blue-600 hover:text-blue-900">✏️</button>
                  <button onClick={() => onDelete(expenditure.id)} disabled={loading} className="text-red-600 hover:text-red-900">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const ExpendituresTable = memo(ExpendituresTableComponent)
export default ExpendituresTable


