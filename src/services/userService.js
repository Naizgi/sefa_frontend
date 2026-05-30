// services/userService.js
import api from './api'

export const userService = {
  async getUsers(params = {}) {
    console.log('🔍 userService.getUsers called with params:', params)
    console.log('🔍 Current token:', localStorage.getItem('token') ? localStorage.getItem('token').substring(0, 30) + '...' : 'No token')
    
    try {
      const response = await api.get('/users', { params })
      console.log('✅ userService.getUsers response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ userService.getUsers error:', error)
      console.error('❌ Error response:', error.response?.data)
      console.error('❌ Error status:', error.response?.status)
      throw error
    }
  },

  async getUser(id) {
    const response = await api.get(`/users/${id}`)
    return response.data
  },

  async createUser(data) {
    const response = await api.post('/users', data)
    return response.data
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data)
    return response.data
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`)
    return response.data
  },

  async updateUserStatus(id, active) {
    const response = await api.put(`/users/${id}`, { active })
    return response.data
  },

  async resetUserPassword(id, newPassword) {
    const response = await api.put(`/users/${id}`, { password: newPassword })
    return response.data
  }
}

export default userService