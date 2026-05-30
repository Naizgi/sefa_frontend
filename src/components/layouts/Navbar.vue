<template>
  <nav class="glass-card rounded-none sticky top-0 z-50">
    <div class="px-6 py-3 flex justify-between items-center">
      <div class="flex items-center gap-4">
        <button @click="$emit('toggle-sidebar')" class="lg:hidden btn-icon btn-icon-primary">
          <MenuIcon class="w-5 h-5" />
        </button>
        <h1 class="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          {{ title }}
        </h1>
      </div>
      
      <div class="flex items-center gap-4">
        <!-- Notifications -->
        <button class="btn-icon btn-icon-primary relative">
          <BellIcon class="w-5 h-5" />
          <span v-if="unreadCount" class="absolute -top-1 -right-1 w-4 h-4 bg-danger rounded-full text-white text-xs flex items-center justify-center">
            {{ unreadCount }}
          </span>
        </button>
        
        <!-- User Menu -->
        <div class="relative">
          <button @click="showDropdown = !showDropdown" class="flex items-center gap-3">
            <div class="avatar" :style="{ backgroundColor: avatarColor }">
              {{ userInitial }}
            </div>
            <span class="hidden md:inline text-secondary-700">{{ userName }}</span>
          </button>
          
          <div v-if="showDropdown" class="absolute right-0 mt-2 w-64 glass-card py-2 z-50 animate-fade-in">
            <div class="px-4 py-3 border-b border-gray-100">
              <p class="font-semibold text-secondary-800">{{ userName }}</p>
              <p class="text-sm text-secondary-500">{{ userRole }}</p>
            </div>
            <button @click="logout" class="w-full text-left px-4 py-2 text-danger hover:bg-gray-50 transition">
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { MenuIcon, BellIcon } from '@heroicons/vue/outline'

const props = defineProps({
  title: { type: String, default: 'Inventory System' },
  unreadCount: { type: Number, default: 0 }
})

const router = useRouter()
const authStore = useAuthStore()
const showDropdown = ref(false)

const userName = computed(() => authStore.userName)
const userRole = computed(() => authStore.userRole)
const userInitial = computed(() => userName.value?.charAt(0)?.toUpperCase() || 'U')

const avatarColors = ['#F472B6', '#34D399', '#FB923C', '#60A5FA']
const avatarColor = computed(() => {
  const index = (userName.value?.length || 0) % avatarColors.length
  return avatarColors[index]
})

const logout = () => {
  authStore.logout()
  router.push('/login')
}

defineEmits(['toggle-sidebar'])
</script>