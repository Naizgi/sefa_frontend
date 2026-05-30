<template>
  <div class="create-purchase-container">
    <div class="page-header">
      <button @click="$router.back()" class="back-btn">
        <i class="fas fa-arrow-left"></i> {{ $t('common.back') }}
      </button>
      <h1 class="page-title">{{ isReordering ? $t('purchases.reorderPurchase') : $t('purchases.createPurchaseOrder') }}</h1>
    </div>

    <!-- Loading State -->
    <div v-if="loadingProducts" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <form v-else @submit.prevent="submitOrder" class="purchase-form">
      <!-- Supplier Information -->
      <div class="form-section">
        <h2>{{ $t('purchases.supplierInformation') }}</h2>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ $t('purchases.supplierName') }} *</label>
            <input type="text" v-model="form.supplier" required class="form-input" :placeholder="$t('purchases.supplierNamePlaceholder')" />
          </div>
          <div class="form-group">
            <label>{{ $t('purchases.expectedDate') }}</label>
            <input type="date" v-model="form.expected_delivery_date" class="form-input" />
          </div>
        </div>
      </div>

      <!-- Items Section -->
      <div class="form-section">
        <div class="section-header">
          <h2>{{ $t('purchases.orderItems') }}</h2>
          <button type="button" @click="clearAllItems" class="clear-btn" v-if="form.items.length > 0">
            <i class="fas fa-trash-alt"></i> {{ $t('common.clearAll') }}
          </button>
        </div>
        
        <div class="items-list">
          <div v-for="(item, index) in form.items" :key="index" class="item-row">
            <div class="item-select">
              <label>{{ $t('sales.product') }}</label>
              <select v-model="item.product_id" @change="updateItemPrice(item)" class="form-select">
                <option value="">{{ $t('purchases.selectProduct') }}</option>
                <option v-for="product in products" :key="product.id" :value="product.id" :selected="item.product_id === product.id">
                  {{ product.name }} ({{ product.sku }}) - {{ formatCurrency(product.cost || product.price) }}
                </option>
              </select>
            </div>
            <div class="item-quantity">
              <label>{{ $t('purchases.quantity') }}</label>
              <input type="number" v-model.number="item.quantity_ordered" min="1" step="1" class="form-input" @input="calculateItemTotal(item)" />
            </div>
            <div class="item-cost">
              <label>{{ $t('purchases.unitCost') }}</label>
              <input type="number" v-model.number="item.unit_cost" step="0.01" class="form-input" @input="calculateItemTotal(item)" :placeholder="$t('purchases.enterCost')" />
            </div>
            <div class="item-total">
              <label>{{ $t('common.total') }}</label>
              <div class="total-display">{{ formatCurrency(item.total) }}</div>
            </div>
            <button type="button" @click="removeItem(index)" class="remove-btn">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        
        <button type="button" @click="addItem" class="add-item-btn">
          <i class="fas fa-plus"></i> {{ $t('purchases.addItem') }}
        </button>
      </div>

      <!-- Totals Section with VAT -->
      <div class="form-section">
        <h2>{{ $t('purchases.orderSummary') }}</h2>
        
        <!-- VAT Toggle -->
        <div class="vat-toggle">
          <label class="checkbox-label">
            <input type="checkbox" v-model="applyVat" @change="toggleVat" />
            <span>{{ $t('purchases.applyVat') }}</span>
          </label>
          <div v-if="applyVat" class="vat-rate-group">
            <label>{{ $t('purchases.vatRate') }} (%)</label>
            <input type="number" v-model.number="form.vat_rate" step="0.5" min="0" max="100" class="vat-input" @input="calculateTotal" />
            <span class="vat-hint">{{ $t('purchases.vatRateHint') }}</span>
          </div>
        </div>

        <div class="totals-grid">
          <div class="total-row">
            <span>{{ $t('pos.subtotal') }}:</span>
            <span>{{ formatCurrency(subtotal) }}</span>
          </div>
          
          <div v-if="applyVat" class="total-row vat-row">
            <span>{{ $t('purchases.vatAmount') }} ({{ form.vat_rate || 0 }}%):</span>
            <span>{{ formatCurrency(vatAmount) }}</span>
          </div>
          
          <div class="total-row">
            <label>{{ $t('purchases.shippingCost') }}:</label>
            <input type="number" v-model.number="form.shipping_cost" step="0.01" class="total-input" @input="calculateTotal" />
          </div>
          
          <div class="total-row">
            <label>{{ $t('purchases.discount') }}:</label>
            <input type="number" v-model.number="form.discount_amount" step="0.01" class="total-input" @input="calculateTotal" />
          </div>
          
          <div class="total-row grand-total">
            <span>{{ $t('purchases.grandTotal') }}:</span>
            <span class="total-amount">{{ formatCurrency(totalAmount) }}</span>
          </div>
        </div>

        <!-- Legacy Tax Amount (hidden, for backward compatibility) -->
        <input type="hidden" v-model="form.tax_amount" />
      </div>

      <!-- Notes -->
      <div class="form-section">
        <h2>{{ $t('purchases.additionalNotes') }}</h2>
        <textarea v-model="form.notes" rows="4" class="form-textarea" :placeholder="$t('purchases.notesPlaceholder')"></textarea>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="button" @click="$router.back()" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button type="submit" class="btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          {{ loading ? $t('common.creating') : (isReordering ? $t('purchases.createReorder') : $t('purchases.createPurchaseOrder')) }}
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
const loadingProducts = ref(false)
const products = ref([])

const applyVat = ref(false)

const form = ref({
  supplier: '',
  expected_delivery_date: '',
  vat_rate: 15,
  tax_amount: 0,
  shipping_cost: 0,
  discount_amount: 0,
  notes: '',
  items: []
})

const isReordering = ref(false)

// Calculate subtotal from items
const subtotal = computed(() => form.value.items.reduce((sum, item) => sum + (item.total || 0), 0))

// Calculate VAT amount
const vatAmount = computed(() => {
  if (!applyVat.value) return 0
  const rate = form.value.vat_rate || 0
  return subtotal.value * (rate / 100)
})

// Calculate total amount
const totalAmount = computed(() => {
  let total = subtotal.value
  if (applyVat.value) {
    total += vatAmount.value
  } else {
    total += (form.value.tax_amount || 0)
  }
  total += (form.value.shipping_cost || 0)
  total -= (form.value.discount_amount || 0)
  return total
})

const addItem = () => {
  form.value.items.push({ 
    product_id: '', 
    quantity_ordered: 1, 
    unit_cost: 0, 
    total: 0 
  })
}

const removeItem = (index) => {
  form.value.items.splice(index, 1)
}

const clearAllItems = () => {
  form.value.items = []
  addItem() // Add one empty item after clearing
}

const calculateItemTotal = (item) => {
  item.total = (item.quantity_ordered || 0) * (item.unit_cost || 0)
  calculateTotal()
}

const calculateTotal = () => {
  // Just trigger reactive updates
  // The computed properties will handle the calculations
}

const toggleVat = () => {
  if (!applyVat.value) {
    form.value.vat_rate = 0
    form.value.tax_amount = 0
  }
  calculateTotal()
}

const updateItemPrice = (item) => {
  const product = products.value.find(p => p.id === item.product_id)
  if (product) {
    item.unit_cost = product.cost || product.price || 0
    calculateItemTotal(item)
  }
}

const loadProducts = async () => {
  loadingProducts.value = true
  try {
    const response = await api.get('/products')
    products.value = response.data || []
  } catch (e) {
    products.value = []
  } finally {
    loadingProducts.value = false
  }
}

const submitOrder = async () => {
  if (!form.value.supplier) {
    alert(t('purchases.supplierRequired'))
    return
  }
  if (form.value.items.length === 0) {
    alert(t('purchases.itemsRequired'))
    return
  }
  
  // Prepare data for API
  const submitData = {
    supplier: form.value.supplier,
    expected_delivery_date: form.value.expected_delivery_date || null,
    shipping_cost: form.value.shipping_cost || 0,
    discount_amount: form.value.discount_amount || 0,
    notes: form.value.notes,
    items: form.value.items.map(item => ({
      product_id: item.product_id,
      quantity_ordered: item.quantity_ordered,
      unit_cost: item.unit_cost,
      notes: null
    }))
  }
  
  // Add VAT or tax information
  if (applyVat.value && form.value.vat_rate > 0) {
    submitData.vat_rate = form.value.vat_rate
    submitData.tax_amount = vatAmount.value
  } else {
    submitData.vat_rate = 0
    submitData.tax_amount = form.value.tax_amount || 0
  }
  
  loading.value = true
  try {
    await api.post('/purchases/orders', submitData)
    alert(t('purchases.orderCreated'))
    router.push('/purchases')
  } catch (e) {
    const errorMsg = e.response?.data?.detail || t('purchases.orderCreateFailed')
    alert(errorMsg)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadProducts()
  
  // Check for reorder data
  const reorderData = sessionStorage.getItem('reorderData')
  if (reorderData) {
    try {
      const data = JSON.parse(reorderData)
      form.value.supplier = data.supplier || ''
      form.value.items = data.items || []
      isReordering.value = true
      sessionStorage.removeItem('reorderData')
    } catch (e) {}
  }
  
  if (!form.value.items.length) {
    addItem()
  }
})
</script>

<style scoped>
.create-purchase-container {
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
  color: #2FB8A6;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.back-btn:hover {
  color: #1F8A7C;
  transform: translateX(-2px);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(47, 184, 166, 0.2);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.purchase-form {
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

.form-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
}

.form-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h2 {
  margin-bottom: 0;
}

.clear-btn {
  background: #fff5f5;
  border: 1px solid #fed7d7;
  color: #e53e3e;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.3s;
}

.clear-btn:hover {
  background: #fed7d7;
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
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
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
  transition: all 0.3s;
}

.item-row:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-btn:hover {
  background: #fed7d7;
  transform: scale(1.05);
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
  transition: all 0.3s;
}

.add-item-btn:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

/* VAT Toggle Styles */
.vat-toggle {
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-weight: 500;
  color: #2d3748;
}

.checkbox-label input {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2FB8A6;
}

.vat-rate-group {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.vat-rate-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 14px;
}

.vat-input {
  width: 80px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: right;
}

.vat-input:focus {
  outline: none;
  border-color: #2FB8A6;
}

.vat-hint {
  font-size: 12px;
  color: #718096;
}

.totals-grid {
  max-width: 400px;
  margin-left: auto;
}

.total-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e2e8f0;
}

.total-row label {
  font-weight: 500;
  color: #4a5568;
}

.total-input {
  width: 150px;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: right;
}

.total-input:focus {
  outline: none;
  border-color: #2FB8A6;
}

.vat-row {
  color: #2FB8A6;
  font-weight: 500;
}

.grand-total {
  border-bottom: none;
  padding-top: 16px;
  font-weight: 700;
  font-size: 18px;
}

.total-amount {
  color: #2FB8A6;
  font-size: 20px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.btn-primary {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
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
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: #cbd5e0;
  transform: translateY(-1px);
}

@media (max-width: 768px) {
  .create-purchase-container {
    padding: 16px;
  }
  
  .item-row {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .totals-grid {
    max-width: 100%;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
    justify-content: center;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .vat-rate-group {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>