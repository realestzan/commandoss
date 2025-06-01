'use client'

import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ChatService } from '@/lib/chat-service'
import { ChatConversation } from '@/lib/types'
import { Edit, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

interface EditConversationDialogProps {
    conversation: ChatConversation | null
    isOpen: boolean
    onClose: () => void
    onUpdate: () => void
    onDelete: (conversationId: string) => void
}

export default function EditConversationDialog({
    conversation,
    isOpen,
    onClose,
    onUpdate,
    onDelete
}: EditConversationDialogProps) {
    const [newTitle, setNewTitle] = useState('')
    const [isRenaming, setIsRenaming] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    // Reset form when dialog opens/closes or conversation changes
    useEffect(() => {
        if (conversation && isOpen) {
            setNewTitle(conversation.title)
            setShowDeleteConfirm(false)
        }
    }, [conversation, isOpen])

    const handleRename = async () => {
        if (!conversation || !newTitle.trim()) return

        try {
            setIsRenaming(true)
            await ChatService.renameConversation(conversation.id, newTitle.trim())
            onUpdate()
            onClose()
        } catch (error) {
            console.error('Failed to rename conversation:', error)
        } finally {
            setIsRenaming(false)
        }
    }

    const handleDelete = async () => {
        if (!conversation) return

        try {
            setIsDeleting(true)
            await ChatService.deleteConversation(conversation.id)
            onDelete(conversation.id)
            onClose()
        } catch (error) {
            console.error('Failed to delete conversation:', error)
        } finally {
            setIsDeleting(false)
        }
    }

    const handleClose = () => {
        setShowDeleteConfirm(false)
        setNewTitle('')
        onClose()
    }

    if (!conversation) return null

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Edit className="w-5 h-5" />
                        Edit Conversation
                    </DialogTitle>
                    <DialogDescription>
                        {showDeleteConfirm
                            ? 'Are you sure you want to delete this conversation? This action cannot be undone.'
                            : 'Rename or delete this conversation.'
                        }
                    </DialogDescription>
                </DialogHeader>

                {!showDeleteConfirm ? (
                    <>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title">Conversation Title</Label>
                                <Input
                                    id="title"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Enter new title..."
                                    maxLength={100}
                                />
                                <p className="text-xs text-muted-foreground">
                                    {newTitle.length}/100 characters
                                </p>
                            </div>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                            </Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handleClose}>
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRename}
                                    disabled={isRenaming || !newTitle.trim() || newTitle.trim() === conversation.title}
                                >
                                    {isRenaming ? 'Renaming...' : 'Rename'}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                ) : (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Conversation'}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    )
} 