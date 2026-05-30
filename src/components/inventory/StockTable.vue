<template>
  <div class="table-container">
    <table class="table">
      <thead>
        <tr>
          <th>Product</th>
          <th>SKU</th>
          <th>Current Stock</th>
          <th>Reorder Level</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="item.product_id">
          <td class="font-medium">{{ item.product_name }}</td>
          <td>{{ item.product_sku }}</td>
          <td :class="stockClass(item.quantity)">{{ item.quantity }} units</td>
          <td>{{ item.reorder_level }} units</td>
          <td>
            <span class="badge" :class="statusClass(item.status)">
              {{ getStatusText(item.status) }}
            </span>
          </td>
        </tr>
        <tr v-if="!data?.length">
          <td colspan="5" class="text-center py-8 text-secondary-500">
            No stock data available
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: Array
})

const stockClass = (quantity) => {
  if (quantity === 0) return 'text-danger font-semibold'
  if (quantity < 10) return 'text-warning font-semibold'
  return 'text-success'
}

const statusClass = (status) => {
  const classes = {
    normal: 'badge-success',
    low: 'badge-warning',
    out_of_stock: 'badge-danger'
  }
  return classes[status] || 'badge-neutral'
}

const getStatusText = (status) => {
  const texts = {
    normal: 'Normal',
    low: 'Low Stock',
    out_of_stock: 'Out of Stock'
  }
  return texts[status] || 'Unknown'
}
</script>