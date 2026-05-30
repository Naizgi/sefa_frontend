// stores/authStore.js
import { defineStore } from 'pinia'
import api from '@/services/api'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
    isInitialized: false,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => {
      const isAuth = !!(state.token && state.user)
      console.log('🔐 isAuthenticated check:', isAuth, 'token:', !!state.token, 'user:', !!state.user)
      return isAuth
    },
    isAdmin: (state) => {
      const isAdminRole = state.user?.role === 'admin'
      console.log('👑 isAdmin getter:', isAdminRole, 'user role:', state.user?.role)
      return isAdminRole
    },
    isSalesman: (state) => state.user?.role === 'salesman',
    isCashier: (state) => state.user?.role === 'cashier',
    userName: (state) => state.user?.name || state.user?.username || state.user?.email || 'Guest',
    userRole: (state) => state.user?.role || '',
    userBranchId: (state) => state.user?.branch_id,
  },

  actions: {
    async initializeAuth() {
      console.log('🔄 Initializing auth...')
      
      // Prevent multiple initializations
      if (this.isInitialized) {
        console.log('⚠️ Auth already initialized')
        return
      }
      
      this.loading = true
      
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')
        
        console.log('Stored token exists:', !!storedToken)
        console.log('Stored user exists:', !!storedUser)
        
        if (storedToken && storedUser) {
          this.token = storedToken
          this.user = JSON.parse(storedUser)
          console.log('✅ Auth restored from localStorage')
          console.log('User role:', this.user?.role)
        } else {
          console.log('⚠️ No auth data found')
        }
        
        this.isInitialized = true
        console.log('✅ Auth initialization complete, isAuthenticated:', this.isAuthenticated)
      } catch (error) {
        console.error('❌ Auth initialization failed:', error)
        this.isInitialized = true
      } finally {
        this.loading = false
      }
    },

    async login(email, password) {
      console.log('🔑 Login attempt:', email)
      this.loading = true
      this.error = null
      
      try {
        const formData = new FormData()
        formData.append('username', email)
        formData.append('password', password)
        
        console.log('📡 Sending login request to /api/auth/token')
        const response = await api.post('/auth/token', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        
        console.log('Login response received')
        
        if (response.data.access_token) {
          this.token = response.data.access_token
          localStorage.setItem('token', this.token)
          console.log('✅ Token stored')
          
          // Fetch user data from /me endpoint
          await this.fetchCurrentUser()
          
          console.log('✅ Login successful, user:', this.user)
          console.log('✅ User role:', this.user?.role)
          
          // Ensure initialized flag is true
          this.isInitialized = true
          
          return { success: true }
        } else {
          throw new Error('Invalid response from server')
        }
        
      } catch (error) {
        console.error('❌ Login failed:', error)
        
        const errorMessage = error.response?.data?.detail || 
                            error.response?.data?.message || 
                            error.message || 
                            'Invalid email or password'
        
        this.error = errorMessage
        
        return { 
          success: false, 
          error: errorMessage 
        }
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      try {
        console.log('📡 Fetching current user from /api/auth/me')
        const response = await api.get('/auth/me')
        console.log('Current user response:', response.data)
        
        const userData = {
          id: response.data.id,
          name: response.data.name,
          username: response.data.username || response.data.email,
          email: response.data.email,
          role: response.data.role,
          branch_id: response.data.branch_id,
          active: response.data.active
        }
        
        this.user = userData
        localStorage.setItem('user', JSON.stringify(userData))
        console.log('✅ User data stored:', userData)
        
        return userData
      } catch (error) {
        console.error('❌ Failed to fetch current user:', error)
        if (error.response?.status === 401) {
          this.logout()
        }
        throw error
      }
    },

    async logout() {
      console.log('🚪 Logging out...')
      this.token = null
      this.user = null
      this.error = null
      this.isInitialized = false
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
  }
})