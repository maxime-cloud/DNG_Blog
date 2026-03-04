
export const useUtilsStore = defineStore('utils', () => {
  const appName: Ref<string> = ref("StackTrace")

  return { appName }
})