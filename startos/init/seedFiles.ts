import { storeJson } from '../fileModels/store.json'
import { sdk } from '../sdk'

// A restore carries store.json forward on the `main` volume, so the user's pin
// must not be overwritten.
export const seedFiles = sdk.setupOnInit(async (effects, kind) => {
  if (kind !== 'install') return
  await storeJson.merge(effects, { instanceUrl: '' })
})
