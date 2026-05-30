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
    isAdmin: (state) => state.user?.role === 'admin',
    isSalesman: (state) => state.user?.role === 'salesman',
    isCashier: (state) => state.user?.role === 'cashier',
    userName: (state) => state.user?.name || state.user?.username || state.user?.email || 'Guest',
    userRole: (state) => state.user?.role || '',
    userBranchId: (state) => state.user?.branch_id,
  },

  actions: {
    async initializeAuth() {
      console.log('🔄 Initializing auth...')
      if (this.isInitialized) {
        console.log('⚠️ Auth already initialized')
        return
      }

      this.loading = true
      try {
        const storedToken = localStorage.getItem('token')
        const storedUser = localStorage.getItem('user')

        if (storedToken && storedUser) {
          this.token = storedToken
          this.user = JSON.parse(storedUser)

          // 🔑 Set Axios default Authorization header
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          console.log('✅ Axios default Authorization set on init')

          console.log('✅ Auth restored from localStorage')
        } else {
          console.log('⚠️ No auth data found')
        }

        this.isInitialized = true
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
        // Use URLSearchParams for x-www-form-urlencoded
        const params = new URLSearchParams()
        params.append('username', email)
        params.append('password', password)

        console.log('📡 Sending login request to /api/auth/token')
        
        const response = await api.post('/auth/token', params, {
          headers: { 
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        })

        console.log('📦 Response status:', response.status)
        console.log('📦 Has access_token:', !!response.data?.access_token)

        if (response.data && response.data.access_token) {
          this.token = response.data.access_token
          localStorage.setItem('token', this.token)

          // 🔑 Set Axios default header
          api.defaults.headers.common['Authorization'] = `Bearer ${this.token}`
          console.log('✅ Token stored and Axios header set')

          // Fetch current user info
          const userData = await this.fetchCurrentUser()
          console.log('✅ Login successful, user:', userData)

          this.isInitialized = true
          return { success: true }
        } else {
          console.error('No access_token in response:', response.data)
          throw new Error('Invalid response from server')
        }
      } catch (error) {
        console.error('❌ Login failed:', error)
        console.error('Error details:', error.response?.data)
        
        const errorMessage = error.response?.data?.detail || 
                             error.response?.data?.message || 
                             error.message || 
                             'Invalid email or password'
        this.error = errorMessage
        return { success: false, error: errorMessage }
      } finally {
        this.loading = false
      }
    },

    async fetchCurrentUser() {
      try {
        console.log('📡 Fetching current user from /api/auth/me')
        const response = await api.get('/auth/me')
        
        console.log('📦 User response:', response.data)

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
          console.log('Token expired, logging out')
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
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
  }
})