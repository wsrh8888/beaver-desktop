/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 聊天「圈子名片」用的 HTTP。
 * 故意与 @beaver-im/app-circle 重复一份：名片是聊天业务，不跨包复用圈子模块。
 */
import { getBaseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

export function getCircleDetailApi(data: { circleId: string }) {
  return ajax<{
    circleId: string
    name: string
    description: string
    avatar: string
    memberCount: number
    role: number
  }>({
    method: 'GET',
    params: data,
    url: `${getBaseUrl()}/api/circle/v1/circle/detail`,
  })
}

export function joinCircleApi(data: { circleId?: string, inviteCode?: string }) {
  return ajax<{ status: number, circleId?: string }>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/circle/v1/circle/join`,
  })
}

export function resolveCircleInviteApi(data: { code: string }) {
  return ajax<{
    code: string
    circleId: string
    name: string
    avatar: string
    description: string
    memberCount: number
    valid: boolean
    alreadyJoined: boolean
  }>({
    method: 'GET',
    params: data,
    url: `${getBaseUrl()}/api/circle/v1/circle/invite_code`,
  })
}
