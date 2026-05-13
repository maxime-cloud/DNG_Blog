import { toast } from 'vue-sonner'

export function useAppToast() {
  return {
    success: (msg: string) => toast.success(msg),
    error: (msg: string) => toast.error(msg),
    info: (msg: string) => toast.info(msg),
    warning: (msg: string) => toast.warning(msg),
    promise: toast.promise,
    copied: () => toast.info('Copié dans le presse-papier !'),
    loginRequired: () => toast.warning('Connectez-vous pour effectuer cette action'),
    networkError: () => toast.error('Erreur réseau — vérifiez votre connexion'),
    serverError: () => toast.error('Erreur serveur — réessayez dans quelques instants'),
    banned: () => toast.error('Votre compte a été suspendu')
  }
}
