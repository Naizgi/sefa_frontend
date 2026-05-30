<template>
  <div class="pos-container">
    <!-- Header Section -->
    <div class="pos-header">
      <div>
        <h1 class="page-title">{{ $t('pos.title') }}</h1>
        <p class="page-subtitle">{{ $t('pos.subtitle') }}</p>
      </div>
      <div class="pos-stats">
        <div class="stat-chip">
          <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <span>{{ cart.length }} {{ $t('pos.items') }}</span>
        </div>
        <div class="stat-chip total">
          <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ formatCurrency(finalTotal) }}</span>
        </div>
        <button @click="goToRefund" class="refund-btn" :title="$t('pos.refund')">
          <svg class="refund-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m9 4V9a2 2 0 00-2-2h-1M3 15h1a4 4 0 004-4v-1m0 0l-3 3m3-3l-3-3" />
          </svg>
          <span>{{ $t('pos.refund') }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state glass-card">
      <svg class="error-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3>{{ $t('pos.failedToLoad') }}</h3>
      <p>{{ error }}</p>
      <button @click="fetchProducts" class="btn-primary">{{ $t('common.tryAgain') }}</button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Mobile Cart Toggle Button -->
      <div class="mobile-cart-toggle">
        <button @click="showCart = !showCart" class="cart-toggle-btn">
          <svg class="toggle-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span>{{ $t('pos.cart') }} ({{ cart.length }})</span>
          <svg class="toggle-arrow-svg" :class="{ 'rotate-180': showCart }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div class="pos-layout">
        <!-- Products Section -->
        <div class="products-section glass-card" :class="{ 'mobile-hidden': showCart }">
          <div class="search-bar">
            <svg class="search-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input 
              type="text" 
              v-model="searchQuery" 
              :placeholder="$t('common.searchProducts')" 
              class="search-input"
            >
          </div>
          
          <div class="category-tabs">
            <button 
              v-for="cat in categories" 
              :key="cat"
              @click="selectedCategory = cat"
              :class="['category-tab', { active: selectedCategory === cat }]"
            >
              {{ cat === 'All' ? $t('common.all') : cat }}
            </button>
          </div>

          <!-- Horizontal SKU Selector -->
          <div class="sku-selector-container">
            <div class="sku-selector">
              <button 
                v-for="skuGroup in skuGroups" 
                :key="skuGroup"
                @click="selectSku(skuGroup)"
                :class="['sku-chip', { active: selectedSku === skuGroup }]"
              >
                <span class="sku-chip-prefix">{{ skuGroup }}</span>
                <span class="sku-chip-count">{{ getSkuProductCount(skuGroup) }}</span>
              </button>
              <div v-if="skuGroups.length === 0" class="no-sku">
                {{ $t('pos.noSkuGroups') }}
              </div>
            </div>
          </div>

          <!-- Products Grid for Selected SKU -->
          <div class="products-grid">
            <template v-if="selectedSku">
              <div 
                v-for="product in filteredProductsBySku" 
                :key="product.id" 
                class="product-card"
                @click="addToCart(product)"
              >
                <div class="product-image" :style="{ background: getProductColor(product.category) }">
                  <svg class="product-svg-icon" fill="none" stroke="white" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getIconPath(product.category)" />
                  </svg>
                </div>
                <div class="product-info">
                  <h4 class="product-name">{{ product.name }}</h4>
                  <p class="product-sku">{{ product.sku }}</p>
                  <div class="product-price-row">
                    <span class="product-price">{{ formatCurrency(product.price) }}</span>
                    <span class="product-stock" :class="{ 'low-stock': (product.stock_quantity || 0) < 10 }">
                      {{ $t('pos.stock') }}: {{ product.stock_quantity || 0 }}
                    </span>
                  </div>
                </div>
                <button class="add-btn">
                  <svg class="add-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <div v-if="filteredProductsBySku.length === 0 && selectedSku" class="no-products">
                <p>{{ $t('pos.noProductsFound', { sku: selectedSku }) }}</p>
              </div>
            </template>
            <div v-else class="no-products">
              <svg class="select-sku-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
              <p>{{ $t('pos.selectSkuGroup') }}</p>
            </div>
          </div>
        </div>

        <!-- Cart Section (UPDATED with Price Editing) -->
        <div class="cart-section glass-card" :class="{ 'mobile-visible': showCart, 'mobile-hidden': !showCart }">
          <div class="cart-header">
            <div class="cart-title">
              <svg class="cart-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <h3>{{ $t('pos.currentSale') }}</h3>
            </div>
            <button v-if="cart.length" class="clear-cart" @click="clearCart">
              <svg class="clear-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              {{ $t('pos.clear') }}
            </button>
          </div>

          <div class="cart-items">
            <div v-for="(item, index) in cart" :key="index" class="cart-item">
              <div class="cart-item-info">
                <div>
                  <span class="cart-item-name">{{ item.name }}</span>
                  <span class="cart-item-sku">{{ item.sku }}</span>
                </div>
                <div class="cart-item-price-edit">
                  <span class="price-label">{{ $t('pos.unitPrice') }}:</span>
                  <input 
                    type="number" 
                    v-model.number="item.price" 
                    @change="updateItemPrice(index)"
                    class="price-input"
                    step="0.01"
                    min="0"
                  />
                </div>
                <div class="cart-item-line-total">
                  <span class="line-total-label">{{ $t('pos.lineTotal') }}:</span>
                  <span class="line-total">{{ formatCurrency(item.price * item.quantity) }}</span>
                </div>
              </div>
              <div class="cart-item-controls">
                <button @click="updateQuantity(index, -1)" :disabled="item.quantity <= 1" class="qty-btn">
                  <svg class="qty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                  </svg>
                </button>
                <span class="quantity">{{ item.quantity }}</span>
                <button @click="updateQuantity(index, 1)" :disabled="item.quantity >= (item.stock_quantity || 0)" class="qty-btn">
                  <svg class="qty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button class="remove-btn" @click="removeFromCart(index)">
                  <svg class="remove-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
            <div v-if="cart.length === 0" class="empty-cart">
              <svg class="empty-cart-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p>{{ $t('pos.emptyCart') }}</p>
              <span>{{ $t('pos.emptyCartSub') }}</span>
            </div>
          </div>

          <div class="cart-summary">
            <div class="summary-row">
              <span>{{ $t('pos.subtotal') }}</span>
              <span>{{ formatCurrency(subtotal) }}</span>
            </div>
            
            <div class="summary-row tax-row">
              <label class="checkbox-label">
                <input type="checkbox" v-model="applyTax" class="tax-checkbox">
                <span>{{ $t('pos.applyTax') }}</span>
              </label>
              <span v-if="applyTax" class="tax-amount">{{ formatCurrency(tax) }}</span>
              <span v-else class="tax-amount">-</span>
            </div>
            
            <div class="summary-divider"></div>
            <div class="summary-row total">
              <span>{{ $t('pos.total') }}</span>
              <span>{{ formatCurrency(finalTotal) }}</span>
            </div>
          </div>

          <div class="payment-section">
            <div class="payment-methods">
              <button 
                @click="paymentMethod = 'cash'"
                :class="['payment-btn', { active: paymentMethod === 'cash' }]"
              >
                <svg class="payment-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {{ $t('pos.cash') }}
              </button>
              <button 
                @click="paymentMethod = 'transfer'"
                :class="['payment-btn', { active: paymentMethod === 'transfer' }]"
              >
                <svg class="payment-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                {{ $t('pos.bankTransfer') }}
              </button>
            </div>
            
            <div v-if="paymentMethod === 'transfer'" class="account-section">
              <label class="account-label">{{ $t('pos.selectAccount') }}</label>
              <select v-model="selectedAccount" class="account-select">
                <option value="">{{ $t('pos.selectAccount') }}</option>
                <option v-for="account in bankAccounts" :key="account.id" :value="account.id">
                  {{ account.bank_name }} - {{ account.account_number }} ({{ account.account_name }})
                </option>
              </select>
              <div class="account-info" v-if="selectedAccount">
                <div class="info-row">
                  <span>{{ $t('pos.bank') }}:</span>
                  <strong>{{ getSelectedAccountDetails().bank_name }}</strong>
                </div>
                <div class="info-row">
                  <span>{{ $t('pos.accountNumber') }}:</span>
                  <strong>{{ getSelectedAccountDetails().account_number }}</strong>
                </div>
                <div class="info-row">
                  <span>{{ $t('pos.accountName') }}:</span>
                  <strong>{{ getSelectedAccountDetails().account_name }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="cart-actions">
            <input 
              type="text" 
              v-model="customerName" 
              :placeholder="$t('pos.customerName')" 
              class="customer-input"
            >
            <button class="btn-primary" @click="processSale" :disabled="cart.length === 0 || processing || (paymentMethod === 'transfer' && !selectedAccount)">
              <span v-if="processing" class="spinner-small"></span>
              <span v-else>{{ paymentMethod === 'cash' ? $t('pos.completeSale') : $t('pos.processTransfer') }}</span>
            </button>
          </div>
        </div>
      </div>
    </template>

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
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatCurrency } from '@/utils/format'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const processing = ref(false)
const loading = ref(true)
const error = ref(null)
const showToast = ref(false)
const toastMessage = ref('')
const showCart = ref(false)

// State
const products = ref([])
const cart = ref([])
const searchQuery = ref('')
const selectedCategory = ref('All')
const customerName = ref('')
const selectedSku = ref('')

// Tax and Payment
const applyTax = ref(true)
const paymentMethod = ref('cash')
const selectedAccount = ref('')

// Bank accounts
const bankAccounts = ref([])

// Helper function to extract SKU prefix
const getSkuPrefix = (sku) => {
  const match = sku.match(/^[A-Za-z]+/)
  return match ? match[0] : sku
}

// Get unique SKU groups from available products
const skuGroups = computed(() => {
  const prefixes = new Set()
  products.value
    .filter(p => (p.stock_quantity || 0) > 0)
    .forEach(p => prefixes.add(getSkuPrefix(p.sku)))
  return Array.from(prefixes).sort()
})

const getSkuProductCount = (prefix) => {
  return products.value.filter(p => 
    getSkuPrefix(p.sku) === prefix && (p.stock_quantity || 0) > 0
  ).length
}

const filteredProductsBySku = computed(() => {
  let result = products.value.filter(p => (p.stock_quantity || 0) > 0)
  
  if (selectedSku.value) {
    result = result.filter(p => getSkuPrefix(p.sku) === selectedSku.value)
  }
  
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) || 
      p.sku.toLowerCase().includes(query)
    )
  }
  
  if (selectedCategory.value !== 'All') {
    result = result.filter(p => p.category === selectedCategory.value)
  }
  
  result.sort((a, b) => a.sku.localeCompare(b.sku))
  
  return result
})

const selectSku = (prefix) => {
  if (selectedSku.value === prefix) {
    selectedSku.value = ''
  } else {
    selectedSku.value = prefix
  }
}

const categories = computed(() => {
  const cats = new Set()
  products.value.forEach(p => {
    if (p.category) cats.add(p.category)
  })
  return ['All', ...Array.from(cats)]
})

const subtotal = computed(() => cart.value.reduce((sum, item) => sum + (item.price * item.quantity), 0))
const tax = computed(() => subtotal.value * 0.15)
const finalTotal = computed(() => applyTax.value ? subtotal.value + tax.value : subtotal.value)

// NEW: Update item price
const updateItemPrice = (index) => {
  const item = cart.value[index]
  if (item.price < 0) {
    item.price = 0
  }
  // Round to 2 decimal places
  item.price = Math.round(item.price * 100) / 100
  showToastMessage(t('pos.priceUpdated', { name: item.name, price: formatCurrency(item.price) }))
}

const getSelectedAccountDetails = () => {
  return bankAccounts.value.find(acc => acc.id === parseInt(selectedAccount.value)) || {}
}

const getProductColor = (category) => {
  const colors = {
    coffee: '#8B5CF6',
    tea: '#34D399',
    pastries: '#F59E0B',
    beverages: '#F97316',
    default: '#2FB8A6'
  }
  return colors[category] || colors.default
}

const getIconPath = (category) => {
  const icons = {
    coffee: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    tea: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    pastries: 'M12 6V4m0 2a2 2 0 100 4 2 2 0 000-4z',
    beverages: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z',
    default: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'
  }
  return icons[category] || icons.default
}

const goToRefund = () => {
  router.push('/sales/refund')
}

const fetchBankAccounts = async () => {
  try {
    const response = await api.get('/sales/bank-accounts')
    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      bankAccounts.value = response.data
    } else {
      bankAccounts.value = []
    }
  } catch (err) {
    console.error('Failed to fetch bank accounts:', err)
    bankAccounts.value = []
  }
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
    
    if (skuGroups.value.length > 0 && !selectedSku.value) {
      selectedSku.value = skuGroups.value[0]
    }
    
  } catch (err) {
    console.error('Failed to fetch products:', err)
    error.value = err.response?.data?.detail || t('common.loadError')
    products.value = []
  } finally {
    loading.value = false
  }
}

const addToCart = (product) => {
  if ((product.stock_quantity || 0) <= 0) {
    showToastMessage(t('pos.outOfStock', { name: product.name }))
    return
  }
  
  const existingItem = cart.value.find(i => i.id === product.id)
  if (existingItem) {
    if (existingItem.quantity >= product.stock_quantity) {
      showToastMessage(t('pos.notEnoughStock', { name: product.name }))
      return
    }
    existingItem.quantity++
  } else {
    cart.value.push({ 
      ...product, 
      quantity: 1,
      stock_quantity: product.stock_quantity,
      original_price: product.price // Store original price for reference
    })
  }
  showToastMessage(t('pos.addedToCart', { name: product.name }))
  
  if (window.innerWidth <= 768) {
    showCart.value = true
  }
}

const updateQuantity = (index, delta) => {
  const item = cart.value[index]
  const newQuantity = item.quantity + delta
  if (newQuantity >= 1 && newQuantity <= (item.stock_quantity || 0)) {
    item.quantity = newQuantity
  } else if (newQuantity > (item.stock_quantity || 0)) {
    showToastMessage(t('pos.onlyUnitsAvailable', { count: item.stock_quantity }))
  }
}

const removeFromCart = (index) => {
  const item = cart.value[index]
  cart.value.splice(index, 1)
  showToastMessage(t('pos.removedFromCart', { name: item.name }))
}

const clearCart = () => {
  if (confirm(t('pos.clearCartConfirm'))) {
    cart.value = []
    showToastMessage(t('pos.cartCleared'))
    showCart.value = false
  }
}

const processSale = async () => {
  if (cart.value.length === 0) return
  
  if (paymentMethod.value === 'transfer' && !selectedAccount.value) {
    showToastMessage(t('pos.selectBankAccount'))
    return
  }
  
  processing.value = true
  try {
    const branchId = authStore.userBranchId
    
    if (!branchId) {
      showToastMessage(t('pos.noBranchAssigned'))
      processing.value = false
      return
    }
    
    // Use the custom prices from cart items
    const items = cart.value.map(item => ({
      product_id: item.id,
      quantity: Number(item.quantity),
      unit_price: Number(item.price), // Use the edited price
      discount_amount: 0
    }))
    
    const saleData = {
      branch_id: branchId,
      items: items,
      customer_name: customerName.value || null,
      customer_phone: null,
      customer_email: null,
      payment_method: paymentMethod.value,
      tax_rate: applyTax.value ? 15 : 0,
      discount_amount: 0,
      discount_type: "percentage",
      shipping_cost: 0,
      notes: null
    }
    
    if (paymentMethod.value === 'transfer') {
      saleData.bank_account_id = parseInt(selectedAccount.value)
      saleData.transaction_reference = `TRF-${Date.now()}`
    }
    
    const response = await api.post('/sales', saleData)
    
    // Update stock quantities
    for (const cartItem of cart.value) {
      const product = products.value.find(p => p.id === cartItem.id)
      if (product) {
        product.stock_quantity -= cartItem.quantity
      }
    }
    
    showToastMessage(t('pos.saleCompleted', { total: formatCurrency(finalTotal.value) }))
    
    cart.value = []
    customerName.value = ''
    showCart.value = false
    paymentMethod.value = 'cash'
    selectedAccount.value = ''
    applyTax.value = true
    
  } catch (error) {
    console.error('Failed to process sale:', error)
    const errorDetail = error.response?.data?.detail || error.message
    showToastMessage(t('pos.saleFailed') + ': ' + errorDetail)
  } finally {
    processing.value = false
  }
}

const showToastMessage = (message) => {
  toastMessage.value = message
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

onMounted(() => {
  fetchProducts()
  fetchBankAccounts()
})
</script>

<style scoped>
/* SKU Selector Styles */
.sku-selector-container {
  margin-bottom: 16px;
  overflow: hidden;
}

.sku-selector {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  padding: 8px 4px;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: thin;
  scrollbar-color: #2FB8A6 rgba(47, 184, 166, 0.1);
}

.sku-selector::-webkit-scrollbar {
  height: 4px;
}

.sku-selector::-webkit-scrollbar-track {
  background: rgba(47, 184, 166, 0.1);
  border-radius: 4px;
}

.sku-selector::-webkit-scrollbar-thumb {
  background: #2FB8A6;
  border-radius: 4px;
}

.sku-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 20px;
  background: white;
  border: 2px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  min-width: 80px;
  flex-shrink: 0;
}

.sku-chip:hover {
  border-color: #2FB8A6;
  background: rgba(47, 184, 166, 0.05);
  transform: translateY(-2px);
}

.sku-chip.active {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border-color: #2FB8A6;
  color: white;
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.sku-chip-prefix {
  font-weight: 700;
  font-size: 0.9rem;
  font-family: monospace;
  letter-spacing: 0.5px;
}

.sku-chip.active .sku-chip-prefix {
  color: white;
}

.sku-chip-count {
  font-size: 0.65rem;
  color: #6E8B90;
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
}

.sku-chip.active .sku-chip-count {
  color: white;
  background: rgba(255, 255, 255, 0.2);
}

.no-sku {
  padding: 12px;
  color: #6E8B90;
  font-size: 0.85rem;
}

.select-sku-svg {
  width: 48px;
  height: 48px;
  margin-bottom: 12px;
  color: #6E8B90;
}

/* Products Grid */
.products-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 400px;
  overflow-y: auto;
}

.product-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
}

.product-card:hover {
  border-color: rgba(47, 184, 166, 0.3);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.1);
}

.product-card:active {
  transform: scale(0.98);
}

.product-image {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.product-info {
  flex: 1;
}

.product-name {
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 4px;
}

.product-sku {
  font-size: 0.7rem;
  color: black;
  margin-bottom: 4px;
  font-family: monospace;
}

.product-price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-weight: 600;
  color: #2FB8A6;
  font-size: 0.9rem;
}

.product-stock {
  font-size: 0.7rem;
  color: black;
}

.product-stock.low-stock {
  color: #EF4444;
}

.add-btn {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: rgba(47, 184, 166, 0.1);
  border: none;
  color: #2FB8A6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: #2FB8A6;
  color: white;
}

/* Cart Item Price Editing Styles (NEW) */
.cart-item-info {
  flex: 1;
}

.cart-item-name {
  font-weight: 500;
  color: #1A2A2E;
  display: block;
  margin-bottom: 4px;
}

.cart-item-sku {
  font-size: 0.7rem;
  color: black;
  display: block;
  margin-bottom: 8px;
}

.cart-item-price-edit {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.price-label {
  font-size: 0.75rem;
  color: #6E8B90;
  min-width: 50px;
}

.price-input {
  width: 100px;
  padding: 4px 8px;
  border: 1px solid rgba(47, 184, 166, 0.3);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #2FB8A6;
  background: white;
  transition: all 0.2s ease;
}

.price-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 2px rgba(47, 184, 166, 0.1);
}

.cart-item-line-total {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.line-total-label {
  font-size: 0.7rem;
  color: #6E8B90;
}

.line-total {
  font-size: 0.85rem;
  font-weight: 600;
  color: #1A2A2E;
}

.cart-item-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Keep all existing styles from the original POS page */
.pos-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.stat-svg-icon {
  width: 16px;
  height: 16px;
}

.toggle-svg-icon {
  width: 18px;
  height: 18px;
}

.toggle-arrow-svg {
  width: 14px;
  height: 14px;
  transition: transform 0.3s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}

.search-svg-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: black;
}

.product-svg-icon {
  width: 28px;
  height: 28px;
}

.add-svg-icon {
  width: 14px;
  height: 14px;
}

.cart-svg-icon {
  width: 18px;
  height: 18px;
}

.clear-svg-icon {
  width: 14px;
  height: 14px;
}

.qty-svg-icon {
  width: 12px;
  height: 12px;
}

.remove-svg-icon {
  width: 12px;
  height: 12px;
}

.empty-cart-svg {
  width: 64px;
  height: 64px;
  margin-bottom: 12px;
  color: black;
}

.btn-svg-icon {
  width: 16px;
  height: 16px;
}

.toast-svg-icon {
  width: 18px;
  height: 18px;
}

/* Header */
.pos-header {
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

.pos-stats {
  display: flex;
  gap: 12px;
  align-items: center;
}

.stat-chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 40px;
  font-size: 0.9rem;
  font-weight: 500;
  color: #1A2A2E;
}

.stat-chip.total {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
}

/* Refund button */
.refund-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(239, 68, 68, 0.9);
  backdrop-filter: blur(20px);
  border: none;
  border-radius: 40px;
  color: white;
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refund-btn:hover {
  background: #ef4444;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.refund-svg-icon {
  width: 18px;
  height: 18px;
}

/* Mobile Cart Toggle */
.mobile-cart-toggle {
  display: none;
  margin-bottom: 16px;
}

.cart-toggle-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.cart-toggle-btn svg {
  stroke: white;
}

/* Layout */
.pos-layout {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 24px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

/* Products Section */
.products-section {
  overflow: hidden;
}

.search-bar {
  position: relative;
  margin-bottom: 20px;
}

.search-input {
  width: 100%;
  padding: 12px 12px 12px 40px;
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

.category-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 4px;
  -webkit-overflow-scrolling: touch;
}

.category-tab {
  padding: 6px 16px;
  background: rgba(110, 139, 144, 0.1);
  border: none;
  border-radius: 20px;
  color: black;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.category-tab.active {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
}

/* Cart Section */
.cart-section {
  display: flex;
  flex-direction: column;
  height: fit-content;
}

.cart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.cart-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.clear-cart {
  display: flex;
  align-items: center;
  gap: 6px;
  background: none;
  border: none;
  color: #EF4444;
  font-size: 0.8rem;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cart-items {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  gap: 12px;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
  color: black;
}

.cart-summary {
  background: rgba(47, 184, 166, 0.05);
  border-radius: 16px;
  padding: 16px;
  margin-bottom: 16px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
}

.summary-row.total {
  font-weight: 700;
  font-size: 1.1rem;
  color: #2FB8A6;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  margin-top: 8px;
  padding-top: 12px;
}

.summary-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(0, 0, 0, 0.1), transparent);
  margin: 8px 0;
}

.cart-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.customer-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Tax and Payment Styles */
.tax-row {
  background: rgba(47, 184, 166, 0.03);
  padding: 8px 12px;
  border-radius: 8px;
  margin: 4px 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #4a5568;
}

.tax-checkbox {
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #2FB8A6;
}

.tax-amount {
  font-weight: 500;
  color: #2FB8A6;
}

.payment-section {
  margin: 16px 0;
  padding: 12px;
  background: rgba(47, 184, 166, 0.05);
  border-radius: 12px;
}

.payment-methods {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.payment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 2px solid rgba(47, 184, 166, 0.2);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: #4a5568;
}

.payment-btn.active {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border-color: #2FB8A6;
  color: white;
}

.payment-svg-icon {
  width: 18px;
  height: 18px;
}

.account-section {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.account-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #4a5568;
  margin-bottom: 8px;
}

.account-select {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 10px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.account-select:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.account-info {
  margin-top: 12px;
  padding: 12px;
  background: rgba(47, 184, 166, 0.08);
  border-radius: 8px;
  font-size: 0.85rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 4px 0;
}

.info-row span {
  color: #6E8B90;
}

.info-row strong {
  color: #1A2A2E;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: #34D399;
  color: white;
  padding: 12px 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-width: 400px;
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

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 60px;
}

.error-svg-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 16px;
  color: #ef4444;
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

.no-products {
  text-align: center;
  padding: 40px;
  color: #6E8B90;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
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

/* Responsive */
@media (max-width: 1024px) {
  .pos-layout {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .pos-container {
    padding: 16px;
  }
  
  .pos-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .page-subtitle {
    font-size: 0.8rem;
  }
  
  .pos-stats {
    width: 100%;
    justify-content: space-between;
  }
  
  .stat-chip {
    flex: 1;
    justify-content: center;
  }
  
  .mobile-cart-toggle {
    display: block;
  }
  
  .products-section.mobile-hidden {
    display: none;
  }
  
  .cart-section.mobile-hidden {
    display: none;
  }
  
  .cart-section.mobile-visible {
    display: flex;
  }
  
  .products-grid {
    max-height: 50vh;
  }
  
  .product-card {
    padding: 10px;
  }
  
  .product-image {
    width: 48px;
    height: 48px;
  }
  
  .product-svg-icon {
    width: 22px;
    height: 22px;
  }
  
  .product-name {
    font-size: 0.9rem;
  }
  
  .cart-items {
    max-height: 50vh;
  }
  
  .glass-card {
    padding: 16px;
  }
  
  .payment-methods {
    flex-direction: column;
    gap: 8px;
  }
  
  .info-row {
    flex-direction: column;
    gap: 4px;
  }
  
  .toast {
    left: 16px;
    right: 16px;
    bottom: 16px;
    max-width: none;
  }
  
  .sku-chip {
    padding: 8px 14px;
    min-width: 60px;
  }
  
  .sku-chip-prefix {
    font-size: 0.8rem;
  }
  
  /* Cart item responsive */
  .cart-item {
    flex-wrap: wrap;
  }
  
  .cart-item-info {
    width: 100%;
  }
  
  .cart-item-controls {
    width: 100%;
    justify-content: flex-end;
    margin-top: 8px;
  }
  
  .cart-item-price-edit {
    flex-wrap: wrap;
  }
  
  .price-input {
    flex: 1;
    min-width: 80px;
  }
}

@media (max-width: 480px) {
  .product-card {
    flex-direction: row;
    text-align: left;
  }
  
  .product-price-row {
    justify-content: flex-start;
    gap: 12px;
  }
  
  .add-btn {
    position: static;
  }
  
  .category-tab {
    padding: 4px 12px;
    font-size: 0.75rem;
  }
  
  .empty-cart-svg {
    width: 48px;
    height: 48px;
  }
  
  .price-input {
    width: 100%;
  }
}
</style>