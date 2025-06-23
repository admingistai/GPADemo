import { put, head, list } from '@vercel/blob';
import validator from 'validator';

// Vercel Blob storage configuration
const BLOB_FILENAME = 'contact-submissions.json';

// Read existing contact data from Vercel Blob
async function readContactData() {
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
    console.error('Error reading contact data from blob:', error);
    return [];
  }
}

// Write contact data to Vercel Blob
async function writeContactData(data) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    
    const blob = await put(BLOB_FILENAME, jsonData, {
      access: 'public',
      contentType: 'application/json',
    });

    console.log('Contact data saved to blob:', blob.url);
    return true;
  } catch (error) {
    console.error('Error writing contact data to blob:', error);
    return false;
  }
}

// Validate form data
function validateFormData(data) {
  const { name, email, website, message } = data;
  
  // Required fields
  if (!name || !email || !message) {
    return { valid: false, error: 'Name, email, and message are required' };
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
  
  // Website URL validation (optional field)
  if (website && website.trim()) {
    try {
      new URL(website);
    } catch (error) {
      return { valid: false, error: 'Please enter a valid website URL' };
    }
    if (website.length > 200) {
      return { valid: false, error: 'Website URL is too long' };
    }
  }
  
  // Message validation
  if (message.trim().length < 10) {
    return { valid: false, error: 'Message must be at least 10 characters long' };
  }
  if (message.length > 2000) {
    return { valid: false, error: 'Message is too long (max 2000 characters)' };
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
        error: 'Contact service is not properly configured. Please try again later.' 
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
    
    const { name, email, website, message } = req.body;
    
    // Read existing contact data
    const contactData = await readContactData();
    
    // Create new entry
    const newEntry = {
      id: Date.now().toString(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      website: website ? website.trim() : '',
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      ipAddress: clientIP, // For debugging/analytics (consider privacy implications)
      status: 'new' // Track if the message has been read/responded to
    };
    
    // Add to contact submissions
    contactData.push(newEntry);
    
    // Save to Vercel Blob
    const saveSuccess = await writeContactData(contactData);
    if (!saveSuccess) {
      return res.status(500).json({ 
        error: 'Failed to save your message. Please try again.' 
      });
    }
    
    // Log the new contact submission
    console.log(`New contact submission: ${name} (${email}) - Total: ${contactData.length}`);
    
    // Return success response
    res.status(200).json({ 
      message: 'Message sent successfully! We\'ll get back to you within 24 hours.',
      submissionId: newEntry.id 
    });
    
  } catch (error) {
    console.error('Error processing contact submission:', error);
    res.status(500).json({ 
      error: 'An unexpected error occurred. Please try again.' 
    });
  }
}

// Export a function to get contact stats (for admin use)
export async function getContactStats() {
  const data = await readContactData();
  return {
    total: data.length,
    recentSubmissions: data.filter(entry => {
      const submissionDate = new Date(entry.submittedAt);
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return submissionDate > weekAgo;
    }).length,
    unreadCount: data.filter(entry => entry.status === 'new').length,
    withWebsites: data.filter(entry => entry.website && entry.website.trim()).length
  };
} 