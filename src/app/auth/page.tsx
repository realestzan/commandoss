'use client'

import Onboarding from '@/components/onboarding'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { getUserData, resetPassword, signInWithEmail, signInWithGoogle, signUpWithEmail } from '@/lib/auth'
import { User } from '@/lib/types'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Lock, Mail, User as UserIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100
        }
    }
}

const slideInVariants: Variants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 100
        }
    }
}

export default function AuthPage() {
    const router = useRouter()
    const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot' | 'onboarding'>('signin')
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: '',
    })
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [currentUser, setCurrentUser] = useState<User | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    const handleEmailSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setError(null)
        setSuccess(null)
        setIsLoading(true)

        try {
            if (authMode === 'signin') {
                const { user, error } = await signInWithEmail(formData.email, formData.password)
                if (error) {
                    setError(error)
                } else if (user) {
                    // Get user data to check if onboarding is needed
                    const userData = await getUserData(user.uid)
                    if (userData && userData.monthlyIncome !== undefined) {
                        // User has completed onboarding
                        router.push('/chat')
                    } else if (userData) {
                        // User needs onboarding
                        setCurrentUser(userData)
                        setAuthMode('onboarding')
                    }
                }
            } else if (authMode === 'signup') {
                // Validate passwords match
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match')
                    return
                }

                const { user, error } = await signUpWithEmail(
                    formData.email,
                    formData.password,
                    formData.firstName,
                    formData.lastName
                )

                if (error) {
                    setError(error)
                } else if (user) {
                    // Get the created user data and start onboarding
                    const userData = await getUserData(user.uid)
                    if (userData) {
                        setCurrentUser(userData)
                        setAuthMode('onboarding')
                    }
                }
            } else if (authMode === 'forgot') {
                const { success, error } = await resetPassword(formData.email)
                if (error) {
                    setError(error)
                } else if (success) {
                    setSuccess('Password reset email sent! Please check your inbox.')
                }
            }
        } catch (error) {
            console.error('Error during authentication:', error)
            setError('Failed to authenticate. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setError(null)
        setSuccess(null)
        setIsLoading(true)

        try {
            const { user, error } = await signInWithGoogle()
            if (error) {
                setError(error)
            } else if (user) {
                // Get user data to check if onboarding is needed
                const userData = await getUserData(user.uid)
                if (userData && userData.monthlyIncome !== undefined) {
                    // User has completed onboarding
                    router.push('/chat')
                } else if (userData) {
                    // User needs onboarding
                    setCurrentUser(userData)
                    setAuthMode('onboarding')
                }
            }
        } catch (error) {
            console.error('Error during sign in:', error)
            setError('Failed to sign in. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleOnboardingComplete = (updatedUser: User) => {
        setCurrentUser(updatedUser)
        router.push('/chat')
    }

    if (authMode === 'onboarding' && currentUser) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-green-900/20'>
                <div className='w-full max-w-4xl mx-auto p-6'>
                    <Onboarding
                        user={currentUser}
                        onComplete={handleOnboardingComplete}
                        className='bg-background/80 rounded-3xl shadow-2xl h-[80vh] '
                    />
                </div>
            </div>
        )
    }

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <div className='min-h-screen flex'>
                {/* Right Side - Auth Form */}
                <div className='w-full lg:w-2/5 flex items-center justify-center p-6 lg:p-12'>
                    <motion.div
                        variants={containerVariants}
                        initial='hidden'
                        animate='visible'
                        className='w-full max-w-md space-y-8'
                    >
                        {/* Welcome Card */}
                        <motion.div variants={itemVariants}>
                            <Card className='overflow-hidden'>
                                <CardHeader className='pb-6 pt-8'>
                                    <motion.div variants={slideInVariants} className='text-center space-y-2'>
                                        <div className='w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                                            <Lock className='w-8 h-8 text-white' />
                                        </div>
                                        <CardTitle className='text-2xl font-bold text-emerald-800'>
                                            {authMode === 'signin' ? 'Welcome back' :
                                                authMode === 'signup' ? 'Create your account' :
                                                    'Reset your password'}
                                        </CardTitle>
                                        <CardDescription className='text-emerald-600'>
                                            {authMode === 'signin' ? 'Sign in to continue to your chat' :
                                                authMode === 'signup' ? 'Start your financial journey today' :
                                                    'Enter your email to receive a reset link'}
                                        </CardDescription>
                                    </motion.div>
                                </CardHeader>

                                <CardContent className='space-y-6 px-8 pb-8'>
                                    {/* Google Sign In */}
                                    {authMode !== 'forgot' && (
                                        <motion.div variants={itemVariants}>
                                            <Button
                                                variant='outline'
                                                onClick={handleGoogleSignIn}
                                                disabled={isLoading}
                                                className='w-full h-12 border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-all duration-200'
                                            >
                                                <svg className='w-5 h-5 mr-3' viewBox='0 0 24 24'>
                                                    <path
                                                        d='M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z'
                                                        fill='#4285F4'
                                                    />
                                                    <path
                                                        d='M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z'
                                                        fill='#34A853'
                                                    />
                                                    <path
                                                        d='M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z'
                                                        fill='#FBBC05'
                                                    />
                                                    <path
                                                        d='M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z'
                                                        fill='#EA4335'
                                                    />
                                                </svg>
                                                Continue with Google
                                            </Button>
                                        </motion.div>
                                    )}

                                    {/* Divider */}
                                    {authMode !== 'forgot' && (
                                        <motion.div variants={itemVariants} className='relative'>
                                            <div className='absolute inset-0 flex items-center'>
                                                <Separator className='w-full border-emerald-200' />
                                            </div>
                                            <div className='relative flex justify-center text-xs uppercase'>
                                                <span className='px-3 text-emerald-600 font-medium'>
                                                    Or continue with email
                                                </span>
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Error/Success Alerts */}
                                    {error && (
                                        <motion.div
                                            variants={itemVariants}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <Alert variant='destructive' className='bg-card'>
                                                <AlertTitle className='text-red-500'>Error</AlertTitle>
                                                <AlertDescription className='text-red-700'>{error}</AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}

                                    {success && (
                                        <motion.div
                                            variants={itemVariants}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                        >
                                            <Alert className='border-emerald-200 bg-emerald-50'>
                                                <AlertTitle className='text-emerald-800'>Success</AlertTitle>
                                                <AlertDescription className='text-emerald-700'>{success}</AlertDescription>
                                            </Alert>
                                        </motion.div>
                                    )}

                                    {/* Form */}
                                    <motion.form onSubmit={handleEmailSubmit} variants={itemVariants} className='space-y-4'>
                                        {/* Email Field */}
                                        <div className='space-y-2'>
                                            <Label htmlFor='email' className='text-emerald-700 font-medium'>Email Address</Label>
                                            <div className='relative'>
                                                <Mail className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400' />
                                                <Input
                                                    id='email'
                                                    placeholder='Enter your email'
                                                    type='email'
                                                    autoCapitalize='none'
                                                    autoComplete='email'
                                                    autoCorrect='off'
                                                    value={formData.email}
                                                    onChange={(e) =>
                                                        setFormData({ ...formData, email: e.target.value })
                                                    }
                                                    required
                                                    disabled={isLoading}
                                                    className='pl-10 h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400'
                                                />
                                            </div>
                                        </div>

                                        {/* First and Last Name for Signup */}
                                        {authMode === 'signup' && (
                                            <div className='grid grid-cols-2 gap-3'>
                                                <div className='space-y-2'>
                                                    <Label htmlFor='firstName' className='text-emerald-700 font-medium'>First Name</Label>
                                                    <div className='relative'>
                                                        <UserIcon className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400' />
                                                        <Input
                                                            id='firstName'
                                                            type='text'
                                                            placeholder='First name'
                                                            value={formData.firstName}
                                                            onChange={(e) =>
                                                                setFormData({ ...formData, firstName: e.target.value })
                                                            }
                                                            required
                                                            disabled={isLoading}
                                                            className='pl-10 h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400'
                                                        />
                                                    </div>
                                                </div>
                                                <div className='space-y-2'>
                                                    <Label htmlFor='lastName' className='text-emerald-700 font-medium'>Last Name</Label>
                                                    <Input
                                                        id='lastName'
                                                        type='text'
                                                        placeholder='Last name'
                                                        value={formData.lastName}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, lastName: e.target.value })
                                                        }
                                                        required
                                                        disabled={isLoading}
                                                        className='h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400'
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Password Field */}
                                        {authMode !== 'forgot' && (
                                            <div className='space-y-2'>
                                                <Label htmlFor='password' className='text-emerald-700 font-medium'>Password</Label>
                                                <div className='relative'>
                                                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400' />
                                                    <Input
                                                        id='password'
                                                        type={showPassword ? 'text' : 'password'}
                                                        placeholder='Enter your password'
                                                        value={formData.password}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, password: e.target.value })
                                                        }
                                                        required
                                                        disabled={isLoading}
                                                        className='pl-10 pr-10 h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400'
                                                    />
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-emerald-100'
                                                        onClick={() => setShowPassword(!showPassword)}
                                                    >
                                                        {showPassword ? (
                                                            <EyeOff className='w-4 h-4 text-emerald-500' />
                                                        ) : (
                                                            <Eye className='w-4 h-4 text-emerald-500' />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Confirm Password for Signup */}
                                        {authMode === 'signup' && (
                                            <div className='space-y-2'>
                                                <Label htmlFor='confirmPassword' className='text-emerald-700 font-medium'>Confirm Password</Label>
                                                <div className='relative'>
                                                    <Lock className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-emerald-400' />
                                                    <Input
                                                        id='confirmPassword'
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        placeholder='Confirm your password'
                                                        value={formData.confirmPassword}
                                                        onChange={(e) =>
                                                            setFormData({ ...formData, confirmPassword: e.target.value })
                                                        }
                                                        required
                                                        disabled={isLoading}
                                                        className='pl-10 pr-10 h-12 border-emerald-200 focus:border-emerald-400 focus:ring-emerald-400'
                                                    />
                                                    <Button
                                                        type='button'
                                                        variant='ghost'
                                                        size='sm'
                                                        className='absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-emerald-100'
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                    >
                                                        {showConfirmPassword ? (
                                                            <EyeOff className='w-4 h-4 text-emerald-500' />
                                                        ) : (
                                                            <Eye className='w-4 h-4 text-emerald-500' />
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Submit Button */}
                                        <Button
                                            type='submit'
                                            disabled={isLoading}
                                            className='w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100'
                                        >
                                            {isLoading ? (
                                                <div className='flex items-center gap-2'>
                                                    <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                                    Loading...
                                                </div>
                                            ) : (
                                                <div className='flex items-center gap-2'>
                                                    {authMode === 'signin' ? 'Sign In' :
                                                        authMode === 'signup' ? 'Create Account' :
                                                            'Send Reset Email'}
                                                    <ArrowRight className='w-4 h-4' />
                                                </div>
                                            )}
                                        </Button>
                                    </motion.form>

                                    {/* Auth Mode Toggle */}
                                    <motion.div variants={itemVariants} className='text-center space-y-3'>
                                        {authMode === 'signin' && (
                                            <div className='space-y-2'>
                                                <Button
                                                    variant='link'
                                                    className='text-emerald-600 hover:text-emerald-700 p-0 h-auto font-medium'
                                                    onClick={() => setAuthMode('forgot')}
                                                    disabled={isLoading}
                                                >
                                                    Forgot your password?
                                                </Button>
                                                <div className='text-sm text-emerald-600'>
                                                    Don&apos;t have an account?{' '}
                                                    <Button
                                                        variant='link'
                                                        className='text-emerald-600 hover:text-emerald-700 p-0 h-auto font-semibold'
                                                        onClick={() => setAuthMode('signup')}
                                                        disabled={isLoading}
                                                    >
                                                        Sign up here
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                        {authMode === 'signup' && (
                                            <div className='text-sm text-emerald-600'>
                                                Already have an account?{' '}
                                                <Button
                                                    variant='link'
                                                    className='text-emerald-600 hover:text-emerald-700 p-0 h-auto font-semibold'
                                                    onClick={() => setAuthMode('signin')}
                                                    disabled={isLoading}
                                                >
                                                    Sign in here
                                                </Button>
                                            </div>
                                        )}
                                        {authMode === 'forgot' && (
                                            <div className='text-sm text-emerald-600'>
                                                Remember your password?{' '}
                                                <Button
                                                    variant='link'
                                                    className='text-emerald-600 hover:text-emerald-700 p-0 h-auto font-semibold'
                                                    onClick={() => setAuthMode('signin')}
                                                    disabled={isLoading}
                                                >
                                                    Back to sign in
                                                </Button>
                                            </div>
                                        )}
                                    </motion.div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Terms and Privacy */}
                        <motion.div variants={itemVariants} className='text-center'>
                            <p className='text-xs text-emerald-600'>
                                By continuing, you agree to our{' '}
                                <Link href='/terms' className='underline underline-offset-4 hover:text-emerald-700 font-medium'>
                                    Terms of Service
                                </Link>{' '}
                                and{' '}
                                <Link href='/privacy' className='underline underline-offset-4 hover:text-emerald-700 font-medium'>
                                    Privacy Policy
                                </Link>
                            </p>
                        </motion.div>
                    </motion.div>
                </div>

                {/* Left Side - Illustration */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className='hidden lg:flex lg:w-3/5 relative items-center justify-center shadow-2xl shadow-green-600'
                >
                    {/* <div className='absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 backdrop-blur-sm'></div> */}
                    <Image
                        src='/auth-bgr.png'
                        className='w-full h-full object-left object-cover relative z-10'
                        alt='Auth Background'
                        width={1000}
                        height={1000}
                    />
                    {/* <div className='absolute bottom-12 left-12 right-12 text-center z-20'>
                        <motion.h2
                            variants={itemVariants}
                            className='text-3xl font-bold text-emerald-800 mb-4'
                        >
                            Smart Financial Management
                        </motion.h2>
                        <motion.p
                            variants={itemVariants}
                            className='text-emerald-700 text-lg'
                        >
                            Take control of your finances with AI-powered insights and personalized recommendations
                        </motion.p>
                    </div> */}
                </motion.div>
            </div>
        </Suspense>
    )
}

