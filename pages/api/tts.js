export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { text, voice_id = 'EXAVITQu4vr4xnSDxMaL' } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    if (!ELEVENLABS_API_KEY) {
        return res.status(500).json({ error: 'ElevenLabs API key not configured' });
    }

    try {
        // Call ElevenLabs API
        const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice_id}`, {
            method: 'POST',
            headers: {
                'Accept': 'audio/mpeg',
                'Content-Type': 'application/json',
                'xi-api-key': ELEVENLABS_API_KEY
            },
            body: JSON.stringify({
                text: text,
                model_id: 'eleven_monolingual_v1',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.5
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('ElevenLabs API error:', errorText);
            return res.status(response.status).json({ 
                error: `ElevenLabs API error: ${response.status}` 
            });
        }

        // Get the audio data
        const audioBuffer = await response.arrayBuffer();
        
        // Convert to base64 data URL for direct playback
        const base64Audio = Buffer.from(audioBuffer).toString('base64');
        const audioUrl = `data:audio/mpeg;base64,${base64Audio}`;

        return res.status(200).json({ 
            audioUrl: audioUrl,
            message: 'TTS generated successfully'
        });

    } catch (error) {
        console.error('TTS generation error:', error);
        return res.status(500).json({ 
            error: 'Failed to generate speech',
            details: error.message 
        });
    }
} 