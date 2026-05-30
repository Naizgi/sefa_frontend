<template>
  <div class="splash-screen">
    <!-- Animated Background -->
    <div class="splash-bg">
      <div class="bg-gradient"></div>
      <div class="floating-boxes">
        <div v-for="i in 12" :key="i" class="floating-box" :style="getBoxStyle(i)"></div>
      </div>
      <div class="stock-lines">
        <div v-for="i in 8" :key="i" class="stock-line" :style="{ animationDelay: `${i * 0.5}s` }"></div>
      </div>
    </div>

    <div class="splash-content">
      <!-- 3D Rotating Logo - Using Image -->
      <div class="logo-3d-container">
        <div class="logo-3d-wrapper">
          <div class="logo-3d-inner">
            <div class="logo-face logo-front">
              <img :src="logoImage" alt="Logo" class="logo-img-3d" />
            </div>
            <div class="logo-face logo-back">
              <img :src="logoImage" alt="Logo" class="logo-img-3d" />
            </div>
            <div class="logo-face logo-right">
              <img :src="logoImage" alt="Logo" class="logo-img-3d" />
            </div>
            <div class="logo-face logo-left">
              <img :src="logoImage" alt="Logo" class="logo-img-3d" />
            </div>
          </div>
        </div>
        <div class="logo-glow"></div>
      </div>

      <h1 class="logo-title">
        <span class="title-gradient">Inventory</span>
        <span class="title-light">System</span>
      </h1>
      <p class="logo-subtitle">Smart Stock Management Platform</p>

      <!-- Animated Progress Bar with Inventory Theme -->
      <div class="inventory-loader">
        <div class="loader-container">
          <div class="loader-track">
            <div class="loader-fill" :style="{ width: progress + '%' }">
              <div class="loader-particles"></div>
            </div>
          </div>
          <div class="loader-percentage">{{ Math.floor(progress) }}%</div>
        </div>
        
        <!-- Animated Stock Items -->
        <div class="stock-animation">
          <div class="stock-item" v-for="i in 5" :key="i" :style="{ animationDelay: `${i * 0.2}s` }">
            <svg class="stock-icon" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="8" width="16" height="12" rx="1" stroke="currentColor" stroke-width="1.5"/>
              <path d="M8 8V6a2 2 0 012-2h4a2 2 0 012 2v2" stroke="currentColor" stroke-width="1.5"/>
            </svg>
            <span class="stock-label">Loading stock...</span>
          </div>
        </div>
      </div>

      <!-- Status Messages -->
      <div class="status-messages">
        <transition-group name="message" tag="div" class="messages-container">
          <div v-for="msg in visibleMessages" :key="msg.id" class="status-message">
            <div class="message-icon" :class="msg.type">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="msg.icon" />
              </svg>
            </div>
            <span>{{ msg.text }}</span>
          </div>
        </transition-group>
      </div>

      <!-- Version Info -->
      <div class="version-info">
        <span>v1.0.0</span>
        <span class="separator">•</span>
        <span>Powered by Mellainnovation</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import logo from '../assets/logo.jpg' // Adjust path to your logo

const router = useRouter()
const authStore = useAuthStore()

const progress = ref(0)
const visibleMessages = ref([])
const logoImage = ref(logo)

const messages = [
  { text: "Initializing inventory database...", icon: "M4 7v10c0 2 1.5 4 4 4h8c2.5 0 4-2 4-4V7", type: "info", duration: 1200 },
  { text: "Loading product catalog...", icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10", type: "info", duration: 1000 },
  { text: "Syncing branch data...", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5", type: "info", duration: 1100 },
  { text: "Checking stock levels...", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2", type: "info", duration: 1300 },
  { text: "Detecting low stock alerts...", icon: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z", type: "warning", duration: 1200 },
  { text: "Analyzing inventory trends...", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10", type: "info", duration: 1000 },
  { text: "Preparing dashboard...", icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10", type: "info", duration: 1100 },
  { text: "System ready!", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", type: "success", duration: 1000 }
]

let progressInterval
let messageIndex = 0
let messageInterval

const getBoxStyle = (index) => {
  const size = 20 + Math.random() * 40
  const left = Math.random() * 100
  const duration = 3 + Math.random() * 4
  const delay = Math.random() * 5
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    animationDuration: `${duration}s`,
    animationDelay: `${delay}s`
  }
}

const showNextMessage = () => {
  if (messageIndex < messages.length) {
    const msg = messages[messageIndex]
    visibleMessages.value.push({ ...msg, id: Date.now() + messageIndex })
    
    setTimeout(() => {
      visibleMessages.value = visibleMessages.value.filter(m => m.id !== (Date.now() + messageIndex))
    }, msg.duration)
    
    messageIndex++
  }
}

// Handle image error fallback
const handleImageError = () => {
  console.warn('Logo image failed to load')
  // Could set a fallback SVG or text
}

// Start animations
const startProgress = () => {
  progressInterval = setInterval(() => {
    if (progress.value < 90) {
      progress.value += Math.random() * 5
    }
  }, 150)
}

onMounted(async () => {
  startProgress()
  showNextMessage()
  messageInterval = setInterval(showNextMessage, 1300)

  // Initialize auth
  if (!authStore.isInitialized && typeof authStore.initializeAuth === 'function') {
    await authStore.initializeAuth()
  }

  // Complete progress
  setTimeout(() => {
    progress.value = 100
  }, 1200)

  // Redirect after delay
  setTimeout(() => {
    if (authStore.isAuthenticated) {
      const dashboard = authStore.isAdmin ? '/dashboard' : '/sales'
      router.replace(dashboard)
    } else {
      router.replace('/login')
    }
  }, 2500)
})

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval)
  if (messageInterval) clearInterval(messageInterval)
})
</script>

<style scoped>
.splash-screen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8FB7B3, #AFC8C5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  overflow: hidden;
}

/* Animated Background */
.splash-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 30%, rgba(47, 184, 166, 0.2) 0%, transparent 50%),
              radial-gradient(circle at 80% 70%, rgba(111, 211, 195, 0.2) 0%, transparent 50%);
  animation: bgPulse 4s ease-in-out infinite;
}

@keyframes bgPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.floating-boxes {
  position: absolute;
  width: 100%;
  height: 100%;
}

.floating-box {
  position: absolute;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  animation: floatBox linear infinite;
}

@keyframes floatBox {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0;
  }
  10% {
    opacity: 0.5;
  }
  90% {
    opacity: 0.5;
  }
  100% {
    transform: translateY(-100vh) rotate(360deg);
    opacity: 0;
  }
}

.stock-lines {
  position: absolute;
  width: 100%;
  height: 100%;
}

.stock-line {
  position: absolute;
  height: 2px;
  background: linear-gradient(90deg, transparent, rgba(47, 184, 166, 0.3), transparent);
  animation: stockLineMove 3s ease-in-out infinite;
}

@keyframes stockLineMove {
  0% {
    width: 0%;
    left: 0;
    opacity: 0;
  }
  50% {
    width: 100%;
    left: 0;
    opacity: 0.5;
  }
  100% {
    width: 0%;
    left: 100%;
    opacity: 0;
  }
}

/* Content */
.splash-content {
  text-align: center;
  position: relative;
  z-index: 10;
  animation: fadeInUp 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 3D Logo - Using Image */
.logo-3d-container {
  position: relative;
  width: 100px;
  height: 100px;
  margin: 0 auto 1.5rem;
  perspective: 1000px;
}

.logo-3d-wrapper {
  width: 100%;
  height: 100%;
}

.logo-3d-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  animation: spin3D 8s infinite linear;
}

.logo-face {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-img-3d {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-front { transform: translateZ(20px); }
.logo-back { transform: rotateY(180deg) translateZ(20px); }
.logo-right { transform: rotateY(90deg) translateZ(20px); }
.logo-left { transform: rotateY(-90deg) translateZ(20px); }

@keyframes spin3D {
  from { transform: rotateY(0); }
  to { transform: rotateY(360deg); }
}

.logo-glow {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 120px;
  height: 120px;
  background: radial-gradient(circle, rgba(47, 184, 166, 0.4), transparent);
  filter: blur(20px);
  animation: glowPulse 2s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 0.5;
    transform: translate(-50%, -50%) scale(1);
  }
  50% {
    opacity: 1;
    transform: translate(-50%, -50%) scale(1.2);
  }
}

.logo-title {
  font-size: 2.5rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
}

.title-gradient {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}

.title-light {
  color: white;
  margin-left: 8px;
}

.logo-subtitle {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  margin-bottom: 2rem;
}

/* Inventory Loader */
.inventory-loader {
  max-width: 400px;
  margin: 0 auto 2rem;
}

.loader-container {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.loader-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.loader-fill {
  height: 100%;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3);
  border-radius: 10px;
  position: relative;
  transition: width 0.3s ease;
  overflow: hidden;
}

.loader-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255, 255, 255, 0.5), 
    transparent);
  animation: shimmer 1s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.loader-percentage {
  font-size: 1rem;
  font-weight: 600;
  color: white;
  min-width: 45px;
}

/* Stock Animation */
.stock-animation {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.stock-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: rgba(255, 255, 255, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  animation: stockPulse 1s ease-in-out infinite;
}

.stock-icon {
  width: 14px;
  height: 14px;
  color: #2FB8A6;
}

.stock-label {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.8);
}

@keyframes stockPulse {
  0%, 100% {
    opacity: 0.6;
    transform: scale(0.95);
  }
  50% {
    opacity: 1;
    transform: scale(1.05);
  }
}

/* Status Messages */
.status-messages {
  min-height: 60px;
  margin-bottom: 1.5rem;
}

.messages-container {
  position: relative;
  height: 50px;
}

.status-message {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 40px;
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  animation: messagePop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes messagePop {
  from {
    opacity: 0;
    transform: translateX(-50%) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }
}

.message-icon {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-icon.info {
  background: rgba(47, 184, 166, 0.2);
  color: #2FB8A6;
}

.message-icon.warning {
  background: rgba(244, 114, 182, 0.2);
  color: #F472B6;
}

.message-icon.success {
  background: rgba(52, 211, 153, 0.2);
  color: #34D399;
}

.status-message span {
  font-size: 0.85rem;
  color: white;
  font-weight: 500;
}

/* Version Info */
.version-info {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
}

.separator {
  margin: 0 0.25rem;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Message Transitions */
.message-enter-active,
.message-leave-active {
  transition: all 0.4s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px);
}

.message-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(20px);
}

/* Responsive */
@media (max-width: 768px) {
  .logo-title {
    font-size: 1.8rem;
  }
  
  .logo-3d-container {
    width: 80px;
    height: 80px;
  }
  
  .logo-glow {
    width: 100px;
    height: 100px;
  }
  
  .status-message {
    padding: 0.5rem 1rem;
    white-space: nowrap;
    font-size: 0.75rem;
  }
  
  .status-message span {
    font-size: 0.75rem;
  }
  
  .inventory-loader {
    max-width: 300px;
  }
  
  .stock-item {
    padding: 0.2rem 0.6rem;
  }
  
  .stock-label {
    font-size: 0.6rem;
  }
}

@media (max-width: 480px) {
  .logo-title {
    font-size: 1.5rem;
  }
  
  .logo-3d-container {
    width: 70px;
    height: 70px;
  }
  
  .logo-glow {
    width: 90px;
    height: 90px;
  }
  
  .status-message {
    white-space: normal;
    max-width: 280px;
    text-align: center;
    padding: 0.5rem 1rem;
  }
  
  .stock-animation {
    gap: 0.25rem;
  }
  
  .stock-item {
    padding: 0.2rem 0.5rem;
  }
}
</style>