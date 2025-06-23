import { put, head, list } from '@vercel/blob';
import validator from 'validator';

// Vercel Blob storage configuration
const BLOB_FILENAME = 'waitlist.json';

// Read existing waitlist data from Vercel Blob
async function readWaitlistData() {
  try {
    // Check if blob exists
    try {
      await head(BLOB_FILENAME);
    } catch (error) {
      // Blob doesn't exist, return empty array
      if (error.message.includes('not found') || error.message.includes('404')) {
        return [];
      }
      throw error;
    }

    // Fetch the blob content
    const response = await fetch(`https://${process.env.VERCEL_URL || process.env.BLOB_READ_WRITE_TOKEN?.split('_')[1] || 'localhost'}.vercel-storage.com/${BLOB_FILENAME}`, {
      headers: {
        'Authorization': `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`
      }
    });

    if (!response.ok) {
      console.log('Blob not found, starting with empty array');
      return [];
    }

    const data = await response.text();
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading waitlist data from blob:', error);
    return [];
  }
}

// Write waitlist data to Vercel Blob
async function writeWaitlistData(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    
    const blob = await put(BLOB_FILENAME, jsonData, {
      access: 'public',
      contentType: 'application/json',
    });

    console.log('Waitlist data saved to blob:', blob.url);
    return true;
  } catch (error) {
    console.error('Error writing waitlist data to blob:', error);
    return false;
  }
}

// Validate form data
function validateFormData(data) {
  const { name, email, company, role } = data;
  
  // Required fields
  if (!name || !email) {
    return { valid: false, error: 'Name and email are required' };
  }
  
  // Name validation
  if (name.trim().length < 2 || name.trim().length > 100) {
    return { valid: false, error: 'Name must be between 2 and 100 characters' };
  }
  
  // Email validation
  try {
    if (!validator.isEmail(email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
  } catch (error) {
    // Fallback to basic email regex if validator fails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { valid: false, error: 'Please enter a valid email address' };
    }
  }
  
  // Optional fields validation
  if (company && company.length > 200) {
    return { valid: false, error: 'Company name is too long' };
  }
  
  if (role && !['content-creator', 'blogger', 'publisher', 'developer', 'marketer', 'business-owner', 'other'].includes(role)) {
    return { valid: false, error: 'Invalid role selected' };
  }
  
  return { valid: true };
}

// Rate limiting (simple in-memory store)
const rateLimitStore = new Map();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000; // 15 minutes
const RATE_LIMIT_MAX_REQUESTS = 3; // Max 3 submissions per 15 minutes per IP

function checkRateLimit(ip) {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW;
  
  if (!rateLimitStore.has(ip)) {
    rateLimitStore.set(ip, []);
  }
  
  const requests = rateLimitStore.get(ip).filter(time => time > windowStart);
  
  if (requests.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  requests.push(now);
  rateLimitStore.set(ip, requests);
  return true;
}

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    // Check if Vercel Blob is configured
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('BLOB_READ_WRITE_TOKEN environment variable is not set');
      return res.status(500).json({ 
        error: 'Waitlist service is not properly configured. Please try again later.' 
      });
    }

    // Get client IP for rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(clientIP)) {
      return res.status(429).json({ 
        error: 'Too many submissions. Please wait 15 minutes before trying again.' 
      });
    }
    
    // Validate form data
    const validation = validateFormData(req.body);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    const { name, email, company, role } = req.body;
    
    // Read existing waitlist data
    const waitlistData = await readWaitlistData();
    
    // Check if email already exists
    const existingEntry = waitlistData.find(entry => entry.email.toLowerCase() === email.toLowerCase());
    if (existingEntry) {
      return res.status(400).json({ 
        error: 'This email is already on our waitlist!' 
      });
    }
    
    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      company: company ? company.trim() : '',
      role: role || '',
      submittedAt: new Date().toISOString(),
      ipAddress: clientIP // For debugging/analytics (consider privacy implications)
    };
    
    // Add to waitlist
    waitlistData.push(newEntry);
    
    // Save to Vercel Blob
    const saveSuccess = await writeWaitlistData(waitlistData);
    if (!saveSuccess) {
      return res.status(500).json({ 
        error: 'Failed to save your information. Please try again.' 
      });
    }
    
    // Log the new signup (remove in production if needed)
    console.log(`New waitlist signup: ${name} (${email}) - Total: ${waitlistData.length}`);
    
    // Return success response
    res.status(200).json({ 
      message: 'Successfully added to waitlist!',
      position: waitlistData.length 
    });
    
  } catch (error) {
    console.error('Error processing waitlist submission:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.' 
    });
  }
}

// Export a function to get waitlist stats (for admin use)
export async function getWaitlistStats() {
  const data = await readWaitlistData();
  return {
    total: data.length,
    recentSignups: data.filter(entry => {
      const signupDate = new Date(entry.submittedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return signupDate > weekAgo;
    }).length,
    topRoles: data.reduce((acc, entry) => {
      if (entry.role) {
        acc[entry.role] = (acc[entry.role] || 0) + 1;
      }
      return acc;
    }, {})
  };
} 