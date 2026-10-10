/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * bash 工具实现。在工作目录执行 shell 命令，捕获 stdout/stderr，
 * 带 1-120s 超时、MAX_OUTPUT 字节截断。win32 走 cmd.exe，其余走 /bin/bash。
 */

import { spawn } from 'node:child_process'

const MAX_OUTPUT = 65_536

export function runBash(root: string, command: string, timeoutSec: number): Promise<{ stdout: string, stderr: string, returncode: number, truncated: boolean, durationMs: number }> {
  const timeout = Math.max(1, Math.min(timeoutSec || 30, 120))
  return new Promise((resolve) => {
    const start = Date.now()
    const shell = process.platform === 'win32'
      ? ['cmd.exe', '/d', '/s', '/c', command]
      : ['/bin/bash', '-c', command]
    const child = spawn(shell[0], shell.slice(1), {
      cwd: root,
      windowsHide: true,
    })
    const out: Buffer[] = []
    const err: Buffer[] = []
    let outLen = 0
    let errLen = 0
    let truncated = false

    const take = (chunks: Buffer[], buf: Buffer, len: number) => {
      if (len >= MAX_OUTPUT) {
        truncated = true
        return len
      }
      const room = MAX_OUTPUT - len
      const slice = buf.length > room ? buf.subarray(0, room) : buf
      if (slice.length < buf.length)
        truncated = true
      chunks.push(slice)
      return len + slice.length
    }

    child.stdout?.on('data', (buf: Buffer) => {
      outLen = take(out, buf, outLen)
    })
    child.stderr?.on('data', (buf: Buffer) => {
      errLen = take(err, buf, errLen)
    })

    let settled = false
    const finish = (returncode: number, extra = '') => {
      if (settled)
        return
      settled = true
      clearTimeout(timer)
      const stderr = Buffer.concat(err).toString('utf8')
      resolve({
        stdout: Buffer.concat(out).toString('utf8'),
        stderr: extra ? (stderr ? `${stderr}\n${extra}` : extra) : stderr,
        returncode,
        truncated,
        durationMs: Date.now() - start,
      })
    }

    const timer = setTimeout(() => {
      killChild(child)
      finish(-1, `command timed out after ${timeout}s and was killed`)
    }, timeout * 1000)

    child.on('error', (error) => {
      finish(-1, error.message)
    })
    child.on('close', (code) => {
      finish(code ?? -1)
    })
  })
}

function killChild(child: ReturnType<typeof spawn>): void {
  if (!child.pid) {
    child.kill()
    return
  }
  if (process.platform === 'win32') {
    spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], { windowsHide: true })
    return
  }
  child.kill('SIGKILL')
}
