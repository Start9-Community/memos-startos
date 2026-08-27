import { sdk } from './sdk'

// StartOS stops the service before a backup, so the SQLite file is quiescent
// and a whole-volume copy needs no dump.
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main'),
)
