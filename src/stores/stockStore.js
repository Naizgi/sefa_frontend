import { defineStore } from 'pinia'
import { stockService } from '@/services/stockService'

export const useStockStore = defineStore('stock', {
  state: () => ({
    stockData: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchStock(branchId, lowStock = false) {
      this.loading = true
      try {
        this.stockData = await stockService.getBranchStock(branchId, lowStock)
        this.error = null
      } catch (error) {
        this.error = error.response?.data?.detail || 'Failed to fetch stock'
      } finally {
        this.loading = false
      }
    },

    async addStock(branchId, productId, quantity) {
      try {
        await stockService.addStock(branchId, productId, quantity)
        await this.fetchStock(branchId)
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Failed to add stock' 
        }
      }
    },
  },
})