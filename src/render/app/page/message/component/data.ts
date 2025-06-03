import EmojiSvg from 'renderModule/assets/image/chat/emoji.svg'
import FileSvg from 'renderModule/assets/image/chat/file.svg'
import ImageSvg from 'renderModule/assets/image/chat/image.svg'
import VoiceSvg from 'renderModule/assets/image/chat/voice.svg'
import VideoSvg from 'renderModule/assets/image/chat/video.svg'

export const toolList = [
  {
    id: 1,
    name: '表情',
    value: 'emoji',
    icon: EmojiSvg
  },
  {
    id: 2,
    name: '图片',
    value: 'image',
    icon: ImageSvg
  },
  {
    id: 3,
    name: '文件',
    value: 'file',
    icon: FileSvg
  },
  {
    id: 4,
    name: '语音',
    value: 'voice',
    icon: VoiceSvg
  },
  {
    id: 5,
    name: '视频',
    value: 'video',
    icon: VideoSvg
  }
]