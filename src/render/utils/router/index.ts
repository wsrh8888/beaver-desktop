import { useRouter } from 'vue-router'

/**
 * 路由跳转工具函数
 * 添加setTimeout避免某些跳转问题
 */
export const useRouterHelper = () => {
  const router = useRouter()

  const routerHelper = {
    push: (path: string) => {
      setTimeout(() => {
        router.push({ path })
      }, 0)
    },

    replace: (path: string) => {
      setTimeout(() => {
        router.replace({ path })
      }, 0)
    },
  }

  return routerHelper
}
