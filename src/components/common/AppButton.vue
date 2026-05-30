<template>
  <button 
    :type="type"
    :class="[
      buttonClass,
      { 'w-full': block, 'opacity-50 cursor-not-allowed': disabled }
    ]"
    :disabled="disabled"
    @click="$emit('click')"
  >
    <slot />
  </button>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  type: { type: String, default: 'button' },
  variant: { type: String, default: 'primary' },
  size: { type: String, default: 'md' },
  disabled: { type: Boolean, default: false },
  block: { type: Boolean, default: false }
})

const buttonClass = computed(() => {
  const classes = []
  
  // Size classes
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5',
    lg: 'px-6 py-3 text-lg'
  }
  classes.push(sizes[props.size] || sizes.md)
  
  // Variant classes
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'bg-red-500 text-white hover:bg-red-600 shadow-soft',
    success: 'bg-success text-white hover:bg-green-600 shadow-soft',
    ghost: 'bg-transparent text-primary-500 hover:bg-primary-50'
  }
  classes.push(variants[props.variant] || variants.primary)
  
  return classes.join(' ')
})

defineEmits(['click'])
</script>