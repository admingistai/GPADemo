// Available ElevenLabs voices
// eslint-disable-next-line no-unused-vars
const ELEVENLABS_VOICES = [
  { id: '21m00Tcm4TlvDq8ikWAM', name: 'Rachel', accent: 'American', gender: 'female', description: 'calm' },
  { id: 'yoZ06aMxZJJ28mfd3POQ', name: 'Sam', accent: 'American', gender: 'male', description: 'raspy' },
  { id: 'TxGEqnHWrfWFTfGW9XjX', name: 'Josh', accent: 'American', gender: 'male', description: 'deep' },
  { id: 'piTKgcLEGmPE4e6mEKli', name: 'Nicole', accent: 'American', gender: 'female', description: 'soft' },
  { id: 'SOYHLrjzK2X1ezoPC6cr', name: 'Harry', accent: 'American', gender: 'male', description: 'anxious' },
  { id: 'oWAxZDx7w5VEj9dCyTzz', name: 'Grace', accent: 'Southern American', gender: 'female', description: 'pleasant' },
  { id: 'bVMeCyTHy58xNoL34h3p', name: 'Jeremy', accent: 'Irish', gender: 'male', description: 'excited' },
  { id: 'ZQe5CZNOzWyzPSCn5a3c', name: 'James', accent: 'Australian', gender: 'male', description: 'calm' },
  { id: 'Zlb1dXrM653N07WRdFW3', name: 'Joseph', accent: 'British', gender: 'male', description: 'articulate' },
  { id: 'GBv7mTt0atIp3Br8iCZE', name: 'Thomas', accent: 'American', gender: 'male', description: 'calm meditation' }
];

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text, question, voicePreset = 'news', voiceId } = req.body;

    // DEBUG: Log incoming request
    console.log('[API] Generate audio request:', {
      question: question?.substring(0, 100),
      textLength: text?.length,
      voicePreset,
      voiceId,
      hasApiKey: !!process.env.ELEVENLABS_API_KEY,
      apiKeyLength: process.env.ELEVENLABS_API_KEY?.length
    });

    // Create a news-style script from the user's question
    const script = await generateNewsScript(question, text);
    console.log('[API] Generated script length:', script.length);

    // Check if ElevenLabs API key is available
    if (!process.env.ELEVENLABS_API_KEY) {
      console.log('[API] No ElevenLabs API key found - using TTS fallback');
      return res.status(200).json({
        success: true,
        script: script,
        message: 'No ElevenLabs API key - using client-side TTS',
        useClientTTS: true
      });
    }

    console.log('[API] ElevenLabs API key found, attempting voice generation...');
    
    try {
      // Use ElevenLabs if available
      console.log('[API] Calling ElevenLabs with voice ID:', voiceId);
      const audioBuffer = await generateWithElevenLabs(script, voicePreset, voiceId);
      
      console.log('[API] ElevenLabs success! Audio buffer size:', audioBuffer.length, 'bytes');
      
      // Set response headers for audio streaming
      res.setHeader('Content-Type', 'audio/mpeg');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Content-Disposition', 'inline; filename="gist-audio.mp3"');
      
      // Stream the audio
      return res.send(audioBuffer);
      
    } catch (elevenLabsError) {
      console.error('[API] ElevenLabs error:', {
        message: elevenLabsError.message,
        stack: elevenLabsError.stack,
        voiceId: voiceId
      });
      
      // Fall back to success response with script for client-side TTS
      return res.status(200).json({
        success: true,
        script: script,
        message: `ElevenLabs failed: ${elevenLabsError.message}`,
        useClientTTS: true,
        error: elevenLabsError.message
      });
    }

  } catch (error) {
    console.error('Audio generation error:', error);
    return res.status(500).json({ 
      error: 'Failed to generate audio',
      details: error.message 
    });
  }
}

// Generate ElevenLabs audio (requires API key)
async function generateWithElevenLabs(script, voicePreset, voiceId) {
  console.log('[API] Starting ElevenLabs generation...');
  
  try {
    const ElevenLabsModule = await import('elevenlabs');
    console.log('[API] ElevenLabs module imported successfully');
    console.log('[API] Available exports:', Object.keys(ElevenLabsModule));
    
    // Use the correct constructor
    const { ElevenLabsClient } = ElevenLabsModule;
    console.log('[API] Constructor type:', typeof ElevenLabsClient);
    
    // Initialize ElevenLabs client
    const elevenlabs = new ElevenLabsClient({
      apiKey: process.env.ELEVENLABS_API_KEY,
    });
    console.log('[API] ElevenLabs client initialized');

    // Use provided voiceId or default to Rachel (calm female voice)
    const selectedVoiceId = voiceId || '21m00Tcm4TlvDq8ikWAM';
    console.log('[API] Using voice ID:', selectedVoiceId);
    console.log('[API] Script to convert:', script.substring(0, 100) + '...');

    // Generate audio using ElevenLabs streaming API
    console.log('[API] Calling ElevenLabs textToSpeech.convertAsStream...');
    const audioStream = await elevenlabs.textToSpeech.convertAsStream(selectedVoiceId, {
      text: script,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75, // Higher for news reading
        similarity_boost: 0.85,
        style: 0.2, // Slight style for natural delivery
        use_speaker_boost: true,
      },
    });
    console.log('[API] Audio stream received, collecting chunks...');

    // Collect audio chunks
    const chunks = [];
    let chunkCount = 0;
    for await (const chunk of audioStream) {
      chunks.push(chunk);
      chunkCount++;
      if (chunkCount % 10 === 0) {
        console.log('[API] Collected', chunkCount, 'chunks so far...');
      }
    }
    
    console.log('[API] Total chunks collected:', chunkCount);
    const buffer = Buffer.concat(chunks);
    console.log('[API] Final buffer size:', buffer.length, 'bytes');
    
    return buffer;
  } catch (error) {
    console.error('[API] Error in generateWithElevenLabs:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    throw error;
  }
}

// Generate a news-style script from the user's question
async function generateNewsScript(question, originalContent) {
  try {
    // Use OpenAI to create a news-style script if API key is available
    if (process.env.OPENAI_API_KEY) {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional news script writer. Convert the user's question and answer into a natural, engaging news-style audio script. 
              Include:
              - A brief introduction with date and topic
              - Natural transitions and pauses
              - Clear, conversational language
              - A proper conclusion
              Keep it concise but informative, around 30-60 seconds of speech.`
            },
            {
              role: 'user',
              content: `Question: ${question}\n\nContent: ${originalContent}\n\nCreate a news-style script for audio.`
            }
          ],
          max_tokens: 300,
          temperature: 0.7
        })
      });

      const data = await response.json();
      return data.choices[0].message.content;
    }
  } catch (error) {
    console.error('OpenAI script generation failed:', error);
  }

  // Fallback script if OpenAI fails
  const date = new Date().toLocaleDateString();
  return `Welcome to Gist News Snap for ${date}. 
  Today's topic: ${question || 'Latest updates'}. 
  ${originalContent ? originalContent.substring(0, 200) + '...' : 'Stay tuned for more updates.'}
  That's all for now. Thank you for listening to Gist News Snap.`;
} 