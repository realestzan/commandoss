import { NextRequest, NextResponse } from 'next/server'

interface ChatMessage {
    role: string
    content: string
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY is not set in environment variables')
}

export async function POST(request: NextRequest) {
    try {
        const { messages, user, model = 'gpt-4o-mini' } = await request.json()

        console.log('GPT API called with model:', model)
        console.log('Messages count:', messages.length)

        if (!OPENAI_API_KEY) {
            console.error('No OpenAI API key found')
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

        console.log('Making request to OpenAI with model:', model)

        const requestBody = {
            model: model,
            messages: enhancedMessages,
            temperature: 0.7,
            max_tokens: 1024,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
        }

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        })

        console.log('OpenAI response status:', response.status)

        if (!response.ok) {
            const errorData = await response.text()
            console.error('OpenAI API error:', response.status, errorData)

            // Provide more specific error messages
            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid OpenAI API key' },
                    { status: 401 }
                )
            } else if (response.status === 429) {
                return NextResponse.json(
                    { error: 'OpenAI rate limit exceeded' },
                    { status: 429 }
                )
            } else if (response.status === 400) {
                return NextResponse.json(
                    { error: 'Invalid request to OpenAI API', details: errorData },
                    { status: 400 }
                )
            }

            return NextResponse.json(
                { error: 'Failed to get response from AI', details: errorData },
                { status: response.status }
            )
        }

        const data = await response.json()
        console.log('OpenAI response received successfully')

        if (!data.choices || !data.choices[0] || !data.choices[0].message) {
            console.error('Unexpected OpenAI API response format:', data)
            return NextResponse.json(
                { error: 'Invalid response format from OpenAI' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            content: data.choices[0].message.content,
            usage: data.usage,
            model: data.model
        })

    } catch (error) {
        console.error('GPT Chat API error:', error)

        if (error instanceof SyntaxError) {
            return NextResponse.json(
                { error: 'Invalid JSON in request body' },
                { status: 400 }
            )
        }

        return NextResponse.json(
            { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        )
    }
} 