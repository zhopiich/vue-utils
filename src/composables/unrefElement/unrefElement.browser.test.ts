import type { VueInstance } from '.'
import { describe, expect, it } from 'vitest'
import { unrefElement } from '.'

describe('unrefElement', () => {
  it('should return null or undefined as is', () => {
    expect(unrefElement(null)).toBeNull()
    expect(unrefElement(undefined)).toBeUndefined()
    expect(unrefElement(ref(null))).toBeNull()
    expect(unrefElement(ref(undefined))).toBeUndefined()
  })

  it('should return the DOM element as is whether wrapped in ref or not', () => {
    const el = document.createElement('div')
    expect(unrefElement(el)).toBe(el)
    expect(unrefElement(ref(el))).toBe(el)
  })

  it('should return $el from a component instance', () => {
    const el = document.createElement('div')
    // simulate a vue component instance
    const componentInstance = { $el: el } as VueInstance
    expect(unrefElement(componentInstance)).toBe(el)
    expect(unrefElement(ref(componentInstance))).toBe(el)
  })
})
