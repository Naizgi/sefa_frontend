import { defineStore } from 'pinia'
import { salesService } from '@/services/salesService'

export const useSalesStore = defineStore('sales', {
  state: () => ({
    sales: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchSales(params = {}) {
      this.loading = true
      try {
        this.sales = await salesService.getSales(params)
        this.error = null
      } catch (error) {
        this.error = error.response?.data?.detail || 'Failed to fetch sales'
      } finally {
        this.loading = false
      }
    },

    async createSale(data) {
      try {
        const sale = await salesService.createSale(data)
        this.sales.unshift(sale)
        return { success: true, data: sale }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Failed to create sale' 
        }
      }
    },
  },
})