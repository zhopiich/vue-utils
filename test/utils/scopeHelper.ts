import type { EffectScope } from 'vue'
import { afterEach } from 'vitest'
import { effectScope } from 'vue'

export function createScope() {
  const scopes: EffectScope[] = []

  afterEach(() => {
    scopes.forEach(s => s.stop())
    scopes.length = 0
  })

  function withScope<T>(fn: () => T): T {
    const scope = effectScope()
    scopes.push(scope)
    return scope.run(fn) as T
  }

  return { withScope }
}
