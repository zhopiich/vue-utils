import { createScope } from '@test/utils/scopeHelper'
import { describe, expect, it, vi } from 'vitest'
import { promiseTimeout } from '~/utils/promise'
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

  it('should trigger onError when request fails', async () => {
    const { withScope } = createScope()
    const testError = new Error('Network Error')
    const onError = vi.fn()

    const { error, execute } = withScope(() => useAsyncState(
      () => Promise.reject(testError),
      'initial',
      { immediate: false, onError },
    ))
    await execute()
    expect(error.value).toBe(testError)
    expect(onError).toHaveBeenCalledTimes(1)
    expect(onError).toHaveBeenCalledWith(testError)
  })

  function createDeferredPromise<T>() {
    let resolve!: (value: T) => void
    let reject!: (reason?: unknown) => void
    const promise = new Promise<T>((res, rej) => {
      resolve = res
      reject = rej
    })
    return { promise, resolve, reject }
  }

  it('should only load after execute when immediate is false', async () => {
    const { withScope } = createScope()
    const { promise } = createDeferredPromise<number>()
    const { isLoading, execute } = withScope(() =>
      useAsyncState(() => promise, 0, { immediate: false }))

    expect(isLoading.value).toBe(false)
    execute()
    expect(isLoading.value).toBe(true)
  })

  it('should update state and finish flags when promise resolves', async () => {
    const { withScope } = createScope()
    const { promise, resolve } = createDeferredPromise<string>()
    const { isLoading, isFinished, execute, state } = withScope(() =>
      useAsyncState(() => promise, 'initial', { immediate: false }))

    const p = execute()
    expect(isLoading.value).toBe(true)
    expect(isFinished.value).toBe(false)
    expect(state.value).toBe('initial')

    resolve('hello')
    await p
    expect(isLoading.value).toBe(false)
    expect(isFinished.value).toBe(true)
    expect(state.value).toBe('hello')
  })

  it('should execute immediately when immediate is true', async () => {
    const { withScope } = createScope()
    const fetchFn = vi.fn().mockResolvedValue(42)
    const { isLoading, isFinished, state } = withScope(() =>
      useAsyncState(fetchFn, 0, { immediate: true }))

    expect(isLoading.value).toBe(true)
    expect(fetchFn).toHaveBeenCalledTimes(1)
    await nextTick()
    expect(state.value).toBe(42)
    expect(isLoading.value).toBe(false)
    expect(isFinished.value).toBe(true)
  })

  it('should reset state on each execution when resetOnExecute is true', async () => {
    const { withScope } = createScope()
    const { state, execute } = withScope(() =>
      useAsyncState(
        (returnValue: string, timeout: number) =>
          promiseTimeout(timeout).then(() => returnValue),
        'initial',
        { immediate: false, resetOnExecute: true },
      ))

    // initial state
    expect(state.value).toBe('initial')

    // first execution, the state should be initial
    execute('updated', 1)
    expect(state.value).toBe('initial')

    await promiseTimeout(2)
    expect(state.value).toBe('updated')

    // second execution, should reset to initial immediately
    execute('updated-again', 1)
    expect(state.value).toBe('initial')
  })

  it('should take latest request result regardless of completion order', async () => {
    const { withScope } = createScope()
    const deferred1 = createDeferredPromise<string>()
    const deferred2 = createDeferredPromise<string>()

    const fetchFn = vi.fn()
      .mockReturnValueOnce(deferred1.promise)
      .mockReturnValueOnce(deferred2.promise)

    const { state, execute } = withScope(() =>
      useAsyncState(fetchFn, '', { immediate: false }))

    const p1 = execute()
    const p2 = execute()

    deferred2.resolve('second-result')
    await p2

    deferred1.resolve('first-result')
    await p1

    expect(state.value).toBe('second-result')
  })

  it('should set state from the latest execution', async () => {
    const { withScope } = createScope()
    const { execute, state } = withScope(() => useAsyncState(
      (returnValue: string, timeout: number) =>
        promiseTimeout(timeout).then(() => returnValue),
      '',
    ))

    await Promise.all([
      execute('first', 10),
      execute('second', 5),
      execute('last', 0),
    ])
    expect(state.value).toBe('last')
  })
})
