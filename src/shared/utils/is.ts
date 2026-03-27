export const notNullish = <T = any>(val?: T | null | undefined): val is T => val != null

export const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'
