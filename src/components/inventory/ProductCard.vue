<template>
  <div class="glass-card-hover p-4 cursor-pointer" @click="$emit('click', product)">
    <div class="flex items-start justify-between mb-3">
      <div class="bg-primary-50 p-2 rounded-lg">
        <PackageIcon class="w-5 h-5 text-primary-500" />
      </div>
      <span class="badge" :class="statusBadgeClass">
        {{ product.active ? 'Active' : 'Inactive' }}
      </span>
    </div>
    
    <h3 class="font-semibold text-secondary-800 mb-1">{{ product.name }}</h3>
    <p class="text-sm text-secondary-500 mb-2">{{ product.sku }}</p>
    
    <div class="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
      <div>
        <p class="text-xs text-secondary-500">Price</p>
        <p class="font-semibold text-primary-600">{{ formatCurrency(product.price) }}</p>
      </div>
      <div>
        <p class="text-xs text-secondary-500">Stock</p>
        <p :class="stockClass">{{ product.stock_quantity || 0 }} units</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { formatCurrency } from '@/utils/format'
import { PackageIcon } from '@heroicons/vue/outline'

const props = defineProps({
  product: Object
})

const statusBadgeClass = computed(() => {
  return props.product.active ? 'badge-success' : 'badge-neutral'
})

const stockClass = computed(() => {
  const stock = props.product.stock_quantity || 0
  if (stock === 0) return 'text-danger font-semibold'
  if (stock < 10) return 'text-warning font-semibold'
  return 'text-success'
})

defineEmits(['click'])
</script>