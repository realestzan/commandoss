import { NextRequest, NextResponse } from 'next/server'

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY
const ELEVENLABS_VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'pNInz6obpgDQGcFmaJgB' // Default to Adam voice

if (!ELEVENLABS_API_KEY) {
    console.error('ELEVENLABS_API_KEY is not set in environment variables')
}

export async function POST(request: NextRequest) {
    try {
        const { text } = await request.json()

        if (!text) {
            return NextResponse.json(
                { error: 'Text is required' },
                { status: 400 }
            )
        }

        if (!ELEVENLABS_API_KEY) {
            return NextResponse.json(
                { error: 'ElevenLabs API key not configured' },
                { status: 500 }
            )
        }

        // Clean text for TTS (remove markdown, HTML, etc.)
        const cleanText = text
            .replace(/```[\s\S]*?```/g, 'code block')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\*\*(.*?)\*\*/g, '$1')
            .replace(/\*(.*?)\*/g, '$1')
            .replace(/#{1,6}\s/g, '')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/\n+/g, ' ')
            .trim()

        // Limit text length (ElevenLabs has limits)
        const limitedText = cleanText.length > 2500 ? cleanText.substring(0, 2500) + '...' : cleanText

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
                    text: limitedText,
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

        if (!response.ok) {
            const errorText = await response.text()
            console.error('ElevenLabs API error:', response.status, errorText)

            if (response.status === 401) {
                return NextResponse.json(
                    { error: 'Invalid ElevenLabs API key' },
                    { status: 401 }
                )
            } else if (response.status === 429) {
                return NextResponse.json(
                    { error: 'ElevenLabs rate limit exceeded' },
                    { status: 429 }
                )
            }

            return NextResponse.json(
                { error: 'Failed to generate speech' },
                { status: response.status }
            )
        }

        const audioBuffer = await response.arrayBuffer()

        return new NextResponse(audioBuffer, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': audioBuffer.byteLength.toString(),
            },
        })

    } catch (error) {
        console.error('TTS API error:', error)
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
} 