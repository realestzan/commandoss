'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { User } from '@/lib/types'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Bot, CheckCircle2, Copy, ThumbsDown, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

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

    if (role === 'user') {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-end mb-4"
            >
                <div className="flex items-start gap-3 max-w-[80%]">
                    <div className="flex flex-col items-end">
                        <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-3xl rounded-tr-sm mt-8">
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
                    <Card className="bg-card border border-emerald-100 p-4 rounded-3xl rounded-tl-sm mt-8">
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
                                    <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                                        {content}
                                    </p>
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
                                        onClick={() => handleFeedback('up')}
                                        className={cn(
                                            "h-6 px-2 text-xs hover:text-emerald-600",
                                            feedback === 'up' ? 'text-emerald-600' : 'text-muted-foreground'
                                        )}
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