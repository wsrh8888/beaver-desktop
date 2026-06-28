class BatchQueue {
  private _q: any[]

  constructor(q: any[] = []) {
    this._q = q
  }

  enqueue(...elements: any[]) {
    this._q.push(...elements)
  }

  multiDequeue(count = 1) {
    if (this.length() < count) {
      return []
    }
    return this._q.splice(0, count)
  }

  multiFront(count = 1) {
    return this._q.slice(0, count)
  }

  empty() {
    return this.length() === 0
  }

  length() {
    return this._q.length
  }
}

export default BatchQueue
