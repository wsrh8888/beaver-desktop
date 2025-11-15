/**
 * 时间格式化工具
 * 参考主流IM（微信、QQ、钉钉等）的时间展示规则
 */

/**
 * 格式化会话时间显示
 * 规则：
 * - 今天：显示时间，如 "14:30"
 * - 昨天：显示 "昨天"
 * - 本周内（周一~周六）：显示星期几，如 "周一"
 * - 今年内：显示月日，如 "3月15日"
 * - 更早：显示年月日，如 "2023年3月15日"
 * 
 * @param timestamp 时间戳（秒或毫秒）或时间戳字符串
 * @returns 格式化后的时间字符串
 */
export function formatConversationTime(timestamp: number | string | null | undefined): string {
  if (!timestamp) {
    return ''
  }

  // 转换为数字时间戳
  let ts = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp
  if (isNaN(ts) || ts <= 0) {
    return ''
  }

  // 自动检测时间戳单位：如果小于 10000000000（10位数），认为是秒级时间戳，需要转换为毫秒
  // 10000000000 秒 = 2001-09-09，这是一个合理的分界点
  if (ts < 10000000000) {
    ts = ts * 1000 // 秒级转毫秒级
  }

  const date = new Date(ts)
  const now = new Date()
  
  // 检查日期是否有效
  if (isNaN(date.getTime())) {
    return ''
  }

  // 今天的时间范围
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000 - 1)
  
  // 昨天的时间范围
  const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000)
  const yesterdayEnd = new Date(todayStart.getTime() - 1)

  // 本周开始（周一）
  const weekStart = new Date(now)
  const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay() // 将周日转换为7
  weekStart.setDate(now.getDate() - dayOfWeek + 1)
  weekStart.setHours(0, 0, 0, 0)

  // 判断时间范围
  if (date >= todayStart && date <= todayEnd) {
    // 今天：显示时间 HH:mm
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${hours}:${minutes}`
  }
  else if (date >= yesterdayStart && date <= yesterdayEnd) {
    // 昨天：显示 "昨天"
    return '昨天'
  }
  else if (date >= weekStart) {
    // 本周内：显示星期几
    const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
    const dayIndex = date.getDay()
    return weekDays[dayIndex]
  }
  else if (date.getFullYear() === now.getFullYear()) {
    // 今年内：显示月日，如 "3月15日"
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${month}月${day}日`
  }
  else {
    // 更早：显示年月日，如 "2023年3月15日"
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}年${month}月${day}日`
  }
}

