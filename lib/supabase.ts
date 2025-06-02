import { createClient } from '@supabase/supabase-js'

// Environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create Supabase client only if credentials are provided and we're in the browser
export const supabase = typeof window !== 'undefined' && supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

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

// Database operations
export const dbOperations = {
  // Get all expenditures
  async getExpenditures(): Promise<Expenditure[]> {
    // Always use localStorage for now since Supabase is working but we want to ensure compatibility
    try {
      if (typeof window === 'undefined') return []
      
      const stored = localStorage.getItem('expenditures')
      const expenditures = stored ? JSON.parse(stored) : []
      
      // If we have Supabase and no local data, try to fetch from Supabase
      if (supabase && expenditures.length === 0) {
        const { data, error } = await supabase
          .from('expenditures')
          .select('*')
          .order('created_at', { ascending: false })

        if (!error && data) {
          // Save to localStorage for future use
          localStorage.setItem('expenditures', JSON.stringify(data))
          return data
        }
      }
      
      return expenditures
    } catch (error) {
      console.error('Error fetching expenditures:', error)
      return []
    }
  },

  // Add new expenditure
  async addExpenditure(expenditure: Omit<Expenditure, 'id' | 'created_at'>): Promise<Expenditure | null> {
    try {
      const newExpenditure: Expenditure = {
        ...expenditure,
        id: Date.now().toString(),
        created_at: new Date().toISOString()
      }

      // Save to localStorage first
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('expenditures')
        const expenditures = stored ? JSON.parse(stored) : []
        expenditures.push(newExpenditure)
        localStorage.setItem('expenditures', JSON.stringify(expenditures))
      }

      // Also save to Supabase if available
      if (supabase) {
        const { error } = await supabase
          .from('expenditures')
          .insert([newExpenditure])

        if (error) {
          console.error('Error saving to Supabase:', error)
          // Continue anyway since localStorage worked
        }
      }

      return newExpenditure
    } catch (error) {
      console.error('Error adding expenditure:', error)
      return null
    }
  },

  // Update expenditure
  async updateExpenditure(id: string, updates: Partial<Expenditure>): Promise<Expenditure | null> {
    try {
      if (typeof window === 'undefined') return null

      // Update localStorage
      const stored = localStorage.getItem('expenditures')
      const expenditures = stored ? JSON.parse(stored) : []
      const index = expenditures.findIndex((exp: Expenditure) => exp.id === id)
      
      if (index !== -1) {
        expenditures[index] = { ...expenditures[index], ...updates }
        localStorage.setItem('expenditures', JSON.stringify(expenditures))

        // Also update Supabase if available
        if (supabase) {
          const { error } = await supabase
            .from('expenditures')
            .update(updates)
            .eq('id', id)

          if (error) {
            console.error('Error updating in Supabase:', error)
          }
        }

        return expenditures[index]
      }
      return null
    } catch (error) {
      console.error('Error updating expenditure:', error)
      return null
    }
  },

  // Delete expenditure
  async deleteExpenditure(id: string): Promise<boolean> {
    try {
      if (typeof window === 'undefined') return false

      // Delete from localStorage
      const stored = localStorage.getItem('expenditures')
      const expenditures = stored ? JSON.parse(stored) : []
      const filtered = expenditures.filter((exp: Expenditure) => exp.id !== id)
      localStorage.setItem('expenditures', JSON.stringify(filtered))

      // Also delete from Supabase if available
      if (supabase) {
        const { error } = await supabase
          .from('expenditures')
          .delete()
          .eq('id', id)

        if (error) {
          console.error('Error deleting from Supabase:', error)
        }
      }

      return true
    } catch (error) {
      console.error('Error deleting expenditure:', error)
      return false
    }
  }
} 