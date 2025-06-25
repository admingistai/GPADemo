import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, style, format } = req.body;

    // Validate input
    if (!prompt || typeof prompt !== 'string') {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Map format to DALL-E size parameter
    const sizeMap = {
      'square': '1024x1024',
      'landscape': '1792x1024',
      'portrait': '1024x1792',
      'story': '1024x1792'
    };

    // Generate image using DALL-E 3
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: `${prompt}. Style: ${style || 'creative'}`,
      n: 1,
      size: sizeMap[format] || '1024x1024',
      quality: 'standard',
      response_format: 'url'
    });

    // Return the image URL
    const imageUrl = response.data[0].url;
    
    res.status(200).json({ 
      success: true, 
      imageUrl: imageUrl,
      revisedPrompt: response.data[0].revised_prompt
    });

  } catch (error) {
    console.error('Image generation error:', error);
    
    // Handle specific OpenAI errors
    if (error.response) {
      return res.status(error.response.status).json({ 
        error: error.response.data.error.message 
      });
    }
    
    return res.status(500).json({ 
      error: 'Failed to generate image' 
    });
  }
} 