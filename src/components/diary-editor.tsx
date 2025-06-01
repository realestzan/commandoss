'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { BookOpen, Loader2, Sparkles, Users } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

interface DiaryEditorProps {
    content?: string
    onChange?: (content: string) => void
    className?: string
}

interface Suggestion {
    text: string
    id: string
}

export function DiaryEditor({ content = '', onChange, className }: DiaryEditorProps) {
    const [suggestions, setSuggestions] = useState<Suggestion[]>([])
    const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false)
    const [showSuggestions, setShowSuggestions] = useState(false)

    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: 'What\'s on your mind today? Start writing your thoughts...',
            }),
            CharacterCount.configure({
                limit: 10000,
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            const newContent = editor.getHTML()
            onChange?.(newContent)
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
            },
        },
    })

    const getSuggestions = useCallback(async () => {
        if (!editor) return

        const content = editor.getText()
        const cursorPosition = editor.state.selection.anchor

        if (content.length < 10) {
            setSuggestions([])
            return
        }

        setIsLoadingSuggestions(true)

        try {
            const response = await fetch('/api/diary/suggest', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    content,
                    cursorPosition,
                }),
            })

            if (response.ok) {
                const data = await response.json()
                const suggestionsWithIds = data.suggestions.map((text: string, index: number) => ({
                    text,
                    id: `suggestion-${Date.now()}-${index}`,
                }))
                setSuggestions(suggestionsWithIds)
            }
        } catch (error) {
            console.error('Failed to get suggestions:', error)
        } finally {
            setIsLoadingSuggestions(false)
        }
    }, [editor])

    const applySuggestion = (suggestion: Suggestion) => {
        if (!editor) return

        const { from } = editor.state.selection
        editor.chain().focus().insertContentAt(from, suggestion.text + ' ').run()
        setSuggestions([])
        setShowSuggestions(false)
    }

    // Auto-suggest on typing
    useEffect(() => {
        if (!editor) return

        const handleKeyUp = () => {
            const content = editor.getText()
            if (content.length > 10 && content.endsWith(' ')) {
                getSuggestions()
            }
        }

        const handleSelectionUpdate = () => {
            if (suggestions.length > 0) {
                setShowSuggestions(true)
            }
        }

        editor.on('update', handleKeyUp)
        editor.on('selectionUpdate', handleSelectionUpdate)

        return () => {
            editor.off('update', handleKeyUp)
            editor.off('selectionUpdate', handleSelectionUpdate)
        }
    }, [editor, getSuggestions, suggestions.length])

    const characterCount = editor?.storage.characterCount.characters() || 0
    const wordCount = editor?.storage.characterCount.words() || 0

    if (!editor) {
        return (
            <div className='flex items-center justify-center h-96'>
                <Loader2 className='h-8 w-8 animate-spin' />
            </div>
        )
    }

    return (
        <div className={cn('w-full max-w-4xl mx-auto', className)}>
            {/* Editor Toolbar */}
            <div className='flex items-center justify-between mb-4 p-4 bg-gray-50 rounded-lg border'>
                <div className='flex items-center gap-4'>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        className={editor.isActive('bold') ? 'bg-gray-200' : ''}
                    >
                        Bold
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        className={editor.isActive('italic') ? 'bg-gray-200' : ''}
                    >
                        Italic
                    </Button>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={editor.isActive('heading', { level: 2 }) ? 'bg-gray-200' : ''}
                    >
                        Heading
                    </Button>
                </div>

                <div className='flex items-center gap-4'>
                    <Button
                        size='sm'
                        variant='outline'
                        onClick={getSuggestions}
                        disabled={isLoadingSuggestions || characterCount < 10}
                    >
                        {isLoadingSuggestions ? (
                            <Loader2 className='h-4 w-4 animate-spin mr-2' />
                        ) : (
                            <Sparkles className='h-4 w-4 mr-2' />
                        )}
                        Get AI Suggestions
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <Card className='relative'>
                <CardContent className='p-0'>
                    <EditorContent editor={editor} />

                    {/* AI Suggestions Overlay */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className='absolute top-4 right-4 w-72 z-10'>
                            <Card className='shadow-lg border-2 border-blue-200 bg-blue-50/90 backdrop-blur-sm'>
                                <CardContent className='p-4'>
                                    <div className='flex items-center gap-2 mb-3'>
                                        <Sparkles className='h-4 w-4 text-blue-600' />
                                        <span className='text-sm font-medium text-blue-800'>AI Suggestions</span>
                                        <Button
                                            size='sm'
                                            variant='ghost'
                                            onClick={() => setShowSuggestions(false)}
                                            className='ml-auto h-6 w-6 p-0 text-blue-600 hover:text-blue-800'
                                        >
                                            ×
                                        </Button>
                                    </div>
                                    <div className='space-y-2'>
                                        {suggestions.map((suggestion) => (
                                            <Button
                                                key={suggestion.id}
                                                variant='ghost'
                                                size='sm'
                                                className='w-full justify-start text-left p-2 h-auto text-blue-700 hover:bg-blue-100 hover:text-blue-900'
                                                onClick={() => applySuggestion(suggestion)}
                                            >
                                                <span className='text-xs leading-relaxed'>{suggestion.text}</span>
                                            </Button>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats */}
            <div className='flex items-center justify-between mt-4 p-4 bg-gray-50 rounded-lg border'>
                <div className='flex items-center gap-4 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                        <Users className='h-4 w-4' />
                        <span>{characterCount} characters</span>
                    </div>
                    <div className='flex items-center gap-1'>
                        <BookOpen className='h-4 w-4' />
                        <span>{wordCount} words</span>
                    </div>
                </div>

                <div className='flex items-center gap-2'>
                    {isLoadingSuggestions && (
                        <Badge variant='secondary' className='text-xs'>
                            <Loader2 className='h-3 w-3 animate-spin mr-1' />
                            Getting suggestions...
                        </Badge>
                    )}
                    {suggestions.length > 0 && !showSuggestions && (
                        <Button
                            size='sm'
                            variant='outline'
                            onClick={() => setShowSuggestions(true)}
                        >
                            <Sparkles className='h-4 w-4 mr-1' />
                            Show {suggestions.length} suggestions
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
} 