
import { fileURLToPath } from 'node:url'
import path from 'node:path'

export const __dirname = path.dirname(fileURLToPath(import.meta.url))

export const getRootPath = () => {
  if (process.env.NODE_ENV === 'development') {
    return path.resolve(__dirname, '../')
  }
  return path.resolve(__dirname, '../../../')
}
