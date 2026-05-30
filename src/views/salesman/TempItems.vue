<template>
  <div class="temp-items-container">
    <div class="page-header">
      <div>
        <h1 class="page-title">{{ $t('tempItems.title') }}</h1>
        <p class="page-subtitle">{{ $t('tempItems.subtitle') }}</p>
      </div>
      <button @click="openRegisterModal" class="btn-primary">
        <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        {{ $t('tempItems.registerItem') }}
      </button>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-icon bg-teal-100">
          <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <div>
          <p class="stat-value">{{ stats.total }}</p>
          <p class="stat-label">{{ $t('tempItems.totalItems') }}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon bg-orange-100">
          <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div>
          <p class="stat-value">{{ stats.pending }}</p>
          <p class="stat-label">{{ $t('tempItems.pending') }}</p>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-icon bg-green-100">
          <svg class="stat-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div>
          <p class="stat-value">{{ stats.received }}</p>
          <p class="stat-label">{{ $t('tempItems.received') }}</p>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="filter-bar glass-card">
      <div class="filter-group">
        <div class="search-wrapper">
          <svg class="search-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input v-model="filters.search" type="text" :placeholder="$t('tempItems.searchPlaceholder')" class="search-input" @input="loadItems" />
        </div>
        <select v-model="filters.status" class="filter-select" @change="loadItems">
          <option value="">{{ $t('tempItems.allStatus') }}</option>
          <option value="pending">{{ $t('tempItems.pending') }}</option>
          <option value="received">{{ $t('tempItems.received') }}</option>
        </select>
        <button @click="resetFilters" class="reset-btn">{{ $t('common.reset') }}</button>
      </div>
    </div>

    <!-- Items Table -->
    <div class="table-container glass-card">
      <div class="table-header">
        <h3>{{ $t('tempItems.myItems') }}</h3>
        <span class="record-count">{{ items.length }} {{ $t('common.records') }}</span>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>{{ $t('tempItems.itemNumber') }}</th>
              <th>{{ $t('tempItems.itemName') }}</th>
              <th>{{ $t('tempItems.quantity') }}</th>
              <th>{{ $t('sales.customer') }}</th>
              <th>{{ $t('tempItems.registered') }}</th>
              <th>{{ $t('common.status') }}</th>
              <th>{{ $t('common.actions') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.item_number }}</td>
              <td>{{ item.item_name }}</td>
              <td>{{ item.quantity }} {{ $t('common.units') }}</td>
              <td>{{ item.customer_name || '-' }}</td>
              <td>{{ formatDate(item.registered_at) }}</td>
              <td>
                <span :class="getStatusClass(item.status)" class="status-badge">
                  {{ getStatusText(item.status) }}
                </span>
              </td>
              <td class="actions-cell">
                <button @click="viewItem(item)" class="action-btn view" :title="$t('common.view')">
                  <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button v-if="item.status === 'pending'" @click="cancelItem(item)" class="action-btn cancel" :title="$t('common.cancel')">
                  <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </td>
            </tr>
            <tr v-if="items.length === 0">
              <td colspan="7" class="empty-table">{{ $t('tempItems.noItems') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Register Modal -->
    <div v-if="showRegisterModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ $t('tempItems.registerItem') }}</h2>
          <button @click="closeModal" class="modal-close">×</button>
        </div>
        <form @submit.prevent="submitItem" class="modal-form">
          <div class="form-group">
            <label>{{ $t('tempItems.itemName') }} *</label>
            <input v-model="form.item_name" type="text" class="form-input" required />
          </div>
          <div class="form-group">
            <label>{{ $t('common.description') }}</label>
            <textarea v-model="form.description" rows="3" class="form-textarea"></textarea>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>{{ $t('tempItems.quantity') }}</label>
              <input v-model.number="form.quantity" type="number" min="1" class="form-input" />
            </div>
            <div class="form-group">
              <label>{{ $t('tempItems.unitPrice') }}</label>
              <input v-model.number="form.unit_price" type="number" step="0.01" class="form-input" />
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>{{ $t('tempItems.customerName') }}</label>
              <input v-model="form.customer_name" type="text" class="form-input" />
            </div>
            <div class="form-group">
              <label>{{ $t('tempItems.customerPhone') }}</label>
              <input v-model="form.customer_phone" type="tel" class="form-input" />
            </div>
          </div>
          <div class="form-group">
            <label>{{ $t('common.notes') }}</label>
            <textarea v-model="form.notes" rows="2" class="form-textarea"></textarea>
          </div>
          <div class="modal-actions">
            <button type="button" @click="closeModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
            <button type="submit" class="btn-primary">{{ $t('tempItems.register') }}</button>
          </div>
        </form>
      </div>
    </div>

    <!-- View Modal -->
    <div v-if="showViewModal" class="modal-overlay" @click.self="closeViewModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ $t('tempItems.itemDetails') }}</h2>
          <button @click="closeViewModal" class="modal-close">×</button>
        </div>
        <div class="view-details" v-if="selectedItem">
          <div class="detail-row"><label>{{ $t('tempItems.itemNumber') }}:</label><span>{{ selectedItem.item_number }}</span></div>
          <div class="detail-row"><label>{{ $t('tempItems.itemName') }}:</label><span>{{ selectedItem.item_name }}</span></div>
          <div class="detail-row"><label>{{ $t('common.description') }}:</label><span>{{ selectedItem.description || '-' }}</span></div>
          <div class="detail-row"><label>{{ $t('tempItems.quantity') }}:</label><span>{{ selectedItem.quantity }} {{ $t('common.units') }}</span></div>
          <div class="detail-row"><label>{{ $t('tempItems.unitPrice') }}:</label><span>{{ formatCurrency(selectedItem.unit_price) }}</span></div>
          <div class="detail-row"><label>{{ $t('sales.customer') }}:</label><span>{{ selectedItem.customer_name || '-' }} {{ selectedItem.customer_phone ? '(' + selectedItem.customer_phone + ')' : '' }}</span></div>
          <div class="detail-row"><label>{{ $t('common.status') }}:</label><span :class="getStatusClass(selectedItem.status)" class="status-badge">{{ getStatusText(selectedItem.status) }}</span></div>
          <div class="detail-row"><label>{{ $t('tempItems.registeredBy') }}:</label><span>{{ selectedItem.registered_by }}</span></div>
          <div class="detail-row"><label>{{ $t('tempItems.registeredAt') }}:</label><span>{{ formatDateTime(selectedItem.registered_at) }}</span></div>
          <div v-if="selectedItem.received_by" class="detail-row"><label>{{ $t('tempItems.receivedBy') }}:</label><span>{{ selectedItem.received_by }}</span></div>
          <div v-if="selectedItem.received_at" class="detail-row"><label>{{ $t('tempItems.receivedAt') }}:</label><span>{{ formatDateTime(selectedItem.received_at) }}</span></div>
          <div class="detail-row"><label>{{ $t('common.notes') }}:</label><span>{{ selectedItem.notes || '-' }}</span></div>
        </div>
        <div class="modal-actions"><button @click="closeViewModal" class="btn-secondary">{{ $t('common.close') }}</button></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatCurrency, formatDate, formatDateTime } from '@/utils/format'

const { t } = useI18n()
const items = ref([])
const filters = ref({ search: '', status: '' })
const showRegisterModal = ref(false)
const showViewModal = ref(false)
const selectedItem = ref(null)
const form = ref({ item_name: '', description: '', quantity: 1, unit_price: null, customer_name: '', customer_phone: '', notes: '' })

const stats = computed(() => ({
  total: items.value.length,
  pending: items.value.filter(i => i.status === 'pending').length,
  received: items.value.filter(i => i.status === 'received').length
}))

const loadItems = async () => {
  try {
    const params = {}
    if (filters.value.search) params.search = filters.value.search
    if (filters.value.status) params.status = filters.value.status
    const response = await api.get('/temp-items', { params })
    items.value = response.data
  } catch (error) { console.error('Failed to load items:', error) }
}

const openRegisterModal = () => {
  form.value = { item_name: '', description: '', quantity: 1, unit_price: null, customer_name: '', customer_phone: '', notes: '' }
  showRegisterModal.value = true
}

const closeModal = () => { showRegisterModal.value = false }
const closeViewModal = () => { showViewModal.value = false; selectedItem.value = null }

const submitItem = async () => {
  try {
    await api.post('/temp-items', form.value)
    await loadItems()
    closeModal()
    alert(t('tempItems.registeredSuccess'))
  } catch (error) { alert(t('tempItems.registerFailed')) }
}

const viewItem = (item) => { selectedItem.value = item; showViewModal.value = true }

const cancelItem = async (item) => {
  if (confirm(t('tempItems.cancelConfirm', { name: item.item_name }))) {
    try {
      await api.put(`/temp-items/${item.id}/cancel`)
      await loadItems()
      alert(t('tempItems.cancelled'))
    } catch (error) { alert(t('tempItems.cancelFailed')) }
  }
}

const resetFilters = () => { filters.value = { search: '', status: '' }; loadItems() }
const getStatusClass = (s) => ({ pending: 'status-pending', received: 'status-received' }[s] || 'status-pending')
const getStatusText = (s) => ({ pending: t('tempItems.pending'), received: t('tempItems.received') }[s] || s)

onMounted(() => loadItems())
</script>

<style scoped>
.temp-items-container { padding: 24px; max-width: 1400px; margin: 0 auto; }
.page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
.page-title { font-size: 1.8rem; font-weight: 700; color: #1A2A2E; margin-bottom: 4px; }
.page-subtitle { color: #6E8B90; font-size: 0.9rem; }
.btn-svg-icon { width: 16px; height: 16px; }
.btn-primary { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; background: linear-gradient(135deg, #2FB8A6, #6FD3C3); border: none; border-radius: 12px; color: white; font-weight: 600; cursor: pointer; }
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 24px; }
.stat-card { display: flex; align-items: center; gap: 16px; padding: 20px; background: rgba(255,255,255,0.65); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); }
.stat-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.stat-svg-icon { width: 24px; height: 24px; }
.stat-value { font-size: 1.5rem; font-weight: 700; color: #1A2A2E; }
.stat-label { font-size: 0.75rem; color: #6E8B90; }
.filter-bar { padding: 16px; margin-bottom: 24px; background: rgba(255,255,255,0.65); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); }
.filter-group { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.search-wrapper { flex: 1; position: relative; }
.search-svg-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: #6E8B90; }
.search-input { width: 100%; padding: 10px 12px 10px 38px; border: 1px solid rgba(47,184,166,0.2); border-radius: 12px; background: white; }
.filter-select { padding: 10px 12px; border: 1px solid rgba(47,184,166,0.2); border-radius: 12px; background: white; min-width: 130px; }
.reset-btn { padding: 10px 20px; background: rgba(110,139,144,0.1); border: 1px solid rgba(110,139,144,0.2); border-radius: 12px; cursor: pointer; }
.table-container { padding: 20px; background: rgba(255,255,255,0.65); backdrop-filter: blur(20px); border-radius: 20px; border: 1px solid rgba(255,255,255,0.3); }
.table-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
.record-count { font-size: 0.75rem; color: #6E8B90; background: rgba(110,139,144,0.1); padding: 4px 12px; border-radius: 20px; }
.table-responsive { overflow-x: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th, .data-table td { padding: 12px; text-align: left; border-bottom: 1px solid rgba(0,0,0,0.05); }
.data-table th { background: rgba(47,184,166,0.05); font-weight: 600; font-size: 0.75rem; text-transform: uppercase; }
.status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 0.7rem; font-weight: 500; }
.status-pending { background: #fef5e7; color: #f39c12; }
.status-received { background: #e8f5e9; color: #4caf50; }
.actions-cell { display: flex; gap: 8px; }
.action-btn { background: none; border: none; cursor: pointer; padding: 6px; border-radius: 6px; }
.action-btn.view { color: #2FB8A6; }
.action-btn.cancel { color: #f44336; }
.action-svg-icon { width: 16px; height: 16px; }
.empty-table { text-align: center; padding: 40px; color: #6E8B90; }
.modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal-container { background: white; border-radius: 24px; width: 90%; max-width: 550px; max-height: 90vh; overflow-y: auto; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 20px 24px; border-bottom: 1px solid #e2e8f0; }
.modal-header h2 { font-size: 1.25rem; font-weight: 700; }
.modal-close { background: none; border: none; font-size: 24px; cursor: pointer; padding: 8px; }
.modal-form, .view-details { padding: 24px; }
.form-group { margin-bottom: 16px; }
.form-group label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 6px; }
.form-input, .form-textarea { width: 100%; padding: 10px 12px; border: 1px solid #e2e8f0; border-radius: 10px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.detail-row { display: flex; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
.detail-row label { width: 130px; font-weight: 500; color: #4a5568; }
.detail-row span { flex: 1; color: #1A2A2E; }
.modal-actions { display: flex; justify-content: flex-end; gap: 12px; padding: 16px 24px; border-top: 1px solid #e2e8f0; }
.btn-secondary { padding: 8px 16px; background: #e2e8f0; border: none; border-radius: 8px; cursor: pointer; }
@media (max-width: 768px) { .temp-items-container { padding: 16px; } .form-row { grid-template-columns: 1fr; } }
</style>