import { debounce, random } from 'lodash-es'
import BatchQueue from './batch-queue'

const kTimeValve = 5 * 1000
const kCountValve = 32
const kMaxCount = 128
const kMaxQueue = 10240
const kMaxDeep = 30

interface WriterInfo {
  writer: {
    write: (logs: any[]) => Promise<void>
  }
  queue: BatchQueue
}

class LogConsumer {
  private _writting = false
  private _stop = false
  private _writePromise: Promise<void> = Promise.resolve()
  private _writerMap = new Map<string, WriterInfo>()
  private _timeoutMap = new Map<string, ReturnType<typeof debounce>>()
  private _defaultWriterTag = ''

  registerWriter(tag: string, writer: WriterInfo['writer'], isDefault = false) {
    const info: WriterInfo = { writer, queue: new BatchQueue() }
    this._writerMap.set(tag, info)
    this._timeoutMap.set(
      tag,
      debounce(() => {
        this._timeout(info)
      }, kTimeValve),
    )
    if (isDefault) {
      this._defaultWriterTag = tag
    }
  }

  consume(log: any, tag?: string) {
    const writerTag = tag || this._defaultWriterTag
    const info = this._writerMap.get(writerTag)
    if (!info) {
      return
    }
    info.queue.enqueue(log)
    this._check(info, this._timeoutMap.get(writerTag))
  }

  async stop(timeout = 3000) {
    if (!this.isWritting()) {
      for (const info of this._writerMap.values()) {
        this._writeAsAbility(info)
      }
    }
    this._stop = true
    return Promise.race([
      new Promise(resolve => setTimeout(resolve, timeout)),
      this._writePromise,
    ])
  }

  isWritting() {
    return this._writting
  }

  private _check(info: WriterInfo, timeoutDbc?: ReturnType<typeof debounce>) {
    if (!this._canWrite()) {
      return false
    }
    const queueLength = info.queue.length()
    if (queueLength >= kCountValve) {
      this._writeAsAbility(info)
      this._checkAll()
    }
    else if (queueLength > 0) {
      timeoutDbc?.()
    }
    return false
  }

  private _checkAll() {
    for (const [key, value] of this._writerMap.entries()) {
      this._check(value, this._timeoutMap.get(key))
    }
  }

  private async _timeout(info: WriterInfo) {
    await this._writePromise
    return this._writeAsAbility(info)
  }

  private _writeAsAbility(info: WriterInfo) {
    const len = info.queue.length()
    if (len > 0) {
      const count = len > kMaxCount ? kMaxCount : len
      this._writePromise = this._write(info, count)
    }
    return this._writePromise
  }

  private async _write(info: WriterInfo, count: number) {
    if (!this._canWrite()) {
      return
    }
    this._writting = true
    await this._writeUntilSuccess(info, count, 0)
    this._writting = false
    info.queue.multiDequeue(count)
  }

  private async _writeUntilSuccess(info: WriterInfo, count: number, deep: number) {
    try {
      await info.writer.write(info.queue.multiFront(count))
    }
    catch {
      if (info.queue.length() < kMaxQueue && deep < kMaxDeep) {
        await new Promise(resolve => setTimeout(resolve, random(2000, 3000)))
        return this._writeUntilSuccess(info, count, deep + 1)
      }
    }
  }

  private _canWrite() {
    return !this.isWritting() && !this._stop
  }
}

export default LogConsumer
