import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const primaryUrl = sdk.setupPrimaryUrl({
  id: 'set-instance-url',
  hostId: 'ui',
  interfaceId: 'ui',
  metadata: {
    name: i18n('Set Instance URL'),
    description: i18n(
      'Pin the canonical external origin Memos reports as its instance URL, used for generated links and trusted-origin checks. This does not control public access — set that in Memos under Settings → System → Access and policies. Until one is chosen, Memos uses your public domain if you have one, otherwise the .local address.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  field: { name: i18n('Choose a host'), description: null },
  get: storeJson.read((s) => s.instanceUrl),
  set: (effects, url) => storeJson.merge(effects, { instanceUrl: url }),
})
