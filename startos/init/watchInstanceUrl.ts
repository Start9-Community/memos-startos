import { setInstanceUrl } from '../actions/setInstanceUrl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const watchInstanceUrl = sdk.setupOnInit(async (effects) => {
  await sdk.action.createOwnTask(effects, setInstanceUrl, 'optional', {
    reason: i18n(
      'If you use RSS feeds or webhooks into Memos, pin the Instance URL to your external domain so generated links resolve correctly. Otherwise the URL is derived automatically.',
    ),
  })
})
