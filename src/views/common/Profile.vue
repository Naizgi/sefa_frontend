<template>
  <div class="profile-page">
    <!-- Header -->
    <div class="page-header">
      <h1 class="page-title">{{ $t('profile.title') }}</h1>
      <p class="page-subtitle">{{ $t('profile.subtitle') }}</p>
    </div>

    <div class="profile-container">
      <!-- Profile Info Card -->
      <div class="profile-card glass-card">
        <div class="profile-avatar-section">
          <div class="profile-avatar" :style="avatarStyle">
            {{ userInitials }}
          </div>
          <button class="change-avatar-btn" @click="changeAvatar" :title="$t('profile.changeAvatar')">
            <svg class="avatar-btn-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
        
        <div class="profile-info-section">
          <div class="info-group">
            <label>{{ $t('profile.fullName') }}</label>
            <div class="info-value" v-if="!editing">
              <span>{{ user?.name || user?.full_name || '-' }}</span>
              <button class="edit-icon" @click="startEditing" :title="$t('common.edit')">
                <svg class="edit-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div class="info-value-edit" v-else>
              <input type="text" v-model="editForm.name" class="edit-input" :placeholder="$t('profile.enterFullName')">
            </div>
          </div>
          
          <div class="info-group">
            <label>{{ $t('profile.emailAddress') }}</label>
            <div class="info-value" v-if="!editing">
              <span>{{ user?.email || '-' }}</span>
            </div>
            <div class="info-value-edit" v-else>
              <input type="email" v-model="editForm.email" class="edit-input" :placeholder="$t('profile.enterEmail')">
            </div>
          </div>
          
          <div class="info-group">
            <label>{{ $t('profile.role') }}</label>
            <div class="info-value">
              <span class="role-badge" :class="user?.role">{{ formatRole(user?.role) }}</span>
            </div>
          </div>
          
          <div class="info-group">
            <label>{{ $t('profile.memberSince') }}</label>
            <div class="info-value">
              <span>{{ formatDate(user?.created_at) }}</span>
            </div>
          </div>
          
          <div class="info-group">
            <label>{{ $t('profile.lastLogin') }}</label>
            <div class="info-value">
              <span>{{ formatDateTime(user?.last_login) }}</span>
            </div>
          </div>
          
          <div class="edit-actions" v-if="editing">
            <button class="btn-primary btn-sm" @click="saveProfile" :disabled="saving">
              <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ saving ? $t('common.saving') : $t('profile.saveChanges') }}
            </button>
            <button class="btn-secondary btn-sm" @click="cancelEditing">{{ $t('common.cancel') }}</button>
          </div>
        </div>
      </div>

      <!-- Two Column Layout -->
      <div class="two-column-grid">
        <!-- Change Password Card -->
        <div class="password-card glass-card">
          <div class="card-header">
            <div class="card-icon">
              <svg class="card-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3>{{ $t('profile.changePassword') }}</h3>
          </div>
          
          <form @submit.prevent="changePassword">
            <div class="form-group">
              <label>{{ $t('profile.currentPassword') }}</label>
              <input type="password" v-model="passwordForm.current_password" required :placeholder="$t('profile.enterCurrentPassword')" class="form-input">
            </div>
            
            <div class="form-group">
              <label>{{ $t('profile.newPassword') }}</label>
              <input type="password" v-model="passwordForm.new_password" required :placeholder="$t('profile.enterNewPassword')" minlength="6" class="form-input">
            </div>
            
            <div class="form-group">
              <label>{{ $t('profile.confirmNewPassword') }}</label>
              <input type="password" v-model="passwordForm.confirm_password" required :placeholder="$t('profile.confirmPasswordPlaceholder')" class="form-input">
              <p v-if="passwordForm.new_password !== passwordForm.confirm_password && passwordForm.confirm_password" class="error-text">
                {{ $t('profile.passwordsDoNotMatch') }}
              </p>
            </div>
            
            <button type="submit" class="btn-primary w-full" :disabled="!isPasswordFormValid">
              <svg class="btn-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              {{ $t('profile.updatePassword') }}
            </button>
          </form>
        </div>

        <!-- Activity Log -->
        <div class="activity-card glass-card">
          <div class="card-header">
            <div class="card-icon">
              <svg class="card-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3>{{ $t('profile.recentActivity') }}</h3>
          </div>
          
          <div class="activity-list">
            <div v-for="activity in activities" :key="activity.id" class="activity-item">
              <div class="activity-icon" :class="activity.type">
                <svg class="activity-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getActivityIcon(activity.type)" />
                </svg>
              </div>
              <div class="activity-details">
                <div class="activity-description">{{ $t(activity.translationKey) || activity.description }}</div>
                <div class="activity-time">{{ formatRelativeTime(activity.time) }}</div>
              </div>
            </div>
            <div v-if="activities.length === 0" class="no-activities">
              <svg class="empty-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>{{ $t('profile.noRecentActivity') }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Session Management -->
      <div class="sessions-card glass-card">
        <div class="card-header">
          <div class="card-icon">
            <svg class="card-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3>{{ $t('profile.activeSessions') }}</h3>
        </div>
        
        <div class="sessions-list">
          <div v-for="session in activeSessions" :key="session.id" class="session-item">
            <div class="session-info">
              <div class="device-info">
                <svg class="session-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="getDeviceIcon(session.device)" />
                </svg>
                <span>{{ session.device }}</span>
              </div>
              <div class="location-info">
                <svg class="session-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{{ session.location }}</span>
              </div>
              <div class="session-time">
                <svg class="session-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{{ $t('profile.lastActive') }}: {{ formatRelativeTime(session.last_active) }}</span>
              </div>
            </div>
            <button v-if="!session.current" class="terminate-btn" @click="terminateSession(session)" :title="$t('profile.terminateSession')">
              <svg class="terminate-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
            </button>
            <span v-else class="current-badge">
              <svg class="badge-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              {{ $t('profile.currentSession') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Change Modal -->
    <div v-if="showAvatarModal" class="modal-overlay" @click.self="closeAvatarModal">
      <div class="modal-container">
        <div class="modal-header">
          <h2>{{ $t('profile.chooseAvatarColor') }}</h2>
          <button @click="closeAvatarModal" class="modal-close">
            <svg class="modal-close-svg" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div class="modal-body">
          <div class="avatar-options">
            <div v-for="color in avatarColors" :key="color" class="avatar-option" :style="{ background: color }" :class="{ active: selectedAvatarColor === color }" @click="selectAvatarColor(color)">
              {{ userInitials }}
            </div>
          </div>
          
          <div class="modal-actions">
            <button class="btn-secondary" @click="closeAvatarModal">{{ $t('common.cancel') }}</button>
            <button class="btn-primary" @click="saveAvatarColor">{{ $t('profile.saveChanges') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success Toast -->
    <transition name="toast">
      <div v-if="showToast" class="toast success">
        <svg class="toast-svg-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ toastMessage }}</span>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import api from '@/services/api'

export default {
  name: 'Profile',
  setup() {
    const authStore = useAuthStore()
    const { t } = useI18n()
    const showAvatarModal = ref(false)
    const showToast = ref(false)
    const toastMessage = ref('')
    const selectedAvatarColor = ref('')
    const editing = ref(false)
    const saving = ref(false)
    
    const passwordForm = ref({ current_password: '', new_password: '', confirm_password: '' })
    const editForm = ref({ name: '', email: '' })
    const user = computed(() => authStore.user)
    
    const userInitials = computed(() => {
      if (!user.value?.name && !user.value?.full_name && !user.value?.username) return 'GU'
      const name = user.value?.name || user.value?.full_name
      if (name) return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      return user.value?.username?.substring(0, 2).toUpperCase() || 'US'
    })
    
    const avatarStyle = computed(() => ({
      background: selectedAvatarColor.value || `linear-gradient(135deg, #2FB8A6, #6FD3C3)`
    }))
    
    const avatarColors = [
      'linear-gradient(135deg, #2FB8A6, #6FD3C3)',
      'linear-gradient(135deg, #34D399, #6FD3C3)',
      'linear-gradient(135deg, #60A5FA, #8B5CF6)',
      'linear-gradient(135deg, #F472B6, #F97316)',
      'linear-gradient(135deg, #A78BFA, #8B5CF6)',
      'linear-gradient(135deg, #F59E0B, #EF4444)'
    ]
    
    const isPasswordFormValid = computed(() => {
      return passwordForm.value.current_password && passwordForm.value.new_password && passwordForm.value.confirm_password &&
             passwordForm.value.new_password === passwordForm.value.confirm_password && passwordForm.value.new_password.length >= 6
    })
    
    const activities = ref([
      { id: 1, type: 'login', translationKey: 'profile.activityLoggedIn', description: 'Logged in from web browser', time: new Date(Date.now() - 1000 * 60 * 30) },
      { id: 2, type: 'sale', translationKey: 'profile.activityProcessedSale', description: 'Processed a sale of 3 items', time: new Date(Date.now() - 1000 * 60 * 60 * 2) },
      { id: 3, type: 'update', translationKey: 'profile.activityUpdatedProfile', description: 'Updated profile information', time: new Date(Date.now() - 1000 * 60 * 60 * 5) }
    ])
    
    const activeSessions = ref([
      { id: 1, device: 'Chrome on Windows', location: 'Addis Ababa, Ethiopia', last_active: new Date(), current: true },
      { id: 2, device: 'Safari on iPhone', location: 'Addis Ababa, Ethiopia', last_active: new Date(Date.now() - 1000 * 60 * 60 * 24), current: false }
    ])
    
    const formatRole = (role) => {
      if (!role) return ''
      return { admin: t('sidebar.administrator'), salesman: t('sidebar.salesAssociate') }[role] || role
    }
    
    const formatDate = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleDateString()
    }
    
    const formatDateTime = (date) => {
      if (!date) return 'N/A'
      return new Date(date).toLocaleString()
    }
    
    const formatRelativeTime = (date) => {
      const now = new Date()
      const diff = now - new Date(date)
      const minutes = Math.floor(diff / 60000)
      const hours = Math.floor(minutes / 60)
      const days = Math.floor(hours / 24)
      if (minutes < 1) return t('profile.justNow')
      if (minutes < 60) return t('profile.minutesAgo', { count: minutes })
      if (hours < 24) return t('profile.hoursAgo', { count: hours })
      return t('profile.daysAgo', { count: days })
    }
    
    const getActivityIcon = (type) => {
      const icons = {
        login: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
        sale: 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z',
        update: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
      }
      return icons[type] || 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    }
    
    const getDeviceIcon = (device) => {
      if (device.toLowerCase().includes('windows')) return 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
      if (device.toLowerCase().includes('mac')) return 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z'
      return 'M12 2v20M2 12h20'
    }
    
    const startEditing = () => { editForm.value = { name: user.value?.name || '', email: user.value?.email || '' }; editing.value = true }
    const cancelEditing = () => { editing.value = false; editForm.value = { name: '', email: '' } }
    
    const saveProfile = async () => {
      saving.value = true
      try {
        await api.put('/users/me', editForm.value)
        await authStore.fetchUser()
        showSuccessToast(t('profile.profileUpdated'))
        editing.value = false
      } catch (error) { showErrorToast(error.response?.data?.detail || t('profile.profileUpdateFailed')) }
      finally { saving.value = false }
    }
    
    const changePassword = async () => {
      if (passwordForm.value.new_password !== passwordForm.value.confirm_password) { showErrorToast(t('profile.passwordsDoNotMatch')); return }
      try {
        await api.post('/users/me/change-password', { current_password: passwordForm.value.current_password, new_password: passwordForm.value.new_password })
        showSuccessToast(t('profile.passwordChanged'))
        passwordForm.value = { current_password: '', new_password: '', confirm_password: '' }
      } catch (error) { showErrorToast(error.response?.data?.detail || t('profile.passwordChangeFailed')) }
    }
    
    const changeAvatar = () => { showAvatarModal.value = true }
    const selectAvatarColor = (color) => { selectedAvatarColor.value = color }
    
    const saveAvatarColor = () => {
      localStorage.setItem('avatar_color', selectedAvatarColor.value)
      showSuccessToast(t('profile.avatarUpdated'))
      closeAvatarModal()
    }
    
    const closeAvatarModal = () => { showAvatarModal.value = false }
    
    const terminateSession = async (session) => {
      const index = activeSessions.value.findIndex(s => s.id === session.id)
      if (index !== -1) activeSessions.value.splice(index, 1)
      showSuccessToast(t('profile.sessionTerminated'))
    }
    
    const showSuccessToast = (message) => { toastMessage.value = message; showToast.value = true; setTimeout(() => { showToast.value = false }, 3000) }
    const showErrorToast = (message) => { toastMessage.value = message; showToast.value = true; setTimeout(() => { showToast.value = false }, 3000) }
    
    onMounted(() => { const savedColor = localStorage.getItem('avatar_color'); if (savedColor) selectedAvatarColor.value = savedColor })
    
    return { user, passwordForm, editForm, editing, saving, showAvatarModal, showToast, toastMessage, userInitials, avatarStyle, avatarColors, selectedAvatarColor, activities, activeSessions, isPasswordFormValid, formatRole, formatDate, formatDateTime, formatRelativeTime, getActivityIcon, getDeviceIcon, startEditing, cancelEditing, saveProfile, changePassword, changeAvatar, selectAvatarColor, saveAvatarColor, closeAvatarModal, terminateSession }
  }
}
</script>

<style scoped>
/* Add these new styles for editing */
.edit-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  margin-left: 8px;
  color: #2FB8A6;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.edit-icon:hover {
  transform: scale(1.1);
  color: #6FD3C3;
}

.edit-svg-icon {
  width: 14px;
  height: 14px;
}

.info-value {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.info-value-edit {
  width: 100%;
}

.edit-input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid rgba(47, 184, 166, 0.2);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.edit-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.edit-actions {
  grid-column: 1 / -1;
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
}

.btn-sm {
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
}

/* Keep all your existing styles */
.profile-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}


.profile-page {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  animation: fadeIn 0.5s ease-out;
}

/* Icon Sizing */
.avatar-btn-svg {
  width: 16px;
  height: 16px;
}

.btn-svg-icon {
  width: 16px;
  height: 16px;
}

.card-svg-icon {
  width: 20px;
  height: 20px;
}

.activity-svg-icon {
  width: 16px;
  height: 16px;
}

.session-svg-icon {
  width: 14px;
  height: 14px;
}

.terminate-svg-icon {
  width: 14px;
  height: 14px;
}

.badge-svg-icon {
  width: 12px;
  height: 12px;
}

.modal-close-svg {
  width: 18px;
  height: 18px;
}

.toast-svg-icon {
  width: 18px;
  height: 18px;
}

.empty-svg-icon {
  width: 48px;
  height: 48px;
}

.page-header {
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  color: #6E8B90;
  font-size: 0.9rem;
}

/* Glass Card */
.glass-card {
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.8);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
}

/* Profile Card */
.profile-card {
  display: flex;
  gap: 2rem;
  flex-wrap: wrap;
  margin-bottom: 1.5rem;
}

.profile-avatar-section {
  position: relative;
  flex-shrink: 0;
}

.profile-avatar {
  width: 120px;
  height: 120px;
  border-radius: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 2rem;
  color: white;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.change-avatar-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 36px;
  height: 36px;
  border-radius: 18px;
  background: white;
  border: 1px solid rgba(47, 184, 166, 0.2);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #2FB8A6;
}

.change-avatar-btn:hover {
  background: #2FB8A6;
  color: white;
  transform: scale(1.05);
}

.profile-info-section {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.25rem;
}

.info-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-group label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #6E8B90;
}

.info-value {
  font-size: 0.95rem;
  color: #1A2A2E;
  font-weight: 500;
}

.role-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.role-badge.admin {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.role-badge.salesman {
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
}

/* Two Column Layout */
.two-column-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.card-icon {
  width: 40px;
  height: 40px;
  background: rgba(47, 184, 166, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2FB8A6;
  flex-shrink: 0;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1A2A2E;
  margin: 0;
}

/* Form Styles */
.form-group {
  margin-bottom: 1rem;
}

.form-group label {
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
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #2FB8A6;
  box-shadow: 0 0 0 3px rgba(47, 184, 166, 0.1);
}

.error-text {
  color: #EF4444;
  font-size: 0.7rem;
  margin-top: 0.25rem;
}

/* Activity List */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  transition: all 0.3s ease;
  flex-wrap: wrap;
}

.activity-item:hover {
  background: rgba(47, 184, 166, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.login {
  background: rgba(52, 211, 153, 0.1);
  color: #34D399;
}

.activity-icon.sale {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
}

.activity-icon.update {
  background: rgba(96, 165, 250, 0.1);
  color: #60A5FA;
}

.activity-details {
  flex: 1;
  min-width: 150px;
}

.activity-description {
  font-weight: 500;
  color: #1A2A2E;
  margin-bottom: 0.25rem;
}

.activity-time {
  font-size: 0.7rem;
  color: #6E8B90;
}

.no-activities {
  text-align: center;
  padding: 2rem;
  color: #6E8B90;
}

/* Sessions */
.sessions-card {
  margin-bottom: 1.5rem;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.session-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 12px;
  flex-wrap: wrap;
  gap: 1rem;
  transition: all 0.3s ease;
}

.session-item:hover {
  background: rgba(47, 184, 166, 0.05);
}

.session-info {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  flex: 1;
}

.device-info,
.location-info,
.session-time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  color: #6E8B90;
}

.terminate-btn {
  padding: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border: none;
  border-radius: 8px;
  color: #EF4444;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.terminate-btn:hover {
  background: rgba(239, 68, 68, 0.2);
  transform: scale(1.05);
}

.current-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  background: rgba(52, 211, 153, 0.1);
  border-radius: 20px;
  color: #34D399;
  font-size: 0.75rem;
  font-weight: 500;
}

/* Buttons */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(47, 184, 166, 0.3);
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: rgba(110, 139, 144, 0.1);
  border: 1px solid rgba(110, 139, 144, 0.2);
  border-radius: 12px;
  color: #6E8B90;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: rgba(110, 139, 144, 0.2);
}

.w-full {
  width: 100%;
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
  animation: fadeIn 0.2s ease;
}

.modal-container {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  width: 90%;
  max-width: 450px;
  max-height: 90vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.modal-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1A2A2E;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #6E8B90;
  padding: 0.5rem;
  border-radius: 8px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #1A2A2E;
}

.modal-body {
  padding: 1.5rem;
}

.avatar-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.avatar-option {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.5rem;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  margin: 0 auto;
  border: 3px solid transparent;
}

.avatar-option:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.avatar-option.active {
  border-color: #2FB8A6;
  transform: scale(1.05);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Toast */
.toast {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: #34D399;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
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

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 1rem;
  }
  
  .page-title {
    font-size: 1.4rem;
  }
  
  .profile-card {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .profile-info-section {
    grid-template-columns: 1fr;
  }
  
  .two-column-grid {
    grid-template-columns: 1fr;
  }
  
  .session-info {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .avatar-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .avatar-option {
    width: 80px;
    height: 80px;
    font-size: 1.2rem;
  }
  
  .profile-avatar {
    width: 100px;
    height: 100px;
    font-size: 1.5rem;
  }
  
  .btn-primary, .btn-secondary {
    padding: 0.5rem 1rem;
  }
  
  .btn-svg-icon {
    width: 14px;
    height: 14px;
  }
  
  .activity-item {
    flex-direction: column;
    text-align: center;
  }
  
  .activity-icon {
    margin: 0 auto;
  }
}

@media (max-width: 480px) {
  .card-header {
    flex-direction: column;
    text-align: center;
  }
  
  .session-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .terminate-btn, .current-badge {
    align-self: flex-end;
  }
  
  .avatar-options {
    grid-template-columns: 1fr;
  }
  
  .modal-container {
    width: 95%;
    margin: 1rem;
  }
}
</style>