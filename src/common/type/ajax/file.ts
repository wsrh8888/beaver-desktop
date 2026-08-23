/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
  fileUrl: string
  originalName: string
  fileInfo?: IFileInfo
}

// 文件上传结果类型（用于内部Promise返回）
export interface IFileUploadResult {
  fileUrl: string
  originalName: string
  fileInfo?: IFileInfo
}
