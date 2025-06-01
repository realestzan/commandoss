'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { updateUserData } from '@/lib/auth'
import { Currency, FinancialGoal, User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'
import { ArrowRight, Bot, CheckCircle, DollarSign, Sparkles, Target } from 'lucide-react'
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
            'min-h-screen ',
            'flex flex-col max-w-6xl mx-auto p-6',
            className
        )}>
            <motion.div
                variants={containerVariants}
                initial='hidden'
                animate='visible'
                className='flex-1 flex flex-col justify-center'
            >
                {/* Header */}
                <motion.div variants={itemVariants} className='text-center mb-12'>
                    <motion.div
                        className='w-20 h-20 rounded-3xl bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20'
                        whileHover={{ scale: 1.05, rotate: 5 }}
                        transition={{ type: 'spring', stiffness: 300 }}
                    >
                        <Bot className='w-10 h-10 text-white' />
                    </motion.div>
                    <motion.h1
                        className='text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-emerald-600 to-emerald-800 dark:from-emerald-400 dark:to-emerald-600 bg-clip-text text-transparent'
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        Welcome, {firstName}!
                    </motion.h1>
                    <motion.p
                        className='text-xl text-muted-foreground'
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Let&apos;s set up your financial profile
                    </motion.p>
                </motion.div>

                {/* Progress indicator */}
                <motion.div variants={itemVariants} className='flex justify-center'>
                    <div className='flex items-center gap-3'>
                        {['welcome', 'currency', 'income', 'goals', 'completion'].map((step, index) => (
                            <div key={step} className='flex items-center'>
                                <motion.div
                                    className={cn(
                                        'w-4 h-4 rounded-full transition-all duration-500 flex items-center justify-center',
                                        getCurrentStepIndex() >= index
                                            ? 'bg-emerald-500 scale-110 shadow-lg shadow-emerald-500/30'
                                            : 'bg-muted/50 scale-100'
                                    )}
                                    animate={{
                                        scale: getCurrentStepIndex() >= index ? 1.1 : 1,
                                        backgroundColor: getCurrentStepIndex() >= index ? '#10b981' : '#64748b'
                                    }}
                                    transition={{ duration: 0.3 }}
                                >
                                    {getCurrentStepIndex() > index && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className='w-2 h-2 bg-white rounded-full'
                                        />
                                    )}
                                </motion.div>
                                {index < 4 && (
                                    <div className={cn(
                                        'w-8 h-0.5 mx-1 transition-all duration-500',
                                        getCurrentStepIndex() > index ? 'bg-emerald-500' : 'bg-muted/30'
                                    )} />
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Content */}
                <div className='flex-1 flex items-center justify-center min-h-[300px]'>
                    <motion.div
                        key={currentStep}
                        variants={slideVariants}
                        initial='hidden'
                        animate='visible'
                        exit='exit'
                        className='w-full'
                    >
                        {currentStep === 'welcome' && (
                            <div className='text-center max-w-4xl mx-auto'>
                                <div className='space-y-8'>
                                    <motion.div
                                        className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-12'
                                        variants={containerVariants}
                                    >
                                        {[
                                            {
                                                icon: DollarSign,
                                                title: 'Track Expenses',
                                                description: 'Monitor your spending habits with intelligent categorization',
                                                gradient: 'from-emerald-500 to-emerald-600',
                                                bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20'
                                            },
                                            {
                                                icon: Target,
                                                title: 'Set Goals',
                                                description: 'Achieve your financial dreams with smart planning',
                                                gradient: 'from-blue-500 to-blue-600',
                                                bg: 'from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20'
                                            },
                                            {
                                                icon: Sparkles,
                                                title: 'AI Insights',
                                                description: 'Get personalized recommendations and smart analysis',
                                                gradient: 'from-purple-500 to-purple-600',
                                                bg: 'from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20'
                                            }
                                        ].map((feature) => (
                                            <motion.div
                                                key={feature.title}
                                                variants={itemVariants}
                                                whileHover={{ y: -5, scale: 1.02 }}
                                                transition={{ type: 'spring', stiffness: 300 }}
                                            >
                                                <Card className={cn(
                                                    'p-8 h-full border-0 shadow-xl backdrop-blur-sm',
                                                    'bg-gradient-to-br', feature.bg,
                                                    'hover:shadow-2xl transition-all duration-300'
                                                )}>
                                                    <div className={cn(
                                                        'w-12 h-12 rounded-2xl bg-gradient-to-r', feature.gradient,
                                                        'flex items-center justify-center mb-4 shadow-lg'
                                                    )}>
                                                        <feature.icon className='w-6 h-6 text-white' />
                                                    </div>
                                                    <h3 className='font-bold text-lg mb-2'>{feature.title}</h3>
                                                    <p className='text-sm text-muted-foreground leading-relaxed'>
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
                                            className='bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 px-8 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
                                        >
                                            Let&apos;s Get Started
                                            <ArrowRight className='w-5 h-5 ml-2' />
                                        </Button>
                                    </motion.div>
                                </div>
                            </div>
                        )}

                        {currentStep === 'currency' && (
                            <div className='w-full max-w-4xl mx-auto'>
                                <div className='text-center mb-10'>
                                    <h2 className='text-3xl md:text-4xl font-bold mb-3'>Choose Your Currency</h2>
                                    <p className='text-muted-foreground text-lg'>This will be used for all your financial tracking</p>
                                </div>
                                <motion.div
                                    className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'
                                    variants={containerVariants}
                                    initial='hidden'
                                    animate='visible'
                                >
                                    {CURRENCIES.map((currency, index) => (
                                        <motion.div
                                            key={currency.value}
                                            variants={itemVariants}
                                            whileHover={{ y: -5, scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                        >
                                            <Card
                                                className={cn(
                                                    'p-6 cursor-pointer transition-all duration-300 hover:shadow-2xl rounded-3xl border-2',
                                                    userFinancialData.preferredCurrency === currency.value
                                                        ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-800 dark:to-emerald-500 border-emerald-500 shadow-xl shadow-emerald-500/20'
                                                        : 'bg-background hover:bg-muted/30 border-border hover:border-emerald-200'
                                                )}
                                                onClick={() => handleCurrencySelect(currency.value)}
                                            >
                                                <div className='text-center'>
                                                    <div className='text-3xl font-bold mb-2 text-emerald-600'>{currency.symbol}</div>
                                                    <div className='text-lg font-semibold mb-1'>{currency.value}</div>
                                                    <div className='text-xs text-muted-foreground'>{currency.label}</div>
                                                </div>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </motion.div>
                            </div>
                        )}

                        {currentStep === 'income' && (
                            <div className='w-full max-w-lg mx-auto'>
                                <div className='text-center mb-10'>
                                    <h2 className='text-3xl md:text-4xl font-bold mb-3'>Monthly Income</h2>
                                    <p className='text-muted-foreground text-lg'>
                                        Help us understand your financial capacity
                                    </p>
                                </div>
                                <Card className='p-8 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm border-0 shadow-2xl rounded-3xl'>
                                    <div className='space-y-6'>
                                        <div className='relative'>
                                            <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-emerald-600'>
                                                {CURRENCIES.find(c => c.value === userFinancialData.preferredCurrency)?.symbol}
                                            </span>
                                            <Input
                                                type='number'
                                                placeholder='5000'
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleIncomeSubmit()}
                                                className='pl-12 text-2xl py-8 text-center border-0 bg-muted/30 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500'
                                            />
                                        </div>
                                        <Button
                                            onClick={handleIncomeSubmit}
                                            disabled={!inputValue || parseFloat(inputValue) <= 0}
                                            className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
                                        >
                                            Continue
                                            <ArrowRight className='w-5 h-5 ml-2' />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {currentStep === 'goals' && (
                            <div className='w-full max-w-3xl mx-auto'>
                                <div className='text-center mb-10'>
                                    <h2 className='text-3xl md:text-4xl font-bold mb-3'>Financial Goals</h2>
                                    <p className='text-muted-foreground text-lg'>
                                        Set goals to stay motivated and track progress
                                    </p>
                                </div>

                                {userFinancialData.financialGoals && userFinancialData.financialGoals.length > 0 && (
                                    <motion.div
                                        className='mb-8'
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                    >
                                        <h3 className='font-semibold mb-4 text-lg'>Your Goals:</h3>
                                        <div className='space-y-3'>
                                            {userFinancialData.financialGoals.map((goal, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.1 }}
                                                >
                                                    <Card className='p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-200 dark:border-emerald-800 rounded-2xl'>
                                                        <div className='flex justify-between items-center'>
                                                            <div className='flex-1'>
                                                                <span className='font-semibold text-lg'>{goal.name}</span>
                                                                {goal.deadline && (
                                                                    <p className='text-sm text-emerald-600 mt-1'>
                                                                        Due: {new Date(goal.deadline).toLocaleDateString()}
                                                                    </p>
                                                                )}
                                                            </div>
                                                            <span className='text-emerald-600 font-bold text-xl'>
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

                                <Card className='p-8 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm border-0 shadow-2xl rounded-3xl'>
                                    <div className='space-y-6'>
                                        <Input
                                            placeholder='e.g., Emergency Fund, Vacation, New Car'
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
                                            className='text-lg py-6 border-0 bg-muted/30 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500'
                                        />
                                        <div className='flex flex-col sm:flex-row gap-4'>
                                            <Button
                                                onClick={handleAddGoal}
                                                disabled={!inputValue.trim()}
                                                className='flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
                                            >
                                                Add Goal
                                                <Target className='w-5 h-5 ml-2' />
                                            </Button>
                                            <Button
                                                onClick={handleSkipGoals}
                                                variant='outline'
                                                className='flex-1 py-4 text-lg rounded-2xl border-2 hover:bg-muted/50'
                                            >
                                                Skip for Now
                                            </Button>
                                        </div>
                                        {userFinancialData.financialGoals && userFinancialData.financialGoals.length > 0 && (
                                            <Button
                                                onClick={handleNext}
                                                className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
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
                                <div className='text-center mb-10'>
                                    <h2 className='text-3xl md:text-4xl font-bold mb-3'>Goal Amount</h2>
                                    <p className='text-muted-foreground text-lg'>
                                        How much do you want to save for &quot;{currentGoal.name}&quot;?
                                    </p>
                                </div>
                                <Card className='p-8 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm border-0 shadow-2xl rounded-3xl'>
                                    <div className='space-y-6'>
                                        <div className='relative'>
                                            <span className='absolute left-4 top-1/2 transform -translate-y-1/2 text-2xl font-bold text-emerald-600'>
                                                {CURRENCIES.find(c => c.value === userFinancialData.preferredCurrency)?.symbol}
                                            </span>
                                            <Input
                                                type='number'
                                                placeholder='1000'
                                                value={inputValue}
                                                onChange={(e) => setInputValue(e.target.value)}
                                                onKeyPress={(e) => e.key === 'Enter' && handleNext()}
                                                className='pl-12 text-2xl py-8 text-center border-0 bg-muted/30 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500'
                                            />
                                        </div>
                                        <Button
                                            onClick={handleNext}
                                            disabled={!inputValue || parseFloat(inputValue) <= 0}
                                            className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
                                        >
                                            Set Amount
                                            <ArrowRight className='w-5 h-5 ml-2' />
                                        </Button>
                                    </div>
                                </Card>
                            </div>
                        )}

                        {currentStep === 'goal-deadline' && (
                            <div className='w-full max-w-lg mx-auto'>
                                <div className='text-center mb-10'>
                                    <h2 className='text-3xl md:text-4xl font-bold mb-3'>Goal Deadline</h2>
                                    <p className='text-muted-foreground text-lg'>
                                        When do you want to achieve &quot;{currentGoal.name}&quot;?
                                    </p>
                                </div>
                                <Card className='p-8 bg-gradient-to-br from-background to-muted/20 backdrop-blur-sm border-0 shadow-2xl rounded-3xl'>
                                    <div className='space-y-6'>
                                        <Input
                                            type='date'
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className='text-lg py-6 border-0 bg-muted/30 rounded-2xl focus:ring-emerald-500 focus:border-emerald-500'
                                        />
                                        <Button
                                            onClick={handleNext}
                                            disabled={!inputValue}
                                            className='w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 py-4 text-lg font-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105'
                                        >
                                            Set Deadline
                                            <ArrowRight className='w-5 h-5 ml-2' />
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
                                    className='w-24 h-24 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-emerald-500/30'
                                >
                                    <CheckCircle className='w-12 h-12 text-white' />
                                </motion.div>
                                <motion.h2
                                    className='text-4xl font-bold mb-4'
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                >
                                    All Set!
                                </motion.h2>
                                <motion.p
                                    className='text-muted-foreground text-lg mb-8'
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.6 }}
                                >
                                    Your financial profile is configured. Let&apos;s start managing your money!
                                </motion.p>
                                {isLoading && (
                                    <motion.div
                                        className='flex items-center justify-center'
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                    >
                                        <div className='animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent shadow-lg'></div>
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