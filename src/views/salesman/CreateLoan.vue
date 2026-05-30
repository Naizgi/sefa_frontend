<template>
  <div class="create-loan-container">
    <div class="page-header">
      <button @click="$router.back()" class="back-btn">
        <svg class="back-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {{ $t('common.back') }}
      </button>
      <h1 class="page-title">{{ $t('loans.createLoan') }}</h1>
    </div>

    <form @submit.prevent="submitLoan" class="loan-form glass-card">
      <!-- Customer Information -->
      <div class="form-section">
        <h2>{{ $t('loans.customerInformation') }}</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ $t('loans.customerName') }} *</label>
            <input 
              type="text" 
              v-model="form.customer_name" 
              required
              class="form-input"
              :placeholder="$t('loans.enterCustomerName')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('loans.phoneNumber') }}</label>
            <input 
              type="tel" 
              v-model="form.customer_phone" 
              class="form-input"
              :placeholder="$t('loans.phonePlaceholder')"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('common.email') }}</label>
            <input 
              type="email" 
              v-model="form.customer_email" 
              class="form-input"
              placeholder="customer@example.com"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('loans.dueDate') }} *</label>
            <input 
              type="date" 
              v-model="form.due_date" 
              required
              :min="minDate"
              class="form-input"
            />
          </div>
          <div class="form-group">
            <label>{{ $t('loans.interestRate') }} (%)</label>
            <input 
              type="number" 
              v-model.number="form.interest_rate" 
              step="0.5"
              min="0"
              max="100"
              class="form-input"
            />
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="form-section">
        <h2>{{ $t('loans.loanItems') }}</h2>
        <div class="items-list">
          <div v-for="(item, index) in form.items" :key="index" class="item-row">
            <div class="item-select">
              <label>{{ $t('loans.product') }}</label>
              <select v-model="item.product_id" @change="updateItemPrice(item)" class="form-select" required>
                <option value="">{{ $t('loans.selectProduct') }}</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} ({{ product.sku }}) - {{ formatCurrency(product.price) }}
                </option>
              </select>
            </div>
            <div class="item-quantity">
              <label>{{ $t('loans.quantity') }}</label>
              <input 
                type="number" 
                v-model.number="item.quantity" 
                min="1"
                step="1"
                class="form-input"
                @input="calculateItemTotal(item)"
                required
              />
            </div>
            <div class="item-price">
              <label>{{ $t('loans.unitPrice') }}</label>
              <input 
                type="number" 
                v-model.number="item.unit_price" 
                step="0.01"
                class="form-input"
                @input="calculateItemTotal(item)"
                required
              />
            </div>
            <div class="item-total">
              <label>{{ $t('common.total') }}</label>
              <div class="total-display">{{ formatCurrency(item.line_total) }}</div>
            </div>
            <button type="button" @click="removeItem(index)" class="remove-btn" :title="$t('loans.removeItem')">
              <svg class="remove-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        <button type="button" @click="addItem" class="add-item-btn">
          <svg class="add-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('loans.addItem') }}
        </button>
      </div>

      <!-- Summary -->
      <div class="form-section">
        <h2>{{ $t('loans.loanSummary') }}</h2>
        <div class="summary-cards">
          <div class="summary-card">
            <div class="card-label">{{ $t('loans.subtotal') }}</div>
            <div class="card-value">{{ formatCurrency(subtotal) }}</div>
          </div>
          <div class="summary-card">
            <div class="card-label">{{ $t('loans.interest') }} ({{ form.interest_rate }}%)</div>
            <div class="card-value">{{ formatCurrency(interestAmount) }}</div>
          </div>
          <div class="summary-card highlight">
            <div class="card-label">{{ $t('loans.totalAmount') }}</div>
            <div class="card-value total">{{ formatCurrency(totalAmount) }}</div>
          </div>
        </div>
      </div>

      <!-- Notes -->
      <div class="form-section">
        <h2>{{ $t('loans.additionalNotes') }}</h2>
        <textarea v-model="form.notes" rows="3" class="form-textarea" :placeholder="$t('loans.loanNotesPlaceholder')"></textarea>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="$router.back()" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn-primary" :disabled="loading">
          <span v-if="loading" class="spinner-small"></span>
          <span v-else>{{ $t('loans.createLoan') }}</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatCurrency } from '@/utils/format'

const router = useRouter()
const { t } = useI18n()
const loading = ref(false)
const products = ref([])

const form = ref({
  customer_name: '',
  customer_phone: '',
  customer_email: '',
  due_date: '',
  interest_rate: 0,
  notes: '',
  items: []
})

const minDate = computed(() => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return tomorrow.toISOString().split('T')[0]
})

const subtotal = computed(() => {
  return form.value.items.reduce((sum, item) => sum + (item.line_total || 0), 0)
})

const interestAmount = computed(() => {
  return subtotal.value * (form.value.interest_rate / 100)
})

const totalAmount = computed(() => {
  return subtotal.value + interestAmount.value
})

const addItem = () => {
  form.value.items.push({
    product_id: '',
    quantity: 1,
    unit_price: 0,
    line_total: 0
  })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const calculateItemTotal = (item) => {
  item.line_total = (item.quantity || 0) * (item.unit_price || 0)
}

const updateItemPrice = (item) => {
  const product = products.value.find(p => p.id === item.product_id)
  if (product) {
    item.unit_price = product.price
    calculateItemTotal(item)
  }
}

const loadProducts = async () => {
  try {
    const response = await api.get('/products', { params: { active: true } })
    products.value = response.data
  } catch (error) {
    console.error('Failed to load products:', error)
    products.value = []
  }
}

const submitLoan = async () => {
  if (!form.value.customer_name) {
    alert(t('loans.enterCustomerNameAlert'))
    return
  }
  
  if (!form.value.due_date) {
    alert(t('loans.selectDueDateAlert'))
    return
  }
  
  if (form.value.items.length === 0) {
    alert(t('loans.addItemAlert'))
    return
  }
  
  for (const item of form.value.items) {
    if (!item.product_id) {
      alert(t('loans.selectProductAlert'))
      return
    }
    if (item.quantity <= 0) {
      alert(t('loans.quantityAlert'))
      return
    }
    if (item.unit_price <= 0) {
      alert(t('loans.unitPriceAlert'))
      return
    }
  }
  
  loading.value = true
  try {
    const data = {
      customer_name: form.value.customer_name,
      customer_phone: form.value.customer_phone || null,
      customer_email: form.value.customer_email || null,
      due_date: form.value.due_date,
      interest_rate: form.value.interest_rate,
      notes: form.value.notes,
      items: form.value.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }))
    }
    
    await api.post('/loans', data)
    alert(t('loans.loanCreated'))
    router.push('/sales/loans')
  } catch (error) {
    console.error('Failed to create loan:', error)
    alert(t('loans.loanCreateFailed'))
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
  addItem()
})
</script>

<style scoped>
.create-loan-container {
  max-width: 1200px;
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
  font-size: 1rem;
  padding: 0.5rem;
  border-radius: 8px;
}

.back-svg-icon {
  width: 18px;
  height: 18px;
}

.page-title {
  font-size: 1.8rem;
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

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.form-section h2 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.85rem;
  font-weight: 500;
  color: #4a5568;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
  background: white;
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.items-list {
  margin-bottom: 1rem;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 0.75rem;
  align-items: end;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
}

.item-row label {
  font-size: 0.7rem;
  font-weight: 500;
  color: #6E8B90;
  margin-bottom: 0.25rem;
  display: block;
}

.total-display {
  padding: 0.75rem;
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  font-weight: 600;
  color: #1A2A2E;
}

.remove-btn {
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ef4444;
  transition: all 0.2s ease;
}

.remove-svg-icon {
  width: 16px;
  height: 16px;
}

.remove-btn:hover {
  background: rgba(239, 68, 68, 0.2);
}

.add-item-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #e2e8f0;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  color: #4a5568;
  font-size: 0.85rem;
}

.add-svg-icon {
  width: 14px;
  height: 14px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
}

.summary-card {
  background: #f7fafc;
  padding: 1rem;
  border-radius: 12px;
  text-align: center;
}

.summary-card.highlight {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
}

.card-label {
  font-size: 0.75rem;
  color: #6E8B90;
  margin-bottom: 0.5rem;
}

.summary-card.highlight .card-label {
  color: rgba(255, 255, 255, 0.9);
}

.card-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A2A2E;
}

.card-value.total {
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

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

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
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

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .item-row {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
}
</style>