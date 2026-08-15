import { sdk } from '../sdk'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { INSTANCE_URL_AUTO, uiPort } from '../utils'

const { InputSpec, Value } = sdk

// The dynamicSelect builder enumerates the **current** non-local hostnames of
// the `ui` interface as full origin URLs. It runs when the form opens, so the
// list reflects whatever addresses (LAN / Tor / clearnet) are reachable at
// that moment.
const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const iface = await sdk.host
      .getOwn(effects, 'ui', (h) => h?.bindings[uiPort]?.interfaces['ui'] ?? null)
      .once()
    const origins: string[] =
      iface?.addressInfo?.nonLocal.format('urlstring') ?? []

    const values: Record<string, string> = {
      [INSTANCE_URL_AUTO]: i18n('Auto (derive from current address)'),
    }
    for (const origin of origins) values[origin] = origin

    const stored = await storeJson.read((s) => s.instanceUrl).once()
    const defaultKey =
      stored && origins.includes(stored) ? stored : INSTANCE_URL_AUTO

    return {
      name: i18n('Choose a host'),
      description: i18n(
        'Pin the host origin Memos advertises as MEMOS_INSTANCE_URL. An instance URL enables public anonymous access and is required for RSS feeds and webhooks. For private use, select Auto when no address should be advertised.',
      ),
      warning: null,
      default: defaultKey,
      values,
    }
  }),
})

// Pins (or unpins) the origin Memos uses for MEMOS_INSTANCE_URL. Selecting
// "Auto" clears the pin so main.ts derives the origin from the ui host at
// runtime; selecting a concrete host stores it verbatim. The store write is
// reactive, so setupMain rebuilds the memos daemon with the new
// MEMOS_INSTANCE_URL without a manual restart.
export const setInstanceUrl = sdk.Action.withInput(
  'set-instance-url',
  {
    name: i18n('Set Instance URL'),
    description: i18n(
       'Pin the host origin Memos advertises as MEMOS_INSTANCE_URL. An instance URL enables public anonymous access and is required for RSS feeds and webhooks. For private use, select Auto when no address should be advertised.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  },
  inputSpec,
  async ({ effects }) => {
    const stored = await storeJson.read((s) => s.instanceUrl).once()
    return { url: stored || INSTANCE_URL_AUTO }
  },
  async ({ effects, input }) => {
    const origin = input.url === INSTANCE_URL_AUTO ? '' : input.url
    await storeJson.merge(effects, { instanceUrl: origin })

    return {
      version: '1',
      title: i18n('Instance URL'),
      message: i18n(
        'Instance URL updated. The service restarts automatically to pick up the new host.',
      ),
      result: {
        type: 'single',
        name: i18n('Instance URL'),
        description: null,
        value: origin || i18n('Auto (derive from current address)'),
        masked: false,
        copyable: false,
        qr: false,
      },
    }
  },
)
