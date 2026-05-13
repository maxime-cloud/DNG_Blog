import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TextPlugin } from 'gsap/TextPlugin'
import { Flip } from 'gsap/Flip'

export default defineNuxtPlugin(() => {
  gsap.registerPlugin(ScrollTrigger, TextPlugin, Flip)

  gsap.config({
    nullTargetWarn: false,
    force3D: true
  })

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    gsap.globalTimeline.timeScale(100)
  }

  return { provide: { gsap, ScrollTrigger } }
})
