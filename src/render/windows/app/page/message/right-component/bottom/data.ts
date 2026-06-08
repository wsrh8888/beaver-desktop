import EmojiSvg from 'renderModule/assets/image/chat/emoji.svg'
import FileSvg from 'renderModule/assets/image/chat/file.svg'
import ImageSvg from 'renderModule/assets/image/chat/image.svg'
import ScreenshotSvg from 'renderModule/assets/image/chat/screenshot.svg'

/** PC 端不提供「按住说话」语音消息发送，仅支持播放移动端发来的 type=5 语音 */
export const toolList = [
  {
    id: 3,
    name: '文件',
    value: 'file',
    icon: FileSvg,
  },
  {
    id: 6,
    name: '截屏',
    value: 'screenshot',
    icon: ScreenshotSvg,
  },
  {
    id: 1,
    name: '表情',
    value: 'emoji',
    icon: EmojiSvg,
  },
  {
    id: 2,
    name: '图片',
    value: 'image',
    icon: ImageSvg,
  },
]
