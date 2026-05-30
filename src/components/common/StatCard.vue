<template>
  <div class="stat-card animate-slide-up">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-secondary-500 text-sm">{{ title }}</p>
        <p class="text-2xl font-bold text-secondary-800 mt-1">{{ value }}</p>
        <p v-if="trend" class="text-xs mt-2" :class="trendClass">
          {{ trend }}% from last month
        </p>
      </div>
      <div class="bg-primary-50 p-3 rounded-xl">
        <component :is="icon" class="w-6 h-6 text-primary-500" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: String,
  value: [String, Number],
  icon: Object,
  trend: Number
})

const trendClass = computed(() => {
  if (!props.trend) return ''
  return props.trend > 0 ? 'text-success' : 'text-danger'
})
</script>