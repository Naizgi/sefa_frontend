<template>
  <div class="branches-container">
    <!-- Animated Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div class="header-badge">
          <span class="badge-text">{{ $t('branches.storeManagement') }}</span>
        </div>
        <h1 class="page-title animate-fade-in">
          <span class="gradient-text">{{ $t('branches.title') }}</span>
        </h1>
        <p class="page-subtitle animate-fade-in-delayed">{{ $t('branches.subtitle') }}</p>
      </div>
      <button @click="openModal" class="btn-primary animate-scale">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        <span>{{ $t('branches.addBranch') }}</span>
      </button>
    </div>

    <!-- Advanced Search & Filter Bar -->
    <div class="search-section">
      <div class="search-container">
        <svg class="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input v-model="searchQuery" type="text" :placeholder="$t('branches.searchPlaceholder')" class="search-input" @input="filterBranches" />
        <button v-if="searchQuery" @click="resetFilters" class="clear-search">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div class="filter-chips">
        <button v-for="filter in filters" :key="filter.value" @click="activeFilter = filter.value" class="filter-chip" :class="{ 'active': activeFilter === filter.value }">
          {{ filter.label }}
          <span v-if="filter.count" class="filter-count">{{ filter.count }}</span>
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Modern Branches Grid -->
    <div v-else class="branches-grid">
      <div v-for="branch in paginatedBranches" :key="branch.id" class="branch-card">
        <div class="card-gradient"></div>
        <div class="card-content">
          <div class="branch-header">
            <div class="branch-avatar" :style="{ backgroundImage: `url(https://ui-avatars.com/api/?name=${encodeURIComponent(branch.name)}&background=2FB8A6&color=fff&bold=true)` }"></div>
            <div class="branch-actions">
              <button @click="editBranch(branch)" class="action-icon edit" :title="$t('branches.editBranch')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button @click="deleteBranch(branch)" class="action-icon delete" :title="$t('branches.deleteBranch')">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
          
          <h3 class="branch-name">{{ branch.name }}</h3>
          
          <div class="branch-details">
            <div class="detail-item" v-if="branch.address">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{{ truncate(branch.address, 40) }}</span>
            </div>
            <div class="detail-item" v-if="branch.phone">
              <svg class="detail-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>{{ branch.phone }}</span>
            </div>
          </div>
          
          <div class="branch-stats">
            <div class="stat-badge">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>{{ formatDate(branch.created_at) }}</span>
            </div>
          </div>
          
          <router-link :to="`/stock?branch=${branch.id}`" class="view-stock-btn">
            <span>{{ $t('branches.viewStock') }}</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </router-link>
        </div>
      </div>

      <!-- Enhanced Empty State -->
      <div v-if="filteredBranches.length === 0" class="empty-state">
        <div class="empty-state-content">
          <div class="empty-icon-wrapper">
            <svg class="empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <h3>{{ $t('branches.noBranches') }}</h3>
          <p>{{ searchQuery ? $t('branches.tryAdjustingSearch') : $t('branches.getStarted') }}</p>
          <button v-if="!searchQuery" @click="openModal" class="btn-primary-sm">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {{ $t('branches.createBranch') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button @click="currentPage--" :disabled="currentPage === 1" class="page-btn">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <div class="page-numbers">
        <button v-for="page in displayedPages" :key="page" @click="currentPage = page" class="page-number" :class="{ 'active': currentPage === page }">{{ page }}</button>
      </div>
      <button @click="currentPage++" :disabled="currentPage === totalPages" class="page-btn">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>

    <!-- Modern Modal -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header">
            <h2 class="modal-title">{{ editing ? $t('branches.editBranch') : $t('branches.addBranch') }}</h2>
            <button @click="closeModal" class="modal-close">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <form @submit.prevent="saveBranch" class="modal-form">
            <div class="form-group">
              <label class="form-label">{{ $t('branches.branchName') }} *</label>
              <div class="input-wrapper">
                <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" />
                </svg>
                <input v-model="form.name" type="text" class="form-input" required :placeholder="$t('branches.branchNamePlaceholder')" />
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('branches.address') }}</label>
              <div class="input-wrapper">
                <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                <textarea v-model="form.address" rows="3" class="form-textarea" :placeholder="$t('branches.addressPlaceholder')"></textarea>
              </div>
            </div>
            
            <div class="form-group">
              <label class="form-label">{{ $t('branches.phone') }}</label>
              <div class="input-wrapper">
                <svg class="input-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <input v-model="form.phone" type="tel" class="form-input" placeholder="+1 (555) 123-4567" />
              </div>
            </div>
            
            <div class="modal-actions">
              <button type="button" @click="closeModal" class="btn-secondary">{{ $t('common.cancel') }}</button>
              <button type="submit" class="btn-primary">{{ editing ? $t('branches.updateBranch') : $t('branches.createBranch') }}</button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'
import { formatDate } from '@/utils/format'

const { t } = useI18n()

const loading = ref(false)
const branches = ref([])
const searchQuery = ref('')
const activeFilter = ref('all')
const showModal = ref(false)
const editing = ref(false)
const currentPage = ref(1)
const itemsPerPage = 6
const form = ref({ name: '', address: '', phone: '' })

const filters = computed(() => [{ label: t('branches.allBranches'), value: 'all', count: branches.value.length }])

const filteredBranches = computed(() => {
  let filtered = branches.value
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(branch => branch.name.toLowerCase().includes(query) || (branch.address && branch.address.toLowerCase().includes(query)) || (branch.phone && branch.phone.includes(query)))
  }
  return filtered
})

const totalPages = computed(() => Math.ceil(filteredBranches.value.length / itemsPerPage))
const paginatedBranches = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  const end = start + itemsPerPage
  return filteredBranches.value.slice(start, end)
})

const displayedPages = computed(() => {
  const pages = []; const maxVisible = 5
  let start = Math.max(1, currentPage.value - Math.floor(maxVisible / 2))
  let end = Math.min(totalPages.value, start + maxVisible - 1)
  if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const fetchBranches = async () => {
  loading.value = true
  try { const response = await api.get('/branches'); branches.value = response.data } catch (error) { branches.value = [] } finally { loading.value = false }
}

const openModal = () => { editing.value = false; form.value = { name: '', address: '', phone: '' }; showModal.value = true }
const closeModal = () => { showModal.value = false }

const editBranch = (branch) => { editing.value = true; form.value = { id: branch.id, name: branch.name, address: branch.address || '', phone: branch.phone || '' }; showModal.value = true }

const saveBranch = async () => {
  try {
    const data = { name: form.value.name, address: form.value.address, phone: form.value.phone }
    if (editing.value) await api.put(`/branches/${form.value.id}`, data)
    else await api.post('/branches', data)
    await fetchBranches(); closeModal()
  } catch (error) { alert(error.response?.data?.detail || t('branches.saveFailed')) }
}

const deleteBranch = async (branch) => {
  if (confirm(t('branches.deleteConfirm', { name: branch.name }))) {
    try { await api.delete(`/branches/${branch.id}`); await fetchBranches() }
    catch (error) { alert(error.response?.data?.detail || t('branches.deleteFailed')) }
  }
}

const filterBranches = () => { currentPage.value = 1 }
const resetFilters = () => { searchQuery.value = ''; activeFilter.value = 'all'; currentPage.value = 1 }
const truncate = (text, length) => text ? (text.length > length ? text.substring(0, length) + '...' : text) : ''

onMounted(() => { fetchBranches() })
</script>

<style scoped>
/* Keep all your existing styles, just add loading state */
.loading-state {
  text-align: center;
  padding: 4rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 3px solid rgba(47, 184, 166, 0.2);
  border-top-color: #2FB8A6;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Keep all your existing styles from your original file */
.branches-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

/* Header Section */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3rem;
  flex-wrap: wrap;
  gap: 1.5rem;
}

.header-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 20px;
  margin-bottom: 1rem;
}

.badge-text {
  font-size: 0.75rem;
  font-weight: 600;
  color: #2FB8A6;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.page-title {
  font-size: clamp(1.8rem, 5vw, 2.5rem);
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.gradient-text {
  background: linear-gradient(135deg, #2FB8A6, #1F8A7C);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.page-subtitle {
  color: #4a5568;
  font-size: 1rem;
  max-width: 500px;
}

/* Search Section */
.search-section {
  background: white;
  border-radius: 20px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.search-container {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #a0aec0;
}

.search-input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.clear-search {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  color: #a0aec0;
  padding: 0.25rem;
}

.filter-chips {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filter-chip {
  padding: 0.5rem 1rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 30px;
  font-size: 0.875rem;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-chip:hover {
  background: #edf2f7;
}

.filter-chip.active {
  background: #2FB8A6;
  border-color: #2FB8A6;
  color: white;
}

.filter-count {
  background: rgba(0, 0, 0, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-size: 0.75rem;
}

/* Branches Grid */
.branches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.branch-card {
  position: relative;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.branch-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
}

.card-gradient {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
}

.card-content {
  padding: 1.5rem;
}

.branch-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.branch-avatar {
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background-size: cover;
  background-position: center;
}

.branch-actions {
  display: flex;
  gap: 0.5rem;
}

.action-icon {
  padding: 0.5rem;
  border: none;
  background: #f7fafc;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s ease;
  color: #4a5568;
}

.action-icon:hover {
  transform: scale(1.1);
}

.action-icon.edit:hover {
  background: #2FB8A6;
  color: white;
}

.action-icon.delete:hover {
  background: #f56565;
  color: white;
}

.branch-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2a2e;
  margin-bottom: 0.75rem;
}

.branch-details {
  margin-bottom: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: #4a5568;
}

.detail-icon {
  width: 1rem;
  height: 1rem;
  color: #2FB8A6;
  flex-shrink: 0;
}

.branch-stats {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 0.75rem;
  color: #718096;
  background: #f7fafc;
  padding: 0.375rem 0.75rem;
  border-radius: 20px;
}

.view-stock-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #2FB8A6;
  font-weight: 600;
  font-size: 0.875rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.view-stock-btn:hover {
  gap: 0.75rem;
  color: #1F8A7C;
}

/* Empty State */
.empty-state {
  grid-column: 1 / -1;
  text-align: center;
  padding: 4rem 2rem;
}

.empty-state-content {
  max-width: 400px;
  margin: 0 auto;
}

.empty-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.1), rgba(111, 211, 195, 0.1));
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-icon {
  width: 48px;
  height: 48px;
  color: #2FB8A6;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2a2e;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #718096;
  margin-bottom: 1.5rem;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-btn {
  padding: 0.5rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #2FB8A6;
  border-color: #2FB8A6;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.5rem;
}

.page-number {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #e2e8f0;
  background: white;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-number:hover {
  background: #f7fafc;
}

.page-number.active {
  background: #2FB8A6;
  border-color: #2FB8A6;
  color: white;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 14px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(47, 184, 166, 0.3);
}

.btn-primary-sm {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #4a5568;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #edf2f7;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-container {
  background: white;
  border-radius: 28px;
  width: 90%;
  max-width: 500px;
  max-height: 85vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a2a2e;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 10px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f7fafc;
}

.modal-form {
  padding: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #1a2a2e;
  margin-bottom: 0.5rem;
}

.input-wrapper {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 0.875rem;
  width: 1.125rem;
  height: 1.125rem;
  color: #a0aec0;
}

.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 2px solid #e2e8f0;
  border-radius: 14px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-textarea {
  padding-left: 2.75rem;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* Animations */
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

.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

/* Responsive Design */
@media (max-width: 768px) {
  .branches-container {
    padding: 1rem;
  }
  
  .header-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .branches-grid {
    grid-template-columns: 1fr;
  }
  
  .filter-chips {
    overflow-x: auto;
    flex-wrap: nowrap;
    padding-bottom: 0.5rem;
  }
  
  .page-numbers {
    display: none;
  }
}

@media (max-width: 480px) {
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
}

@media (hover: hover) {
  .branch-card:hover {
    transform: translateY(-8px);
  }
}
</style>