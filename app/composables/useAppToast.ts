export function useAppToast() {
  const toast = useToast()

  return {
    success: (title: string, description?: string) => 
      toast.add({ title, description, color: 'success', icon: 'i-lucide-check-circle' }),
    
    error: (title: string, description?: string) => 
      toast.add({ title, description, color: 'error', icon: 'i-lucide-alert-circle' }),
    
    info: (title: string, description?: string) => 
      toast.add({ title, description, color: 'info', icon: 'i-lucide-info' }),
    
    warning: (title: string, description?: string) => 
      toast.add({ title, description, color: 'warning', icon: 'i-lucide-alert-triangle' }),
    
    copied: () => 
      toast.add({ title: 'Copié !', description: 'Copié dans le presse-papier', color: 'info', icon: 'i-lucide-copy' }),
    
    loginRequired: () => 
      toast.add({ title: 'Connexion requise', description: 'Veuillez vous connecter pour continuer', color: 'warning', icon: 'i-lucide-lock' }),
    
    networkError: () => 
      toast.add({ title: 'Erreur réseau', description: 'Vérifiez votre connexion internet', color: 'error', icon: 'i-lucide-wifi-off' }),
    
    serverError: () => 
      toast.add({ title: 'Erreur serveur', description: 'Une erreur imprévue est survenue', color: 'error', icon: 'i-lucide-server' }),
    
    banned: () => 
      toast.add({ title: 'Compte suspendu', description: 'Votre compte a été suspendu par un administrateur', color: 'error', icon: 'i-lucide-user-x' })
  }
}
