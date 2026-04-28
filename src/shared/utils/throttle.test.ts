import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { throttle } from './throttle'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be called after a delay', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 300)

    throttledFn('foo')
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledWith('foo')
  })

  it('should delay the execution until timeout', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 1000)

    throttledFn('foo')
    vi.advanceTimersByTime(300)
    throttledFn('bar')
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(700)
    expect(fn).toHaveBeenCalledWith('foo')
  })
})
