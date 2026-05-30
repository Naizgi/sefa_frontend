<template>
  <div class="products-container">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1 class="page-title">{{ $t('products.title') }}</h1>
        <p class="page-subtitle">{{ $t('products.subtitle') }}</p>
      </div>
      <button @click="openModal" class="btn-primary" :disabled="loading">
        <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('products.addProduct') }}
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading && !productsWithStock.length" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Stats Cards -->
    <div v-else class="stats-cards">
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-teal-100">
          <svg class="stat-mini-svg text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ groupedProducts.length }}</p>
          <p class="stat-label-mini">{{ $t('products.productGroups') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-green-100">
          <svg class="stat-mini-svg text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ activeGroupsCount }}</p>
          <p class="stat-label-mini">{{ $t('products.activeGroups') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-orange-100">
          <svg class="stat-mini-svg text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ inactiveGroupsCount }}</p>
          <p class="stat-label-mini">{{ $t('products.inactiveGroups') }}</p>
        </div>
      </div>
      <div class="stat-card-mini">
        <div class="stat-icon-mini bg-blue-100">
          <svg class="stat-mini-svg text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>
        <div>
          <p class="stat-value-mini">{{ totalStockFormatted }}</p>
          <p class="stat-label-mini">{{ $t('products.totalStock') }}</p>
        </div>
      </div>
    </div>

    <!-- Search and Filter Bar -->
    <div class="filter-bar glass-card">
      <div class="filter-group">
        <div class="search-wrapper">
          <svg class="search-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="filters.search" type="text" :placeholder="$t('products.searchPlaceholder')" class="search-input" @keyup.enter="fetchAllData" />
        </div>
        <select v-model="filters.status" class="filter-select" @change="fetchAllData">
          <option value="">{{ $t('products.allStatus') }}</option>
          <option value="active">{{ $t('common.active') }}</option>
          <option value="inactive">{{ $t('common.inactive') }}</option>
        </select>
        <select v-model="filters.branchId" class="filter-select" @change="fetchAllData">
          <option :value="null">{{ $t('products.allBranches') }}</option>
          <option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option>
        </select>
        <button @click="fetchAllData" class="filter-btn" :disabled="loading">
          <svg class="filter-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {{ $t('common.search') }}
        </button>
        <button @click="resetFilters" class="filter-btn-reset">
          <svg class="filter-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('common.reset') }}
        </button>
      </div>
    </div>

    <!-- Products Table with Grouping -->
    <div class="table-container glass-card">
      <div class="table-header">
        <h3 class="table-title">{{ $t('products.productList') }}</h3>
        <span class="table-count">{{ groupedProducts.length }} {{ $t('products.groups') }}</span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="product-table">
          <thead>
            <tr>
              <th>{{ $t('stock.groupProduct') }}</th>
              <th>{{ $t('products.productName') }}</th>
              <th>{{ $t('products.attributes') }}</th>
              <th>{{ $t('products.price') }}</th>
              <th>{{ $t('products.stock') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th class="text-right">{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in filteredGroups" :key="group.prefix">
              <tr class="group-row" @click="toggleGroup(group.prefix)">
                <td colspan="7" class="group-header">
                  <div class="group-header-content">
                    <div class="group-info">
                      <svg class="group-icon" :class="{ 'rotated': expandedGroups.has(group.prefix) }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                      </svg>
                      <span class="group-prefix">{{ group.prefix }}</span>
                      <span class="group-count">({{ group.products.length }} {{ $t('products.variants') }})</span>
                      <span class="group-total-stock">{{ $t('products.totalStockUnits', { count: group.totalStock }) }}</span>
                    </div>
                    <div class="group-actions">
                      <span :class="group.hasActive ? 'badge-active' : 'badge-inactive'">
                        {{ group.hasActive ? $t('common.active') : $t('common.inactive') }}
                      </span>
                      <button @click.stop="addProductToGroup(group)" class="action-btn add-product-btn" :title="$t('products.addToGroup')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      <button @click.stop="editGroup(group)" class="action-btn edit-btn" :title="$t('common.edit')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
              
              <template v-if="expandedGroups.has(group.prefix)">
                <tr v-for="product in group.products" :key="product.id" class="product-row sub-product-row">
                  <td class="sku-cell sub-sku">{{ product.sku }}</td>
                  <td>
                    <div class="product-cell">
                      <div class="product-name">{{ product.name }}</div>
                      <div class="product-description">{{ product.description?.slice(0, 60) || $t('products.noDescription') }}</div>
                    </div>
                  </td>
                  <td>
                    <div class="attributes">
                      <span v-if="product.color" class="attribute-badge">{{ product.color }}</span>
                      <span v-if="product.size" class="attribute-badge">{{ product.size }}</span>
                      <span v-if="!product.color && !product.size" class="text-muted">—</span>
                    </div>
                  </td>
                  <td>
                    <div class="price-cell">
                      <span class="selling-price">{{ formatCurrency(product.price) }}</span>
                      <span class="cost-price">{{ $t('products.costLabel') }}: {{ formatCurrency(product.cost) }}</span>
                    </div>
                  </td>
                  <td>
                    <div class="stock-cell">
                      <span :class="getStockClass(product.stockQuantity)" class="stock-value">
                        {{ product.stockQuantity || 0 }} {{ $t('common.units') }}
                      </span>
                      <div class="stock-bar-mini" v-if="product.reorderLevel">
                        <div class="stock-fill-mini" :style="{ width: getStockPercentage(product) + '%' }"></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span :class="product.active ? 'badge-active' : 'badge-inactive'">
                      {{ product.active ? $t('common.active') : $t('common.inactive') }}
                    </span>
                  </td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button @click.stop="editProduct(product)" class="action-btn edit-btn" :title="$t('common.edit')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button @click.stop="toggleProductStatus(product)" class="action-btn status-btn" :title="product.active ? $t('products.deactivate') : $t('products.activate')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path v-if="product.active" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </button>
                      <button @click.stop="viewStockHistory(product)" class="action-btn stock-btn" :title="$t('products.stockHistory')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </button>
                      <button @click.stop="deleteProduct(product)" class="action-btn delete-btn" :title="$t('common.delete')">
                        <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            
            <tr v-if="!filteredGroups.length && !loading">
              <td colspan="7" class="empty-state">
                <svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p>{{ $t('products.noProducts') }}</p>
                <button @click="openModal" class="btn-primary-sm">{{ $t('products.addFirstProduct') }}</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product Modal -->
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h3 class="modal-title">{{ editing ? $t('products.editProduct') : $t('products.addProduct') }}</h3>
          <button @click="closeModal" class="modal-close" :disabled="saving">
            <svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="saveProduct" class="modal-form">
          <div class="form-grid">
            <div class="form-field">
              <label class="form-label">{{ $t('products.sku') }} *</label>
              <input v-model="form.sku" type="text" required class="form-input" placeholder="e.g., PR001" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t('products.productName') }} *</label>
              <input v-model="form.name" type="text" required class="form-input" :placeholder="$t('products.productName')" />
            </div>
            <div class="form-field full-width">
              <label class="form-label">{{ $t('products.description') }}</label>
              <textarea v-model="form.description" class="form-textarea" :placeholder="$t('products.description')" rows="3"></textarea>
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t('products.color') }}</label>
              <input v-model="form.color" type="text" class="form-input" placeholder="e.g., Red, Blue" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t('products.size') }}</label>
              <input v-model="form.size" type="text" class="form-input" placeholder="e.g., M, L, XL" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t('products.price') }} *</label>
              <input v-model.number="form.price" type="number" step="0.01" required class="form-input" placeholder="0.00" />
            </div>
            <div class="form-field">
              <label class="form-label">{{ $t('products.cost') }} *</label>
              <input v-model.number="form.cost" type="number" step="0.01" required class="form-input" placeholder="0.00" />
            </div>
            <div class="form-field">
              <label class="checkbox-label">
                <input v-model="form.active" type="checkbox" class="checkbox-input" />
                <span class="checkbox-text">{{ $t('products.activeStatus') }}</span>
              </label>
            </div>
          </div>
          
          <div v-if="error" class="error-message">{{ error }}</div>
          
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary" :disabled="saving">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn-primary" :disabled="saving">
              <span v-if="saving" class="spinner-small"></span>
              {{ saving ? $t('common.saving') : (editing ? $t('products.updateProduct') : $t('products.createProduct')) }}
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
import { formatCurrency } from '@/utils/format'

const { t } = useI18n()

const products = ref([])
const stockData = ref([])
const branches = ref([])
const loading = ref(false)
const saving = ref(false)
const showModal = ref(false)
const editing = ref(false)
const error = ref('')
const expandedGroups = ref(new Set())

const filters = ref({ search: '', status: '', branchId: null })
const form = ref({ sku: '', name: '', description: '', color: '', size: '', price: 0, cost: 0, active: true })

const getSkuPrefix = (sku) => { const match = sku.match(/^[A-Za-z]+/); return match ? match[0] : sku }

const groupedProducts = computed(() => {
  const groups = new Map()
  productsWithStock.value.forEach(product => {
    const prefix = getSkuPrefix(product.sku)
    if (!groups.has(prefix)) groups.set(prefix, { prefix, products: [], totalStock: 0, hasActive: false })
    const group = groups.get(prefix)
    group.products.push(product)
    group.totalStock += (product.stockQuantity || 0)
    if (product.active) group.hasActive = true
  })
  for (const group of groups.values()) group.products.sort((a, b) => a.sku.localeCompare(b.sku))
  return Array.from(groups.values()).sort((a, b) => a.prefix.localeCompare(b.prefix))
})

const filteredGroups = computed(() => {
  let result = groupedProducts.value
  if (filters.value.search) {
    const searchLower = filters.value.search.toLowerCase()
    result = result.filter(group => group.prefix.toLowerCase().includes(searchLower) || group.products.some(p => p.name.toLowerCase().includes(searchLower) || p.sku.toLowerCase().includes(searchLower)))
  }
  if (filters.value.status) result = result.filter(group => filters.value.status === 'active' ? group.hasActive : !group.hasActive)
  return result
})

const activeGroupsCount = computed(() => groupedProducts.value.filter(g => g.hasActive).length)
const inactiveGroupsCount = computed(() => groupedProducts.value.filter(g => !g.hasActive).length)

const productsWithStock = computed(() => {
  return products.value.map(product => {
    let stock = null
    if (filters.value.branchId) stock = stockData.value.find(s => s.product_id === product.id)
    else {
      const allStock = stockData.value.filter(s => s.product_id === product.id)
      if (allStock.length > 0) stock = { quantity: allStock.reduce((sum, s) => sum + (s.quantity || 0), 0), reorder_level: allStock[0]?.reorder_level || 10 }
    }
    return { ...product, stockQuantity: stock?.quantity || 0, reorderLevel: stock?.reorder_level || 10 }
  })
})

const toggleGroup = (prefix) => { expandedGroups.value.has(prefix) ? expandedGroups.value.delete(prefix) : expandedGroups.value.add(prefix); expandedGroups.value = new Set(expandedGroups.value) }
const editGroup = (group) => { if (group.products.length > 0) editProduct(group.products[0]) }

const addProductToGroup = (group) => {
  editing.value = false; error.value = ''
  const lastProduct = group.products.length > 0 ? group.products[group.products.length - 1] : null
  if (lastProduct) {
    const lastSku = lastProduct.sku; const skuPrefix = getSkuPrefix(lastSku); const skuNumber = parseInt(lastSku.replace(skuPrefix, '')) || 0
    const nextSku = `${skuPrefix}${(skuNumber + 1).toString().padStart(3, '0')}`
    form.value = { sku: nextSku, name: lastProduct.name || '', description: lastProduct.description || '', color: lastProduct.color || '', size: lastProduct.size || '', price: lastProduct.price || 0, cost: lastProduct.cost || 0, active: lastProduct.active !== undefined ? lastProduct.active : true }
  } else {
    form.value = { sku: `${group.prefix}001`, name: '', description: '', color: '', size: '', price: 0, cost: 0, active: true }
  }
  showModal.value = true
}

const totalStockFormatted = computed(() => { const total = productsWithStock.value.reduce((sum, p) => sum + (p.stockQuantity || 0), 0); return total >= 1000 ? (total / 1000).toFixed(1) + 'K' : total.toString() })
const getStockClass = (stock) => { if (!stock || stock === 0) return 'stock-critical'; if (stock < 10) return 'stock-low'; return 'stock-normal' }
const getStockPercentage = (product) => { if (!product.reorderLevel || product.reorderLevel === 0) return 0; return Math.min((product.stockQuantity / product.reorderLevel) * 100, 100) }

const fetchAllData = async () => {
  loading.value = true
  try {
    const productsParams = {}; if (filters.value.status) productsParams.active = filters.value.status === 'active'
    const productsResponse = await api.get('/products', { params: productsParams }); products.value = productsResponse.data || []
    if (filters.value.branchId) { const stockResponse = await api.get(`/stock/${filters.value.branchId}`); stockData.value = stockResponse.data || [] }
    else { stockData.value = []; if (branches.value.length > 0) { const allStockArrays = await Promise.all(branches.value.map(branch => api.get(`/stock/${branch.id}`).then(res => res.data).catch(() => []))); stockData.value = allStockArrays.flat() } }
  } catch (err) { error.value = t('products.failedToLoad') } finally { loading.value = false }
}

const fetchBranches = async () => { try { const response = await api.get('/branches'); branches.value = response.data || [] } catch (error) {} }
const resetFilters = () => { filters.value = { search: '', status: '', branchId: null }; fetchAllData() }

const openModal = () => {
  editing.value = false; error.value = ''
  const lastProduct = productsWithStock.value.length > 0 ? productsWithStock.value[productsWithStock.value.length - 1] : null
  if (lastProduct) {
    const lastSku = lastProduct.sku; const skuPrefix = getSkuPrefix(lastSku); const skuNumber = parseInt(lastSku.replace(skuPrefix, '')) || 0
    form.value = { sku: `${skuPrefix}${(skuNumber + 1).toString().padStart(3, '0')}`, name: lastProduct.name || '', description: lastProduct.description || '', color: lastProduct.color || '', size: lastProduct.size || '', price: lastProduct.price || 0, cost: lastProduct.cost || 0, active: lastProduct.active !== undefined ? lastProduct.active : true }
  } else { form.value = { sku: '', name: '', description: '', color: '', size: '', price: 0, cost: 0, active: true } }
  showModal.value = true
}

const closeModal = () => { if (saving.value) return; showModal.value = false; error.value = '' }
const editProduct = (product) => { editing.value = true; error.value = ''; form.value = { id: product.id, sku: product.sku, name: product.name, description: product.description || '', color: product.color || '', size: product.size || '', price: product.price, cost: product.cost, active: product.active }; showModal.value = true }

const toggleProductStatus = async (product) => {
  const newStatus = !product.active; const action = newStatus ? 'activate' : 'deactivate'
  if (confirm(t(`products.${action}Confirm`, { name: product.name }))) {
    try { await api.put(`/products/${product.id}`, { ...product, active: newStatus }); await fetchAllData() }
    catch (err) { alert(err.response?.data?.detail || t('products.failedToUpdateStatus', { action })) }
  }
}

const viewStockHistory = (product) => { alert(`${t('products.productName')}: ${product.name}\n${t('products.currentStock')}: ${product.stockQuantity} ${t('common.units')}\n${t('products.reorderLevel')}: ${product.reorderLevel}`) }

const saveProduct = async () => {
  saving.value = true; error.value = ''
  try {
    const productData = { ...form.value, sku: form.value.sku.toLowerCase() }
    if (editing.value) await api.put(`/products/${form.value.id}`, productData)
    else await api.post('/products', productData)
    await fetchAllData(); closeModal()
  } catch (err) { error.value = err.response?.data?.detail || t('products.failedToSave') } finally { saving.value = false }
}

const deleteProduct = async (product) => {
  if (!confirm(t('products.deleteConfirm', { name: product.name }))) return
  try { await api.delete(`/products/${product.id}`); await fetchAllData() }
  catch (err) { alert(err.response?.data?.detail || t('products.failedToDelete')) }
}

onMounted(() => { fetchBranches(); fetchAllData() })
</script>

<style scoped>
/* Keep all your existing styles and add these new ones */

/* Group Row Styles */
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

.group-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.sub-product-row {
  background: rgba(255, 255, 255, 0.5);
}

.sub-product-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.sub-sku {
  padding-left: 2rem !important;
}


/* Keep all your existing styles - they remain the same */
/* ... (all the styles from your original component) ... */

.overflow-x-auto {
  overflow-x: auto;
}

.bg-teal-100 {
  background-color: rgba(47, 184, 166, 0.1);
}

.bg-green-100 {
  background-color: rgba(52, 211, 153, 0.1);
}

.bg-orange-100 {
  background-color: rgba(249, 115, 22, 0.1);
}

.bg-blue-100 {
  background-color: rgba(59, 130, 246, 0.1);
}

.text-teal-600 {
  color: #2FB8A6;
}

.text-green-600 {
  color: #34D399;
}

.text-orange-600 {
  color: #F97316;
}

.text-blue-600 {
  color: #3B82F6;
}

.text-muted {
  color: #6E8B90;
  font-size: 0.75rem;
}

.text-right {
  text-align: right;
}


/* Add these new styles */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(47, 184, 166, 0.2);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #EF4444;
  color: #EF4444;
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.text-muted {
  color: black;
  font-size: 0.75rem;
}

.text-right {
  text-align: right;
}

/* Icon sizing */
.btn-icon {
  width: 18px;
  height: 18px;
}

.stat-mini-svg {
  width: 20px;
  height: 20px;
}

.search-svg-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: black;
}

.filter-svg-icon {
  width: 14px;
  height: 14px;
}

.action-svg-icon {
  width: 16px;
  height: 16px;
}

.empty-svg-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: black;
}

.modal-close-svg {
  width: 18px;
  height: 18px;
}

/* Action buttons group */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  color: #2FB8A6;
}

.edit-btn:hover {
  background: rgba(47, 184, 166, 0.1);
  transform: scale(1.05);
}

.add-product-btn {
  color: #8B5CF6;
}

.add-product-btn:hover {
  background: rgba(139, 92, 246, 0.1);
  transform: scale(1.05);
}

.status-btn {
  color: #F59E0B;
}

.status-btn:hover {
  background: rgba(245, 158, 11, 0.1);
  transform: scale(1.05);
}

.stock-btn {
  color: #3B82F6;
}

.stock-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.05);
}

.delete-btn {
  color: #EF4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.05);
}

/* Keep all your existing styles from the original products page */
.products-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 2rem;
  animation: fadeIn 0.5s ease-out;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: black;
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

.stat-value-mini {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A2A2E;
  line-height: 1.2;
}

.stat-label-mini {
  font-size: 0.75rem;
  color: black;
}

/* Filter Bar */
.filter-bar {
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-wrapper {
  flex: 1;
  position: relative;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  cursor: pointer;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.filter-btn-reset {
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn-reset:hover {
  background: rgba(110, 139, 144, 0.2);
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
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.table-count {
  font-size: 0.8rem;
  color: black;
  background: rgba(110, 139, 144, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.product-table {
  width: 100%;
  border-collapse: collapse;
}

.product-table th {
  text-align: left;
  padding: 1rem 1rem;
  background: rgba(47, 184, 166, 0.05);
  color: black;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.product-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
}

.product-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.product-row td {
  padding: 1rem;
  vertical-align: middle;
}

.sku-cell {
  font-family: monospace;
  font-size: 0.85rem;
  color: black;
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

.product-description {
  font-size: 0.75rem;
  color: black;
}

.attributes {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.attribute-badge {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 500;
}

.price-cell {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.selling-price {
  font-weight: 600;
  color: #2FB8A6;
}

.cost-price {
  font-size: 0.7rem;
  color: black;
}

.stock-cell {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
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

.stock-bar-mini {
  width: 80px;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
}

.stock-fill-mini {
  height: 100%;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.badge-active {
  background: #34D399;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.badge-inactive {
  background: black;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 500;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

.empty-state {
  text-align: center;
  padding: 3rem !important;
  color: black;
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
  max-width: 700px;
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
  color: black;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1A2A2E;
}

.modal-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-grid .full-width {
  grid-column: 1 / -1;
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

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-input {
  width: 1rem;
  height: 1rem;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.85rem;
  color: #1A2A2E;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

/* Buttons */
.btn-primary {
  display: flex;
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
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.btn-primary-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 1024px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-wrapper {
    width: 100%;
  }
  
  .product-table {
    font-size: 0.85rem;
  }
  
  .product-table th,
  .product-table td {
    padding: 0.75rem;
  }
  
  .action-buttons {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .modal-actions button {
    width: 100%;
  }
}
</style>