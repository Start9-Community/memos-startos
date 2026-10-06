import { i18n } from './i18n'
import { sdk } from './sdk'
import { primaryUrl } from './actions/setInstanceUrl'
import { dataDir, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Memos'))

  // Memos sets its access mode from this once, on first start: empty is private.
  const instanceUrl = (await primaryUrl.bestUsable(effects).const()) ?? ''

  const memosSub = sdk.SubContainer.of(
    effects,
    { imageId: 'memos' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: dataDir,
      readonly: false,
    }),
    'memos',
  )

  return sdk.Daemons.of(effects).addDaemon('memos', {
    subcontainer: memosSub,
    exec: {
      command: sdk.useEntrypoint(),
      env: {
        MEMOS_PORT: String(uiPort),
        MEMOS_DATA: dataDir,
        MEMOS_DRIVER: 'sqlite',
        MEMOS_INSTANCE_URL: instanceUrl,
        MEMOS_LOG_LEVEL: 'info',
      },
    },
    ready: {
      display: i18n('Web Interface'),
      gracePeriod: 30_000,
      fn: () =>
        sdk.healthCheck.checkWebUrl(effects, `http://127.0.0.1:${uiPort}/`, {
          successMessage: i18n('The web interface is ready'),
          errorMessage: i18n('The web interface is not ready'),
        }),
    },
    requires: [],
  })
})
