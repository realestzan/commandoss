'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Bold, Italic, List, ListOrdered, Palette, Type, Underline } from 'lucide-react'
import { useRef, useState } from 'react'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    className?: string
    onKeyDown?: (e: React.KeyboardEvent) => void
}

export default function RichTextEditor({
    value,
    onChange,
    placeholder = 'Start writing...',
    className = '',
    onKeyDown
}: RichTextEditorProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const [isHTML, setIsHTML] = useState(false)

    const insertText = (beforeText: string, afterText: string = '', placeholder: string = 'text') => {
        const textarea = textareaRef.current
        if (!textarea) return

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const selectedText = value.substring(start, end)
        const textToInsert = selectedText || placeholder

        const newText = value.substring(0, start) + beforeText + textToInsert + afterText + value.substring(end)
        onChange(newText)

        // Set cursor position after insertion
        setTimeout(() => {
            const newCursorPos = start + beforeText.length + textToInsert.length + afterText.length
            textarea.setSelectionRange(newCursorPos, newCursorPos)
            textarea.focus()
        }, 0)
    }

    const formatText = (format: string) => {
        switch (format) {
            case 'bold':
                if (isHTML) {
                    insertText('<strong>', '</strong>', 'bold text')
                } else {
                    insertText('**', '**', 'bold text')
                }
                break
            case 'italic':
                if (isHTML) {
                    insertText('<em>', '</em>', 'italic text')
                } else {
                    insertText('*', '*', 'italic text')
                }
                break
            case 'underline':
                if (isHTML) {
                    insertText('<u>', '</u>', 'underlined text')
                } else {
                    insertText('_', '_', 'underlined text')
                }
                break
            case 'heading':
                if (isHTML) {
                    insertText('<h2>', '</h2>', 'heading')
                } else {
                    insertText('## ', '', 'heading')
                }
                break
            case 'list':
                if (isHTML) {
                    insertText('<ul><li>', '</li></ul>', 'list item')
                } else {
                    insertText('- ', '', 'list item')
                }
                break
            case 'orderedList':
                if (isHTML) {
                    insertText('<ol><li>', '</li></ol>', 'list item')
                } else {
                    insertText('1. ', '', 'list item')
                }
                break
            case 'color':
                if (isHTML) {
                    insertText('<span style="color: #e11d48;">', '</span>', 'colored text')
                } else {
                    insertText('[COLOR]', '[/COLOR]', 'colored text')
                }
                break
        }
    }

    const toggleMode = () => {
        setIsHTML(!isHTML)
    }

    const renderPreview = () => {
        if (!isHTML) return null

        return (
            <div className='border rounded-lg p-4 bg-gray-50 min-h-[200px]'>
                <div className='text-sm text-gray-600 mb-2'>HTML Preview:</div>
                <div dangerouslySetInnerHTML={{ __html: value }} />
            </div>
        )
    }

    return (
        <div className='space-y-3'>
            {/* Toolbar */}
            <div className='flex flex-wrap items-center gap-1 p-2 border border-gray-200 rounded-lg bg-gray-50'>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => formatText('bold')}
                    className='h-8 w-8 p-0'
                >
                    <Bold className='w-4 h-4' />
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => formatText('italic')}
                    className='h-8 w-8 p-0'
                >
                    <Italic className='w-4 h-4' />
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => formatText('underline')}
                    className='h-8 w-8 p-0'
                >
                    <Underline className='w-4 h-4' />
                </Button>
                <div className='w-px h-6 bg-gray-300 mx-1' />
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => formatText('heading')}
                    className='h-8 px-2'
                >
                    <Type className='w-4 h-4 mr-1' />
                    H2
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => formatText('list')}
                    className='h-8 w-8 p-0'
                >
                    <List className='w-4 h-4' />
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => formatText('orderedList')}
                    className='h-8 w-8 p-0'
                >
                    <ListOrdered className='w-4 h-4' />
                </Button>
                <Button
                    type='button'
                    variant='ghost'
                    size='sm'
                    onClick={() => formatText('color')}
                    className='h-8 w-8 p-0'
                >
                    <Palette className='w-4 h-4' />
                </Button>
                <div className='w-px h-6 bg-gray-300 mx-1' />
                <Button
                    type='button'
                    variant={isHTML ? 'default' : 'ghost'}
                    size='sm'
                    onClick={toggleMode}
                    className='h-8 px-2 text-xs'
                >
                    {isHTML ? 'HTML' : 'MD'}
                </Button>
            </div>

            {/* Editor */}
            <Textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={`min-h-[400px] text-base leading-relaxed font-mono resize-none ${className}`}
                onKeyDown={onKeyDown}
            />

            {/* HTML Preview */}
            {isHTML && renderPreview()}

            {/* Help Text */}
            <div className='text-xs text-gray-500'>
                {isHTML ? (
                    <span>HTML mode: Use HTML tags for formatting. Preview shown above.</span>
                ) : (
                    <span>Markdown mode: Use **bold**, *italic*, ## headings, - lists</span>
                )}
            </div>
        </div>
    )
} 