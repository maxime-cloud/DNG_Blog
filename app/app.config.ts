export default defineAppConfig({
  ui: {
    colors: {
      primary: 'blue',
      secondary: 'blue',
      neutral: 'CustomColor'
    },
    badge: {
      defaultVariants: {
        size: 'sm'
      }
    },
    toast: {
      slots: {
        root: 'ring-0 rounded-none bg-CustomColor-900 shadow-[6px_-7px_24px_0px_rgb(0,0,0,0.51)] border-dashcolor/50 border-[0.1px] flex items-center p-4 gap-3',
        title: 'text-sm font-bold text-white uppercase tracking-tight',
        description: 'text-xs text-zinc-400',
        icon: 'w-5 h-5 shrink-0',
        close: 'hover:bg-white/5 rounded-none'
      }
    }
  }
})
