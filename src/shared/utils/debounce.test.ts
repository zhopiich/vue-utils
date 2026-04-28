import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { debounce } from './debounce'

describe('debounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should be called after a delay', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 300)

    debouncedFn('foo')
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledWith('foo')
  })

  it('should restart the timer if triggered again before timeout', () => {
    const fn = vi.fn()
    const debouncedFn = debounce(fn, 1000)

    debouncedFn('foo')
    vi.advanceTimersByTime(300)
    debouncedFn('bar')
    vi.advanceTimersByTime(700)
    expect(fn).not.toHaveBeenCalled()
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledWith('bar')
  })
})
