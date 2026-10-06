import { sdk } from '../sdk'
import { resetPassword } from './resetPassword'
import { primaryUrl } from './setInstanceUrl'

export const actions = sdk.Actions.of()
  .addAction(primaryUrl.action)
  .addAction(resetPassword)
