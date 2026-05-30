import api from './api'

export const loanService = {
  // Loans
  getLoans: (params) => api.get('/loans', { params }),
  getLoan: (id) => api.get(`/loans/${id}`),
  createLoan: (data) => api.post('/loans', data),
  updateLoan: (id, data) => api.put(`/loans/${id}`, data),
  
  // Payments
  addPayment: (id, data) => api.post(`/loans/${id}/payments`, data),
  settleLoan: (id, data) => api.post(`/loans/${id}/settle`, data),
  
  // Reports
  getLoanReport: (params) => api.get('/reports/loans', { params }),
  getOverdueLoans: () => api.get('/loans/overdue')
}