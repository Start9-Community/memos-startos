import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// Install-only initial state. instanceUrl='' = auto-derive MEMOS_INSTANCE_URL.
// On restore the `main` volume carries store.json forward, so we must NOT
// overwrite the user's pin here (skip every kind except 'install').
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await storeJson.merge(effects, { instanceUrl: '' })
})
