<template>
  <div class="sales-dashboard">
    <!-- Header Section -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('dashboard.title') }}</h1>
        <p class="page-subtitle">{{ $t('dashboard.welcomeBack', { name: userName }) }}</p>
      </div>
      <div class="header-actions">
        <router-link to="/sales/pos" class="btn-primary">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          <span>{{ $t('dashboard.newSale') }}</span>
        </router-link>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>{{ $t('common.loadingDashboard') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state glass-card">
      <svg class="error-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3>{{ $t('common.connectionIssue') }}</h3>
      <p>{{ error }}</p>
      <button @click="loadDashboardData" class="btn-primary">{{ $t('common.retry') }}</button>
    </div>

    <!-- Main Content -->
    <template v-else>
      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card glass-card">
          <div class="stat-icon teal">
            <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ formatCurrency(todayRevenue) }}</p>
            <p class="stat-label">{{ $t('dashboard.todaySales') }}</p>
          </div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon purple">
            <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ todaySalesCount }}</p>
            <p class="stat-label">{{ $t('dashboard.todayTransactions') }}</p>
          </div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon orange">
            <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ lowStockCount }}</p>
            <p class="stat-label">{{ $t('dashboard.lowStockAlerts') }}</p>
          </div>
        </div>
        
        <div class="stat-card glass-card">
          <div class="stat-icon blue">
            <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
          </div>
          <div class="stat-info">
            <p class="stat-value">{{ totalProducts }}</p>
            <p class="stat-label">{{ $t('dashboard.totalProducts') }}</p>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions glass-card">
        <div class="quick-actions-header">
          <h3>{{ $t('dashboard.quickActions') }}</h3>
          <span class="helper-text">{{ $t('dashboard.quickActionsHelp') }}</span>
        </div>
        <div class="action-buttons">
          <button class="action-btn" v-for="action in quickActions" :key="action.name" @click="quickSale(action)">
            <div class="action-icon" :style="{ background: action.color }">
              <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="action.iconPath" />
              </svg>
            </div>
            <div class="action-info">
              <span class="action-name">{{ action.name }}</span>
              <span class="action-price">{{ formatCurrency(action.price) }}</span>
            </div>
          </button>
          <router-link to="/sales/pos" class="action-btn">
            <div class="action-icon" style="background: #2FB8A6">
              <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div class="action-info">
              <span class="action-name">{{ $t('dashboard.fullPOS') }}</span>
              <span class="action-price">{{ $t('dashboard.completeSystem') }}</span>
            </div>
          </router-link>
        </div>
      </div>

      <!-- Recent Sales Table -->
      <div class="recent-sales glass-card">
        <div class="section-header">
          <div class="section-title">
            <svg class="title-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3>{{ $t('dashboard.recentTransactions') }}</h3>
          </div>
          <button @click="fetchRecentSales" class="refresh-btn" :title="$t('common.refresh')">
            <svg class="refresh-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{{ $t('common.refresh') }}</span>
          </button>
        </div>
        <div class="sales-table-container">
          <table class="sales-table">
            <thead>
              <tr>
                <th>{{ $t('sales.invoice') }}</th>
                <th>{{ $t('common.time') }}</th>
                <th>{{ $t('sales.items') }}</th>
                <th>{{ $t('sales.quantity') }}</th>
                <th>{{ $t('sales.total') }}</th>
                <th>{{ $t('sales.paymentMethod') }}</th>
                <th>{{ $t('common.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in recentSales" :key="sale.id" class="sale-row">
                <td class="invoice-cell">{{ sale.invoice_number }}</td>
                <td>
                  <div class="time-cell">
                    <svg class="time-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ sale.time }}
                  </div>
                </td>
                <td class="items-cell">{{ sale.items }}</td>
                <td>{{ sale.quantity }} {{ $t('common.items') }}</td>
                <td class="amount">{{ formatCurrency(sale.amount) }}</td>
                <td>
                  <span class="payment-badge" :class="sale.payment_method">
                    {{ sale.payment_method === 'cash' ? $t('pos.cash') : $t('pos.bankTransfer') }}
                  </span>
                </td>
                <td>
                  <span class="status-badge completed">
                    <span class="status-dot"></span>
                    {{ $t('sales.completed') }}
                  </span>
                </td>
              </tr>
              <tr v-if="recentSales.length === 0">
                <td colspan="7" class="empty-table">{{ $t('dashboard.noRecentSales') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Low Stock Alert -->
      <div v-if="lowStockProducts.length > 0" class="low-stock-alert glass-card">
        <div class="alert-header">
          <div class="alert-title">
            <svg class="alert-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3>{{ $t('dashboard.lowStockAlert') }}</h3>
            <span class="alert-count">{{ $t('dashboard.itemsNeedAttention', { count: lowStockProducts.length }) }}</span>
          </div>
        </div>
        <div class="alert-items">
          <div v-for="item in lowStockProducts" :key="item.sku" class="alert-item">
            <div class="item-info">
              <div class="item-icon" style="background: #F59E0B">
                <svg class="item-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <div>
                <div class="item-name">{{ item.product_name }}</div>
                <div class="item-stock">{{ $t('dashboard.unitsRemaining', { stock: item.current_stock, reorder: item.reorder_level }) }}</div>
              </div>
            </div>
            <div class="stock-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: getStockPercentage(item.current_stock, item.reorder_level) + '%', background: getProgressColor(item.current_stock, item.reorder_level) }"></div>
              </div>
              <span class="progress-percentage">{{ getStockPercentage(item.current_stock, item.reorder_level) }}% {{ $t('dashboard.ofReorderLevel') }}</span>
            </div>
            <router-link to="/sales/pos" class="notify-btn">
              <svg class="notify-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('dashboard.sellNow') }}
            </router-link>
          </div>
        </div>
      </div>
    </template>
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

const userName = computed(() => authStore.userName)

// State
const loading = ref(true)
const error = ref(null)
const dashboardData = ref({
  total_products: 0,
  total_branches: 0,
  low_stock_alerts: 0,
  low_stock_products: [],
  today_sales: {
    count: 0,
    revenue: 0
  },
  active_alerts: 0
})

const recentSales = ref([])
const products = ref([])

const todayRevenue = computed(() => dashboardData.value.today_sales?.revenue || 0)
const todaySalesCount = computed(() => dashboardData.value.today_sales?.count || 0)
const lowStockCount = computed(() => dashboardData.value.low_stock_alerts || 0)
const totalProducts = computed(() => dashboardData.value.total_products || 0)
const lowStockProducts = computed(() => dashboardData.value.low_stock_products || [])

const quickActions = computed(() => {
  return products.value.slice(0, 4).map(product => ({
    name: product.name,
    price: product.price,
    color: getProductColor(product.category),
    iconPath: getIconPath(product.category),
    product_id: product.id
  }))
})

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

const getStockPercentage = (currentStock, reorderLevel) => {
  if (!reorderLevel || reorderLevel === 0) return 0
  return Math.min(Math.round((currentStock / reorderLevel) * 100), 100)
}

const getProgressColor = (currentStock, reorderLevel) => {
  const percentage = getStockPercentage(currentStock, reorderLevel)
  if (percentage >= 90) return '#EF4444'
  if (percentage >= 70) return '#F97316'
  return '#F59E0B'
}

const fetchRecentSales = async () => {
  try {
    const today = new Date().toISOString().split('T')[0]
    const response = await api.get('/sales', { 
      params: { 
        from_date: today, 
        to_date: today,
        limit: 10
      }
    })
    const sales = response.data || []
    
    recentSales.value = sales.slice(0, 10).map(sale => ({
      id: sale.id,
      invoice_number: sale.invoice_number,
      time: new Date(sale.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      items: sale.items?.map(i => i.product_name).join(', ') || 'Various items',
      quantity: sale.items?.reduce((sum, i) => sum + (i.quantity || 0), 0) || 0,
      amount: sale.total_amount,
      payment_method: sale.payment_method
    }))
  } catch (err) {
    console.error('Failed to fetch recent sales:', err)
    recentSales.value = []
  }
}

const fetchProducts = async () => {
  try {
    const response = await api.get('/products', { params: { active: true } })
    products.value = response.data || []
  } catch (err) {
    console.error('Failed to fetch products:', err)
    products.value = []
  }
}

const loadDashboardData = async () => {
  loading.value = true
  error.value = null
  
  try {
    const response = await api.get('/dashboard')
    dashboardData.value = response.data || {
      total_products: 0,
      total_branches: 0,
      low_stock_alerts: 0,
      low_stock_products: [],
      today_sales: { count: 0, revenue: 0 },
      active_alerts: 0
    }
    console.log('Dashboard data loaded:', dashboardData.value)
  } catch (err) {
    console.error('Failed to load dashboard:', err)
    error.value = t('common.connectionError')
  } finally {
    loading.value = false
  }
}

const quickSale = (action) => {
  router.push(`/sales/pos?product=${action.product_id}`)
}

onMounted(async () => {
  await loadDashboardData()
  await Promise.all([
    fetchProducts(),
    fetchRecentSales()
  ])
})
</script>

<style scoped>
/* Add loading and error styles */
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

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Keep all your existing styles below */
.sales-dashboard {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.btn-svg-icon { width: 16px; height: 16px; }
.stat-svg-icon { width: 24px; height: 24px; }
.action-svg-icon { width: 20px; height: 20px; }
.title-svg-icon { width: 18px; height: 18px; }
.time-svg-icon { width: 14px; height: 14px; }
.alert-svg-icon { width: 22px; height: 22px; }
.item-svg-icon { width: 20px; height: 20px; }
.notify-svg-icon { width: 14px; height: 14px; }
.refresh-svg-icon { width: 16px; height: 16px; }

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

.header-actions {
  display: flex;
  gap: 12px;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.glass-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  padding: 16px;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.teal { background: rgba(47, 184, 166, 0.1); color: #2FB8A6; }
.stat-icon.purple { background: rgba(139, 92, 246, 0.1); color: #8B5CF6; }
.stat-icon.orange { background: rgba(249, 115, 22, 0.1); color: #F97316; }
.stat-icon.blue { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }

.stat-info { flex: 1; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #1A2A2E; margin-bottom: 4px; }
.stat-label { font-size: 0.7rem; color: black; text-transform: uppercase; letter-spacing: 0.5px; }

/* Quick Actions */
.quick-actions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.quick-actions-header h3 { font-size: 1rem; font-weight: 600; color: #1A2A2E; }
.helper-text { font-size: 0.7rem; color: black; }

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  background: rgba(47, 184, 166, 0.05);
  border: 1px solid rgba(47, 184, 166, 0.1);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  flex: 1;
  min-width: 140px;
}

.action-btn:hover {
  transform: translateY(-2px);
  border-color: #2FB8A6;
  box-shadow: 0 8px 20px rgba(47, 184, 166, 0.15);
}

.action-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.action-info { text-align: left; }
.action-name { display: block; font-weight: 600; color: #1A2A2E; font-size: 0.8rem; }
.action-price { font-size: 0.65rem; color: #2FB8A6; }

/* Recent Sales Table */
.recent-sales {
  overflow: hidden;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.section-title h3 { font-size: 1rem; font-weight: 600; color: #1A2A2E; }

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 8px;
  color: black;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background: rgba(110, 139, 144, 0.2);
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
}

.sales-table th {
  text-align: left;
  padding: 12px 12px;
  background: rgba(47, 184, 166, 0.05);
  color: black;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sales-table td {
  padding: 12px 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.sale-row { transition: all 0.2s ease; }
.sale-row:hover {
  background: rgba(47, 184, 166, 0.05);
}

.invoice-cell {
  font-family: monospace;
  font-size: 0.8rem;
  font-weight: 500;
  color: #2FB8A6;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  color: black;
  font-size: 0.75rem;
}

.items-cell {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.amount {
  font-weight: 600;
  color: #2FB8A6;
}

.payment-badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.65rem;
  font-weight: 500;
}

.payment-badge.cash {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.payment-badge.transfer {
  background: rgba(59, 130, 246, 0.1);
  color: #3B82F6;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 500;
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #34D399;
  border-radius: 50%;
}

.empty-table {
  text-align: center;
  padding: 2rem;
  color: #6E8B90;
}

/* Low Stock Alert */
.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
}

.alert-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.alert-title svg { color: #F97316; }
.alert-title h3 { font-size: 1rem; font-weight: 600; color: #1A2A2E; }

.alert-count {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 0.7rem;
}

.alert-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.alert-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding: 14px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 14px;
}

.item-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.item-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.item-name { font-weight: 600; color: #1A2A2E; font-size: 0.9rem; }
.item-stock { font-size: 0.65rem; color: black; }

.stock-progress {
  flex: 1;
  min-width: 120px;
}

.progress-bar {
  height: 5px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-fill {
  height: 100%;
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 0.65rem;
  color: black;
}

.notify-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: rgba(47, 184, 166, 0.1);
  border: none;
  border-radius: 8px;
  color: #2FB8A6;
  font-size: 0.7rem;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.2s ease;
}

.notify-btn:hover {
  background: rgba(47, 184, 166, 0.2);
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Responsive */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  
  .sales-table {
    font-size: 0.8rem;
  }
  
  .items-cell {
    max-width: 150px;
  }
}

@media (max-width: 768px) {
  .sales-dashboard { padding: 16px; }
  
  .stats-grid {
    gap: 12px;
  }
  
  .stat-card {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 1.2rem;
  }
  
  .stat-icon {
    width: 40px;
    height: 40px;
  }
  
  .stat-svg-icon {
    width: 18px;
    height: 18px;
  }
  
  .sales-table th,
  .sales-table td {
    padding: 8px 10px;
  }
  
  .invoice-cell {
    font-size: 0.7rem;
  }
  
  .items-cell {
    max-width: 100px;
  }
  
  .action-buttons { 
    justify-content: center; 
  }
  
  .action-btn {
    min-width: 120px;
    padding: 8px 12px;
  }
  
  .page-title { 
    font-size: 1.4rem; 
  }
  
  .alert-item { 
    flex-direction: column; 
    text-align: center; 
  }
  
  .stock-progress { 
    width: 100%; 
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .sales-table {
    display: block;
    overflow-x: auto;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    gap: 10px;
  }
  
  .stat-card {
    padding: 10px;
    gap: 8px;
  }
  
  .stat-value {
    font-size: 1rem;
  }
  
  .stat-icon {
    width: 36px;
    height: 36px;
  }
  
  .stat-svg-icon {
    width: 16px;
    height: 16px;
  }
  
  .action-btn {
    min-width: 100%;
  }
  
  .alert-item {
    padding: 12px;
  }
  
  .item-icon {
    width: 40px;
    height: 40px;
  }
}
</style>