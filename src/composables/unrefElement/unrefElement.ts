import type { ComponentPublicInstance, MaybeRef, MaybeRefOrGetter } from 'vue'

export type VueInstance = ComponentPublicInstance
export type MaybeElement = VueInstance | HTMLElement | SVGElement | undefined | null

export type MaybeElementRef<T extends MaybeElement = MaybeElement> = MaybeRef<T>
export type MaybeComputedElementRef<T extends MaybeElement = MaybeElement> = MaybeRefOrGetter<T>

export type UnRefElementReturn<T extends MaybeElement = MaybeElement>
  = T extends VueInstance ? Exclude<MaybeElement, VueInstance> : T | undefined

export function isVueInstance(el: unknown): el is VueInstance {
  return el != null && typeof el === 'object' && '$el' in el
}

export function unrefElement<T extends MaybeElement>(
  elRef: MaybeComputedElementRef<T>,
): UnRefElementReturn<T> {
  const plainEl = toValue(elRef)
  return (isVueInstance(plainEl) ? plainEl.$el : plainEl) as UnRefElementReturn<T>
}
