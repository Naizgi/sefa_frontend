<template>
  <div class="language-switcher">
    <button 
      @click="toggleDropdown" 
      class="language-toggle-btn"
    >
      <span class="current-lang">{{ currentLangLabel }}</span>
      <svg class="dropdown-icon" :class="{ 'rotated': showDropdown }" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
      </svg>
    </button>
    
    <div v-if="showDropdown" class="language-dropdown">
      <div 
        v-for="lang in languages" 
        :key="lang.code"
        @click="changeLanguage(lang.code)"
        class="language-option"
        :class="{ active: locale === lang.code }"
      >
        <span class="lang-flag">{{ lang.flag }}</span>
        <span class="lang-name">{{ lang.label }}</span>
        <svg v-if="locale === lang.code" class="check-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
const showDropdown = ref(false)

const languages = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'am', label: 'አማርኛ', flag: '🇪🇹' },
  { code: 'om', label: 'Afaan Oromo', flag: '🇪🇹' }
]

const currentLangLabel = computed(() => {
  const lang = languages.find(l => l.code === locale.value)
  return lang ? `${lang.flag} ${lang.label}` : '🇬🇧 English'
})

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const changeLanguage = (langCode) => {
  locale.value = langCode
  localStorage.setItem('language', langCode)
  showDropdown.value = false
}

// Close dropdown when clicking outside
const handleClickOutside = (event) => {
  const switcher = event.target.closest('.language-switcher')
  if (!switcher) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.language-switcher {
  position: relative;
  margin: 0 8px;
}

.language-toggle-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}

.language-toggle-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.current-lang {
  font-weight: 500;
}

.dropdown-icon {
  width: 14px;
  height: 14px;
  transition: transform 0.2s ease;
}

.dropdown-icon.rotated {
  transform: rotate(180deg);
}

.language-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  z-index: 1000;
  overflow: hidden;
}

.language-option {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  cursor: pointer;
  transition: background 0.2s ease;
  color: #1A2A2E;
}

.language-option:hover {
  background: rgba(47, 184, 166, 0.1);
}

.language-option.active {
  background: rgba(47, 184, 166, 0.15);
  font-weight: 600;
}

.lang-flag {
  font-size: 1.2rem;
}

.lang-name {
  flex: 1;
  font-size: 0.9rem;
}

.check-icon {
  width: 16px;
  height: 16px;
  color: #2FB8A6;
}
</style>