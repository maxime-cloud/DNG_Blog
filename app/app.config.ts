export default defineAppConfig({
  ui: {
    colors: {
      primary: 'green',
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
        root: 'ring-0 rounded-none bg-CustomColor-900 shadow-[6px_-7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[-6px_7px_24px_0px_rgb(0,0,0, 0.51)] shadow-[0px_-4px_4px_0px_rgb(0,0,0, 0.51)] border-dashcolor/50 border-[0.1px]',
        // wrapper: 'ring-0 ',
        title: 'text-sm font-medium text-white',
        description: 'text-sm text-[#F3F4F6]/70',
        indicator: 'bg-white'
      }
    }
  }
})
