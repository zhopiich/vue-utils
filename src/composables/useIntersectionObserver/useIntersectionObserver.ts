import type { Pausable } from '@vueuse/shared'
import type { MaybeRefOrGetter } from 'vue'
import type { MaybeComputedElementRef, MaybeElement } from '../unrefElement'
import { noop, toArray } from '@vueuse/shared'
import { computed, shallowRef, toValue, watch } from 'vue'
import { tryOnScopeDispose } from '~/shared/tryOnScopeDispose'
import { notNullish } from '~/shared/utils/is'
import { defaultWindow } from '../_configurable'
import { unrefElement } from '../unrefElement'

export interface UseIntersectionObserverOptions {
  root?: MaybeComputedElementRef
  rootMargin?: MaybeRefOrGetter<string>
  threshold?: number | number[]
  window?: Window
  immediate?: boolean
}

export interface UseIntersectionObserverReturn extends Pausable {
  stop: () => void
  isSupported: boolean
}

export function useIntersectionObserver(
  target: MaybeComputedElementRef | MaybeComputedElementRef[] | MaybeRefOrGetter<MaybeElement[]>,
  callback: IntersectionObserverCallback,
  options?: UseIntersectionObserverOptions,
): UseIntersectionObserverReturn {
  const {
    root,
    rootMargin,
    threshold = 0,
    window = defaultWindow,
    immediate = true,
  } = options ?? {}

  const isSupported = window != null && 'IntersectionObserver' in window

  const isActive = shallowRef(immediate)

  const targets = computed(() => {
    const _target = toValue(target)
    return toArray(_target).map(unrefElement).filter(notNullish)
  })

  let cleanup = noop

  const stopWatch = isSupported
    ? watch(
        () => [targets.value, unrefElement(root), toValue(rootMargin), isActive.value] as const,
        ([targets, root, rootMargin, isActive], _, onCleanup) => {
          if (!isActive)
            return
          if (targets.length === 0)
            return

          const observer = new IntersectionObserver(
            callback,
            {
              root: unrefElement(root),
              rootMargin: toValue(rootMargin),
              threshold,
            },
          )

          targets.forEach(el => observer.observe(el))

          cleanup = () => {
            observer.disconnect()
            cleanup = noop
          }

          onCleanup(cleanup)
        },
        { immediate, flush: 'post' },
      )
    : noop

  const stop = () => {
    stopWatch()
    isActive.value = false
  }

  tryOnScopeDispose(stop)

  return {
    isActive,
    pause() {
      cleanup() // trigger cleanup synchronously
      isActive.value = false
    },
    resume() {
      isActive.value = true
    },
    stop,
    isSupported,
  }
}
