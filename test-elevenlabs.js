// Test script to verify ElevenLabs API setup
// Run with: node test-elevenlabs.js

require('dotenv').config({ path: '.env.local' });

async function testElevenLabs() {
  console.log('🔍 Testing ElevenLabs API Setup...\n');
  
  // Check API key
  const apiKey = process.env.ELEVENLABS_API_KEY;
  console.log('1. API Key Check:');
  console.log('   - Has API key:', !!apiKey);
  console.log('   - Key length:', apiKey?.length || 0);
  console.log('   - Key preview:', apiKey ? `${apiKey.substring(0, 8)}...` : 'Not found');
  
  if (!apiKey) {
    console.log('\n❌ No ELEVENLABS_API_KEY found!');
    console.log('   Create a .env.local file with:');
    console.log('   ELEVENLABS_API_KEY=your_api_key_here');
    return;
  }
  
  console.log('\n2. Testing ElevenLabs Import:');
  try {
    const ElevenLabsModule = await import('elevenlabs');
    console.log('   ✅ ElevenLabs module imported successfully');
    console.log('   - Available exports:', Object.keys(ElevenLabsModule));
    
    // Use the correct constructor
    const { ElevenLabsClient } = ElevenLabsModule;
    console.log('   - Constructor type:', typeof ElevenLabsClient);
    
    console.log('\n3. Testing ElevenLabs Client:');
    const elevenlabs = new ElevenLabsClient({ apiKey });
    console.log('   ✅ ElevenLabs client created');
    
    console.log('\n4. Testing Voice Generation:');
    const testText = 'Hello, this is a test of the ElevenLabs voice generation.';
    const voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel
    
    console.log('   - Text:', testText);
    console.log('   - Voice ID:', voiceId);
    console.log('   - Generating audio...');
    
    const audioStream = await elevenlabs.textToSpeech.convertAsStream(voiceId, {
      text: testText,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.85,
        style: 0.2,
        use_speaker_boost: true,
      },
    });
    
    console.log('   ✅ Audio stream received');
    
    // Collect chunks
    const chunks = [];
    let chunkCount = 0;
    for await (const chunk of audioStream) {
      chunks.push(chunk);
      chunkCount++;
    }
    
    const buffer = Buffer.concat(chunks);
    console.log('   ✅ Audio generated successfully!');
    console.log('   - Chunks:', chunkCount);
    console.log('   - Size:', buffer.length, 'bytes');
    
    console.log('\n🎉 ElevenLabs is working correctly!');
    
  } catch (error) {
    console.log('\n❌ ElevenLabs Error:');
    console.log('   - Message:', error.message);
    console.log('   - Type:', error.constructor.name);
    if (error.response) {
      console.log('   - Status:', error.response.status);
      console.log('   - Response:', await error.response.text().catch(() => 'Unable to read'));
    }
  }
}

testElevenLabs().catch(console.error); 