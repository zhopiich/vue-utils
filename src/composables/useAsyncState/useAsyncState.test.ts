import type { EffectScope } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useAsyncState } from './useAsyncState'

describe('useAsyncState', () => {
  it('should be defined', () => {
    expect(useAsyncState).toBeDefined()
  })

  let scope: EffectScope | undefined
  function setup<T, Params extends unknown[]>(
    ...args: Parameters<typeof useAsyncState<T, Params>>
  ) {
    scope = effectScope()
    return scope.run(() => useAsyncState(...args))!
  }

  afterEach(() => {
    scope?.stop()
    scope = undefined
  })

  it('should trigger onSuccess upon a successful request', async () => {
    const onSuccess = vi.fn()
    const { execute } = setup((res: string) => Promise.resolve(res), 'initial', { onSuccess })

    await execute('result')
    expect(onSuccess).toHaveBeenCalled()
    expect(onSuccess).toHaveBeenCalledWith('result')
  })
})
