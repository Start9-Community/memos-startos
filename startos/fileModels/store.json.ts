import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

// Package-local state. We only persist an optional MEMOS_INSTANCE_URL pin;
// empty string means "derive at runtime from the ui host" (see main.ts).
// Seeded to '' at install (init/seedFiles.ts) and NOT regenerated on restore.
const shape = z.object({
  instanceUrl: z.string().catch(''),
})

export const storeJson = FileHelper.json(
  { base: sdk.volumes.main, subpath: 'store.json' },
  shape,
)
