<template>
  <div class="dashboard-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ $t('common.loadingDashboard') }}</p>
    </div>

    <!-- Welcome Section -->
    <div class="welcome-section glass-card animate-slide-up">
      <div class="welcome-content">
        <div>
          <h1 class="welcome-title">
            {{ $t('dashboard.welcomeBackSimple') }}, <span class="gradient-text">{{ userName }}</span>
          </h1>
          <p class="welcome-subtitle">{{ $t('dashboard.overviewSubtitle') }}</p>
        </div>
        <div class="date-badge">
          <svg class="date-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ currentDate }}</span>
        </div>
      </div>
    </div>
    
    <!-- Stats Grid -->
    <div class="stats-grid">
      <div class="stat-card" v-for="stat in statsData" :key="stat.title">
        <div class="stat-icon" :class="stat.iconClass">
          <component :is="getIconComponent(stat.icon)" />
        </div>
        <div class="stat-info">
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-label">{{ $t(stat.translationKey) }}</p>
        </div>
      </div>
    </div>

    <!-- Low Stock Alert Section -->
    <div class="alert-section glass-card">
      <div class="alert-header">
        <div class="alert-title">
          <svg class="alert-title-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3>{{ $t('dashboard.lowStockAlert') }}</h3>
          <span class="alert-count">{{ lowStockProducts.length }} {{ $t('common.items') }}</span>
        </div>
        <button class="refresh-btn" @click="refreshData" :disabled="refreshing">
          <svg class="refresh-icon" :class="{ 'animate-spin': refreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ $t('common.refresh') }}
        </button>
      </div>
      
      <div class="stock-grid">
        <div v-if="lowStockLoading" class="loading-state full-width">
          <div class="spinner-small"></div>
          <p>{{ $t('dashboard.checkingStock') }}</p>
        </div>
        <div v-else-if="lowStockProducts.length === 0" class="empty-state full-width">
          <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p>{{ $t('dashboard.allStockHealthy') }}</p>
        </div>
        <div v-else v-for="item in lowStockProducts" :key="item.sku" class="stock-card">
          <div class="stock-icon">
            <svg class="stock-product-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div class="stock-info">
            <p class="stock-name">{{ item.product_name }}</p>
            <p class="stock-sku">{{ item.sku }}</p>
            <div class="stock-level">
              <div class="stock-bar">
                <div class="stock-fill" :style="{ width: getStockPercentage(item) + '%' }"></div>
              </div>
              <p class="stock-quantity">{{ item.current_stock }} / {{ item.reorder_level }} {{ $t('common.units') }}</p>
            </div>
          </div>
          <button class="restock-btn" @click="restockItem(item)" :disabled="restocking[item.sku]">
            {{ restocking[item.sku] ? $t('common.processing') : $t('stock.restock') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Today's Sales Summary -->
    <div class="analytics-grid">
      <div class="sales-summary-card glass-card">
        <div class="card-header">
          <h3 class="card-title">{{ $t('dashboard.todaySales') }}</h3>
          <span class="date-badge-sm">{{ todayDate }}</span>
        </div>
        <div class="sales-stats">
          <div class="sales-stat-item">
            <p class="stat-label-sm">{{ $t('dashboard.totalSales') }}</p>
            <p class="stat-value-lg">{{ todaySales.count }} {{ $t('dashboard.orders') }}</p>
          </div>
          <div class="sales-stat-item">
            <p class="stat-label-sm">{{ $t('reports.revenue') }}</p>
            <p class="stat-value-lg highlight">{{ formatCurrency(todaySales.revenue) }}</p>
          </div>
        </div>
      </div>

      <!-- Active Alerts -->
      <div class="alerts-card glass-card">
        <div class="card-header">
          <h3 class="card-title">{{ $t('dashboard.activeAlerts') }}</h3>
          <span class="alert-badge">{{ activeAlerts }}</span>
        </div>
        <div class="alerts-content">
          <div v-if="activeAlerts === 0" class="empty-state-small">
            <svg class="empty-small-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p>{{ $t('dashboard.noActiveAlerts') }}</p>
          </div>
          <div v-else class="alerts-list">
            <div v-for="i in Math.min(activeAlerts, 3)" :key="i" class="alert-item">
              <div class="alert-icon warning">
                <svg class="alert-warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div class="alert-info">
                <p class="alert-message">{{ $t('dashboard.pendingAlertsMessage', { count: activeAlerts }) }}</p>
                <p class="alert-time">{{ $t('dashboard.checkLowStock') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div v-if="recentActivities.length > 0" class="activity-section glass-card">
      <div class="card-header">
        <h3 class="card-title">{{ $t('dashboard.recentActivity') }}</h3>
        <button class="view-all-link" @click="viewAllActivities">{{ $t('dashboard.viewAll') }} →</button>
      </div>
      <div class="activity-timeline">
        <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
          <div class="activity-icon" :class="activity.type">
            <svg class="activity-type-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="activity.icon" />
            </svg>
          </div>
          <div class="activity-content">
            <p class="activity-message">{{ activity.message }}</p>
            <p class="activity-time">{{ formatTime(activity.timestamp) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { h } from 'vue'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const userName = authStore.userName

const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
const todayDate = computed(() => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }))

const loading = ref(true)
const refreshing = ref(false)
const dashboardData = ref(null)
const statsData = ref([])
const lowStockProducts = ref([])
const lowStockLoading = ref(false)
const todaySales = ref({ count: 0, revenue: 0 })
const activeAlerts = ref(0)
const recentActivities = ref([])
const restocking = ref({})

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(value)

const PackageIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' })])
const StoreIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' })])
const AlertIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' })])
const CashIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' })])

const getIconComponent = (iconName) => ({ PackageIcon, StoreIcon, AlertIcon, CashIcon }[iconName] || PackageIcon)
const getStockPercentage = (item) => Math.min((item.current_stock / item.reorder_level) * 100, 100)

const fetchDashboardData = async () => {
  try {
    const response = await api.get('/dashboard/')
    dashboardData.value = response.data
    
    statsData.value = [
      { translationKey: 'dashboard.totalProducts', title: 'Total Products', value: dashboardData.value.total_products?.toLocaleString() || '0', icon: 'PackageIcon', iconClass: 'bg-teal-100 text-teal-600' },
      { translationKey: 'dashboard.totalBranches', title: 'Total Branches', value: dashboardData.value.total_branches?.toString() || '0', icon: 'StoreIcon', iconClass: 'bg-blue-100 text-blue-600' },
      { translationKey: 'dashboard.lowStockAlerts', title: 'Low Stock Alerts', value: dashboardData.value.low_stock_alerts?.toString() || '0', icon: 'AlertIcon', iconClass: 'bg-orange-100 text-orange-600' },
      { translationKey: 'dashboard.revenueToday', title: "Today's Revenue", value: formatCurrency(dashboardData.value.today_sales?.revenue || 0), icon: 'CashIcon', iconClass: 'bg-green-100 text-green-600' }
    ]
    
    lowStockProducts.value = dashboardData.value.low_stock_products || []
    todaySales.value = dashboardData.value.today_sales || { count: 0, revenue: 0 }
    activeAlerts.value = dashboardData.value.active_alerts || 0
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
    if (error.response?.status === 401) { authStore.logout(); router.push('/login'); return }
    setEmptyData()
  }
}

const setEmptyData = () => {
  statsData.value = [
    { translationKey: 'dashboard.totalProducts', title: 'Total Products', value: '0', icon: 'PackageIcon', iconClass: 'bg-teal-100 text-teal-600' },
    { translationKey: 'dashboard.totalBranches', title: 'Total Branches', value: '0', icon: 'StoreIcon', iconClass: 'bg-blue-100 text-blue-600' },
    { translationKey: 'dashboard.lowStockAlerts', title: 'Low Stock Alerts', value: '0', icon: 'AlertIcon', iconClass: 'bg-orange-100 text-orange-600' },
    { translationKey: 'dashboard.revenueToday', title: "Today's Revenue", value: formatCurrency(0), icon: 'CashIcon', iconClass: 'bg-green-100 text-green-600' }
  ]
  lowStockProducts.value = []; todaySales.value = { count: 0, revenue: 0 }; activeAlerts.value = 0
}

const restockItem = async (item) => {
  restocking.value[item.sku] = true
  try { await api.post('/products/restock', { sku: item.sku, quantity: item.reorder_level, branch_id: item.branch_id }); await fetchDashboardData() }
  catch (error) { alert(t('stock.failedToAdd')) }
  finally { restocking.value[item.sku] = false }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp); const now = new Date()
  const diffMins = Math.floor((now - date) / 60000); const diffHours = Math.floor(diffMins / 60); const diffDays = Math.floor(diffHours / 24)
  if (diffMins < 1) return t('profile.justNow')
  if (diffMins < 60) return t('profile.minutesAgo', { count: diffMins })
  if (diffHours < 24) return t('profile.hoursAgo', { count: diffHours })
  if (diffDays < 7) return t('profile.daysAgo', { count: diffDays })
  return date.toLocaleDateString()
}

const refreshData = async () => { refreshing.value = true; try { await fetchDashboardData() } catch (error) {} finally { refreshing.value = false } }
const viewAllActivities = () => { console.log('View all activities') }
const loadDashboardData = async () => { loading.value = true; try { await fetchDashboardData() } catch (error) {} finally { loading.value = false } }

onMounted(() => {
  if (!authStore.isAuthenticated) { router.push('/login'); return }
  loadDashboardData()
})
</script>

<style scoped>
/* Debug Panel */
.debug-panel {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 350px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(10px);
  border: 1px solid #2FB8A6;
  padding: 10px;
  font-family: monospace;
  font-size: 11px;
}

.debug-panel summary {
  cursor: pointer;
  color: #2FB8A6;
  font-weight: bold;
  padding: 5px;
}

.debug-content {
  margin-top: 10px;
  border-top: 1px solid #333;
  padding-top: 10px;
}

.debug-panel p {
  margin: 5px 0;
  color: #0f0;
}

.debug-panel pre {
  font-size: 10px;
  margin: 5px 0;
  overflow-x: auto;
  background: #111;
  padding: 5px;
  border-radius: 4px;
  color: #0f0;
}

.test-btn {
  margin-top: 5px;
  margin-right: 5px;
  padding: 5px 10px;
  background: #2FB8A6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 11px;
}

.test-btn:hover {
  background: #1F8A7C;
}

.test-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.clear-btn {
  background: #F472B6;
}

.clear-btn:hover {
  background: #e05a9e;
}

/* Loading States */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
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
  width: 24px;
  height: 24px;
  border: 2px solid rgba(47, 184, 166, 0.2);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Dashboard Container */
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 2rem;
  animation: fadeIn 0.5s ease-out;
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.glass-card:hover {
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
  transform: translateY(-2px);
}

/* Welcome Section */
.welcome-section {
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.1), rgba(111, 211, 195, 0.05));
  border: 1px solid rgba(47, 184, 166, 0.2);
}

.welcome-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.welcome-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.welcome-subtitle {
  color: black;
  font-size: 0.9rem;
}

.date-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 40px;
  color: #2FB8A6;
  font-size: 0.85rem;
  font-weight: 500;
}

.date-icon {
  width: 18px;
  height: 18px;
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-svg-icon {
  width: 26px;
  height: 26px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
  line-height: 1.2;
}

.stat-label {
  font-size: 0.85rem;
  color: black;
}

/* Alert Section */
.alert-section {
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.alert-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.alert-title-icon {
  width: 22px;
  height: 22px;
  color: #2FB8A6;
}

.alert-title h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
  margin: 0;
}

.alert-count {
  background: #2FB8A6;
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 600;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid rgba(47, 184, 166, 0.3);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: black;
  font-size: 0.8rem;
}

.refresh-icon {
  width: 14px;
  height: 14px;
}

.refresh-btn:hover {
  border-color: #2FB8A6;
  color: #2FB8A6;
}

.stock-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.stock-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.stock-card:hover {
  background: rgba(0, 0, 0, 0.05);
}

.stock-icon {
  width: 48px;
  height: 48px;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stock-product-icon {
  width: 24px;
  height: 24px;
  color: #2FB8A6;
}

.stock-info {
  flex: 1;
  min-width: 0;
}

.stock-name {
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stock-sku {
  font-size: 0.7rem;
  color: black;
  margin-bottom: 0.5rem;
}

.stock-level {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stock-bar {
  flex: 1;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  background: #F472B6;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.stock-quantity {
  font-size: 0.7rem;
  color: black;
  white-space: nowrap;
}

.restock-btn {
  padding: 0.4rem 1rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.75rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  white-space: nowrap;
  flex-shrink: 0;
}

.restock-btn:hover:not(:disabled) {
  transform: scale(1.02);
  background: linear-gradient(135deg, #1F8A7C, #2FB8A6);
}

.restock-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Analytics Grid */
.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.sales-summary-card,
.alerts-card {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.sales-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-top: 1rem;
}

.sales-stat-item {
  text-align: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 16px;
}

.stat-label-sm {
  font-size: 0.75rem;
  color: black;
  margin-bottom: 0.5rem;
}

.stat-value-lg {
  font-size: 1.5rem;
  font-weight: 700;
  color: #1A2A2E;
}

.stat-value-lg.highlight {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.date-badge-sm {
  font-size: 0.75rem;
  color: black;
  background: rgba(47, 184, 166, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.alert-badge {
  background: #F472B6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.alerts-content {
  margin-top: 1rem;
}

.empty-state-small {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: black;
  gap: 0.5rem;
}

.empty-small-icon {
  width: 32px;
  height: 32px;
  color: #9CA3AF;
}

.alerts-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(244, 114, 182, 0.05);
  border-radius: 12px;
}

.alert-icon.warning {
  background: rgba(244, 114, 182, 0.1);
  color: #F472B6;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-warning-icon {
  width: 16px;
  height: 16px;
}

.alert-info {
  flex: 1;
  min-width: 0;
}

.alert-message {
  font-size: 0.85rem;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.alert-time {
  font-size: 0.7rem;
  color: black;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: black;
  gap: 0.5rem;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #9CA3AF;
}

.full-width {
  grid-column: 1 / -1;
}

/* Activity Section */
.activity-section {
  padding: 1.5rem;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: rgba(0, 0, 0, 0.02);
}

.activity-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-type-icon {
  width: 18px;
  height: 18px;
}

.activity-icon.sale {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.activity-icon.stock {
  background: rgba(244, 114, 182, 0.1);
  color: #F472B6;
}

.activity-icon.product {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.activity-icon.branch {
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-message {
  font-size: 0.85rem;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.7rem;
  color: black;
}

.view-all-link {
  color: #2FB8A6;
  font-size: 0.85rem;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.3s ease;
  font-weight: 500;
  background: none;
  border: none;
}

.view-all-link:hover {
  color: #1F8A7C;
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

.animate-slide-up {
  animation: slideUp 0.5s ease-out;
}

/* Responsive */
@media (max-width: 1024px) {
  .analytics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .welcome-title {
    font-size: 1.4rem;
  }
  
  .stock-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-value {
    font-size: 1.4rem;
  }
  
  .stat-icon {
    width: 48px;
    height: 48px;
  }
  
  .stat-svg-icon {
    width: 22px;
    height: 22px;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .welcome-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .card-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .debug-panel {
    max-width: 90%;
    left: 5%;
    right: 5%;
    bottom: 10px;
  }
  
  .stock-card {
    flex-wrap: wrap;
  }
  
  .restock-btn {
    width: 100%;
    margin-top: 0.5rem;
  }
  
  .sales-stats {
    grid-template-columns: 1fr;
  }
}
</style>