export type AssistantType = 'programmer' | 'writer' | 'researcher' | 'lifestyle' | 'general'

export interface CodeBlock {
    id: string
    language: string
    code: string
    componentName?: string
    description?: string
}

export type RichTextBlockType =
    | 'paragraph'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'quote'
    | 'list'
    | 'orderedList'
    | 'todoList'
    | 'code'
    | 'callout'
    | 'table'
    | 'image'
    | 'divider'
    | 'math'
    | 'embed'
    | 'file'

// Metadata types
export interface BaseMetadata {
    isHtml?: boolean
    hasMath?: boolean
    id?: string
}

export interface CodeMetadata extends BaseMetadata {
    codeBlock: CodeBlock
}

export interface ListMetadata extends BaseMetadata {
    listItems: string[]
}

export interface TodoListMetadata extends BaseMetadata {
    todoItems: TodoItem[]
}

export interface TableMetadata extends BaseMetadata {
    tableData: {
        headers: string[]
        rows: TableCell[][]
    }
}

export interface CalloutMetadata extends BaseMetadata {
    calloutType: 'info' | 'warning' | 'success' | 'error'
}

export interface ImageMetadata extends BaseMetadata {
    imageUrl: string
    imageAlt?: string
}

export interface MathMetadata extends BaseMetadata {
    display: 'block' | 'inline'
}

export interface EmbedMetadata extends BaseMetadata {
    type: 'youtube' | 'twitter' | 'vimeo' | 'spotify'
    url: string
    title?: string
    thumbnailUrl?: string
    width?: number
    height?: number
    aspectRatio?: string
}

// Block types
export interface RichTextBlock {
    type: RichTextBlockType
    content: string | (string | MathPart)[]
    metadata?: BaseMetadata & Partial<
        CodeMetadata &
        ListMetadata &
        TodoListMetadata &
        TableMetadata &
        CalloutMetadata &
        ImageMetadata &
        MathMetadata &
        QuoteMetadata &
        EmbedMetadata
    >
}

export interface TodoItem {
    text: string
    checked: boolean
}

export interface TableCell {
    content: string
    isHeader?: boolean
}

export interface MathPart {
    type: 'math'
    content: string
    inline: boolean
}

export interface QuoteMetadata extends BaseMetadata {
    author?: string
    source?: string
    isBlockQuote?: boolean
}

export interface ChatMessage {
    role: 'user' | 'assistant' | 'system'
    content: RichTextBlock[]
    assistantType?: AssistantType
}

// Add new interface for file metadata
export interface FileMetadata {
    id: string
    filename: string
    type: 'csv' | 'docx' | 'pdf' | 'txt' | string
    size?: number
    mimeType?: string
    preview?: string // Optional preview content
}

export const ChatPlaceholder = '______________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________________'

// Available AI models
export const AI_MODELS = [
    { id: 'groq', name: 'Groq (Llama 3)', endpoint: '/api/chat', model: 'llama3-8b-8192' },
    { id: 'gpt-4o-mini', name: 'GPT-4o Mini', endpoint: '/api/chat/gpt', model: 'gpt-4o-mini' },
    { id: 'gpt-4o', name: 'GPT-4o', endpoint: '/api/chat/gpt', model: 'gpt-4o' },
    { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', endpoint: '/api/chat/gpt', model: 'gpt-4-turbo' },
]

// Enhanced SUI transfer detection patterns
export const detectCryptoTransfer = (input: string) => {
    // More comprehensive patterns for SUI transfer detection
    const patterns = [
        // Basic patterns
        /(?:send|transfer|pay)\s+(\d+(?:\.\d+)?)\s+sui\s+to\s+(?:(?:my\s+friend\s+)?(?:at\s+)?)?([a-fA-F0-9x]{64,66})/i,
        /(?:create|make)\s+(?:a\s+)?(?:transfer|payment)\s+(?:of\s+)?(\d+(?:\.\d+)?)\s+sui\s+to\s+(?:(?:my\s+friend\s+)?(?:at\s+)?)?([a-fA-F0-9x]{64,66})/i,
        // More flexible patterns
        /(\d+(?:\.\d+)?)\s+sui\s+(?:to|→)\s+(?:(?:my\s+friend\s+)?(?:at\s+)?)?([a-fA-F0-9x]{64,66})/i,
        // Address with 0x prefix
        /(?:send|transfer|pay|create)\s+(?:a\s+transfer\s+)?(?:of\s+)?(\d+(?:\.\d+)?)\s+sui.*?(?:to|at)\s+(?:my\s+friend\s+at\s+)?(0x[a-fA-F0-9]{64})/i,
        // More natural language
        /(?:I\s+want\s+to\s+|please\s+|can\s+you\s+)?(?:send|transfer|pay)\s+(\d+(?:\.\d+)?)\s+sui.*?(?:to|at)\s+(?:my\s+friend\s+at\s+)?(0x[a-fA-F0-9]{64})/i,
    ]

    for (const pattern of patterns) {
        const match = input.match(pattern)
        if (match) {
            const [, amount, addressMatch] = match
            let address = addressMatch

            // Clean up address - ensure it starts with 0x
            if (address && !address.startsWith('0x')) {
                address = '0x' + address
            }

            // Validate address length (64 chars + 0x = 66, or just 64)
            if (address && (address.length === 66 || (address.length === 64 && address.startsWith('0x') === false))) {
                if (address.length === 64 && !address.startsWith('0x')) {
                    address = '0x' + address
                }

                return {
                    amount: parseFloat(amount),
                    currency: 'SUI',
                    toAddress: address
                }
            }
        }
    }
    return null
}
