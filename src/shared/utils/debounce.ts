import type { FunctionArgs, TimerHandle } from './types'

export function debounce<T extends FunctionArgs>(fn: T, ms: number = 300) {
  let timer: TimerHandle

  return (...arg: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(fn, ms, ...arg)
  }
}
