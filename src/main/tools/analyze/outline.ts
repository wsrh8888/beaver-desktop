/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * outline 工具实现。提取一个文件的符号大纲（函数/类/接口/类型等声明 + 行号），
 * 帮 LLM 快速理解文件结构，不用读全文。结果带 MAX_OUTLINE 上限截断。
 */

import fs from 'node:fs'
import { resolveInRoot } from '../shared/root'
import { isDeclaration } from './patterns'

const MAX_OUTLINE = 300

export async function outline(root: string, args: Record<string, any>): Promise<string> {
  const file = resolveInRoot(root, String(args.path || ''))
  const stat = await fs.promises.stat(file)
  if (!stat.isFile())
    throw new Error(`not a file: ${args.path}`)
  const text = await fs.promises.readFile(file, 'utf8')
  const lines = text.split(/\r?\n/)
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    if (!isDeclaration(lines[i]))
      continue
    out.push(`${i + 1}: ${lines[i].trim()}`)
    if (out.length >= MAX_OUTLINE) {
      out.push(`(大纲截断至 ${MAX_OUTLINE} 条)`)
      break
    }
  }
  return out.length ? out.join('\n') : '(no declarations found)'
}
