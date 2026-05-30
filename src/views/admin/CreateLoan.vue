<template>
  <div class="create-loan-container">
    <div class="page-header">
      <button @click="$router.back()" class="back-btn">
        <i class="fas fa-arrow-left"></i> {{ $t('common.back') }}
      </button>
      <h1 class="page-title">{{ $t('loans.createNewLoan') }}</h1>
    </div>

    <form @submit.prevent="submitLoan" class="loan-form">
      <!-- Customer Information -->
      <div class="form-section">
        <h2>{{ $t('loans.customerInformation') }}</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ $t('loans.customerName') }} *</label>
            <input type="text" v-model="form.customer_name" required class="form-input" :placeholder="$t('loans.enterCustomerName')" />
          </div>
          <div class="form-group">
            <label>{{ $t('loans.phoneNumber') }}</label>
            <input type="tel" v-model="form.customer_phone" class="form-input" :placeholder="$t('loans.phonePlaceholder')" />
          </div>
          <div class="form-group">
            <label>{{ $t('common.email') }}</label>
            <input type="email" v-model="form.customer_email" class="form-input" placeholder="customer@example.com" />
          </div>
          <div class="form-group">
            <label>{{ $t('loans.dueDate') }} *</label>
            <input type="date" v-model="form.due_date" required :min="minDate" class="form-input" />
          </div>
          <div class="form-group">
            <label>{{ $t('loans.interestRate') }} (%)</label>
            <input type="number" v-model.number="form.interest_rate" step="0.5" min="0" max="100" class="form-input" />
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
              <select v-model="item.product_id" @change="updateItemPrice(item)" class="form-select">
                <option value="">{{ $t('loans.selectProduct') }}</option>
                <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }} ({{ product.sku }}) - {{ formatCurrency(product.price) }}</option>
              </select>
            </div>
            <div class="item-quantity"><label>{{ $t('loans.quantity') }}</label><input type="number" v-model.number="item.quantity" min="1" step="1" class="form-input" @input="calculateItemTotal(item)" /></div>
            <div class="item-price"><label>{{ $t('loans.unitPrice') }}</label><input type="number" v-model.number="item.unit_price" step="0.01" class="form-input" @input="calculateItemTotal(item)" /></div>
            <div class="item-total"><label>{{ $t('common.total') }}</label><div class="total-display">{{ formatCurrency(item.line_total) }}</div></div>
            <button type="button" @click="removeItem(index)" class="remove-btn"><i class="fas fa-trash"></i></button>
          </div>
        </div>
        <button type="button" @click="addItem" class="add-item-btn"><i class="fas fa-plus"></i> {{ $t('loans.addItem') }}</button>
      </div>

      <!-- Summary -->
      <div class="form-section">
        <h2>{{ $t('loans.loanSummary') }}</h2>
        <div class="summary-cards">
          <div class="summary-card"><div class="card-label">{{ $t('loans.subtotal') }}</div><div class="card-value">{{ formatCurrency(subtotal) }}</div></div>
          <div class="summary-card"><div class="card-label">{{ $t('loans.interest') }} ({{ form.interest_rate }}%)</div><div class="card-value">{{ formatCurrency(interestAmount) }}</div></div>
          <div class="summary-card highlight"><div class="card-label">{{ $t('loans.totalAmount') }}</div><div class="card-value total">{{ formatCurrency(totalAmount) }}</div></div>
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
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ loading ? $t('common.creating') : $t('loans.createLoan') }}
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

const router = useRouter()
const { t } = useI18n()
const loading = ref(false)
const products = ref([])

const form = ref({ customer_name: '', customer_phone: '', customer_email: '', due_date: '', interest_rate: 0, notes: '', items: [] })

const minDate = computed(() => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0] })
const subtotal = computed(() => form.value.items.reduce((s, i) => s + (i.line_total || 0), 0))
const interestAmount = computed(() => subtotal.value * (form.value.interest_rate / 100))
const totalAmount = computed(() => subtotal.value + interestAmount.value)

const formatCurrency = (a) => { if (!a && a !== 0) return '$0.00'; return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(a) }

const addItem = () => { form.value.items.push({ product_id: '', quantity: 1, unit_price: 0, line_total: 0 }) }
const removeItem = (i) => { form.value.items.splice(i, 1) }
const calculateItemTotal = (item) => { item.line_total = (item.quantity || 0) * (item.unit_price || 0) }
const updateItemPrice = (item) => { const p = products.value.find(p => p.id === item.product_id); if (p) { item.unit_price = p.price; calculateItemTotal(item) } }

const loadProducts = async () => { try { products.value = (await api.get('/products', { params: { active: true } })).data } catch (e) {} }

const submitLoan = async () => {
  if (!form.value.customer_name) { alert(t('loans.enterCustomerNameAlert')); return }
  if (!form.value.due_date) { alert(t('loans.selectDueDateAlert')); return }
  if (form.value.items.length === 0) { alert(t('loans.addItemAlert')); return }
  for (const item of form.value.items) {
    if (!item.product_id) { alert(t('loans.selectProductAlert')); return }
    if (item.quantity <= 0) { alert(t('loans.quantityAlert')); return }
    if (item.unit_price <= 0) { alert(t('loans.unitPriceAlert')); return }
  }
  loading.value = true
  try {
    await api.post('/loans', { customer_name: form.value.customer_name, customer_phone: form.value.customer_phone || null, customer_email: form.value.customer_email || null, due_date: form.value.due_date, interest_rate: form.value.interest_rate, notes: form.value.notes, items: form.value.items.map(i => ({ product_id: i.product_id, quantity: i.quantity, unit_price: i.unit_price })) })
    alert(t('loans.loanCreated'))
    router.push('/loans')
  } catch (e) { alert(e.response?.data?.detail || t('loans.loanCreateFailed')) } finally { loading.value = false }
}

onMounted(() => { loadProducts(); addItem() })
</script>

<style scoped>
.create-loan-container {
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
  display: flex;
  align-items: center;
  gap: 8px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.loan-form {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.form-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 14px;
}

.form-input, .form-select, .form-textarea {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.items-list {
  margin-bottom: 16px;
}

.item-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr auto;
  gap: 12px;
  align-items: end;
  margin-bottom: 16px;
  padding: 16px;
  background: #f7fafc;
  border-radius: 8px;
}

.item-row label {
  font-size: 12px;
  font-weight: 500;
  color: #718096;
  margin-bottom: 4px;
  display: block;
}

.total-display {
  padding: 10px 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  font-weight: 600;
  color: #2d3748;
}

.remove-btn {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #e53e3e;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s;
  margin-bottom: 0;
}

.remove-btn:hover {
  background: #fed7d7;
}

.add-item-btn {
  background: #e2e8f0;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  color: #4a5568;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.summary-card {
  background: #f7fafc;
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.summary-card.highlight {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.card-label {
  font-size: 14px;
  color: #718096;
  margin-bottom: 8px;
}

.summary-card.highlight .card-label {
  color: rgba(255, 255, 255, 0.9);
}

.card-value {
  font-size: 24px;
  font-weight: 700;
  color: #2d3748;
}

.card-value.total {
  color: white;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

@media (max-width: 768px) {
  .create-loan-container {
    padding: 16px;
  }
  
  .item-row {
    grid-template-columns: 1fr;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>