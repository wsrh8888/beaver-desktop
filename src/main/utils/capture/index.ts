import type { Size } from 'electron'
import { desktopCapturer } from 'electron'

export const captureScreen = (option: Size) => {
  const thumbSize = {
    width: option.width,
    height: option.height,
  }
  let options: Electron.SourcesOptions = { types: ['screen'], thumbnailSize: thumbSize }
  return new Promise((resolve, reject) => {
    desktopCapturer
      .getSources(options)
      .then((sources) => {
        const sourcesLen = sources.length
        for (let i = 0; i < sourcesLen; i++) {
          const source = sources[i]
          if (
            source.name.toLowerCase() === 'entire screen'
            || source.name.toLowerCase() === 'screen 1'
            || source.name === '屏幕 1'
            || source.name === '整个屏幕' // 对应 "Entire Screen" 的中文
          ) {
            resolve(source.thumbnail.toJPEG(90))
            return
          }
        }
        if (sources[0]) {
          resolve(sources[0].thumbnail.toJPEG(90))
          return
        }
        resolve(`截屏异常 sources: ${JSON.stringify(sources)}`)
      })
      .catch((e) => {
        reject(e)
      })
  })
}
