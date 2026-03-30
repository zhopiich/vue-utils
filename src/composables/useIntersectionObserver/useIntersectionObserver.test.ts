import { createScope } from '@test/utils/scopeHelper'
import { noop } from '@vueuse/shared'
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useIntersectionObserver } from '.'
import { MockIntersectionObserver } from './mocks/IntersectionObserver'

describe('useIntersectionObserver', () => {
  beforeAll(() => vi.stubGlobal('IntersectionObserver', MockIntersectionObserver))

  afterEach(() => {
    vi.clearAllMocks()
    MockIntersectionObserver.reset()
  })

  afterAll(() => vi.unstubAllGlobals())

  const getObservedTargets = (instance: MockIntersectionObserver | null) =>
    instance?.observe.mock.calls.map(([el]) => el) ?? []

  const callback = vi.fn()

  it('should pass correct options to native constructor', async () => {
    const root = document.createElement('div')
    const target = document.createElement('div')
    const options = { root, threshold: [0, 0.5], rootMargin: '10px' }
    useIntersectionObserver(target, noop, options)
    await nextTick()
    expect(MockIntersectionObserver.lastOptions).toMatchObject(options)
  })

  it('should observe a single target after mount', async () => {
    const target = document.createElement('div')
    useIntersectionObserver(target, noop)
    await nextTick()
    const instance = MockIntersectionObserver.lastInstance
    expect(getObservedTargets(instance)).toContain(target)
  })

  it('should observe all targets when multiple targets are provided initially', async () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')
    const el3 = document.createElement('div')
    useIntersectionObserver([el1, el2], noop)
    await nextTick()
    const instance = MockIntersectionObserver.lastInstance
    const targets = getObservedTargets(instance)
    expect(targets).toContain(el1)
    expect(targets).toContain(el2)
    expect(targets).not.toContain(el3)
  })

  it('should invoke callback with correct arguments when observer triggers', async () => {
    const target = document.createElement('div')
    useIntersectionObserver(target, callback)
    await nextTick()
    expect(MockIntersectionObserver.lastInstance).not.toBeNull()
    MockIntersectionObserver.trigger([{ isIntersecting: true }])
    expect(callback).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ isIntersecting: true })]),
      expect.anything(),
    )
  })

  it('should not create observer when immediate is false', async () => {
    useIntersectionObserver(document.createElement('div'), noop, { immediate: false })
    await nextTick()
    expect(MockIntersectionObserver.lastInstance).toBeNull()
  })

  it('should disconnect when component unmounts', async () => {
    const { withScope, stopScopes } = createScope()
    withScope(() => useIntersectionObserver(document.createElement('div'), noop))
    await nextTick()
    const instance = MockIntersectionObserver.lastInstance
    expect(instance).not.toBeNull()
    stopScopes()
    expect(instance?.disconnect).toHaveBeenCalledOnce()
  })

  it('should disconnect and set isActive to false when paused', async () => {
    const target = document.createElement('div')
    const controls = useIntersectionObserver(target, callback)
    await nextTick()
    const instance = MockIntersectionObserver.lastInstance

    controls.pause()
    expect(instance?.disconnect).toHaveBeenCalledOnce()
    expect(controls.isActive.value).toBe(false)
  })

  it('should not invoke callback after pause', async () => {
    const target = document.createElement('div')
    const { pause } = useIntersectionObserver(target, callback)
    await nextTick()
    MockIntersectionObserver.trigger([{ isIntersecting: true }])
    expect(callback).toHaveBeenCalledOnce()

    callback.mockClear()
    pause()
    MockIntersectionObserver.trigger([{ isIntersecting: true }])
    expect(callback).not.toHaveBeenCalled()
  })

  it('should recreate observer and set isActive to true when resumed', async () => {
    const target = document.createElement('div')
    const { pause, resume, isActive } = useIntersectionObserver(target, noop)
    await nextTick()
    const firstInstance = MockIntersectionObserver.lastInstance
    expect(firstInstance).not.toBeNull()

    pause()
    resume()
    await nextTick()
    expect(isActive.value).toBe(true)

    const secondInstance = MockIntersectionObserver.lastInstance
    expect(secondInstance).not.toBe(firstInstance)
    expect(getObservedTargets(secondInstance)).toContain(target)
  })

  it('should disconnect when stop() is called', async () => {
    const { stop } = useIntersectionObserver(document.createElement('div'), noop)
    await nextTick()
    stop()
    expect(MockIntersectionObserver.lastInstance?.disconnect).toHaveBeenCalledOnce()
  })

  it('should not recreate observer after stop() even if target changes', async () => {
    const el1 = document.createElement('div')
    const el2 = document.createElement('div')

    const target = ref(el1)
    const { stop } = useIntersectionObserver(target, noop)
    await nextTick()
    expect(MockIntersectionObserver.instanceCount).toBe(1)

    stop()
    target.value = el2
    await nextTick()
    expect(MockIntersectionObserver.instanceCount).toBe(1)
  })

  it('should not invoke callback after stop', async () => {
    const target = document.createElement('div')
    const { stop } = useIntersectionObserver(target, callback)
    await nextTick()
    MockIntersectionObserver.trigger([{ isIntersecting: true }])
    expect(callback).toHaveBeenCalledOnce()

    callback.mockClear()
    stop()
    MockIntersectionObserver.trigger([{ isIntersecting: true }])
    expect(callback).not.toHaveBeenCalled()
  })

  describe('reactive target changes', () => {
    it('should disconnect old observer and observe all targets when targets are added', async () => {
      const el1 = document.createElement('div')
      const el2 = document.createElement('div')

      const targets = ref([el1])
      useIntersectionObserver(targets, noop)
      await nextTick()
      const firstInstance = MockIntersectionObserver.lastInstance

      targets.value = [el1, el2]
      await nextTick()

      expect(firstInstance?.disconnect).toHaveBeenCalledOnce()
      const secondInstance = MockIntersectionObserver.lastInstance
      const laterTargets = getObservedTargets(secondInstance)
      expect(laterTargets).toContain(el1)
      expect(laterTargets).toContain(el2)
    })

    it('should disconnect and not recreate observer when targets become empty', async () => {
      const el1 = document.createElement('div')
      const targets = ref([el1])
      useIntersectionObserver(targets, noop)
      await nextTick()
      expect(MockIntersectionObserver.instanceCount).toBe(1)
      const instance = MockIntersectionObserver.lastInstance

      targets.value = []
      await nextTick()
      expect(instance?.disconnect).toHaveBeenCalledOnce()
      expect(MockIntersectionObserver.instanceCount).toBe(1)
    })
  })

  it('should recreate observer when rootMargin changes', async () => {
    const rootMargin = ref('0px')
    const target = document.createElement('div')
    useIntersectionObserver(target, noop, { rootMargin })
    await nextTick()
    expect(MockIntersectionObserver.instanceCount).toBe(1)
    expect(MockIntersectionObserver.lastOptions?.rootMargin).toBe('0px')
    const firstInstance = MockIntersectionObserver.lastInstance

    rootMargin.value = '20px'
    await nextTick()
    expect(firstInstance?.disconnect).toHaveBeenCalledOnce()
    expect(MockIntersectionObserver.instanceCount).toBe(2)
    expect(MockIntersectionObserver.lastOptions?.rootMargin).toBe('20px')
  })
})
