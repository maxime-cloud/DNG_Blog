interface ConfirmState {
  open: boolean
  title: string
  message: string
  resolve: ((value: boolean) => void) | null
}

const state = reactive<ConfirmState>({
  open: false,
  title: '',
  message: '',
  resolve: null
})

export function useConfirm() {
  function confirm(message: string, title = 'Confirmer la suppression'): Promise<boolean> {
    state.title = title
    state.message = message
    state.open = true

    return new Promise((resolve) => {
      state.resolve = resolve
    })
  }

  function onConfirm() {
    state.open = false
    state.resolve?.(true)
    state.resolve = null
  }

  function onCancel() {
    state.open = false
    state.resolve?.(false)
    state.resolve = null
  }

  return { confirmState: state, confirm, onConfirm, onCancel }
}
