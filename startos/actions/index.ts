import { sdk } from '../sdk'
import { setInstanceUrl } from './setInstanceUrl'

export const actions = sdk.Actions.of().addAction(setInstanceUrl)
