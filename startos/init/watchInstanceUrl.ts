import { primaryUrl } from '../actions/setInstanceUrl'
import { i18n } from '../i18n'

export const watchInstanceUrl = primaryUrl.setupTask('optional', {
  reason: i18n(
    'If Memos should advertise a stable external origin for generated links and trusted-origin checks, pin the Instance URL to your domain. Otherwise it is derived automatically from the current address.',
  ),
})
