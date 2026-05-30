import api from './api'

export const purchaseService = {
  // Purchase Orders
  getPurchaseOrders: (params) => api.get('/purchases/orders', { params }),
  getPurchaseOrder: (id) => api.get(`/purchases/orders/${id}`),
  createPurchaseOrder: (data) => api.post('/purchases/orders', data),
  receivePurchaseOrder: (id, data) => api.post(`/purchases/orders/${id}/receive`, data),
  
  // Legacy purchases
  getPurchases: (params) => api.get('/purchases', { params }),
  createPurchase: (data) => api.post('/purchases', data),
  
  // Reports
  getPurchaseReport: (params) => api.get('/reports/purchases', { params })
}