import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { throttle } from './throttle'

describe('throttle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(0)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should invoke fn immediately on the first call', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 300)

    throttledFn('foo')
    expect(fn).toHaveBeenCalledWith('foo')
  })

  it('should not invoke fn again within the throttle window', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 1000)

    throttledFn('foo')
    vi.advanceTimersByTime(300)
    throttledFn('bar')
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('foo')
  })

  it('should invoke fn at the trailing edge when called within the window', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 1000)

    throttledFn('foo')
    vi.advanceTimersByTime(300)
    throttledFn('bar')
    vi.advanceTimersByTime(700)
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('bar')
  })

  it('should call fn at most twice when invoked multiple times within the window', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 300)

    throttledFn()
    throttledFn()
    throttledFn()
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('should allow a new throttled call after the previous window has expired', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 300)

    throttledFn('first')
    vi.advanceTimersByTime(300)
    expect(fn).toHaveBeenCalledTimes(1)

    throttledFn('second')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('second')
  })

  it('should invoke fn immediately on the leading edge when the full window has elapsed', () => {
    const fn = vi.fn()
    const throttledFn = throttle(fn, 300)

    throttledFn('first')
    vi.advanceTimersByTime(600)
    throttledFn('second')
    expect(fn).toHaveBeenCalledTimes(2)
    expect(fn).toHaveBeenLastCalledWith('second')
  })

  describe('with { leading: false, trailing: true }', () => {
    it('should not invoke fn immediately', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 300, { leading: false, trailing: true })

      throttledFn('foo')
      expect(fn).not.toHaveBeenCalled()
    })

    it('should invoke fn after the delay', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 300, { leading: false, trailing: true })

      throttledFn('foo')
      vi.advanceTimersByTime(300)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('foo')
    })
  })

  describe('with { leading: true, trailing: false }', () => {
    it('should invoke fn immediately on the first call', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 300, { leading: true, trailing: false })

      throttledFn('foo')
      expect(fn).toHaveBeenCalledWith('foo')
    })

    it('should not schedule a trailing call', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 300, { leading: true, trailing: false })

      throttledFn('foo')
      vi.advanceTimersByTime(1000)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('should ignore calls within the window after leading fires', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 300, { leading: true, trailing: false })

      throttledFn('foo')
      throttledFn('bar')
      throttledFn('baz')
      expect(fn).toHaveBeenCalledTimes(1)
      vi.advanceTimersByTime(300)
      expect(fn).toHaveBeenCalledTimes(1)
      expect(fn).toHaveBeenCalledWith('foo')
    })
  })

  describe('with { leading: false, trailing: false }', () => {
    it('should never invoke fn', () => {
      const fn = vi.fn()
      const throttledFn = throttle(fn, 300, { leading: false, trailing: false })

      throttledFn('foo')
      throttledFn('bar')
      vi.advanceTimersByTime(1000)
      expect(fn).not.toHaveBeenCalled()
    })
  })
})
