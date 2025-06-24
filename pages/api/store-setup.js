import { put } from '@vercel/blob';
import { nanoid } from 'nanoid';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const setupData = req.body;
    
    // Generate a unique ID for this setup
    const setupId = nanoid();
    
    // Store the data in Vercel Blob
    const { url } = await put(`setups/${setupId}.json`, JSON.stringify(setupData), {
      contentType: 'application/json',
      access: 'public',
    });

    // Return the URL where the data is stored
    return res.status(200).json({ 
      success: true, 
      setupId,
      url,
      message: 'Setup data stored successfully' 
    });
  } catch (error) {
    console.error('Error storing setup data:', error);
    return res.status(500).json({ 
      error: 'Failed to store setup data',
      details: error.message 
    });
  }
} 