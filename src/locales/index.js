import { createI18n } from 'vue-i18n'
import en from './en.json'
import am from './am.json'
import om from './om.json'

// Get saved language from localStorage or default to 'en'
const savedLanguage = localStorage.getItem('language') || 'en'

const i18n = createI18n({
  legacy: false,
  locale: savedLanguage,
  fallbackLocale: 'en',
  messages: {
    en,
    am,
    om
  }
})

export default i18n