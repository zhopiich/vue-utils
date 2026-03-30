import { vi } from 'vitest'

export class MockIntersectionObserver {
  readonly observe = vi.fn()
  readonly unobserve = vi.fn()
  readonly disconnect = vi.fn(() => {
    MockIntersectionObserver.lastCallback = null
  })

  static lastCallback: IntersectionObserverCallback | null = null
  static lastOptions: IntersectionObserverInit | null = null
  static lastInstance: MockIntersectionObserver | null = null
  static instanceCount = 0
  static instances: MockIntersectionObserver[] = []

  constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
    MockIntersectionObserver.lastCallback = callback
    MockIntersectionObserver.lastOptions = options ?? null
    MockIntersectionObserver.instanceCount++
    MockIntersectionObserver.lastInstance = this
    // MockIntersectionObserver.instances.push(this)
  }

  static trigger(entries: Partial<IntersectionObserverEntry>[]) {
    this.lastCallback?.(
      entries as IntersectionObserverEntry[],
      this.lastInstance as unknown as IntersectionObserver,
    )
  }

  static reset() {
    this.lastCallback = null
    this.lastOptions = null
    this.lastInstance = null
    this.instanceCount = 0
    // this.instances = []
  }
}
