import { isClient } from '~/shared/utils/is'

export const defaultWindow = isClient ? window : undefined
