'use client'

import { User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'
import { Bot } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import ManualEntry from '../tracker/manual'
import { ChatInput } from './input'
import { Message } from './message'

interface ChatMessage {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    suggestions?: string[]
    actionButtons?: {
        label: string
        action: string
        variant?: 'primary' | 'secondary'
    }[]
    isLoading?: boolean
}

interface ChatProps {
    user: User
    initialInputValue?: string
    className?: string
}

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

// System prompt for the financial assistant
const SYSTEM_PROMPT = `You are a helpful personal finance assistant for a finance management app. 

User Information:
- Name: {userName}
- Preferred Currency: {currency}
- Monthly Income: {income}
- Financial Goals: {goals}

Your capabilities include:
1. **Transaction Management**: Help users add income, expenses, and transfers
2. **Budget Planning**: Create and manage budgets by category
3. **Bill Reminders**: Set up and track bill payments
4. **Financial Goals**: Create and track savings goals
5. **Bank Accounts**: Add and manage bank accounts
6. **Recurring Items**: Set up recurring income or bills
7. **Financial Insights**: Provide spending analysis and suggestions

When users ask for help with financial tasks, you should:
- Provide helpful financial advice
- Offer to help them add specific financial data
- Give suggestions for better financial management
- Be concise but informative
- Use their name and currency preferences

If a user wants to add any financial data, offer action buttons to help them do so directly.

Keep responses concise and actionable. Always be encouraging about their financial journey.`

export function Chat({ user, initialInputValue, className }: ChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)
    const [manualEntryType, setManualEntryType] = useState<'transaction' | 'budget' | 'bill-reminder' | 'bank-account' | 'recurring-item' | undefined>()
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const messageIdCounter = useRef(0)
    const initialInputProcessed = useRef(false)

    // Generate unique message ID
    const generateMessageId = () => {
        messageIdCounter.current += 1
        return `msg_${Date.now()}_${messageIdCounter.current}`
    }

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const callGroqAPI = async (messages: { role: string; content: string }[], retryCount = 0) => {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    messages,
                    user: {
                        name: user.name,
                        currency: user.preferredCurrency,
                        income: user.monthlyIncome,
                        goals: user.financialGoals?.length || 0
                    }
                }),
            })

            if (!response.ok) {
                if (response.status === 429 && retryCount < 2) {
                    // Retry with exponential backoff
                    const delay = Math.pow(2, retryCount) * 2000 // 2s, 4s, 8s
                    await new Promise(resolve => setTimeout(resolve, delay))
                    return callGroqAPI(messages, retryCount + 1)
                }
                if (response.status === 429) {
                    throw new Error('Rate limit reached. Please wait a moment and try again.')
                }
                throw new Error('Failed to get response')
            }

            const data = await response.json()
            return data.content
        } catch (error) {
            console.error('Error calling Groq API:', error)
            if (error instanceof Error && error.message.includes('Rate limit')) {
                return "I'm currently experiencing high demand. Please wait a moment and try again. I'll be right back! 🤖"
            }
            return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
        }
    }

    const generateSuggestions = (content: string): string[] => {
        const suggestions: string[] = []

        if (content.toLowerCase().includes('expense') || content.toLowerCase().includes('spending')) {
            suggestions.push('Add an expense', 'View spending trends')
        }
        if (content.toLowerCase().includes('income') || content.toLowerCase().includes('salary')) {
            suggestions.push('Add income', 'Update monthly income')
        }
        if (content.toLowerCase().includes('budget')) {
            suggestions.push('Create budget', 'View budgets')
        }
        if (content.toLowerCase().includes('bill') || content.toLowerCase().includes('payment')) {
            suggestions.push('Add bill reminder', 'View upcoming bills')
        }
        if (content.toLowerCase().includes('goal') || content.toLowerCase().includes('save')) {
            suggestions.push('Set savings goal', 'Track progress')
        }

        // Default suggestions if none match
        if (suggestions.length === 0) {
            suggestions.push('Add transaction', 'Create budget', 'Set goal')
        }

        return suggestions.slice(0, 3) // Limit to 3 suggestions
    }

    const generateActionButtons = (content: string) => {
        const buttons: { label: string; action: string; variant?: 'primary' | 'secondary' }[] = []

        if (content.toLowerCase().includes('add') && content.toLowerCase().includes('transaction')) {
            buttons.push({ label: 'Add Transaction', action: 'add-transaction', variant: 'primary' })
        }
        if (content.toLowerCase().includes('create') && content.toLowerCase().includes('budget')) {
            buttons.push({ label: 'Create Budget', action: 'add-budget', variant: 'primary' })
        }
        if (content.toLowerCase().includes('set') && content.toLowerCase().includes('goal')) {
            buttons.push({ label: 'Set Goal', action: 'add-goal', variant: 'primary' })
        }
        if (content.toLowerCase().includes('add') && content.toLowerCase().includes('bill')) {
            buttons.push({ label: 'Add Bill', action: 'add-bill', variant: 'primary' })
        }

        return buttons
    }

    const handleUserMessage = useCallback(async (content: string) => {
        const userMessage: ChatMessage = {
            id: generateMessageId(),
            content,
            role: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        // Add loading message
        const loadingMessage: ChatMessage = {
            id: generateMessageId(),
            content: '',
            role: 'assistant',
            timestamp: new Date(),
            isLoading: true
        }

        setMessages(prev => [...prev, loadingMessage])

        // Prepare messages for API
        const apiMessages = [
            {
                role: 'system',
                content: SYSTEM_PROMPT
                    .replace('{userName}', user.name)
                    .replace('{currency}', user.preferredCurrency)
                    .replace('{income}', user.monthlyIncome?.toString() || 'Not set')
                    .replace('{goals}', user.financialGoals?.length.toString() || '0')
            },
            ...messages.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content
            }
        ]

        try {
            const response = await callGroqAPI(apiMessages)

            // Remove loading message and add actual response
            setMessages(prev => {
                const withoutLoading = prev.filter(msg => !msg.isLoading)
                const assistantMessage: ChatMessage = {
                    id: generateMessageId(),
                    content: response,
                    role: 'assistant',
                    timestamp: new Date(),
                    suggestions: generateSuggestions(response),
                    actionButtons: generateActionButtons(response)
                }
                return [...withoutLoading, assistantMessage]
            })
        } catch {
            // Remove loading message and add error message
            setMessages(prev => {
                const withoutLoading = prev.filter(msg => !msg.isLoading)
                const errorMessage: ChatMessage = {
                    id: generateMessageId(),
                    content: "I&apos;m sorry, I encountered an error. Please try again.",
                    role: 'assistant',
                    timestamp: new Date()
                }
                return [...withoutLoading, errorMessage]
            })
        }

        setIsLoading(false)
    }, [user.name, user.preferredCurrency, user.monthlyIncome, user.financialGoals, messages])

    // Process initial input value only once
    useEffect(() => {
        if (initialInputValue && !initialInputProcessed.current) {
            initialInputProcessed.current = true
            handleUserMessage(initialInputValue)
        }
    }, [initialInputValue, handleUserMessage])

    const handleSuggestionClick = (suggestion: string) => {
        handleUserMessage(suggestion)
    }

    const handleActionClick = (action: string) => {
        // Different actions can trigger different behaviors
        switch (action) {
            case 'add-transaction':
                setIsManualEntryOpen(true)
                setManualEntryType('transaction')
                break
            case 'add-budget':
                setIsManualEntryOpen(true)
                setManualEntryType('budget')
                break
            case 'add-bill':
                setIsManualEntryOpen(true)
                setManualEntryType('bill-reminder')
                break
            case 'add-goal':
                setIsManualEntryOpen(true)
                setManualEntryType('bank-account') // or create a new goal type
                break
            default:
                setIsManualEntryOpen(true)
                setManualEntryType(undefined)
                break
        }
    }

    const handleManualEntryComplete = () => {
        // Add a confirmation message
        const confirmationMessage: ChatMessage = {
            id: generateMessageId(),
            content: "Great! I've helped you add that financial data. Is there anything else you'd like to track or manage?",
            role: 'assistant',
            timestamp: new Date(),
            suggestions: ['Add another transaction', 'View my budget', 'Set a new goal']
        }
        setMessages(prev => [...prev, confirmationMessage])
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn("flex flex-col h-full", className)}
        >
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.length === 0 && !initialInputValue && (
                    <motion.div variants={itemVariants} className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
                            <Bot className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Financial Assistant</h3>
                        <p className="text-muted-foreground max-w-md">
                            Hi {user.name.split(' ')[0]}! I&apos;m here to help you manage your finances.
                            Ask me anything about budgets, expenses, savings goals, or financial planning.
                        </p>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {[
                                'Help me create a budget',
                                'Track my expenses',
                                'Set savings goals',
                                'Add a bill reminder'
                            ].map((prompt) => (
                                <button
                                    key={prompt}
                                    onClick={() => handleUserMessage(prompt)}
                                    className="px-4 py-2 text-sm bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200 transition-colors"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {messages.map((message) => (
                    <Message
                        key={message.id}
                        id={message.id}
                        content={message.content}
                        role={message.role}
                        timestamp={message.timestamp}
                        user={user}
                        isLoading={message.isLoading}
                        suggestions={message.suggestions}
                        actionButtons={message.actionButtons}
                        onSuggestionClick={handleSuggestionClick}
                        onActionClick={handleActionClick}
                    />
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="px-4">
                <ChatInput
                    onSubmit={handleUserMessage}
                    isLoading={isLoading}
                    initialInputValue={initialInputValue}
                />
            </div>

            {/* Manual Entry Modal */}
            <ManualEntry
                user={user}
                isOpen={isManualEntryOpen}
                onClose={() => {
                    setIsManualEntryOpen(false)
                    setManualEntryType(undefined)
                }}
                onComplete={handleManualEntryComplete}
                initialType={manualEntryType}
            />
        </motion.div>
    )
} 