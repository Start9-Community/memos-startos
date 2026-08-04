import { setInstanceUrl } from '../actions/setInstanceUrl'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

// Only matters for users who consume RSS feeds or set up webhooks pointing into
// Memos: those absolute URLs must be stable on an external domain. Password/
// normal use works without pinning — the URL is derived automatically.
//
// Re-registered on every startup — tasks dedupe by their default replayId, so
// this never stacks duplicates.
export const watchInstanceUrl = sdk.setupOnInit(async (effects) => {
  await sdk.action.createOwnTask(effects, setInstanceUrl, 'optional', {
    reason: i18n(
      'If you use RSS feeds or webhooks into Memos, pin the Instance URL to your external domain so generated links resolve correctly. Otherwise the URL is derived automatically.',
    ),
  })
})
