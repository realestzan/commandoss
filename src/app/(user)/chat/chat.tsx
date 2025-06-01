'use client'

import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AI_MODELS, detectCryptoTransfer } from '@/lib/chat'
import { ChatService } from '@/lib/chat-service'
import { ChatMessage, User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { motion, Variants } from 'framer-motion'
import { AlertCircle, Bot, CheckCircle, ChevronUp, Coins, Copy, ExternalLink, Save, Send, Settings, Wallet } from 'lucide-react'
import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { toast } from 'sonner'
import { ChatInput } from './input'
import { Message } from './message'
import MessageLoading from './message-loading'

// Internal message type with Date timestamp and loading state
interface InternalChatMessage extends Omit<ChatMessage, 'timestamp'> {
    timestamp: Date
    isLoading?: boolean
    transferData?: TransferCommand
    transferStatus?: TransferStatus
}

// Transfer command interface
interface TransferCommand {
    amount: number
    currency: string
    toAddress: string
    originalMessage: string
}

// Transfer status interface
interface TransferStatus {
    status: 'idle' | 'pending' | 'success' | 'error'
    message: string
    signature?: string
}

interface ChatProps {
    user: User
    initialInputValue?: string
    className?: string
    conversationId?: string
    onConversationSaved?: () => void
    onActionClick?: (action: string, conversationContext?: string) => void
    onBackToIntro?: () => void
}

export interface ChatRef {
    sendMessage: (message: string) => void
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
const SYSTEM_PROMPT = `You are a specialized personal finance assistant with advanced SUI cryptocurrency capabilities for a comprehensive finance management app.

User Information:
- Name: {userName}
- Preferred Currency: {currency}
- Monthly Income: {income}
- Financial Goals: {goals}

Your CORE capabilities include:
1. **SUI Crypto Transfers** - PRIMARY FEATURE: Detect and execute SUI cryptocurrency transfers using natural language
2. **Transaction Management**: Help users add income, expenses, and transfers with smart categorization
3. **Budget Planning**: Create detailed budgets by category with spending limits and tracking
4. **Bill Reminders**: Set up recurring bill payments and due date notifications
5. **Financial Goals**: Create SMART savings goals with progress tracking and timelines
6. **Bank Accounts**: Add and manage multiple bank accounts with balance tracking
7. **Recurring Items**: Set up recurring income (salary, freelance) or bills (rent, utilities)
8. **Financial Insights**: Provide detailed spending analysis, trends, and personalized recommendations
9. **Debt Management**: Track debts, payment schedules, and payoff strategies
10. **Financial Reports**: Generate comprehensive monthly/quarterly financial summaries

**CRITICAL: SUI Transfer Detection**
When users mention any of these patterns, IMMEDIATELY recognize as SUI transfer requests:
- "create a transfer [amount] SUI to [address]"
- "send [amount] SUI to [address]"
- "transfer [amount] SUI to my friend at [address]"
- "pay [amount] SUI to [address]"
- Any combination with: send, transfer, pay, create + SUI + address

**SUI Transfer Response Protocol:**
1. ALWAYS confirm the transfer details first
2. Validate the wallet address format
3. Confirm the amount in SUI
4. Ask about wallet connection status
5. Provide clear next steps for execution
6. NEVER suggest "Add Transaction" for SUI transfers - these are executed directly on blockchain

**Response Guidelines for SUI Transfers:**
- Recognize SUI transfers immediately from natural language
- Confirm amount, address, and readiness
- Guide through wallet connection if needed
- Explain the blockchain execution process
- Provide security reminders about address verification
- Use action buttons: "Execute SUI Transfer", "Review Transfer", "Cancel Transfer"

For other financial tasks:
- Provide actionable financial advice tailored to their situation
- Offer specific action buttons for financial operations they mention
- Give context-aware suggestions based on their income and goals
- Be encouraging and positive about their financial journey

**Action Button Priorities:**
1. SUI transfers → "Execute SUI Transfer" (primary)
2. Other crypto → "Crypto Tools" 
3. Regular transactions → "Add Transaction"
4. Budgets → "Create Budget"
5. Analysis → "Generate Report", "View Insights"

Always prioritize SUI transfer detection and provide crypto-specific guidance when detected.`

export const Chat = forwardRef<ChatRef, ChatProps>(({ user, initialInputValue, className, conversationId, onConversationSaved, onActionClick, onBackToIntro }, ref) => {
    const [messages, setMessages] = useState<InternalChatMessage[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null)
    const [isSaving, setIsSaving] = useState(false)
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
    const [selectedModel, setSelectedModel] = useState(AI_MODELS[0].id) // Default to Groq
    const [showModelSelector, setShowModelSelector] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const chatContainerRef = useRef<HTMLDivElement>(null)
    const messageIdCounter = useRef(0)
    const initialInputProcessed = useRef(false)

    // Wallet and transfer hooks
    const currentAccount = useCurrentAccount()
    const { mutate: signAndExecuteTransaction } = useSignAndExecuteTransaction()
    const [copied, setCopied] = useState(false)

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

    const callAI = async (messages: { role: string; content: string }[], retryCount = 0) => {
        const model = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[0]

        try {
            const response = await fetch(model.endpoint, {
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
                    },
                    model: model.model
                }),
            })

            if (!response.ok) {
                if (response.status === 429 && retryCount < 2) {
                    // Retry with exponential backoff
                    const delay = Math.pow(2, retryCount) * 2000 // 2s, 4s, 8s
                    await new Promise(resolve => setTimeout(resolve, delay))
                    return callAI(messages, retryCount + 1)
                }
                if (response.status === 429) {
                    throw new Error('Rate limit reached. Please wait a moment and try again.')
                }
                throw new Error('Failed to get response')
            }

            const data = await response.json()
            return data.content
        } catch (error) {
            console.error(`Error calling ${model.name} API:`, error)
            if (error instanceof Error && error.message.includes('Rate limit')) {
                return "I'm currently experiencing high demand. Please wait a moment and try again. I'll be right back! 🤖"
            }
            return "I'm sorry, I'm having trouble connecting right now. Please try again in a moment."
        }
    }

    const generateSuggestions = (content: string, userInput?: string): string[] => {
        const suggestions: string[] = []

        // Context-aware suggestions based on response content
        if (content.toLowerCase().includes('expense') || content.toLowerCase().includes('spending')) {
            suggestions.push('Add a new expense', 'View spending by category', 'Set expense budget', 'Analyze spending trends')
        }
        if (content.toLowerCase().includes('income') || content.toLowerCase().includes('salary')) {
            suggestions.push('Log new income', 'Set up recurring salary', 'Update monthly income', 'Track income sources')
        }
        if (content.toLowerCase().includes('budget')) {
            suggestions.push('Create new budget', 'Check budget status', 'Adjust budget limits', 'Monthly budget review')
        }
        if (content.toLowerCase().includes('bill') || content.toLowerCase().includes('payment')) {
            suggestions.push('Add bill reminder', 'Mark bill as paid', 'Set up auto-pay', 'View upcoming bills')
        }
        if (content.toLowerCase().includes('goal') || content.toLowerCase().includes('save')) {
            suggestions.push('Create savings goal', 'Update goal progress', 'Adjust goal target', 'Goal achievement plan')
        }
        if (content.toLowerCase().includes('debt') || content.toLowerCase().includes('loan')) {
            suggestions.push('Add debt tracker', 'Create payment plan', 'Calculate payoff time', 'Debt consolidation advice')
        }
        if (content.toLowerCase().includes('crypto') || content.toLowerCase().includes('sui') || content.toLowerCase().includes('transfer')) {
            suggestions.push('Send SUI transfer', 'Check crypto balance', 'View transfer history', 'Connect wallet')
        }
        if (content.toLowerCase().includes('report') || content.toLowerCase().includes('analysis')) {
            suggestions.push('Generate monthly report', 'Spending breakdown', 'Income vs expenses', 'Financial health check')
        }
        if (content.toLowerCase().includes('account') || content.toLowerCase().includes('bank')) {
            suggestions.push('Add bank account', 'Update balance', 'Account reconciliation', 'Transfer between accounts')
        }

        // User input based suggestions
        if (userInput) {
            const input = userInput.toLowerCase()
            if (input.includes('help') || input.includes('how')) {
                suggestions.push('Step-by-step guide', 'Best practices', 'Common mistakes to avoid')
            }
            if (input.includes('start') || input.includes('begin')) {
                suggestions.push('Quick setup wizard', 'Getting started tips', 'Essential first steps')
            }
            if (input.includes('improve') || input.includes('better')) {
                suggestions.push('Optimization tips', 'Advanced strategies', 'Financial health check')
            }
        }

        // Always include these universal suggestions if none match
        if (suggestions.length === 0) {
            suggestions.push('Add transaction', 'Create budget', 'Set financial goal', 'View insights')
        }

        // Remove duplicates and return up to 5 suggestions
        return [...new Set(suggestions)].slice(0, 5)
    }

    const generateActionButtons = (content: string, userInput?: string) => {
        const buttons: { label: string; action: string; variant?: 'primary' | 'secondary' }[] = []

        // Check for crypto transfer commands in user input FIRST (highest priority)
        if (userInput) {
            const transferCommand = detectCryptoTransfer(userInput)
            if (transferCommand) {
                buttons.push({
                    label: '🚀 Execute SUI Transfer',
                    action: 'crypto-transfer',
                    variant: 'primary'
                })
                buttons.push({
                    label: 'Review Transfer Details',
                    action: 'review-transfer',
                    variant: 'secondary'
                })
                buttons.push({
                    label: 'Cancel Transfer',
                    action: 'cancel-transfer',
                    variant: 'secondary'
                })
                return buttons // Return early for SUI transfers
            }

            // Check for general crypto mentions
            const input = userInput.toLowerCase()
            if ((input.includes('crypto') || input.includes('sui') || input.includes('transfer')) && !transferCommand) {
                buttons.push({ label: '₿ Crypto Tools', action: 'crypto-tools', variant: 'primary' })
            }
        }

        // Content-based action buttons (only if no SUI transfer detected)
        if (content.toLowerCase().includes('add') && content.toLowerCase().includes('transaction')) {
            buttons.push({ label: 'Add Transaction', action: 'add-transaction', variant: 'primary' })
        }
        if (content.toLowerCase().includes('create') && content.toLowerCase().includes('budget')) {
            buttons.push({ label: 'Create Budget', action: 'add-budget', variant: 'primary' })
        }
        if (content.toLowerCase().includes('set') && (content.toLowerCase().includes('goal') || content.toLowerCase().includes('save'))) {
            buttons.push({ label: 'Set Savings Goal', action: 'add-goal', variant: 'primary' })
        }
        if (content.toLowerCase().includes('bill') || content.toLowerCase().includes('reminder')) {
            buttons.push({ label: 'Add Bill Reminder', action: 'add-bill', variant: 'primary' })
        }
        if (content.toLowerCase().includes('bank') && content.toLowerCase().includes('account')) {
            buttons.push({ label: 'Add Bank Account', action: 'add-account', variant: 'primary' })
        }
        if (content.toLowerCase().includes('recurring') || content.toLowerCase().includes('regular')) {
            buttons.push({ label: 'Set Recurring Item', action: 'add-recurring', variant: 'primary' })
        }

        // Income/expense specific buttons
        if (content.toLowerCase().includes('income') || content.toLowerCase().includes('salary')) {
            buttons.push({ label: 'Log Income', action: 'add-income', variant: 'primary' })
        }
        if (content.toLowerCase().includes('expense') || content.toLowerCase().includes('spend')) {
            buttons.push({ label: 'Log Expense', action: 'add-expense', variant: 'primary' })
        }

        // Analysis and reporting buttons
        if (content.toLowerCase().includes('report') || content.toLowerCase().includes('summary')) {
            buttons.push({ label: 'Generate Report', action: 'generate-report', variant: 'secondary' })
        }
        if (content.toLowerCase().includes('analysis') || content.toLowerCase().includes('insight')) {
            buttons.push({ label: 'View Insights', action: 'view-insights', variant: 'secondary' })
        }

        // Additional context buttons based on user input
        if (userInput) {
            const input = userInput.toLowerCase()
            if (input.includes('debt') && !buttons.some(b => b.action === 'add-debt')) {
                buttons.push({ label: 'Track Debt', action: 'add-debt', variant: 'secondary' })
            }
        }

        // Always include a general "Add Transaction" if no specific actions
        if (buttons.length === 0) {
            buttons.push({ label: 'Add Transaction', action: 'add-transaction', variant: 'primary' })
            buttons.push({ label: 'Create Budget', action: 'add-budget', variant: 'secondary' })
        }

        // Ensure we don't have too many buttons (max 4)
        return buttons.slice(0, 4)
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

        // Check if this is a crypto transfer command
        const transferCommand = detectCryptoTransfer(content)

        if (transferCommand) {
            // Create transfer message with embedded UI
            const transferMessageId = generateMessageId()
            setMessages(prev => {
                const assistantMessage: InternalChatMessage = {
                    id: transferMessageId,
                    content: `I detected a SUI transfer request: ${transferCommand.amount} ${transferCommand.currency} to ${transferCommand.toAddress.slice(0, 8)}...${transferCommand.toAddress.slice(-8)}`,
                    role: 'assistant',
                    timestamp: new Date(),
                    transferData: { ...transferCommand, originalMessage: content },
                    transferStatus: { status: 'idle', message: '' }
                }
                return [...prev, assistantMessage]
            })
            setIsLoading(false)
            return
        }

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
            const response = await callAI(apiMessages)

            // Add actual response
            setMessages(prev => {
                const assistantMessage: InternalChatMessage = {
                    id: generateMessageId(),
                    content: response,
                    role: 'assistant',
                    timestamp: new Date(),
                    suggestions: generateSuggestions(response, content),
                    actionButtons: generateActionButtons(response, content)
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
        // Get conversation context from last few messages
        const contextMessages = messages.slice(-3) // Get last 3 messages for context
        const conversationContext = contextMessages
            .map(msg => `${msg.role}: ${msg.content}`)
            .join('\n')

        // Different actions can trigger different behaviors
        switch (action) {
            case 'add-transaction':
                onActionClick?.('add-transaction', conversationContext)
                break
            case 'add-budget':
                onActionClick?.('add-budget', conversationContext)
                break
            case 'add-bill':
                onActionClick?.('add-bill', conversationContext)
                break
            case 'add-goal':
                onActionClick?.('add-goal', conversationContext)
                break
            case 'add-income':
                onActionClick?.('add-income', conversationContext)
                break
            case 'add-expense':
                onActionClick?.('add-expense', conversationContext)
                break
            case 'add-recurring':
                onActionClick?.('add-recurring', conversationContext)
                break
            case 'add-account':
                onActionClick?.('add-account', conversationContext)
                break
            case 'add-debt':
                onActionClick?.('add-debt', conversationContext)
                break
            default:
                onActionClick?.(action, conversationContext)
                break
        }
    }

    // Copy to clipboard function
    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopied(true)
            toast.success('Address copied to clipboard!')
            setTimeout(() => setCopied(false), 2000)
        } catch {
            toast.error('Failed to copy address')
        }
    }

    // Execute SUI transfer
    const executeSuiTransfer = useCallback(async (command: TransferCommand, messageId: string) => {
        if (!currentAccount) {
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        transferStatus: {
                            status: 'error',
                            message: 'Wallet not connected'
                        }
                    }
                    : msg
            ))
            return
        }

        try {
            // Update status to pending
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        transferStatus: {
                            status: 'pending',
                            message: 'Creating SUI transaction...'
                        }
                    }
                    : msg
            ))

            // Convert SUI to MIST (1 SUI = 10^9 MIST)
            const amountInMist = Math.floor(command.amount * 1_000_000_000)

            // Create a new transaction
            const transaction = new Transaction()

            // Add transfer coins transaction
            transaction.transferObjects([
                transaction.splitCoins(transaction.gas, [amountInMist])
            ], command.toAddress)

            // Update status to wallet approval
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        transferStatus: {
                            status: 'pending',
                            message: 'Please approve the transaction in your Slush wallet...'
                        }
                    }
                    : msg
            ))

            // Sign and execute transaction using the hook
            signAndExecuteTransaction(
                {
                    transaction,
                    chain: 'sui:testnet',
                },
                {
                    onSuccess: (result) => {
                        setMessages(prev => prev.map(msg =>
                            msg.id === messageId
                                ? {
                                    ...msg,
                                    transferStatus: {
                                        status: 'success',
                                        message: `Transfer successful! Transaction: ${result.digest}`,
                                        signature: result.digest
                                    }
                                }
                                : msg
                        ))
                        toast.success('SUI transfer completed successfully!')

                        // Add natural follow-up message
                        setTimeout(() => {
                            setMessages(prev => [...prev, {
                                id: generateMessageId(),
                                content: `🎉 Great! Your ${command.amount} SUI transfer has been completed successfully. The funds should now be available in the recipient's wallet.\n\nThe transaction has been recorded on the Sui blockchain and you can view it on the explorer anytime. Is there anything else I can help you with today?`,
                                role: 'assistant',
                                timestamp: new Date(),
                                suggestions: ['Check my balance', 'Send another transfer', 'View transaction history']
                            }])
                        }, 1000)
                    },
                    onError: (error) => {
                        console.error('Transfer failed:', error)
                        const errorMessage = error instanceof Error ? error.message : 'Transfer failed. Please try again.'
                        setMessages(prev => prev.map(msg =>
                            msg.id === messageId
                                ? {
                                    ...msg,
                                    transferStatus: {
                                        status: 'error',
                                        message: errorMessage
                                    }
                                }
                                : msg
                        ))
                        toast.error('Transfer failed: ' + errorMessage)
                    }
                }
            )

        } catch (error) {
            console.error('Transfer failed:', error)
            const errorMessage = error instanceof Error ? error.message : 'Transfer failed. Please try again.'
            setMessages(prev => prev.map(msg =>
                msg.id === messageId
                    ? {
                        ...msg,
                        transferStatus: {
                            status: 'error',
                            message: errorMessage
                        }
                    }
                    : msg
            ))
            toast.error('Transfer failed: ' + errorMessage)
        }
    }, [currentAccount, signAndExecuteTransaction])

    // Transfer UI Component to be embedded in messages
    const TransferUI = ({ message }: { message: InternalChatMessage }) => {
        if (!message.transferData) return null

        const { transferData, transferStatus } = message
        const isConnected = !!currentAccount

        return (
            <div className='mt-4 px-16 py-8'>
                {/* Main Transfer Card */}
                <div className='bg-background hover:shadow-2xl shadow-emerald-800/20 transition-shadow duration-300 rounded-3xl border border-emerald-200/50 overflow-hidden'>
                    {/* Header */}
                    <div className='bg-gradient-to-r from-emerald-400/80 to-emerald-400/80 p-4'>
                        <h4 className='font-semibold text-emerald-900 flex items-center gap-2'>
                            <Coins className='h-5 w-5' />
                            SUI Transfer Details
                        </h4>
                    </div>

                    <div className='p-6 space-y-6'>
                        {/* Transfer Amount Section */}
                        <div className='bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-3xl border border-emerald-200'>
                            <div className='flex items-center justify-between'>
                                <div>
                                    <p className='text-sm text-emerald-700 font-medium'>Transfer Amount</p>
                                    <p className='text-3xl font-bold text-emerald-900 mt-1'>
                                        {transferData.amount} {transferData.currency}
                                    </p>
                                </div>
                                <div className='w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center'>
                                    <Send className='h-6 w-6 text-white' />
                                </div>
                            </div>
                        </div>

                        {/* Recipient Address */}
                        <div className='space-y-3'>
                            <label className='text-sm font-semibold text-gray-700'>Recipient Address</label>
                            <div className='bg-card p-4 rounded-2xl border border-gray-200 hover:border-emerald-300 transition-colors'>
                                <div className='flex items-center justify-between gap-3'>
                                    <span className='font-mono text-sm text-gray-600 break-all flex-1'>
                                        {transferData.toAddress}
                                    </span>
                                    <button
                                        onClick={() => copyToClipboard(transferData.toAddress)}
                                        className='p-2 hover:bg-emerald-50 rounded-xl transition-colors group'
                                        title='Copy address'
                                    >
                                        {copied ?
                                            <CheckCircle className='h-4 w-4 text-emerald-600' /> :
                                            <Copy className='h-4 w-4 text-gray-500 group-hover:text-emerald-600' />
                                        }
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Wallet Connection Status */}
                        <div className='space-y-3'>
                            <label className='text-sm font-semibold text-gray-700 flex items-center gap-2'>
                                <Wallet className='h-4 w-4' />
                                Slush Wallet Status
                            </label>
                            {isConnected ? (
                                <div className='bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-200'>
                                    <div className='flex items-center justify-between'>
                                        <div className='flex items-center gap-3'>
                                            <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                                                <CheckCircle className='h-5 w-5 text-white' />
                                            </div>
                                            <div>
                                                <p className='font-semibold text-green-800'>Connected</p>
                                                <p className='text-xs text-green-600 font-mono'>
                                                    {currentAccount?.address.slice(0, 12)}...{currentAccount?.address.slice(-8)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className='bg-card p-4 rounded-2xl '>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <div className='w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center'>
                                            <AlertCircle className='h-5 w-5 text-white' />
                                        </div>
                                        <div>
                                            <p className='font-semibold text-gray-700'>Not Connected</p>
                                            <p className='text-xs text-gray-500'>Connect your wallet to proceed</p>
                                        </div>
                                    </div>
                                    <div className='[&>button]:w-full [&>button]:py-3 [&>button]:rounded-2xl [&>button]:font-semibold [&>button]:text-emerald-900 rounded-3xl w-full'>
                                        <ConnectButton />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Transfer Action Button */}
                        <button
                            onClick={() => executeSuiTransfer(transferData, message.id)}
                            disabled={!isConnected || transferStatus?.status === 'pending'}
                            className={cn(
                                'w-full py-4 px-6 rounded-2xl font-semibold transition-all duration-200 flex items-center justify-center gap-2',
                                (!isConnected || transferStatus?.status === 'pending')
                                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-500 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]'
                            )}
                        >
                            {transferStatus?.status === 'pending' ? (
                                <>
                                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                    Processing Transfer...
                                </>
                            ) : !isConnected ? (
                                <>
                                    <Wallet className='h-5 w-5' />
                                    Connect Wallet to Transfer
                                </>
                            ) : (
                                <>
                                    <Send className='h-5 w-5' />
                                    Execute {transferData.amount} {transferData.currency} Transfer
                                </>
                            )}
                        </button>

                        {/* Transfer Status */}
                        {transferStatus && transferStatus.status && transferStatus.status !== 'idle' && (
                            <div className={cn(
                                'p-4 rounded-2xl border-2',
                                transferStatus.status === 'success' && 'bg-green-50 border-green-200',
                                transferStatus.status === 'error' && 'bg-red-50 border-red-200',
                                transferStatus.status === 'pending' && 'bg-blue-50 border-blue-200'
                            )}>
                                <div className='flex items-start gap-3'>
                                    <div className='flex-shrink-0 mt-0.5'>
                                        {transferStatus.status === 'success' ? (
                                            <div className='w-8 h-8 bg-green-500 rounded-full flex items-center justify-center'>
                                                <CheckCircle className='h-5 w-5 text-white' />
                                            </div>
                                        ) : transferStatus.status === 'error' ? (
                                            <div className='w-8 h-8 bg-red-500 rounded-full flex items-center justify-center'>
                                                <AlertCircle className='h-5 w-5 text-white' />
                                            </div>
                                        ) : (
                                            <div className='w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center'>
                                                <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin' />
                                            </div>
                                        )}
                                    </div>
                                    <div className='flex-1'>
                                        <p className={cn(
                                            'font-semibold',
                                            transferStatus.status === 'success' && 'text-green-800',
                                            transferStatus.status === 'error' && 'text-red-800',
                                            transferStatus.status === 'pending' && 'text-blue-800'
                                        )}>
                                            {transferStatus.status === 'success' && 'Transfer Completed!'}
                                            {transferStatus.status === 'error' && 'Transfer Failed'}
                                            {transferStatus.status === 'pending' && 'Processing...'}
                                        </p>
                                        <p className={cn(
                                            'text-sm mt-1',
                                            transferStatus.status === 'success' && 'text-green-700',
                                            transferStatus.status === 'error' && 'text-red-700',
                                            transferStatus.status === 'pending' && 'text-blue-700'
                                        )}>
                                            {transferStatus.message}
                                        </p>
                                        {transferStatus.signature && (
                                            <div className='mt-3 p-3 bg-white rounded-xl border border-green-200'>
                                                <p className='text-xs text-green-600 font-medium mb-2'>Transaction Hash</p>
                                                <div className='flex items-center justify-between gap-2'>
                                                    <span className='font-mono text-xs text-green-700 break-all'>
                                                        {transferStatus.signature}
                                                    </span>
                                                    <button
                                                        onClick={() => copyToClipboard(transferStatus.signature!)}
                                                        className='p-1 hover:bg-green-50 rounded'
                                                    >
                                                        <Copy className='h-3 w-3 text-green-600' />
                                                    </button>
                                                </div>
                                                <a
                                                    href={`https://testnet.suivision.xyz/txblock/${transferStatus.signature}`}
                                                    target='_blank'
                                                    rel='noopener noreferrer'
                                                    className='inline-flex items-center gap-1 mt-2 text-green-600 hover:text-green-800 text-sm font-medium transition-colors'
                                                >
                                                    <ExternalLink className='h-4 w-4' />
                                                    View on Sui Explorer
                                                </a>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className='bg-emerald-300 dark:bg-emerald-900 p-3'>
                        <div className='flex items-center justify-center gap-2 text-xs text-emerald-900 dark:text-emerald-300'>
                            <div className='w-2 h-2 bg-emerald-500 rounded-full animate-pulse'></div>
                            Running on Sui Testnet
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    // Expose sendMessage method through ref
    useImperativeHandle(ref, () => ({
        sendMessage: (message: string) => {
            handleUserMessage(message)
        }
    }), [handleUserMessage])

    return (
        <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={cn("flex flex-col h-full", className)}
        >
            {/* Chat Header */}
            <div className="rounded-3xl bg-background p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={onBackToIntro}
                        className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                    <div>
                        <h1 className="text-lg font-semibold">Financial Assistant</h1>
                        <p className="text-sm text-muted-foreground">
                            {conversationId ? 'Continue conversation' : 'AI-powered finance help'}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4 text-muted-foreground" />
                        <Select value={selectedModel} onValueChange={setSelectedModel}>
                            <SelectTrigger className="w-40 h-8 text-xs">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {AI_MODELS.map((model) => (
                                    <SelectItem key={model.id} value={model.id}>
                                        {model.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>

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
                        <p className="text-muted-foreground max-w-md mb-3">
                            Hi {user.name.split(' ')[0]}! I&apos;m here to help you manage your finances.
                            Ask me anything about budgets, expenses, savings goals, or financial planning.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                            <span>Powered by</span>
                            <span className="font-semibold text-emerald-600">
                                {AI_MODELS.find(m => m.id === selectedModel)?.name}
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-6">
                            {[
                                'Help me create a budget',
                                'Track my expenses',
                                'Send SUI to someone',
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
                    <div key={message.id}>
                        <Message
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
                        {message.transferData && <TransferUI message={message} />}
                    </div>
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
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm text-muted-foreground">
                                    {AI_MODELS.find(m => m.id === selectedModel)?.name} is thinking...
                                </span>
                            </div>
                            <MessageLoading />
                            <MessageLoading />
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
                    {/* Model Selector Button */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="relative"
                    >
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowModelSelector(!showModelSelector)}
                            className="w-12 h-12 bg-white hover:bg-gray-50 border-emerald-200 hover:border-emerald-300 rounded-full shadow-lg flex items-center justify-center transition-colors"
                            title="Change AI Model"
                        >
                            <Settings className="w-5 h-5 text-emerald-600" />
                        </Button>

                        {showModelSelector && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-xl shadow-2xl border border-emerald-200 overflow-hidden"
                            >
                                <div className="p-3 border-b border-emerald-100">
                                    <h4 className="font-semibold text-sm text-emerald-800">AI Model</h4>
                                </div>
                                <div className="p-2">
                                    {AI_MODELS.map((model) => (
                                        <button
                                            key={model.id}
                                            onClick={() => {
                                                setSelectedModel(model.id)
                                                setShowModelSelector(false)
                                                toast.success(`Switched to ${model.name}`)
                                            }}
                                            className={cn(
                                                "w-full text-left px-3 py-2 text-sm rounded-lg transition-colors",
                                                selectedModel === model.id
                                                    ? "bg-emerald-100 text-emerald-800 font-medium"
                                                    : "hover:bg-emerald-50 text-gray-700"
                                            )}
                                        >
                                            {model.name}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

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
})

Chat.displayName = 'Chat' 