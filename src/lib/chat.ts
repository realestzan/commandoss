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