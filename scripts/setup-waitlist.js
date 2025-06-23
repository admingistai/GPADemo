#!/usr/bin/env node

/**
 * Setup script for Waitlist with Vercel Blob Storage
 * 
 * This script helps configure the waitlist feature for production use.
 * Run with: node scripts/setup-waitlist.js
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 Ask Anything™ Waitlist Setup\n');

function checkEnvironmentVariables() {
  console.log('📋 Checking environment variables...\n');
  
  const envFile = path.join(process.cwd(), '.env.local');
  let envContent = '';
  
  if (fs.existsSync(envFile)) {
    envContent = fs.readFileSync(envFile, 'utf8');
  }
  
  const hasToken = envContent.includes('BLOB_READ_WRITE_TOKEN') || process.env.BLOB_READ_WRITE_TOKEN;
  
  if (hasToken) {
    console.log('✅ BLOB_READ_WRITE_TOKEN is configured');
  } else {
    console.log('❌ BLOB_READ_WRITE_TOKEN is not configured');
    console.log('\n📝 To set up Vercel Blob storage:');
    console.log('1. Go to your Vercel project dashboard');
    console.log('2. Navigate to the "Storage" tab');
    console.log('3. Create a new Blob store');
    console.log('4. Copy the BLOB_READ_WRITE_TOKEN');
    console.log('5. Add it to your .env.local file:');
    console.log('   BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx\n');
  }
  
  const hasAdminPassword = envContent.includes('ADMIN_PASSWORD') || process.env.ADMIN_PASSWORD;
  
  if (hasAdminPassword) {
    console.log('✅ ADMIN_PASSWORD is configured');
  } else {
    console.log('⚠️  ADMIN_PASSWORD is not configured (using default)');
    console.log('   Consider adding a secure password to .env.local:');
    console.log('   ADMIN_PASSWORD=your-secure-password\n');
  }
  
  return hasToken;
}

function checkDependencies() {
  console.log('📦 Checking dependencies...\n');
  
  const packageFile = path.join(process.cwd(), 'package.json');
  
  if (!fs.existsSync(packageFile)) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const packageContent = JSON.parse(fs.readFileSync(packageFile, 'utf8'));
  const hasVercelBlob = packageContent.dependencies && packageContent.dependencies['@vercel/blob'];
  
  if (hasVercelBlob) {
    console.log('✅ @vercel/blob dependency found');
  } else {
    console.log('❌ @vercel/blob dependency missing');
    console.log('   Run: npm install @vercel/blob\n');
    return false;
  }
  
  return true;
}

function checkFiles() {
  console.log('📁 Checking required files...\n');
  
  const requiredFiles = [
    'pages/waitlist.js',
    'pages/api/waitlist.js',
    'pages/admin/waitlist.js'
  ];
  
  const missingFiles = [];
  
  requiredFiles.forEach(file => {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      console.log(`✅ ${file}`);
    } else {
      console.log(`❌ ${file}`);
      missingFiles.push(file);
    }
  });
  
  if (missingFiles.length > 0) {
    console.log(`\n⚠️  Missing ${missingFiles.length} required file(s)`);
    return false;
  }
  
  return true;
}

function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  for (let i = 0; i < 16; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

function createEnvTemplate() {
  console.log('\n🔧 Creating .env.local template...\n');
  
  const envTemplate = `# Vercel Blob Storage (Required)
# Get this from your Vercel project dashboard > Storage tab
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# Admin Password (Recommended)
# Change this to a secure password for production
ADMIN_PASSWORD=${generateSecurePassword()}

# Rate Limiting (Optional)
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=3
`;

  const envFile = path.join(process.cwd(), '.env.local');
  
  if (fs.existsSync(envFile)) {
    console.log('⚠️  .env.local already exists, skipping template creation');
    console.log('   Make sure to add the required environment variables manually');
  } else {
    fs.writeFileSync(envFile, envTemplate);
    console.log('✅ Created .env.local template');
    console.log('   Please update BLOB_READ_WRITE_TOKEN with your actual token');
  }
}

function showNextSteps() {
  console.log('\n🚀 Next Steps:\n');
  console.log('1. Configure Vercel Blob storage:');
  console.log('   - Visit your Vercel project dashboard');
  console.log('   - Go to Storage > Create Blob Store');
  console.log('   - Copy the BLOB_READ_WRITE_TOKEN');
  console.log('   - Add it to your .env.local file\n');
  
  console.log('2. Test locally:');
  console.log('   npm run dev');
  console.log('   Visit http://localhost:3000/waitlist\n');
  
  console.log('3. Deploy to production:');
  console.log('   - Add BLOB_READ_WRITE_TOKEN to Vercel environment variables');
  console.log('   - Deploy your changes');
  console.log('   - Test the live waitlist form\n');
  
  console.log('4. Access admin dashboard:');
  console.log('   Visit https://yoursite.com/admin/waitlist');
  console.log('   Default password: gist2024admin (change this!)\n');
  
  console.log('📚 For detailed documentation, see WAITLIST_README.md');
}

// Main execution
async function main() {
  try {
    const hasDeps = checkDependencies();
    const hasFiles = checkFiles();
    const hasEnv = checkEnvironmentVariables();
    
    if (!hasDeps) {
      console.log('\n❌ Setup incomplete: Missing dependencies');
      console.log('Run: npm install @vercel/blob');
      process.exit(1);
    }
    
    if (!hasFiles) {
      console.log('\n❌ Setup incomplete: Missing required files');
      console.log('Please ensure all waitlist files are properly created');
      process.exit(1);
    }
    
    if (!hasEnv) {
      createEnvTemplate();
    }
    
    showNextSteps();
    
    console.log('✅ Waitlist setup complete!\n');
    
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    process.exit(1);
  }
}

main(); 