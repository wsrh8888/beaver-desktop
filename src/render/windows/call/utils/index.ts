/**
 * 格式化通话时间 (秒 -> mm:ss)
 */
export const formatDuration = (s: number): string => {
  const m = Math.floor(s / 60)
  const rs = s % 60
  return `${m.toString().padStart(2, '0')}:${rs.toString().padStart(2, '0')}`
}

/**
 * 解析 URL 参数为对象
 */
export const getUrlParams = (): any => {
  const params = new URLSearchParams(window.location.search)
  const p: any = {}
  params.forEach((value, key) => {
    p[key] = value
  })
  return p
}
