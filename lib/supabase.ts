import { createClient } from '@supabase/supabase-js'

// Safely get environment variables with validation
const getSupabaseUrl = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  return url && url.startsWith('http') ? url : null
}

const getSupabaseKey = () => {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return key && key.length > 10 ? key : null
}

const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseKey()

// Create Supabase client safely
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Check if database is connected
export const isDatabaseConnected = () => {
  return supabase !== null && supabaseUrl !== null
}

export interface Team {
  id: string
  name: string
  budget: number
  color: string
  created_at?: string
}

export interface Expenditure {
  id: string
  team_id: string
  amount: number
  unit_price: number
  quantity: number
  description: string
  date: string
  created_at: string
}

export interface TeamWithExpenditures extends Team {
  expenditures: Expenditure[]
  totalSpent: number
  remaining: number
  percentageUsed: number
}

// Default teams (fallback when database is not available)
export const defaultTeams: Team[] = [
  { id: '1', name: 'Chen Long', budget: 9800, color: '#3b82f6' },
  { id: '2', name: '李行舟', budget: 8400, color: '#10b981' },
  { id: '3', name: '天意', budget: 8400, color: '#f59e0b' },
  { id: '4', name: '沉浮', budget: 5600, color: '#ef4444' },
]

// Helper function to get current month date range
function getCurrentMonthDateRange() {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
  
  // Format dates as YYYY-MM-DD for database queries
  const formatDate = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
  
  return {
    start: formatDate(firstDay),
    end: formatDate(lastDay)
  }
}

// Database operations - use Supabase if available, fallback to localStorage
export const dbOperations = {
  // Get all teams
  async getTeams(): Promise<Team[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('name')
        if (error) {
          console.error('Supabase error fetching teams:', error)
          return []
        }
        return data || []
      } else {
        // Fallback to localStorage for local development only
        if (typeof window === 'undefined') return []
        const stored = localStorage.getItem('teams')
        return stored ? JSON.parse(stored) : []
      }
    } catch (error) {
      console.error('Error fetching teams:', error)
      return []
    }
  },

  // Update team budget
  async updateTeamBudget(teamId: string, newBudget: number): Promise<Team | null> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('teams')
          .update({ budget: newBudget })
          .eq('id', teamId)
          .select()
          .single()
        
        if (error) {
          console.error('Supabase error updating team budget:', error)
          throw error
        }
        
        return data
      } else {
        // Fallback to localStorage
        if (typeof window === 'undefined') return null

        const stored = localStorage.getItem('teams')
        const teams = stored ? JSON.parse(stored) : defaultTeams
        const teamIndex = teams.findIndex((team: Team) => team.id === teamId)
        
        if (teamIndex !== -1) {
          teams[teamIndex].budget = newBudget
          localStorage.setItem('teams', JSON.stringify(teams))
          return teams[teamIndex]
        }
        return null
      }
    } catch (error) {
      console.error('Error updating team budget:', error)
      return null
    }
  },

  // Initialize teams in database (call this once to populate)
  async initializeTeams(): Promise<boolean> {
    try {
      if (supabase) {
        // Check if teams already exist
        const { data: existingTeams } = await supabase
          .from('teams')
          .select('id')
          .limit(1)
        
        if (existingTeams && existingTeams.length > 0) {
          return true // Teams already exist
        }

        // Insert default teams
        const { error } = await supabase
          .from('teams')
          .insert(defaultTeams)
        
        if (error) {
          console.error('Error initializing teams:', error)
          return false
        }
        
        return true
      } else {
        // Initialize in localStorage
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('teams')
          if (!stored) {
            localStorage.setItem('teams', JSON.stringify(defaultTeams))
          }
        }
        return true
      }
    } catch (error) {
      console.error('Error initializing teams:', error)
      return false
    }
  },

  // Get all expenditures
  async getExpenditures(): Promise<Expenditure[]> {
    try {
      const { start, end } = getCurrentMonthDateRange()
      
      if (supabase) {
        const { data, error } = await supabase
          .from('expenditures')
          .select('*')
          .gte('date', start)
          .lte('date', end)
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        return data || []
      } else {
        // Fallback to localStorage for local development
        if (typeof window === 'undefined') return []
        
        const stored = localStorage.getItem('expenditures')
        const allExpenditures = stored ? JSON.parse(stored) : []
        
        // Filter by current month
        return allExpenditures.filter((exp: Expenditure) => {
          const expDate = new Date(exp.date)
          const now = new Date()
          return expDate.getMonth() === now.getMonth() && 
                 expDate.getFullYear() === now.getFullYear()
        })
      }
    } catch (error) {
      console.error('Error fetching expenditures:', error)
      return []
    }
  },

  // Add new expenditure
  async addExpenditure(expenditure: Omit<Expenditure, 'id' | 'created_at'>): Promise<Expenditure | null> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('expenditures')
          .insert([{
            team_id: expenditure.team_id,
            amount: expenditure.amount,
            unit_price: expenditure.unit_price,
            quantity: expenditure.quantity,
            description: expenditure.description,
            date: expenditure.date
          }])
          .select()
          .single()
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        return data
      } else {
        // Fallback to localStorage
        const newExpenditure: Expenditure = {
          ...expenditure,
          id: Date.now().toString(),
          created_at: new Date().toISOString()
        }

        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('expenditures')
          const expenditures = stored ? JSON.parse(stored) : []
          expenditures.push(newExpenditure)
          localStorage.setItem('expenditures', JSON.stringify(expenditures))
        }

        return newExpenditure
      }
    } catch (error) {
      console.error('Error adding expenditure:', error)
      return null
    }
  },

  // Update expenditure
  async updateExpenditure(id: string, updates: Partial<Expenditure>): Promise<Expenditure | null> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('expenditures')
          .update(updates)
          .eq('id', id)
          .select()
          .single()
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        return data
      } else {
        // Fallback to localStorage
        if (typeof window === 'undefined') return null

        const stored = localStorage.getItem('expenditures')
        const expenditures = stored ? JSON.parse(stored) : []
        const index = expenditures.findIndex((exp: Expenditure) => exp.id === id)
        
        if (index !== -1) {
          expenditures[index] = { ...expenditures[index], ...updates }
          localStorage.setItem('expenditures', JSON.stringify(expenditures))
          return expenditures[index]
        }
        return null
      }
    } catch (error) {
      console.error('Error updating expenditure:', error)
      return null
    }
  },

  // Delete expenditure
  async deleteExpenditure(id: string): Promise<boolean> {
    try {
      if (supabase) {
        const { error } = await supabase
          .from('expenditures')
          .delete()
          .eq('id', id)
        
        if (error) {
          console.error('Supabase error:', error)
          throw error
        }
        
        return true
      } else {
        // Fallback to localStorage
        if (typeof window === 'undefined') return false

        const stored = localStorage.getItem('expenditures')
        const expenditures = stored ? JSON.parse(stored) : []
        const filtered = expenditures.filter((exp: Expenditure) => exp.id !== id)
        localStorage.setItem('expenditures', JSON.stringify(filtered))

        return true
      }
    } catch (error) {
      console.error('Error deleting expenditure:', error)
      return false
    }
  }
} 