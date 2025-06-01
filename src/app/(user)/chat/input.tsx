'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ArrowRight, FileIcon, ImageIcon, Paperclip, X } from 'lucide-react'
import Image from 'next/image'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

interface Attachment {
    id: string
    file: File
    type: 'image' | 'document'
    previewUrl?: string
}

interface ChatInputProps {
    onSubmit: (content: string, attachments?: Attachment[]) => Promise<void>
    isLoading?: boolean
    initialInputValue?: string
    replyTo?: {
        content: string
        onClear: () => void
    }
}

export function ChatInput({ onSubmit, isLoading, initialInputValue, replyTo }: ChatInputProps) {
    const [isFocused, setIsFocused] = useState(false)
    const [content, setContent] = useState(initialInputValue || '')
    const [attachments, setAttachments] = useState<Attachment[]>([])
    const [key, setKey] = useState(0)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [isDragging, setIsDragging] = useState(false)

    useEffect(() => {
        setContent('')
        setAttachments([])
        setKey(prev => prev + 1)
    }, [replyTo])

    const handleSubmit = useCallback(async () => {
        if ((!content.trim() && attachments.length === 0) || isLoading) return
        await onSubmit(content, attachments)
        setContent('')
        setAttachments([])
    }, [content, attachments, isLoading, onSubmit])

    useEffect(() => {
        if (initialInputValue) {
            setContent(initialInputValue)
            setIsFocused(true)
            // Just pre-fill the input, don't auto-submit
            // Let user manually submit by pressing enter or clicking send
        }
    }, [initialInputValue])

    useHotkeys('meta+enter', () => {
        const textarea = document.querySelector('textarea')
        textarea?.focus()
    }, { preventDefault: true })

    useHotkeys('meta+i', () => {
        fileInputRef.current?.click()
    }, { preventDefault: true })

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSubmit()
        }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        const newAttachments = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            type: file.type.startsWith('image/') ? 'image' : 'document',
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        } as Attachment))
        setAttachments(prev => [...prev, ...newAttachments])
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setIsDragging(false)

        const files = Array.from(e.dataTransfer.files)
        const newAttachments = files.map(file => ({
            id: Math.random().toString(36).substring(7),
            file,
            type: file.type.startsWith('image/') ? 'image' : 'document',
            previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
        } as Attachment))
        setAttachments(prev => [...prev, ...newAttachments])
    }

    const removeAttachment = (id: string) => {
        setAttachments(prev => {
            const attachment = prev.find(a => a.id === id)
            if (attachment?.previewUrl) {
                URL.revokeObjectURL(attachment.previewUrl)
            }
            return prev.filter(a => a.id !== id)
        })
    }

    return (
        <div
            className={cn(
                'relative rounded-3xl border bg-background transition-all duration-300 ease-in-out flex flex-col items-center justify-center',
                isDragging && 'border-emerald-500 bg-card0/5',
                isFocused
                    ? 'p-4 scale-[1.02] border-emerald-500 shadow-[0_45px_150px_0.5px_rgba(0,0,0,0.1)]'
                    : 'p-4 hover:border-emerald-500 border-emerald-500 shadow-[0_45px_100px_0.5px_rgba(0,0,0,0.1)]'
            )}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {replyTo && (
                <div className='flex items-start justify-between gap-2 px-2 py-1 mb-2 rounded text-sm'>
                    <div className='flex-1 line-clamp-2 text-zinc-600 leading-relaxed'>
                        <span className='text-zinc-400'>Replying to: </span>
                        {replyTo.content}
                    </div>
                    <button
                        onClick={replyTo.onClear}
                        className='text-zinc-400 hover:text-zinc-600 mt-1'
                    >
                        <X className='h-4 w-4' />
                    </button>
                </div>
            )}

            {attachments.length > 0 && (
                <div className='flex flex-wrap gap-2 w-full mb-2'>
                    {attachments.map((attachment) => (
                        <div
                            key={attachment.id}
                            className='relative group rounded-lg overflow-hidden bg-card0/10 p-2'
                        >
                            {attachment.type === 'image' ? (
                                <div className='relative w-20 h-20'>
                                    <Image
                                        width={50}
                                        height={50}
                                        src={attachment.previewUrl || ''}
                                        alt='Preview'
                                        className='w-full h-full object-cover rounded'
                                    />
                                </div>
                            ) : (
                                <div className='flex items-center gap-2 text-sm text-primary/70'>
                                    <FileIcon className='h-4 w-4' />
                                    <span className='truncate max-w-[120px]'>
                                        {attachment.file.name}
                                    </span>
                                </div>
                            )}
                            <button
                                onClick={() => removeAttachment(attachment.id)}
                                className='absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity'
                            >
                                <X className='h-3 w-3' />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <textarea
                placeholder={isFocused ? 'Ask whatever you want....' : 'Type a message...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={handleKeyDown}
                className={`w-[97.5%] resize-none border-0 bg-transparent focus:outline-none focus:ring-0 transition-all duration-300 no-input`}
                rows={1}
            />

            <input
                key={key}
                ref={fileInputRef}
                type='file'
                multiple
                onChange={handleFileSelect}
                className='hidden'
                accept='image/*,.pdf,.doc,.docx,.txt'
            />

            <div className={`flex items-center justify-between w-full transition-all duration-300
                ${isFocused ? 'border-t pt-4 mt-2 opacity-100' : 'h-0 opacity-0'}`}
            >
                <div className='flex gap-4'>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='text-zinc-500 hover:text-zinc-700'
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <Paperclip className='h-5 w-5' />
                    </Button>
                    <Button
                        variant='ghost'
                        size='sm'
                        className='text-zinc-500 hover:text-zinc-700'
                        onClick={() => {
                            fileInputRef.current!.accept = 'image/*'
                            fileInputRef.current?.click()
                            fileInputRef.current!.accept = 'image/*,.pdf,.doc,.docx,.txt'
                        }}
                    >
                        <ImageIcon className='h-5 w-5' />
                    </Button>
                </div>
                <div className='flex items-center gap-4'>
                    <span className='text-sm text-zinc-500'>{content.length}/1000</span>
                    <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        className='rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-600 p-3 text-white 
                            hover:opacity-90 transition-opacity disabled:opacity-50'
                    >
                        <ArrowRight className='h-5 w-5' />
                    </Button>
                </div>
            </div>

            {/* Send button for minimal state */}
            {!isFocused && !replyTo && (
                <Button
                    onClick={() => {
                        const textarea = document.querySelector('textarea')
                        textarea?.focus()
                    }}
                    className={`absolute bg-gradient-to-r from-emerald-400 to-emerald-600 right-2 top-2 rounded-lg p-3 text-white 
                        hover:text-zinc-700 transition-colors ${!isFocused ? 'opacity-100' : 'hidden'}`}
                >
                    <ArrowRight className='h-5 w-5' />
                </Button>
            )}
        </div>
    )
}