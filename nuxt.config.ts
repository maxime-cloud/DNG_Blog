import Icons from 'unplugin-icons/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/nuxt',
    '@pinia/nuxt',
    '@nuxt/fonts',
    '@nuxt/content',
    '@vueuse/motion/nuxt',
    'vue-sonner/nuxt'
  ],
  ssr: true,

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  content: {
    database: {
      type: 'pglite',
      dataDir: '.nuxt/content-db'
    },
    build: {
      markdown: {
        highlight: {
          theme: {
            default: 'github-light',
            dark: 'github-dark'
          },
          langs: [
            'typescript',
            'javascript',
            'vue',
            'bash',
            'shell',
            'python',
            'json',
            'yaml',
            'nginx',
            'dockerfile',
            'sql',
            'css',
            'html',
            'xml'
          ]
        },
        remarkPlugins: {
          'remark-gfm': {},
          'remark-reading-time': {}
        },
        rehypePlugins: {
          'rehype-slug': {},
          'rehype-autolink-headings': { options: { behavior: 'wrap' } }
        }
      }
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2025-01-15',

  vite: {
    plugins: [Icons({ compiler: 'vue3', autoInstall: true }) as any]
  },

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
