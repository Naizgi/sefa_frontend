<template>
  <div id="app" class="app-container">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuthStore } from './stores/authStore'

const authStore = useAuthStore()

onMounted(async () => {
  // Initialize auth store on app start
  if (!authStore.isInitialized) {
    await authStore.initializeAuth()
  }
  
  // Check for dark mode preference
  const isDarkMode = localStorage.getItem('darkMode') === 'true'
  if (isDarkMode) {
    document.documentElement.classList.add('dark')
  }
})
</script>

<style>
/* Global Styles */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background: linear-gradient(135deg, #F5F7FA 0%, #E8EDF2 100%);
  color: #1E293B;
  overflow-x: hidden;
}

/* Custom scrollbar - Modern theme */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #8B5CF6, #6366F1);
}

/* Selection styles - Indigo theme */
::selection {
  background: rgba(99, 102, 241, 0.15);
  color: #6366F1;
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Loading spinner - Indigo theme */
.loading-spinner {
  display: inline-block;
  width: 40px;
  height: 40px;
  border: 3px solid rgba(99, 102, 241, 0.2);
  border-top-color: #6366F1;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Toast notifications */
.toast-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
}

.toast {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px 20px;
  margin-bottom: 10px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border-left: 4px solid;
  animation: slideInRight 0.3s ease;
}

.toast-success {
  border-left-color: #10B981;
}

.toast-error {
  border-left-color: #EF4444;
}

.toast-warning {
  border-left-color: #F59E0B;
}

.toast-info {
  border-left-color: #6366F1;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Card hover effects */
.glass-card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

/* Button styles */
.btn-primary {
  background: linear-gradient(135deg, #6366F1, #8B5CF6);
  border: none;
  border-radius: 12px;
  padding: 10px 24px;
  font-weight: 600;
  color: white;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
}

.btn-secondary {
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  padding: 10px 24px;
  font-weight: 600;
  color: #1E293B;
  transition: all 0.3s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Status badges */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
}

.status-active {
  background: rgba(16, 185, 129, 0.1);
  color: #10B981;
}

.status-inactive {
  background: rgba(0, 0, 0, 0.05);
  color: #64748B;
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: #F59E0B;
}

/* Table styles */
.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  text-align: left;
  padding: 12px 16px;
  background: rgba(0, 0, 0, 0.02);
  font-weight: 600;
  color: #64748B;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.data-table tr:hover td {
  background: rgba(99, 102, 241, 0.03);
}

/* Responsive utilities */
@media (max-width: 768px) {
  .hide-on-mobile {
    display: none !important;
  }
}

@media (min-width: 769px) {
  .show-on-mobile {
    display: none !important;
  }
}

/* Print styles */
@media print {
  .no-print {
    display: none !important;
  }
  
  body {
    background: white;
  }
}
</style>