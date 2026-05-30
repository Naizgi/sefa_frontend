<template>
  <div class="users-container">
    <!-- Loading State -->
    <div v-if="loading" class="loading-overlay">
      <div class="spinner"></div>
      <p>{{ $t('common.loading') }}</p>
    </div>

    <!-- Access Denied -->
    <div v-else-if="!authStore.isAdmin && authStore.isInitialized" class="access-denied glass-card">
      <div class="denied-content">
        <svg class="denied-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z" />
        </svg>
        <h2>{{ $t('auth.accessDenied') }}</h2>
        <p>{{ $t('users.accessDeniedMessage') }}</p>
        <p class="debug-role">{{ $t('users.yourRole') }}: {{ authStore.userRole || $t('common.unknown') }}</p>
        <button @click="goBack" class="btn-primary">{{ $t('common.goBack') }}</button>
      </div>
    </div>

    <!-- Admin Content -->
    <template v-else>
      <!-- Header Section -->
      <div class="header-section">
        <div>
          <h1 class="page-title">{{ $t('users.title') }}</h1>
          <p class="page-subtitle">{{ $t('users.subtitle') }}</p>
        </div>
        <button @click="openModal" class="btn-primary" :disabled="userStore.loading">
          <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          {{ $t('users.addUser') }}
        </button>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card" v-for="stat in statsCards" :key="stat.title">
          <div class="stat-icon" :class="stat.iconClass"><component :is="stat.icon" /></div>
          <div class="stat-info"><p class="stat-value">{{ stat.value }}</p><p class="stat-label">{{ $t(stat.translationKey) }}</p></div>
        </div>
      </div>

      <!-- Search and Filter Bar -->
      <div class="filter-bar glass-card">
        <div class="filter-group">
          <div class="search-wrapper">
            <svg class="search-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input v-model="searchQuery" type="text" :placeholder="$t('users.searchPlaceholder')" class="search-input" @keyup.enter="filterUsers" />
          </div>
          <select v-model="roleFilter" class="filter-select" @change="filterUsers">
            <option value="">{{ $t('users.allRoles') }}</option>
            <option value="admin">{{ $t('users.administrators') }}</option>
            <option value="privileged_sales">{{ $t('users.privilegedSales') }}</option>
            <option value="salesman">{{ $t('users.salesAssociates') }}</option>
          </select>
          <select v-model="statusFilter" class="filter-select" @change="filterUsers">
            <option value="">{{ $t('users.allStatus') }}</option>
            <option value="active">{{ $t('common.active') }}</option>
            <option value="inactive">{{ $t('common.inactive') }}</option>
          </select>
          <button @click="filterUsers" class="filter-btn" :disabled="userStore.loading">
            <svg class="filter-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            {{ $t('common.search') }}
          </button>
          <button @click="resetFilters" class="filter-btn-reset">
            <svg class="filter-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            {{ $t('common.reset') }}
          </button>
        </div>
      </div>

      <!-- Error State -->
      <div v-if="error" class="error-state glass-card">
        <svg class="error-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h3>{{ $t('users.failedToLoad') }}</h3><p>{{ error }}</p>
        <button @click="fetchUsers" class="btn-primary-sm">{{ $t('common.tryAgain') }}</button>
      </div>

      <!-- Users Table -->
      <div v-else class="users-table-container glass-card">
        <div class="table-header"><h3 class="table-title">{{ $t('users.systemUsers') }}</h3><span class="table-count">{{ filteredUsers.length }} {{ $t('users.users') }}</span></div>
        <div class="overflow-x-auto">
          <table class="users-table">
            <thead><tr><th>{{ $t('users.user') }}</th><th>{{ $t('common.email') }}</th><th>{{ $t('users.role') }}</th><th>{{ $t('users.branch') }}</th><th>{{ $t('common.status') }}</th><th class="text-right">{{ $t('common.actions') }}</th></tr></thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.id" class="user-row">
                <td><div class="user-cell"><div class="user-avatar" :style="{ background: getAvatarColor(user.name) }">{{ getUserInitials(user.name) }}</div><div><p class="user-name">{{ user.name }}</p><p class="user-id">ID: {{ user.id }}</p></div></div></td>
                <td class="user-email">{{ user.email }}</td>
                <td><span :class="getRoleBadgeClass(user.role)" class="role-badge"><span class="role-dot" :class="user.role"></span>{{ formatRole(user.role) }}</span></td>
                <td class="user-branch"><svg class="branch-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1" /></svg>{{ getBranchName(user.branch_id) }}</td>
                <td><span :class="user.active ? 'status-active' : 'status-inactive'" class="status-badge"><span class="status-dot" :class="{ active: user.active }"></span>{{ user.active ? $t('common.active') : $t('common.inactive') }}</span></td>
                <td class="actions-cell">
                  <div class="action-buttons">
                    <button @click="editUser(user)" class="action-btn edit-btn" :title="$t('users.editUser')"><svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                    
                    <!-- NEW: Grant Privileges Button - Only visible for salesman users -->
                    <button v-if="user.role === 'salesman' && user.id !== currentUserId" @click="grantPrivileges(user)" class="action-btn grant-privilege-btn" :title="$t('users.grantPrivileges')">
                      <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </button>
                    
                    <!-- NEW: Revoke Privileges Button - Only visible for privileged_sales users -->
                    <button v-if="user.role === 'privileged_sales' && user.id !== currentUserId" @click="revokePrivileges(user)" class="action-btn revoke-privilege-btn" :title="$t('users.revokePrivileges')">
                      <svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                    
                    <button v-if="user.id !== currentUserId" @click="toggleUserStatus(user)" class="action-btn status-toggle-btn" :title="user.active ? $t('users.deactivateUser') : $t('users.activateUser')"><svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path v-if="user.active" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /><path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg></button>
                    <button v-if="user.id !== currentUserId" @click="resetUserPassword(user)" class="action-btn reset-pwd-btn" :title="$t('users.resetPassword')"><svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg></button>
                    <button v-if="user.id !== currentUserId" @click="deleteUser(user)" class="action-btn delete-btn" :title="$t('users.deleteUser')"><svg class="action-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                  </div>
                </td>
              </tr>
              <tr v-if="!filteredUsers.length && !userStore.loading"><td colspan="6" class="empty-table-state"><svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg><p>{{ searchQuery ? $t('users.noMatchSearch') : $t('users.noUsersFound') }}</p></td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Modal -->
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal-container">
          <div class="modal-header"><h2 class="modal-title">{{ editing ? $t('users.editUser') : $t('users.addUser') }}</h2><button @click="closeModal" class="modal-close"><svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg></button></div>
          <form @submit.prevent="saveUser" class="modal-form">
            <div v-if="saveError" class="error-message">{{ saveError }}</div>
            <div class="form-grid">
              <div class="form-field"><label class="form-label">{{ $t('users.fullName') }} *</label><input v-model="form.name" type="text" class="form-input" required :placeholder="$t('users.namePlaceholder')" :disabled="saving" /></div>
              <div class="form-field"><label class="form-label">{{ $t('users.emailAddress') }} *</label><input v-model="form.email" type="email" class="form-input" required :placeholder="$t('users.emailPlaceholder')" :disabled="saving" /></div>
            </div>
            <div v-if="!editing" class="form-field"><label class="form-label">{{ $t('users.password') }} *</label><input v-model="form.password" type="password" class="form-input" required :placeholder="$t('users.passwordPlaceholder')" :disabled="saving" /></div>
            <div class="form-grid">
              <div class="form-field"><label class="form-label">{{ $t('users.role') }} *</label><select v-model="form.role" class="form-input" required :disabled="saving">
                <option value="">{{ $t('users.selectRole') }}</option>
                <option value="admin">{{ $t('sidebar.administrator') }}</option>
                <option value="privileged_sales">{{ $t('users.privilegedSales') }}</option>
                <option value="salesman">{{ $t('sidebar.salesAssociate') }}</option>
              </select>
              <p class="role-help-text" v-if="form.role === 'privileged_sales'">{{ $t('users.privilegedSalesHelp') }}</p>
              </div>
              <div class="form-field"><label class="form-label">{{ $t('users.branchId') }}</label><input v-model.number="form.branch_id" type="number" class="form-input" :placeholder="$t('users.branchIdPlaceholder')" :disabled="saving" /></div>
            </div>
            <div class="form-field"><label class="checkbox-label"><input v-model="form.active" type="checkbox" class="checkbox-input" :disabled="saving" /><span class="checkbox-text">{{ $t('users.activeAccount') }}</span></label></div>
            <div class="modal-actions"><button type="button" @click="closeModal" class="btn-secondary" :disabled="saving">{{ $t('common.cancel') }}</button><button type="submit" class="btn-primary" :disabled="saving"><span v-if="saving" class="spinner-small"></span><span v-else>{{ editing ? $t('users.updateUser') : $t('users.createUser') }}</span></button></div>
          </form>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import api from '@/services/api'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()
const userStore = useUserStore()

const loading = ref(true)
const searchQuery = ref('')
const roleFilter = ref('')
const statusFilter = ref('')
const showModal = ref(false)
const editing = ref(false)
const saving = ref(false)
const saveError = ref('')
const form = ref({ id: null, name: '', email: '', password: '', role: '', branch_id: null, active: true })

// Icons for stats cards
const UsersIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' })])
const ActiveIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' })])
const AdminIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' })])
const PrivilegedIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z' })])
const SalesIcon = () => h('svg', { fill: 'none', stroke: 'currentColor', viewBox: '0 0 24 24', class: 'stat-svg-icon' }, [h('path', { 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-width': '2', d: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1' })])

const statsCards = computed(() => [
  { translationKey: 'users.totalUsers', title: 'Total Users', value: users.value.length, icon: UsersIcon, iconClass: 'bg-teal-100 text-teal-600' },
  { translationKey: 'users.activeUsers', title: 'Active Users', value: activeUsersCount.value, icon: ActiveIcon, iconClass: 'bg-green-100 text-green-600' },
  { translationKey: 'users.administrators', title: 'Administrators', value: adminCount.value, icon: AdminIcon, iconClass: 'bg-purple-100 text-purple-600' },
  { translationKey: 'users.privilegedSales', title: 'Privileged Sales', value: privilegedCount.value, icon: PrivilegedIcon, iconClass: 'bg-yellow-100 text-yellow-600' },
  { translationKey: 'users.salesAssociates', title: 'Sales Associates', value: salesmanCount.value, icon: SalesIcon, iconClass: 'bg-blue-100 text-blue-600' }
])

const users = computed(() => userStore.users)
const error = computed(() => userStore.error)
const currentUserId = computed(() => authStore.user?.id)
const activeUsersCount = computed(() => users.value.filter(u => u.active).length)
const adminCount = computed(() => users.value.filter(u => u.role === 'admin').length)
const privilegedCount = computed(() => users.value.filter(u => u.role === 'privileged_sales').length)
const salesmanCount = computed(() => users.value.filter(u => u.role === 'salesman').length)

const filteredUsers = computed(() => {
  let filtered = [...users.value]
  if (searchQuery.value) { const q = searchQuery.value.toLowerCase(); filtered = filtered.filter(u => u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)) }
  if (roleFilter.value) filtered = filtered.filter(u => u.role === roleFilter.value)
  if (statusFilter.value) filtered = filtered.filter(u => u.active === (statusFilter.value === 'active'))
  return filtered
})

const formatRole = (r) => ({ 
  admin: t('sidebar.administrator'), 
  privileged_sales: t('users.privilegedSales'),
  salesman: t('sidebar.salesAssociate') 
}[r] || r)

const getRoleBadgeClass = (r) => ({ 
  admin: 'role-admin', 
  privileged_sales: 'role-privileged', 
  salesman: 'role-salesman' 
}[r] || 'role-default')

const getUserInitials = (n) => n ? n.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : 'U'
const getAvatarColor = (n) => ['#2FB8A6', '#6FD3C3', '#34D399', '#F472B6', '#60A5FA', '#A78BFA'][(n?.length || 0) % 6]
const getBranchName = (id) => id ? `${t('users.branch')} ${id}` : t('users.notAssigned')
const goBack = () => router.push('/dashboard')

const fetchUsers = async () => { if (!authStore.isAdmin) return; loading.value = true; try { await userStore.fetchUsers() } catch (e) {} finally { loading.value = false } }
const filterUsers = () => {}
const resetFilters = () => { searchQuery.value = ''; roleFilter.value = ''; statusFilter.value = '' }

const openModal = () => { editing.value = false; saveError.value = ''; form.value = { id: null, name: '', email: '', password: '', role: '', branch_id: null, active: true }; showModal.value = true }
const closeModal = () => { if (saving.value) return; showModal.value = false; saveError.value = '' }
const editUser = (u) => { editing.value = true; saveError.value = ''; form.value = { id: u.id, name: u.name, email: u.email, password: '', role: u.role, branch_id: u.branch_id, active: u.active }; showModal.value = true }

// NEW: Grant privileges to a salesman
const grantPrivileges = async (user) => {
  if (!confirm(t('users.grantPrivilegesConfirm', { name: user.name }))) return
  
  saving.value = true
  try {
    const data = { ...user, role: 'privileged_sales' }
    const r = await userStore.updateUser(user.id, data)
    if (r.success) {
      await fetchUsers()
      alert(t('users.privilegesGranted', { name: user.name }))
    } else {
      alert(r.error || t('users.grantFailed'))
    }
  } catch (e) {
    alert(t('users.unexpectedError'))
  } finally {
    saving.value = false
  }
}

// NEW: Revoke privileges from a privileged sales user
const revokePrivileges = async (user) => {
  if (!confirm(t('users.revokePrivilegesConfirm', { name: user.name }))) return
  
  saving.value = true
  try {
    const data = { ...user, role: 'salesman' }
    const r = await userStore.updateUser(user.id, data)
    if (r.success) {
      await fetchUsers()
      alert(t('users.privilegesRevoked', { name: user.name }))
    } else {
      alert(r.error || t('users.revokeFailed'))
    }
  } catch (e) {
    alert(t('users.unexpectedError'))
  } finally {
    saving.value = false
  }
}

const toggleUserStatus = async (u) => {
  const ns = !u.active; const action = ns ? t('users.activate') : t('users.deactivate')
  if (confirm(t('users.statusConfirm', { action, name: u.name }))) {
    const r = await userStore.updateUser(u.id, { ...u, active: ns })
    if (r.success) await fetchUsers(); else alert(r.error || t('users.statusFailed', { action }))
  }
}

const resetUserPassword = async (u) => {
  const np = prompt(t('users.enterNewPassword', { name: u.name }))
  if (np && np.length >= 6) { const r = await userStore.updateUser(u.id, { password: np }); if (r.success) alert(t('users.passwordReset')) ;else alert(r.error || t('users.passwordResetFailed')) }
  else if (np) alert(t('users.passwordMinLength'))
}

const saveUser = async () => {
  saving.value = true; saveError.value = ''
  try {
    const data = { ...form.value }; if (!data.password) delete data.password
    const r = editing.value ? await userStore.updateUser(form.value.id, data) : await userStore.createUser(form.value)
    if (r.success) { await fetchUsers(); closeModal() } else saveError.value = r.error || t('users.saveFailed')
  } catch (e) { saveError.value = t('users.unexpectedError') } finally { saving.value = false }
}

const deleteUser = async (u) => {
  if (!confirm(t('users.deleteConfirm', { name: u.name }))) return
  const r = await userStore.deleteUser(u.id); if (!r.success) alert(r.error || t('users.deleteFailed'))
}

onMounted(async () => { if (!authStore.isAuthenticated) { router.push('/login'); return }; if (!authStore.isAdmin) { loading.value = false; return }; await fetchUsers() })
</script>

<style scoped>
/* Keep all your existing styles and add these new ones */

/* NEW: Grant Privilege Button */
.grant-privilege-btn {
  color: #F59E0B;
}

.grant-privilege-btn:hover {
  background: rgba(245, 158, 11, 0.1);
  transform: scale(1.05);
}

/* NEW: Revoke Privilege Button */
.revoke-privilege-btn {
  color: #EF4444;
}

.revoke-privilege-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.05);
}

.role-privileged {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

.role-dot.privileged_sales {
  background: #F59E0B;
}

.role-help-text {
  font-size: 0.7rem;
  color: #F59E0B;
  margin-top: 0.25rem;
}

/* Add badge for privileged role in stats */
.stat-icon.bg-yellow-100 {
  background: rgba(245, 158, 11, 0.1);
}

.stat-icon.text-yellow-600 {
  color: #F59E0B;
}

/* Keep all other existing styles from your original file */
.users-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 0 2rem;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.stat-svg-icon {
  width: 24px;
  height: 24px;
}

.btn-svg-icon {
  width: 18px;
  height: 18px;
}

.search-svg-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  color: black;
}

.filter-svg-icon {
  width: 14px;
  height: 14px;
}

.action-svg-icon {
  width: 16px;
  height: 16px;
}

.branch-svg-icon {
  width: 14px;
  height: 14px;
  margin-right: 0.25rem;
}

.denied-svg-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 1rem;
  color: #F472B6;
}

.error-svg-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: #EF4444;
}

.empty-svg-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 1rem;
  color: black;
}

.modal-close-svg {
  width: 18px;
  height: 18px;
}

/* Action Buttons Group */
.action-buttons {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
  flex-wrap: wrap;
}

.action-btn {
  padding: 0.5rem;
  border: none;
  background: none;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-btn {
  color: #2FB8A6;
}

.edit-btn:hover {
  background: rgba(47, 184, 166, 0.1);
  transform: scale(1.05);
}

.status-toggle-btn {
  color: #F59E0B;
}

.status-toggle-btn:hover {
  background: rgba(245, 158, 11, 0.1);
  transform: scale(1.05);
}

.reset-pwd-btn {
  color: #3B82F6;
}

.reset-pwd-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  transform: scale(1.05);
}

.delete-btn {
  color: #EF4444;
}

.delete-btn:hover {
  background: rgba(239, 68, 68, 0.1);
  transform: scale(1.05);
}

/* Glass Card Effect */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
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

.bg-teal-100 { background: rgba(47, 184, 166, 0.1); }
.text-teal-600 { color: #2FB8A6; }
.bg-green-100 { background: rgba(52, 211, 153, 0.1); }
.text-green-600 { color: #34D399; }
.bg-purple-100 { background: rgba(167, 139, 250, 0.1); }
.text-purple-600 { color: #A78BFA; }
.bg-blue-100 { background: rgba(96, 165, 250, 0.1); }
.text-blue-600 { color: #60A5FA; }

.stat-value {
  font-size: 1.8rem;
  font-weight: 800;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.85rem;
  color: black;
}

/* Filter Bar */
.filter-bar {
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.filter-group {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
}

.search-wrapper {
  flex: 1;
  position: relative;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.filter-btn {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-btn-reset {
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Users Table */
.users-table-container {
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.table-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1A2A2E;
}

.table-count {
  font-size: 0.8rem;
  color: black;
  background: rgba(110, 139, 144, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: 1rem;
  background: rgba(47, 184, 166, 0.05);
  color: black;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
}

.user-row {
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  transition: background 0.2s ease;
}

.user-row:hover {
  background: rgba(47, 184, 166, 0.03);
}

.user-row td {
  padding: 1rem;
  vertical-align: middle;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  flex-shrink: 0;
}

.user-name {
  font-weight: 600;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.user-id {
  font-size: 0.7rem;
  color: black;
}

.user-email {
  color: black;
  font-size: 0.85rem;
}

.user-branch {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: black;
}

.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-admin {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.role-salesman {
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
}

.role-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.role-dot.admin {
  background: #2FB8A6;
}

.role-dot.salesman {
  background: #60A5FA;
}

.role-dot.privileged_sales {
  background: #F59E0B;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-active {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.status-inactive {
  background: rgba(110, 139, 144, 0.1);
  color: black;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.status-dot.active {
  background: #34D399;
  animation: pulse 2s infinite;
}

.actions-cell {
  text-align: right;
  white-space: nowrap;
}

/* Modal */
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

.modal-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 90%;
  max-width: 550px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A2A2E;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: black;
  padding: 0.5rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
}

.modal-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.form-field {
  margin-bottom: 1rem;
}

.form-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 12px;
  background: white;
  font-size: 0.9rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.btn-primary {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: black;
  cursor: pointer;
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
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 0.5rem;
}

/* Access Denied */
.access-denied {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  margin: 2rem;
}

.denied-content {
  max-width: 400px;
  padding: 2rem;
}

/* Error State */
.error-state {
  text-align: center;
  padding: 3rem;
  margin: 2rem 0;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #EF4444;
  color: #EF4444;
  padding: 0.75rem;
  border-radius: 12px;
  margin-bottom: 1rem;
}

.empty-table-state {
  text-align: center;
  padding: 3rem !important;
  color: black;
}

.text-right {
  text-align: right;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.95); }
}

/* Responsive */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .action-btn {
    justify-content: center;
  }
}

@media (max-width: 640px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>