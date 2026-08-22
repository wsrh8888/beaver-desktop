import circleSync from './circle'

export const circleDatasync = new class CircleDatasync {
  async checkAndSync() {
    await circleSync.checkAndSync()
  }
}()
