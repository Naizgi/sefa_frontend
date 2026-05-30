<template>
  <div class="main-layout">
    <!-- Header - Show when authenticated -->
    <Header v-if="isAuthenticated" />
    
    <div class="layout-container">
      <!-- Sidebar - Show when authenticated -->
      <RoleBasedSidebar v-if="isAuthenticated" />
      
      <!-- Main Content Area -->
      <main class="main-content" :class="{ 
        'with-sidebar': isAuthenticated,
        'without-sidebar': !isAuthenticated 
      }">
        <!-- Language Switcher - Top Right -->
        <div v-if="isAuthenticated" class="top-bar">
          <div class="top-bar-spacer"></div>
          <LanguageSwitcher />
        </div>
        
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Header from './Header.vue'
import RoleBasedSidebar from './RoleBasedSidebar.vue'
import LanguageSwitcher from '@/components/LanguageSwitcher.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isAuthenticated = computed(() => {
  const auth = authStore.isAuthenticated
  console.log('📊 MainLayout - isAuthenticated:', auth)
  return auth
})

onMounted(async () => {
  console.log('🏠 MainLayout mounted')
  console.log('Current route:', route.path)
  
  // Ensure auth is initialized
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  console.log('Final auth state:', { 
    isAuthenticated: isAuthenticated.value, 
    user: authStore.user 
  })
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #FFFFFF;
  position: relative;
  width: 100%;
  overflow-x: hidden;
}

.layout-container {
  display: flex;
  flex: 1;
  margin-top: 70px;
  min-height: calc(100vh - 70px);
  position: relative;
  width: 100%;
  z-index: 1;
}

.main-content {
  flex: 1;
  padding: 32px;
  background: transparent;
  min-height: calc(100vh - 70px);
  overflow-y: auto;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
}

.main-content.with-sidebar {
  margin-left: 280px;
  width: calc(100% - 280px);
}

.main-content.without-sidebar {
  margin-left: 0;
  width: 100%;
}

/* Top Bar with Language Switcher */
.top-bar {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
}

.top-bar-spacer {
  flex: 1;
}

@media (max-width: 1024px) {
  .main-content.with-sidebar {
    margin-left: 80px;
    width: calc(100% - 80px);
  }
}

@media (max-width: 768px) {
  .layout-container {
    margin-top: 60px;
  }
  
  .main-content.with-sidebar {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }
  
  .top-bar {
    margin-bottom: 12px;
    padding-bottom: 8px;
  }
}

/* Scrollbar */
.main-content::-webkit-scrollbar {
  width: 8px;
}

.main-content::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb {
  background: #6366F1;
  border-radius: 10px;
}

.main-content::-webkit-scrollbar-thumb:hover {
  background: #4F46E5;
}
</style>