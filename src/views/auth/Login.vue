<template>
  <div class="login-page">
    <!-- Premium Teal Background -->
    <div class="premium-bg">
      <div class="gradient-mesh"></div>
      <div class="particle-field" ref="particleField"></div>
      <div class="morphing-shapes">
        <div class="shape shape-1"></div>
        <div class="shape shape-2"></div>
        <div class="shape shape-3"></div>
        <div class="shape shape-4"></div>
      </div>
      <div class="aurora"></div>
    </div>

    <!-- Centered Card -->
    <div class="login-wrapper">
      <div class="login-card">
        <div class="card-glow"></div>
        
        <!-- Logo Section -->
        <div class="logo-section">
          <div class="logo-icon">
            <img :src="logoImage" alt="Logo" class="logo-img" @error="handleImageError" />
          </div>
          <h1 class="logo-title">Inventory System</h1>
          <p class="logo-subtitle">Smart Stock Management Platform</p>
        </div>

        <!-- Dynamic Form Based on Step -->
        <div v-if="resetStep === 'request'" class="welcome-section">
          <h2>Forgot Password?</h2>
          <p>Enter your email to reset your password</p>
        </div>
        <div v-else-if="resetStep === 'verify'" class="welcome-section">
          <h2>Verify OTP</h2>
          <p>Enter the verification code sent to your email</p>
        </div>
        <div v-else-if="resetStep === 'reset'" class="welcome-section">
          <h2>Create New Password</h2>
          <p>Enter your new password below</p>
        </div>
        <div v-else class="welcome-section">
          <h2>Welcome back</h2>
          <p>Sign in to continue to your dashboard</p>
        </div>

        <!-- Forgot Password Flow -->
        <form v-if="resetStep === 'request'" @submit.prevent="requestPasswordReset" class="login-form">
          <transition-group name="message" tag="div">
            <div v-if="error" key="error" class="alert-message error">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
              </svg>
              <span>{{ error }}</span>
            </div>
            <div v-if="successMessage" key="success" class="alert-message success">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ successMessage }}</span>
            </div>
          </transition-group>

          <div class="input-group">
            <div class="input-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <input
              type="email"
              v-model="resetEmail"
              required
              class="form-input"
              :class="{ 'filled': resetEmail }"
              placeholder=" "
              autocomplete="email"
            />
            <label class="floating-label">Email Address</label>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Send OTP</span>
          </button>

          <button type="button" @click="cancelReset" class="back-to-login">
            ← Back to Login
          </button>
        </form>

        <!-- OTP Verification Form -->
        <form v-else-if="resetStep === 'verify'" @submit.prevent="verifyOTP" class="login-form">
          <transition-group name="message" tag="div">
            <div v-if="error" key="error" class="alert-message error">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
              </svg>
              <span>{{ error }}</span>
            </div>
          </transition-group>

          <div class="input-group">
            <div class="input-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <input
              type="text"
              v-model="otpCode"
              required
              maxlength="6"
              class="form-input"
              :class="{ 'filled': otpCode }"
              placeholder=" "
              autocomplete="off"
            />
            <label class="floating-label">Enter OTP Code</label>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Verify OTP</span>
          </button>

          <div class="resend-otp">
            <span>Didn't receive code? </span>
            <button type="button" @click="resendOTP" :disabled="resendCooldown > 0" class="resend-btn">
              {{ resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code' }}
            </button>
          </div>

          <button type="button" @click="cancelReset" class="back-to-login">
            ← Back to Login
          </button>
        </form>

        <!-- Reset Password Form -->
        <form v-else-if="resetStep === 'reset'" @submit.prevent="resetPassword" class="login-form">
          <transition-group name="message" tag="div">
            <div v-if="error" key="error" class="alert-message error">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
              </svg>
              <span>{{ error }}</span>
            </div>
          </transition-group>

          <div class="input-group">
            <div class="input-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <input
              :type="showNewPassword ? 'text' : 'password'"
              v-model="newPassword"
              required
              class="form-input"
              :class="{ 'filled': newPassword }"
              placeholder=" "
              autocomplete="new-password"
            />
            <label class="floating-label">New Password</label>
            <button type="button" class="password-toggle" @click="toggleNewPassword">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!showNewPassword" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path v-if="!showNewPassword" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path v-if="showNewPassword" d="M3 3l18 18M10.5 10.5l3 3M13.5 10.5l-3 3M2.458 12C3.732 7.943 7.523 5 12 5c1.314 0 2.581.219 3.765.624M21.542 12c-1.274 4.057-5.064 7-9.542 7-1.314 0-2.581-.219-3.765-.624" />
              </svg>
            </button>
          </div>

          <div class="input-group">
            <div class="input-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <input
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="confirmPassword"
              required
              class="form-input"
              :class="{ 'filled': confirmPassword }"
              placeholder=" "
              autocomplete="new-password"
            />
            <label class="floating-label">Confirm Password</label>
            <button type="button" class="password-toggle" @click="toggleConfirmPassword">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!showConfirmPassword" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path v-if="!showConfirmPassword" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path v-if="showConfirmPassword" d="M3 3l18 18M10.5 10.5l3 3M13.5 10.5l-3 3M2.458 12C3.732 7.943 7.523 5 12 5c1.314 0 2.581.219 3.765.624M21.542 12c-1.274 4.057-5.064 7-9.542 7-1.314 0-2.581-.219-3.765-.624" />
              </svg>
            </button>
          </div>

          <div class="password-requirements">
            <p>Password must contain:</p>
            <ul>
              <li :class="{ 'valid': hasMinLength }">At least 8 characters</li>
              <li :class="{ 'valid': hasUpperCase }">At least one uppercase letter</li>
              <li :class="{ 'valid': hasLowerCase }">At least one lowercase letter</li>
              <li :class="{ 'valid': hasNumber }">At least one number</li>
            </ul>
          </div>

          <button type="submit" class="login-btn" :disabled="loading || !isPasswordValid || !doPasswordsMatch">
            <span v-if="loading" class="spinner"></span>
            <span v-else>Reset Password</span>
          </button>

          <button type="button" @click="cancelReset" class="back-to-login">
            ← Back to Login
          </button>
        </form>

        <!-- Normal Login Form -->
        <form v-else @submit.prevent="handleLogin" class="login-form">
          <transition-group name="message" tag="div">
            <div v-if="error" key="error" class="alert-message error">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"/>
              </svg>
              <span>{{ error }}</span>
            </div>
            <div v-if="successMessage" key="success" class="alert-message success">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>{{ successMessage }}</span>
            </div>
          </transition-group>

          <div class="input-group">
            <div class="input-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
            </div>
            <input
              type="email"
              v-model="credentials.email"
              required
              class="form-input"
              :class="{ 'filled': credentials.email }"
              placeholder=" "
              autocomplete="email"
            />
            <label class="floating-label">Email Address</label>
          </div>

          <div class="input-group">
            <div class="input-icon">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z"/>
              </svg>
            </div>
            <input
              :type="showPassword ? 'text' : 'password'"
              v-model="credentials.password"
              required
              class="form-input"
              :class="{ 'filled': credentials.password }"
              placeholder=" "
              autocomplete="current-password"
            />
            <label class="floating-label">Password</label>
            <button type="button" class="password-toggle" @click="togglePassword">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!showPassword" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path v-if="!showPassword" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                <path v-if="showPassword" d="M3 3l18 18M10.5 10.5l3 3M13.5 10.5l-3 3M2.458 12C3.732 7.943 7.523 5 12 5c1.314 0 2.581.219 3.765.624M21.542 12c-1.274 4.057-5.064 7-9.542 7-1.314 0-2.581-.219-3.765-.624" />
              </svg>
            </button>
          </div>

          <div class="form-options">
            <label class="checkbox">
              <input type="checkbox" v-model="rememberMe">
              <span class="checkmark"></span>
              <span>Remember me</span>
            </label>
            <button type="button" class="forgot-link" @click="handleForgotPassword">
              Forgot password?
            </button>
          </div>

          <button type="submit" class="login-btn" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            <span v-else>
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
              </svg>
              Sign In
            </span>
          </button>

          <div class="info-note">
            <p>Use your registered email and password to login</p>
            <p class="contact-support">Need help? Contact your system administrator</p>
          </div>
        </form>

        <!-- Footer -->
        <div class="login-footer">
          <div class="security-badge">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6-4h12a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2v-6a2 2 0 012-2zm10-4V7a4 4 0 00-8 0v4h8z"/>
            </svg>
            <span>256-bit Encrypted</span>
          </div>
          <div class="version-badge">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
            </svg>
            <span>v2.0.0</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import api from '@/services/api'
import logo from '../../assets/logo.jpg'

const router = useRouter()
const authStore = useAuthStore()

// Login state
const credentials = ref({ email: '', password: '' })
const loading = ref(false)
const error = ref('')
const successMessage = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const particleField = ref(null)
const logoImage = ref(logo)

// Reset password state
const resetStep = ref('login') // 'login', 'request', 'verify', 'reset'
const resetEmail = ref('')
const otpCode = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const showNewPassword = ref(false)
const showConfirmPassword = ref(false)
const resetToken = ref('')
const resendCooldown = ref(0)
let cooldownInterval = null

// Password validation
const hasMinLength = computed(() => newPassword.value.length >= 8)
const hasUpperCase = computed(() => /[A-Z]/.test(newPassword.value))
const hasLowerCase = computed(() => /[a-z]/.test(newPassword.value))
const hasNumber = computed(() => /[0-9]/.test(newPassword.value))
const isPasswordValid = computed(() => hasMinLength.value && hasUpperCase.value && hasLowerCase.value && hasNumber.value)
const doPasswordsMatch = computed(() => newPassword.value === confirmPassword.value && newPassword.value !== '')

const handleImageError = () => {
  console.warn('Logo image failed to load')
}

const handleLogin = async () => {
  if (!credentials.value.email || !credentials.value.password) {
    error.value = 'Please enter both email and password'
    setTimeout(() => error.value = '', 3000)
    return
  }

  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(credentials.value.email, credentials.value.password)
    
    if (result.success) {
      successMessage.value = `Welcome back, ${authStore.userName}!`
      setTimeout(() => successMessage.value = '', 2000)
      
      if (rememberMe.value) {
        localStorage.setItem('rememberMe', 'true')
        localStorage.setItem('savedEmail', credentials.value.email)
      } else {
        localStorage.removeItem('rememberMe')
        localStorage.removeItem('savedEmail')
      }
      
      const redirectRoute = authStore.isAdmin ? '/dashboard' : '/sales'
      
      setTimeout(() => {
        router.push(redirectRoute)
      }, 1000)
      
    } else {
      error.value = result.error || 'Invalid email or password'
      setTimeout(() => error.value = '', 3000)
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = 'An error occurred during login. Please try again.'
    setTimeout(() => error.value = '', 3000)
  } finally {
    loading.value = false
  }
}

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const toggleNewPassword = () => {
  showNewPassword.value = !showNewPassword.value
}

const toggleConfirmPassword = () => {
  showConfirmPassword.value = !showConfirmPassword.value
}

const handleForgotPassword = () => {
  resetStep.value = 'request'
  resetEmail.value = ''
  error.value = ''
  successMessage.value = ''
}

const cancelReset = () => {
  resetStep.value = 'login'
  resetEmail.value = ''
  otpCode.value = ''
  newPassword.value = ''
  confirmPassword.value = ''
  resetToken.value = ''
  error.value = ''
  successMessage.value = ''
  
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
    cooldownInterval = null
  }
  resendCooldown.value = 0
}

const requestPasswordReset = async () => {
  if (!resetEmail.value) {
    error.value = 'Please enter your email address'
    setTimeout(() => error.value = '', 3000)
    return
  }

  loading.value = true
  error.value = ''

  try {
    // First check if email exists and is admin
    const response = await api.post('/auth/forgot-password', {
      email: resetEmail.value
    })
    
    if (response.data.success) {
      successMessage.value = 'OTP has been sent to your email address'
      setTimeout(() => successMessage.value = '', 3000)
      resetStep.value = 'verify'
      startResendCooldown()
    } else {
      error.value = response.data.message || 'Email not found or not authorized'
      setTimeout(() => error.value = '', 3000)
    }
  } catch (err) {
    console.error('Password reset request error:', err)
    error.value = err.response?.data?.message || 'Failed to send OTP. Please try again.'
    setTimeout(() => error.value = '', 3000)
  } finally {
    loading.value = false
  }
}

const verifyOTP = async () => {
  if (!otpCode.value || otpCode.value.length !== 6) {
    error.value = 'Please enter a valid 6-digit OTP code'
    setTimeout(() => error.value = '', 3000)
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/auth/verify-otp', {
      email: resetEmail.value,
      otp: otpCode.value
    })
    
    if (response.data.success) {
      resetToken.value = response.data.resetToken
      resetStep.value = 'reset'
      successMessage.value = 'OTP verified! Please set your new password.'
      setTimeout(() => successMessage.value = '', 2000)
    } else {
      error.value = response.data.message || 'Invalid OTP code'
      setTimeout(() => error.value = '', 3000)
    }
  } catch (err) {
    console.error('OTP verification error:', err)
    error.value = err.response?.data?.message || 'Failed to verify OTP. Please try again.'
    setTimeout(() => error.value = '', 3000)
  } finally {
    loading.value = false
  }
}

const resendOTP = async () => {
  if (resendCooldown.value > 0) return
  
  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/auth/resend-otp', {
      email: resetEmail.value
    })
    
    if (response.data.success) {
      successMessage.value = 'New OTP has been sent to your email'
      setTimeout(() => successMessage.value = '', 3000)
      startResendCooldown()
    } else {
      error.value = response.data.message || 'Failed to resend OTP'
      setTimeout(() => error.value = '', 3000)
    }
  } catch (err) {
    console.error('Resend OTP error:', err)
    error.value = err.response?.data?.message || 'Failed to resend OTP. Please try again.'
    setTimeout(() => error.value = '', 3000)
  } finally {
    loading.value = false
  }
}

const startResendCooldown = () => {
  resendCooldown.value = 60
  if (cooldownInterval) clearInterval(cooldownInterval)
  
  cooldownInterval = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    } else {
      clearInterval(cooldownInterval)
      cooldownInterval = null
    }
  }, 1000)
}

const resetPassword = async () => {
  if (!isPasswordValid.value) {
    error.value = 'Please meet all password requirements'
    setTimeout(() => error.value = '', 3000)
    return
  }
  
  if (!doPasswordsMatch.value) {
    error.value = 'Passwords do not match'
    setTimeout(() => error.value = '', 3000)
    return
  }

  loading.value = true
  error.value = ''

  try {
    const response = await api.post('/auth/reset-password', {
      email: resetEmail.value,
      resetToken: resetToken.value,
      newPassword: newPassword.value
    })
    
    if (response.data.success) {
      successMessage.value = 'Password reset successful! Please login with your new password.'
      setTimeout(() => {
        resetStep.value = 'login'
        resetEmail.value = ''
        otpCode.value = ''
        newPassword.value = ''
        confirmPassword.value = ''
        resetToken.value = ''
        successMessage.value = ''
        credentials.value.email = ''
        credentials.value.password = ''
      }, 2000)
    } else {
      error.value = response.data.message || 'Failed to reset password'
      setTimeout(() => error.value = '', 3000)
    }
  } catch (err) {
    console.error('Password reset error:', err)
    error.value = err.response?.data?.message || 'Failed to reset password. Please try again.'
    setTimeout(() => error.value = '', 3000)
  } finally {
    loading.value = false
  }
}

// Particle system
const initParticles = () => {
  if (!particleField.value) return
  for (let i = 0; i < 50; i++) {
    const particle = document.createElement('div')
    particle.classList.add('particle')
    particle.style.left = `${Math.random() * 100}%`
    particle.style.top = `${Math.random() * 100}%`
    particle.style.animationDelay = `${Math.random() * 10}s`
    particle.style.animationDuration = `${5 + Math.random() * 10}s`
    particleField.value.appendChild(particle)
  }
}

onMounted(() => {
  const remembered = localStorage.getItem('rememberMe')
  if (remembered === 'true') {
    const savedEmail = localStorage.getItem('savedEmail')
    if (savedEmail) {
      credentials.value.email = savedEmail
      rememberMe.value = true
    }
  }
  
  initParticles()
})

onUnmounted(() => {
  if (cooldownInterval) {
    clearInterval(cooldownInterval)
  }
})
</script>

<style scoped>
/* Keep all existing styles from your original component */

/* Additional styles for reset password flow */
.back-to-login {
  background: none;
  border: none;
  color: #6E8B90;
  cursor: pointer;
  font-size: 0.85rem;
  margin-top: 1rem;
  padding: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
}

.back-to-login:hover {
  color: #2FB8A6;
  transform: translateX(-5px);
}

.resend-otp {
  text-align: center;
  font-size: 0.85rem;
  color: #6E8B90;
  margin-top: 0.5rem;
}

.resend-btn {
  background: none;
  border: none;
  color: #2FB8A6;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.resend-btn:hover:not(:disabled) {
  text-decoration: underline;
}

.resend-btn:disabled {
  color: #9CA3AF;
  cursor: not-allowed;
}

.password-requirements {
  background: rgba(47, 184, 166, 0.05);
  padding: 0.75rem;
  border-radius: 12px;
  font-size: 0.7rem;
  margin-top: -0.5rem;
}

.password-requirements p {
  color: #6E8B90;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.password-requirements ul {
  list-style: none;
  padding-left: 0;
}

.password-requirements li {
  color: #9CA3AF;
  padding-left: 1rem;
  position: relative;
  margin-bottom: 0.25rem;
}

.password-requirements li::before {
  content: '✗';
  position: absolute;
  left: 0;
  color: #EF4444;
}

.password-requirements li.valid::before {
  content: '✓';
  color: #22C55E;
}

.password-requirements li.valid {
  color: #22C55E;
}

/* All your existing styles below */
/* ... (keep all the original styles from your component) ... */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.login-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Premium Teal Background */
.premium-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #8FB7B3, #AFC8C5);
  z-index: 0;
}

.gradient-mesh {
  position: absolute;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at 20% 50%, rgba(47, 184, 166, 0.3) 0%, transparent 50%),
              radial-gradient(circle at 80% 80%, rgba(111, 211, 195, 0.3) 0%, transparent 50%);
  animation: meshPulse 8s ease-in-out infinite;
}

@keyframes meshPulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

.particle-field {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  animation: floatParticle linear infinite;
}

@keyframes floatParticle {
  from { transform: translateY(0) translateX(0); opacity: 0; }
  10% { opacity: 0.5; }
  90% { opacity: 0.5; }
  to { transform: translateY(-100vh) translateX(100px); opacity: 0; }
}

.morphing-shapes {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(60px);
  animation: morphShape 15s ease-in-out infinite;
}

.shape-1 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(47, 184, 166, 0.4), rgba(111, 211, 195, 0.1));
  top: -100px;
  left: -100px;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(111, 211, 195, 0.4), rgba(47, 184, 166, 0.1));
  bottom: -50px;
  right: -50px;
  animation-delay: -5s;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.2), rgba(47, 184, 166, 0.1));
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation-delay: -10s;
}

.shape-4 {
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(47, 184, 166, 0.3), transparent);
  bottom: 20%;
  left: 20%;
  animation-delay: -15s;
}

@keyframes morphShape {
  0%, 100% { border-radius: 50%; transform: scale(1); }
  33% { border-radius: 40% 60% 60% 40% / 40% 50% 50% 60%; transform: scale(1.1); }
  66% { border-radius: 60% 40% 40% 60% / 60% 40% 60% 40%; transform: scale(0.9); }
}

.aurora {
  position: absolute;
  width: 100%;
  height: 100%;
  background: linear-gradient(125deg, rgba(47, 184, 166, 0.2) 0%, rgba(111, 211, 195, 0.1) 50%, rgba(255, 255, 255, 0.05) 100%);
  animation: auroraMove 10s ease-in-out infinite;
}

@keyframes auroraMove {
  0%, 100% { transform: translateX(-10%) translateY(-10%) scale(1); }
  50% { transform: translateX(10%) translateY(10%) scale(1.05); }
}

/* Centered Login Card */
.login-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 480px;
  margin: 2rem;
  animation: fadeInUp 0.6s ease-out;
}

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

.login-card {
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: 2.5rem;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.login-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 30px 50px rgba(0, 0, 0, 0.15);
}

.card-glow {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #2FB8A6, #6FD3C3, #2FB8A6);
  animation: glowMove 2s linear infinite;
}

@keyframes glowMove {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

/* Logo Section - Updated for Image */
.logo-section {
  text-align: center;
  margin-bottom: 2rem;
}

.logo-icon {
  margin-bottom: 1rem;
  display: inline-block;
  width: 60px;
  height: 60px;
  animation: pulse 2s ease-in-out infinite;
}

.logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.logo-title {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  margin-bottom: 0.25rem;
}

.logo-subtitle {
  font-size: 0.75rem;
  color: #6E8B90;
}

/* Welcome Section */
.welcome-section {
  text-align: center;
  margin-bottom: 2rem;
}

.welcome-section h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #1A2A2E;
  margin-bottom: 0.5rem;
}

.welcome-section p {
  color: #6E8B90;
  font-size: 0.9rem;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.input-group {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6E8B90;
  z-index: 1;
  pointer-events: none;
}

.form-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #E5E7EB;
  border-radius: 16px;
  font-size: 1rem;
  background: #F9FAFB;
  transition: all 0.3s ease;
  color: #1A2A2E;
}

.form-input:focus {
  outline: none;
  border-color: #2FB8A6;
  background: white;
  box-shadow: 0 0 0 4px rgba(47, 184, 166, 0.1);
}

.form-input.filled {
  border-color: #2FB8A6;
}

.floating-label {
  position: absolute;
  left: 3rem;
  top: 1rem;
  color: #9CA3AF;
  transition: all 0.3s ease;
  pointer-events: none;
  font-size: 1rem;
}

.form-input:focus ~ .floating-label,
.form-input.filled ~ .floating-label {
  transform: translateY(-1.8rem) translateX(-1rem) scale(0.85);
  color: #2FB8A6;
  background: white;
  padding: 0 0.25rem;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #9CA3AF;
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.password-toggle:hover {
  color: #2FB8A6;
  background: rgba(47, 184, 166, 0.1);
}

/* Form Options */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: #6E8B90;
}

.checkbox input {
  display: none;
}

.checkmark {
  width: 18px;
  height: 18px;
  border: 2px solid #E5E7EB;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox input:checked + .checkmark {
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  border-color: transparent;
}

.checkbox input:checked + .checkmark::after {
  content: '';
  position: absolute;
  left: 5px;
  top: 2px;
  width: 4px;
  height: 8px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.forgot-link {
  background: none;
  border: none;
  color: #2FB8A6;
  cursor: pointer;
  transition: color 0.3s ease;
  font-size: 0.85rem;
}

.forgot-link:hover {
  color: #1F8A7C;
}

/* Login Button */
.login-btn {
  padding: 1rem;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #2FB8A6, #6FD3C3);
  color: white;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
}

.login-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
  transition: left 0.5s ease;
}

.login-btn:hover::before {
  left: 100%;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(47, 184, 166, 0.3);
}

.login-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Info Note */
.info-note {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: #9CA3AF;
}

.contact-support {
  margin-top: 0.25rem;
  font-size: 0.7rem;
  color: #2FB8A6;
}

/* Footer */
.login-footer {
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.security-badge,
.version-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  color: #9CA3AF;
}

/* Alert Messages */
.alert-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  animation: slideDown 0.3s ease-out;
}

.alert-message.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid #EF4444;
  color: #EF4444;
}

.alert-message.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid #22C55E;
  color: #22C55E;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-enter-active,
.message-leave-active {
  transition: all 0.3s ease;
}

.message-enter-from,
.message-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

/* Responsive */
@media (max-width: 640px) {
  .login-wrapper {
    margin: 1rem;
  }
  
  .login-card {
    padding: 1.5rem;
  }
  
  .logo-title {
    font-size: 1.25rem;
  }
  
  .welcome-section h2 {
    font-size: 1.5rem;
  }
  
  .login-footer {
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  
  .logo-icon {
    width: 50px;
    height: 50px;
  }
}
</style>