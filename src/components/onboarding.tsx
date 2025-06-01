'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { updateUserData } from '@/lib/auth'
import { Currency, FinancialGoal, User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Bot, Calendar, CheckCircle, DollarSign, Sparkles, Star, Target } from 'lucide-react'
import { useEffect, useState } from 'react'

interface OnboardingProps {
    user: User
    onComplete: (updatedUser: User) => void
    className?: string
}

type OnboardingStep =
    | 'welcome'
    | 'currency'
    | 'income'
    | 'goals'
    | 'goal-amount'
    | 'goal-deadline'
    | 'completion'

interface Goal {
    name: string
    targetAmount: number
    deadline?: string
}

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.1
        }
    }
}

const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 15
        }
    }
}

const slideVariants: Variants = {
    hidden: { opacity: 0, x: 50 },
    visible: {
        opacity: 1,
        x: 0,
        transition: {
            type: 'spring',
            stiffness: 100,
            damping: 20
        }
    },
    exit: {
        opacity: 0,
        x: -50,
        transition: {
            duration: 0.3
        }
    }
}

const CURRENCIES: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: 'US Dollar', symbol: '$' },
    { value: 'EUR', label: 'Euro', symbol: '€' },
    { value: 'GBP', label: 'British Pound', symbol: '£' },
    { value: 'JPY', label: 'Japanese Yen', symbol: '¥' },
    { value: 'CAD', label: 'Canadian Dollar', symbol: 'C$' },
    { value: 'AUD', label: 'Australian Dollar', symbol: 'A$' },
    { value: 'CHF', label: 'Swiss Franc', symbol: 'CHF' },
    { value: 'CNY', label: 'Chinese Yuan', symbol: '¥' },
    { value: 'INR', label: 'Indian Rupee', symbol: '₹' },
    { value: 'MXN', label: 'Mexican Peso', symbol: '$' },
]

export default function Onboarding({ user, onComplete, className }: OnboardingProps) {
    const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome')
    const [userFinancialData, setUserFinancialData] = useState({
        preferredCurrency: user.preferredCurrency,
        monthlyIncome: user.monthlyIncome,
        financialGoals: user.financialGoals || []
    })
    const [currentGoal, setCurrentGoal] = useState<Partial<Goal>>({})
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const firstName = user.name.split(' ')[0]

    const handleNext = () => {
        if (currentStep === 'welcome') {
            setCurrentStep('currency')
        } else if (currentStep === 'currency') {
            setCurrentStep('income')
        } else if (currentStep === 'income') {
            setCurrentStep('goals')
        } else if (currentStep === 'goals') {
            setCurrentStep('completion')
        } else if (currentStep === 'goal-amount') {
            if (currentGoal.name && inputValue) {
                setCurrentGoal(prev => ({ ...prev, targetAmount: parseFloat(inputValue) }))
                setInputValue('')
                setCurrentStep('goal-deadline')
            }
        } else if (currentStep === 'goal-deadline') {
            // Save the current goal with deadline
            if (currentGoal.name && currentGoal.targetAmount) {
                const newGoal: FinancialGoal = {
                    id: Date.now().toString(),
                    userId: user.id,
                    name: currentGoal.name,
                    targetAmount: currentGoal.targetAmount,
                    currentAmount: 0,
                    deadline: inputValue || undefined,
                    createdAt: new Date().toISOString()
                }
                setUserFinancialData(prev => ({
                    ...prev,
                    financialGoals: [...(prev.financialGoals || []), newGoal]
                }))
                setCurrentGoal({})
                setInputValue('')
                setCurrentStep('goals')
            }
        }
    }

    const handleCurrencySelect = (currency: Currency) => {
        setUserFinancialData(prev => ({ ...prev, preferredCurrency: currency }))
        setCurrentStep('income')
    }

    const handleIncomeSubmit = () => {
        const income = parseFloat(inputValue)
        if (income > 0) {
            setUserFinancialData(prev => ({ ...prev, monthlyIncome: income }))
            setInputValue('')
            setCurrentStep('goals')
        }
    }

    const handleAddGoal = () => {
        if (inputValue.trim()) {
            setCurrentGoal({ name: inputValue.trim() })
            setInputValue('')
            setCurrentStep('goal-amount')
        }
    }

    const handleSkipGoals = () => {
        setCurrentStep('completion')
    }

    const handleCompletion = async () => {
        setIsLoading(true)

        try {
            // Create data object with only defined values
            const dataToSave: Partial<Omit<User, 'id'>> = {
                preferredCurrency: userFinancialData.preferredCurrency,
                ...(userFinancialData.monthlyIncome !== undefined && { monthlyIncome: userFinancialData.monthlyIncome }),
                ...(userFinancialData.financialGoals && userFinancialData.financialGoals.length > 0 && { financialGoals: userFinancialData.financialGoals })
            }

            const { success } = await updateUserData(user.id, dataToSave)

            if (success) {
                setTimeout(() => {
                    onComplete({
                        ...user,
                        ...userFinancialData
                    })
                }, 1500)
            }
        } catch (error) {
            console.error('Error saving data:', error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (currentStep === 'completion') {
            handleCompletion()
        }
    }, [currentStep])

    const getCurrentStepIndex = () => {
        const steps = ['welcome', 'currency', 'income', 'goals', 'completion']
        return steps.indexOf(currentStep)
    }

    return (
        <div className={cn(
            'min-h-screen bg-transparent',
            'flex flex-col max-w-7xl mx-auto p-4 sm:p-6 lg:p-8',
            className
        )}>
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='flex-1 flex flex-col justify-center relative'
            >
                {/* Floating Background Elements */}
                <motion.div
                    className='absolute top-20 left-10 w-32 h-32 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 rounded-full blur-xl'
                    animate={{
                        y: [0, -20, 0],
                        x: [0, 10, 0],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut'
                    }}
                />
                <motion.div
                    className='absolute bottom-20 right-10 w-40 h-40 bg-gradient-to-r from-emerald-400/10 to-emerald-500/10 rounded-full blur-xl'
                    animate={{
                        y: [0, 20, 0],
                        x: [0, -15, 0],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 2
                    }}
                />

                {/* Header */}
                <motion.div variants={itemVariants} className='text-center mb-8 sm:mb-12'>
                    <motion.div
                        className='w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/25 relative'
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Bot className='w-10 h-10 sm:w-12 sm:h-12 text-white' />
                        <motion.div
                            className='absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-3xl'
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            style={{ opacity: 0.3 }}
                        />
                    </motion.div>
                    <motion.h1
                        className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Welcome, {firstName}!
                    </motion.h1>
                    <motion.p
                        className='text-lg sm:text-xl text-muted-foreground/80'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Let&apos;s personalize your financial journey
                    </motion.p>
                </motion.div>

                {/* Progress indicator */}
                <motion.div variants={itemVariants} className='flex justify-center mb-8 sm:mb-12'>
                    <div className='flex items-center gap-2 sm:gap-3'>
                        {['welcome', 'currency', 'income', 'goals', 'completion'].map((step, index) => (
                            <div key={step} className='flex items-center'>
                                <motion.div
                                    className={cn(
                                        'w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 flex items-center justify-center relative',
                                        getCurrentStepIndex() >= index
                                            ? 'bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/40'
                                            : 'bg-muted/30 dark:bg-muted/20 scale-100'
                                    )}
                                    animate={{
                                        scale: getCurrentStepIndex() >= index ? 1.1 : 1,
                                        backgroundColor: getCurrentStepIndex() >= index ? '#10b981' : undefined
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {getCurrentStepIndex() > index && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className='w-1.5 h-1.5 sm:w-2 sm:h-2 bg-white rounded-full'
                                        />
                                    )}
                                    {getCurrentStepIndex() === index && (
                                        <motion.div
                                            className='absolute inset-0 bg-emerald-500 rounded-full'
                                            animate={{ scale: [1, 1.3, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            style={{ opacity: 0.3 }}
                                        />
                                    )}
                                </motion.div>
                                {index < 4 && (
                                    <div className={cn(
                                        'w-6 sm:w-8 h-0.5 mx-1 transition-all duration-500',
                                        getCurrentStepIndex() > index
                                            ? 'bg-emerald-500'
                                            : 'bg-muted/30 dark:bg-muted/20'
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Content */}
                <div className='flex-1 flex items-center justify-center min-h-[400px] sm:min-h-[500px]'>
                    <motion.div
                        key={currentStep}
                        variants={slideVariants}
                        initial='hidden'
                        animate='visible'
                        exit='exit'
                        className='w-full max-w-6xl mx-auto'
                    >
                        {currentStep === 'welcome' && (
                            <div className='text-center'>
                                <div className='space-y-8 sm:space-y-12'>
                                    <motion.div
                                        className='grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12'
                                        variants={containerVariants}
                                    >
                                        {[
                                            {
                                                icon: DollarSign,
                                                title: 'Smart Tracking',
                                                description: 'AI-powered expense categorization and real-time insights into your spending patterns',
                                                gradient: 'from-emerald-500 to-emerald-600',
                                                bg: 'from-emerald-50/80 to-emerald-100/80 dark:from-emerald-950/50 dark:to-emerald-900/30'
                                            },
                                            {
                                                icon: Target,
                                                title: 'Goal Achievement',
                                                description: 'Set ambitious targets and receive personalized strategies to reach them faster',
                                                gradient: 'from-emerald-400 to-emerald-600',
                                                bg: 'from-blue-50/80 to-blue-100/80 dark:from-blue-950/50 dark:to-blue-900/30'
                                            },
                                            {
                                                icon: Sparkles,
                                                title: 'AI Guidance',
                                                description: 'Get expert-level financial advice powered by advanced AI models and market data',
                                                gradient: 'from-emerald-400 to-emerald-600',
                                                bg: 'from-purple-50/80 to-purple-100/80 dark:from-purple-950/50 dark:to-purple-900/30'
                                            }
                                        ].map((feature, index) => (
                                            <motion.div
                                                key={feature.title}
                                                variants={itemVariants}
                                                whileHover={{ y: -8, scale: 1.02 }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                                custom={index}
                                            >
                                                <Card className={cn(
                                                    'p-6 sm:p-8 h-full border-0 shadow-xl  relative overflow-hidden',
                                                    'bg-gradient-to-br', feature.bg,
                                                    'hover:shadow-2xl transition-all duration-500',
                                                    'border border-white/20 dark:border-white/10'
                                                )}>
                                                    <motion.div
                                                        className='absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10'
                                                        animate={{ rotate: [0, 360] }}
                                                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                                    />
                                                    <div className={cn(
                                                        'w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-r', feature.gradient,
                                                        'flex items-center justify-center mb-4 sm:mb-6 shadow-lg relative z-10'
                                                    )}>
                                                        <feature.icon className='w-6 h-6 sm:w-8 sm:h-8 text-white' />
                                                    </div>
                                                    <h3 className='font-bold text-lg sm:text-xl mb-3 text-foreground/90'>{feature.title}</h3>
                                                    <p className='text-sm sm:text-base text-muted-foreground/80 leading-relaxed'>
                                                        {feature.description}
                                                    </p>
                                                </Card>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.6 }}
                                    >
                                        <Button
                                            onClick={handleNext}
                                            size='lg'
                                            className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-8 sm:px-12 py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-full shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 hover:scale-105 border-0'
                                        >
                                            Begin Your Journey
                                            <ArrowRight className='w-5 h-5 sm:w-6 sm:h-6 ml-2' />
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {currentStep === 'currency' && (
                            <div className='w-full'>
                                <div className='text-center mb-8 sm:mb-12'>
                                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground'>Choose Your Currency</h2>
                                    <p className='text-muted-foreground/80 text-base sm:text-lg'>This will be your primary currency for all financial tracking</p>
                                </div>
                                <motion.div
                                    className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 max-w-6xl mx-auto'
                                    variants={containerVariants}
                                    initial='hidden'
                                    animate='visible'
                                >
                                    {CURRENCIES.map((currency, index) => (
                                        <motion.div
                                            key={currency.value}
                                            variants={itemVariants}
                                            whileHover={{ y: -8, scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card
                                                className={cn(
                                                    'p-4 sm:p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl rounded-2xl sm:rounded-3xl border-2 relative overflow-hidden group',
                                                    userFinancialData.preferredCurrency === currency.value
                                                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/80 dark:to-emerald-900/60 border-emerald-500 shadow-xl shadow-emerald-500/20 scale-105'
                                                        : 'bg-background/80 dark:bg-card/50 hover:bg-muted/30 dark:hover:bg-muted/20 border-border hover:border-emerald-200 dark:hover:border-emerald-700 '
                                                )}
                                                onClick={() => handleCurrencySelect(currency.value)}
                                            >
                                                <motion.div
                                                    className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                                                />
                                                <div className='text-center relative z-10'>
                                                    <div className='text-2xl sm:text-3xl font-bold mb-2 text-emerald-600 dark:text-emerald-400'>{currency.symbol}</div>
                                                    <div className='text-lg sm:text-xl font-semibold mb-1 text-foreground'>{currency.value}</div>
                                                    <div className='text-xs sm:text-sm text-muted-foreground/70'>{currency.label}</div>
                                                </div>
                                                {userFinancialData.preferredCurrency === currency.value && (
                                                    <motion.div
                                                        initial={{ scale: 0 }}
                                                        animate={{ scale: 1 }}
                                                        className='absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center'
                                                    >
                                                        <CheckCircle className='w-4 h-4 text-white' />
                                                    </motion.div>
                                                )}
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        )}

                        {currentStep === 'income' && (
                            <div className='w-full max-w-lg mx-auto'>
                                <div className='text-center mb-8 sm:mb-12'>
                                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground'>Monthly Income</h2>
                                    <p className='text-muted-foreground/80 text-base sm:text-lg'>
                                        Help us create personalized budgets and recommendations
                                    </p>
                                </div>
                                <Card className='p-6 sm:p-8 bg-gradient-to-br from-background/90 to-muted/20 dark:from-card/90 dark:to-muted/10  border-0 shadow-2xl rounded-3xl relative overflow-hidden'>
                                    <motion.div
                                        className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5'
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                    <div className='space-y-6 relative z-10'>
                                        <div className='relative'>
                                            <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                                                {CURRENCIES.find(c => c.value === userFinancialData.preferredCurrency)?.symbol}
                                            </span>
                                            <Input
                                                type='number'
                                                placeholder='5000'
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleIncomeSubmit()}
                                                className='pl-12 sm:pl-14 text-xl sm:text-2xl py-6 sm:py-8 text-center border-0 bg-muted/30 dark:bg-muted/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200'
                                            />
                                        </div>
                                        <Button
                                            onClick={handleIncomeSubmit}
                                            disabled={!inputValue || parseFloat(inputValue) <= 0}
                                            className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-muted disabled:to-muted py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 border-0'
                                        >
                                            Continue
                                            <ArrowRight className='w-5 h-5 sm:w-6 sm:h-6 ml-2' />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {currentStep === 'goals' && (
                            <div className='w-full max-w-4xl mx-auto'>
                                <div className='text-center mb-8 sm:mb-12'>
                                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground'>Financial Goals</h2>
                                    <p className='text-muted-foreground/80 text-base sm:text-lg'>
                                        Set meaningful targets to stay motivated and track your progress
                                    </p>
                                </div>

                                {userFinancialData.financialGoals && userFinancialData.financialGoals.length > 0 && (
                                    <motion.div
                                        className='mb-8 sm:mb-12'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h3 className='font-semibold mb-4 sm:mb-6 text-lg sm:text-xl text-foreground flex items-center gap-2'>
                                            <Star className='w-5 h-5 text-emerald-500' />
                                            Your Goals
                                        </h3>
                                        <div className='grid grid-cols-1 gap-4 sm:gap-6'>
                                            {userFinancialData.financialGoals.map((goal, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                    whileHover={{ scale: 1.02, y: -4 }}
                                                >
                                                    <Card className='p-4 overflow-hidden sm:p-6 bg-gradient-to-r from-emerald-50/80 to-emerald-100/80 dark:from-emerald-950/50 dark:to-emerald-900/30 border-emerald-200 dark:border-emerald-800 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 '>
                                                        <div className='flex justify-between items-start'>
                                                            <div className='flex-1'>
                                                                <div className='flex items-center gap-2 mb-2'>
                                                                    <Target className='w-4 h-4 text-emerald-600 dark:text-emerald-400' />
                                                                    <span className='font-semibold text-base sm:text-lg text-foreground/90'>{goal.name}</span>
                                                                </div>
                                                                {goal.deadline && (
                                                                    <div className='flex items-center gap-2 text-xs sm:text-sm text-emerald-600 dark:text-emerald-400'>
                                                                        <Calendar className='w-3 h-3' />
                                                                        Target: {new Date(goal.deadline).toLocaleDateString()}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <span className='text-emerald-600 dark:text-emerald-400 font-bold text-lg sm:text-xl'>
                                                                {CURRENCIES.find(c => c.value === userFinancialData.preferredCurrency)?.symbol}
                                                                {goal.targetAmount.toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </Card>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}

                                <Card className='p-6 sm:p-8 bg-gradient-to-br from-background/90 to-muted/20 dark:from-card/90 dark:to-muted/10  border-0 shadow-2xl rounded-3xl relative overflow-hidden'>
                                    <motion.div
                                        className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5'
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                    <div className='space-y-6 relative z-10'>
                                        <div className='relative'>
                                            <Input
                                                placeholder='e.g., Emergency Fund, Dream Vacation, New Home'
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                                                className='text-base sm:text-lg py-4 sm:py-6 border-0 bg-muted/30 dark:bg-muted/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200'
                                            />
                                        </div>
                                        <div className='flex flex-col sm:flex-row gap-3 sm:gap-4'>
                                            <Button
                                                onClick={handleAddGoal}
                                                disabled={!inputValue.trim()}
                                                className='flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-muted disabled:to-muted py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 border-0'
                                            >
                                                Add Goal
                                                <Target className='w-5 h-5 ml-2' />
                                            </Button>
                                            <Button
                                                onClick={handleSkipGoals}
                                                variant='outline'
                                                className='flex-1 py-4 sm:py-6 text-base sm:text-lg rounded-2xl border-2 hover:bg-muted/50 dark:hover:bg-muted/30 transition-all duration-300'
                                            >
                                                Skip for Now
                                            </Button>
                                        </div>
                                        {userFinancialData.financialGoals && userFinancialData.financialGoals.length > 0 && (
                                            <Button
                                                onClick={handleNext}
                                                className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-4 sm:py-6 text-base sm:text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 border-0'
                                            >
                                                Continue to Dashboard
                                                <ArrowRight className='w-5 h-5 ml-2' />
                                            </Button>
                                        )}
                                    </div>
                                </Card>
                            </div>
                        )}

                        {currentStep === 'goal-amount' && (
                            <div className='w-full max-w-lg mx-auto'>
                                <div className='text-center mb-8 sm:mb-12'>
                                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground'>Goal Amount</h2>
                                    <p className='text-muted-foreground/80 text-base sm:text-lg'>
                                        How much do you want to save for &quot;{currentGoal.name}&quot;?
                                    </p>
                                </div>
                                <Card className='p-6 sm:p-8 bg-gradient-to-br from-background/90 to-muted/20 dark:from-card/90 dark:to-muted/10  border-0 shadow-2xl rounded-3xl relative overflow-hidden'>
                                    <motion.div
                                        className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5'
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                    <div className='space-y-6 relative z-10'>
                                        <div className='relative'>
                                            <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400'>
                                                {CURRENCIES.find(c => c.value === userFinancialData.preferredCurrency)?.symbol}
                                            </span>
                                            <Input
                                                type='number'
                                                placeholder='1000'
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                                                className='pl-12 sm:pl-14 text-xl sm:text-2xl py-6 sm:py-8 text-center border-0 bg-muted/30 dark:bg-muted/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200'
                                            />
                                        </div>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!inputValue || parseFloat(inputValue) <= 0}
                                            className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-muted disabled:to-muted py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 border-0'
                                        >
                                            Set Amount
                                            <ArrowRight className='w-5 h-5 sm:w-6 sm:h-6 ml-2' />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {currentStep === 'goal-deadline' && (
                            <div className='w-full max-w-lg mx-auto'>
                                <div className='text-center mb-8 sm:mb-12'>
                                    <h2 className='text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-foreground'>Goal Deadline</h2>
                                    <p className='text-muted-foreground/80 text-base sm:text-lg'>
                                        When do you want to achieve &quot;{currentGoal.name}&quot;?
                                    </p>
                                </div>
                                <Card className='p-6 sm:p-8 bg-gradient-to-br from-background/90 to-muted/20 dark:from-card/90 dark:to-muted/10  border-0 shadow-2xl rounded-3xl relative overflow-hidden'>
                                    <motion.div
                                        className='absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-emerald-600/5'
                                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    />
                                    <div className='space-y-6 relative z-10'>
                                        <div className='relative'>
                                            <Calendar className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-emerald-600 dark:text-emerald-400' />
                                            <Input
                                                type='date'
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                className='pl-12 text-base sm:text-lg py-4 sm:py-6 border-0 bg-muted/30 dark:bg-muted/20 rounded-2xl focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400 focus:border-emerald-500 dark:focus:border-emerald-400 transition-all duration-200'
                                            />
                                        </div>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!inputValue}
                                            className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-muted disabled:to-muted py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 disabled:hover:scale-100 border-0'
                                        >
                                            Set Deadline
                                            <ArrowRight className='w-5 h-5 sm:w-6 sm:h-6 ml-2' />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {currentStep === 'completion' && (
                            <div className='text-center max-w-lg mx-auto'>
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                                    className='w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30 relative'
                                >
                                    <CheckCircle className='w-12 h-12 sm:w-16 sm:h-16 text-white' />
                                    <motion.div
                                        className='absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full'
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                        style={{ opacity: 0.3 }}
                                    />
                                </motion.div>
                                <motion.h2
                                    className='text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-foreground'
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    You&apos;re All Set!
                                </motion.h2>
                                <motion.p
                                    className='text-muted-foreground/80 text-base sm:text-lg lg:text-xl mb-8'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    Your personalized financial dashboard is ready. Let&apos;s start your journey to financial freedom!
                                </motion.p>
                                {isLoading && (
                                    <motion.div
                                        className='flex items-center justify-center gap-3'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className='animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-4 border-emerald-500 border-t-transparent shadow-lg'></div>
                                        <span className='text-muted-foreground/80 text-sm sm:text-base'>Setting up your dashboard...</span>
                                    </motion.div>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </motion.div>
        </div>
    )
} 