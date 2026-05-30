import { defineStore } from 'pinia'
import { productService } from '@/services/productService'

export const useProductStore = defineStore('products', {
  state: () => ({
    products: [],
    loading: false,
    error: null,
  }),

  actions: {
    async fetchProducts(params = {}) {
      this.loading = true
      try {
        this.products = await productService.getProducts(params)
        this.error = null
      } catch (error) {
        this.error = error.response?.data?.detail || 'Failed to fetch products'
      } finally {
        this.loading = false
      }
    },

    async createProduct(data) {
      try {
        const product = await productService.createProduct(data)
        this.products.push(product)
        return { success: true, data: product }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Failed to create product' 
        }
      }
    },

    async updateProduct(id, data) {
      try {
        const product = await productService.updateProduct(id, data)
        const index = this.products.findIndex(p => p.id === id)
        if (index !== -1) this.products[index] = product
        return { success: true, data: product }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Failed to update product' 
        }
      }
    },

    async deleteProduct(id) {
      try {
        await productService.deleteProduct(id)
        this.products = this.products.filter(p => p.id !== id)
        return { success: true }
      } catch (error) {
        return { 
          success: false, 
          error: error.response?.data?.detail || 'Failed to delete product' 
        }
      }
    },
  },
})