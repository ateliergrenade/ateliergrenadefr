/**
 * Wrapper pour fetch qui ajoute automatiquement le header d'authentification admin
 * depuis localStorage. À utiliser dans tous les appels API admin côté client.
 */
export function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  // Check if authenticated via localStorage
  const isAuth = typeof window !== 'undefined' && localStorage.getItem('admin-auth') === 'true'

  if (!isAuth) {
    throw new Error('Non authentifié')
  }

  const headers = new Headers(options.headers)
  headers.set('x-admin-auth', 'true')

  return fetch(url, {
    ...options,
    headers,
  })
}
