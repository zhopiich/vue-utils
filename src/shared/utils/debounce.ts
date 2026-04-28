import type { FunctionArgs, TimerHandle } from './types'

export function debounce<T extends FunctionArgs>(fn: T, ms: number = 300) {
  let timer: TimerHandle

  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(fn, ms, ...args)
  }
}
