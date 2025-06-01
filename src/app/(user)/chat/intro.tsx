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
    { id: 'search', name: 'Search', description: 'Find information quickly' },
    { id: 'programming', name: 'Programming', description: 'Code and development help' },
    { id: 'writing', name: 'Writing', description: 'Content creation and editing' },
    { id: 'productivity', name: 'Productivity', description: 'Get more done' },
    { id: 'lifestyle', name: 'Lifestyle', description: 'Daily life assistance' }
]

const FEATURES = [
    {
        id: 'expense-tracker',
        name: 'Expense Tracker',
        description: 'Log and categorize your daily spending',
        prompt: 'Help me track my daily expenses and categorize my spending patterns'
    },
    {
        id: 'budget-planner',
        name: 'Budget Planner',
        description: 'Create and manage monthly budgets by category',
        prompt: 'I want to create a monthly budget plan for my finances'
    },
    {
        id: 'savings-goals',
        name: 'Savings Goals',
        description: 'Set financial goals and track your progress',
        prompt: 'Help me set up savings goals and track my progress toward them'
    },
    {
        id: 'crypto-transfer',
        name: 'SUI Crypto Transfer',
        description: 'Send SUI cryptocurrency using natural language',
        prompt: 'I want to send SUI to someone using natural language commands'
    },
    {
        id: 'smart-insights',
        name: 'Smart Insights',
        description: 'Get spending trends and saving suggestions',
        prompt: 'Give me insights about my spending habits and suggestions for saving money'
    },
    {
        id: 'debt-manager',
        name: 'Debt Manager',
        description: 'Track debts and get reminders to pay or collect',
        prompt: 'Help me manage my debts and set up payment reminders'
    },
    {
        id: 'finance-qa',
        name: 'Finance Q&A',
        description: 'Ask anything about your personal finances',
        prompt: 'I have questions about personal finance and need advice'
    },
    {
        id: 'report-generator',
        name: 'Report Generator',
        description: 'Generate summaries of your financial activities',
        prompt: 'Create a financial report summarizing my recent activities'
    },
]

interface Category {
    id: string
    name: string
    description?: string
}

const ChatIntro = ({ user, onPromptSelect }: ChatIntroProps) => {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

    const firstName = user.name.split(' ')[0]

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
                {/* Services Section */}
                <div className="flex items-center justify-between mt-8">
                    <h2 className="text-2xl font-semibold">Financial Tools</h2>
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
                                variant={selectedCategory === category.id ? 'ghost' : 'ghost'}
                                className={cn(
                                    'px-4 py-2 rounded-full transition-colors duration-200',
                                    selectedCategory === category.id
                                        ? 'bg-emerald-400/80 '
                                        : 'bg-primary/5 hover:bg-primary/10'
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

                {/* Automation Section */}
                <motion.h3 variants={itemVariants} className="mt-6 text-xl font-semibold">
                    Smart Suggestions
                </motion.h3>
                <div className="mt-4 grid grid-cols-4 gap-4 h-full">
                    {FEATURES.slice(0, 4).map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={itemVariants}
                            className="bg-gradient-to-tr from-emerald-400/80 to-emerald-400/80 p-4 rounded-3xl flex flex-col justify-between"
                        >
                            <h4 className="text-lg font-semibold">{feature.name}</h4>
                            <p className="text-sm opacity-75">{feature.description}</p>
                            <Button
                                className="mt-8 w-full bg-background hover:bg-background/50 text-primary rounded-full"
                                onClick={() => onPromptSelect(feature.prompt)}
                            >
                                Start Chat
                            </Button>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.h3 variants={itemVariants} className="mt-8 text-xl font-semibold">
                    Quick Actions
                </motion.h3>
                <div className="mt-4 grid grid-cols-3 gap-4">
                    {FEATURES.slice(4).map((feature) => (
                        <motion.div
                            key={feature.id}
                            variants={itemVariants}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button
                                variant="outline"
                                className="w-full h-auto p-4 flex flex-col items-start text-left border-emerald-200 hover:bg-emerald-50"
                                onClick={() => onPromptSelect(feature.prompt)}
                            >
                                <h5 className="font-semibold text-emerald-700">{feature.name}</h5>
                                <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                            </Button>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    )
}

export default ChatIntro