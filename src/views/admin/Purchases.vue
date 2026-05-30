<template>
  <div class="purchases-container">
    <div class="page-header">
      <h1 class="page-title">{{ $t('purchases.title') }}</h1>
      <div class="header-actions">
        <button @click="goToCreatePurchaseOrder" class="btn-primary">
          <i class="fas fa-plus"></i> {{ $t('purchases.newPurchaseOrder') }}
        </button>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button @click="activeTab = 'orders'" :class="{ active: activeTab === 'orders' }" class="tab-btn">{{ $t('purchases.purchaseOrders') }}</button>
      <button @click="activeTab = 'history'" :class="{ active: activeTab === 'history' }" class="tab-btn">{{ $t('purchases.purchaseHistory') }}</button>
      <button @click="activeTab = 'reports'" :class="{ active: activeTab === 'reports' }" class="tab-btn">{{ $t('sidebar.reports') }}</button>
    </div>

    <!-- Purchase Orders Tab -->
    <div v-if="activeTab === 'orders'" class="tab-content">
      <div class="filters">
        <input v-model="filters.supplier" :placeholder="$t('purchases.searchSupplier')" class="search-input" @input="loadPurchaseOrders" />
        <select v-model="filters.status" class="status-filter" @change="loadPurchaseOrders">
          <option value="">{{ $t('purchases.allStatus') }}</option>
          <option value="pending">{{ $t('purchases.pending') }}</option>
          <option value="partially_received">{{ $t('purchases.partiallyReceived') }}</option>
          <option value="completed">{{ $t('purchases.completed') }}</option>
          <option value="cancelled">{{ $t('purchases.cancelled') }}</option>
        </select>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('purchases.groupOrder') }}</th>
              <th>{{ $t('purchases.supplier') }}</th>
              <th>{{ $t('purchases.orderDate') }}</th>
              <th>{{ $t('purchases.subtotal') }}</th>
              <th>VAT</th>
              <th>{{ $t('purchases.totalAmount') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-for="group in groupedPurchaseOrders" :key="group.supplier">
              <tr class="group-row" @click="toggleGroup(group.supplier)">
                <td colspan="8" class="group-header">
                  <div class="group-header-content">
                    <div class="group-info">
                      <svg class="group-icon" :class="{ 'rotated': expandedGroups.has(group.supplier) }" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" /></svg>
                      <span class="group-prefix">{{ group.supplier }}</span>
                      <span class="group-count">({{ group.orders.length }} {{ $t('purchases.orders') }})</span>
                      <span class="group-total">{{ $t('common.total') }}: {{ formatCurrency(group.totalAmount) }}</span>
                    </div>
                  </div>
                </td>
              </tr>
              <template v-if="expandedGroups.has(group.supplier)">
                <tr v-for="order in group.orders" :key="order.id" class="order-row sub-order-row">
                  <td class="order-number">{{ order.order_number }}</td>
                  <td>{{ order.supplier }}</td>
                  <td>{{ formatDate(order.order_date) }}</td>
                  <td>{{ formatCurrency(order.subtotal) }}</td>
                  <td class="vat-cell">
                    <div v-if="order.vat_amount && order.vat_amount > 0">
                      <span class="vat-amount">{{ formatCurrency(order.vat_amount) }}</span>
                      <span class="vat-rate-badge">({{ order.vat_rate || 0 }}%)</span>
                    </div>
                    <span v-else class="vat-none">—</span>
                  </td>
                  <td>{{ formatCurrency(order.total_amount) }}</td>
                  <td><span :class="getStatusClass(order.status)" class="status-badge">{{ getStatusText(order.status) }}</span></td>
                  <td class="actions-cell">
                    <div class="action-buttons">
                      <button @click.stop="viewOrderDetails(order)" class="icon-btn" :title="$t('common.view')"><i class="fas fa-eye"></i></button>
                      <button v-if="order.status !== 'completed'" @click.stop="receiveOrder(order)" class="icon-btn success" :title="$t('purchases.receive')"><i class="fas fa-boxes"></i></button>
                      <button @click.stop="reorderFromPurchase(order)" class="icon-btn reorder" :title="$t('purchases.reorder')"><i class="fas fa-redo-alt"></i></button>
                    </div>
                  </td>
                </tr>
              </template>
            </template>
            <tr v-if="!groupedPurchaseOrders.length"><td colspan="8" class="empty-state"><p>{{ $t('purchases.noOrders') }}</p></td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Purchase History Tab -->
    <div v-if="activeTab === 'history'" class="tab-content">
      <div class="filters">
        <input v-model="historyFilters.supplier" :placeholder="$t('purchases.searchSupplier')" class="search-input" @input="loadPurchaseHistory" />
        <input type="date" v-model="historyFilters.from_date" class="date-input" @change="loadPurchaseHistory" />
        <input type="date" v-model="historyFilters.to_date" class="date-input" @change="loadPurchaseHistory" />
        <button @click="loadPurchaseHistory" class="btn-primary">{{ $t('common.search') }}</button>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('common.date') }}</th>
              <th>{{ $t('purchases.supplier') }}</th>
              <th>{{ $t('sidebar.products') }}</th>
              <th>{{ $t('purchases.subtotal') }}</th>
              <th>VAT</th>
              <th>{{ $t('purchases.totalCost') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="purchase in purchaseHistory" :key="purchase.id">
              <td>{{ formatDate(purchase.created_at) }}</td>
              <td>{{ purchase.supplier_name || purchase.supplier || 'N/A' }}</td>
              <td><div v-for="item in purchase.items" :key="item.id" class="purchase-item">{{ item.product?.name || item.product_name }} x {{ item.quantity }}</div></td>
              <td>{{ formatCurrency(purchase.subtotal) || formatCurrency(purchase.total_amount) }}</td>
              <td class="vat-cell">
                <div v-if="purchase.vat_amount && purchase.vat_amount > 0">
                  <span class="vat-amount">{{ formatCurrency(purchase.vat_amount) }}</span>
                  <span class="vat-rate-badge">({{ purchase.vat_rate || 0 }}%)</span>
                </div>
                <span v-else class="vat-none">—</span>
               </td>
              <td>{{ formatCurrency(purchase.total_amount) }}</td>
              <td><button @click="reorderFromHistory(purchase)" class="icon-btn reorder" :title="$t('purchases.reorder')"><i class="fas fa-redo-alt"></i> {{ $t('purchases.reorder') }}</button></td>
             </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Reports Tab -->
    <div v-if="activeTab === 'reports'" class="tab-content">
      <div class="report-filters">
        <input type="date" v-model="reportFilters.from_date" class="date-input" />
        <input type="date" v-model="reportFilters.to_date" class="date-input" />
        <button @click="loadReport" class="btn-primary">{{ $t('reports.generateReport') }}</button>
      </div>
      <div v-if="reportData" class="report-data">
        <div class="summary-cards">
          <div class="summary-card"><div class="card-icon">📦</div><div class="card-info"><h3>{{ $t('purchases.totalPurchases') }}</h3><p>{{ formatCurrency(reportData.summary.total_all_purchases) }}</p></div></div>
          <div class="summary-card"><div class="card-icon">🏭</div><div class="card-info"><h3>{{ $t('purchases.purchaseOrders') }}</h3><p>{{ reportData.summary.total_purchase_orders }}</p></div></div>
          <div class="summary-card" v-if="reportData.summary.total_vat_amount"><div class="card-icon">💰</div><div class="card-info"><h3>{{ $t('purchases.totalVat') }}</h3><p>{{ formatCurrency(reportData.summary.total_vat_amount) }}</p></div></div>
        </div>
        <div class="supplier-breakdown"><h3>{{ $t('purchases.topSuppliers') }}</h3><div v-for="supplier in reportData.supplier_breakdown" :key="supplier.supplier" class="supplier-item"><span>{{ supplier.supplier }}</span><span>{{ formatCurrency(supplier.total_amount) }}</span></div></div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <div v-if="showOrderDetailsModal" class="modal-overlay" @click.self="showOrderDetailsModal = false">
      <div class="modal modal-large">
        <div class="modal-header"><h2>{{ $t('purchases.orderDetails') }}: {{ selectedOrder?.order_number }}</h2><button @click="showOrderDetailsModal = false" class="close-btn">&times;</button></div>
        <div class="modal-body">
          <div class="order-info">
            <p><strong>{{ $t('purchases.supplier') }}:</strong> {{ selectedOrder?.supplier }}</p>
            <p><strong>{{ $t('purchases.orderDate') }}:</strong> {{ formatDate(selectedOrder?.order_date) }}</p>
            <p><strong>{{ $t('purchases.subtotal') }}:</strong> {{ formatCurrency(selectedOrder?.subtotal) }}</p>
            <p><strong>VAT:</strong> 
              <span v-if="selectedOrder?.vat_amount && selectedOrder.vat_amount > 0">
                {{ formatCurrency(selectedOrder.vat_amount) }} ({{ selectedOrder.vat_rate || 0 }}%)
              </span>
              <span v-else class="vat-none">Not applicable</span>
            </p>
            <p><strong>{{ $t('purchases.shippingCost') }}:</strong> {{ formatCurrency(selectedOrder?.shipping_cost) }}</p>
            <p><strong>{{ $t('purchases.discount') }}:</strong> {{ formatCurrency(selectedOrder?.discount_amount) }}</p>
            <p><strong>{{ $t('purchases.grandTotal') }}:</strong> <strong class="total-highlight">{{ formatCurrency(selectedOrder?.total_amount) }}</strong></p>
            <p><strong>{{ $t('common.status') }}:</strong> <span :class="getStatusClass(selectedOrder?.status)">{{ getStatusText(selectedOrder?.status) }}</span></p>
          </div>
          <h3>{{ $t('purchases.orderItems') }}</h3>
          <table class="items-table">
            <thead>
              <tr>
                <th>{{ $t('sales.product') }}</th>
                <th>{{ $t('purchases.ordered') }}</th>
                <th>{{ $t('purchases.received') }}</th>
                <th>{{ $t('sales.unitPrice') }}</th>
                <th>{{ $t('common.total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in selectedOrder?.items" :key="item.id">
                <td>{{ item.product_name }}</td>
                <td>{{ item.quantity_ordered }}</td>
                <td>{{ item.quantity_received || 0 }}</td>
                <td>{{ formatCurrency(item.unit_cost) }}</td>
                <td>{{ formatCurrency(item.quantity_ordered * item.unit_cost) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="modal-footer"><button @click="showOrderDetailsModal = false" class="btn-secondary">{{ $t('common.close') }}</button></div>
      </div>
    </div>

    <!-- Receive Order Modal -->
    <div v-if="showReceiveModal" class="modal-overlay" @click.self="showReceiveModal = false">
      <div class="modal">
        <div class="modal-header"><h2>{{ $t('purchases.receiveOrder') }}: {{ selectedOrder?.order_number }}</h2><button @click="showReceiveModal = false" class="close-btn">&times;</button></div>
        <div class="modal-body">
          <div v-for="item in selectedOrder?.items" :key="item.id" class="receive-item">
            <div class="item-info">
              <strong>{{ item.product_name }}</strong>
              <div>{{ $t('purchases.ordered') }}: {{ item.quantity_ordered }}</div>
              <div>{{ $t('purchases.received') }}: {{ item.quantity_received || 0 }}</div>
              <div>{{ $t('purchases.remaining') }}: {{ (item.quantity_ordered - (item.quantity_received || 0)) }}</div>
            </div>
            <div class="item-input">
              <label>{{ $t('purchases.quantityToReceive') }}:</label>
              <input type="number" v-model.number="receiveQuantities[item.id]" :max="item.quantity_ordered - (item.quantity_received || 0)" min="0" step="1" class="quantity-input" />
            </div>
          </div>
          <div class="form-field"><label>{{ $t('purchases.deliveryDate') }}:</label><input type="date" v-model="receiveDate" class="date-input" /></div>
        </div>
        <div class="modal-footer"><button @click="submitReceive" class="btn-primary">{{ $t('purchases.confirmReceive') }}</button><button @click="showReceiveModal = false" class="btn-secondary">{{ $t('common.cancel') }}</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { purchaseService } from '../../services/purchaseService'
import { formatCurrency, formatDate } from '../../utils/format'

const router = useRouter()
const { t } = useI18n()

const activeTab = ref('orders')
const purchaseOrders = ref([])
const purchaseHistory = ref([])
const reportData = ref(null)
const expandedGroups = ref(new Set())
const showOrderDetailsModal = ref(false)
const showReceiveModal = ref(false)
const selectedOrder = ref(null)
const receiveQuantities = ref({})
const receiveDate = ref(new Date().toISOString().split('T')[0])

const filters = ref({ supplier: '', status: '' })
const historyFilters = ref({ supplier: '', from_date: '', to_date: '' })
const reportFilters = ref({ from_date: '', to_date: '' })

const groupedPurchaseOrders = computed(() => {
  const groups = new Map()
  purchaseOrders.value.forEach(order => {
    const supplier = order.supplier
    if (!groups.has(supplier)) groups.set(supplier, { supplier, orders: [], totalAmount: 0 })
    const group = groups.get(supplier)
    group.orders.push(order)
    group.totalAmount += order.total_amount
  })
  for (const group of groups.values()) {
    group.orders.sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
  }
  return Array.from(groups.values()).sort((a, b) => a.supplier.localeCompare(b.supplier))
})

const toggleGroup = (s) => { 
  if (expandedGroups.value.has(s)) {
    expandedGroups.value.delete(s)
  } else {
    expandedGroups.value.add(s)
  }
  expandedGroups.value = new Set(expandedGroups.value)
}

const goToCreatePurchaseOrder = () => router.push('/purchases/create')
const viewOrderDetails = (o) => { selectedOrder.value = o; showOrderDetailsModal.value = true }

const receiveOrder = (o) => { 
  selectedOrder.value = o
  receiveQuantities.value = {}
  o.items.forEach(i => { receiveQuantities.value[i.id] = 0 })
  receiveDate.value = new Date().toISOString().split('T')[0]
  showReceiveModal.value = true
}

const reorderFromPurchase = (o) => {
  sessionStorage.setItem('reorderData', JSON.stringify({ 
    supplier: o.supplier, 
    supplier_id: o.supplier_id, 
    items: o.items.map(i => ({ 
      product_id: i.product_id, 
      product_name: i.product_name, 
      quantity: i.quantity_ordered, 
      unit_price: i.unit_cost 
    })) 
  }))
  router.push('/purchases/create')
}

const reorderFromHistory = (p) => {
  sessionStorage.setItem('reorderData', JSON.stringify({ 
    supplier: p.supplier_name || p.supplier, 
    supplier_id: p.supplier_id, 
    items: p.items.map(i => ({ 
      product_id: i.product_id, 
      product_name: i.product_name || i.product?.name, 
      quantity: i.quantity, 
      unit_price: i.unit_price 
    })) 
  }))
  router.push('/purchases/create')
}

const loadPurchaseOrders = async () => { 
  try { 
    purchaseOrders.value = (await purchaseService.getPurchaseOrders(filters.value)).data || [] 
  } catch (e) { 
    purchaseOrders.value = [] 
  } 
}

const loadPurchaseHistory = async () => { 
  try { 
    purchaseHistory.value = (await purchaseService.getPurchases(historyFilters.value)).data || [] 
  } catch (e) { 
    purchaseHistory.value = [] 
  } 
}

const loadReport = async () => { 
  try { 
    reportData.value = (await purchaseService.getPurchaseReport(reportFilters.value)).data 
  } catch (e) {} 
}

const submitReceive = async () => {
  const items = Object.entries(receiveQuantities.value)
    .filter(([_, q]) => q > 0)
    .map(([id, q]) => ({ 
      product_id: selectedOrder.value.items.find(i => i.id == parseInt(id)).product_id, 
      quantity_received: parseFloat(q) 
    }))
  
  if (items.length === 0) { 
    alert(t('purchases.enterItemAlert'))
    return 
  }
  
  try { 
    await purchaseService.receivePurchaseOrder(selectedOrder.value.id, { 
      items, 
      actual_delivery_date: receiveDate.value 
    })
    showReceiveModal.value = false
    await loadPurchaseOrders()
    alert(t('purchases.receiveSuccess'))
  } catch (e) { 
    alert(e.response?.data?.detail || t('purchases.receiveFailed'))
  }
}

const getStatusClass = (s) => ({ 
  pending: 'status-pending', 
  partially_received: 'status-partial', 
  completed: 'status-completed', 
  cancelled: 'status-cancelled' 
}[s] || 'status-pending')

const getStatusText = (s) => ({ 
  pending: t('purchases.pending'), 
  partially_received: t('purchases.partiallyReceived'), 
  completed: t('purchases.completed'), 
  cancelled: t('purchases.cancelled') 
}[s] || s)

onMounted(() => { 
  loadPurchaseOrders()
})
</script>

<style scoped>
/* VAT Cell Styles */
.vat-cell {
  font-family: monospace;
  min-width: 100px;
}

.vat-amount {
  color: #2FB8A6;
  font-weight: 500;
}

.vat-rate-badge {
  font-size: 11px;
  color: #6E8B90;
  margin-left: 4px;
}

.vat-none {
  color: #95a5a6;
  font-style: italic;
}

.total-highlight {
  color: #2FB8A6;
  font-size: 16px;
}

/* Keep all existing styles below */
.purchases-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn-primary {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.tabs {
  display: flex;
  gap: 8px;
  border-bottom: 2px solid #e2e8f0;
  margin-bottom: 24px;
}

.tab-btn {
  padding: 10px 20px;
  background: none;
  border: none;
  cursor: pointer;
  font-weight: 500;
  color: #718096;
  transition: all 0.3s ease;
}

.tab-btn:hover {
  color: #2FB8A6;
}

.tab-btn.active {
  color: #2FB8A6;
  border-bottom: 2px solid #2FB8A6;
  margin-bottom: -2px;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.search-input, .status-filter, .date-input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.search-input:focus, .status-filter:focus, .date-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
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
  padding: 12px !important;
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
  gap: 12px;
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
}

.group-count {
  font-size: 0.8rem;
  color: #6E8B90;
}

.group-total {
  font-size: 0.8rem;
  color: #2FB8A6;
  font-weight: 500;
}

.sub-order-row {
  background: rgba(255, 255, 255, 0.5);
}

.sub-order-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.order-number {
  font-family: monospace;
  font-size: 0.85rem;
  padding-left: 2rem !important;
}

.actions-cell {
  white-space: nowrap;
}

.action-buttons {
  display: flex;
  gap: 8px;
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

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: 6px;
  color: #718096;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  background: #e2e8f0;
}

.icon-btn.success {
  color: #4caf50;
}

.icon-btn.reorder {
  color: #2FB8A6;
}

.icon-btn.success:hover, .icon-btn.reorder:hover {
  background: rgba(47, 184, 166, 0.1);
}

/* Modal Styles */
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
}

.modal {
  background: white;
  border-radius: 12px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-large {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}

.modal-body {
  padding: 20px;
}

.modal-footer {
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  position: sticky;
  bottom: 0;
  background: white;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #718096;
}

.close-btn:hover {
  color: #1a1a1a;
}

.receive-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.item-info {
  flex: 1;
}

.item-info strong {
  display: block;
  margin-bottom: 4px;
  color: #1a1a1a;
}

.item-info div {
  font-size: 12px;
  color: #718096;
}

.item-input {
  min-width: 150px;
}

.item-input label {
  display: block;
  font-size: 12px;
  margin-bottom: 4px;
  color: #4a5568;
}

.quantity-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

.form-field {
  margin-top: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #4a5568;
}

.order-info {
  background: #f7fafc;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.order-info p {
  margin: 8px 0;
}

.items-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
}

.items-table th, .items-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.items-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.purchase-item {
  padding: 4px 0;
  font-size: 13px;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #718096;
}

/* Report Styles */
.report-filters {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.summary-card {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
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

.supplier-breakdown {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.supplier-breakdown h3 {
  margin-bottom: 16px;
  color: #1a1a1a;
}

.supplier-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #e2e8f0;
}

.supplier-item:last-child {
  border-bottom: none;
}

/* Responsive */
@media (max-width: 768px) {
  .purchases-container {
    padding: 16px;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .filters {
    flex-direction: column;
  }
  
  .search-input, .status-filter, .date-input {
    width: 100%;
  }
  
  .group-info {
    flex-wrap: wrap;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .modal {
    width: 95%;
    margin: 16px;
  }
  
  .data-table th, .data-table td {
    padding: 8px;
    font-size: 12px;
  }
}
</style>