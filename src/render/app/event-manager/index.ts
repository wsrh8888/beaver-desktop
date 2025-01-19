import { cloneDeep } from 'lodash-es';
import EventEmitter from 'events';

/**
 * @description: 事件中心
 */
export class EventManager extends EventEmitter {
  
  emit(event: string | symbol, ...args: unknown[]): boolean {
    const content = cloneDeep(args); // 如果没有特别需求，不必深度克隆
    return super.emit(event, ...content);
  }

  /**
   * @description: 注册事件
   * @param {string | symbol} command 事件名称
   * @param {Function} callBack 回调函数
   */
  on(command: string | symbol, callBack: (...args: unknown[]) => void): this {
    if (!command) {
      throw new Error('command is undefined');
    }
    
    if (typeof callBack !== 'function') {
      throw new Error('callback must be a function');
    }

    return this.addListener(command, callBack);
  }

  
  off(command: string | symbol, callBack: (...args: unknown[]) => void): this {
    if (!command) {
      throw new Error('command is undefined');
    }
    
    if (typeof callBack !== 'function') {
      throw new Error('callback must be a function');
    }

    return this.removeListener(command, callBack);
  }
}

export default new EventManager();
