<template>
  <aside :class="[
    'fixed lg:relative z-40 bg-white/80 backdrop-blur-glass w-64 h-screen transition-all duration-300',
    isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
  ]">
    <div class="p-6">
      <h2 class="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-8">
        Inventory System
      </h2>
      
      <nav class="space-y-1">
        <router-link
          v-for="item in menuItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200"
          :class="[$route.path === item.path ? 'bg-primary-50 text-primary-500' : 'text-secondary-500 hover:bg-gray-50']"
        >
          <component :is="item.icon" class="w-5 h-5" />
          <span>{{ item.name }}</span>
        </router-link>
      </nav>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import {
  HomeIcon,
  PackageIcon,
  StoreIcon,
  ArchiveIcon,
  ChartBarIcon,
  BellIcon,
  CashIcon
} from '@heroicons/vue/outline'

const route = useRoute()
const authStore = useAuthStore()
const isOpen = defineModel('isOpen', { default: true })

const menuItems = computed(() => {
  const items = [
    { path: '/dashboard', name: 'Dashboard', icon: HomeIcon }
  ]
  
  if (authStore.isAdmin) {
    items.push(
      { path: '/products', name: 'Products', icon: PackageIcon },
      { path: '/branches', name: 'Branches', icon: StoreIcon },
      { path: '/stock', name: 'Stock', icon: ArchiveIcon },
      { path: '/reports', name: 'Reports', icon: ChartBarIcon },
      { path: '/alerts', name: 'Alerts', icon: BellIcon }
    )
  } else if (authStore.isSalesman) {
    items.push(
      { path: '/products', name: 'Products', icon: PackageIcon },
      { path: '/sales', name: 'Sales', icon: CashIcon },
      { path: '/stock', name: 'Stock', icon: ArchiveIcon }
    )
  }
  
  return items
})
</script>