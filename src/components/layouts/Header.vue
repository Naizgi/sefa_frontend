<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <!-- Burger Menu Button -->
        <button class="burger-menu-btn" @click="toggleSidebar" :class="{ 'active': sidebarOpen }">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <div class="logo-section">
          <div class="logo-icon">
            <img 
              :src="logoImage" 
              alt="Logo" 
              class="logo-img"
              @error="handleImageError"
            />
          </div>
          <div class="logo-text">
            <h1>{{ $t('common.appName') }}</h1>
            <p>{{ $t('common.stockManagement') }}</p>
          </div>
        </div>
      </div>
      
      <div class="header-right">
        <!-- Language Switcher -->
        <LanguageSwitcher />

        <!-- Notification Bell -->
        <div class="notification-bell">
          <button class="bell-btn" @click="toggleNotifications" :title="$t('alerts.title')">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="notification-dot" v-if="unreadNotifications > 0"></span>
          </button>
        </div>

        <!-- User Menu -->
        <div class="user-menu">
          <button class="user-btn" @click="showUserMenu = !showUserMenu" :title="$t('common.profile')">
            <div class="user-avatar" :style="avatarStyle">
              {{ userInitials }}
            </div>
            <div class="user-info">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">{{ userRole }}</span>
            </div>
            <svg class="w-4 h-4 dropdown-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          <transition name="dropdown">
            <div v-if="showUserMenu" class="user-dropdown">
              <div class="dropdown-header">
                <div class="dropdown-avatar" :style="avatarStyle">
                  {{ userInitials }}
                </div>
                <div class="dropdown-user-info">
                  <p class="dropdown-user-name">{{ userName }}</p>
                  <p class="dropdown-user-email">{{ userEmail }}</p>
                  <p class="dropdown-user-role">{{ userRole }}</p>
                </div>
              </div>
              <div class="dropdown-divider"></div>
              <router-link to="/profile" class="dropdown-item" @click="showUserMenu = false">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{{ $t('sidebar.profile') }}</span>
              </router-link>
              <router-link to="/settings" class="dropdown-item" @click="showUserMenu = false">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{{ $t('sidebar.settings') }}</span>
              </router-link>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item logout-item" @click.prevent="logout">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{{ $t('sidebar.logout') }}</span>
              </a>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useI18n } from 'vue-i18n'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'
import logo from '../../assets/logo.jpg'

const router = useRouter()
const authStore = useAuthStore()
const { t } = useI18n()
const showUserMenu = ref(false)
const sidebarOpen = ref(false)
const unreadNotifications = ref(3)
const logoImage = ref(logo)

const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value
  window.dispatchEvent(new CustomEvent('toggle-sidebar', { detail: { open: sidebarOpen.value } }))
}

const toggleNotifications = () => {
  console.log('Toggle notifications')
}

const handleImageError = () => {
  console.warn('Logo image failed to load, using fallback')
}

const userName = computed(() => {
  const name = authStore.user?.name || authStore.user?.username
  if (!name || name === 'Guest') return t('common.guestUser')
  return name
})

const userEmail = computed(() => authStore.user?.email || 'user@example.com')

const userRole = computed(() => {
  const role = authStore.userRole || authStore.user?.role
  const roles = {
    admin: t('sidebar.administrator'),
    salesman: t('sidebar.salesAssociate')
  }
  return roles[role] || role || t('common.user')
})

const userInitials = computed(() => {
  const name = userName.value
  if (!name || name === t('common.guestUser')) return 'GU'
  
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
})

const avatarStyle = computed(() => {
  const gradients = [
    'linear-gradient(135deg, #2FB8A6, #6FD3C3)',
    'linear-gradient(135deg, #F59E0B, #FBBF24)',
    'linear-gradient(135deg, #EF4444, #F87171)',
    'linear-gradient(135deg, #8B5CF6, #A78BFA)',
    'linear-gradient(135deg, #EC4899, #F472B6)',
    'linear-gradient(135deg, #06B6D4, #22D3EE)'
  ]
  
  const nameHash = userName.value.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const gradientIndex = nameHash % gradients.length
  
  return { background: gradients[gradientIndex] }
})

const logout = async () => {
  await authStore.logout()
  router.push('/login')
}

const handleClickOutside = (event) => {
  if (!event.target.closest('.user-menu')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(47, 184, 166, 0.2);
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.header-container {
  height: 100%;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Burger Menu Button */
.burger-menu-btn {
  display: none;
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border: none;
  border-radius: 10px;
  cursor: pointer;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(47, 184, 166, 0.3);
}

.burger-menu-btn span {
  width: 20px;
  height: 2px;
  background: white;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.burger-menu-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.burger-menu-btn.active span:nth-child(2) {
  opacity: 0;
}

.burger-menu-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(5px, -5px);
}

@media (max-width: 768px) {
  .burger-menu-btn {
    display: flex;
  }
}

/* Logo Section */
.logo-section {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 10px;
}

.logo-icon:hover {
  transform: scale(1.05);
}

.logo-text h1 {
  font-size: 1.1rem;
  font-weight: 700;
  margin: 0;
  color: #1A2A2E;
  line-height: 1.2;
}

.logo-text p {
  font-size: 0.65rem;
  margin: 0;
  color: #2FB8A6;
  letter-spacing: 0.5px;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* Notification Bell */
.notification-bell {
  position: relative;
}

.bell-btn {
  position: relative;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  color: #6E8B90;
  transition: all 0.3s ease;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bell-btn:hover {
  background: rgba(47, 184, 166, 0.1);
  color: #2FB8A6;
  transform: scale(1.05);
}

.notification-dot {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #EF4444;
  border-radius: 50%;
  border: 2px solid white;
  animation: pulse 2s infinite;
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: 40px;
  transition: all 0.3s ease;
  background: rgba(47, 184, 166, 0.08);
}

.user-btn:hover {
  background: rgba(47, 184, 166, 0.18);
  transform: translateY(-1px);
}

.user-avatar {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 0.9rem;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-info {
  text-align: left;
  display: none;
}

@media (min-width: 768px) {
  .user-info {
    display: block;
  }
}

.user-name {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #1A2A2E;
  line-height: 1.2;
}

.user-role {
  display: block;
  font-size: 0.65rem;
  color: #2FB8A6;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-icon {
  color: #6E8B90;
  transition: transform 0.3s ease;
}

.user-btn:hover .dropdown-icon {
  transform: rotate(180deg);
  color: #2FB8A6;
}

/* User Dropdown */
.user-dropdown {
  position: absolute;
  top: 52px;
  right: 0;
  width: 300px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(47, 184, 166, 0.2);
  overflow: hidden;
  z-index: 1002;
}

.dropdown-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px;
  background: linear-gradient(135deg, rgba(47, 184, 166, 0.08), rgba(111, 211, 195, 0.05));
  border-bottom: 1px solid rgba(47, 184, 166, 0.1);
}

.dropdown-avatar {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.dropdown-user-info {
  flex: 1;
}

.dropdown-user-name {
  font-size: 1rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 2px;
}

.dropdown-user-email {
  font-size: 0.7rem;
  color: #6E8B90;
  margin-bottom: 2px;
}

.dropdown-user-role {
  font-size: 0.65rem;
  color: #2FB8A6;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dropdown-divider {
  height: 1px;
  background: rgba(47, 184, 166, 0.1);
  margin: 4px 0;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 18px;
  color: #6E8B90;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
  font-size: 0.85rem;
}

.dropdown-item:hover {
  background: rgba(47, 184, 166, 0.08);
  color: #2FB8A6;
}

.dropdown-item svg {
  width: 18px;
  height: 18px;
  stroke: currentColor;
}

.logout-item {
  color: #EF4444;
}

.logout-item:hover {
  background: rgba(239, 68, 68, 0.08);
  color: #EF4444;
}

/* Dropdown Animation */
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.2);
    opacity: 0.7;
  }
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    height: 60px;
  }
  
  .header-container {
    padding: 0 12px;
  }
  
  .header-right {
    gap: 8px;
  }
  
  .logo-text {
    display: none;
  }
  
  .logo-icon {
    width: 32px;
    height: 32px;
  }
  
  .logo-img {
    width: 32px;
    height: 32px;
  }
  
  .user-btn {
    padding: 6px 8px;
  }
  
  .user-avatar {
    width: 34px;
    height: 34px;
    font-size: 0.8rem;
  }
  
  .user-dropdown {
    width: 280px;
    right: -10px;
  }
  
  .notification-bell {
    display: block;
  }
}

@media (max-width: 480px) {
  .notification-bell {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .user-btn {
    padding: 6px;
  }
  
  .user-avatar {
    width: 32px;
    height: 32px;
  }
  
  .dropdown-header {
    padding: 14px;
  }
  
  .dropdown-avatar {
    width: 44px;
    height: 44px;
    font-size: 0.9rem;
  }
  
  .dropdown-user-name {
    font-size: 0.85rem;
  }
  
  .dropdown-item {
    padding: 10px 14px;
    font-size: 0.8rem;
  }
}
</style>