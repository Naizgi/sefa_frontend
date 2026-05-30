<template>
  <div class="loans-container">
    <!-- Header Section -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('loans.title') }}</h1>
        <p class="page-subtitle">{{ $t('loans.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button @click="$router.push('/sales/loans/create')" class="btn-primary">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('loans.newLoan') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card glass-card">
      <div class="filters">
        <div class="filter-group">
          <svg class="filter-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input 
            v-model="filters.customer_name" 
            :placeholder="$t('loans.searchCustomer')"
            class="search-input"
            @input="loadLoans"
          />
        </div>
        <div class="filter-group">
          <select v-model="filters.status" class="status-filter" @change="loadLoans">
            <option value="">{{ $t('loans.allStatus') }}</option>
            <option value="active">{{ $t('loans.active') }}</option>
            <option value="partially_paid">{{ $t('loans.partiallyPaid') }}</option>
            <option value="settled">{{ $t('loans.settled') }}</option>
          </select>
        </div>
        <button @click="showOverdueOnly = !showOverdueOnly" class="btn-warning" v-if="showOverdueOnly">
          {{ $t('loans.showAll') }}
        </button>
        <button @click="showOverdueOnly = true" class="btn-outline" v-else>
          {{ $t('loans.showOverdueOnly') }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('loans.loadingLoans') }}</p>
    </div>

    <!-- Summary Cards -->
    <div v-else class="summary-cards">
      <div class="summary-card">
        <div class="card-icon">💰</div>
        <div class="card-info">
          <h3>{{ $t('loans.totalOutstanding') }}</h3>
          <p>{{ formatCurrency(totalOutstanding) }}</p>
        </div>
      </div>
      <div class="summary-card">
        <div class="card-icon">📊</div>
        <div class="card-info">
          <h3>{{ $t('loans.activeLoans') }}</h3>
          <p>{{ activeLoansCount }}</p>
        </div>
      </div>
      <div class="summary-card warning">
        <div class="card-icon">⚠️</div>
        <div class="card-info">
          <h3>{{ $t('loans.overdueLoans') }}</h3>
          <p>{{ overdueLoansCount }}</p>
        </div>
      </div>
    </div>

    <!-- Loans Table -->
    <div class="table-container glass-card">
      <div class="table-header">
        <h3 class="table-title">{{ $t('loans.customerLoans') }}</h3>
        <span class="table-count">{{ loans.length }} {{ $t('loans.loans') }}</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('loans.loanNumber') }}</th>
              <th>{{ $t('loans.customer') }}</th>
              <th>{{ $t('loans.loanDate') }}</th>
              <th>{{ $t('loans.dueDate') }}</th>
              <th>{{ $t('loans.totalAmount') }}</th>
              <th>{{ $t('loans.paid') }}</th>
              <th>{{ $t('loans.balance') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="loan in loans" :key="loan.id" class="loan-row">
              <td>{{ loan.loan_number }}</td>
              <td>
                <strong>{{ loan.customer_name }}</strong>
                <div class="customer-phone" v-if="loan.customer_phone">{{ loan.customer_phone }}</div>
              </td>
              <td>{{ formatDate(loan.loan_date) }}</td>
              <td :class="{ 'overdue-date': isOverdue(loan.due_date) && (Number(loan.remaining_amount) || 0) > 0 }">
                {{ formatDate(loan.due_date) }}
              </td>
              <td>{{ formatCurrency(loan.total_amount) }}</td>
              <td>{{ formatCurrency(loan.paid_amount) }}</td>
              <td class="balance">{{ formatCurrency(loan.remaining_amount) }}</td>
              <td>
                <span :class="getStatusClass(loan.status)" class="status-badge">
                  {{ getStatusText(loan.status) }}
                </span>
              </td>
              <td>
                <button @click="viewLoan(loan)" class="icon-btn" :title="$t('loans.viewDetails')">
                  <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button 
                  v-if="(Number(loan.remaining_amount) || 0) > 0" 
                  @click="recordPayment(loan)" 
                  class="icon-btn success"
                  :title="$t('loans.recordPayment')"
                >
                  <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="loans.length === 0">
              <td colspan="9" class="empty-table">
                <svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p>{{ $t('loans.noLoans') }}</p>
                <button @click="$router.push('/sales/loans/create')" class="btn-primary-sm">{{ $t('loans.createNewLoan') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ $t('loans.recordPayment') }}</h2>
          <button @click="showPaymentModal = false" class="modal-close">
            <svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="loan-info">
            <div>{{ $t('loans.customer') }}: <strong>{{ selectedLoan?.customer_name }}</strong></div>
            <div>{{ $t('loans.loanNumber') }}: <strong>{{ selectedLoan?.loan_number }}</strong></div>
            <div>{{ $t('loans.remainingBalance') }}: <strong class="balance-amount">{{ formatCurrency(selectedLoan?.remaining_amount) }}</strong></div>
          </div>
          <div class="form-group">
            <label>{{ $t('loans.paymentAmount') }}</label>
            <input 
              type="number" 
              v-model="payment.amount" 
              :max="Number(selectedLoan?.remaining_amount) || 0"
              step="0.01"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('loans.paymentMethod') }}</label>
            <select v-model="payment.payment_method" class="form-select">
              <option value="cash">{{ $t('pos.cash') }}</option>
              <option value="ticket">{{ $t('loans.ticket') }}</option>
              <option value="coupon">{{ $t('loans.coupon') }}</option>
            </select>
          </div>
          <div class="form-group">
            <label>{{ $t('loans.referenceNumber') }}</label>
            <input v-model="payment.reference_number" class="form-input" :placeholder="$t('loans.referencePlaceholder')" />
          </div>
          <div class="form-group">
            <label>{{ $t('common.notes') }}</label>
            <textarea v-model="payment.notes" rows="2" class="form-textarea" :placeholder="$t('loans.notesPlaceholder')"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="submitPayment" class="btn-primary">{{ $t('loans.recordPayment') }}</button>
          <button @click="showPaymentModal = false" class="btn-secondary">{{ $t('common.cancel') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatCurrency, formatDate } from '@/utils/format'

const router = useRouter()
const { t } = useI18n()
const loading = ref(false)
const loans = ref([])
const filters = ref({ customer_name: '', status: '' })
const showOverdueOnly = ref(false)
const showPaymentModal = ref(false)
const selectedLoan = ref(null)
const payment = ref({
  amount: 0,
  payment_method: 'cash',
  reference_number: '',
  notes: ''
})

const getNumberValue = (value) => {
  if (value === null || value === undefined) return 0
  const num = Number(value)
  return isNaN(num) ? 0 : num
}

const totalOutstanding = computed(() => {
  return loans.value.reduce((sum, loan) => {
    const remaining = getNumberValue(loan.remaining_amount)
    return sum + remaining
  }, 0)
})

const activeLoansCount = computed(() => {
  return loans.value.filter(l => l.status === 'active' || l.status === 'partially_paid').length
})

const overdueLoansCount = computed(() => {
  return loans.value.filter(l => {
    const remaining = getNumberValue(l.remaining_amount)
    return isOverdue(l.due_date) && remaining > 0
  }).length
})

const isOverdue = (dueDate) => {
  if (!dueDate) return false
  return new Date(dueDate) < new Date()
}

const getStatusClass = (status) => {
  const classes = { active: 'status-active', partially_paid: 'status-partial', settled: 'status-settled' }
  return classes[status] || 'status-active'
}

const getStatusText = (status) => {
  const texts = { active: t('loans.active'), partially_paid: t('loans.partiallyPaid'), settled: t('loans.settled') }
  return texts[status] || status
}

const loadLoans = async () => {
  loading.value = true
  try {
    let params = { ...filters.value }
    const response = await api.get('/loans', { params })
    let loanData = response.data || []
    
    loanData = loanData.map(loan => ({
      ...loan,
      total_amount: getNumberValue(loan.total_amount),
      paid_amount: getNumberValue(loan.paid_amount),
      remaining_amount: getNumberValue(loan.remaining_amount)
    }))
    
    if (showOverdueOnly.value) {
      loanData = loanData.filter(loan => {
        const remaining = getNumberValue(loan.remaining_amount)
        return isOverdue(loan.due_date) && remaining > 0
      })
    }
    
    loans.value = loanData
  } catch (error) {
    console.error('Failed to load loans:', error)
  } finally {
    loading.value = false
  }
}

const viewLoan = (loan) => {
  router.push(`/sales/loans/${loan.id}`)
}

const recordPayment = (loan) => {
  selectedLoan.value = loan
  payment.value = {
    amount: getNumberValue(loan.remaining_amount),
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  }
  showPaymentModal.value = true
}

const submitPayment = async () => {
  const amount = getNumberValue(payment.value.amount)
  const remaining = getNumberValue(selectedLoan.value.remaining_amount)
  
  if (amount <= 0) {
    alert(t('loans.validAmount'))
    return
  }
  
  try {
    if (amount >= remaining) {
      await api.post(`/loans/${selectedLoan.value.id}/settle`, {
        amount: amount,
        payment_method: payment.value.payment_method,
        reference_number: payment.value.reference_number,
        notes: payment.value.notes
      })
    } else {
      await api.post(`/loans/${selectedLoan.value.id}/payments`, {
        amount: amount,
        payment_method: payment.value.payment_method,
        reference_number: payment.value.reference_number,
        notes: payment.value.notes
      })
    }
    
    showPaymentModal.value = false
    await loadLoans()
    alert(t('loans.paymentRecorded'))
  } catch (error) {
    console.error('Failed to record payment:', error)
    alert(error.response?.data?.detail || t('loans.paymentFailed'))
  }
}

onMounted(() => {
  loadLoans()
})
</script>

<style scoped>
.loans-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.btn-svg-icon {
  width: 16px;
  height: 16px;
}

.filter-svg-icon {
  width: 16px;
  height: 16px;
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6E8B90;
}

.action-svg-icon {
  width: 16px;
  height: 16px;
}

.empty-svg-icon {
  width: 64px;
  height: 64px;
  margin-bottom: 1rem;
  color: #cbd5e0;
}

.modal-close-svg {
  width: 18px;
  height: 18px;
}

/* Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #6E8B90;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

/* Filters Card */
.filters-card {
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.filter-group {
  position: relative;
  flex: 1;
  min-width: 200px;
}

.search-input, .status-filter {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
}

.btn-warning {
  padding: 0.75rem 1.5rem;
  background: #fef5e7;
  color: #f39c12;
  border: 1px solid #f39c12;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
}

.btn-outline {
  padding: 0.75rem 1.5rem;
  background: white;
  color: #6E8B90;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(47, 184, 166, 0.2);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.summary-card.warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.card-icon {
  font-size: 2rem;
}

.card-info h3 {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
}

.card-info p {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

/* Table Container */
.table-container {
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.table-count {
  font-size: 0.8rem;
  color: #6E8B90;
  background: rgba(110, 139, 144, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 1rem;
  background: rgba(47, 184, 166, 0.05);
  color: #4a5568;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
}

.customer-phone {
  font-size: 0.7rem;
  color: #6E8B90;
  margin-top: 0.25rem;
}

.overdue-date {
  color: #ef4444;
  font-weight: 600;
}

.balance {
  font-weight: 600;
  color: #ef4444;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
  display: inline-block;
}

.status-active {
  background: #e3f2fd;
  color: #2196f3;
}

.status-partial {
  background: #fef5e7;
  color: #f39c12;
}

.status-settled {
  background: #e8f5e9;
  color: #4caf50;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #6E8B90;
}

.icon-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.icon-btn.success {
  color: #4caf50;
}

.empty-table {
  text-align: center;
  padding: 3rem !important;
}

.btn-primary-sm {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A2A2E;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1rem 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.loan-info {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.loan-info div {
  margin-bottom: 0.25rem;
}

.balance-amount {
  color: #ef4444;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 0.9rem;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .loans-container {
    padding: 0.5rem;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .data-table {
    font-size: 0.85rem;
  }
  
  .data-table th, .data-table td {
    padding: 0.75rem;
  }
}
</style>