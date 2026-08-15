import { i18n } from './i18n'
import { sdk } from './sdk'
import { storeJson } from './fileModels/store.json'
import { uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Memos'))

  const instanceUrlPin = await storeJson.read((s) => s.instanceUrl).const(effects)

  // Derive MEMOS_INSTANCE_URL from the live ui interface address (reactive),
  // preferring publicly-reachable hosts (clearnet/Tor), then any non-local
  // address (LAN). A pin wins over derivation; no address means private mode.
  const uiInterface = await sdk.host
    .getOwn(effects, 'ui', (h) => h?.bindings[uiPort]?.interfaces['ui'] ?? null)
    .const()
  const addressInfo = uiInterface?.addressInfo ?? null
  const firstNonLocal = (list: string[] | undefined) =>
    list && list.length ? list[0] : null
  const instanceUrl =
    instanceUrlPin ||
    firstNonLocal(addressInfo?.public.format('urlstring')) ||
    firstNonLocal(addressInfo?.nonLocal.format('urlstring')) ||
    ''

  const memosSub = sdk.SubContainer.of(
    effects,
    { imageId: 'memos' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/var/opt/memos',
      readonly: false,
    }),
    'memos',
  )

  return sdk.Daemons.of(effects).addDaemon('memos', {
    subcontainer: memosSub,
    exec: {
      // Preserve the image entrypoint: /usr/local/memos/entrypoint.sh chowns
      // /var/opt/memos to 10001:10001 (as root) then exec su-exec 10001:10001
      // memos. NO fallback argv needed — the image has a real Entrypoint (not a
      // CMD-only image), verified via the registry config blob (see README.md).
      command: sdk.useEntrypoint(),
      // runAsInit is intentionally OMITTED: the image uses `su-exec` (an exec
      // tool that replaces the process), NOT an init supervisor (s6/tini/
      // dumb-init/supervisord), so it does not need to be PID 1 — per the
      // prebuilt-image recipe.
      env: {
        MEMOS_PORT: String(uiPort),
        MEMOS_DATA: '/var/opt/memos',
        MEMOS_DRIVER: 'sqlite',
        MEMOS_INSTANCE_URL: instanceUrl,
        MEMOS_LOG_LEVEL: 'info',
        // Do NOT set MEMOS_UID / MEMOS_GID: the entrypoint defaults to 10001
        // and chowns the volume itself; overriding to 0 makes memos run as
        // root permanently (the rootless-Docker case the entrypoint's
        // MEMOS_ENTRYPOINT_SWITCHED guard protects against). See README.md.
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
