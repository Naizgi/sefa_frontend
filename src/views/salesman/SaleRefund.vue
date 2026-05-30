<template>
  <div class="refund-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('refund.title') }}</h1>
        <p class="page-subtitle">{{ $t('refund.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button @click="$router.push('/sales')" class="btn-secondary">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          {{ $t('refund.backToSales') }}
        </button>
      </div>
    </div>

    <!-- Sales Table Section -->
    <div class="sales-table-section glass-card">
      <div class="section-header">
        <h3>{{ $t('refund.recentSales') }}</h3>
        <div class="filter-buttons">
          <button @click="setFilter('day')" :class="['filter-btn', { active: currentFilter === 'day' }]">
            {{ $t('reports.today') }}
          </button>
          <button @click="setFilter('week')" :class="['filter-btn', { active: currentFilter === 'week' }]">
            {{ $t('reports.thisWeek') }}
          </button>
          <button @click="setFilter('month')" :class="['filter-btn', { active: currentFilter === 'month' }]">
            {{ $t('reports.thisMonth') }}
          </button>
          <button @click="fetchAllSales" class="refresh-btn-small" :disabled="loadingSales">
            <svg class="refresh-svg-icon" :class="{ 'spin': loadingSales }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      
      <div class="table-container">
        <div v-if="loadingSales" class="loading-small">
          <div class="spinner-small"></div>
          <span>{{ $t('refund.loadingSales') }}</span>
        </div>
        <table v-else class="sales-table">
          <thead>
            <tr>
              <th>{{ $t('sales.invoice') }}</th>
              <th>{{ $t('sales.customer') }}</th>
              <th>{{ $t('common.date') }}</th>
              <th>{{ $t('common.total') }}</th>
              <th>{{ $t('sales.paymentMethod') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in filteredSales" :key="sale.id" class="sale-row">
              <td class="invoice-number">{{ sale.invoice_number }}</td>
              <td>{{ sale.customer_name || $t('sales.walkInCustomer') }}</td>
              <td>{{ formatDate(sale.created_at) }}</td>
              <td class="amount">{{ formatCurrency(sale.total_amount) }}</td>
              <td>{{ formatPaymentMethod(sale.payment_method) }}</td>
              <td>
                <span :class="getStatusClass(sale.status)" class="status-badge-small">
                  {{ getRefundStatusText(sale.status) }}
                </span>
              </td>
              <td>
                <button @click="selectSale(sale)" class="select-sale-btn" :disabled="sale.status === 'refunded'">
                  {{ $t('refund.selectForRefund') }}
                </button>
              </td>
            </tr>
            <tr v-if="filteredSales.length === 0 && !loadingSales">
              <td colspan="7" class="empty-table">{{ $t('refund.noSalesFound') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Search Section -->
    <div class="search-section glass-card">
      <div class="search-title">
        <svg class="search-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <h3>{{ $t('refund.searchByInvoice') }}</h3>
      </div>
      <div class="search-inputs">
        <input v-model="searchQuery" type="text" :placeholder="$t('refund.enterInvoice')" class="search-input" @keyup.enter="searchSale" />
        <button @click="searchSale" class="search-btn" :disabled="loading">{{ $t('common.search') }}</button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>{{ $t('refund.loadingDetails') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state glass-card">
      <svg class="error-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3>{{ error }}</h3>
      <p>{{ $t('refund.tryDifferentInvoice') }}</p>
    </div>

    <!-- Sale Details -->
    <div v-if="selectedSale && !loading" class="sale-details glass-card">
      <div class="details-header">
        <h2>{{ $t('refund.saleDetails') }}</h2>
        <span class="sale-status" :class="getStatusClass(selectedSale.status)">
          {{ getRefundStatusText(selectedSale.status) }}
        </span>
      </div>
      
      <div class="sale-info-grid">
        <div class="info-item">
          <label>{{ $t('refund.invoiceNumber') }}:</label>
          <span class="invoice-number">{{ selectedSale.invoice_number }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('common.date') }}:</label>
          <span>{{ formatDate(selectedSale.created_at) }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('sales.customer') }}:</label>
          <span>{{ selectedSale.customer_name || $t('sales.walkInCustomer') }}</span>
        </div>
        <div class="info-item">
          <label>{{ $t('sales.paymentMethod') }}:</label>
          <span>{{ formatPaymentMethod(selectedSale.payment_method) }}</span>
        </div>
        <div class="info-item" v-if="selectedSale.transaction_reference">
          <label>{{ $t('refund.transactionRef') }}:</label>
          <span>{{ selectedSale.transaction_reference }}</span>
        </div>
      </div>

      <!-- Items Table -->
      <div class="items-section">
        <h3>{{ $t('refund.itemsToRefund') }}</h3>
        <div class="table-container">
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 50px">
                  <input type="checkbox" v-model="selectAll" @change="toggleSelectAll" :disabled="isSaleRefunded" />
                </th>
                <th>{{ $t('sales.product') }}</th>
                <th>{{ $t('refund.quantitySold') }}</th>
                <th>{{ $t('sales.unitPrice') }}</th>
                <th>{{ $t('common.total') }}</th>
                <th>{{ $t('refund.refundQty') }}</th>
                <th>{{ $t('refund.refundAmount') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedSale.items" :key="item.id" class="item-row">
                <td class="checkbox-cell">
                  <input type="checkbox" v-model="selectedItems[item.id]" @change="updateItemSelection(item)" :disabled="isSaleRefunded || getMaxRefundable(item) === 0" />
                </td>
                <td class="product-cell">
                  <div class="product-info">
                    <span class="product-name">{{ item.product_name || item.product?.name }}</span>
                    <span class="product-sku">{{ item.product_sku || item.product?.sku }}</span>
                  </div>
                </td>
                <td class="quantity-cell">{{ item.quantity }}</td>
                <td class="price-cell">{{ formatCurrency(item.unit_price) }}</td>
                <td class="total-cell">{{ formatCurrency(item.line_total) }}</td>
                <td class="refund-qty-cell">
                  <input type="number" v-model.number="refundQuantities[item.id]" :max="getMaxRefundable(item)" min="0" step="1" class="refund-qty-input" :disabled="!selectedItems[item.id] || isSaleRefunded" @input="calculateRefundAmount(item)" />
                  <span class="max-refund" v-if="item.refunded_quantity > 0">
                    ({{ $t('refund.alreadyRefunded') }}: {{ item.refunded_quantity }})
                  </span>
                </td>
                <td class="refund-amount-cell">{{ formatCurrency(refundAmounts[item.id] || 0) }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr class="total-row">
                <td colspan="5"></td>
                <td><strong>{{ $t('refund.totalRefund') }}:</strong></td>
                <td class="total-refund">{{ formatCurrency(totalRefundAmount) }}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <!-- Refund Form -->
      <div class="refund-form" v-if="totalRefundAmount > 0 && !isSaleRefunded">
        <h3>{{ $t('refund.refundInformation') }}</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>{{ $t('refund.refundReason') }} *</label>
            <select v-model="refundReason" class="form-select" required>
              <option value="">{{ $t('refund.selectReason') }}</option>
              <option value="customer_request">{{ $t('refund.customerRequest') }}</option>
              <option value="defective_product">{{ $t('refund.defectiveProduct') }}</option>
              <option value="wrong_product">{{ $t('refund.wrongProduct') }}</option>
              <option value="changed_mind">{{ $t('refund.changedMind') }}</option>
              <option value="other">{{ $t('refund.other') }}</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>{{ $t('refund.refundMethod') }} *</label>
            <select v-model="refundMethod" class="form-select" @change="onRefundMethodChange">
              <option value="cash">{{ $t('pos.cash') }}</option>
              <option value="transfer">{{ $t('pos.bankTransfer') }}</option>
              <option value="original_method">{{ $t('refund.originalMethod') }}</option>
            </select>
          </div>

          <div class="form-group" v-if="refundMethod === 'transfer'">
            <label>{{ $t('refund.bankAccount') }} *</label>
            <select v-model="selectedBankAccount" class="form-select">
              <option value="">{{ $t('refund.selectBankAccount') }}</option>
              <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                {{ account.bank_name }} - {{ account.account_number }}
              </option>
            </select>
          </div>

          <div class="form-group full-width">
            <label>{{ $t('refund.additionalNotes') }}</label>
            <textarea v-model="refundNotes" rows="3" class="form-textarea" :placeholder="$t('refund.notesPlaceholder')"></textarea>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions" v-if="totalRefundAmount > 0 && !isSaleRefunded">
        <button @click="cancelRefund" class="btn-secondary">{{ $t('common.cancel') }}</button>
        <button @click="processRefund" class="btn-primary" :disabled="processing || !canProcessRefund">
          <span v-if="processing" class="spinner-small"></span>
          <span v-else>{{ $t('refund.processRefund') }} ({{ formatCurrency(totalRefundAmount) }})</span>
        </button>
      </div>

      <!-- Already Refunded Message -->
      <div v-if="isSaleRefunded" class="refunded-message">
        <svg class="info-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>{{ $t('refund.fullyRefunded') }}</p>
      </div>
    </div>

    <!-- Success Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast success">
        <svg class="toast-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
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
const loadingSales = ref(false)
const processing = ref(false)
const error = ref(null)
const searchQuery = ref('')
const selectedSale = ref(null)
const selectedItems = ref({})
const refundQuantities = ref({})
const refundAmounts = ref({})
const selectAll = ref(false)
const refundReason = ref('')
const refundMethod = ref('cash')
const selectedBankAccount = ref('')
const refundNotes = ref('')
const showToast = ref(false)
const toastMessage = ref('')
const bankAccounts = ref([])
const allSales = ref([])
const currentFilter = ref('week')

const isSaleRefunded = computed(() => selectedSale.value?.status === 'refunded')

const totalRefundAmount = computed(() => {
  return Object.values(refundAmounts.value).reduce((sum, amount) => sum + (amount || 0), 0)
})

const canProcessRefund = computed(() => {
  return totalRefundAmount.value > 0 && refundReason.value && (refundMethod.value !== 'transfer' || selectedBankAccount.value)
})

const filteredSales = computed(() => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  
  return allSales.value.filter(sale => {
    const saleDate = new Date(sale.created_at)
    if (currentFilter.value === 'day') return saleDate >= today
    else if (currentFilter.value === 'week') {
      const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
      return saleDate >= weekAgo
    } else if (currentFilter.value === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      return saleDate >= startOfMonth
    }
    return true
  })
})

const getMaxRefundable = (item) => {
  const alreadyRefunded = item.refunded_quantity || 0
  return (item.quantity || 0) - alreadyRefunded
}

const getRefundStatusText = (status) => {
  const texts = { completed: t('sales.completed'), refunded: t('sales.refunded'), partially_refunded: t('sales.partiallyRefunded') }
  return texts[status] || status
}

const getStatusClass = (status) => {
  return { completed: 'status-completed', refunded: 'status-refunded', partially_refunded: 'status-partial' }[status] || 'status-completed'
}

const formatPaymentMethod = (method) => {
  return { cash: t('pos.cash'), transfer: t('pos.bankTransfer'), credit_card: t('refund.creditCard'), debit_card: t('refund.debitCard') }[method] || method
}

const fetchAllSales = async () => {
  loadingSales.value = true
  try {
    const params = {}; const now = new Date()
    if (currentFilter.value === 'day') { const today = now.toISOString().split('T')[0]; params.from_date = today; params.to_date = today }
    else if (currentFilter.value === 'week') { const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7); params.from_date = weekAgo.toISOString().split('T')[0]; params.to_date = now.toISOString().split('T')[0] }
    else if (currentFilter.value === 'month') { const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1); params.from_date = startOfMonth.toISOString().split('T')[0]; params.to_date = now.toISOString().split('T')[0] }
    const response = await api.get('/sales', { params })
    allSales.value = response.data || []
  } catch (error) { console.error('Failed to fetch sales:', error); allSales.value = [] } finally { loadingSales.value = false }
}

const setFilter = (filter) => { currentFilter.value = filter; fetchAllSales() }

const selectSale = async (sale) => {
  if (sale.status === 'refunded') { showToastMessage(t('refund.alreadyRefundedToast')); return }
  loading.value = true; error.value = null
  try {
    const response = await api.get(`/sales/${sale.id}`)
    selectedSale.value = response.data
    initializeRefundTracking()
  } catch (err) { error.value = err.response?.data?.detail || t('refund.failedToLoad') } finally { loading.value = false }
}

const searchSale = async () => {
  if (!searchQuery.value.trim()) { error.value = t('refund.enterInvoiceAlert'); return }
  loading.value = true; error.value = null
  try {
    const response = await api.get('/sales', { params: { search: searchQuery.value } })
    const sales = response.data || []
    const foundSale = sales.find(s => s.invoice_number?.toLowerCase() === searchQuery.value.toLowerCase())
    if (!foundSale) { error.value = t('refund.noSaleFound'); selectedSale.value = null; return }
    const saleDetails = await api.get(`/sales/${foundSale.id}`)
    selectedSale.value = saleDetails.data
    initializeRefundTracking()
  } catch (err) { error.value = err.response?.data?.detail || t('refund.failedToFind') } finally { loading.value = false }
}

const initializeRefundTracking = () => {
  selectedItems.value = {}; refundQuantities.value = {}; refundAmounts.value = {}; selectAll.value = false
  selectedSale.value.items.forEach(item => {
    selectedItems.value[item.id] = false; refundQuantities.value[item.id] = 0; refundAmounts.value[item.id] = 0
  })
}

const toggleSelectAll = () => {
  selectedSale.value.items.forEach(item => {
    const maxRefundable = getMaxRefundable(item)
    if (maxRefundable > 0) {
      selectedItems.value[item.id] = selectAll.value
      refundQuantities.value[item.id] = selectAll.value ? maxRefundable : 0
      if (selectAll.value) calculateRefundAmount(item)
      else refundAmounts.value[item.id] = 0
    }
  })
}

const updateItemSelection = (item) => {
  if (!selectedItems.value[item.id]) { refundQuantities.value[item.id] = 0; refundAmounts.value[item.id] = 0 }
  else { const maxRefundable = getMaxRefundable(item); if (refundQuantities.value[item.id] === 0) { refundQuantities.value[item.id] = maxRefundable; calculateRefundAmount(item) } }
  selectAll.value = selectedSale.value.items.every(item => getMaxRefundable(item) === 0 || selectedItems.value[item.id])
}

const calculateRefundAmount = (item) => { refundAmounts.value[item.id] = (refundQuantities.value[item.id] || 0) * (item.unit_price || 0) }

const loadBankAccounts = async () => {
  try { const response = await api.get('/sales/bank-accounts'); bankAccounts.value = response.data || [] } catch (error) { bankAccounts.value = [] }
}

const onRefundMethodChange = () => { if (refundMethod.value !== 'transfer') selectedBankAccount.value = '' }

const processRefund = async () => {
  if (!canProcessRefund.value) { alert(t('refund.fillRequired')); return }
  const refundItems = []
  for (const item of selectedSale.value.items) { const qty = refundQuantities.value[item.id] || 0; if (qty > 0) refundItems.push({ sale_item_id: item.id, quantity: qty, reason: refundReason.value }) }
  if (refundItems.length === 0) { alert(t('refund.selectItemAlert')); return }
  processing.value = true
  try {
    const refundData = { original_sale_id: selectedSale.value.id, refund_reason: refundReason.value, refund_method: refundMethod.value, items: refundItems, notes: refundNotes.value }
    if (refundMethod.value === 'transfer') refundData.bank_account_id = selectedBankAccount.value
    await api.post('/sales/refunds', refundData)
    showToastMessage(t('refund.refundSuccess', { total: formatCurrency(totalRefundAmount.value) }))
    setTimeout(() => { selectedSale.value = null; searchQuery.value = ''; refundReason.value = ''; refundMethod.value = 'cash'; selectedBankAccount.value = ''; refundNotes.value = ''; fetchAllSales() }, 2000)
  } catch (error) { alert(error.response?.data?.detail || t('refund.refundFailed')) } finally { processing.value = false }
}

const cancelRefund = () => {
  if (confirm(t('refund.cancelConfirm'))) { selectedSale.value = null; searchQuery.value = ''; error.value = null; refundReason.value = ''; refundMethod.value = 'cash'; selectedBankAccount.value = ''; refundNotes.value = '' }
}

const showToastMessage = (message) => { toastMessage.value = message; showToast.value = true; setTimeout(() => { showToast.value = false }, 3000) }

onMounted(() => { loadBankAccounts(); fetchAllSales() })
</script>

<style scoped>
/* All your existing styles remain the same */
.sales-table-section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}

.section-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.filter-buttons {
  display: flex;
  gap: 8px;
}

.filter-btn {
  padding: 6px 16px;
  background: rgba(110, 139, 144, 0.1);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
}

.filter-btn.active {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
}

.refresh-btn-small {
  padding: 6px 12px;
  background: rgba(110, 139, 144, 0.1);
  border: none;
  border-radius: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.refresh-svg-icon {
  width: 14px;
  height: 14px;
}

.loading-small {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  color: #6E8B90;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
}

.sales-table th,
.sales-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.sales-table th {
  background: rgba(47, 184, 166, 0.05);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.sale-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.invoice-number {
  font-family: monospace;
  font-weight: 600;
  color: #2FB8A6;
}

.amount {
  font-weight: 600;
  color: #1A2A2E;
}

.status-badge-small {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: 500;
}

.select-sale-btn {
  padding: 4px 12px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.select-sale-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(47, 184, 166, 0.3);
}

.select-sale-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-table {
  text-align: center;
  padding: 40px;
  color: #6E8B90;
}

/* Keep all your existing styles from the original component */
.refund-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.5s ease-out;
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
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 4px;
}

.page-subtitle {
  color: #6E8B90;
  font-size: 0.9rem;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  margin-bottom: 24px;
}

.search-section {
  text-align: center;
}

.search-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 20px;
}

.search-svg-icon {
  width: 24px;
  height: 24px;
  color: #2FB8A6;
}

.search-title h3 {
  font-size: 1.2rem;
  color: #1A2A2E;
}

.search-inputs {
  display: flex;
  gap: 12px;
  max-width: 500px;
  margin: 0 auto;
}

.search-input {
  flex: 1;
  padding: 12px 16px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  font-size: 0.9rem;
}

.search-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.search-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.details-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.sale-status {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-refunded {
  background: #ffebee;
  color: #f44336;
}

.status-partial {
  background: #fff3e0;
  color: #ff9800;
}

.sale-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(47, 184, 166, 0.05);
  border-radius: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-item label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #6E8B90;
  text-transform: uppercase;
}

.info-item span {
  font-size: 0.9rem;
  font-weight: 500;
  color: #1A2A2E;
}

.invoice-number {
  font-family: monospace;
  font-size: 1rem;
  color: #2FB8A6;
}

.items-section h3 {
  margin-bottom: 16px;
  color: #1A2A2E;
}

.table-container {
  overflow-x: auto;
  margin-bottom: 24px;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
}

.items-table th, .items-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.items-table th {
  background: rgba(47, 184, 166, 0.05);
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-name {
  font-weight: 600;
  color: #1A2A2E;
}

.product-sku {
  font-size: 0.7rem;
  color: #6E8B90;
}

.refund-qty-input {
  width: 80px;
  padding: 6px 8px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 6px;
  text-align: center;
}

.max-refund {
  display: block;
  font-size: 0.7rem;
  color: #f44336;
  margin-top: 4px;
}

.refund-amount {
  font-weight: 600;
  color: #f44336;
}

.total-row {
  background: rgba(47, 184, 166, 0.05);
  font-weight: bold;
}

.total-refund {
  font-size: 1.1rem;
  color: #f44336;
}

.refund-form h3 {
  margin-bottom: 16px;
  color: #1A2A2E;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  font-weight: 500;
  color: #4a5568;
  font-size: 0.85rem;
}

.form-select, .form-textarea {
  padding: 10px 12px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
}

.form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.form-textarea {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.btn-primary, .btn-secondary {
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-primary {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: #e2e8f0;
  border: 1px solid #cbd5e0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.refunded-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 20px;
  background: #fff3e0;
  border-radius: 12px;
  margin-top: 20px;
}

.info-svg-icon {
  width: 24px;
  height: 24px;
  color: #ff9800;
}

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

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.error-state {
  text-align: center;
  padding: 60px;
}

.error-svg-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #f44336;
}

.error-state h3 {
  font-size: 1.2rem;
  color: #1A2A2E;
  margin-bottom: 8px;
}

.error-state p {
  color: #6E8B90;
}

.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #4caf50;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  animation: slideInRight 0.3s ease;
}

.toast-svg-icon {
  width: 20px;
  height: 20px;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

@media (max-width: 768px) {
  .refund-container {
    padding: 16px;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-buttons {
    width: 100%;
    justify-content: space-between;
  }
  
  .search-inputs {
    flex-direction: column;
  }
  
  .sale-info-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .items-table {
    font-size: 0.85rem;
  }
  
  .items-table th, .items-table td {
    padding: 8px;
  }
  
  .refund-qty-input {
    width: 60px;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .form-actions button {
    width: 100%;
    justify-content: center;
  }
  
  .sales-table {
    font-size: 0.8rem;
  }
  
  .sales-table th, .sales-table td {
    padding: 8px;
  }
}
</style>