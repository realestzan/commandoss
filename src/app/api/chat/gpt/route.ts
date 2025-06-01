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
        console.log('API Key present:', !!OPENAI_API_KEY)
        console.log('API Key length:', OPENAI_API_KEY?.length || 0)

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
        console.log('OpenAI response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
            const errorData = await response.text()
            console.error('OpenAI API error:', response.status, errorData)

            // Try to parse error data
            let parsedError
            try {
                parsedError = JSON.parse(errorData)
                console.error('Parsed OpenAI error:', parsedError)
            } catch {
                console.error('Could not parse error response as JSON')
            }

            // Provide more specific error messages
            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid OpenAI API key. Please check your API key in environment variables.' },
                    { status: 401 }
                )
            } else if (response.status === 429) {
                return NextResponse.json(
                    { error: 'OpenAI rate limit exceeded. Please wait a moment and try again.' },
                    { status: 429 }
                )
            } else if (response.status === 400) {
                return NextResponse.json(
                    { error: 'Invalid request to OpenAI API', details: errorData },
                    { status: 400 }
                )
            } else if (response.status === 403) {
                return NextResponse.json(
                    { error: 'OpenAI API access forbidden. Check your API key permissions and billing status.' },
                    { status: 403 }
                )
            }

            return NextResponse.json(
                { error: `OpenAI API error (${response.status})`, details: errorData },
                { status: response.status }
            )
        }

        const data = await response.json()
        console.log('OpenAI response received successfully')
        console.log('Usage info:', data.usage)

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