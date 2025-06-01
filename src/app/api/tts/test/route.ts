import { NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB' // Default to Adam voice

export async function GET() {
    try {
        console.log('Testing ElevenLabs API key...')
        console.log('API Key present:', !!ELEVENLABS_API_KEY)
        console.log('API Key length:', ELEVENLABS_API_KEY?.length || 0)
        console.log('Voice ID:', ELEVENLABS_VOICE_ID)

        if (!ELEVENLABS_API_KEY) {
            return NextResponse.json(
                {
                    error: 'ElevenLabs API key not found in environment variables',
                    suggestion: 'Make sure ELEVENLABS_API_KEY is set in your .env.local file'
                },
                { status: 500 }
            )
        }

        // Test with a very short text to minimize usage
        const testText = 'Test'

        console.log('Making test request to ElevenLabs...')

        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${ELEVENLABS_VOICE_ID}`,
            {
                method: 'POST',
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text: testText,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                        style: 0.0,
                        use_speaker_boost: true
                    }
                }),
            }
        )

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
                    error: 'Invalid ElevenLabs API key',
                    suggestion: 'Check that your ElevenLabs API key is correct',
                    details: errorInfo
                }, { status: 401 })
            } else if (response.status === 429) {
                return NextResponse.json({
                    success: false,
                    error: 'ElevenLabs rate limited',
                    suggestion: 'Wait a moment and try again, or check your usage limits',
                    details: errorInfo
                }, { status: 429 })
            } else if (response.status === 403) {
                return NextResponse.json({
                    success: false,
                    error: 'ElevenLabs access forbidden',
                    suggestion: 'Check your account billing and subscription status',
                    details: errorInfo
                }, { status: 403 })
            }

            return NextResponse.json({
                success: false,
                error: 'ElevenLabs API request failed',
                details: errorInfo
            }, { status: response.status })
        }

        const audioBuffer = await response.arrayBuffer()
        console.log('Test successful!')
        console.log('Audio buffer size:', audioBuffer.byteLength, 'bytes')

        return NextResponse.json({
            success: true,
            message: 'ElevenLabs API key is working correctly',
            voiceId: ELEVENLABS_VOICE_ID,
            audioSize: audioBuffer.byteLength,
            testText: testText
        })

    } catch (error) {
        console.error('TTS test endpoint error:', error)
        return NextResponse.json({
            success: false,
            error: 'Test failed',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 })
    }
} 