<template>
  <div class="products-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state glass-card">
      <svg class="error-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3>{{ $t('products.failedToLoad') }}</h3>
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="btn-primary-sm">{{ $t('common.tryAgain') }}</button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Header -->
      <div class="page-header">
        <div>
          <h1 class="page-title">{{ $t('products.title') }}</h1>
          <p class="page-subtitle">{{ $t('products.browseSubtitle') }}</p>
        </div>
        <div class="header-stats">
          <div class="stat-badge">
            <svg class="header-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <span>{{ $t('products.productCount', { count: filteredProducts.length }) }}</span>
          </div>
          <div class="stat-badge">
            <svg class="header-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span>{{ $t('products.totalStockUnits', { count: totalStock }) }}</span>
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
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="$t('products.searchPlaceholder')" 
              class="search-input"
              @input="handleSearch"
            >
          </div>
          <select v-model="selectedCategory" class="filter-select" @change="handleFilter">
            <option value="all">{{ $t('common.allCategories') }}</option>
            <option v-for="cat in uniqueCategories" :key="cat" :value="cat">
              {{ formatCategoryName(cat) }}
            </option>
          </select>
          <select v-model="stockFilter" class="filter-select" @change="handleFilter">
            <option value="all">{{ $t('products.allStock') }}</option>
            <option value="in_stock">{{ $t('products.inStock') }}</option>
            <option value="low_stock">{{ $t('products.lowStock') }}</option>
            <option value="out_of_stock">{{ $t('products.outOfStock') }}</option>
          </select>
          <button @click="resetFilters" class="reset-btn">
            <svg class="reset-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {{ $t('common.reset') }}
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-row">
        <div class="stat-mini-card glass-card">
          <div class="stat-mini-icon bg-teal-100">
            <svg class="stat-svg-icon text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <p class="stat-mini-value">{{ products.length }}</p>
            <p class="stat-mini-label">{{ $t('dashboard.totalProducts') }}</p>
          </div>
        </div>
        <div class="stat-mini-card glass-card">
          <div class="stat-mini-icon bg-green-100">
            <svg class="stat-svg-icon text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="stat-mini-value">{{ inStockCount }}</p>
            <p class="stat-mini-label">{{ $t('products.inStock') }}</p>
          </div>
        </div>
        <div class="stat-mini-card glass-card">
          <div class="stat-mini-icon bg-orange-100">
            <svg class="stat-svg-icon text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p class="stat-mini-value">{{ lowStockCount }}</p>
            <p class="stat-mini-label">{{ $t('products.lowStock') }}</p>
          </div>
        </div>
        <div class="stat-mini-card glass-card">
          <div class="stat-mini-icon bg-red-100">
            <svg class="stat-svg-icon text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p class="stat-mini-value">{{ outOfStockCount }}</p>
            <p class="stat-mini-label">{{ $t('products.outOfStock') }}</p>
          </div>
        </div>
      </div>

      <!-- Products Grid with Pagination -->
      <div class="products-grid">
        <div v-for="product in paginatedProducts" :key="product.id" class="product-card glass-card">
          <div class="product-badge" :class="getStockBadgeClass(product)">
            {{ getStockStatus(product) }}
          </div>
          <div class="product-icon" :style="{ background: getProductColor(product.category) }">
            <svg class="product-svg-icon" fill="none" stroke="white" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(product.category)" />
            </svg>
          </div>
          <div class="product-details">
            <h3 class="product-name">{{ product.name || $t('products.unnamedProduct') }}</h3>
            <p class="product-sku">{{ product.sku || 'N/A' }}</p>
            <div class="product-meta">
              <span class="product-category">{{ formatCategoryName(product.category) }}</span>
              <span class="product-price">{{ formatCurrency(product.price) }}</span>
            </div>
            <div class="product-stock-info">
              <div class="stock-bar">
                <div class="stock-fill" :style="{ width: getStockPercentage(product) + '%', background: getStockColor(product) }"></div>
              </div>
              <div class="stock-numbers">
                <span class="stock-value">{{ product.stock_quantity || 0 }} {{ $t('common.units') }}</span>
                <span class="stock-percentage">{{ getStockPercentage(product) }}%</span>
              </div>
            </div>
            <div class="product-actions">
              <router-link :to="`/sales/pos?product=${product.id}`" class="sell-btn">
                <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                {{ $t('dashboard.sellNow') }}
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="currentPage--" 
          :disabled="currentPage === 1" 
          class="page-btn"
        >
          <svg class="page-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div class="page-numbers">
          <button 
            v-for="page in displayedPages" 
            :key="page"
            @click="currentPage = page"
            class="page-number"
            :class="{ active: currentPage === page }"
          >
            {{ page }}
          </button>
        </div>
        <button 
          @click="currentPage++" 
          :disabled="currentPage === totalPages" 
          class="page-btn"
        >
          <svg class="page-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Empty State -->
      <div v-if="filteredProducts.length === 0" class="empty-state glass-card">
        <svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3>{{ $t('products.noProducts') }}</h3>
        <p>{{ searchQuery ? $t('products.tryDifferentSearch') : $t('products.noProductsAvailable') }}</p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

const authStore = useAuthStore()
const { t } = useI18n()
const loading = ref(true)
const error = ref(null)
const products = ref([])
const searchQuery = ref('')
const selectedCategory = ref('all')
const stockFilter = ref('all')
const currentPage = ref(1)
const itemsPerPage = 8

const formatCategoryName = (category) => {
  if (!category) return t('products.uncategorized')
  return category.charAt(0).toUpperCase() + category.slice(1)
}

const getIconPath = (category) => {
  const cat = (category || '').toLowerCase()
  const icons = {
    coffee: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    tea: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    pastries: 'M12 6V4m0 2a2 2 0 100 4 2 2 0 000-4z',
    beverages: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    default: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
  }
  return icons[cat] || icons.default
}

const getProductColor = (category) => {
  const cat = (category || '').toLowerCase()
  const colors = {
    coffee: '#8B5CF6',
    tea: '#34D399',
    pastries: '#F59E0B',
    beverages: '#F97316',
    default: '#2FB8A6'
  }
  return colors[cat] || colors.default
}

const uniqueCategories = computed(() => {
  const cats = new Set()
  products.value.forEach(p => {
    if (p.category) cats.add(p.category)
  })
  return Array.from(cats)
})

const filteredProducts = computed(() => {
  let filtered = [...products.value]
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(p => 
      (p.name || '').toLowerCase().includes(query) || 
      (p.sku || '').toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value !== 'all') {
    filtered = filtered.filter(p => p.category === selectedCategory.value)
  }
  
  const stock = (p) => p.stock_quantity || 0
  if (stockFilter.value === 'in_stock') {
    filtered = filtered.filter(p => stock(p) > 10)
  } else if (stockFilter.value === 'low_stock') {
    filtered = filtered.filter(p => stock(p) > 0 && stock(p) <= 10)
  } else if (stockFilter.value === 'out_of_stock') {
    filtered = filtered.filter(p => stock(p) === 0)
  }
  
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredProducts.value.slice(start, end)
})

const displayedPages = computed(() => {
  const pages = []
  const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1)
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const totalStock = computed(() => {
  return products.value.reduce((sum, p) => sum + (p.stock_quantity || 0), 0)
})

const inStockCount = computed(() => {
  return products.value.filter(p => (p.stock_quantity || 0) > 10).length
})

const lowStockCount = computed(() => {
  return products.value.filter(p => (p.stock_quantity || 0) > 0 && (p.stock_quantity || 0) <= 10).length
})

const outOfStockCount = computed(() => {
  return products.value.filter(p => (p.stock_quantity || 0) === 0).length
})

const getStockPercentage = (product) => {
  const maxStock = 100
  const stock = product.stock_quantity || 0
  return Math.min(Math.round((stock / maxStock) * 100), 100)
}

const getStockColor = (product) => {
  const stock = product.stock_quantity || 0
  if (stock === 0) return '#EF4444'
  if (stock <= 10) return '#F97316'
  return '#10B981'
}

const getStockStatus = (product) => {
  const stock = product.stock_quantity || 0
  if (stock === 0) return t('products.outOfStock')
  if (stock <= 10) return t('products.lowStock')
  return t('products.inStock')
}

const getStockBadgeClass = (product) => {
  const stock = product.stock_quantity || 0
  if (stock === 0) return 'badge-out'
  if (stock <= 10) return 'badge-low'
  return 'badge-in'
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value || 0)
}

const fetchProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    const productsResponse = await api.get('/products', { params: { active: true } })
    const productList = productsResponse.data || []
    
    const branchId = authStore.userBranchId
    
    if (branchId) {
      try {
        const stockResponse = await api.get('/stock/', { params: { low_stock: false } })
        const stockData = stockResponse.data || []
        
        products.value = productList.map(product => {
          const stockItem = stockData.find(s => s.product_id === product.id)
          return {
            ...product,
            stock_quantity: stockItem?.quantity || 0,
            reorder_level: stockItem?.reorder_level || 0
          }
        })
      } catch (stockError) {
        console.error('Failed to fetch stock:', stockError)
        products.value = productList.map(p => ({ ...p, stock_quantity: 0 }))
      }
    } else {
      products.value = productList.map(p => ({ ...p, stock_quantity: 0 }))
    }
    
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = err.response?.data?.detail || t('products.failedToLoad')
    products.value = []
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleFilter = () => {
  currentPage.value = 1
}

const resetFilters = () => {
  searchQuery.value = ''
  selectedCategory.value = 'all'
  stockFilter.value = 'all'
  currentPage.value = 1
}

onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.products-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.header-svg-icon {
  width: 16px;
  height: 16px;
}

.search-svg-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: black;
}

.reset-svg-icon {
  width: 14px;
  height: 14px;
}

.stat-svg-icon {
  width: 18px;
  height: 18px;
}

.product-svg-icon {
  width: 28px;
  height: 28px;
}

.action-svg-icon {
  width: 14px;
  height: 14px;
}

.empty-svg-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  color: black;
}

.error-svg-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #EF4444;
}

.page-svg-icon {
  width: 14px;
  height: 14px;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 60px 20px;
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

/* Error State */
.error-state {
  text-align: center;
  padding: 60px 20px;
  margin: 20px;
}

.error-state h3 {
  font-size: 1.2rem;
  color: #1A2A2E;
  margin-bottom: 8px;
}

.error-state p {
  color: #6E8B90;
  margin-bottom: 20px;
}

.btn-primary-sm {
  padding: 8px 20px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.85rem;
  cursor: pointer;
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
  margin-bottom: 4px;
}

.page-subtitle {
  color: black;
  font-size: 0.9rem;
}

.header-stats {
  display: flex;
  gap: 12px;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 40px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1A2A2E;
}

/* Filter Bar */
.filter-bar {
  padding: 16px;
  margin-bottom: 24px;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.search-wrapper {
  flex: 1;
  position: relative;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 10px 12px 10px 38px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.filter-select {
  padding: 10px 12px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  min-width: 130px;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
  cursor: pointer;
  transition: all 0.3s ease;
}

.reset-btn:hover {
  background: rgba(110, 139, 144, 0.2);
}

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-mini-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
}

.stat-mini-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-mini-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A2A2E;
  line-height: 1.2;
}

.stat-mini-label {
  font-size: 0.7rem;
  color: black;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

/* Products Grid - Smaller Cards */
.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.product-card {
  position: relative;
  padding: 16px;
  transition: all 0.3s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

.product-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
}

.badge-in {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.badge-low {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.badge-out {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.product-icon {
  width: 60px;
  height: 60px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}

.product-details {
  text-align: center;
}

.product-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 4px;
}

.product-sku {
  font-size: 0.7rem;
  color: black;
  margin-bottom: 8px;
}

.product-meta {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 12px;
}

.product-category {
  font-size: 0.65rem;
  padding: 3px 8px;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 20px;
  color: #2FB8A6;
  text-transform: capitalize;
}

.product-price {
  font-size: 1rem;
  font-weight: 700;
  color: #2FB8A6;
}

.product-stock-info {
  margin-bottom: 12px;
}

.stock-bar {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 6px;
}

.stock-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.stock-numbers {
  display: flex;
  justify-content: space-between;
  font-size: 0.65rem;
}

.stock-value {
  color: black;
}

.stock-percentage {
  font-weight: 500;
  color: #2FB8A6;
}

.product-actions {
  margin-top: 12px;
}

.sell-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 16px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.sell-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  margin-top: 24px;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: rgba(47, 184, 166, 0.1);
  border-color: #2FB8A6;
  color: #2FB8A6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 8px;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.85rem;
  font-weight: 500;
}

.page-number:hover {
  background: rgba(47, 184, 166, 0.1);
  border-color: #2FB8A6;
  color: #2FB8A6;
}

.page-number.active {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border-color: transparent;
  color: white;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 60px 20px;
}

.empty-state h3 {
  font-size: 1.2rem;
  color: #1A2A2E;
  margin-bottom: 8px;
}

.empty-state p {
  color: black;
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
  .products-page {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filter-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-wrapper {
    width: 100%;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .reset-btn {
    justify-content: center;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .products-grid {
    grid-template-columns: 1fr;
  }
  
  .product-card {
    padding: 16px;
  }
  
  .product-icon {
    width: 60px;
    height: 60px;
  }
  
  .product-svg-icon {
    width: 24px;
    height: 24px;
  }
  
  .pagination {
    flex-wrap: wrap;
  }
  
  .page-numbers {
    order: 1;
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-row {
    grid-template-columns: 1fr;
  }
  
  .product-name {
    font-size: 1rem;
  }
  
  .product-price {
    font-size: 0.9rem;
  }
  
  .header-svg-icon {
    width: 14px;
    height: 14px;
  }
  
  .stat-svg-icon {
    width: 16px;
    height: 16px;
  }
  
  .stat-mini-icon {
    width: 40px;
    height: 40px;
  }
  
  .page-number, .page-btn {
    width: 32px;
    height: 32px;
  }
}
</style>