'use client'
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { User } from "@/lib/types"
import { cn } from "@/lib/utils"
import { motion, Variants } from "framer-motion"

export const itemVariants: Variants = {
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

interface ChatIntroProps {
    user: User
    onPromptSelect: (prompt: string) => void
}

const CATEGORIES: Category[] = [
    { id: 'transactions', name: 'Transactions', description: 'Track income & expenses' },
    { id: 'budgeting', name: 'Budgeting', description: 'Plan & manage budgets' },
    { id: 'crypto', name: 'Crypto', description: 'SUI transfers & crypto' },
    { id: 'goals', name: 'Goals', description: 'Savings & financial goals' },
    { id: 'insights', name: 'Insights', description: 'Analytics & reports' }
]

const MAIN_FEATURES = [
    {
        id: 'quick-expense',
        name: 'Quick Expense',
        description: 'Log an expense with smart categorization',
        prompt: 'I want to add a new expense transaction'
    },
    {
        id: 'income-tracker',
        name: 'Add Income',
        description: 'Record salary, freelance, or other income',
        prompt: 'Help me add a new income transaction to my records'
    },
    {
        id: 'budget-creator',
        name: 'Create Budget',
        description: 'Set up monthly or custom period budgets',
        prompt: 'I want to create a new budget for managing my spending'
    },
    {
        id: 'sui-transfer',
        name: 'SUI Crypto Transfer',
        description: 'Send SUI tokens using natural language',
        prompt: 'I want to send SUI cryptocurrency to someone'
    },
]

const SECONDARY_FEATURES = [
    {
        id: 'bill-reminder',
        name: 'Bill Reminders',
        description: 'Set up recurring bill payments and reminders',
        prompt: 'Help me set up bill reminders for my monthly payments'
    },
    {
        id: 'savings-goal',
        name: 'Savings Goals',
        description: 'Create and track progress toward financial goals',
        prompt: 'I want to create a new savings goal and track my progress'
    },
    {
        id: 'bank-accounts',
        name: 'Bank Accounts',
        description: 'Manage multiple bank accounts and balances',
        prompt: 'Help me add and manage my bank accounts'
    },
    {
        id: 'recurring-income',
        name: 'Recurring Items',
        description: 'Set up recurring income or bills',
        prompt: 'I want to set up recurring transactions for regular income or bills'
    },
    {
        id: 'spending-analysis',
        name: 'Spending Analysis',
        description: 'Analyze spending patterns and trends',
        prompt: 'Give me insights about my spending habits and suggest improvements'
    },
    {
        id: 'debt-tracker',
        name: 'Debt Management',
        description: 'Track debts and payment schedules',
        prompt: 'Help me manage my debts and create a payment plan'
    },
]

const QUICK_ACTIONS = [
    {
        id: 'monthly-report',
        name: 'Monthly Report',
        description: 'Generate comprehensive financial summary',
        prompt: 'Create a monthly financial report with all my activities'
    },
    {
        id: 'budget-check',
        name: 'Budget Status',
        description: 'Check current budget performance',
        prompt: 'Show me how I am doing with my current budgets'
    },
    {
        id: 'goal-progress',
        name: 'Goal Progress',
        description: 'Review savings goals advancement',
        prompt: 'How am I progressing with my financial goals this month?'
    },
    {
        id: 'crypto-balance',
        name: 'Crypto Portfolio',
        description: 'Check SUI and crypto holdings',
        prompt: 'Show me my cryptocurrency portfolio and recent transactions'
    }
]

interface Category {
    id: string
    name: string
    description?: string
}

const ChatIntro = ({ user, onPromptSelect }: ChatIntroProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const firstName = user.name.split(' ')[0]

    const getFilteredFeatures = () => {
        if (!selectedCategory) return [...SECONDARY_FEATURES, ...QUICK_ACTIONS]

        switch (selectedCategory) {
            case 'transactions':
                return SECONDARY_FEATURES.filter(f =>
                    ['bill-reminder', 'recurring-income'].includes(f.id)
                ).concat(QUICK_ACTIONS.filter(f => ['monthly-report'].includes(f.id)))
            case 'budgeting':
                return SECONDARY_FEATURES.filter(f =>
                    ['spending-analysis'].includes(f.id)
                ).concat(QUICK_ACTIONS.filter(f => ['budget-check', 'monthly-report'].includes(f.id)))
            case 'crypto':
                return SECONDARY_FEATURES.filter(f =>
                    ['bank-accounts'].includes(f.id)
                ).concat(QUICK_ACTIONS.filter(f => ['crypto-balance'].includes(f.id)))
            case 'goals':
                return SECONDARY_FEATURES.filter(f =>
                    ['savings-goal', 'debt-tracker'].includes(f.id)
                ).concat(QUICK_ACTIONS.filter(f => ['goal-progress'].includes(f.id)))
            case 'insights':
                return SECONDARY_FEATURES.filter(f =>
                    ['spending-analysis'].includes(f.id)
                ).concat(QUICK_ACTIONS)
            default:
                return [...SECONDARY_FEATURES, ...QUICK_ACTIONS]
        }
    }

    return (
        <motion.div>
            <div className='space-y-2'>
                <motion.h1 variants={itemVariants} className='text-4xl font-semibold'>
                    Welcome back, <span className='tek'>{firstName}</span>
                </motion.h1>
                <motion.h2 variants={itemVariants} className='text-4xl font-semibold tek'>
                    How can I assist with your finances today?
                </motion.h2>
            </div>

            <motion.div variants={itemVariants}>
                {/* Financial Categories */}
                <div className="flex items-center justify-between mt-8">
                    <h2 className="text-2xl font-semibold">Financial Categories</h2>
                    {selectedCategory && (
                        <Button
                            variant="ghost"
                            onClick={() => setSelectedCategory(null)}
                            className="text-sm text-emerald-600 hover:text-emerald-700"
                        >
                            Show All
                        </Button>
                    )}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                    {CATEGORIES.map((category) => (
                        <motion.div
                            key={category.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                variant={selectedCategory === category.id ? 'default' : 'ghost'}
                                className={cn(
                                    'px-4 py-2 rounded-full transition-colors duration-200',
                                    selectedCategory === category.id
                                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                )}
                                onClick={() =>
                                    setSelectedCategory(selectedCategory === category.id ? null : category.id)
                                }
                            >
                                {category.name}
                                {category.description && (
                                    <span className="ml-2 text-xs opacity-70">
                                        {category.description}
                                    </span>
                                )}
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Main Features - Primary Actions */}
                <motion.h3 variants={itemVariants} className="mt-8 text-xl font-semibold">
                    Quick Start
                </motion.h3>
                <div className="mt-4 grid grid-cols-4 gap-4 h-full">
                    {MAIN_FEATURES.map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-gradient-to-tr from-emerald-400/80 to-emerald-500/80 p-4 rounded-3xl flex flex-col justify-between min-h-[140px]"
                        >
                            <div>
                                <h4 className="text-lg font-semibold text-emerald-900">{feature.name}</h4>
                                <p className="text-sm opacity-75 text-emerald-800 mt-1">{feature.description}</p>
                            </div>
                            <Button
                                className="mt-4 w-full bg-white/90 hover:bg-white text-emerald-700 rounded-full border-0 font-semibold"
                                onClick={() => onPromptSelect(feature.prompt)}
                            >
                                Start
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Secondary Features */}
                <motion.h3 variants={itemVariants} className="mt-8 text-xl font-semibold">
                    {selectedCategory ? `${CATEGORIES.find(c => c.id === selectedCategory)?.name} Tools` : 'More Financial Tools'}
                </motion.h3>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {getFilteredFeatures().slice(0, 6).map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="outline"
                                className="w-full h-auto p-4 flex flex-col items-start text-left border-emerald-200 hover:bg-emerald-50 hover:border-emerald-300 transition-colors overflow-hidden"
                                onClick={() => onPromptSelect(feature.prompt)}
                            >
                                <h5 className="font-semibold text-emerald-700">{feature.name}</h5>
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{feature.description}</p>
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* User-specific suggestions */}
                {user.monthlyIncome && (
                    <motion.div variants={itemVariants} className="mt-8 p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-3xl border border-emerald-200">
                        <h3 className="text-lg font-semibold text-emerald-800 mb-2">Personalized Suggestions</h3>
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPromptSelect(`Help me create a budget based on my monthly income of ${user.monthlyIncome} ${user.preferredCurrency}`)}
                                className="bg-white/50 hover:bg-white/80 text-emerald-700 rounded-full"
                            >
                                Budget with {user.monthlyIncome} {user.preferredCurrency}
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onPromptSelect('Analyze my spending versus my monthly income and suggest improvements')}
                                className="bg-white/50 hover:bg-white/80 text-emerald-700 rounded-full"
                            >
                                Income vs Spending Analysis
                            </Button>
                        </div>
                    </motion.div>
                )}
            </motion.div>
        </motion.div>
    )
}

export default ChatIntro