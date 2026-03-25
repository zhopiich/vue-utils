import type { VueWrapper } from '@vue/test-utils'
import type { VueInstance } from '.'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, onMounted, useTemplateRef } from 'vue'
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
    const elRef = ref(el)
    expect(unrefElement(el)).toBe(el)
    expect(unrefElement(el)).toBeInstanceOf(HTMLElement)
    expect(unrefElement(elRef)).toBe(el)
    expect(unrefElement(elRef)).toBeInstanceOf(HTMLElement)
  })

  it('should return $el from a component instance', () => {
    const el = document.createElement('div')
    // simulate a vue component instance
    const componentInstance = { $el: el } as VueInstance
    expect(unrefElement(componentInstance)).toBe(el)
    expect(unrefElement(ref(componentInstance))).toBe(el)
  })
})

describe('unrefElement with mount', () => {
  let wrapper: VueWrapper | null = null

  const unmountWrapper = (wrapper: VueWrapper | null) => {
    wrapper?.unmount()
  }

  afterEach(() => unmountWrapper(wrapper))

  it('should return the root DOM element from a child component template ref', async () => {
    let el: HTMLElement | null | undefined

    const Child = defineComponent({
      template: '<span class="child">Child</span>',
    })

    const Parent = defineComponent({
      components: { Child },
      template: '<Child ref="childRef" />',
      setup() {
        const childRef = useTemplateRef<VueInstance>('childRef')
        onMounted(() => {
          el = unrefElement(childRef)
        })
      },
    })

    wrapper = mount(Parent)
    await wrapper.vm.$nextTick()

    expect(el?.tagName).toBe('SPAN')
    expect(el?.classList.contains('child')).toBe(true)
  })

  it('should return root element from component instance whether wrapped in ref or not', () => {
    const Comp = defineComponent({
      setup() {
        return () => h('article', [h('h1', 'title')])
      },
    })

    wrapper = mount(Comp)

    const elFromRef = unrefElement(ref(wrapper.vm))
    const elDirect = unrefElement(wrapper.vm)

    expect(elFromRef).toBe(wrapper.element)
    expect(elDirect).toBe(wrapper.element)
    expect((elFromRef as HTMLElement).tagName.toLowerCase()).toBe('article')
  })

  it('should return the element after Vue populates the template ref', () => {
    const innerRef = ref<HTMLElement | null>(null)
    const Comp = defineComponent({
      setup() {
        return () => h('div', [
          h('button', { ref: innerRef, id: 'btn' }, 'click me'),
        ])
      },
    })

    wrapper = mount(Comp)

    const el = unrefElement(innerRef)
    expect(el).toBeInstanceOf(HTMLElement)
    expect(el?.id).toBe('btn')
  })
})
