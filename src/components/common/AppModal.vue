
<template>
  <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto">
    <div class="flex items-center justify-center min-h-screen px-4">
      <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity" @click="close"></div>
      
      <div class="relative bg-white rounded-lg shadow-xl max-w-md w-full">
        <div class="px-6 py-4 border-b">
          <h3 class="text-lg font-semibold">{{ title }}</h3>
        </div>
        
        <div class="px-6 py-4">
          <slot />
        </div>
        
        <div class="px-6 py-4 border-t flex justify-end space-x-3">
          <AppButton variant="secondary" @click="close">Cancel</AppButton>
          <AppButton @click="confirm">Confirm</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import AppButton from './AppButton.vue'

defineProps({
  show: Boolean,
  title: String
})

const emit = defineEmits(['close', 'confirm'])

const close = () => emit('close')
const confirm = () => emit('confirm')
</script>