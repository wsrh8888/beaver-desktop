// src/render/login/utils/rem.ts - 登录窗口适配

// 基准设计宽度（登录窗口：800*500）
const BASE_SIZE = 800
// 设置最大字体大小，避免在大屏幕下字体过大
const MAX_FONT_SIZE = 64

export function setupRem(): void {
  const html = document.documentElement

  function updateRem() {
    // 获取视窗宽度
    const viewWidth = html.clientWidth || window.innerWidth

    // 计算根字体大小 (以16px为基准，与postcss-pxtorem的rootValue保持一致)
    let fontSize = 16 * (viewWidth / BASE_SIZE)

    // 限制最大字体大小
    if (fontSize > MAX_FONT_SIZE) {
      fontSize = MAX_FONT_SIZE
    }

    // 设置根字体大小
    html.style.fontSize = `${fontSize}px`
  }

  // 初始设置
  updateRem()

  // 窗口大小变化时更新
  window.addEventListener('resize', updateRem)

  // 页面显示/切换时更新
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      updateRem()
    }
  })
}

// 自动执行
setupRem()
