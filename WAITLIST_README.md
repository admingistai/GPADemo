# Waitlist Feature Documentation

This project now includes a complete waitlist system for collecting email addresses and names from potential users.

## Features

- 📝 **Form Collection**: Collects name, email, company, and role information
- ✅ **Validation**: Server-side validation with proper error handling
- 🚦 **Rate Limiting**: Prevents spam with IP-based rate limiting (3 submissions per 15 minutes)
- 📊 **Admin Dashboard**: View and manage waitlist entries with search, sort, and export
- 🎨 **Responsive Design**: Beautiful UI that matches your existing brand
- 💾 **File Storage**: Currently uses JSON file storage (easily upgradeable)

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

data/                   # Auto-created for storing waitlist data
  waitlist.json         # JSON database file
```

## Admin Access

The admin dashboard is protected by a simple password. Currently set to:
- **Password**: `gist2024admin`

⚠️ **Important**: Change this password in `/pages/admin/waitlist.js` before going live!

## Data Storage

Currently uses a simple JSON file at `/data/waitlist.json`. Each entry contains:

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

## Upgrading to Production Database

For production use, consider upgrading to a proper database. Here are options:

### Option 1: Vercel Postgres (Recommended)

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

3. Update `/pages/api/waitlist.js` to use Postgres instead of file storage

### Option 2: Vercel KV (Redis)

1. Install the Vercel KV SDK:
```bash
npm install @vercel/kv
```

2. Update the API to use Redis for storage

### Option 3: External Database

Connect to any external database like:
- PostgreSQL (Supabase, PlanetScale)
- MongoDB (MongoDB Atlas)
- MySQL (PlanetScale)

## Environment Variables

For production, add these to your `.env.local`:

```
# Database connection (if using external DB)
DATABASE_URL="your-database-connection-string"

# Admin password (more secure)
ADMIN_PASSWORD="your-secure-password"

# Rate limiting settings
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=3
```

## Analytics Integration

Consider adding analytics to track:
- Conversion rates from landing page to waitlist
- Most common user roles
- Geographic distribution
- Time-based signup patterns

Example integration points:
- Google Analytics events
- Mixpanel tracking
- PostHog analytics

## Email Integration

To automatically send confirmation emails, integrate with:
- Resend
- SendGrid
- Mailgun
- AWS SES

## GDPR Compliance

The current implementation stores IP addresses. For GDPR compliance:
1. Add privacy policy acceptance checkbox
2. Implement data deletion endpoint
3. Anonymize or remove IP addresses
4. Add cookie consent if needed

## Backup Strategy

Current file-based storage should be backed up regularly. Consider:
- Daily automated backups
- Version control for the data directory (excluded by default)
- Export functionality in admin dashboard

## Monitoring

Set up monitoring for:
- API endpoint availability
- Form submission success rates
- Storage capacity
- Rate limiting effectiveness

The system is designed to be simple and functional while being easily upgradeable as your needs grow! 