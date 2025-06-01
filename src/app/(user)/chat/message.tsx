'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Bot, CheckCircle2, Copy, ThumbsDown, ThumbsUp, Volume2, VolumeX } from 'lucide-react'
import { useState } from 'react'
import Markdown from 'react-markdown'
import { toast } from 'sonner'

interface MessageProps {
    id: string
    content: string
    role: 'user' | 'assistant'
    timestamp: Date
    user?: User
    isLoading?: boolean
    suggestions?: string[]
    actionButtons?: {
        label: string
        action: string
        variant?: 'primary' | 'secondary'
    }[]
    onSuggestionClick?: (suggestion: string) => void
    onActionClick?: (action: string) => void
}

export function Message({
    id,
    content,
    role,
    user,
    isLoading,
    suggestions,
    actionButtons,
    onSuggestionClick,
    onActionClick
}: MessageProps) {
    const [copied, setCopied] = useState(false)
    const [feedback, setFeedback] = useState<'up' | 'down' | null>(null)
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isGeneratingAudio, setIsGeneratingAudio] = useState(false)

    const handleCopy = async () => {
        await navigator.clipboard.writeText(content)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleFeedback = (type: 'up' | 'down') => {
        setFeedback(type)
        // Here you could send feedback to your analytics
        console.log(`Feedback for message ${id}: ${type}`)
    }

    const handleSpeak = async () => {
        if (isSpeaking) {
            // Stop current speech
            window.speechSynthesis.cancel()
            setIsSpeaking(false)
            return
        }

        try {
            setIsGeneratingAudio(true)

            // Call ElevenLabs API
            const response = await fetch('/api/tts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ text: content }),
            })

            if (!response.ok) {
                throw new Error('Failed to generate speech')
            }

            const audioBlob = await response.blob()
            const audioUrl = URL.createObjectURL(audioBlob)
            const audio = new Audio(audioUrl)

            setIsSpeaking(true)
            setIsGeneratingAudio(false)

            audio.onended = () => {
                setIsSpeaking(false)
                URL.revokeObjectURL(audioUrl)
            }

            audio.onerror = () => {
                setIsSpeaking(false)
                setIsGeneratingAudio(false)
                URL.revokeObjectURL(audioUrl)
                toast.error('Failed to play audio')
            }

            await audio.play()
        } catch (error) {
            console.error('TTS error:', error)
            setIsGeneratingAudio(false)
            setIsSpeaking(false)

            // Fallback to browser TTS if ElevenLabs fails
            try {
                const utterance = new SpeechSynthesisUtterance(content)
                utterance.rate = 0.9
                utterance.pitch = 1.0
                utterance.volume = 0.8

                utterance.onstart = () => setIsSpeaking(true)
                utterance.onend = () => setIsSpeaking(false)
                utterance.onerror = () => {
                    setIsSpeaking(false)
                    toast.error('Speech synthesis failed')
                }

                window.speechSynthesis.speak(utterance)
                toast.info('Using browser speech synthesis')
            } catch (fallbackError) {
                console.error('Fallback TTS error:', fallbackError)
                toast.error('Text-to-speech not available')
            }
        }
    }

    if (role === 'user') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end mb-4"
            >
                <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="flex flex-col items-end">
                        <Card className="bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-4 rounded-3xl rounded-tr-sm mt-8">
                            <p className="text-sm leading-relaxed">{content}</p>
                        </Card>
                    </div>
                    <Avatar className="w-12 h-12">
                        <AvatarImage src={user?.avatar} />
                        <AvatarFallback className="bg-emerald-500 text-white text-sm">
                            {user?.name.charAt(0) || 'U'}
                        </AvatarFallback>
                    </Avatar>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start mb-6"
        >
            <div className="flex items-start gap-3 max-w-[85%]">
                <Avatar className="w-12 h-12 bg-gradient-to-r from-emerald-300 to-emerald-800">
                    <AvatarFallback className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
                        <Bot className="w-4 h-4" />
                    </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                    <Card className="bg-background border border-emerald-100 p-4 rounded-3xl rounded-tl-sm mt-8">
                        {isLoading ? (
                            <div className="flex items-center gap-2">
                                <div className="flex space-x-1">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></div>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                </div>
                                <span className="text-sm text-muted-foreground">Thinking...</span>
                            </div>
                        ) : (
                            <>
                                <div className="prose prose-sm max-w-none">
                                    <Markdown >{content}</Markdown>
                                </div>

                                {/* Action Buttons */}
                                {actionButtons && actionButtons.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-4">
                                        {actionButtons.map((button, index) => (
                                            <Button
                                                key={index}
                                                variant={button.variant === 'primary' ? 'default' : 'outline'}
                                                size="sm"
                                                onClick={() => onActionClick?.(button.action)}
                                                className={cn(
                                                    "rounded-full",
                                                    button.variant === 'primary' && "bg-emerald-600 hover:bg-emerald-700"
                                                )}
                                            >
                                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                                {button.label}
                                            </Button>
                                        ))}
                                    </div>
                                )}

                                {/* Suggestions */}
                                {suggestions && suggestions.length > 0 && (
                                    <div className="mt-4">
                                        <p className="text-xs text-muted-foreground mb-2">Quick actions:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestions.map((suggestion, index) => (
                                                <Button
                                                    key={index}
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => onSuggestionClick?.(suggestion)}
                                                    className="rounded-full bg-card"
                                                >
                                                    {suggestion}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Message Actions */}
                                <div className="flex items-center gap-2 mt-4">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCopy}
                                        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                                        title="Copy message"
                                    >
                                        {copied ? (
                                            <CheckCircle2 className="w-3 h-3" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleSpeak}
                                        disabled={isGeneratingAudio}
                                        className={cn(
                                            "h-6 px-2 text-xs hover:text-emerald-600",
                                            isSpeaking ? 'text-emerald-600' : 'text-muted-foreground',
                                            isGeneratingAudio && 'opacity-50 cursor-not-allowed'
                                        )}
                                        title={isSpeaking ? "Stop speaking" : "Read aloud"}
                                    >
                                        {isGeneratingAudio ? (
                                            <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin" />
                                        ) : isSpeaking ? (
                                            <VolumeX className="w-3 h-3" />
                                        ) : (
                                            <Volume2 className="w-3 h-3" />
                                        )}
                                    </Button>

                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFeedback('up')}
                                        className={cn(
                                            "h-6 px-2 text-xs hover:text-emerald-600",
                                            feedback === 'up' ? 'text-emerald-600' : 'text-muted-foreground'
                                        )}
                                        title="Good response"
                                    >
                                        <ThumbsUp className="w-3 h-3" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleFeedback('down')}
                                        className={cn(
                                            "h-6 px-2 text-xs hover:text-red-600",
                                            feedback === 'down' ? 'text-red-600' : 'text-muted-foreground'
                                        )}
                                        title="Poor response"
                                    >
                                        <ThumbsDown className="w-3 h-3" />
                                    </Button>
                                </div>
                            </>
                        )}
                    </Card>
                </div>
            </div>
        </motion.div>
    )
} 