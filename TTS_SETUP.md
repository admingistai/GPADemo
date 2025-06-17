# Text-to-Speech Setup

## Environment Variables

To enable the Text-to-Speech functionality in the Remix tool, you need to configure the ElevenLabs API key.

### Required Environment Variable

Add the following environment variable to your deployment:

```
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### How to Get ElevenLabs API Key

1. Sign up for an account at [ElevenLabs](https://elevenlabs.io/)
2. Navigate to your profile settings
3. Generate an API key
4. Copy the API key

### Vercel Deployment Setup

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add a new environment variable:
   - **Name**: `ELEVENLABS_API_KEY`
   - **Value**: Your ElevenLabs API key
   - **Environment**: Production (and Preview/Development if needed)
4. Redeploy your application

### Local Development Setup

For local development, create a `.env.local` file in your project root:

```bash
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
```

### Voice Configuration

The TTS system uses the "Bella" voice by default (voice ID: `EXAVITQu4vr4xnSDxMaL`). You can modify the voice by changing the `voice_id` parameter in the `generateSpeechWithElevenLabs` function in `public/widget.js`.

Available voices can be found in your ElevenLabs dashboard.

### Features

The TTS functionality includes:
- ✅ Webpage content extraction and cleaning
- ✅ ElevenLabs AI voice generation
- ✅ Real-time word highlighting as speech plays
- ✅ Smooth scrolling to follow the reading
- ✅ Pause/Resume/Stop controls
- ✅ Error handling for missing content or API issues

### Usage

1. Navigate to any webpage with readable content
2. Open the GPA widget
3. Click on the "Remix" tab
4. Click "Start Reading" to begin text-to-speech
5. Use the control buttons to pause, resume, or stop playback
6. Words will be highlighted in yellow as they are being read
7. The page will automatically scroll to follow the reading

### Troubleshooting

If TTS is not working:
1. Check that the `ELEVENLABS_API_KEY` environment variable is set
2. Verify your ElevenLabs account has sufficient credits
3. Check the browser console for any error messages
4. Ensure the webpage has readable text content 