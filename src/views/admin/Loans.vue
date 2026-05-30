<template>
  <div class="loans-container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('loans.adminTitle') }}</h1>
      <div class="header-actions">
        <button @click="$router.push('/loans/create')" class="btn-primary">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" /></svg>
          {{ $t('loans.newLoan') }}
        </button>
        <button @click="exportLoans" class="btn-secondary">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          {{ $t('common.export') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters-card glass-card">
      <div class="filters">
        <div class="filter-group">
          <svg class="filter-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input v-model="filters.customer_name" :placeholder="$t('loans.searchCustomer')" class="search-input" @input="loadLoans" />
        </div>
        <div class="filter-group">
          <select v-model="filters.status" class="status-filter" @change="loadLoans">
            <option value="">{{ $t('loans.allStatus') }}</option>
            <option value="active">{{ $t('loans.active') }}</option>
            <option value="partially_paid">{{ $t('loans.partiallyPaid') }}</option>
            <option value="settled">{{ $t('loans.settled') }}</option>
            <option value="overdue">{{ $t('loans.overdue') }}</option>
          </select>
        </div>
        <button @click="showOverdueOnly = !showOverdueOnly" class="btn-warning" v-if="showOverdueOnly">{{ $t('loans.showAll') }}</button>
        <button @click="showOverdueOnly = true" class="btn-outline" v-else>{{ $t('loans.showOverdueOnly') }}</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state"><div class="spinner"></div><p>{{ $t('loans.loadingLoans') }}</p></div>

    <!-- Summary Cards -->
    <div v-else class="summary-cards">
      <div class="summary-card"><div class="card-icon">💰</div><div class="card-info"><h3>{{ $t('loans.totalOutstanding') }}</h3><p>{{ formatCurrency(totalOutstanding) }}</p></div></div>
      <div class="summary-card"><div class="card-icon">📊</div><div class="card-info"><h3>{{ $t('loans.activeLoans') }}</h3><p>{{ activeLoansCount }}</p></div></div>
      <div class="summary-card warning"><div class="card-icon">⚠️</div><div class="card-info"><h3>{{ $t('loans.overdueLoans') }}</h3><p>{{ overdueLoansCount }}</p></div></div>
      <div class="summary-card success"><div class="card-icon">✅</div><div class="card-info"><h3>{{ $t('loans.settledLoans') }}</h3><p>{{ settledLoansCount }}</p></div></div>
    </div>

    <!-- Loans Table -->
    <div class="table-container glass-card">
      <div class="table-header"><h3 class="table-title">{{ $t('loans.customerLoans') }}</h3><span class="table-count">{{ loans.length }} {{ $t('loans.loans') }}</span></div>
      <div class="overflow-x-auto">
        <table class="data-table">
          <thead><tr><th>{{ $t('loans.loanNumber') }}</th><th>{{ $t('loans.customer') }}</th><th>{{ $t('loans.loanDate') }}</th><th>{{ $t('loans.dueDate') }}</th><th>{{ $t('loans.totalAmount') }}</th><th>{{ $t('loans.paid') }}</th><th>{{ $t('loans.balance') }}</th><th>{{ $t('common.status') }}</th><th>{{ $t('common.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="loan in loans" :key="loan.id" class="loan-row">
              <td>{{ loan.loan_number }}</td>
              <td><strong>{{ loan.customer_name }}</strong><div class="customer-phone" v-if="loan.customer_phone">{{ loan.customer_phone }}</div></td>
              <td>{{ formatDate(loan.loan_date) }}</td>
              <td :class="{ 'overdue-date': isOverdue(loan.due_date) && getNumberValue(loan.remaining_amount) > 0 }">{{ formatDate(loan.due_date) }}</td>
              <td>{{ formatCurrency(loan.total_amount) }}</td>
              <td>{{ formatCurrency(loan.paid_amount) }}</td>
              <td class="balance">{{ formatCurrency(loan.remaining_amount) }}</td>
              <td><span :class="getStatusClass(loan.status)" class="status-badge">{{ getStatusText(loan.status) }}</span></td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <button @click="viewLoan(loan)" class="action-btn view" :title="$t('common.view')"><svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg></button>
                  <button v-if="getNumberValue(loan.remaining_amount) > 0" @click="recordPayment(loan)" class="action-btn payment" :title="$t('loans.recordPayment')"><svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                  <button v-if="getNumberValue(loan.remaining_amount) > 0" @click="settleLoan(loan)" class="action-btn settle" :title="$t('loans.settleLoan')"><svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></button>
                </div>
              </td>
            </tr>
            <tr v-if="loans.length === 0"><td colspan="9" class="empty-table"><svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><p>{{ $t('loans.noLoans') }}</p><button @click="$router.push('/loans/create')" class="btn-primary-sm">{{ $t('loans.createNewLoan') }}</button></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal-container">
        <div class="modal-header"><h2>{{ $t('loans.recordPayment') }}</h2><button @click="showPaymentModal = false" class="modal-close"><svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
        <div class="modal-body">
          <div class="loan-info"><div>{{ $t('loans.customer') }}: <strong>{{ selectedLoan?.customer_name }}</strong></div><div>{{ $t('loans.loanNumber') }}: <strong>{{ selectedLoan?.loan_number }}</strong></div><div>{{ $t('loans.remainingBalance') }}: <strong class="balance-amount">{{ formatCurrency(selectedLoan?.remaining_amount) }}</strong></div></div>
          <div class="form-group"><label>{{ $t('loans.paymentAmount') }}</label><input type="number" v-model="payment.amount" :max="getNumberValue(selectedLoan?.remaining_amount)" step="0.01" class="form-input" /></div>
          <div class="form-group"><label>{{ $t('loans.paymentMethod') }}</label><select v-model="payment.payment_method" class="form-select"><option value="cash">{{ $t('pos.cash') }}</option><option value="ticket">{{ $t('loans.ticket') }}</option><option value="coupon">{{ $t('loans.coupon') }}</option><option value="mixed">{{ $t('loans.mixed') }}</option></select></div>
          <div class="form-group"><label>{{ $t('loans.referenceNumber') }}</label><input v-model="payment.reference_number" class="form-input" /></div>
          <div class="form-group"><label>{{ $t('common.notes') }}</label><textarea v-model="payment.notes" rows="3" class="form-textarea"></textarea></div>
        </div>
        <div class="modal-footer"><button @click="submitPayment" class="btn-primary">{{ $t('loans.recordPayment') }}</button><button @click="showPaymentModal = false" class="btn-secondary">{{ $t('common.cancel') }}</button></div>
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
const payment = ref({ amount: 0, payment_method: 'cash', reference_number: '', notes: '' })

const getNumberValue = (v) => { if (v === null || v === undefined) return 0; const n = Number(v); return isNaN(n) ? 0 : n }

const totalOutstanding = computed(() => loans.value.reduce((s, l) => s + getNumberValue(l.remaining_amount), 0))
const activeLoansCount = computed(() => loans.value.filter(l => l.status === 'active' || l.status === 'partially_paid').length)
const overdueLoansCount = computed(() => loans.value.filter(l => { const r = getNumberValue(l.remaining_amount); return isOverdue(l.due_date) && r > 0 }).length)
const settledLoansCount = computed(() => loans.value.filter(l => l.status === 'settled').length)
const isOverdue = (d) => d ? new Date(d) < new Date() : false

const loadLoans = async () => {
  loading.value = true
  try {
    let loanData = (await api.get('/loans', { params: { ...filters.value } })).data || []
    loanData = loanData.map(l => ({ ...l, total_amount: getNumberValue(l.total_amount), paid_amount: getNumberValue(l.paid_amount), remaining_amount: getNumberValue(l.remaining_amount) }))
    if (showOverdueOnly.value) loanData = loanData.filter(l => isOverdue(l.due_date) && getNumberValue(l.remaining_amount) > 0)
    loans.value = loanData
  } catch (e) {} finally { loading.value = false }
}

const viewLoan = (l) => router.push(`/loans/${l.id}`)

const recordPayment = (l) => { selectedLoan.value = l; payment.value = { amount: getNumberValue(l.remaining_amount), payment_method: 'cash', reference_number: '', notes: '' }; showPaymentModal.value = true }
const settleLoan = (l) => { selectedLoan.value = l; payment.value = { amount: getNumberValue(l.remaining_amount), payment_method: 'cash', reference_number: '', notes: t('loans.fullSettlement') }; showPaymentModal.value = true }

const submitPayment = async () => {
  const amount = getNumberValue(payment.value.amount); const remaining = getNumberValue(selectedLoan.value.remaining_amount)
  if (amount <= 0) { alert(t('loans.validAmount')); return }
  try {
    if (amount >= remaining) await api.post(`/loans/${selectedLoan.value.id}/settle`, { amount, payment_method: payment.value.payment_method, reference_number: payment.value.reference_number, notes: payment.value.notes })
    else await api.post(`/loans/${selectedLoan.value.id}/payments`, { amount, payment_method: payment.value.payment_method, reference_number: payment.value.reference_number, notes: payment.value.notes })
    showPaymentModal.value = false; await loadLoans(); alert(t('loans.paymentRecorded'))
  } catch (e) { alert(e.response?.data?.detail || t('loans.paymentFailed')) }
}

const exportLoans = () => {
  let csv = "Loan Report\n"; csv += `Generated: ${new Date().toLocaleString()}\n\n`; csv += "Loan Number,Customer,Total Amount,Paid Amount,Balance,Status\n"
  loans.value.forEach(l => { csv += `${l.loan_number},${l.customer_name},${l.total_amount},${l.paid_amount},${l.remaining_amount},${l.status}\n` })
  const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `loans_report_${new Date().toISOString().split('T')[0]}.csv`; a.click(); URL.revokeObjectURL(url)
}

const getStatusClass = (s) => ({ active: 'status-active', partially_paid: 'status-partial', settled: 'status-settled', overdue: 'status-overdue', cancelled: 'status-cancelled' }[s] || 'status-active')
const getStatusText = (s) => ({ active: t('loans.active'), partially_paid: t('loans.partiallyPaid'), settled: t('loans.settled'), overdue: t('loans.overdue'), cancelled: t('loans.cancelled') }[s] || s)

onMounted(() => { loadLoans() })
</script>

<style scoped>
/* All styles remain the same as in the previous message */
.loans-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
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
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

/* Filters Card */
.filters-card {
  padding: 20px;
  margin-bottom: 24px;
}

.filters {
  display: flex;
  gap: 12px;
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
  padding: 10px 12px 10px 38px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
}

.btn-warning {
  padding: 10px 20px;
  background: #fef5e7;
  color: #f39c12;
  border: 1px solid #f39c12;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

.btn-outline {
  padding: 10px 20px;
  background: white;
  color: #6E8B90;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(47, 184, 166, 0.2);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

/* Summary Cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.summary-card.warning {
  background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
}

.summary-card.success {
  background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
}

.card-icon {
  font-size: 2rem;
}

.card-info h3 {
  font-size: 0.85rem;
  margin-bottom: 8px;
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
  padding: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.table-count {
  font-size: 0.75rem;
  color: #6E8B90;
  background: rgba(110, 139, 144, 0.1);
  padding: 4px 12px;
  border-radius: 20px;
}

.overflow-x-auto {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  background: rgba(47, 184, 166, 0.05);
  color: #4a5568;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  vertical-align: middle;
}

.loan-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.customer-phone {
  font-size: 0.7rem;
  color: #6E8B90;
  margin-top: 4px;
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
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
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

.status-overdue {
  background: #ffebee;
  color: #f44336;
}

/* Action Buttons */
.actions-cell {
  text-align: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  color: #6E8B90;
}

.action-btn:hover {
  background: rgba(0, 0, 0, 0.05);
}

.action-btn.view:hover {
  color: #2FB8A6;
}

.action-btn.payment:hover {
  color: #4caf50;
}

.action-btn.settle:hover {
  color: #2196f3;
}

/* Empty State */
.empty-table {
  text-align: center;
  padding: 60px !important;
}

.btn-primary-sm {
  margin-top: 16px;
  padding: 8px 20px;
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
  gap: 8px;
  padding: 10px 20px;
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

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #cbd5e0;
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
  padding: 20px 24px;
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
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.modal-body {
  padding: 24px;
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.loan-info {
  background: #f7fafc;
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.loan-info div {
  margin-bottom: 8px;
}

.loan-info div:last-child {
  margin-bottom: 0;
}

.balance-amount {
  color: #ef4444;
  font-size: 1.1rem;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
  font-size: 0.85rem;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  font-size: 0.9rem;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
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
@media (max-width: 1024px) {
  .summary-cards {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}

@media (max-width: 768px) {
  .loans-container {
    padding: 16px;
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
  
  .btn-warning, .btn-outline {
    width: 100%;
    text-align: center;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .summary-card {
    padding: 16px;
  }
  
  .card-icon {
    font-size: 1.5rem;
  }
  
  .card-info p {
    font-size: 1.2rem;
  }
  
  .data-table th, 
  .data-table td {
    padding: 10px 12px;
    font-size: 0.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 4px;
  }
  
  .action-btn {
    padding: 6px;
  }
  
  .action-svg-icon {
    width: 14px;
    height: 14px;
  }
}

@media (max-width: 480px) {
  .loans-container {
    padding: 12px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .btn-primary, .btn-secondary {
    flex: 1;
    justify-content: center;
  }
  
  .table-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
  
  .data-table th, 
  .data-table td {
    padding: 8px;
    font-size: 0.7rem;
  }
  
  .status-badge {
    padding: 2px 8px;
    font-size: 0.6rem;
  }
  
  .customer-phone {
    font-size: 0.6rem;
  }
  
  .modal-container {
    width: 95%;
  }
}
</style>