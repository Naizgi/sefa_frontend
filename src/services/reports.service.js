import api from './api'

export const reportService = {
  async getSalesReport(reportType, branchId = null) {
    const params = { report_type: reportType }
    if (branchId) params.branch_id = branchId
    const response = await api.get('/reports/sales', { params })
    return response.data
  },

  async getDashboard() {
    const response = await api.get('/dashboard')
    return response.data
  }
}