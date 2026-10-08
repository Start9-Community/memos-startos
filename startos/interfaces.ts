import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiPort } from './utils'
import { primaryUrl } from './actions/setInstanceUrl'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const multi = sdk.MultiHost.of(effects, 'ui')
  const origin = await multi.bindPort(uiPort, {
    protocol: 'http',
    preferredExternalPort: uiPort,
  })

  const ui = sdk.createInterface(effects, {
    name: i18n('Web Interface'),
    id: 'ui',
    description: i18n(
      'Self-hosted note-taking service — capture and organize Markdown notes.',
    ),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
    preferredLauncherAddress: await primaryUrl.bestUsable(effects).const(),
  })

  return [await origin.export([ui])]
})
