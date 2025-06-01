import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
    role: string
    content: string
}

const GROQ_API_KEY = process.env.GROQ_API_KEY
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

if (!GROQ_API_KEY) {
    console.error('GROQ_API_KEY is not set in environment variables')
}

export async function POST(request: NextRequest) {
    try {
        const { messages, user } = await request.json()

        if (!GROQ_API_KEY) {
            return NextResponse.json(
                { error: 'API key not configured' },
                { status: 500 }
            )
        }

        // Enhance the system message with user context
        const enhancedMessages = messages.map((msg: ChatMessage, index: number) => {
            if (index === 0 && msg.role === 'system') {
                return {
                    ...msg,
                    content: msg.content + `\n\nUser Context:\n- Name: ${user.name}\n- Currency: ${user.currency}\n- Monthly Income: ${user.income}\n- Number of Goals: ${user.goals}`
                }
            }
            return msg
        })

        const response = await fetch(GROQ_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'llama3-8b-8192', // Using production model with higher rate limits
                messages: enhancedMessages,
                temperature: 0.7,
                max_tokens: 1024,
                top_p: 1,
                frequency_penalty: 0,
                presence_penalty: 0,
            }),
        })

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Groq API error:', response.status, errorData)
            return NextResponse.json(
                { error: 'Failed to get response from AI' },
                { status: response.status }
            )
        }

        const data = await response.json()

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Unexpected Groq API response format:', data)
            return NextResponse.json(
                { error: 'Invalid response format' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            content: data.choices[0].message.content,
            usage: data.usage
        })

    } catch (error) {
        console.error('Chat API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 