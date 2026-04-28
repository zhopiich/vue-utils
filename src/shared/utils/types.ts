/**
 * Void function
 */
export type Fn = () => void

export type FunctionArgs<Args extends any[] = any[], Return = unknown> = (...arg: Args) => Return

export type TimerHandle = ReturnType<typeof setTimeout> | undefined
