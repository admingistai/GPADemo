# Debug Prompt: ElevenLabs Voice Not Working in Audio Player

## Problem Description
The audio player in our widget is still using robotic browser TTS voices instead of the ElevenLabs API voices, even though we have a voice dropdown with ElevenLabs voice options. The voice dropdown doesn't seem to be triggering the actual ElevenLabs API calls.

## How the Widget Audio System Works

### Architecture Overview
1. **Widget Structure**: The widget (`public/widget.js`) is a self-contained IIFE with Shadow DOM isolation
2. **Audio Player**: Created via `createAudioPlayer()` function when user clicks "Audio" tab in remix modal
3. **Voice Generation**: Two pathways - ElevenLabs API or browser TTS fallback

### Audio Generation Flow
```
User clicks Audio tab → createAudioPlayer() → setupAudioPlayerEvents() → 
User clicks play → generateAndStreamAudio() → 
Calls /api/generate-audio → Returns either:
  - ElevenLabs audio blob (preferred)
  - Browser TTS script (fallback)
```

### Key Functions and Their Roles

#### 1. `createAudioPlayer(question, originalContent)`
- Creates the audio player UI with voice dropdown
- Voice dropdown has 10 ElevenLabs voices with IDs like `21m00Tcm4TlvDq8ikWAM`
- Calls `setupAudioPlayerEvents()` to wire up functionality

#### 2. `setupAudioPlayerEvents(audioPlayer, question, originalContent)`
- Sets up play/pause button logic
- Sets up voice change handler on dropdown
- Contains `generateAndStreamAudio()` function

#### 3. `generateAndStreamAudio(audioPlayer, question, content)`
- Gets selected voice ID from dropdown: `voiceSelect.value`
- Makes POST request to `/api/generate-audio` with:
  ```json
  {
    "question": question,
    "text": content,
    "voicePreset": "news", 
    "voiceId": selectedVoiceId
  }
  ```
- Handles two response types:
  - `data.useClientTTS = true` → calls `generateClientSideTTS()`
  - Audio blob response → creates Audio element with ElevenLabs audio

#### 4. Backend API (`/pages/api/generate-audio.js`)
- Should receive the `voiceId` parameter
- Should use ElevenLabs API to generate audio with that voice
- Should return audio blob if successful
- Should return `{useClientTTS: true, script: "..."}` if ElevenLabs fails

### Voice Dropdown Implementation
```html
<select class="audio-voice-select" id="audio-voice-select">
  <option value="21m00Tcm4TlvDq8ikWAM">Rachel - American (calm)</option>
  <option value="yoZ06aMxZJJ28mfd3POQ">Sam - American (raspy)</option>
  <!-- ... 8 more voices ... -->
</select>
```

### Voice Change Handler
```javascript
voiceSelect.addEventListener('change', () => {
  // Stop current audio
  if (audioPlayer.audio) {
    audioPlayer.audio.pause();
    audioPlayer.audio = null;
  }
  // Stop TTS if active  
  if (audioPlayer.speechUtterance) {
    speechSynthesis.cancel();
    audioPlayer.speechUtterance = null;
  }
  // Regenerate with new voice
  setTimeout(() => {
    generateAndStreamAudio(audioPlayer, question, originalContent);
  }, 500);
});
```

## What to Investigate

### 1. Check Backend API Response
- Is `/api/generate-audio` receiving the `voiceId` parameter correctly?
- Is it making actual ElevenLabs API calls or immediately falling back to TTS?
- What does the response look like? Is it returning `{useClientTTS: true}` or audio blob?

### 2. Check Frontend API Call
- Is `generateAndStreamAudio()` correctly getting the voice ID from dropdown?
- Is the POST request being made with the right parameters?
- What response is being received?

### 3. Check ElevenLabs API Integration
- Is the ElevenLabs API key configured correctly?
- Is the API endpoint working?
- Are there any rate limits or quota issues?

### 4. Check Response Handling
- Is the response content-type check working: `response.headers.get('content-type')?.includes('audio')`?
- Is the audio blob being created correctly?

### 5. Network Analysis
- Check browser Network tab when voice is changed
- Look for `/api/generate-audio` requests
- Check request payload and response

## Debugging Steps

1. **Add Console Logging**: Add logs to track:
   - Selected voice ID from dropdown
   - API request parameters
   - API response type and content
   - Which code path is taken (ElevenLabs vs TTS)

2. **Check API Endpoint**: Test `/api/generate-audio` directly with curl/Postman

3. **Verify ElevenLabs Integration**: Check if ElevenLabs API is working independently

4. **Check Content-Type**: Ensure ElevenLabs response has correct audio content-type

## Expected Behavior
- Voice dropdown change should trigger new ElevenLabs API call
- Should receive audio blob with selected voice
- Should play ElevenLabs voice, not browser TTS

## Current Behavior  
- Voice dropdown changes but still uses robotic browser TTS
- Suggests API is returning `{useClientTTS: true}` instead of audio blob

Please investigate why the ElevenLabs API path isn't working and the system is falling back to browser TTS even when voices are selected. 