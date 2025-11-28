'use client'

import { ReactNode, useEffect } from 'react'
import { setupAuth } from '@/utils/authUtils'

interface AuthProviderProps {
    children: ReactNode
}

/**
 * AuthProvider component that initializes authentication on mount
 * and wraps children with authentication context
 */
export default function AuthProvider({ children }: AuthProviderProps) {
    // Initialize authentication on component mount
    useEffect(() => {
        setupAuth()
    }, [])

    return <>{children}</>
}
