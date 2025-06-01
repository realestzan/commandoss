'use client'

import { ChatService } from '@/lib/chat-service'
import { ChatMessage, User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion, Variants } from 'framer-motion'
import { Bot, ChevronUp, Save } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ChatInput } from './input'
import { Message } from './message'
import MessageLoading from './message-loading'

// Internal message type with Date timestamp and loading state
interface InternalChatMessage extends Omit<ChatMessage, 'timestamp'> {
    timestamp: Date
    isLoading?: boolean
}

interface ChatProps {
    user: User
    initialInputValue?: string
    className?: string
    conversationId?: string
    onConversationSaved?: () => void
    onActionClick?: (action: string) => void
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

export function Chat({ user, initialInputValue, className, conversationId, onConversationSaved, onActionClick }: ChatProps) {
    const [messages, setMessages] = useState<InternalChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null)
    const [isSaving, setIsSaving] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
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

    const scrollToTop = () => {
        chatContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // Mark as having unsaved changes when messages change
    useEffect(() => {
        if (messages.length > 0 && !isLoading) {
            setHasUnsavedChanges(true)
        }
    }, [messages, isLoading])

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

    // Convert internal ChatMessage to Firebase ChatMessage
    const convertToFirebaseMessage = (msg: InternalChatMessage): ChatMessage => ({
        id: msg.id,
        content: msg.content,
        role: msg.role,
        timestamp: msg.timestamp.toISOString(),
        suggestions: msg.suggestions,
        actionButtons: msg.actionButtons
    })

    // Manual save function for the floating button
    const handleManualSave = async () => {
        if (messages.length === 0) return

        try {
            setIsSaving(true)
            const firebaseMessages = messages
                .filter(msg => !msg.isLoading) // Don't save loading messages
                .map(convertToFirebaseMessage)

            if (firebaseMessages.length === 0) return

            if (currentConversationId) {
                // Update existing conversation
                await ChatService.updateConversation(currentConversationId, firebaseMessages)
            } else {
                // Create new conversation
                const newConversationId = await ChatService.saveConversation(user.id, firebaseMessages)
                setCurrentConversationId(newConversationId)
            }

            setHasUnsavedChanges(false)
            onConversationSaved?.()
        } catch (error) {
            console.error('Failed to save conversation:', error)
        } finally {
            setIsSaving(false)
        }
    }

    // Load existing conversation
    useEffect(() => {
        const loadConversation = async () => {
            if (conversationId) {
                // Clear messages first when loading a different conversation
                if (conversationId !== currentConversationId) {
                    setMessages([])
                    setHasUnsavedChanges(false)
                }

                try {
                    const conversation = await ChatService.getConversation(conversationId)
                    if (conversation) {
                        const loadedMessages: InternalChatMessage[] = conversation.messages.map(msg => ({
                            ...msg,
                            timestamp: new Date(msg.timestamp)
                        }))
                        setMessages(loadedMessages)
                        setCurrentConversationId(conversationId)
                        setHasUnsavedChanges(false) // Loaded messages are already saved

                        // Reset the initial input processing flag for loaded conversations
                        initialInputProcessed.current = true
                    }
                } catch (error) {
                    console.error('Failed to load conversation:', error)
                }
            } else if (conversationId === undefined && currentConversationId !== null) {
                // Clear conversation when no conversationId (new chat)
                setMessages([])
                setCurrentConversationId(null)
                setHasUnsavedChanges(false)
                initialInputProcessed.current = false
            }
        }

        loadConversation()
    }, [conversationId]) // Remove currentConversationId from dependencies to avoid conflicts

    const handleUserMessage = useCallback(async (content: string) => {
        const userMessage: InternalChatMessage = {
            id: generateMessageId(),
            content,
            role: 'user',
            timestamp: new Date()
        }

        const newMessages = [...messages, userMessage]
        setMessages(newMessages)
        setIsLoading(true)

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

            // Add actual response
            setMessages(prev => {
                const assistantMessage: InternalChatMessage = {
                    id: generateMessageId(),
                    content: response,
                    role: 'assistant',
                    timestamp: new Date(),
                    suggestions: generateSuggestions(response),
                    actionButtons: generateActionButtons(response)
                }
                return [...prev, assistantMessage]
            })
        } catch {
            // Add error message
            setMessages(prev => {
                const errorMessage: InternalChatMessage = {
                    id: generateMessageId(),
                    content: "I'm sorry, I encountered an error. Please try again.",
                    role: 'assistant',
                    timestamp: new Date()
                }
                return [...prev, errorMessage]
            })
        }

        setIsLoading(false)
    }, [user.name, user.preferredCurrency, user.monthlyIncome, user.financialGoals, messages, user.id])

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
                onActionClick?.('add-transaction')
                break
            case 'add-budget':
                onActionClick?.('add-budget')
                break
            case 'add-bill':
                onActionClick?.('add-bill')
                break
            case 'add-goal':
                onActionClick?.('add-goal')
                break
            default:
                onActionClick?.('add-transaction')
                break
        }
    }

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn("flex flex-col h-full", className)}
        >
            {/* Chat Messages */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
            >
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

                {/* Show loading animation when waiting for response */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-start gap-4 px-4 py-6"
                    >
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 flex items-center justify-center flex-shrink-0">
                            <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 max-w-3xl">
                            <MessageLoading />
                            <MessageLoading />
                            <MessageLoading />
                            <MessageLoading />
                            <MessageLoading />
                        </div>
                    </motion.div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Chat Input */}
            <div className="px-4 pr-20">
                <ChatInput
                    onSubmit={handleUserMessage}
                    isLoading={isLoading}
                    initialInputValue={initialInputValue}
                />
            </div>

            {/* Floating Action Buttons */}
            {messages.length > 0 && (
                <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-10">
                    {/* Scroll to Top Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={scrollToTop}
                        className="w-12 h-12 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full shadow-lg flex items-center justify-center transition-colors"
                        title="Scroll to top"
                    >
                        <ChevronUp className="w-5 h-5" />
                    </motion.button>

                    {/* Save Conversation Button */}
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={handleManualSave}
                        disabled={isSaving || !hasUnsavedChanges}
                        className={cn(
                            "w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-colors",
                            hasUnsavedChanges && !isSaving
                                ? "bg-emerald-600 hover:bg-emerald-800 text-white"
                                : "bg-gray-300 text-gray-500 cursor-not-allowed"
                        )}
                        title={
                            isSaving
                                ? "Saving..."
                                : hasUnsavedChanges
                                    ? "Save conversation"
                                    : "No changes to save"
                        }
                    >
                        <Save className={cn("w-5 h-5", isSaving && "animate-pulse")} />
                    </motion.button>
                </div>
            )}
        </motion.div>
    )
} 