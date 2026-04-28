import type { FunctionArgs, TimerHandle } from './types'

export function throttle<T extends FunctionArgs>(fn: T, ms: number = 300) {
  let timer: TimerHandle

  return (...args: any[]) => {
    if (timer)
      return
    timer = setTimeout(() => {
      fn(...args)
      timer = undefined
    }, ms)
  }
}
