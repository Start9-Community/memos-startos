import { sdk } from '../sdk'
import { resetPassword } from './resetPassword'
import { setInstanceUrl } from './setInstanceUrl'

export const actions = sdk.Actions.of()
  .addAction(setInstanceUrl)
  .addAction(resetPassword)
