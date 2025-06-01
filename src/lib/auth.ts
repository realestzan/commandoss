import {
    AuthError,
    createUserWithEmailAndPassword,
    User as FirebaseUser,
    GoogleAuthProvider,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    signInWithPopup,
    signOut,
    updateProfile,
} from 'firebase/auth'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { auth, db } from './firebase'
import { User } from './types'

// Sign in with email and password
export const signInWithEmail = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password)
        return { user: result.user, error: null }
    } catch (error) {
        const authError = error as AuthError
        return { user: null, error: authError.message }
    }
}

// Sign up with email and password
export const signUpWithEmail = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string
) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password)
        const user = result.user

        // Update display name
        await updateProfile(user, {
            displayName: `${firstName} ${lastName}`,
        })

        // Create user document in Firestore with only defined values
        const userData = {
            name: `${firstName} ${lastName}`,
            email: email,
            avatar: user.photoURL || '',
            preferredCurrency: 'USD' as const,
            createdAt: new Date().toISOString(),
            financialGoals: []
        }

        await setDoc(doc(db, 'users', user.uid), userData)

        return { user, error: null }
    } catch (error) {
        const authError = error as AuthError
        return { user: null, error: authError.message }
    }
}

// Sign in with Google
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider()
        const result = await signInWithPopup(auth, provider)
        const user = result.user

        // Check if user document exists, if not create one
        const userDocRef = doc(db, 'users', user.uid)
        const userDoc = await getDoc(userDocRef)

        if (!userDoc.exists()) {
            const userData = {
                name: user.displayName || '',
                email: user.email || '',
                avatar: user.photoURL || '',
                preferredCurrency: 'USD' as const,
                createdAt: new Date().toISOString(),
                financialGoals: []
            }

            await setDoc(userDocRef, userData)
        }

        return { user, error: null }
    } catch (error) {
        const authError = error as AuthError
        return { user: null, error: authError.message }
    }
}

// Update user data in Firestore
export const updateUserData = async (uid: string, data: Partial<Omit<User, 'id'>>) => {
    try {
        await setDoc(doc(db, 'users', uid), data, { merge: true })
        return { success: true, error: null }
    } catch (error) {
        console.error('Error updating user data:', error)
        return { success: false, error: 'Failed to update user data' }
    }
}

// Forgot password
export const resetPassword = async (email: string) => {
    try {
        await sendPasswordResetEmail(auth, email)
        return { success: true, error: null }
    } catch (error) {
        const authError = error as AuthError
        return { success: false, error: authError.message }
    }
}

// Sign out
export const logout = async () => {
    try {
        await signOut(auth)
        return { success: true, error: null }
    } catch (error) {
        const authError = error as AuthError
        return { success: false, error: authError.message }
    }
}

// Get current user
export const getCurrentUser = (): FirebaseUser | null => {
    return auth.currentUser
}

// Get user data from Firestore
export const getUserData = async (uid: string): Promise<User | null> => {
    try {
        const userDoc = await getDoc(doc(db, 'users', uid))
        if (userDoc.exists()) {
            return { id: uid, ...userDoc.data() } as User
        }
        return null
    } catch (error) {
        console.error('Error getting user data:', error)
        return null
    }
}