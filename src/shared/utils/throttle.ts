import type { FunctionArgs, TimerHandle } from './types'

export function throttle<T extends FunctionArgs>(
  fn: T,
  ms = 300,
  { leading = true, trailing = true } = {},
) {
  let timer: TimerHandle
  let lastTime = -Infinity

  function execute(...args: unknown[]) {
    fn(...args)
    lastTime = leading ? Date.now() : -Infinity
    timer = undefined
  }

  return (...args: unknown[]) => {
    const remaining = ms - (Date.now() - lastTime)

    if (remaining <= 0) {
      clearTimeout(timer)
      timer = undefined
      if (leading) {
        fn(...args)
        lastTime = Date.now()
      }
      else if (trailing) {
        timer = setTimeout(() => execute(...args), ms)
      }
    }
    else if (trailing && !timer) {
      timer = setTimeout(() => execute(...args), remaining)
    }
  }
}
