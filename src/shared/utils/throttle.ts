import type { FunctionArgs, TimerHandle } from './types'

export function throttle<T extends FunctionArgs>(fn: T, ms: number = 300) {
  let timer: TimerHandle

  return (...arg: any[]) => {
    if (timer)
      return
    timer = setTimeout(() => {
      fn(...arg)
      timer = undefined
    }, ms)
  }
}
