/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 轻量级符号识别（语言无关启发式，非 AST）。symbol-search、outline 共用。
 *
 * 覆盖 function/class/interface/type/enum/def/func/fn 声明，以及 const/let/var 赋值，
 * 跨 JS/TS/Python/Go/Rust/PHP/Swift 等常见语言。靠关键字 + 标识符匹配，不百分百准，
 * 但比 grep 纯文本匹配更能锁定「声明位置」。要 AST 级准确需上 tree-sitter。
 *
 * 允许 export/default/declare/abstract/async 等前缀修饰（TS/JS 常见）。
 */

/** 函数/类/接口/类型等声明行。第 7 组为标识符名。 */
const DECL_RE = /^(export\s+)?(default\s+)?(declare\s+)?(abstract\s+)?(async\s+)?(function|class|interface|type|enum|def|func|fn)\s+([A-Za-z_$][\w$]*)/

/** const/let/var 赋值声明行。第 3 组为标识符名。 */
const VAR_RE = /^(export\s+)?(const|let|var)\s+([A-Za-z_$][\w$]*)/

/** 判断一行是否为声明行。 */
export function isDeclaration(line: string): boolean {
  return DECL_RE.test(line) || VAR_RE.test(line)
}

/** 从声明行提取被声明的标识符名；非声明行返回 null。 */
export function declaredName(line: string): string | null {
  const m1 = line.match(DECL_RE)
  if (m1)
    return m1[7]
  const m2 = line.match(VAR_RE)
  if (m2)
    return m2[3]
  return null
}
