import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export function useGsap(containerRef?: Ref<HTMLElement | null>) {
  let ctx: gsap.Context | null = null

  function createContext(scope?: Element | null) {
    ctx = gsap.context(() => {}, scope ?? containerRef?.value ?? document.body)
    return ctx
  }

  onUnmounted(() => {
    ctx?.revert()
  })

  return { gsap, ScrollTrigger, createContext, getCtx: () => ctx }
}
