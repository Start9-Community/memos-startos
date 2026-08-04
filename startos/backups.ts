import { sdk } from './sdk'

// Memos stores everything (SQLite DB `memos_prod.db` + uploaded assets) under
// /var/opt/memos on the `main` volume. StartOS stops the service before taking
// a backup, so the SQLite file is quiescent while rsync runs — a plain
// whole-volume snapshot is correct and safe (no dump needed for SQLite here).
// If assets grow large in practice, switch this volume to .addSync() with an
// exclude list for incremental rsync (same as linkwarden's note on /data/data).
export const { createBackup, restoreInit } = sdk.setupBackups(async () =>
  sdk.Backups.ofVolumes('main'),
)
