import fs from 'fs';
import path from 'path';
import { validate } from 'validator';

// Simple file-based storage for the waitlist
const WAITLIST_FILE = path.join(process.cwd(), 'data', 'waitlist.json');

// Ensure data directory exists
function ensureDataDirectory() {
  const dataDir = path.dirname(WAITLIST_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

// Read existing waitlist data
function readWaitlistData() {
  try {
    if (fs.existsSync(WAITLIST_FILE)) {
      const data = fs.readFileSync(WAITLIST_FILE, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading waitlist data:', error);
    return [];
  }
}

// Write waitlist data
function writeWaitlistData(data) {
  try {
    ensureDataDirectory();
    fs.writeFileSync(WAITLIST_FILE, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing waitlist data:', error);
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
  if (!validate.isEmail(email)) {
    return { valid: false, error: 'Please enter a valid email address' };
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
    const waitlistData = readWaitlistData();
    
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
    
    // Save to file
    const saveSuccess = writeWaitlistData(waitlistData);
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
  const data = readWaitlistData();
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