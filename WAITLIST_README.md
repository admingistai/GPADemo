# Waitlist Feature Documentation

This project now includes a complete waitlist system for collecting email addresses and names from potential users, powered by **Vercel Blob Storage**.

## Features

- 📝 **Form Collection**: Collects name, email, company, and role information
- ✅ **Validation**: Server-side validation with proper error handling
- 🚦 **Rate Limiting**: Prevents spam with IP-based rate limiting (3 submissions per 15 minutes)
- 📊 **Admin Dashboard**: View and manage waitlist entries with search, sort, and export
- 🎨 **Responsive Design**: Beautiful UI that matches your existing brand
- ☁️ **Vercel Blob Storage**: Reliable cloud storage with automatic scaling

## Pages Created

1. `/waitlist` - Public waitlist signup form
2. `/admin/waitlist` - Admin dashboard to view entries

## API Endpoints

- `POST /api/waitlist` - Submit new waitlist entry

## File Structure

```
pages/
  waitlist.js           # Public signup form
  admin/
    waitlist.js         # Admin dashboard
  api/
    waitlist.js         # API endpoint for form submissions
```

## Setup Instructions

### 1. Install Dependencies

The required Vercel Blob dependency is already added to `package.json`:

```bash
npm install
```

### 2. Configure Vercel Blob Storage

#### Option A: Using Vercel Dashboard (Recommended)
1. Go to your Vercel project dashboard
2. Navigate to the "Storage" tab
3. Create a new Blob store
4. Copy the `BLOB_READ_WRITE_TOKEN` from the connection details

#### Option B: Using Vercel CLI
```bash
npx vercel blob create waitlist-db
```

### 3. Set Environment Variables

Add to your `.env.local`:
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx
```

For production, add the same environment variable in your Vercel dashboard under "Settings" → "Environment Variables".

### 4. Deploy

The system will automatically create the blob storage when the first user signs up. No manual database setup required!

## Admin Access

The admin dashboard is protected by a simple password. Currently set to:
- **Password**: `gist2024admin`

⚠️ **Important**: Change this password in `/pages/admin/waitlist.js` before going live!

## Data Storage

Data is stored in Vercel Blob as a JSON file (`waitlist.json`). Each entry contains:

```json
{
  "id": "timestamp",
  "name": "User Name",
  "email": "user@example.com", 
  "company": "Company Name",
  "role": "developer",
  "submittedAt": "2024-01-01T00:00:00.000Z",
  "ipAddress": "xxx.xxx.xxx.xxx"
}
```

## Security Features

- Input validation and sanitization
- Rate limiting by IP address
- Duplicate email prevention
- XSS protection
- CSRF protection through same-origin policy
- Secure cloud storage with Vercel Blob

## Why Vercel Blob?

✅ **Automatic Scaling**: No storage limits to worry about
✅ **Built-in CDN**: Fast global access to your data
✅ **Zero Configuration**: Works out of the box with Vercel
✅ **Reliable**: 99.9% uptime guarantee
✅ **Cost Effective**: Pay only for what you use
✅ **No Infrastructure**: No databases to manage

## Upgrading to Database (Optional)

While Vercel Blob is perfect for most use cases, you can upgrade to a traditional database for advanced features:

### Option 1: Vercel Postgres

1. Install the Vercel Postgres SDK:
```bash
npm install @vercel/postgres
```

2. Create a database table:
```sql
CREATE TABLE waitlist (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  company VARCHAR(200),
  role VARCHAR(50),
  submitted_at TIMESTAMP DEFAULT NOW(),
  ip_address INET
);
```

3. Update `/pages/api/waitlist.js` to use SQL queries

### Option 2: External Database

Connect to any external database like:
- PostgreSQL (Supabase, PlanetScale)
- MongoDB (MongoDB Atlas)
- MySQL (PlanetScale)

## Environment Variables

For production, these are the recommended environment variables:

```env
# Required: Vercel Blob storage token
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxxx

# Optional: Custom admin password (more secure than hardcoded)
ADMIN_PASSWORD=your-secure-password

# Optional: Rate limiting settings
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=3
```

## Monitoring & Analytics

### Built-in Features
- Real-time signup statistics
- Weekly signup tracking
- Role distribution analysis
- CSV export functionality

### Optional Integrations
Consider adding:
- Google Analytics events
- Mixpanel tracking
- PostHog analytics
- Custom webhook notifications

## Email Integration

To automatically send confirmation emails, integrate with:
- Resend (recommended for Vercel)
- SendGrid
- Mailgun
- AWS SES

Example integration in `/pages/api/waitlist.js`:
```javascript
// After successful signup
await sendConfirmationEmail(email, name);
```

## GDPR Compliance

For GDPR compliance:
1. Add privacy policy acceptance checkbox
2. Implement data deletion endpoint
3. Consider anonymizing IP addresses
4. Add cookie consent if needed

## Backup Strategy

Vercel Blob automatically handles:
- ✅ Data replication across regions
- ✅ Point-in-time recovery
- ✅ 99.9% durability guarantee

Additional recommendations:
- Regular CSV exports via admin dashboard
- Webhook notifications for important events
- External backup to secondary provider (optional)

## Cost Estimates

Vercel Blob pricing (as of 2024):
- **First 1GB**: Free
- **Additional storage**: $0.15/GB/month
- **Bandwidth**: $0.40/GB (first 100GB free)

For most waitlists, costs will be minimal (< $1/month).

## Troubleshooting

### Common Issues

**"Waitlist service is not properly configured"**
- Ensure `BLOB_READ_WRITE_TOKEN` is set in environment variables
- Check that the token has read/write permissions

**"Failed to save your information"**
- Verify Vercel Blob quota isn't exceeded
- Check Vercel dashboard for storage issues

**Admin dashboard shows no data**
- Confirm blob exists by checking first signup
- Verify environment variables in production

### Getting Help

1. Check Vercel dashboard for storage status
2. Review Vercel function logs for errors
3. Test API endpoint directly: `POST /api/waitlist`

The system is designed to be production-ready with minimal setup while leveraging Vercel's reliable infrastructure! 🚀 