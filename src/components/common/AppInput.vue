<template>
  <div class="mb-4">
    <label v-if="label" class="input-label">
      {{ label }}
      <span v-if="required" class="text-red-500 ml-1">*</span>
    </label>
    
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="input-glass"
      @input="$emit('update:modelValue', $event.target.value)"
    />
    
    <p v-if="error" class="mt-2 text-sm text-red-500">{{ error }}</p>
  </div>
</template>

<script setup>
defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  required: Boolean,
  disabled: Boolean,
  error: String
})

defineEmits(['update:modelValue'])
</script>