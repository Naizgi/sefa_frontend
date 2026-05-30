// stores/userStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/services/userService'

export const useUserStore = defineStore('user', () => {
  // State
  const users = ref([])
  const currentUser = ref(null)
  const loading = ref(false)
  const error = ref(null)

  // Actions
  const fetchUsers = async (params = {}) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await userService.getUsers(params)
      users.value = response // Backend returns array directly
      return { success: true, data: users.value }
    } catch (err) {
      console.error('Failed to fetch users:', err)
      error.value = err.response?.data?.detail || err.message || 'Failed to fetch users'
      users.value = []
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const fetchUser = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await userService.getUser(id)
      currentUser.value = response
      return { success: true, data: currentUser.value }
    } catch (err) {
      console.error('Failed to fetch user:', err)
      error.value = err.response?.data?.detail || err.message || 'Failed to fetch user'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const createUser = async (userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await userService.createUser(userData)
      const newUser = response
      
      // Add to users list
      users.value.push(newUser)
      
      return { success: true, data: newUser }
    } catch (err) {
      console.error('Failed to create user:', err)
      error.value = err.response?.data?.detail || err.message || 'Failed to create user'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateUser = async (id, userData) => {
    loading.value = true
    error.value = null
    
    try {
      const response = await userService.updateUser(id, userData)
      const updatedUser = response
      
      // Update in users list
      const index = users.value.findIndex(u => u.id === id)
      if (index !== -1) {
        users.value[index] = updatedUser
      }
      
      // Update current user if it's the same
      if (currentUser.value?.id === id) {
        currentUser.value = updatedUser
      }
      
      return { success: true, data: updatedUser }
    } catch (err) {
      console.error('Failed to update user:', err)
      error.value = err.response?.data?.detail || err.message || 'Failed to update user'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const deleteUser = async (id) => {
    loading.value = true
    error.value = null
    
    try {
      await userService.deleteUser(id)
      
      // Remove from users list
      users.value = users.value.filter(u => u.id !== id)
      
      return { success: true }
    } catch (err) {
      console.error('Failed to delete user:', err)
      error.value = err.response?.data?.detail || err.message || 'Failed to delete user'
      return { success: false, error: error.value }
    } finally {
      loading.value = false
    }
  }

  const updateUserStatus = async (id, active) => {
    return await updateUser(id, { active })
  }

  const resetUserPassword = async (id, newPassword) => {
    return await updateUser(id, { password: newPassword })
  }

  // Computed getters
  const activeUsers = () => users.value.filter(u => u.active).length
  const adminCount = () => users.value.filter(u => u.role === 'admin').length
  const salesmanCount = () => users.value.filter(u => u.role === 'salesman').length

  const resetStore = () => {
    users.value = []
    currentUser.value = null
    loading.value = false
    error.value = null
  }

  return {
    // State
    users,
    currentUser,
    loading,
    error,
    
    // Actions
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    updateUserStatus,
    resetUserPassword,
    resetStore,
    
    // Getters
    activeUsers,
    adminCount,
    salesmanCount
  }
})