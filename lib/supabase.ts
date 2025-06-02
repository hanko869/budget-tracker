import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client if credentials are provided
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Check if database is connected
export const isDatabaseConnected = () => {
  return supabase !== null && supabaseUrl.includes('supabase.co')
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

export const teams: Team[] = [
  { id: '1', name: 'Chen Long', budget: 9800, color: '#3b82f6' },
  { id: '2', name: '李行舟', budget: 8400, color: '#10b981' },
  { id: '3', name: '天意', budget: 8400, color: '#f59e0b' },
  { id: '4', name: '沉浮', budget: 5600, color: '#ef4444' },
]

// Database operations - use Supabase if available, fallback to localStorage
export const dbOperations = {
  // Get all expenditures
  async getExpenditures(): Promise<Expenditure[]> {
    try {
      if (supabase) {
        const { data, error } = await supabase
          .from('expenditures')
          .select('*')
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
        return stored ? JSON.parse(stored) : []
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