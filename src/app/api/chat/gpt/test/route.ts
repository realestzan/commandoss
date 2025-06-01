import { NextResponse } from 'next/server'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions'

export async function GET() {
    try {
        console.log('Testing OpenAI API key...')
        console.log('API Key present:', !!OPENAI_API_KEY)
        console.log('API Key length:', OPENAI_API_KEY?.length || 0)
        console.log('API Key starts with:', OPENAI_API_KEY?.substring(0, 7) || 'N/A')

        if (!OPENAI_API_KEY) {
            return NextResponse.json(
                {
                    error: 'OpenAI API key not found in environment variables',
                    suggestion: 'Make sure OPENAI_API_KEY is set in your .env file'
                },
                { status: 500 }
            )
        }

        // Make a minimal test request
        const testMessage = {
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'user', content: 'Say "API test successful"' }
            ],
            max_tokens: 10
        }

        console.log('Making test request to OpenAI...')

        const response = await fetch(OPENAI_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${OPENAI_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testMessage),
        })

        console.log('Test response status:', response.status)
        console.log('Test response headers:', Object.fromEntries(response.headers.entries()))

        if (!response.ok) {
            const errorData = await response.text()
            console.error('Test API error:', response.status, errorData)

            let parsedError
            try {
                parsedError = JSON.parse(errorData)
            } catch {
                // Can't parse as JSON
            }

            const errorInfo = {
                status: response.status,
                statusText: response.statusText,
                error: errorData,
                parsedError
            }

            if (response.status === 401) {
                return NextResponse.json({
                    success: false,
                    error: 'Invalid API key',
                    suggestion: 'Check that your OpenAI API key is correct',
                    details: errorInfo
                }, { status: 401 })
            } else if (response.status === 403) {
                return NextResponse.json({
                    success: false,
                    error: 'API access forbidden',
                    suggestion: 'Check your OpenAI account billing and usage limits',
                    details: errorInfo
                }, { status: 403 })
            } else if (response.status === 429) {
                return NextResponse.json({
                    success: false,
                    error: 'Rate limited',
                    suggestion: 'Wait a moment and try again',
                    details: errorInfo
                }, { status: 429 })
            }

            return NextResponse.json({
                success: false,
                error: 'API request failed',
                details: errorInfo
            }, { status: response.status })
        }

        const data = await response.json()
        console.log('Test successful!')
        console.log('Test response:', data)

        return NextResponse.json({
            success: true,
            message: 'OpenAI API key is working correctly',
            testResponse: data.choices?.[0]?.message?.content || 'No content',
            usage: data.usage,
            model: data.model
        })

    } catch (error) {
        console.error('Test endpoint error:', error)
        return NextResponse.json({
            success: false,
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 