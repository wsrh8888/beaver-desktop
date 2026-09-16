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

/**
 * 主进程通知渲染进程
 */
export enum NotificationModule {
  /**
   * 群组通知
   */
  DATABASE_GROUP = 'database:group',
  /**
   * 圈子通知（通道与 app-circle CIRCLE_NOTIFICATION_MODULE 同值）
   */
  DATABASE_CIRCLE = 'database:circle',
  /**
   * 好友通知
   */
  DATABASE_FRIEND = 'database:friend',
  /**
   * 用户通知
   */
  DATABASE_USER = 'database:user',
  /**
   * 聊天消息通知
   */
  DATABASE_CHAT = 'database:chat',
  /**
   * 应用生命周期状态通知
   * 简化的状态流：连接 -> 同步 -> 就绪
   */
  APP_LIFECYCLE = 'app:lifecycle',

  /**
   * 搜索结果通知到验证窗口
   */
  SEARCH_TO_VERIFY = 'search:to:verify',
  /**
   * 媒体查看器更新通知
   */
  MEDIA_VIEWER = 'media:viewer',
  /**
   * 表情通知
   */
  EMOJI = 'database:emoji',
  /**
   * 通知中心相关数据
   */
  DATABASE_NOTIFICATION = 'database:notification',
  /**
   * 通话通知
   */
  CALL = 'ws:call',
}

export enum NotificationCallCommand {
  /**
   * 发起来电 (主叫方发起)
   */
  CALL_START = 'callStart',
  /**
   * 收到来电 (被叫方收到邀请)
   */
  CALL_INVITE = 'callInvite',
  /**
   * 加入通话 (被叫方点击接听进入)
   */
  CALL_JOIN = 'callJoin',
  /**
   * 对方同意 (已接听)
   */
  CALL_ACCEPTED = 'callAccepted',
  /**
   * 对方拒绝
   */
  CALL_REJECTED = 'callRejected',
  /**
   * 通话挂断
   */
  CALL_HANGUP = 'callHangup',
  /**
   * 通话取消 (未接前取消)
   */
  CALL_CANCELLED = 'callCancelled',
  /**
   * 流程结束 (App 列表移除)
   */
  CALL_ENDED = 'callEnded',
}

export interface INotificationPayload<M extends NotificationModule = NotificationModule.CALL> {
  command: NotificationCallCommand
  data?: any
}
