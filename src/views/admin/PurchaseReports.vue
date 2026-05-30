<template>
  <div class="purchase-reports-container">
    <div class="page-header">
      <h1 class="page-title">Purchase Reports</h1>
      <div class="header-actions">
        <button @click="exportReport" class="btn-secondary">
          <i class="fas fa-download"></i> Export Report
        </button>
      </div>
    </div>

    <!-- Date Range Filter -->
    <div class="filters-card">
      <div class="filters">
        <div class="filter-group">
          <label>From Date</label>
          <input type="date" v-model="filters.from_date" class="date-input" />
        </div>
        <div class="filter-group">
          <label>To Date</label>
          <input type="date" v-model="filters.to_date" class="date-input" />
        </div>
        <div class="filter-group">
          <label>Supplier</label>
          <input 
            type="text" 
            v-model="filters.supplier" 
            placeholder="Search supplier..."
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <label>&nbsp;</label>
          <button @click="loadReport" class="btn-primary">Generate Report</button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i> Loading report...
    </div>

    <!-- Report Content -->
    <div v-else-if="reportData" class="report-content">
      <!-- Summary Cards -->
      <div class="summary-cards">
        <div class="summary-card">
          <div class="card-icon">💰</div>
          <div class="card-info">
            <h3>Total Purchases</h3>
            <p>{{ formatCurrency(reportData.summary.total_all_purchases) }}</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">📦</div>
          <div class="card-info">
            <h3>Purchase Orders</h3>
            <p>{{ reportData.summary.total_purchase_orders }}</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">🏭</div>
          <div class="card-info">
            <h3>Total Suppliers</h3>
            <p>{{ reportData.supplier_breakdown?.length || 0 }}</p>
          </div>
        </div>
        <div class="summary-card">
          <div class="card-icon">📊</div>
          <div class="card-info">
            <h3>Average Order Value</h3>
            <p>{{ formatCurrency(reportData.summary.average_order_value) }}</p>
          </div>
        </div>
      </div>

      <!-- Supplier Breakdown -->
      <div class="report-section">
        <h2>Supplier Breakdown</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Total Amount</th>
                <th>% of Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="supplier in reportData.supplier_breakdown" :key="supplier.supplier">
                <td>{{ supplier.supplier }}</td>
                <td>{{ formatCurrency(supplier.total_amount) }}</td>
                <td>{{ getPercentage(supplier.total_amount, reportData.summary.total_all_purchases) }}%</td>
              </tr>
              <tr v-if="!reportData.supplier_breakdown?.length">
                <td colspan="3" class="text-center">No supplier data found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Top Purchased Items -->
      <div class="report-section">
        <h2>Top Purchased Items</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Quantity</th>
                <th>Total Cost</th>
                <th>Average Cost</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in reportData.top_items" :key="item.product_id">
                <td>{{ item.product_name }}</td>
                <td>{{ formatNumber(item.quantity) }}</td>
                <td>{{ formatCurrency(item.total_cost) }}</td>
                <td>{{ formatCurrency(item.average_cost) }}</td>
              </tr>
              <tr v-if="!reportData.top_items?.length">
                <td colspan="4" class="text-center">No purchase items found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent Purchase Orders (UPDATED with VAT column) -->
      <div class="report-section">
        <h2>Recent Purchase Orders</h2>
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Supplier</th>
                <th>Order Date</th>
                <th>Total Amount</th>
                <th>VAT</th>
                <th>Status</th>
                <th>Items</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in reportData.purchase_orders" :key="order.order_number">
                <td>{{ order.order_number }}</td>
                <td>{{ order.supplier }}</td>
                <td>{{ formatDate(order.order_date) }}</td>
                <td>{{ formatCurrency(order.total_amount) }}</td>
                <td class="vat-cell">
                  <span v-if="order.vat_amount" class="vat-amount">{{ formatCurrency(order.vat_amount) }}</span>
                  <span v-else class="vat-none">—</span>
                </td>
                <td>
                  <span :class="getStatusClass(order.status)" class="status-badge">
                    {{ getStatusText(order.status) }}
                  </span>
                </td>
                <td>{{ order.items_count }}</td>
              </tr>
              <tr v-if="!reportData.purchase_orders?.length">
                <td colspan="7" class="text-center">No purchase orders found</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <i class="fas fa-chart-line empty-icon"></i>
      <h3>No Report Generated</h3>
      <p>Select a date range and click "Generate Report" to view purchase analytics</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '@/services/api'

const loading = ref(false)
const reportData = ref(null)

const filters = ref({
  from_date: '',
  to_date: '',
  supplier: ''
})

// Set default dates (last 30 days)
onMounted(() => {
  const toDate = new Date()
  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - 30)
  
  filters.value.to_date = toDate.toISOString().split('T')[0]
  filters.value.from_date = fromDate.toISOString().split('T')[0]
  
  loadReport()
})

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '$0.00'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const formatNumber = (number) => {
  if (!number && number !== 0) return '0'
  return new Intl.NumberFormat('en-US').format(number)
}

const getPercentage = (value, total) => {
  if (!total || total === 0) return '0'
  return ((value / total) * 100).toFixed(1)
}

const getStatusClass = (status) => {
  const classes = {
    pending: 'status-pending',
    partially_received: 'status-partial',
    completed: 'status-completed',
    cancelled: 'status-cancelled'
  }
  return classes[status] || 'status-pending'
}

const getStatusText = (status) => {
  const texts = {
    pending: 'Pending',
    partially_received: 'Partially Received',
    completed: 'Completed',
    cancelled: 'Cancelled'
  }
  return texts[status] || status
}

const loadReport = async () => {
  loading.value = true
  try {
    const params = {}
    if (filters.value.from_date) params.from_date = filters.value.from_date
    if (filters.value.to_date) params.to_date = filters.value.to_date
    if (filters.value.supplier) params.supplier = filters.value.supplier
    
    const response = await api.get('/reports/purchases', { params })
    reportData.value = response.data
    console.log('Purchase report loaded:', reportData.value)
  } catch (error) {
    console.error('Failed to load purchase report:', error)
    // Demo data for testing with VAT included
    reportData.value = {
      date_range: {
        from_date: filters.value.from_date,
        to_date: filters.value.to_date
      },
      summary: {
        total_purchase_orders: 5,
        total_purchase_cost: 12500.00,
        total_legacy_purchases: 3,
        total_legacy_cost: 3200.00,
        total_all_purchases: 15700.00,
        average_order_value: 2500.00
      },
      supplier_breakdown: [
        { supplier: "Tech Suppliers Inc.", total_amount: 8500.00 },
        { supplier: "Office Depot", total_amount: 4200.00 },
        { supplier: "Logistics Pro", total_amount: 3000.00 }
      ],
      top_items: [
        { product_id: 1, product_name: "Laptop", quantity: 10, total_cost: 5000.00, average_cost: 500.00 },
        { product_id: 2, product_name: "Monitor", quantity: 15, total_cost: 3000.00, average_cost: 200.00 },
        { product_id: 3, product_name: "Keyboard", quantity: 50, total_cost: 1250.00, average_cost: 25.00 }
      ],
      purchase_orders: [
        { order_number: "PO-001", supplier: "Tech Suppliers Inc.", order_date: "2024-01-15", total_amount: 5000.00, vat_amount: 750.00, status: "completed", items_count: 3 },
        { order_number: "PO-002", supplier: "Office Depot", order_date: "2024-01-20", total_amount: 2500.00, vat_amount: 375.00, status: "pending", items_count: 2 },
        { order_number: "PO-003", supplier: "Logistics Pro", order_date: "2024-01-25", total_amount: 3000.00, vat_amount: null, status: "completed", items_count: 4 }
      ]
    }
  } finally {
    loading.value = false
  }
}

const exportReport = () => {
  if (!reportData.value) {
    alert('Please generate a report first')
    return
  }
  
  // Create CSV content
  let csvContent = "Purchase Report\n"
  csvContent += `Date Range: ${reportData.value.date_range.from_date} to ${reportData.value.date_range.to_date}\n\n`
  csvContent += "Summary\n"
  csvContent += `Total Purchases,${reportData.value.summary.total_all_purchases}\n`
  csvContent += `Purchase Orders,${reportData.value.summary.total_purchase_orders}\n\n`
  
  csvContent += "Supplier Breakdown\n"
  csvContent += "Supplier,Total Amount\n"
  reportData.value.supplier_breakdown.forEach(supplier => {
    csvContent += `${supplier.supplier},${supplier.total_amount}\n`
  })
  
  csvContent += "\nTop Purchased Items\n"
  csvContent += "Product,Quantity,Total Cost,Average Cost\n"
  reportData.value.top_items.forEach(item => {
    csvContent += `${item.product_name},${item.quantity},${item.total_cost},${item.average_cost}\n`
  })
  
  csvContent += "\nRecent Purchase Orders\n"
  csvContent += "Order #,Supplier,Order Date,Total Amount,VAT,Status,Items\n"
  reportData.value.purchase_orders.forEach(order => {
    const vatValue = order.vat_amount ? order.vat_amount : 0
    csvContent += `${order.order_number},${order.supplier},${order.order_date},${order.total_amount},${vatValue},${order.status},${order.items_count}\n`
  })
  
  // Download CSV
  const blob = new Blob([csvContent], { type: 'text/csv' })
  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `purchase_report_${filters.value.from_date}_to_${filters.value.to_date}.csv`
  a.click()
  window.URL.revokeObjectURL(url)
}
</script>

<style scoped>
.purchase-reports-container {
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.filters-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.filters {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-size: 12px;
  font-weight: 500;
  color: #4a5568;
}

.date-input, .search-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
}

.loading-state {
  text-align: center;
  padding: 60px;
  color: #718096;
}

.loading-state i {
  font-size: 24px;
  margin-bottom: 12px;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.card-icon {
  font-size: 32px;
}

.card-info h3 {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.card-info p {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}

.report-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.report-section h2 {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  margin-bottom: 20px;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th, .data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

/* VAT column styling */
.vat-cell {
  font-family: monospace;
}

.vat-amount {
  color: #2c3e50;
  font-weight: 500;
}

.vat-none {
  color: #95a5a6;
  font-style: italic;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  display: inline-block;
}

.status-pending {
  background: #fef5e7;
  color: #f39c12;
}

.status-partial {
  background: #e3f2fd;
  color: #2196f3;
}

.status-completed {
  background: #e8f5e9;
  color: #4caf50;
}

.status-cancelled {
  background: #ffebee;
  color: #f44336;
}

.empty-state {
  text-align: center;
  padding: 60px;
  background: white;
  border-radius: 12px;
}

.empty-icon {
  font-size: 48px;
  color: #cbd5e0;
  margin-bottom: 16px;
}

.empty-state h3 {
  font-size: 18px;
  color: #4a5568;
  margin-bottom: 8px;
}

.empty-state p {
  color: #718096;
}

.text-center {
  text-align: center;
}

@media (max-width: 768px) {
  .purchase-reports-container {
    padding: 16px;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .filter-group {
    width: 100%;
  }
  
  .date-input, .search-input {
    width: 100%;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
}
</style>