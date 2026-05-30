<template>
  <div class="damaged-goods-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">Damaged Goods Management</h1>
        <p class="page-subtitle">Track and manage damaged inventory</p>
      </div>
      <div class="header-actions">
        <button @click="openCreateModal" class="btn-primary">
          <i class="fas fa-plus"></i> Report Damaged Goods
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in statsData" :key="stat.label">
        <div class="stat-icon" :class="stat.iconClass">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-label">{{ stat.label }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card glass-card">
      <div class="filters">
        <select v-model="filters.status" class="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="processed">Processed</option>
          <option value="rejected">Rejected</option>
        </select>
        <input type="date" v-model="filters.from_date" class="date-input" />
        <input type="date" v-model="filters.to_date" class="date-input" />
        <button @click="fetchReports" class="btn-primary">Search</button>
        <button @click="resetFilters" class="btn-secondary">Reset</button>
      </div>
    </div>

    <!-- Reports Table -->
    <div class="table-container glass-card">
      <div class="table-header">
        <h3>Damaged Goods Reports</h3>
        <span class="table-count">{{ reports.length }} reports</span>
      </div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>Report #</th>
              <th>Date</th>
              <th>Product</th>
              <th>Quantity</th>
              <th>Reason</th>
              <th>Reported By</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="report in reports" :key="report.id">
              <td class="report-number">{{ report.report_number }}</td>
              <td>{{ formatDate(report.reported_at) }}</td>
              <td>
                <div class="product-info">
                  <span class="product-name">{{ report.product_name }}</span>
                  <span class="product-sku">{{ report.product_sku }}</span>
                </div>
              </td>
              <td class="quantity-cell">{{ report.quantity }} units</td>
              <td class="reason-cell">{{ report.reason }}</td>
              <td>{{ report.reported_by }}</td>
              <td>
                <span :class="getStatusClass(report.status)" class="status-badge">
                  {{ getStatusText(report.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button @click="viewDetails(report)" class="action-btn view-btn" title="View Details">
                    <i class="fas fa-eye"></i>
                  </button>
                  <button v-if="report.status === 'pending' && isAdmin" @click="approveReport(report)" class="action-btn approve-btn" title="Approve">
                    <i class="fas fa-check"></i>
                  </button>
                  <button v-if="report.status === 'approved' && isAdmin" @click="processReport(report)" class="action-btn process-btn" title="Process & Deduct Stock">
                    <i class="fas fa-boxes"></i>
                  </button>
                  <button v-if="report.status === 'pending' && isAdmin" @click="rejectReport(report)" class="action-btn reject-btn" title="Reject">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Create Report Modal -->
    <div v-if="showCreateModal" class="modal-overlay" @click.self="closeCreateModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>Report Damaged Goods</h2>
          <button @click="closeCreateModal" class="modal-close">&times;</button>
        </div>
        <form @submit.prevent="submitReport" class="modal-form">
          <div class="form-field">
            <label class="form-label">Product *</label>
            <select v-model="form.product_id" class="form-select" required>
              <option value="">Select Product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }} ({{ product.sku }}) - Stock: {{ product.stock_quantity || 0 }}
              </option>
            </select>
          </div>
          <div class="form-field">
            <label class="form-label">Quantity *</label>
            <input type="number" v-model.number="form.quantity" min="1" step="1" class="form-input" required />
            <small class="form-hint">Maximum available: {{ maxAvailableStock }}</small>
          </div>
          <div class="form-field">
            <label class="form-label">Reason for Damage *</label>
            <textarea v-model="form.reason" rows="3" class="form-textarea" required placeholder="Describe the damage..."></textarea>
          </div>
          <div class="form-field">
            <label class="form-label">Additional Notes</label>
            <textarea v-model="form.notes" rows="2" class="form-textarea" placeholder="Any additional information..."></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeCreateModal" class="btn-secondary">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="submitting">
              <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Details Modal -->
    <div v-if="showDetailsModal" class="modal-overlay modal-large" @click.self="closeDetailsModal">
      <div class="modal-container modal-large-container">
        <div class="modal-header">
          <h2>Damaged Goods Report Details</h2>
          <button @click="closeDetailsModal" class="modal-close">&times;</button>
        </div>
        <div class="details-content" v-if="selectedReport">
          <div class="details-grid">
            <div class="detail-item">
              <label>Report Number:</label>
              <span>{{ selectedReport.report_number }}</span>
            </div>
            <div class="detail-item">
              <label>Date Reported:</label>
              <span>{{ formatDate(selectedReport.reported_at) }}</span>
            </div>
            <div class="detail-item">
              <label>Branch:</label>
              <span>{{ selectedReport.branch_name || 'N/A' }}</span>
            </div>
            <div class="detail-item">
              <label>Product:</label>
              <span>{{ selectedReport.product_name }} ({{ selectedReport.product_sku }})</span>
            </div>
            <div class="detail-item">
              <label>Quantity:</label>
              <span class="quantity-highlight">{{ selectedReport.quantity }} units</span>
            </div>
            <div class="detail-item">
              <label>Reason:</label>
              <span>{{ selectedReport.reason }}</span>
            </div>
            <div class="detail-item full-width">
              <label>Notes:</label>
              <span>{{ selectedReport.notes || 'No additional notes' }}</span>
            </div>
            <div class="detail-item">
              <label>Reported By:</label>
              <span>{{ selectedReport.reported_by }}</span>
            </div>
            <div class="detail-item">
              <label>Status:</label>
              <span :class="getStatusClass(selectedReport.status)" class="status-badge">
                {{ getStatusText(selectedReport.status) }}
              </span>
            </div>
            <div class="detail-item" v-if="selectedReport.approved_by">
              <label>Approved By:</label>
              <span>{{ selectedReport.approved_by }}</span>
            </div>
            <div class="detail-item" v-if="selectedReport.approved_at">
              <label>Approved At:</label>
              <span>{{ formatDate(selectedReport.approved_at) }}</span>
            </div>
            <div class="detail-item" v-if="selectedReport.processed_by">
              <label>Processed By:</label>
              <span>{{ selectedReport.processed_by }}</span>
            </div>
            <div class="detail-item" v-if="selectedReport.processed_at">
              <label>Processed At:</label>
              <span>{{ formatDate(selectedReport.processed_at) }}</span>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="closeDetailsModal" class="btn-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.user?.role === 'admin')

const reports = ref([])
const products = ref([])
const loading = ref(false)
const submitting = ref(false)
const showCreateModal = ref(false)
const showDetailsModal = ref(false)
const selectedReport = ref(null)

const filters = ref({
  status: '',
  from_date: '',
  to_date: ''
})

const form = ref({
  product_id: '',
  quantity: 1,
  reason: '',
  notes: ''
})

const statsData = ref([
  { label: 'Total Reports', value: '0', icon: 'fas fa-file-alt', iconClass: 'bg-blue-100 text-blue-600' },
  { label: 'Pending', value: '0', icon: 'fas fa-clock', iconClass: 'bg-yellow-100 text-yellow-600' },
  { label: 'Approved', value: '0', icon: 'fas fa-check-circle', iconClass: 'bg-green-100 text-green-600' },
  { label: 'Processed', value: '0', icon: 'fas fa-boxes', iconClass: 'bg-purple-100 text-purple-600' }
])

const maxAvailableStock = computed(() => {
  const product = products.value.find(p => p.id === form.value.product_id)
  return product?.stock_quantity || 0
})

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleString()
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    approved: 'status-approved',
    processed: 'status-processed',
    rejected: 'status-rejected'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    approved: 'Approved',
    processed: 'Processed',
    rejected: 'Rejected'
  }
  return texts[status] || status
}

const fetchProducts = async () => {
  try {
    const response = await api.get('/products', { params: { active: true } })
    products.value = response.data || []
  } catch (error) {
    console.error('Failed to fetch products:', error)
  }
}

const fetchReports = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.from_date) params.from_date = filters.value.from_date
    if (filters.value.to_date) params.to_date = filters.value.to_date
    
    const response = await api.get('/damaged-goods/reports', { params })
    reports.value = response.data || []
    
    // Update stats
    const pending = reports.value.filter(r => r.status === 'pending').length
    const approved = reports.value.filter(r => r.status === 'approved').length
    const processed = reports.value.filter(r => r.status === 'processed').length
    
    statsData.value = [
      { ...statsData.value[0], value: reports.value.length },
      { ...statsData.value[1], value: pending },
      { ...statsData.value[2], value: approved },
      { ...statsData.value[3], value: processed }
    ]
  } catch (error) {
    console.error('Failed to fetch reports:', error)
  } finally {
    loading.value = false
  }
}

const fetchStats = async () => {
  try {
    const response = await api.get('/damaged-goods/summary/stats')
    const data = response.data
    if (data && data.summary) {
      statsData.value = [
        { ...statsData.value[0], value: data.summary.total_reports || 0 },
        { ...statsData.value[1], value: data.summary.pending || 0 },
        { ...statsData.value[2], value: data.summary.approved || 0 },
        { ...statsData.value[3], value: data.summary.processed || 0 }
      ]
    }
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
}

const openCreateModal = () => {
  form.value = { product_id: '', quantity: 1, reason: '', notes: '' }
  showCreateModal.value = true
}

const closeCreateModal = () => {
  showCreateModal.value = false
}

const submitReport = async () => {
  if (!form.value.product_id || !form.value.quantity || !form.value.reason) {
    alert('Please fill all required fields')
    return
  }
  
  submitting.value = true
  try {
    await api.post('/damaged-goods/reports', form.value)
    alert('Damaged goods report submitted successfully')
    closeCreateModal()
    await fetchReports()
    await fetchStats()
  } catch (error) {
    alert(error.response?.data?.detail || 'Failed to submit report')
  } finally {
    submitting.value = false
  }
}

const viewDetails = (report) => {
  selectedReport.value = report
  showDetailsModal.value = true
}

const closeDetailsModal = () => {
  showDetailsModal.value = false
  selectedReport.value = null
}

const approveReport = async (report) => {
  if (!confirm(`Approve damaged goods report for ${report.product_name}?`)) return
  
  try {
    await api.post(`/damaged-goods/${report.id}/approve`, { approved: true })
    alert('Report approved')
    await fetchReports()
    await fetchStats()
  } catch (error) {
    alert(error.response?.data?.detail || 'Failed to approve report')
  }
}

const rejectReport = async (report) => {
  const reason = prompt('Reason for rejection:')
  if (reason === null) return
  
  try {
    await api.post(`/damaged-goods/${report.id}/approve`, { approved: false, notes: reason })
    alert('Report rejected')
    await fetchReports()
    await fetchStats()
  } catch (error) {
    alert(error.response?.data?.detail || 'Failed to reject report')
  }
}

const processReport = async (report) => {
  if (!confirm(`Process this report? This will deduct ${report.quantity} units from stock.`)) return
  
  try {
    await api.post(`/damaged-goods/${report.id}/process`)
    alert('Stock deducted successfully')
    await fetchReports()
    await fetchStats()
    await fetchProducts()
  } catch (error) {
    alert(error.response?.data?.detail || 'Failed to process report')
  }
}

const resetFilters = () => {
  filters.value = { status: '', from_date: '', to_date: '' }
  fetchReports()
}

onMounted(() => {
  fetchProducts()
  fetchReports()
  fetchStats()
})
</script>

<style scoped>
.damaged-goods-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.page-subtitle {
  color: #6E8B90;
  font-size: 14px;
  margin-top: 4px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.bg-blue-100 { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.bg-yellow-100 { background: rgba(245, 158, 11, 0.1); color: #F59E0B; }
.bg-green-100 { background: rgba(16, 185, 129, 0.1); color: #10B981; }
.bg-purple-100 { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.stat-label {
  font-size: 14px;
  color: #6E8B90;
}

.filters-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select, .date-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.table-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.table-count {
  background: #f1f5f9;
  padding: 4px 8px;
  border-radius: 20px;
  font-size: 12px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f8fafc;
  font-weight: 600;
  color: #475569;
}

.report-number {
  font-family: monospace;
  font-weight: 500;
  color: #2FB8A6;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-name {
  font-weight: 500;
}

.product-sku {
  font-size: 11px;
  color: #94a3b8;
  font-family: monospace;
}

.quantity-cell {
  font-weight: 600;
  color: #EF4444;
}

.reason-cell {
  max-width: 250px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.status-badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-pending {
  background: #fef3c7;
  color: #d97706;
}

.status-approved {
  background: #d1fae5;
  color: #059669;
}

.status-processed {
  background: #e0e7ff;
  color: #4f46e5;
}

.status-rejected {
  background: #fee2e2;
  color: #dc2626;
}

.actions-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.view-btn {
  background: #e2e8f0;
  color: #475569;
}

.approve-btn {
  background: #d1fae5;
  color: #059669;
}

.process-btn {
  background: #e0e7ff;
  color: #4f46e5;
}

.reject-btn {
  background: #fee2e2;
  color: #dc2626;
}

.action-btn:hover {
  transform: scale(1.05);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 16px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-large-container {
  max-width: 700px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #94a3b8;
}

.modal-form, .details-content {
  padding: 20px;
}

.form-field {
  margin-bottom: 16px;
}

.form-label {
  display: block;
  margin-bottom: 6px;
  font-weight: 500;
  color: #334155;
}

.form-select, .form-input, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.form-hint {
  display: block;
  font-size: 11px;
  color: #94a3b8;
  margin-top: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: span 2;
}

.detail-item label {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 500;
}

.detail-item span {
  font-size: 14px;
  color: #1e293b;
}

.quantity-highlight {
  font-weight: 700;
  color: #EF4444;
  font-size: 16px;
}

@media (max-width: 768px) {
  .damaged-goods-container {
    padding: 16px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-select, .date-input {
    width: 100%;
  }
  
  .data-table {
    font-size: 12px;
  }
  
  .data-table th, .data-table td {
    padding: 8px;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .detail-item.full-width {
    grid-column: span 1;
  }
}
</style>