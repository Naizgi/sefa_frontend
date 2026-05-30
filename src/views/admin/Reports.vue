<template>
  <div class="reports-container">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-icon-wrapper">
          <svg class="header-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <div>
          <h1 class="page-title">{{ $t('reports.salesTitle') }}</h1>
          <p class="page-subtitle">{{ $t('reports.salesSubtitle') }}</p>
        </div>
      </div>
    </div>

    <!-- Report Controls -->
    <div class="controls-card glass-card">
      <div class="controls-header">
        <div class="controls-icon"><svg class="controls-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
        <h3 class="controls-title">{{ $t('reports.reportConfig') }}</h3>
      </div>
      <div class="controls-grid">
        <div class="control-group">
          <label class="control-label"><svg class="label-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {{ $t('reports.reportPeriod') }}</label>
          <div class="period-buttons">
            <button @click="reportType = 'weekly'" class="period-btn" :class="{ active: reportType === 'weekly' }"><svg class="period-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg><span>{{ $t('reports.weekly') }}</span></button>
            <button @click="reportType = 'monthly'" class="period-btn" :class="{ active: reportType === 'monthly' }"><svg class="period-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg><span>{{ $t('reports.monthly') }}</span></button>
          </div>
        </div>
        <div class="control-group">
          <label class="control-label"><svg class="label-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> {{ $t('reports.branchFilter') }}</label>
          <div class="branch-select-wrapper"><svg class="select-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg><select v-model="selectedBranch" class="branch-select"><option :value="null">{{ $t('products.allBranches') }}</option><option v-for="branch in branches" :key="branch.id" :value="branch.id">{{ branch.name }}</option></select></div>
        </div>
        <div class="control-group generate-group">
          <button @click="generateReport" :disabled="loading" class="generate-btn">
            <span v-if="loading" class="spinner-small"></span>
            <svg v-else class="generate-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {{ loading ? $t('reports.generating') : $t('reports.generateReport') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state glass-card"><div class="spinner"></div><p>{{ $t('reports.generating') }}</p></div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state glass-card">
      <svg class="error-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      <h3>{{ $t('reports.failedToGenerate') }}</h3><p>{{ error }}</p>
      <button @click="generateReport" class="btn-primary">{{ $t('common.tryAgain') }}</button>
    </div>

    <!-- Report Results -->
    <div v-else-if="report" class="report-results">
      <div class="summary-grid">
        <div class="summary-card"><div class="summary-icon-wrapper"><svg class="summary-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div><div class="summary-info"><p class="summary-label">{{ $t('reports.totalSales') }}</p><p class="summary-value">{{ report.summary.total_sales?.toLocaleString() || 0 }}</p><p class="summary-trend"><span class="trend-up">📈</span> {{ $t('common.transactions') }}</p></div></div>
        <div class="summary-card"><div class="summary-icon-wrapper revenue"><svg class="summary-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div class="summary-info"><p class="summary-label">{{ $t('reports.totalRevenue') }}</p><p class="summary-value">{{ formatCurrency(report.summary.total_revenue) }}</p></div></div>
        <div class="summary-card"><div class="summary-icon-wrapper average"><svg class="summary-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div><div class="summary-info"><p class="summary-label">{{ $t('reports.averageSale') }}</p><p class="summary-value">{{ formatCurrency(report.summary.average_sale_value) }}</p></div></div>
        <div class="summary-card"><div class="summary-icon-wrapper profit"><svg class="summary-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div><div class="summary-info"><p class="summary-label">{{ $t('reports.totalProfit') }}</p><p class="summary-value">{{ formatCurrency(report.summary.total_profit) }}</p></div></div>
      </div>

      <!-- Best Selling Products -->
      <div class="products-card glass-card">
        <div class="products-header"><div class="products-title"><div class="title-icon best"><svg class="title-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg></div><h3>{{ $t('reports.bestSelling') }}</h3></div><div class="products-badge"><svg class="badge-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{{ report.best_selling_products?.length || 0 }} {{ $t('reports.products') }}</span></div></div>
        <div class="products-list">
          <div v-if="!report.best_selling_products?.length" class="no-data">{{ $t('reports.noBestSelling') }}</div>
          <div v-for="(product, index) in report.best_selling_products" :key="product.product_id" class="product-item best">
            <div class="product-rank" :class="getRankClass(index)">{{ getRankIcon(index) }}</div>
            <div class="product-info"><p class="product-name">{{ product.product_name }}</p><p class="product-sku">{{ product.product_sku }}</p></div>
            <div class="product-stats"><div class="product-sales"><svg class="product-sales-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> {{ product.quantity_sold.toLocaleString() }} {{ $t('common.units') }}</div><div class="product-revenue">{{ formatCurrency(product.revenue) }}</div></div>
            <div class="product-progress-bar"><div class="progress-fill" :style="{ width: (product.quantity_sold / report.best_selling_products[0].quantity_sold * 100) + '%' }"></div></div>
          </div>
        </div>
      </div>

      <!-- Slow Moving Products -->
      <div class="products-card glass-card">
        <div class="products-header"><div class="products-title"><div class="title-icon slow"><svg class="title-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg></div><h3>{{ $t('reports.slowMoving') }}</h3></div><div class="products-badge slow-badge"><svg class="badge-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg><span>{{ report.slow_moving_products?.length || 0 }} {{ $t('reports.products') }}</span></div></div>
        <div class="products-list">
          <div v-if="!report.slow_moving_products?.length" class="no-data">{{ $t('reports.noSlowMoving') }}</div>
          <div v-for="(product, index) in report.slow_moving_products" :key="product.product_id" class="product-item slow">
            <div class="product-rank slow-rank">{{ index + 1 }}</div>
            <div class="product-info"><p class="product-name">{{ product.product_name }}</p><p class="product-sku">{{ product.product_sku }}</p></div>
            <div class="product-stats"><div class="product-sales"><svg class="product-sales-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg> {{ product.quantity_sold.toLocaleString() }} {{ $t('common.units') }}</div><div class="product-revenue">{{ formatCurrency(product.revenue) }}</div></div>
            <div class="product-progress-bar slow"><div class="progress-fill" :style="{ width: (product.quantity_sold / (report.best_selling_products[0]?.quantity_sold || 1) * 100) + '%' }"></div></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state glass-card">
      <div class="empty-icon-wrapper"><svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
      <h3>{{ $t('reports.noReportGenerated') }}</h3>
      <p>{{ $t('reports.selectAndGenerate') }}</p>
      <div class="quick-actions">
        <button @click="generateQuickReport('weekly')" class="quick-btn"><svg class="quick-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> {{ $t('reports.weekly') }}</button>
        <button @click="generateQuickReport('monthly')" class="quick-btn"><svg class="quick-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg> {{ $t('reports.monthly') }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatCurrency } from '@/utils/format'

const { t } = useI18n()
const branches = ref([])
const selectedBranch = ref(null)
const reportType = ref('weekly')
const loading = ref(false)
const error = ref(null)
const report = ref(null)

const getRankClass = (i) => { if (i === 0) return 'gold-rank'; if (i === 1) return 'silver-rank'; if (i === 2) return 'bronze-rank'; return '' }
const getRankIcon = (i) => { if (i === 0) return '🥇'; if (i === 1) return '🥈'; if (i === 2) return '🥉'; return i + 1 }

const fetchBranches = async () => { try { branches.value = (await api.get('/branches')).data || [] } catch (e) {} }

const generateReport = async () => {
  loading.value = true; error.value = null
  try {
    const params = { report_type: reportType.value }; if (selectedBranch.value) params.branch_id = selectedBranch.value
    report.value = (await api.get('/reports/sales', { params })).data
  } catch (err) { error.value = err.response?.data?.detail || t('reports.generateFailed'); report.value = null }
  finally { loading.value = false }
}

const generateQuickReport = (type) => { reportType.value = type; generateReport() }
onMounted(() => { fetchBranches() })
</script>

<style scoped>
/* Add error state styles */
.error-state {
  text-align: center;
  padding: 60px 20px;
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

.no-data {
  text-align: center;
  padding: 40px;
  color: #6E8B90;
  font-size: 0.9rem;
}


.reports-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.header-svg-icon {
  width: 32px;
  height: 32px;
  color: #2FB8A6;
}

.controls-svg-icon {
  width: 24px;
  height: 24px;
  color: #2FB8A6;
}

.label-svg-icon {
  width: 16px;
  height: 16px;
  color: #2FB8A6;
}

.period-svg-icon {
  width: 16px;
  height: 16px;
}

.select-svg-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: #2FB8A6;
  pointer-events: none;
}

.generate-svg-icon {
  width: 18px;
  height: 18px;
}

.summary-svg-icon {
  width: 28px;
  height: 28px;
  color: #2FB8A6;
}

.summary-icon-wrapper.revenue .summary-svg-icon {
  color: #10B981;
}

.summary-icon-wrapper.average .summary-svg-icon {
  color: #3B82F6;
}

.summary-icon-wrapper.profit .summary-svg-icon {
  color: #8B5CF6;
}

.title-svg-icon {
  width: 20px;
  height: 20px;
}

.badge-svg-icon {
  width: 12px;
  height: 12px;
}

.product-sales-svg {
  width: 14px;
  height: 14px;
}

.empty-svg-icon {
  width: 50px;
  height: 50px;
  color: #2FB8A6;
}

.quick-svg-icon {
  width: 16px;
  height: 16px;
}

/* Header Section */
.header-section {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.15), rgba(111, 211, 195, 0.15));
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
}

.page-title {
  font-size: clamp(1.5rem, 5vw, 1.8rem);
  font-weight: 700;
  background: linear-gradient(135deg, #1A2A2E, #2FB8A6);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #6E8B90;
  font-size: clamp(0.8rem, 4vw, 0.9rem);
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.75);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

/* Controls Card */
.controls-card {
  padding: clamp(1rem, 4vw, 1.5rem);
  margin-bottom: 2rem;
}

.controls-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.controls-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.15), rgba(111, 211, 195, 0.15));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.controls-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  align-items: flex-end;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.control-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1A2A2E;
}

.period-buttons {
  display: flex;
  gap: 0.5rem;
}

.period-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: #6E8B90;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.period-btn span {
  font-size: 0.9rem;
}

.period-btn.active {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border-color: transparent;
  color: white;
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
  transform: translateY(-2px);
}

.period-btn:hover:not(.active) {
  background: rgba(110, 139, 144, 0.2);
  transform: translateY(-1px);
}

.branch-select-wrapper {
  position: relative;
}

.branch-select {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
  color: #1A2A2E;
  cursor: pointer;
  transition: all 0.3s ease;
}

.branch-select:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.generate-group {
  display: flex;
  justify-content: flex-end;
}

.generate-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  justify-content: center;
}

.generate-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.4);
}

.generate-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner-small {
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

/* Summary Grid */
.summary-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.summary-card {
  background: rgba(255, 255, 255, 0.75);
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

.summary-card:hover {
  transform: translateY(-4px);
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.summary-icon-wrapper {
  width: 56px;
  height: 56px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.15), rgba(111, 211, 195, 0.15));
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.summary-icon-wrapper.revenue {
  background: linear-gradient(135deg, rgba(52, 211, 153, 0.15), rgba(16, 185, 129, 0.15));
}

.summary-icon-wrapper.average {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(96, 165, 250, 0.15));
}

.summary-icon-wrapper.profit {
  background: linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(167, 139, 250, 0.15));
}

.summary-info {
  flex: 1;
}

.summary-label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6E8B90;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: clamp(1.2rem, 5vw, 1.5rem);
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.summary-trend {
  font-size: 0.7rem;
  color: #6E8B90;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.trend-up {
  color: #10B981;
  font-weight: 600;
}

/* Products Card */
.products-card {
  padding: clamp(1rem, 4vw, 1.5rem);
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;
}

.products-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.products-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid rgba(47, 184, 166, 0.1);
  flex-wrap: wrap;
  gap: 0.5rem;
}

.products-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.title-icon {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.15), rgba(111, 211, 195, 0.15));
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-icon.slow {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.15), rgba(253, 186, 116, 0.15));
}

.products-title h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.products-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: #2FB8A6;
  background: rgba(47, 184, 166, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.products-badge.slow-badge {
  color: #F97316;
  background: rgba(249, 115, 22, 0.1);
}

.products-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 14px;
  transition: all 0.3s ease;
  flex-wrap: wrap;
}

.product-item:hover {
  background: rgba(47, 184, 166, 0.08);
  transform: translateX(5px);
}

.product-rank {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.2rem;
  flex-shrink: 0;
}

.product-rank.gold-rank {
  background: linear-gradient(135deg, #F59E0B, #FBBF24);
}

.product-rank.silver-rank {
  background: linear-gradient(135deg, #9CA3AF, #D1D5DB);
}

.product-rank.bronze-rank {
  background: linear-gradient(135deg, #B45309, #D97706);
}

.product-rank.slow-rank {
  background: linear-gradient(135deg, #F97316, #FDBA74);
}

.product-info {
  flex: 1;
  min-width: 120px;
}

.product-name {
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
  font-size: 0.9rem;
}

.product-sku {
  font-size: 0.7rem;
  color: #6E8B90;
}

.product-stats {
  text-align: right;
  min-width: 120px;
}

.product-sales {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.product-revenue {
  font-size: 0.75rem;
  color: #10B981;
  font-weight: 600;
}

.product-item.slow .product-revenue {
  color: #F97316;
}

.product-progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.product-progress-bar.slow .progress-fill {
  background: linear-gradient(90deg, #F97316, #FDBA74);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: clamp(2rem, 8vw, 3rem);
}

.empty-icon-wrapper {
  width: 100px;
  height: 100px;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.1), rgba(111, 211, 195, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-state h3 {
  font-size: clamp(1rem, 5vw, 1.2rem);
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6E8B90;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
}

.quick-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.quick-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(47, 184, 166, 0.1);
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  color: #2FB8A6;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.quick-btn:hover {
  background: rgba(47, 184, 166, 0.2);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.2);
}

/* Animations */
@keyframes fadeIn {
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

/* Responsive Design */
@media (max-width: 768px) {
  .controls-grid {
    grid-template-columns: 1fr;
  }
  
  .generate-group {
    justify-content: stretch;
  }
  
  .generate-btn {
    justify-content: center;
  }
  
  .summary-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
  
  .product-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .product-stats {
    width: 100%;
    text-align: left;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .product-sales {
    justify-content: flex-start;
  }
  
  .products-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-content {
    flex-direction: column;
    text-align: center;
  }
  
  .header-icon-wrapper {
    width: 48px;
    height: 48px;
  }
  
  .header-svg-icon {
    width: 24px;
    height: 24px;
  }
}

@media (max-width: 480px) {
  .reports-container {
    padding: 0.75rem;
  }
  
  .period-buttons {
    flex-direction: column;
  }
  
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-btn {
    justify-content: center;
  }
  
  .summary-card {
    padding: 1rem;
  }
  
  .summary-icon-wrapper {
    width: 48px;
    height: 48px;
  }
  
  .summary-svg-icon {
    width: 24px;
    height: 24px;
  }
  
  .title-icon {
    width: 28px;
    height: 28px;
  }
  
  .title-svg-icon {
    width: 16px;
    height: 16px;
  }
}

/* Touch-friendly improvements */
@media (hover: none) {
  .period-btn,
  .generate-btn,
  .quick-btn,
  .summary-card,
  .product-item {
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
  }
  
  .period-btn:active,
  .generate-btn:active,
  .quick-btn:active {
    transform: scale(0.98);
  }
}
</style>