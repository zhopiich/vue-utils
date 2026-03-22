import { createScope } from '@test/utils/scopeHelper'
import { describe, expect, it, vi } from 'vitest'
import { useAsyncState } from './useAsyncState'

describe('useAsyncState', () => {
  it('should be defined', () => {
    expect(useAsyncState).toBeDefined()
  })

  it('should trigger onSuccess upon a successful request', async () => {
    const { withScope } = createScope()
    const onSuccess = vi.fn()
    const { execute } = withScope(() =>
      useAsyncState((res: string) => Promise.resolve(res), 'initial', { onSuccess }),
    )

    await execute('result')
    expect(onSuccess).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith('result')
  })
})
