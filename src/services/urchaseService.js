import api from './api'

export const purchaseService = {
  // Legacy purchases
  getPurchases: (params) => api.get('/purchases', { params }),
  createPurchase: (data) => api.post('/purchases', data),
  
  // Purchase Orders
  getPurchaseOrders: (params) => api.get('/purchases/orders', { params }),
  getPurchaseOrder: (id) => api.get(`/purchases/orders/${id}`),
  createPurchaseOrder: (data) => api.post('/purchases/orders', data),
  updatePurchaseOrder: (id, data) => api.put(`/purchases/orders/${id}`, data),
  receivePurchaseOrder: (id, data) => api.post(`/purchases/orders/${id}/receive`, data),
  
  // Reports
  getPurchaseReport: (params) => api.get('/reports/purchases', { params })
}