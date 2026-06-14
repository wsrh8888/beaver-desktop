import type { KeyboardActionId } from 'commonModule/type/mainStore'

/**
 * @description: 键盘快捷键模块接口
 */
export interface IKeyboardModule {
  set: (actionId: KeyboardActionId, binding: string) => Promise<void>
}
