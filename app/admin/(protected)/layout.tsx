'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // Check authentication on mount
    if (typeof window !== 'undefined' && localStorage.getItem('admin-auth') !== 'true') {
      router.push('/admin/login')
    }
  }, [router])

  // Check authentication before rendering
  if (typeof window !== 'undefined' && localStorage.getItem('admin-auth') !== 'true') {
    return null
  }

  return <>{children}</>
}

