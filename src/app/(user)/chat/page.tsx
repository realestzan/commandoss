'use client'

import ChatHistory, { ChatHistoryRef } from '@/app/(user)/chat/history'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import ManualEntry from '../tracker/manual'
import { Chat } from './chat'
import ChatIntro from './intro'

type ManualEntryType = 'transaction' | 'budget' | 'bill-reminder' | 'bank-account' | 'recurring-item'

export default function ChatPage() {
    const { user, loading, isAuthenticated } = useAuth()
    const router = useRouter()
    const [showChat, setShowChat] = useState(false)
    const [initialInputValue, setInitialInputValue] = useState<string>()
    const [selectedConversationId, setSelectedConversationId] = useState<string>()
    const [isManualEntryOpen, setIsManualEntryOpen] = useState(false)
    const [manualEntryType, setManualEntryType] = useState<ManualEntryType>()
    const chatHistoryRef = useRef<ChatHistoryRef>(null)

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth')
        }
    }, [loading, isAuthenticated, router])

    const handlePromptSelect = (prompt: string) => {
        setInitialInputValue(prompt)
        setSelectedConversationId(undefined)
        setShowChat(true)
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

    const handleActionClick = (action: string) => {
        const actionTypeMap: Record<string, ManualEntryType> = {
            'add-transaction': 'transaction',
            'add-budget': 'budget',
            'add-bill': 'bill-reminder',
            'add-goal': 'bank-account'
        }

        const entryType = actionTypeMap[action] || 'transaction'
        setManualEntryType(entryType)
        setIsManualEntryOpen(true)
    }

    const handleManualEntryComplete = () => {
        setIsManualEntryOpen(false)
        setManualEntryType(undefined)
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
                        {/* Chat Header */}
                        <div className="rounded-3xl bg-background p-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleBackToIntro}
                                    className="p-2 hover:bg-emerald-50 rounded-full transition-colors"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <div>
                                    <h1 className="text-lg font-semibold">Financial Assistant</h1>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedConversationId ? 'Continue conversation' : 'AI-powered finance help'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Component */}
                        <Chat
                            user={user}
                            initialInputValue={initialInputValue}
                            conversationId={selectedConversationId}
                            onConversationSaved={handleConversationSaved}
                            onActionClick={handleActionClick}
                            className="flex-1"
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
                }}
                onComplete={handleManualEntryComplete}
                initialType={manualEntryType}
            />
        </>
    )
}