<template>
  <div class="loan-details-container">
    <div class="page-header">
      <button @click="$router.back()" class="back-btn">
        <svg class="back-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ $t('common.back') }}
      </button>
      <h1 class="page-title">{{ $t('loans.loanDetails') }}: {{ loan?.loan_number }}</h1>
    </div>

    <div v-if="loan" class="loan-details glass-card">
      <div class="info-grid">
        <div class="info-item">
          <label>{{ $t('loans.customer') }}:</label>
          <span>{{ loan.customer_name }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('loans.phoneNumber') }}:</label>
          <span>{{ loan.customer_phone || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('loans.loanDate') }}:</label>
          <span>{{ formatDate(loan.loan_date) }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('loans.dueDate') }}:</label>
          <span :class="{ 'overdue': isOverdue }">{{ formatDate(loan.due_date) }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('common.status') }}:</label>
          <span :class="getStatusClass(loan.status)" class="status-badge">{{ getStatusText(loan.status) }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('loans.totalAmount') }}:</label>
          <span>{{ formatCurrency(loan.total_amount) }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('loans.paidAmount') }}:</label>
          <span class="paid">{{ formatCurrency(loan.paid_amount) }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('loans.remainingBalance') }}:</label>
          <span class="balance">{{ formatCurrency(loan.remaining_amount) }}</span>
        </div>
      </div>

      <div class="payment-section" v-if="loan.remaining_amount > 0">
        <button @click="showPaymentModal = true" class="btn-primary">{{ $t('loans.recordPayment') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatCurrency, formatDate } from '@/utils/format'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const loan = ref(null)
const showPaymentModal = ref(false)

const isOverdue = computed(() => {
  if (!loan.value) return false
  return new Date(loan.value.due_date) < new Date() && loan.value.remaining_amount > 0
})

const getStatusClass = (status) => {
  const classes = { active: 'status-active', partially_paid: 'status-partial', settled: 'status-settled' }
  return classes[status] || 'status-active'
}

const getStatusText = (status) => {
  const texts = { active: t('loans.active'), partially_paid: t('loans.partiallyPaid'), settled: t('loans.settled') }
  return texts[status] || status
}

const loadLoan = async () => {
  try {
    const response = await api.get(`/loans/${route.params.id}`)
    loan.value = response.data
  } catch (error) {
    console.error('Failed to load loan:', error)
    alert(t('loans.loanNotFound'))
    router.push('/sales/loans')
  }
}

onMounted(() => {
  loadLoan()
})
</script>

<style scoped>
.loan-details-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 1rem;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  cursor: pointer;
  color: #2FB8A6;
  padding: 0.5rem;
}

.back-svg-icon {
  width: 18px;
  height: 18px;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A2A2E;
  margin: 0;
}

.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #6E8B90;
}

.info-item span {
  font-size: 1rem;
  font-weight: 500;
  color: #1A2A2E;
}

.paid {
  color: #4caf50;
}

.balance {
  color: #ef4444;
  font-weight: 700;
}

.overdue {
  color: #ef4444;
}

.status-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
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

.payment-section {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  text-align: right;
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

@media (max-width: 768px) {
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.2rem;
  }
}
</style>