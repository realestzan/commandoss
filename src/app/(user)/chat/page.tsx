'use client'

import ChatHistory, { ChatHistoryRef } from '@/app/(user)/chat/history'
import { useAuth } from '@/hooks/use-auth'
import { ExpenseCategory } from '@/lib/types'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ManualEntry from '../tracker/manual'
import { Chat, ChatRef } from './chat'
import ChatIntro from './intro'

type ManualEntryType = 'transaction' | 'budget' | 'bill-reminder' | 'bank-account' | 'recurring-item'

// Define interface for initial form data
interface InitialFormData {
    // Transaction fields
    transactionType?: 'income' | 'expense' | 'transfer'
    amount?: string
    description?: string
    date?: string
    category?: ExpenseCategory

    // Budget fields
    budgetName?: string
    budgetAmount?: string
    startDate?: string
    endDate?: string

    // Bill reminder fields
    billName?: string
    billAmount?: string
    dueDate?: string
    status?: 'paid' | 'unpaid' | 'overdue'

    // Bank account fields
    accountName?: string
    balance?: string
    institution?: string
    accountType?: 'checking' | 'savings' | 'credit'

    // Recurring item fields
    recurringName?: string
    recurringType?: 'income' | 'bill'
    recurringAmount?: string
    frequency?: 'weekly' | 'biweekly' | 'monthly'
    nextDueDate?: string
}

export default function ChatPage() {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()
    const [showChat, setShowChat] = useState(false)
    const [initialInputValue, setInitialInputValue] = useState<string>()
    const [selectedConversationId, setSelectedConversationId] = useState<string>()
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)
    const [manualEntryType, setManualEntryType] = useState<ManualEntryType>()
    const [initialFormData, setInitialFormData] = useState<InitialFormData>()
    const chatHistoryRef = useRef<ChatHistoryRef>(null)
    const chatRef = useRef<ChatRef>(null)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [loading, isAuthenticated, router])

    const handlePromptSelect = (prompt: string) => {
        if (showChat && chatRef.current) {
            // If already in chat mode, send message directly
            chatRef.current.sendMessage(prompt)
        } else {
            // If not in chat mode, start new chat
            setInitialInputValue(prompt)
            setSelectedConversationId(undefined)
            setShowChat(true)
        }
    }

    const handleConversationSelect = (conversationId: string) => {
        setSelectedConversationId(conversationId)
        setInitialInputValue(undefined)
        setShowChat(true)
    }

    const handleBackToIntro = () => {
        setShowChat(false)
        setInitialInputValue(undefined)
        setSelectedConversationId(undefined)
    }

    const handleConversationSaved = () => {
        chatHistoryRef.current?.refreshConversations()
    }

    const handleConversationDeleted = (deletedConversationId: string) => {
        if (selectedConversationId === deletedConversationId) {
            handleBackToIntro()
        }
    }

    // Enhanced function to extract form data from conversation context
    const extractFormDataFromContext = (action: string, conversationContext?: string): InitialFormData => {
        const data: InitialFormData = {}

        if (!conversationContext) return data

        const context = conversationContext.toLowerCase()

        // Extract transaction data
        if (action.includes('transaction') || action.includes('income') || action.includes('expense')) {
            // Extract amount
            const amountMatch = context.match(/(\$?[\d,]+\.?\d*)/g)
            if (amountMatch) {
                const amount = amountMatch[0].replace(/[$,]/g, '')
                if (!isNaN(parseFloat(amount))) {
                    data.amount = amount
                }
            }

            // Extract type from context
            if (context.includes('income') || context.includes('salary') || context.includes('earn')) {
                data.transactionType = 'income'
            } else if (context.includes('expense') || context.includes('spend') || context.includes('buy')) {
                data.transactionType = 'expense'
            } else if (context.includes('transfer') || context.includes('send')) {
                data.transactionType = 'transfer'
            }

            // Extract description
            const nameMatch = context.match(/(["']([^"']+)["'])|((for|to|from)\s+([^,.\n]+))/i)
            if (nameMatch) {
                data.description = nameMatch[2] || nameMatch[5] || nameMatch[0].replace(/["']/g, '')
            }

            // Extract date
            const dateMatch = context.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g)
            if (dateMatch) {
                try {
                    const date = new Date(dateMatch[0])
                    if (!isNaN(date.getTime())) {
                        data.date = date.toISOString().split('T')[0]
                    }
                } catch {
                    // Invalid date, ignore
                }
            }

            // Extract category
            if (context.includes('food') || context.includes('restaurant') || context.includes('grocery')) {
                data.category = 'food'
            } else if (context.includes('transport') || context.includes('gas') || context.includes('uber')) {
                data.category = 'transport'
            } else if (context.includes('rent') || context.includes('mortgage')) {
                data.category = 'housing'
            } else if (context.includes('utilities') || context.includes('electricity') || context.includes('water')) {
                data.category = 'utilities'
            }
        }

        // Extract budget data
        if (action.includes('budget')) {
            const amountMatch = context.match(/(\$?[\d,]+\.?\d*)/g)
            if (amountMatch) {
                const amount = amountMatch[0].replace(/[$,]/g, '')
                if (!isNaN(parseFloat(amount))) {
                    data.budgetAmount = amount
                }
            }

            const nameMatch = context.match(/(budget\s+for\s+([^,.\n]+))|((monthly|weekly|yearly)\s+([^,.\n]+))/i)
            if (nameMatch) {
                data.budgetName = nameMatch[2] || nameMatch[5] || 'Monthly Budget'
            }
        }

        // Extract bill data
        if (action.includes('bill')) {
            const amountMatch = context.match(/(\$?[\d,]+\.?\d*)/g)
            if (amountMatch) {
                const amount = amountMatch[0].replace(/[$,]/g, '')
                if (!isNaN(parseFloat(amount))) {
                    data.billAmount = amount
                }
            }

            const nameMatch = context.match(/(bill\s+for\s+([^,.\n]+))|((rent|mortgage|insurance|utilities)\s*([^,.\n]*))/i)
            if (nameMatch) {
                data.billName = nameMatch[2] || nameMatch[3] || 'Monthly Bill'
            }

            const dateMatch = context.match(/(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g)
            if (dateMatch) {
                try {
                    const date = new Date(dateMatch[0])
                    if (!isNaN(date.getTime())) {
                        data.dueDate = date.toISOString().split('T')[0]
                    }
                } catch {
                    // Invalid date, ignore
                }
            }
        }

        // Extract recurring item data
        if (action.includes('recurring')) {
            const amountMatch = context.match(/(\$?[\d,]+\.?\d*)/g)
            if (amountMatch) {
                const amount = amountMatch[0].replace(/[$,]/g, '')
                if (!isNaN(parseFloat(amount))) {
                    data.recurringAmount = amount
                }
            }

            if (context.includes('salary') || context.includes('income') || context.includes('paycheck')) {
                data.recurringType = 'income'
            } else if (context.includes('bill') || context.includes('payment')) {
                data.recurringType = 'bill'
            }

            if (context.includes('weekly')) {
                data.frequency = 'weekly'
            } else if (context.includes('biweekly') || context.includes('bi-weekly')) {
                data.frequency = 'biweekly'
            } else if (context.includes('monthly')) {
                data.frequency = 'monthly'
            }

            const nameMatch = context.match(/(recurring\s+([^,.\n]+))|((salary|paycheck|rent)\s*([^,.\n]*))/i)
            if (nameMatch) {
                data.recurringName = nameMatch[2] || nameMatch[3] || 'Recurring Item'
            }
        }

        return data
    }

    const handleActionClick = (action: string, conversationContext?: string) => {
        // Extract form data from conversation context
        const extractedData = extractFormDataFromContext(action, conversationContext)
        setInitialFormData(extractedData)

        // Handle actions that open manual entry modals
        const actionTypeMap: Record<string, ManualEntryType> = {
            'add-transaction': 'transaction',
            'add-income': 'transaction',
            'add-expense': 'transaction',
            'add-budget': 'budget',
            'add-bill': 'bill-reminder',
            'add-goal': 'bank-account',
            'add-account': 'bank-account',
            'add-recurring': 'recurring-item',
            'add-debt': 'transaction', // Can use transaction type for debt tracking
        }

        // Handle actions that require manual entry
        if (actionTypeMap[action]) {
            const entryType = actionTypeMap[action]
            setManualEntryType(entryType)
            setIsManualEntryOpen(true)
            return
        }

        // Handle other actions with specific behaviors
        switch (action) {
            case 'generate-report':
                // Trigger a new message directly
                handlePromptSelect('Generate a comprehensive financial report for this month')
                break

            case 'view-insights':
                // Trigger a new message directly
                handlePromptSelect('Show me insights about my spending patterns and financial health')
                break

            case 'crypto-tools':
                // Trigger a new message directly
                handlePromptSelect('Show me available cryptocurrency tools and SUI transfer options. I want to see what crypto features are available.')
                break

            case 'review-transfer':
                // Trigger a review message
                handlePromptSelect('Please review the transfer details and help me confirm everything is correct')
                break

            case 'cancel-transfer':
                // Trigger a cancellation message
                handlePromptSelect('I want to cancel the current SUI transfer')
                break

            case 'crypto-transfer':
                // This is handled within the chat for SUI transfers
                // No additional action needed as it's handled by the TransferUI component
                break

            default:
                // Fallback to transaction entry for unknown actions
                setManualEntryType('transaction')
                setIsManualEntryOpen(true)
                break
        }
    }

    const handleManualEntryComplete = () => {
        setIsManualEntryOpen(false)
        setManualEntryType(undefined)
        setInitialFormData(undefined)
    }

    if (!user) {
        return null
    }

    return (
        <>
            <main className="flex-1 h-full flex flex-col">
                {!showChat ? (
                    <div className="flex-1 flex gap-12 overflow-y-auto ">
                        <ChatIntro user={user} onPromptSelect={handlePromptSelect} />
                        <ChatHistory
                            ref={chatHistoryRef}
                            onConversationSelect={handleConversationSelect}
                            onConversationDelete={handleConversationDeleted}
                        />
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col">


                        {/* Chat Component */}
                        <Chat
                            user={user}
                            initialInputValue={initialInputValue}
                            conversationId={selectedConversationId}
                            onConversationSaved={handleConversationSaved}
                            onActionClick={handleActionClick}
                            className="flex-1"
                            onBackToIntro={handleBackToIntro}
                            ref={chatRef}
                        />
                    </div>
                )}
            </main>

            {/* Manual Entry Modal - Outside main layout to prevent stretching */}
            <ManualEntry
                user={user}
                isOpen={isManualEntryOpen}
                onClose={() => {
                    setIsManualEntryOpen(false)
                    setManualEntryType(undefined)
                    setInitialFormData(undefined)
                }}
                onComplete={handleManualEntryComplete}
                initialType={manualEntryType}
                initialFormData={initialFormData}
            />
        </>
    )
}