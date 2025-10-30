import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

// 主题配置类型定义
interface ThemeConfig {
  name: string
  colors: Record<string, string>
}

// 主题颜色键类型
type ThemeColorKey = string

// 默认主题配置
const themes: Record<string, ThemeConfig> = {
  default: {
    name: 'default',
    colors: {
      'primary': '#FF7D45',
      'secondary': '#636E72',
      'background': '#FFFFFF',
      'surface': '#F9FAFB',
      'text': '#2D3436',
      'text-secondary': '#636E72',
      'border': '#EBEEF5',
      'success': '#4CAF50',
      'warning': '#FFC107',
      'error': '#FF5252',
    },
  },
  dark: {
    name: 'dark',
    colors: {
      'primary': '#FF7D45',
      'secondary': '#A0A0A0',
      'background': '#1A1A1A',
      'surface': '#2D2D2D',
      'text': '#FFFFFF',
      'text-secondary': '#A0A0A0',
      'border': '#404040',
      'success': '#4CAF50',
      'warning': '#FFC107',
      'error': '#FF5252',
    },
  },
}

export const useThemeStore = defineStore('useThemeStore', () => {
  // 当前主题名称
  const currentTheme = ref<string>('default')

  // 当前主题配置
  const currentThemeConfig = computed(() => themes[currentTheme.value])

  // 获取所有可用主题
  const availableThemes = computed(() => Object.values(themes))

  // 切换主题
  const setTheme = (themeName: string) => {
    if (themes[themeName]) {
      currentTheme.value = themeName
      applyTheme(themes[themeName])
      // 保存到本地存储
      localStorage.setItem('app_theme', themeName)
    }
  }

  // 应用主题到CSS变量
  const applyTheme = (theme: ThemeConfig) => {
    try {
      // 设置页面根元素的data-theme属性
      const root = document.documentElement
      root.setAttribute('data-theme', theme.name)

      // 设置全局CSS变量
      Object.entries(theme.colors).forEach(([key, value]) => {
        root.style.setProperty(`--theme-${key}`, value)
      })
    }
    catch (error) {
      console.warn('应用主题时出错:', error)
    }
  }

  // 初始化主题
  const initTheme = () => {
    // 从本地存储获取主题设置
    const savedTheme = localStorage.getItem('app_theme')
    if (savedTheme && themes[savedTheme]) {
      currentTheme.value = savedTheme
    }
    // 应用当前主题
    applyTheme(currentThemeConfig.value)
  }

  // 获取主题颜色
  const getThemeColor = (colorKey: ThemeColorKey) => {
    return currentThemeConfig.value.colors[colorKey]
  }

  return {
    currentTheme,
    currentThemeConfig,
    availableThemes,
    setTheme,
    initTheme,
    getThemeColor,
  }
})
