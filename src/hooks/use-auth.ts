import { getUserData } from '@/lib/auth'
import { auth } from '@/lib/firebase'
import { User } from '@/lib/types'
import { onAuthStateChanged } from 'firebase/auth'
import { useEffect, useState } from 'react'

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Get user data from Firestore
                const userData = await getUserData(firebaseUser.uid)
                if (userData) {
                    setUser(userData)
                } else {
                    // Fallback if no Firestore data exists
                    setUser({
                        id: firebaseUser.uid,
                        email: firebaseUser.email || '',
                        name: firebaseUser.displayName || '',
                        avatar: firebaseUser.photoURL || '',
                        preferredCurrency: 'USD',
                        createdAt: new Date().toISOString(),
                        financialGoals: []
                    })
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        })

        return () => unsubscribe()
    }, [])

    // Function to refresh user data
    const refreshUser = async () => {
        if (auth.currentUser) {
            const userData = await getUserData(auth.currentUser.uid)
            if (userData) {
                setUser(userData)
            }
        }
    }

    return {
        user,
        loading,
        isAuthenticated: !!user,
        refreshUser
    }
} 