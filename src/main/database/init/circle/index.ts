import { initCirclesTable } from './circles'

export const initCircleTables = (db: any) => {
  const sqlite = db.$client
  initCirclesTable(sqlite)
}
