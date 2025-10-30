// 文件预览相关类型定义
// 根据后端 file_api.api 文件，只保留文件预览相关的类型

// 文件信息（对应后端 FileInfo）
export interface IFileInfo {
  type: string
  imageFile?: IImageFile
  videoFile?: IVideoFile
  audioFile?: IAudioFile
}

// 图片文件信息（对应后端 ImageFile）
export interface IImageFile {
  width: number
  height: number
}

// 视频文件信息（对应后端 VideoFile）
export interface IVideoFile {
  width: number
  height: number
  duration: number
}

// 音频文件信息（对应后端 AudioFile）
export interface IAudioFile {
  duration: number
}

// 文件上传请求（对应后端 FileReq）
export interface IFileReq {
  // 用户ID从请求头获取，这里不需要参数
}

// 文件上传响应（对应后端 FileRes）
export interface IFileRes {
  fileName: string
  originalName: string
  fileInfo?: IFileInfo
}

// 文件上传结果类型（用于内部Promise返回）
export interface IFileUploadResult {
  fileName: string
  originalName: string
  fileInfo?: IFileInfo
}
