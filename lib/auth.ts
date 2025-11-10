import { headers } from 'next/headers'

/**
 * Simple authentication check for API routes.
 * Checks for the presence of x-admin-auth header.
 * Note: This is NOT secure - suitable only for non-sensitive applications.
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const headersList = await headers()
    const adminAuth = headersList.get('x-admin-auth')
    return adminAuth === 'true'
  } catch {
    return false
  }
}
