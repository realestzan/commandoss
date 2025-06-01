import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    orderBy,
    query,
    updateDoc,
    where
} from 'firebase/firestore'
import { db } from './firebase'
import { ChatConversation, ChatMessage } from './types'

export class ChatService {
    private static COLLECTION_NAME = 'chat_conversations'

    // Clean message data by removing undefined values
    private static cleanMessage(message: ChatMessage): ChatMessage {
        const cleanedMessage: Partial<ChatMessage> = {
            id: message.id,
            content: message.content,
            role: message.role,
            timestamp: message.timestamp
        }

        // Only add optional fields if they have values
        if (message.suggestions && message.suggestions.length > 0) {
            cleanedMessage.suggestions = message.suggestions
        }

        if (message.actionButtons && message.actionButtons.length > 0) {
            cleanedMessage.actionButtons = message.actionButtons
        }

        return cleanedMessage as ChatMessage
    }

    // Generate a title from the first user message
    private static generateTitle(messages: ChatMessage[]): string {
        const firstUserMessage = messages.find(msg => msg.role === 'user')
        if (!firstUserMessage) return 'New Conversation'

        const content = firstUserMessage.content
        if (content.length <= 50) return content
        return content.substring(0, 47) + '...'
    }

    // Save a new conversation
    static async saveConversation(userId: string, messages: ChatMessage[]): Promise<string> {
        try {
            const now = new Date().toISOString()
            const title = this.generateTitle(messages)

            // Clean all messages to remove undefined values
            const cleanedMessages = messages.map(msg => this.cleanMessage(msg))

            const conversationData: Omit<ChatConversation, 'id'> = {
                userId,
                title,
                messages: cleanedMessages,
                createdAt: now,
                updatedAt: now
            }

            const docRef = await addDoc(collection(db, this.COLLECTION_NAME), conversationData)
            return docRef.id
        } catch (error) {
            console.error('Error saving conversation:', error)
            throw new Error('Failed to save conversation')
        }
    }

    // Update an existing conversation
    static async updateConversation(conversationId: string, messages: ChatMessage[]): Promise<void> {
        try {
            const conversationRef = doc(db, this.COLLECTION_NAME, conversationId)
            const title = this.generateTitle(messages)

            // Clean all messages to remove undefined values
            const cleanedMessages = messages.map(msg => this.cleanMessage(msg))

            await updateDoc(conversationRef, {
                messages: cleanedMessages,
                title,
                updatedAt: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error updating conversation:', error)
            throw new Error('Failed to update conversation')
        }
    }

    // Get all conversations for a user
    static async getUserConversations(userId: string, limitCount: number = 20): Promise<ChatConversation[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('userId', '==', userId),
                orderBy('updatedAt', 'desc'),
                limit(limitCount)
            )

            const querySnapshot = await getDocs(q)
            const conversations: ChatConversation[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                conversations.push({
                    id: doc.id,
                    ...data
                } as ChatConversation)
            })

            return conversations
        } catch (error) {
            console.error('Error getting conversations:', error)
            throw new Error('Failed to load conversations')
        }
    }

    // Get a specific conversation
    static async getConversation(conversationId: string): Promise<ChatConversation | null> {
        try {
            const docRef = doc(db, this.COLLECTION_NAME, conversationId)
            const docSnap = await getDoc(docRef)

            if (docSnap.exists()) {
                return {
                    id: docSnap.id,
                    ...docSnap.data()
                } as ChatConversation
            }

            return null
        } catch (error) {
            console.error('Error getting conversation:', error)
            throw new Error('Failed to load conversation')
        }
    }

    // Search conversations by content
    static async searchConversations(userId: string, searchQuery: string): Promise<ChatConversation[]> {
        try {
            const q = query(
                collection(db, this.COLLECTION_NAME),
                where('userId', '==', userId),
                orderBy('updatedAt', 'desc')
            )

            const querySnapshot = await getDocs(q)
            const conversations: ChatConversation[] = []

            querySnapshot.forEach((doc) => {
                const data = doc.data()
                const conversation = {
                    id: doc.id,
                    ...data
                } as ChatConversation

                // Search in title and message content
                const searchLower = searchQuery.toLowerCase()
                const titleMatch = conversation.title.toLowerCase().includes(searchLower)
                const messageMatch = conversation.messages.some(msg =>
                    msg.content.toLowerCase().includes(searchLower)
                )

                if (titleMatch || messageMatch) {
                    conversations.push(conversation)
                }
            })

            return conversations
        } catch (error) {
            console.error('Error searching conversations:', error)
            throw new Error('Failed to search conversations')
        }
    }

    // Rename a conversation
    static async renameConversation(conversationId: string, newTitle: string): Promise<void> {
        try {
            const conversationRef = doc(db, this.COLLECTION_NAME, conversationId)

            await updateDoc(conversationRef, {
                title: newTitle.trim(),
                updatedAt: new Date().toISOString()
            })
        } catch (error) {
            console.error('Error renaming conversation:', error)
            throw new Error('Failed to rename conversation')
        }
    }

    // Delete a conversation
    static async deleteConversation(conversationId: string): Promise<void> {
        try {
            const conversationRef = doc(db, this.COLLECTION_NAME, conversationId)
            await deleteDoc(conversationRef)
        } catch (error) {
            console.error('Error deleting conversation:', error)
            throw new Error('Failed to delete conversation')
        }
    }
} 