<template>
  <div class="stock-container">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1 class="page-title">{{ $t('stock.title') }}</h1>
        <p class="page-subtitle">{{ $t('stock.subtitle') }}</p>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-cards">
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-teal-100">
          <svg class="stat-mini-svg text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ totalProducts }}</p>
          <p class="stat-label-mini">{{ $t('dashboard.totalProducts') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-orange-100">
          <svg class="stat-mini-svg text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ lowStockCount }}</p>
          <p class="stat-label-mini">{{ $t('dashboard.lowStockAlerts') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-red-100">
          <svg class="stat-mini-svg text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ outOfStockCount }}</p>
          <p class="stat-label-mini">{{ $t('products.outOfStock') }}</p>
        </div>
      </div>
    </div>

    <!-- Branch Info Card -->
    <div class="branch-info glass-card" v-if="userBranch">
      <div class="branch-info-content">
        <div class="branch-info-icon">
          <svg class="branch-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <div class="branch-info-text">
          <span class="branch-label">{{ $t('stock.yourBranch') }}:</span>
          <strong class="branch-name">{{ userBranch.name }}</strong>
        </div>
        <div class="branch-info-actions">
          <label class="low-stock-filter">
            <input v-model="lowStockOnly" type="checkbox" @change="fetchStock" />
            <span>{{ $t('stock.showLowStockOnly') }}</span>
          </label>
          <button @click="fetchStock" class="refresh-btn" :disabled="loading">
            <svg class="refresh-svg-icon" :class="{ 'spin': loading }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('common.refresh') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>{{ $t('stock.loadingStock') }}</p>
    </div>

    <!-- No Branch Assigned State -->
    <div v-else-if="!userBranch" class="empty-state glass-card">
      <svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <h3>{{ $t('stock.noBranchAssigned') }}</h3>
      <p>{{ $t('stock.noBranchMessage') }}</p>
    </div>

    <!-- Stock Table with Grouping -->
    <div v-else-if="stockData.length" class="stock-table-container glass-card">
      <div class="table-header">
        <h3 class="table-title">{{ $t('stock.inventoryList') }}</h3>
        <span class="table-count">{{ groupedStockData.length }} {{ $t('products.groups') }}</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="stock-table">
          <thead>
            <tr>
              <th>{{ $t('stock.groupProduct') }}</th>
              <th>{{ $t('products.sku') }}</th>
              <th>{{ $t('stock.currentStock') }}</th>
              <th>{{ $t('stock.reorderLevel') }}</th>
              <th>{{ $t('common.status') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in groupedStockData" :key="group.prefix">
              <tr class="group-row" @click="toggleGroup(group.prefix)">
                <td colspan="5" class="group-header">
                  <div class="group-header-content">
                    <div class="group-info">
                      <svg class="group-icon" :class="{ 'rotated': expandedGroups.has(group.prefix) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span class="group-prefix">{{ group.prefix }}</span>
                      <span class="group-count">({{ group.items.length }} {{ $t('products.variants') }})</span>
                      <span class="group-total-stock">{{ $t('products.totalStockUnits', { count: group.totalQuantity }) }}</span>
                    </div>
                    <div class="group-status">
                      <span :class="getGroupStatusBadge(group.status)" class="status-badge">
                        <span class="status-dot" :class="group.status"></span>
                        {{ getGroupStatusText(group.status) }}
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
              
              <template v-if="expandedGroups.has(group.prefix)">
                <tr v-for="item in group.items" :key="item.product_id" class="stock-row sub-stock-row">
                  <td class="product-cell sub-product">
                    <div class="product-name">{{ item.product_name }}</div>
                    <div class="product-category" v-if="item.category">{{ item.category }}</div>
                  </td>
                  <td class="sku-cell sub-sku">{{ item.product_sku }}</td>
                  <td class="stock-cell">
                    <div class="stock-value" :class="getStockClass(item.quantity)">
                      {{ item.quantity }} {{ $t('common.units') }}
                    </div>
                    <div class="stock-bar">
                      <div class="stock-fill" :style="{ width: getStockPercentage(item.quantity, item.reorder_level) + '%' }"></div>
                    </div>
                  </td>
                  <td class="reorder-cell">
                    <span class="reorder-value">{{ item.reorder_level }} {{ $t('common.units') }}</span>
                    <button 
                      v-if="item.quantity < item.reorder_level" 
                      @click.stop="openAddStock(item)" 
                      class="quick-restock"
                    >
                      {{ $t('stock.restock') }}
                    </button>
                  </td>
                  <td class="status-cell">
                    <span :class="getStatusBadge(item.status)" class="status-badge">
                      <span class="status-dot" :class="item.status"></span>
                      {{ getStatusText(item.status) }}
                    </span>
                  </td>
                </tr>
              </template>
            </template>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Empty Stock State -->
    <div v-else-if="!loading && userBranch" class="empty-state glass-card">
      <svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
      </svg>
      <h3>{{ $t('stock.noStockData') }}</h3>
      <p>{{ $t('stock.noStockMessage') }}</p>
    </div>

    <!-- Add Stock Modal -->
    <div v-if="showAddModal" class="modal-overlay" @click.self="closeAddStock">
      <div class="modal-container">
        <div class="modal-header">
          <h2 class="modal-title">{{ $t('stock.addStock') }}</h2>
          <button @click="closeAddStock" class="modal-close">
            <svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="modal-product-info">
          <div class="product-icon">
            <svg class="product-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p class="product-name-modal">{{ selectedProduct?.product_name }}</p>
            <p class="product-sku-modal">{{ selectedProduct?.product_sku }}</p>
          </div>
        </div>
        
        <form @submit.prevent="addStock" class="modal-form">
          <div class="form-field">
            <label class="form-label">{{ $t('stock.quantityToAdd') }} *</label>
            <input 
              v-model.number="quantity" 
              type="number" 
              step="0.01" 
              min="0.01"
              class="form-input" 
              required 
              :placeholder="$t('stock.enterQuantity')"
            />
          </div>
          
          <div class="form-field">
            <label class="form-label">{{ $t('common.notes') }} ({{ $t('common.optional') }})</label>
            <textarea 
              v-model="notes" 
              rows="3" 
              class="form-textarea" 
              :placeholder="$t('stock.notesPlaceholder')"
            ></textarea>
          </div>
          
          <div class="current-stock-info">
            <span>{{ $t('stock.currentStock') }}: </span>
            <strong>{{ selectedProduct?.quantity || 0 }} {{ $t('common.units') }}</strong>
            <span v-if="quantity > 0" class="after-add">
              → {{ $t('stock.afterAdd') }}: <strong>{{ (selectedProduct?.quantity || 0) + quantity }} {{ $t('common.units') }}</strong>
            </span>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeAddStock" class="btn-secondary">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn-primary" :disabled="!quantity || quantity <= 0">
              <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('stock.addStock') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const { t } = useI18n()
const userBranch = ref(null)
const stockData = ref([])
const lowStockOnly = ref(false)
const showAddModal = ref(false)
const selectedProduct = ref(null)
const quantity = ref(0)
const notes = ref('')
const loading = ref(false)
const expandedGroups = ref(new Set())

const getSkuPrefix = (sku) => {
  const match = sku.match(/^[A-Za-z]+/)
  return match ? match[0] : sku
}

const groupedStockData = computed(() => {
  const groups = new Map()
  
  stockData.value.forEach(item => {
    const prefix = getSkuPrefix(item.product_sku)
    
    if (!groups.has(prefix)) {
      groups.set(prefix, {
        prefix: prefix,
        items: [],
        totalQuantity: 0,
        status: 'normal'
      })
    }
    
    const group = groups.get(prefix)
    group.items.push(item)
    group.totalQuantity += item.quantity
    
    if (item.quantity === 0) {
      group.status = 'out_of_stock'
    } else if (item.quantity < item.reorder_level && group.status !== 'out_of_stock') {
      group.status = 'low'
    } else if (group.status !== 'out_of_stock' && group.status !== 'low') {
      group.status = 'normal'
    }
  })
  
  for (const group of groups.values()) {
    group.items.sort((a, b) => a.product_sku.localeCompare(b.product_sku))
  }
  
  return Array.from(groups.values()).sort((a, b) => a.prefix.localeCompare(b.prefix))
})

const toggleGroup = (prefix) => {
  if (expandedGroups.value.has(prefix)) {
    expandedGroups.value.delete(prefix)
  } else {
    expandedGroups.value.add(prefix)
  }
  expandedGroups.value = new Set(expandedGroups.value)
}

const getGroupStatusBadge = (status) => {
  const badges = { normal: 'status-normal', low: 'status-low', out_of_stock: 'status-out' }
  return badges[status] || 'status-normal'
}

const getGroupStatusText = (status) => {
  const texts = { normal: t('stock.normal'), low: t('stock.lowStock'), out_of_stock: t('products.outOfStock') }
  return texts[status] || t('common.unknown')
}

const totalProducts = computed(() => stockData.value.length)
const lowStockCount = computed(() => stockData.value.filter(item => item.status === 'low').length)
const outOfStockCount = computed(() => stockData.value.filter(item => item.status === 'out_of_stock').length)

const getStockClass = (quantity) => {
  if (quantity === 0) return 'stock-critical'
  if (quantity < 10) return 'stock-low'
  return 'stock-normal'
}

const getStockPercentage = (quantity, reorderLevel) => {
  if (quantity === 0) return 0
  if (!reorderLevel || reorderLevel === 0) return Math.min((quantity / 100) * 100, 100)
  const percentage = (quantity / (reorderLevel * 2)) * 100
  return Math.min(percentage, 100)
}

const getStatusBadge = (status) => {
  const badges = { normal: 'status-normal', low: 'status-low', out_of_stock: 'status-out' }
  return badges[status] || 'status-normal'
}

const getStatusText = (status) => {
  const texts = { normal: t('stock.normal'), low: t('stock.lowStock'), out_of_stock: t('products.outOfStock') }
  return texts[status] || t('common.unknown')
}

const fetchCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me')
    const user = response.data
    
    if (user.branch_id) {
      userBranch.value = {
        id: user.branch_id,
        name: user.branch_name || `Branch ${user.branch_id}`
      }
      await fetchStock()
    } else {
      userBranch.value = null
    }
  } catch (error) {
    console.error('Failed to fetch user info:', error)
    userBranch.value = null
  }
}

const fetchStock = async () => {
  if (!userBranch.value) return
  
  loading.value = true
  try {
    const response = await api.get('/stock/', {
      params: { low_stock: lowStockOnly.value }
    })
    stockData.value = response.data
  } catch (error) {
    console.error('Failed to fetch stock:', error)
    stockData.value = []
  } finally {
    loading.value = false
  }
}

const openAddStock = (item) => {
  selectedProduct.value = item
  quantity.value = 0
  notes.value = ''
  showAddModal.value = true
}

const closeAddStock = () => {
  showAddModal.value = false
  selectedProduct.value = null
  quantity.value = 0
  notes.value = ''
}

const addStock = async () => {
  if (!quantity.value || quantity.value <= 0) {
    alert(t('stock.validQuantity'))
    return
  }
  
  try {
    await api.post(`/stock/${userBranch.value.id}/${selectedProduct.value.product_id}/add`, null, {
      params: { quantity: quantity.value, notes: notes.value }
    })
    await fetchStock()
    closeAddStock()
    alert(t('stock.stockAdded'))
  } catch (error) {
    console.error('Failed to add stock:', error)
    alert(error.response?.data?.detail || t('stock.failedToAdd'))
  }
}

onMounted(() => {
  fetchCurrentUser()
})
</script>

<style scoped>
/* Add these new styles for grouping */
.group-row {
  cursor: pointer;
  background: rgba(47, 184, 166, 0.03);
  border-bottom: 1px solid rgba(47, 184, 166, 0.1);
}

.group-row:hover {
  background: rgba(47, 184, 166, 0.08);
}

.group-header {
  padding: 0.75rem 1rem !important;
}

.group-header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.group-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.2s ease;
  color: #2FB8A6;
}

.group-icon.rotated {
  transform: rotate(90deg);
}

.group-prefix {
  font-weight: 700;
  font-size: 1rem;
  color: #1A2A2E;
  font-family: monospace;
}

.group-count {
  font-size: 0.8rem;
  color: #6E8B90;
}

.group-total-stock {
  font-size: 0.8rem;
  color: #2FB8A6;
  font-weight: 500;
}

.group-status {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sub-stock-row {
  background: rgba(255, 255, 255, 0.5);
}

.sub-stock-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.sub-product {
  padding-left: 2rem !important;
}

.sub-sku {
  padding-left: 2rem !important;
}

/* Existing styles */
.branch-info {
  padding: 1.25rem;
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.08), rgba(111, 211, 195, 0.08));
  border-left: 4px solid #2FB8A6;
}

.branch-info-content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.branch-info-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.15), rgba(111, 211, 195, 0.15));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
}

.branch-svg-icon {
  width: 22px;
  height: 22px;
}

.branch-info-text {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.branch-label {
  font-size: 0.9rem;
  color: #6B7280;
}

.branch-name {
  font-size: 1rem;
  color: #1A2A2E;
  font-weight: 600;
}

.branch-info-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.loading-state {
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 40px;
  height: 40px;
  margin: 0 auto 1rem;
  border: 3px solid rgba(47, 184, 166, 0.1);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-state p {
  color: #6B7280;
}

.spin {
  animation: spin 0.8s linear infinite;
}

.after-add {
  margin-left: 1rem;
  color: #2FB8A6;
}

/* Keep all existing styles from your original component */
.stock-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 2rem;
  animation: fadeIn 0.5s ease-out;
}

.header-section {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #6B7280;
  font-size: 0.9rem;
}

/* Stats Cards */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card-mini {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat-card-mini:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
}

.stat-icon-mini {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-mini-svg {
  width: 20px;
  height: 20px;
}

.stat-value-mini {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A2A2E;
  line-height: 1.2;
}

.stat-label-mini {
  font-size: 0.75rem;
  color: #6B7280;
}

/* Glass card effect */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

/* Low stock filter */
.low-stock-filter {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: #4B5563;
  white-space: nowrap;
}

.low-stock-filter input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: #4B5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-svg-icon {
  width: 14px;
  height: 14px;
}

.refresh-btn:hover:not(:disabled) {
  background: rgba(110, 139, 144, 0.2);
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem;
}

.empty-svg-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  color: #9CA3AF;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6B7280;
}

/* Stock Table */
.stock-table-container {
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
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.table-count {
  font-size: 0.8rem;
  color: #6B7280;
  background: rgba(110, 139, 144, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.stock-table {
  width: 100%;
  border-collapse: collapse;
}

.stock-table th {
  text-align: left;
  padding: 1rem 1rem;
  background: rgba(47, 184, 166, 0.05);
  color: #4B5563;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stock-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
}

.stock-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.stock-row td {
  padding: 1rem;
  vertical-align: middle;
}

.product-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.product-name {
  font-weight: 600;
  color: #1A2A2E;
}

.product-category {
  font-size: 0.7rem;
  color: #6B7280;
}

.sku-cell {
  font-family: monospace;
  font-size: 0.85rem;
  color: #4B5563;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 100px;
}

.stock-value {
  font-weight: 500;
  font-size: 0.85rem;
}

.stock-critical {
  color: #EF4444;
}

.stock-low {
  color: #F97316;
}

.stock-normal {
  color: #34D399;
}

.stock-bar {
  width: 100%;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.reorder-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.reorder-value {
  font-size: 0.85rem;
  color: #4B5563;
}

.quick-restock {
  padding: 0.25rem 0.5rem;
  background: rgba(47, 184, 166, 0.1);
  border: none;
  border-radius: 6px;
  color: #2FB8A6;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.quick-restock:hover {
  background: rgba(47, 184, 166, 0.2);
  transform: scale(1.05);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-normal {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.status-low {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.status-out {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.normal {
  background: #34D399;
}

.status-dot.low {
  background: #F97316;
}

.status-dot.out_of_stock {
  background: #EF4444;
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
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A2A2E;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6B7280;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-svg {
  width: 18px;
  height: 18px;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1A2A2E;
}

.modal-product-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(47, 184, 166, 0.05);
  margin: 1rem 1.5rem;
  border-radius: 16px;
}

.product-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.1), rgba(111, 211, 195, 0.1));
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
}

.product-svg-icon {
  width: 24px;
  height: 24px;
}

.product-name-modal {
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.product-sku-modal {
  font-size: 0.7rem;
  color: #6B7280;
}

.modal-form {
  padding: 0 1.5rem 1.5rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.current-stock-info {
  padding: 0.75rem;
  background: rgba(110, 139, 144, 0.05);
  border-radius: 12px;
  font-size: 0.85rem;
  color: #4B5563;
  margin-bottom: 1rem;
}

.current-stock-info strong {
  color: #1A2A2E;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
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

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-svg-icon {
  width: 16px;
  height: 16px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: #4B5563;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(110, 139, 144, 0.2);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 768px) {
  .branch-info-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .branch-info-actions {
    width: 100%;
    justify-content: space-between;
  }
  
  .stock-table {
    font-size: 0.85rem;
  }
  
  .stock-table th,
  .stock-table td {
    padding: 0.75rem;
  }
  
  .group-info {
    flex-wrap: wrap;
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stock-table {
    display: block;
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
}
</style>