<template>
  <div class="reports-container">
    <!-- Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('reports.title') }}</h1>
        <p class="page-subtitle">{{ $t('reports.subtitle') }}</p>
      </div>
      <div class="header-actions">
        <button @click="exportToPDF" class="btn-pdf" :disabled="loading">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 10h10M7 14h10M7 18h6" />
          </svg>
          <span>{{ $t('reports.exportPdf') }}</span>
        </button>
        <button @click="refreshData" class="btn-primary" :disabled="loading">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{{ $t('reports.refresh') }}</span>
        </button>
      </div>
    </div>

    <!-- Date Range Selector -->
    <div class="date-range-card glass-card">
      <div class="date-range-content">
        <div class="range-options">
          <button v-for="option in dateRangeOptions" :key="option.value" @click="setDateRange(option.value)" class="range-btn" :class="{ active: activeRange === option.value }">
            {{ $t(option.labelKey) }}
          </button>
        </div>
        <div class="custom-range">
          <div class="date-input">
            <label>{{ $t('reports.fromDate') }}</label>
            <input type="date" v-model="customFromDate" class="form-input" />
          </div>
          <div class="date-input">
            <label>{{ $t('reports.toDate') }}</label>
            <input type="date" v-model="customToDate" class="form-input" />
          </div>
          <button @click="applyCustomRange" class="apply-btn" :disabled="loading">{{ $t('reports.apply') }}</button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state glass-card">
      <div class="spinner"></div>
      <p>{{ $t('reports.loadingReports') }}</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state glass-card">
      <svg class="error-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3>{{ $t('reports.failedToLoad') }}</h3>
      <p>{{ error }}</p>
      <button @click="refreshData" class="btn-primary">{{ $t('common.tryAgain') }}</button>
    </div>

    <!-- Report Content -->
    <div v-else class="report-content">
      <!-- Financial Summary Cards -->
      <div class="summary-section">
        <h2>{{ $t('reports.financialSummary') }}</h2>
        <div class="summary-grid">
          <div class="summary-card revenue">
            <div class="card-icon">💰</div>
            <div class="card-details">
              <p class="card-label">{{ $t('reports.totalRevenue') }}</p>
              <p class="card-value">{{ formatCurrency(totalRevenue) }}</p>
            </div>
          </div>
          <div class="summary-card sales">
            <div class="card-icon">🛒</div>
            <div class="card-details">
              <p class="card-label">{{ $t('reports.totalSales') }}</p>
              <p class="card-value">{{ filteredSalesData.length }}</p>
              <p class="card-sub">{{ $t('common.transactions') }}</p>
            </div>
          </div>
          <div class="summary-card loans">
            <div class="card-icon">🏦</div>
            <div class="card-details">
              <p class="card-label">{{ $t('reports.activeLoans') }}</p>
              <p class="card-value">{{ activeLoansCount }}</p>
            </div>
          </div>
          <div class="summary-card profit">
            <div class="card-icon">📈</div>
            <div class="card-details">
              <p class="card-label">{{ $t('reports.totalProfit') }}</p>
              <p class="card-value">{{ formatCurrency(totalProfit) }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs -->
      <div class="tabs-container">
        <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" class="tab-btn" :class="{ active: activeTab === tab.id }">
          <svg class="tab-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="tab.id === 'sales'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            <path v-if="tab.id === 'loans'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm0 0v4" />
            <path v-if="tab.id === 'revenue'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path v-if="tab.id === 'products'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            <path v-if="tab.id === 'stock'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          {{ $t(tab.nameKey) }}
          <span v-if="tabCounts[tab.id]" class="tab-count">{{ tabCounts[tab.id] }}</span>
        </button>
      </div>

      <!-- Sales Tab -->
      <div v-if="activeTab === 'sales'" class="tab-content glass-card">
        <div class="tab-header">
          <h3>{{ $t('reports.salesTransactions') }}</h3>
          <span class="record-count">{{ filteredSalesData.length }} {{ $t('common.records') }}</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ $t('common.date') }}</th>
                <th>{{ $t('sales.invoice') }}</th>
                <th>{{ $t('sales.customer') }}</th>
                <th>{{ $t('sales.items') }}</th>
                <th>{{ $t('sales.subtotal') }}</th>
                <th>{{ $t('sales.taxRate') }}</th>
                <th>{{ $t('sales.taxAmount') }}</th>
                <th>{{ $t('sales.total') }}</th>
                <th>{{ $t('sales.paymentMethod') }}</th>
                <th>{{ $t('sales.accountNumber') }}</th>
                <th>{{ $t('common.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="sale in filteredSalesData" :key="sale.id" @click="viewSaleDetails(sale)" class="clickable-row">
                <td>{{ formatDate(sale.sale_date || sale.created_at) }}</td>
                <td>{{ sale.invoice_number || sale.id }}</td>
                <td>{{ sale.customer_name || $t('sales.walkInCustomer') }}</td>
                <td>
                  <div class="items-preview">
                    <span v-for="(item, idx) in sale.items?.slice(0, 2)" :key="idx" class="item-tag">{{ item.product_name }} x{{ item.quantity }}</span>
                    <span v-if="sale.items?.length > 2" class="more-items">+{{ sale.items.length - 2 }} {{ $t('sales.more') }}</span>
                  </div>
                </td>
                <td class="amount">{{ formatCurrency(sale.subtotal || 0) }}</td>
                <td class="tax-rate">{{ sale.tax_rate || 0 }}%</td>
                <td class="tax">{{ formatCurrency(sale.tax_amount || 0) }}</td>
                <td class="amount">{{ formatCurrency(sale.total_amount) }}</td>
                <td><span class="payment-badge" :class="sale.payment_method">{{ formatPaymentMethod(sale.payment_method) }}</span></td>
                <td><span class="account-number">{{ getAccountNumber(sale) }}</span></td>
                <td><span :class="getSaleStatusClass(sale.status)" class="status-badge">{{ sale.status || $t('sales.completed') }}</span></td>
              </tr>
              <tr v-if="filteredSalesData.length === 0"><td colspan="11" class="empty-table">{{ $t('sales.noSalesData') }}</td></tr>
            </tbody>
          </table>
        </div>
        
        <div class="stock-entries-section" v-if="stockEntries.length > 0">
          <div class="tab-header">
            <h3>{{ $t('reports.stockEntries') }}</h3>
            <span class="record-count">{{ stockEntries.length }} {{ $t('common.records') }}</span>
          </div>
          <div class="table-container">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ $t('common.date') }}</th>
                  <th>{{ $t('sales.product') }}</th>
                  <th>{{ $t('products.sku') }}</th>
                  <th>{{ $t('reports.quantityIn') }}</th>
                  <th>{{ $t('reports.unitCost') }}</th>
                  <th>{{ $t('reports.totalValue') }}</th>
                  <th>{{ $t('reports.reference') }}</th>
                  <th>{{ $t('common.notes') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in stockEntries" :key="entry.id">
                  <td>{{ formatDate(entry.date || entry.created_at) }}</td>
                  <td>{{ entry.product_name }}</td>
                  <td>{{ entry.sku }}</td>
                  <td class="amount">{{ entry.quantity_in || entry.quantity || 0 }}</td>
                  <td class="amount">{{ formatCurrency(entry.unit_cost || entry.cost_price || 0) }}</td>
                  <td class="amount">{{ formatCurrency((entry.quantity_in || entry.quantity || 0) * (entry.unit_cost || entry.cost_price || 0)) }}</td>
                  <td>{{ entry.reference || '-' }}</td>
                  <td>{{ entry.notes || '-' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Loans Tab -->
      <div v-if="activeTab === 'loans'" class="tab-content glass-card">
        <div class="tab-header">
          <h3>{{ $t('reports.loans') }}</h3>
          <span class="record-count">{{ loanData.length }} {{ $t('common.records') }}</span>
        </div>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>{{ $t('common.date') }}</th>
                <th>{{ $t('loans.loanNumber') }}</th>
                <th>{{ $t('loans.customer') }}</th>
                <th>{{ $t('common.total') }}</th>
                <th>{{ $t('loans.paid') }}</th>
                <th>{{ $t('loans.balance') }}</th>
                <th>{{ $t('common.status') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="loan in loanData" :key="loan.id">
                <td>{{ formatDate(loan.loan_date) }}</td>
                <td>{{ loan.loan_number }}</td>
                <td>{{ loan.customer_name }}</td>
                <td class="amount">{{ formatCurrency(loan.total_amount) }}</td>
                <td class="paid">{{ formatCurrency(loan.paid_amount) }}</td>
                <td class="balance">{{ formatCurrency(loan.remaining_amount) }}</td>
                <td><span :class="getLoanStatusClass(loan.status)" class="status-badge">{{ getLoanStatusText(loan.status) }}</span></td>
              </tr>
              <tr v-if="loanData.length === 0"><td colspan="7" class="empty-table">{{ $t('reports.noLoans') }}</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Revenue Chart & Profit Report Tab -->
      <div v-if="activeTab === 'revenue'" class="tab-content glass-card">
        <div class="tab-header">
          <h3>{{ $t('reports.dailyRevenueChart') }}</h3>
          <span class="record-count">{{ chartData.length }} {{ $t('common.days') }}</span>
        </div>
        <div class="chart-wrapper"><canvas ref="revenueChartCanvas" id="revenueChart"></canvas></div>
        <div class="chart-stats">
          <div class="stat-item"><span class="stat-label">{{ $t('reports.totalRevenue') }}:</span><span class="stat-value">{{ formatCurrency(chartTotalRevenue) }}</span></div>
          <div class="stat-item"><span class="stat-label">{{ $t('reports.averageDaily') }}:</span><span class="stat-value">{{ formatCurrency(chartAverageDaily) }}</span></div>
          <div class="stat-item"><span class="stat-label">{{ $t('reports.highestDay') }}:</span><span class="stat-value">{{ formatCurrency(chartHighestRevenue) }}</span></div>
        </div>
        
        <div class="profit-report-section">
          <div class="tab-header"><h3>{{ $t('reports.profitAnalysis') }}</h3></div>
          <div class="profit-summary-grid">
            <div class="profit-card"><p class="profit-label">{{ $t('reports.totalRevenue') }}</p><p class="profit-value revenue-value">{{ formatCurrency(totalProfitReport.revenue) }}</p></div>
            <div class="profit-card"><p class="profit-label">{{ $t('reports.totalCost') }}</p><p class="profit-value cost-value">{{ formatCurrency(totalProfitReport.cost) }}</p></div>
            <div class="profit-card"><p class="profit-label">{{ $t('reports.grossProfit') }}</p><p class="profit-value profit-positive">{{ formatCurrency(totalProfitReport.grossProfit) }}</p></div>
            <div class="profit-card"><p class="profit-label">{{ $t('reports.profitMargin') }}</p><p class="profit-value margin-value">{{ totalProfitReport.margin }}%</p></div>
          </div>
          <div class="profit-table-container" v-if="profitReportData.length > 0">
            <h4>{{ $t('reports.profitByProduct') }}</h4>
            <table class="data-table">
              <thead><tr><th>{{ $t('sales.product') }}</th><th>{{ $t('products.sku') }}</th><th>{{ $t('reports.quantitySold') }}</th><th>{{ $t('reports.revenue') }}</th><th>{{ $t('reports.cost') }}</th><th>{{ $t('reports.profit') }}</th><th>{{ $t('reports.margin') }} %</th></tr></thead>
              <tbody><tr v-for="item in profitReportData" :key="item.id || item.sku"><td>{{ item.name || item.product_name }}</td><td>{{ item.sku }}</td><td>{{ item.quantity_sold || item.quantity || 0 }}</td><td class="amount">{{ formatCurrency(item.revenue || 0) }}</td><td class="amount">{{ formatCurrency(item.cost || item.total_cost || 0) }}</td><td class="amount" :class="(item.profit || 0) >= 0 ? 'profit-positive' : 'profit-negative'">{{ formatCurrency(item.profit || 0) }}</td><td :class="(item.margin || 0) >= 0 ? 'profit-positive' : 'profit-negative'">{{ (item.margin || 0).toFixed(1) }}%</td></tr></tbody>
            </table>
          </div>
          <div v-else class="no-data">{{ $t('reports.noData') }}</div>
        </div>
        <div v-if="chartData.length === 0" class="no-data">{{ $t('reports.noRevenue') }}</div>
      </div>

      <!-- Top Products Tab -->
      <div v-if="activeTab === 'products'" class="tab-content glass-card">
        <div class="tab-header"><h3>{{ $t('reports.topProducts') }}</h3><span class="record-count">{{ topProducts.length }} {{ $t('reports.products') }}</span></div>
        <div class="top-products-list">
          <div v-if="topProducts.length === 0" class="no-data">{{ $t('reports.noProducts') }}</div>
          <div v-else v-for="(product, index) in topProducts" :key="product.id" class="product-rank">
            <div class="rank">{{ index + 1 }}</div>
            <div class="product-info"><span class="product-name">{{ product.name }}</span><div class="product-bar"><div class="fill" :style="{ width: (product.quantity / topProducts[0]?.quantity * 100) + '%' }"></div></div></div>
            <div class="product-qty">{{ product.quantity }} {{ $t('reports.sold') }}</div>
            <div class="product-revenue">{{ formatCurrency(product.revenue || 0) }}</div>
          </div>
        </div>
      </div>

      <!-- Monthly Stock Report Tab -->
      <div v-if="activeTab === 'stock'" class="tab-content glass-card">
        <div class="tab-header"><h3>{{ $t('reports.monthlyStockReport') }}</h3><span class="record-count">{{ monthlyStockReport.length }} {{ $t('common.records') }}</span></div>
        <div v-if="monthlyStockReport.length === 0" class="no-data">{{ $t('reports.noStockData') }}</div>
        <div v-else class="table-container">
          <table class="data-table">
            <thead><tr><th>{{ $t('reports.month') }}</th><th>{{ $t('sales.product') }}</th><th>{{ $t('products.sku') }}</th><th>{{ $t('reports.openingStock') }}</th><th>{{ $t('reports.stockIn') }}</th><th>{{ $t('reports.stockOut') }}</th><th>{{ $t('reports.closingStock') }}</th><th>{{ $t('reports.openingValue') }}</th><th>{{ $t('reports.closingValue') }}</th><th>{{ $t('reports.unitCost') }}</th></tr></thead>
            <tbody><tr v-for="(record, index) in monthlyStockReport" :key="index"><td>{{ record.month }}</td><td>{{ record.product_name }}</td><td>{{ record.sku }}</td><td class="amount">{{ record.opening_stock || 0 }} {{ $t('common.units') }}</td><td class="amount stock-in">{{ record.stock_in || 0 }} {{ $t('common.units') }}</td><td class="amount stock-out">{{ record.stock_out || 0 }} {{ $t('common.units') }}</td><td class="amount">{{ record.closing_stock || 0 }} {{ $t('common.units') }}</td><td class="amount">{{ formatCurrency(record.opening_value || 0) }}</td><td class="amount">{{ formatCurrency(record.closing_value || 0) }}</td><td class="amount">{{ formatCurrency(record.unit_cost || 0) }}</td></tr></tbody>
            <tfoot><tr class="total-row"><td colspan="3"><strong>{{ $t('common.total') }}</strong></td><td class="amount"><strong>{{ monthlyStockTotals.totalOpeningStock }} {{ $t('common.units') }}</strong></td><td class="amount stock-in"><strong>{{ monthlyStockTotals.totalStockIn }} {{ $t('common.units') }}</strong></td><td class="amount stock-out"><strong>{{ monthlyStockTotals.totalStockOut }} {{ $t('common.units') }}</strong></td><td class="amount"><strong>{{ monthlyStockTotals.totalClosingStock }} {{ $t('common.units') }}</strong></td><td class="amount"><strong>{{ formatCurrency(monthlyStockTotals.totalOpeningValue) }}</strong></td><td class="amount"><strong>{{ formatCurrency(monthlyStockTotals.totalClosingValue) }}</strong></td><td></td></tr></tfoot>
          </table>
        </div>
      </div>
    </div>

    <!-- Sale Details Modal -->
    <div v-if="showSaleModal" class="modal-overlay" @click.self="showSaleModal = false">
      <div class="modal modal-large">
        <div class="modal-header"><h2>{{ $t('sales.saleDetails') }}</h2><button @click="showSaleModal = false" class="close-btn">&times;</button></div>
        <div class="modal-body">
          <div class="sale-info">
            <p><strong>{{ $t('sales.invoice') }}:</strong> {{ selectedSale?.invoice_number || selectedSale?.id }}</p>
            <p><strong>{{ $t('common.date') }}:</strong> {{ formatDate(selectedSale?.sale_date || selectedSale?.created_at) }}</p>
            <p><strong>{{ $t('sales.customer') }}:</strong> {{ selectedSale?.customer_name || $t('sales.walkInCustomer') }}</p>
            <p><strong>{{ $t('sales.paymentMethod') }}:</strong> {{ formatPaymentMethod(selectedSale?.payment_method) }}</p>
            <p v-if="selectedSale?.bank_account_details?.account_number"><strong>{{ $t('sales.accountNumber') }}:</strong> {{ selectedSale?.bank_account_details?.account_number }}</p>
            <p><strong>{{ $t('common.status') }}:</strong> <span :class="getSaleStatusClass(selectedSale?.status)">{{ selectedSale?.status || $t('sales.completed') }}</span></p>
          </div>
          <h3>{{ $t('sales.itemsSold') }}</h3>
          <table class="items-table">
            <thead><tr><th>{{ $t('sales.product') }}</th><th>{{ $t('sales.quantity') }}</th><th>{{ $t('sales.unitPrice') }}</th><th>{{ $t('common.total') }}</th></tr></thead>
            <tbody><tr v-for="item in selectedSale?.items" :key="item.id"><td>{{ item.product_name }}</td><td>{{ item.quantity }}</td><td>{{ formatCurrency(item.unit_price) }}</td><td>{{ formatCurrency(item.line_total || item.quantity * item.unit_price) }}</td></tr></tbody>
            <tfoot>
              <tr class="subtotal-row"><td colspan="3"><strong>{{ $t('sales.subtotal') }}</strong></td><td><strong>{{ formatCurrency(selectedSale?.subtotal || 0) }}</strong></td></tr>
              <tr class="tax-row" v-if="(selectedSale?.tax_rate || 0) > 0"><td colspan="3"><strong>{{ $t('sales.tax') }} ({{ selectedSale?.tax_rate || 0 }}%)</strong></td><td><strong>{{ formatCurrency(selectedSale?.tax_amount || 0) }}</strong></td></tr>
              <tr class="total-row"><td colspan="3"><strong>{{ $t('common.total') }}</strong></td><td><strong>{{ formatCurrency(selectedSale?.total_amount) }}</strong></td></tr>
            </tfoot>
          </table>
        </div>
        <div class="modal-footer"><button @click="showSaleModal = false" class="btn-secondary">{{ $t('common.close') }}</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatCurrency, formatDate } from '@/utils/format'
import html2pdf from 'html2pdf.js'
import Chart from 'chart.js/auto'

const { t } = useI18n()

const loading = ref(false)
const error = ref(null)
const activeTab = ref('sales')
const activeRange = ref('weekly')
const customFromDate = ref('')
const customToDate = ref('')
const showSaleModal = ref(false)
const selectedSale = ref(null)
const revenueChartCanvas = ref(null)
let revenueChart = null

const salesData = ref([])
const loanData = ref([])
const dailyRevenue = ref([])
const topProducts = ref([])
const stockEntries = ref([])
const profitReportData = ref([])
const monthlyStockReport = ref([])

const formatPaymentMethod = (method) => {
  const methods = { cash: t('pos.cash'), transfer: t('pos.bankTransfer'), credit_card: t('refund.creditCard'), debit_card: t('refund.debitCard'), mobile_money: 'Mobile Money', coupon: t('loans.coupon'), mixed: t('loans.mixed') }
  return methods[method] || method || t('pos.cash')
}

const getAccountNumber = (sale) => {
  if (sale.payment_method === 'transfer' && sale.bank_account_details) return sale.bank_account_details.account_number || '-'
  return '-'
}

const getDateRangeParams = () => {
  const params = {}; const now = new Date()
  if (activeRange.value === 'today') { const d = now.toISOString().split('T')[0]; params.from_date = d; params.to_date = d }
  else if (activeRange.value === 'yesterday') { const y = new Date(now); y.setDate(now.getDate() - 1); params.from_date = y.toISOString().split('T')[0]; params.to_date = y.toISOString().split('T')[0] }
  else if (activeRange.value === 'weekly') { const s = new Date(now); s.setDate(now.getDate() - 7); params.from_date = s.toISOString().split('T')[0]; params.to_date = now.toISOString().split('T')[0] }
  else if (activeRange.value === 'monthly') { const s = new Date(now.getFullYear(), now.getMonth(), 1); params.from_date = s.toISOString().split('T')[0]; params.to_date = now.toISOString().split('T')[0] }
  else if (activeRange.value === 'last_month') { const s = new Date(now.getFullYear(), now.getMonth() - 1, 1); const e = new Date(now.getFullYear(), now.getMonth(), 0); params.from_date = s.toISOString().split('T')[0]; params.to_date = e.toISOString().split('T')[0] }
  else if (activeRange.value === 'yearly') { const s = new Date(now.getFullYear(), 0, 1); params.from_date = s.toISOString().split('T')[0]; params.to_date = now.toISOString().split('T')[0] }
  else if (activeRange.value === 'custom' && customFromDate.value && customToDate.value) { params.from_date = customFromDate.value; params.to_date = customToDate.value }
  return params
}

const filteredSalesData = computed(() => {
  const params = getDateRangeParams()
  if (!params.from_date && !params.to_date) return salesData.value
  return salesData.value.filter(sale => {
    const sd = new Date(sale.created_at).toISOString().split('T')[0]
    if (params.from_date && params.to_date) return sd >= params.from_date && sd <= params.to_date
    else if (params.from_date) return sd >= params.from_date
    else if (params.to_date) return sd <= params.to_date
    return true
  })
})

const chartData = computed(() => {
  if (!dailyRevenue.value || dailyRevenue.value.length === 0) return []
  return dailyRevenue.value.map(item => ({ date: item.date || item.day || item.sale_date, revenue: parseFloat(item.revenue || item.total_amount || item.total || 0) })).filter(item => item.date && !isNaN(item.revenue))
})

const chartTotalRevenue = computed(() => chartData.value.reduce((s, i) => s + i.revenue, 0))
const chartAverageDaily = computed(() => chartData.value.length === 0 ? 0 : chartTotalRevenue.value / chartData.value.length)
const chartHighestRevenue = computed(() => chartData.value.length === 0 ? 0 : Math.max(...chartData.value.map(i => i.revenue)))

const totalProfitReport = computed(() => {
  const revenue = profitReportData.value.reduce((s, i) => s + (i.revenue || 0), 0)
  const cost = profitReportData.value.reduce((s, i) => s + (i.cost || i.total_cost || 0), 0)
  const gp = revenue - cost; const m = revenue > 0 ? (gp / revenue) * 100 : 0
  return { revenue, cost, grossProfit: gp, margin: m }
})

const totalProfit = computed(() => totalProfitReport.value.grossProfit)

const monthlyStockTotals = computed(() => ({
  totalOpeningStock: monthlyStockReport.value.reduce((s, r) => s + (r.opening_stock || 0), 0),
  totalStockIn: monthlyStockReport.value.reduce((s, r) => s + (r.stock_in || 0), 0),
  totalStockOut: monthlyStockReport.value.reduce((s, r) => s + (r.stock_out || 0), 0),
  totalClosingStock: monthlyStockReport.value.reduce((s, r) => s + (r.closing_stock || 0), 0),
  totalOpeningValue: monthlyStockReport.value.reduce((s, r) => s + (r.opening_value || 0), 0),
  totalClosingValue: monthlyStockReport.value.reduce((s, r) => s + (r.closing_value || 0), 0)
}))

const totalRevenue = computed(() => filteredSalesData.value.reduce((s, sale) => s + (sale.total_amount || 0), 0))
const activeLoansCount = computed(() => loanData.value.filter(l => l.status === 'active' || l.status === 'partially_paid').length)
const averageSaleValue = computed(() => filteredSalesData.value.length === 0 ? 0 : totalRevenue.value / filteredSalesData.value.length)

const tabCounts = ref({ sales: 0, loans: 0, revenue: 0, products: 0, stock: 0 })

const dateRangeOptions = [
  { labelKey: 'reports.today', value: 'today' },
  { labelKey: 'reports.yesterday', value: 'yesterday' },
  { labelKey: 'reports.thisWeek', value: 'weekly' },
  { labelKey: 'reports.thisMonth', value: 'monthly' },
  { labelKey: 'reports.lastMonth', value: 'last_month' },
  { labelKey: 'reports.thisYear', value: 'yearly' }
]

const tabs = [
  { id: 'sales', nameKey: 'reports.salesStock' },
  { id: 'loans', nameKey: 'reports.loansTab' },
  { id: 'revenue', nameKey: 'reports.revenueProfit' },
  { id: 'products', nameKey: 'reports.topProducts' },
  { id: 'stock', nameKey: 'reports.stockReport' }
]

const getSaleStatusClass = (status) => {
  const classes = { completed: 'status-completed', pending: 'status-pending', cancelled: 'status-cancelled', refunded: 'status-refunded', partially_refunded: 'status-partial' }
  return classes[status?.toLowerCase()] || 'status-completed'
}

const getLoanStatusClass = (status) => {
  const classes = { active: 'status-active', partially_paid: 'status-partial', settled: 'status-settled' }
  return classes[status?.toLowerCase()] || 'status-active'
}

const getLoanStatusText = (status) => {
  const texts = { active: t('loans.active'), partially_paid: t('loans.partiallyPaid'), settled: t('loans.settled') }
  return texts[status?.toLowerCase()] || status
}

const formatDay = (date) => new Date(date).toLocaleDateString('en-US', { weekday: 'short' })
const viewSaleDetails = (sale) => { selectedSale.value = sale; showSaleModal.value = true }
const setDateRange = (range) => { activeRange.value = range; fetchAllReports() }
const applyCustomRange = () => { if (customFromDate.value && customToDate.value) { activeRange.value = 'custom'; fetchAllReports() } }

const initChart = async () => {
  await nextTick()
  if (!revenueChartCanvas.value) return
  if (revenueChart) revenueChart.destroy()
  if (chartData.value.length === 0) return
  const ctx = revenueChartCanvas.value.getContext('2d')
  revenueChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: chartData.value.map(item => formatDay(item.date)),
      datasets: [{ label: t('reports.revenue'), data: chartData.value.map(item => item.revenue), backgroundColor: 'rgba(47, 184, 166, 0.6)', borderColor: 'rgba(47, 184, 166, 1)', borderWidth: 1, borderRadius: 4, hoverBackgroundColor: 'rgba(47, 184, 166, 0.8)' }]
    },
    options: {
      responsive: true, maintainAspectRatio: true,
      plugins: { legend: { display: true, position: 'top', labels: { font: { size: 12 } } }, tooltip: { callbacks: { label: function(ctx) { let l = ctx.dataset.label || ''; if (l) l += ': '; l += formatCurrency(ctx.parsed.y); return l } } } },
      scales: { y: { beginAtZero: true, ticks: { callback: function(v) { return formatCurrency(v) } }, title: { display: true, text: t('reports.revenueAxis'), font: { size: 12 } } }, x: { title: { display: true, text: t('common.date'), font: { size: 12 } } } }
    }
  })
}

const getChartImage = async () => {
  if (!revenueChartCanvas.value || chartData.value.length === 0) return null
  try { await new Promise(resolve => setTimeout(resolve, 500)); return revenueChartCanvas.value.toDataURL('image/png') }
  catch (err) { return null }
}

const fetchAllReports = async () => {
  loading.value = true; error.value = null
  try {
    const params = getDateRangeParams()
    const salesParams = { ...params }
    if (salesParams.from_date) salesParams.from_date = new Date(salesParams.from_date).toISOString().split('T')[0]
    if (salesParams.to_date) salesParams.to_date = new Date(salesParams.to_date).toISOString().split('T')[0]
    const [salesRes, loansRes, dailyRevenueRes, topProductsRes, stockEntriesRes, profitRes, stockReportRes] = await Promise.all([
      api.get('/sales', { params: salesParams }),
      api.get('/reports/loans', { params }),
      api.get('/reports/daily-revenue', { params }),
      api.get('/reports/top-products', { params }),
      api.get('/reports/stock-entries', { params }).catch(() => ({ data: [] })),
      api.get('/reports/profit', { params }).catch(() => ({ data: [] })),
      api.get('/reports/monthly-stock', { params }).catch(() => ({ data: [] }))
    ])
    salesData.value = salesRes.data || []
    loanData.value = loansRes.data?.recent_loans || loansRes.data || []
    let revenueData = dailyRevenueRes.data || []
    if (Array.isArray(revenueData)) dailyRevenue.value = revenueData
    else if (revenueData.daily_revenue) dailyRevenue.value = revenueData.daily_revenue
    else if (revenueData.data) dailyRevenue.value = revenueData.data
    else dailyRevenue.value = []
    topProducts.value = topProductsRes.data || []
    stockEntries.value = stockEntriesRes.data || []
    profitReportData.value = profitRes.data || []
    monthlyStockReport.value = stockReportRes.data || []
    tabCounts.value = { sales: filteredSalesData.value.length, loans: loanData.value.length, revenue: dailyRevenue.value.length, products: topProducts.value.length, stock: monthlyStockReport.value.length }
    if (activeTab.value === 'revenue' && dailyRevenue.value.length > 0) await initChart()
  } catch (err) { error.value = err.response?.data?.detail || err.message || t('reports.failedToLoad') }
  finally { loading.value = false }
}

const refreshData = () => fetchAllReports()

const getDateRangeLabel = () => {
  const params = getDateRangeParams()
  if (params.from_date && params.to_date) return `${params.from_date} to ${params.to_date}`
  return activeRange.value
}

const exportToPDF = async () => {
  loading.value = true
  try {
    let chartImage = null
    if (dailyRevenue.value.length > 0) { await initChart(); chartImage = await getChartImage() }
    const pdfContent = document.createElement('div')
    pdfContent.style.padding = '20px'; pdfContent.style.fontFamily = 'Arial, sans-serif'; pdfContent.style.fontSize = '12px'
    pdfContent.innerHTML = `<div style="text-align: center; margin-bottom: 30px;"><h1 style="color: #2FB8A6; margin-bottom: 10px;">${t('reports.completeReport')}</h1><p><strong>${t('reports.generated')}:</strong> ${new Date().toLocaleString()}</p><p><strong>${t('reports.period')}:</strong> ${getDateRangeLabel()}</p><hr style="margin: 20px 0;"></div>
      <div style="margin-bottom: 40px;"><h2 style="color: #2FB8A6; border-bottom: 2px solid #2FB8A6; padding-bottom: 10px;">${t('reports.financialSummary')}</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
          <tr style="background: #f0f0f0;"><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${t('reports.metric')}</th><th style="padding: 10px; text-align: right; border: 1px solid #ddd;">${t('reports.value')}</th></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">${t('reports.totalRevenue')}</td><td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(totalRevenue.value)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">${t('reports.totalProfit')}</td><td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(totalProfit.value)}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">${t('reports.totalSales')}</td><td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${filteredSalesData.value.length}</td></tr>
          <tr><td style="padding: 8px; border: 1px solid #ddd;">${t('reports.activeLoans')}</td><td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${activeLoansCount.value}</td></tr></table></div>`
    if (filteredSalesData.value.length > 0) {
      pdfContent.innerHTML += `<div style="margin-bottom: 40px;"><h2 style="color: #2FB8A6; border-bottom: 2px solid #2FB8A6; padding-bottom: 10px;">${t('reports.salesTransactions')}</h2><table style="width: 100%; border-collapse: collapse; margin-top: 15px;"><thead><tr style="background: #f0f0f0;"><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${t('common.date')}</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${t('sales.invoice')}</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${t('sales.customer')}</th><th style="padding: 10px; text-align: right; border: 1px solid #ddd;">${t('sales.subtotal')}</th><th style="padding: 10px; text-align: center; border: 1px solid #ddd;">${t('sales.taxRate')}</th><th style="padding: 10px; text-align: right; border: 1px solid #ddd;">${t('sales.taxAmount')}</th><th style="padding: 10px; text-align: right; border: 1px solid #ddd;">${t('common.total')}</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${t('sales.paymentMethod')}</th><th style="padding: 10px; text-align: left; border: 1px solid #ddd;">${t('common.status')}</th></tr></thead><tbody>${filteredSalesData.value.map(s => `<tr><td style="padding: 8px; border: 1px solid #ddd;">${formatDate(s.sale_date || s.created_at)}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.invoice_number || s.id}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.customer_name || t('sales.walkInCustomer')}</td><td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(s.subtotal || 0)}</td><td style="padding: 8px; text-align: center; border: 1px solid #ddd;">${s.tax_rate || 0}%</td><td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(s.tax_amount || 0)}</td><td style="padding: 8px; text-align: right; border: 1px solid #ddd;">${formatCurrency(s.total_amount)}</td><td style="padding: 8px; border: 1px solid #ddd;">${formatPaymentMethod(s.payment_method)}</td><td style="padding: 8px; border: 1px solid #ddd;">${s.status || t('sales.completed')}</td></tr>`).join('')}</tbody></table></div>`
    }
    if (chartImage) pdfContent.innerHTML += `<div style="margin-bottom: 40px;"><h2 style="color: #2FB8A6; border-bottom: 2px solid #2FB8A6; padding-bottom: 10px;">${t('reports.revenueChart')}</h2><div style="text-align: center; margin-top: 15px;"><img src="${chartImage}" style="max-width: 100%; height: auto; border: 1px solid #ddd; border-radius: 8px;" /></div></div>`
    pdfContent.innerHTML += `<div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;"><p>${t('reports.generatedBy')}</p><p>${t('reports.copyright', { year: new Date().getFullYear() })}</p></div>`
    const opt = { margin: [0.5, 0.5, 0.5, 0.5], filename: `complete_report_${new Date().toISOString().split('T')[0]}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2, useCORS: true, logging: false }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } }
    await html2pdf().set(opt).from(pdfContent).save()
  } catch (err) { console.error('Failed to generate PDF:', err); alert(t('reports.pdfFailed')) }
  finally { loading.value = false }
}

watch(activeTab, async (newTab) => { if (newTab === 'revenue' && chartData.value.length > 0) await initChart() })
watch(chartData, async () => { if (activeTab.value === 'revenue') await initChart() })

onMounted(async () => { await fetchAllReports() })
</script>

<style scoped>
.payment-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 500; }
.payment-badge.cash { background: rgba(52, 211, 153, 0.1); color: #34D399; }
.payment-badge.transfer { background: rgba(59, 130, 246, 0.1); color: #3B82F6; }
.account-number { font-family: monospace; font-size: 0.7rem; color: #6E8B90; }
.tax-rate { color: #F59E0B; font-weight: 500; text-align: center; }
.tax { color: #F59E0B; font-weight: 500; }
.subtotal-row { background: #f7fafc; }
.tax-row { background: #fef5e7; color: #f39c12; }
.btn-pdf { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; background: #ef4444; border: none; color: white; }
.btn-pdf:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }
.summary-card.sales { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); }
.clickable-row { cursor: pointer; transition: background 0.2s ease; }
.clickable-row:hover { background: rgba(47, 184, 166, 0.05); }
.items-preview { display: flex; flex-wrap: wrap; gap: 0.25rem; }
.item-tag { background: rgba(47, 184, 166, 0.1); padding: 0.125rem 0.375rem; border-radius: 4px; font-size: 0.7rem; color: #2FB8A6; }
.more-items { font-size: 0.7rem; color: #6E8B90; }
.chart-wrapper { position: relative; height: 400px; margin-bottom: 20px; padding: 20px; background: white; border-radius: 12px; }
.chart-stats { display: flex; justify-content: space-around; gap: 20px; margin-top: 20px; padding: 15px; background: #f7fafc; border-radius: 8px; }
.stat-item { text-align: center; }
.stat-label { display: block; font-size: 0.75rem; color: #6E8B90; margin-bottom: 5px; }
.stat-value { display: block; font-size: 1rem; font-weight: 600; color: #2FB8A6; }
.product-revenue { font-size: 0.8rem; font-weight: 500; color: #2FB8A6; min-width: 80px; text-align: right; }
.stock-entries-section { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid rgba(47, 184, 166, 0.2); }
.profit-report-section { margin-top: 2rem; padding-top: 1rem; border-top: 2px solid rgba(47, 184, 166, 0.2); }
.profit-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin: 1.5rem 0; }
.profit-card { background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%); padding: 1.5rem; border-radius: 12px; text-align: center; border: 1px solid rgba(0, 0, 0, 0.05); }
.profit-label { font-size: 0.75rem; color: #6E8B90; margin-bottom: 0.5rem; text-transform: uppercase; font-weight: 500; }
.profit-value { font-size: 1.5rem; font-weight: 700; }
.revenue-value { color: #2FB8A6; }
.cost-value { color: #F97316; }
.profit-positive { color: #34D399; }
.profit-negative { color: #EF4444; }
.margin-value { color: #8B5CF6; }
.profit-table-container { margin-top: 1.5rem; }
.profit-table-container h4 { font-size: 0.9rem; font-weight: 600; color: #1A2A2E; margin-bottom: 0.5rem; }
.stock-in { color: #34D399; font-weight: 500; }
.stock-out { color: #EF4444; font-weight: 500; }
.total-row { background: #f7fafc; font-weight: bold; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0, 0, 0, 0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal { background: white; border-radius: 12px; width: 90%; max-width: 800px; max-height: 80vh; overflow-y: auto; }
.modal-large { max-width: 900px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid #e2e8f0; position: sticky; top: 0; background: white; z-index: 1; }
.modal-body { padding: 20px; }
.modal-footer { padding: 16px 20px; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; position: sticky; bottom: 0; background: white; }
.close-btn { background: none; border: none; font-size: 24px; cursor: pointer; color: #718096; }
.close-btn:hover { color: #1a1a1a; }
.sale-info { background: #f7fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; }
.sale-info p { margin: 8px 0; }
.items-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
.items-table th, .items-table td { padding: 10px; text-align: left; border-bottom: 1px solid #e2e8f0; }
.items-table th { background: #f7fafc; font-weight: 600; color: #4a5568; }
.items-table tfoot tr.total-row { background: #f7fafc; font-weight: bold; }
.reports-container { max-width: 1400px; margin: 0 auto; padding: 1rem; animation: fadeIn 0.5s ease-out; }
.btn-svg-icon, .tab-svg-icon { width: 16px; height: 16px; }
.error-svg-icon { width: 48px; height: 48px; margin: 0 auto 1rem; color: #ef4444; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
.page-title { font-size: 1.8rem; font-weight: 700; color: #1A2A2E; margin-bottom: 0.25rem; }
.page-subtitle { color: #6E8B90; font-size: 0.9rem; }
.header-actions { display: flex; gap: 1rem; }
.btn-primary, .btn-secondary { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: linear-gradient(135deg, #2FB8A6, #6FD3C3); border: none; color: white; }
.btn-secondary { background: #e2e8f0; border: 1px solid #cbd5e0; color: #4a5568; }
.btn-primary:disabled, .btn-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
.date-range-card { padding: 1.5rem; margin-bottom: 1.5rem; }
.date-range-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem; }
.range-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.range-btn { padding: 0.5rem 1rem; background: #f7fafc; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.3s ease; }
.range-btn.active { background: #2FB8A6; border-color: #2FB8A6; color: white; }
.custom-range { display: flex; gap: 1rem; align-items: flex-end; }
.date-input { display: flex; flex-direction: column; gap: 0.25rem; }
.date-input label { font-size: 0.7rem; font-weight: 500; color: #6E8B90; }
.form-input { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 6px; }
.apply-btn { padding: 0.5rem 1rem; background: #2FB8A6; color: white; border: none; border-radius: 6px; cursor: pointer; }
.glass-card { background: rgba(255, 255, 255, 0.65); backdrop-filter: blur(20px); border-radius: 24px; border: 1px solid rgba(255, 255, 255, 0.3); transition: all 0.3s ease; }
.summary-section { margin-bottom: 1.5rem; }
.summary-section h2 { font-size: 1.2rem; font-weight: 600; color: #1A2A2E; margin-bottom: 1rem; }
.summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; }
.summary-card { padding: 1.5rem; border-radius: 20px; display: flex; align-items: center; gap: 1rem; color: white; }
.summary-card.revenue { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
.summary-card.profit { background: linear-gradient(135deg, #4caf50 0%, #45a049 100%); }
.summary-card.expenses { background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%); }
.summary-card.loans { background: linear-gradient(135deg, #2196f3 0%, #1976d2 100%); }
.card-icon { font-size: 2rem; }
.card-details { flex: 1; }
.card-label { font-size: 0.75rem; opacity: 0.8; margin-bottom: 0.25rem; }
.card-value { font-size: 1.5rem; font-weight: 700; margin-bottom: 0.25rem; }
.card-sub { font-size: 0.7rem; opacity: 0.8; }
.tabs-container { display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap; }
.tab-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: rgba(255, 255, 255, 0.5); border: none; border-radius: 12px; cursor: pointer; transition: all 0.3s ease; font-weight: 500; }
.tab-btn.active { background: #2FB8A6; color: white; }
.tab-count { background: rgba(0, 0, 0, 0.1); padding: 0.125rem 0.375rem; border-radius: 12px; font-size: 0.7rem; }
.tab-content { padding: 1.5rem; margin-bottom: 1.5rem; }
.tab-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.tab-header h3 { font-size: 1rem; font-weight: 600; color: #1A2A2E; }
.record-count { font-size: 0.75rem; color: #6E8B90; background: rgba(110, 139, 144, 0.1); padding: 0.25rem 0.75rem; border-radius: 20px; }
.table-container { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 0.75rem; text-align: left; border-bottom: 1px solid rgba(0, 0, 0, 0.05); }
.data-table th { background: rgba(47, 184, 166, 0.05); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
.amount { font-weight: 600; color: #2FB8A6; }
.paid { color: #4caf50; }
.balance { color: #ef4444; font-weight: 600; }
.status-badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.7rem; font-weight: 500; }
.status-pending { background: #fef5e7; color: #f39c12; }
.status-completed { background: #e8f5e9; color: #4caf50; }
.status-cancelled { background: #ffebee; color: #f44336; }
.status-partial { background: #e3f2fd; color: #2196f3; }
.status-active { background: #e3f2fd; color: #2196f3; }
.status-settled { background: #e8f5e9; color: #4caf50; }
.empty-table { text-align: center; padding: 2rem; color: #6E8B90; }
.top-products-list { display: flex; flex-direction: column; gap: 1rem; }
.product-rank { display: flex; align-items: center; gap: 1rem; }
.rank { width: 30px; height: 30px; background: linear-gradient(135deg, #2FB8A6, #6FD3C3); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; }
.product-info { flex: 1; }
.product-name { font-size: 0.85rem; font-weight: 500; display: block; margin-bottom: 0.25rem; }
.product-bar { height: 6px; background: rgba(0, 0, 0, 0.1); border-radius: 3px; overflow: hidden; }
.fill { height: 100%; background: linear-gradient(90deg, #2FB8A6, #6FD3C3); border-radius: 3px; }
.product-qty { font-size: 0.8rem; font-weight: 600; color: #2FB8A6; }
.loading-state, .error-state { text-align: center; padding: 4rem; }
.spinner { width: 48px; height: 48px; border: 3px solid rgba(47, 184, 166, 0.2); border-top-color: #2FB8A6; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 0 auto 1rem; }
.error-state h3 { font-size: 1.2rem; color: #1A2A2E; margin-bottom: 0.5rem; }
.error-state p { color: #6E8B90; margin-bottom: 1.5rem; }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
@media (max-width: 768px) { .reports-container { padding: 0.5rem; } .date-range-content { flex-direction: column; align-items: stretch; } .custom-range { flex-direction: column; align-items: stretch; } .summary-grid { grid-template-columns: 1fr; } .tabs-container { overflow-x: auto; flex-wrap: nowrap; } .tab-btn { white-space: nowrap; } .chart-wrapper { height: 250px; } }
@media (max-width: 480px) { .chart-wrapper { height: 200px; } .data-table th, .data-table td { padding: 0.5rem; font-size: 0.7rem; } }
</style>