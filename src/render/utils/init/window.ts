// 添加网络连接事件监听器，当网络连接时触发
window.addEventListener('online', () => {
  console.info('[addNetWorkListener][online] 网络已连接')
})

// 添加网络断开事件监听器，当网络断开时触发
window.addEventListener('offline', () => {
  console.error('[addNetWorkListener][offline] 网络已断开')
})

// 设置全局异常处理
window.onerror = (message, source, lineno, colno, error) => {
  console.error(`[GlobalErrorHandler] 未捕获的错误: ${message} at ${source}:${lineno}:${colno}`, error)
}
