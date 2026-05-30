<template>
  <div class="alerts-container">
    <!-- Header Section -->
    <div class="header-section">
      <div>
        <h1 class="page-title">{{ $t('alerts.title') }}</h1>
        <p class="page-subtitle">{{ $t('alerts.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button @click="checkLowStock" class="check-btn" :disabled="checkingStock">
          <svg class="check-svg-icon" :class="{ 'animate-spin': checkingStock }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          {{ checkingStock ? $t('alerts.checking') : $t('alerts.checkStock') }}
        </button>
        <button @click="fetchAlerts" class="refresh-btn" :class="{ 'refreshing': refreshing }">
          <svg class="refresh-svg-icon" :class="{ 'animate-spin': refreshing }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {{ refreshing ? $t('alerts.refreshing') : $t('common.refresh') }}
        </button>
      </div>
    </div>

    <!-- Alert Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card critical" @click="activeTab = 'active'">
        <div class="stat-icon"><svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div>
        <div class="stat-info"><p class="stat-value">{{ activeAlerts.length }}</p><p class="stat-label">{{ $t('alerts.activeAlerts') }}</p><p class="stat-trend critical">{{ $t('alerts.needsAttention') }}</p></div>
      </div>
      <div class="stat-card resolved" @click="activeTab = 'resolved'">
        <div class="stat-icon"><svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
        <div class="stat-info"><p class="stat-value">{{ resolvedAlerts.length }}</p><p class="stat-label">{{ $t('alerts.resolvedAlerts') }}</p><p class="stat-trend resolved">{{ $t('sales.completed') }}</p></div>
      </div>
      <div class="stat-card total">
        <div class="stat-icon"><svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
        <div class="stat-info"><p class="stat-value">{{ totalAlerts }}</p><p class="stat-label">{{ $t('alerts.totalAlerts') }}</p><p class="stat-trend total">{{ $t('alerts.allTime') }}</p></div>
      </div>
    </div>

    <!-- Low Stock Summary Section -->
    <div class="low-stock-summary glass-card" v-if="lowStockSummary.items?.length > 0">
      <div class="summary-header"><h3>{{ $t('alerts.lowStockItems') }}</h3><span class="summary-badge">{{ lowStockSummary.total_low_stock_items }} {{ $t('alerts.itemsLow') }}</span></div>
      <div class="summary-grid">
        <div v-for="item in lowStockSummary.items" :key="item.product_id" class="summary-item" :class="{ 'out-of-stock': item.current_stock === 0 }">
          <div class="summary-item-info"><div class="summary-item-name">{{ item.product_name }}</div><div class="summary-item-sku">{{ item.product_sku }}</div><div class="summary-item-branch">{{ item.branch_name }}</div></div>
          <div class="summary-item-stats">
            <div class="stock-status"><span class="stock-label">{{ $t('alerts.currentStock') }}:</span><span class="stock-value" :class="{ 'critical': item.current_stock === 0, 'warning': item.current_stock > 0 && item.current_stock <= item.reorder_level }">{{ item.current_stock }} {{ $t('common.units') }}</span></div>
            <div class="stock-status"><span class="stock-label">{{ $t('stock.reorderLevel') }}:</span><span class="stock-value">{{ item.reorder_level }} {{ $t('common.units') }}</span></div>
            <div class="stock-progress"><div class="progress-bar" :style="{ width: getStockPercentage(item) + '%' }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs-container">
      <button @click="activeTab = 'active'" class="tab-btn" :class="{ active: activeTab === 'active' }">
        <svg class="tab-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {{ $t('alerts.activeAlerts') }}
        <span v-if="activeAlerts.length" class="badge-count">{{ activeAlerts.length }}</span>
      </button>
      <button @click="activeTab = 'resolved'" class="tab-btn" :class="{ active: activeTab === 'resolved' }">
        <svg class="tab-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        {{ $t('alerts.resolvedAlerts') }}
      </button>
    </div>

    <!-- Alerts Table -->
    <div class="alerts-table-container glass-card">
      <div class="table-header"><h3 class="table-title">{{ activeTab === 'active' ? $t('alerts.activeAlerts') : $t('alerts.resolvedAlerts') }}</h3><span class="table-count">{{ displayedAlerts.length }} {{ $t('common.items') }}</span></div>
      <div class="overflow-x-auto">
        <table class="alerts-table">
          <thead><tr><th>{{ $t('alerts.branch') }}</th><th>{{ $t('sales.product') }}</th><th>{{ $t('alerts.alertMessage') }}</th><th>{{ $t('alerts.created') }}</th><th class="text-right">{{ $t('common.actions') }}</th></tr></thead>
          <tbody>
            <tr v-for="alert in displayedAlerts" :key="alert.id" class="alert-row" :class="{ 'critical-row': !alert.resolved }">
              <td data-label="Branch"><div class="branch-cell"><svg class="branch-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>{{ alert.branch_name || $t('products.allBranches') }}</div></td>
              <td data-label="Product"><div class="product-cell"><div class="product-icon"><svg class="product-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg></div><div><p class="product-name">{{ alert.product_name || $t('products.unnamedProduct') }}</p><p class="product-sku" v-if="alert.product_sku">{{ alert.product_sku }}</p></div></div></td>
              <td data-label="Message"><div class="message-cell"><div class="alert-icon" :class="getAlertSeverity(alert)"><svg class="alert-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg></div><span>{{ alert.message }}</span></div></td>
              <td data-label="Created"><div class="date-cell"><svg class="date-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>{{ formatDate(alert.created_at) }}</div></td>
              <td class="actions-cell" data-label="Action">
                <button v-if="!alert.resolved" @click="resolveAlert(alert.id)" class="resolve-btn"><svg class="resolve-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg> {{ $t('alerts.resolve') }}</button>
                <span v-else class="resolved-badge"><svg class="resolved-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> {{ $t('alerts.resolved') }}</span>
              </td>
            </tr>
            <tr v-if="!displayedAlerts.length"><td colspan="5" class="empty-state"><div class="empty-content"><svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg><h4>{{ $t('alerts.noAlertsTitle', { type: activeTab === 'active' ? $t('alerts.activeLower') : $t('alerts.resolvedLower') }) }}</h4><p>{{ activeTab === 'active' ? $t('alerts.allHealthy') : $t('alerts.noResolved') }}</p></div></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Quick Actions -->
    <div v-if="activeAlerts.length > 0" class="quick-actions glass-card">
      <div class="quick-actions-content">
        <svg class="quick-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ $t('alerts.attentionMessage', { count: activeAlerts.length }) }}</span>
        <button @click="resolveAllAlerts" class="resolve-all-btn" v-if="activeAlerts.length > 1">{{ $t('alerts.resolveAll') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatDate } from '@/utils/format'

const { t } = useI18n()
const alerts = ref([])
const lowStockSummary = ref({ items: [], total_low_stock_items: 0 })
const activeTab = ref('active')
const refreshing = ref(false)
const checkingStock = ref(false)

const activeAlerts = computed(() => alerts.value.filter(a => !a.resolved))
const resolvedAlerts = computed(() => alerts.value.filter(a => a.resolved))
const totalAlerts = computed(() => alerts.value.length)
const displayedAlerts = computed(() => activeTab.value === 'active' ? activeAlerts.value : resolvedAlerts.value)

const getStockPercentage = (item) => {
  if (item.current_stock === 0) return 0
  return Math.min((item.current_stock / item.reorder_level) * 100, 100)
}

const getAlertSeverity = (alert) => {
  const message = alert.message?.toLowerCase() || ''
  if (message.includes('out of stock') || message.includes('critically low')) return 'critical'
  return 'warning'
}

const fetchAlerts = async () => {
  refreshing.value = true
  try { alerts.value = (await api.get('/alerts', { params: { resolved: false } })).data || [] }
  catch (e) {} finally { setTimeout(() => { refreshing.value = false }, 500) }
}

const fetchLowStockSummary = async () => {
  try { lowStockSummary.value = (await api.get('/alerts/low-stock-summary')).data || { items: [], total_low_stock_items: 0 } }
  catch (e) {}
}

const checkLowStock = async () => {
  checkingStock.value = true
  try { await api.post('/alerts/check-low-stock'); await Promise.all([fetchAlerts(), fetchLowStockSummary()]) }
  catch (e) { alert(e.response?.data?.detail || t('alerts.checkFailed')) }
  finally { checkingStock.value = false }
}

const resolveAlert = async (alertId) => {
  try { await api.post(`/alerts/${alertId}/resolve`); await Promise.all([fetchAlerts(), fetchLowStockSummary()]) }
  catch (e) { alert(e.response?.data?.detail || t('alerts.resolveFailed')) }
}

const resolveAllAlerts = async () => {
  if (confirm(t('alerts.resolveAllConfirm', { count: activeAlerts.value.length }))) {
    for (const alert of activeAlerts.value) await resolveAlert(alert.id)
  }
}

onMounted(() => { fetchAlerts(); fetchLowStockSummary() })
</script>

<style scoped>
.alerts-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 2rem;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.refresh-svg-icon, .check-svg-icon {
  width: 14px;
  height: 14px;
}

.stat-svg-icon {
  width: 24px;
  height: 24px;
}

.tab-svg-icon {
  width: 16px;
  height: 16px;
}

.branch-svg-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: #2FB8A6;
}

.product-svg-icon {
  width: 16px;
  height: 16px;
}

.alert-svg-icon {
  width: 14px;
  height: 14px;
}

.date-svg-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
}

.resolve-svg-icon {
  width: 14px;
  height: 14px;
}

.resolved-svg-icon {
  width: 14px;
  height: 14px;
}

.empty-svg-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  color: black;
}

.quick-svg-icon {
  width: 18px;
  height: 18px;
  color: #F97316;
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

.header-actions {
  display: flex;
  gap: 0.75rem;
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

.refresh-btn, .check-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover, .check-btn:hover {
  background: rgba(110, 139, 144, 0.2);
  transform: translateY(-1px);
}

.refresh-btn.refreshing, .check-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Stats Grid - Mobile Responsive */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
  cursor: pointer;
}

.stat-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
}

.stat-card.critical .stat-icon {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.stat-card.resolved .stat-icon {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.stat-card.total .stat-icon {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1A2A2E;
  line-height: 1.2;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.8rem;
  color: black;
  margin-bottom: 0.25rem;
}

.stat-trend {
  font-size: 0.65rem;
  padding: 0.15rem 0.4rem;
  border-radius: 20px;
  display: inline-block;
}

.stat-trend.critical {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.stat-trend.resolved {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.stat-trend.total {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

/* Low Stock Summary */
.low-stock-summary {
  margin-bottom: 1.5rem;
  padding: 1.25rem;
}

.summary-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.summary-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.summary-badge {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 0.75rem;
}

.summary-item {
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
  border-left: 3px solid #F97316;
}

.summary-item.out-of-stock {
  border-left-color: #EF4444;
  background: rgba(239, 68, 68, 0.05);
}

.summary-item-info {
  flex: 1;
}

.summary-item-name {
  font-weight: 600;
  color: #1A2A2E;
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
}

.summary-item-sku {
  font-size: 0.65rem;
  color: black;
  font-family: monospace;
}

.summary-item-branch {
  font-size: 0.65rem;
  color: #2FB8A6;
  margin-top: 0.2rem;
}

.summary-item-stats {
  min-width: 120px;
}

.stock-status {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
  margin-bottom: 0.25rem;
}

.stock-label {
  color: black;
}

.stock-value {
  font-weight: 600;
  color: #1A2A2E;
}

.stock-value.critical {
  color: #EF4444;
}

.stock-value.warning {
  color: #F97316;
}

.stock-progress {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.summary-item.out-of-stock .progress-bar {
  background: linear-gradient(90deg, #EF4444, #F87171);
}

/* Tabs */
.tabs-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.2rem;
  background: none;
  border: none;
  color: black;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  font-size: 0.85rem;
}

.tab-btn:hover {
  color: #2FB8A6;
}

.tab-btn.active {
  color: #2FB8A6;
}

.tab-btn.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
  border-radius: 2px;
}

.badge-count {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
  padding: 0.15rem 0.4rem;
  border-radius: 20px;
  font-size: 0.65rem;
  font-weight: 600;
}

/* Alerts Table */
.alerts-table-container {
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.table-count {
  font-size: 0.75rem;
  color: black;
  background: rgba(110, 139, 144, 0.1);
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
}

.alerts-table {
  width: 100%;
  border-collapse: collapse;
}

.alerts-table th {
  text-align: left;
  padding: 0.75rem 1rem;
  background: rgba(47, 184, 166, 0.05);
  color: black;
  font-weight: 600;
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.alert-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
}

.alert-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.alert-row.critical-row {
  background: rgba(239, 68, 68, 0.02);
}

.alert-row td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.branch-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: black;
  font-size: 0.8rem;
}

.product-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.product-icon {
  width: 28px;
  height: 28px;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
  flex-shrink: 0;
}

.product-name {
  font-weight: 500;
  color: #1A2A2E;
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
}

.product-sku {
  font-size: 0.65rem;
  color: black;
}

.message-cell {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: black;
  font-size: 0.8rem;
}

.alert-icon {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-icon.critical {
  background: rgba(239, 68, 68, 0.1);
  color: #EF4444;
}

.alert-icon.warning {
  background: rgba(249, 115, 22, 0.1);
  color: #F97316;
}

.date-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: black;
  font-size: 0.75rem;
}

.actions-cell {
  text-align: right;
}

.resolve-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 0.7rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resolve-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(47, 184, 166, 0.2);
}

.resolved-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 0.8rem;
  background: rgba(52, 211, 153, 0.1);
  border-radius: 8px;
  color: #34D399;
  font-size: 0.7rem;
  font-weight: 500;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 2rem !important;
}

.empty-content {
  text-align: center;
}

.empty-content h4 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.3rem;
}

.empty-content p {
  color: black;
  font-size: 0.8rem;
}

/* Quick Actions */
.quick-actions {
  margin-top: 1rem;
  padding: 0.8rem 1.25rem;
}

.quick-actions-content {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  flex-wrap: wrap;
  justify-content: space-between;
}

.quick-actions-content span {
  flex: 1;
  color: black;
  font-size: 0.8rem;
}

.resolve-all-btn {
  padding: 0.4rem 0.8rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-radius: 8px;
  color: #EF4444;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.resolve-all-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: translateY(-1px);
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 0.8s linear infinite;
}

.text-right {
  text-align: right;
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .stat-card {
    padding: 1rem;
  }
  
  .stat-icon {
    width: 44px;
    height: 44px;
  }
  
  .stat-svg-icon {
    width: 20px;
    height: 20px;
  }
  
  .stat-value {
    font-size: 1.5rem;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
  }
  
  .refresh-btn, .check-btn {
    flex: 1;
    justify-content: center;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
  }
  
  .summary-item {
    flex-direction: column;
    text-align: center;
  }
  
  .summary-item-stats {
    width: 100%;
  }
  
  .alerts-table,
  .alerts-table thead,
  .alerts-table tbody,
  .alerts-table tr,
  .alerts-table td {
    display: block;
  }
  
  .alerts-table thead {
    display: none;
  }
  
  .alerts-table tr {
    margin-bottom: 0.75rem;
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    background: white;
  }
  
  .alerts-table td {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.6rem 1rem;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  
  .alerts-table td:last-child {
    border-bottom: none;
  }
  
  .alerts-table td::before {
    content: attr(data-label);
    font-weight: 600;
    font-size: 0.7rem;
    color: black;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .actions-cell {
    text-align: left;
  }
  
  .quick-actions-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .resolve-all-btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .tab-btn {
    padding: 0.5rem 0.8rem;
    font-size: 0.75rem;
  }
  
  .tab-svg-icon {
    width: 12px;
    height: 12px;
  }
  
  .table-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .resolve-btn {
    width: 100%;
    justify-content: center;
  }
  
  .resolved-badge {
    width: 100%;
    justify-content: center;
  }
}
</style>