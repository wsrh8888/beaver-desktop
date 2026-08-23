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

import type { IAppModule } from 'commonModule/type/preload/app'

function parseAdditionalArguments() {
  const args = process.argv.slice(1)
  let params = {
    appRootPath: '',
    env: 'prod' as 'prod' | 'test',
    token: undefined as string | undefined,
    devicedId: undefined as string | undefined,
    version: '1.0.0.0' as string,
  }
  args.forEach((arg) => {
    const paramsPrefix = '--custom='
    if (arg.startsWith(paramsPrefix)) {
      try {
        const customParams = JSON.parse(arg.substring(paramsPrefix.length))
        params = { ...params, ...customParams }
      }
      catch (e) {
        console.error('Failed to parse custom params from process arguments:', e)
      }
    }
  })
  return params
}

const appParsedArgs = parseAdditionalArguments()

// --- Application Info Module ---
export const appModule: IAppModule = {
  versions: process.versions,
  rootPath: appParsedArgs.appRootPath,
  token: appParsedArgs.token,
  env: appParsedArgs.env,
  devicedId: appParsedArgs.devicedId,
  version: appParsedArgs.version,
}
