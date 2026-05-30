<template>
  <div class="loan-details-container" v-if="loan">
    <div class="page-header">
      <button @click="$router.back()" class="back-btn">
        ← Back
      </button>
      <h1 class="page-title">Loan Details: {{ loan.loan_number }}</h1>
    </div>

    <!-- Loan Information -->
    <div class="info-card">
      <h2>Loan Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <label>Customer Name:</label>
          <span>{{ loan.customer_name }}</span>
        </div>
        <div class="info-item">
          <label>Phone:</label>
          <span>{{ loan.customer_phone || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <label>Email:</label>
          <span>{{ loan.customer_email || 'N/A' }}</span>
        </div>
        <div class="info-item">
          <label>Loan Date:</label>
          <span>{{ formatDate(loan.loan_date) }}</span>
        </div>
        <div class="info-item">
          <label>Due Date:</label>
          <span :class="{ 'overdue': isOverdue }">{{ formatDate(loan.due_date) }}</span>
        </div>
        <div class="info-item">
          <label>Status:</label>
          <span :class="getStatusClass(loan.status)" class="status-badge">{{ getStatusText(loan.status) }}</span>
        </div>
        <div class="info-item">
          <label>Interest Rate:</label>
          <span>{{ loan.interest_rate }}%</span>
        </div>
      </div>
    </div>

    <!-- Loan Items -->
    <div class="items-card">
      <h2>Loan Items</h2>
      <table class="items-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Unit Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in loan.items" :key="item.id">
            <td>{{ item.product_name }}</td>
            <td>{{ item.quantity }}</td>
            <td>{{ formatCurrency(item.unit_price) }}</td>
            <td>{{ formatCurrency(item.line_total) }}</td>
          </tr>
          <tr class="total-row">
            <td colspan="3"><strong>Subtotal</strong></td>
            <td><strong>{{ formatCurrency(subtotal) }}</strong></td>
          </tr>
          <tr class="total-row">
            <td colspan="3"><strong>Interest</strong></td>
            <td><strong>{{ formatCurrency(loan.interest_amount) }}</strong></td>
          </tr>
          <tr class="grand-total-row">
            <td colspan="3"><strong>Total Amount</strong></td>
            <td><strong>{{ formatCurrency(loan.total_amount) }}</strong></td>
          </tr>
        </tbody>
       </table>
    </div>

    <!-- Payment History -->
    <div class="payments-card">
      <h2>Payment History</h2>
      <div class="payment-summary">
        <div class="summary-box">
          <label>Total Paid:</label>
          <span class="paid-amount">{{ formatCurrency(loan.paid_amount) }}</span>
        </div>
        <div class="summary-box">
          <label>Remaining Balance:</label>
          <span class="balance-amount">{{ formatCurrency(loan.remaining_amount) }}</span>
        </div>
      </div>
      
      <table class="payments-table" v-if="loan.payments && loan.payments.length > 0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Amount</th>
            <th>Method</th>
            <th>Reference</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="payment in loan.payments" :key="payment.id">
            <td>{{ formatDate(payment.payment_date) }}</td>
            <td>{{ formatCurrency(payment.amount) }}</td>
            <td>{{ payment.payment_method }}</td>
            <td>{{ payment.reference_number || '-' }}</td>
            <td>{{ payment.notes || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <div v-else class="no-data">No payments recorded yet</div>
    </div>

    <!-- Actions -->
    <div class="actions" v-if="loan.remaining_amount > 0">
      <button @click="recordPayment" class="btn-primary">Record Payment</button>
      <button @click="settleLoan" class="btn-success">Settle Loan</button>
    </div>

    <!-- Payment Modal -->
    <div v-if="showPaymentModal" class="modal-overlay" @click.self="showPaymentModal = false">
      <div class="modal">
        <div class="modal-header">
          <h2>Record Payment</h2>
          <button @click="showPaymentModal = false" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <div class="loan-info">
            <div>Remaining Balance: <strong class="balance-amount">{{ formatCurrency(loan.remaining_amount) }}</strong></div>
          </div>
          <div class="form-group">
            <label>Payment Amount</label>
            <input 
              type="number" 
              v-model="payment.amount" 
              :max="loan.remaining_amount"
              step="0.01"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>Payment Method</label>
            <select v-model="payment.payment_method" class="form-select">
              <option value="cash">Cash</option>
              <option value="ticket">Ticket</option>
              <option value="coupon">Coupon</option>
            </select>
          </div>
          <div class="form-group">
            <label>Reference Number</label>
            <input v-model="payment.reference_number" class="form-input" />
          </div>
          <div class="form-group">
            <label>Notes</label>
            <textarea v-model="payment.notes" rows="2" class="form-textarea"></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="submitPayment" class="btn-primary">Submit Payment</button>
          <button @click="showPaymentModal = false" class="btn-secondary">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '@/services/api'

const route = useRoute()
const router = useRouter()
const loan = ref(null)
const showPaymentModal = ref(false)
const payment = ref({
  amount: 0,
  payment_method: 'cash',
  reference_number: '',
  notes: ''
})

const subtotal = computed(() => {
  if (!loan.value) return 0
  return loan.value.total_amount - loan.value.interest_amount
})

const isOverdue = computed(() => {
  if (!loan.value) return false
  return new Date(loan.value.due_date) < new Date() && loan.value.remaining_amount > 0
})

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const loadLoan = async () => {
  try {
    const response = await api.get(`/loans/${route.params.id}`)
    loan.value = response.data
  } catch (error) {
    console.error('Failed to load loan:', error)
    alert('Loan not found')
    router.push('/loans')
  }
}

const recordPayment = () => {
  payment.value = {
    amount: loan.value.remaining_amount,
    payment_method: 'cash',
    reference_number: '',
    notes: ''
  }
  showPaymentModal.value = true
}

const settleLoan = () => {
  payment.value = {
    amount: loan.value.remaining_amount,
    payment_method: 'cash',
    reference_number: '',
    notes: 'Full settlement'
  }
  showPaymentModal.value = true
}

const submitPayment = async () => {
  try {
    if (payment.value.amount >= loan.value.remaining_amount) {
      await api.post(`/loans/${loan.value.id}/settle`, {
        amount: payment.value.amount,
        payment_method: payment.value.payment_method,
        reference_number: payment.value.reference_number,
        notes: payment.value.notes
      })
    } else {
      await api.post(`/loans/${loan.value.id}/payments`, {
        amount: payment.value.amount,
        payment_method: payment.value.payment_method,
        reference_number: payment.value.reference_number,
        notes: payment.value.notes
      })
    }
    
    showPaymentModal.value = false
    loadLoan()
    alert('Payment recorded successfully!')
  } catch (error) {
    console.error('Failed to record payment:', error)
    alert('Failed to record payment. Please try again.')
  }
}

const getStatusClass = (status) => {
  const classes = {
    active: 'status-active',
    partially_paid: 'status-partial',
    settled: 'status-settled'
  }
  return classes[status] || 'status-active'
}

const getStatusText = (status) => {
  const texts = {
    active: 'Active',
    partially_paid: 'Partially Paid',
    settled: 'Settled'
  }
  return texts[status] || status
}

onMounted(() => {
  loadLoan()
})
</script>

<style scoped>
.loan-details-container {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #667eea;
  font-size: 16px;
  padding: 8px 12px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.info-card, .items-card, .payments-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.info-item label {
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.info-item span {
  font-size: 16px;
  font-weight: 500;
  color: #2d3748;
}

.overdue {
  color: #e74c3c;
}

.items-table, .payments-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th, .items-table td,
.payments-table th, .payments-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.items-table th, .payments-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.total-row td, .grand-total-row td {
  padding-top: 12px;
  font-weight: 600;
}

.grand-total-row {
  background: #f7fafc;
}

.payment-summary {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.summary-box {
  flex: 1;
}

.summary-box label {
  display: block;
  font-size: 12px;
  color: #718096;
  margin-bottom: 4px;
}

.paid-amount {
  font-size: 20px;
  font-weight: 600;
  color: #4caf50;
}

.balance-amount {
  font-size: 20px;
  font-weight: 600;
  color: #e74c3c;
}

.no-data {
  text-align: center;
  padding: 40px;
  color: #718096;
}

.actions {
  display: flex;
  gap: 16px;
  justify-content: flex-end;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.btn-success {
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
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

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 500px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}

.loan-info {
  background: #f7fafc;
  padding: 12px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
}

@media (max-width: 768px) {
  .loan-details-container {
    padding: 16px;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
  }
  
  .payment-summary {
    flex-direction: column;
  }
  
  .items-table, .payments-table {
    font-size: 14px;
  }
}
</style>