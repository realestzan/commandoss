'use client'
import { itemVariants } from '@/app/(user)/chat/intro'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/hooks/use-auth'
import { ChatService } from '@/lib/chat-service'
import { ChatConversation } from '@/lib/types'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { motion } from 'framer-motion'
import { MessageCircle, MoreHorizontal, RefreshCw, Search } from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import EditConversationDialog from './edit-conversation-dialog'

interface ChatHistoryProps {
    onConversationSelect?: (conversationId: string) => void
    onConversationDelete?: (conversationId: string) => void
}

export interface ChatHistoryRef {
    refreshConversations: () => Promise<void>
}

const ChatHistory = forwardRef<ChatHistoryRef, ChatHistoryProps>(({ onConversationSelect, onConversationDelete }, ref) => {
    const { user } = useAuth()
    const [searchQuery, setSearchQuery] = useState('')
    const [conversations, setConversations] = useState<ChatConversation[]>([])
    const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [editDialogOpen, setEditDialogOpen] = useState(false)
    const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null)

    // Load conversations from Firebase
    const loadConversations = async () => {
        if (!user?.id) return

        try {
            setError(null)
            const userConversations = await ChatService.getUserConversations(user.id)
            setConversations(userConversations)
            setFilteredConversations(userConversations)
        } catch (err) {
            console.error('Failed to load conversations:', err)
            setError('Failed to load chat history')
        }
    }

    // Refresh conversations function
    const refreshConversations = async () => {
        setIsRefreshing(true)
        await loadConversations()
        setIsRefreshing(false)
    }

    // Expose refresh function to parent
    useImperativeHandle(ref, () => ({
        refreshConversations
    }))

    useEffect(() => {
        const initialLoad = async () => {
            setIsLoading(true)
            await loadConversations()
            setIsLoading(false)
        }
        initialLoad()
    }, [user?.id])

    // Handle search
    useEffect(() => {
        if (!searchQuery.trim()) {
            setFilteredConversations(conversations)
        } else {
            const searchLower = searchQuery.toLowerCase()
            const filtered = conversations.filter(conversation =>
                conversation.title.toLowerCase().includes(searchLower) ||
                conversation.messages.some(msg =>
                    msg.content.toLowerCase().includes(searchLower)
                )
            )
            setFilteredConversations(filtered)
        }
    }, [searchQuery, conversations])

    const handleConversationClick = (conversationId: string) => {
        onConversationSelect?.(conversationId)
    }

    const handleEditClick = (conversation: ChatConversation, e: React.MouseEvent) => {
        e.stopPropagation() // Prevent conversation selection
        setSelectedConversation(conversation)
        setEditDialogOpen(true)
    }

    const handleConversationUpdate = () => {
        refreshConversations()
    }

    const handleConversationDelete = (deletedId: string) => {
        // Remove the deleted conversation from the list immediately
        setConversations(prev => prev.filter(conv => conv.id !== deletedId))
        setFilteredConversations(prev => prev.filter(conv => conv.id !== deletedId))

        // Notify parent component about the deletion
        onConversationDelete?.(deletedId)
    }

    const formatDate = (dateString: string) => {
        try {
            return formatDistanceToNow(new Date(dateString), { addSuffix: true })
        } catch {
            return 'Unknown time'
        }
    }

    const getPreviewText = (conversation: ChatConversation) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1]
        if (!lastMessage) return 'No messages'

        const content = lastMessage.content
        return content.length > 100 ? content.substring(0, 97) + '...' : content
    }

    if (isLoading) {
        return (
            <div className='bg-background rounded-3xl p-4 opacity-50 w-1/3'>
                <motion.h3 variants={itemVariants} className='text-xl font-semibold mb-4'>
                    Recent Chats
                </motion.h3>
                <Skeleton className='w-full h-12 rounded-full mb-4' />
                <div className='space-y-3'>
                    {[...Array(3)].map((_, index) => (
                        <div key={index} className='space-y-2'>
                            <Skeleton className='h-4 w-3/4' />
                            <Skeleton className='h-3 w-full' />
                            <Skeleton className='h-3 w-1/2' />
                        </div>
                    ))}
                </div>
            </div>
        )
    }

    return (
        <>
            <div className='bg-background rounded-3xl p-4 opacity-50 hover:opacity-100 transition-opacity duration-300 w-1/3'>
                {/* Recent Chats */}
                <div>
                    <div className='flex items-center justify-between'>
                        <motion.h3 variants={itemVariants} className='text-xl font-semibold'>
                            Recent Chats
                        </motion.h3>
                        <button
                            onClick={refreshConversations}
                            disabled={isRefreshing}
                            className='p-2 hover:bg-emerald-50 rounded-full transition-colors'
                            title='Refresh conversations'
                        >
                            <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
                        </button>
                    </div>

                    {/* Search Input */}
                    <div className='relative mt-4'>
                        <Search className='absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground' />
                        <Input
                            placeholder='Search conversations'
                            className='w-full p-6 pl-10 bg-primary/5 rounded-full'
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Error State */}
                    {error && (
                        <div className='mt-4 p-4 bg-red-50 rounded-2xl text-red-600 text-sm'>
                            {error}
                        </div>
                    )}

                    {/* Conversations List */}
                    <div className='mt-4 space-y-2 max-h-96 overflow-y-auto'>
                        {filteredConversations.length === 0 ? (
                            <motion.div
                                variants={itemVariants}
                                className='flex flex-col items-center justify-center py-8 text-center'
                            >
                                <MessageCircle className='w-12 h-12 text-muted-foreground/50 mb-3' />
                                <p className='text-muted-foreground'>
                                    {searchQuery ? 'No conversations found' : 'No chat history yet'}
                                </p>
                                <p className='text-sm text-muted-foreground/70 mt-1'>
                                    {searchQuery ? 'Try a different search term' : 'Start a conversation to see it here'}
                                </p>
                            </motion.div>
                        ) : (
                            filteredConversations.map((conversation) => (
                                <motion.div
                                    key={conversation.id}
                                    variants={itemVariants}
                                    className='bg-primary/5 p-4 rounded-3xl text-sm cursor-pointer hover:bg-primary/10 transition-colors group relative'
                                    onClick={() => handleConversationClick(conversation.id)}
                                >
                                    <div className='flex justify-between items-start mb-2'>
                                        <h4 className='font-medium text-sm line-clamp-1 pr-8'>
                                            {conversation.title}
                                        </h4>
                                        <div className='flex items-center gap-2'>
                                            <span className='text-xs text-muted-foreground whitespace-nowrap'>
                                                {formatDate(conversation.updatedAt)}
                                            </span>
                                            <button
                                                onClick={(e) => handleEditClick(conversation, e)}
                                                className='opacity-0 group-hover:opacity-100 p-1 hover:bg-emerald-100 rounded-full transition-all'
                                                title='Edit conversation'
                                            >
                                                <MoreHorizontal className='w-4 h-4' />
                                            </button>
                                        </div>
                                    </div>
                                    <p className='text-muted-foreground text-xs line-clamp-2'>
                                        {getPreviewText(conversation)}
                                    </p>
                                    <div className='flex justify-between items-center mt-2'>
                                        <span className='text-xs text-muted-foreground'>
                                            {conversation.messages.length} messages
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Edit Dialog */}
            <EditConversationDialog
                conversation={selectedConversation}
                isOpen={editDialogOpen}
                onClose={() => {
                    setEditDialogOpen(false)
                    setSelectedConversation(null)
                }}
                onUpdate={handleConversationUpdate}
                onDelete={handleConversationDelete}
            />
        </>
    )
})

ChatHistory.displayName = 'ChatHistory'

export default ChatHistory