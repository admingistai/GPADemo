# Ask Anything™ Project Context

## Project Overview
This is **Ask Anything™**, an AI-powered reader engagement platform built with Next.js. The main product is a widget that websites can embed to let visitors ask questions and get AI-generated answers without leaving the page. The goal is to reduce bounce rates and increase engagement by keeping users on the original website instead of going to ChatGPT or Google.

## Core Business Model
- Publishers embed the Ask Anything™ widget on their websites
- Visitors can ask questions directly on the page and get instant AI answers
- This keeps readers engaged on the original site rather than leaving to search elsewhere
- The platform claims to reduce bounce rates by 47% and increase engagement by 89%

## Technical Architecture

### Frontend (Next.js)
- **Main Landing Page**: `pages/index.js` (2640+ lines) - Comprehensive marketing site
- **Components**: Modular React components in `/components/`
- **Styling**: CSS-in-JS with styled-jsx for component-scoped styles
- **Responsive Design**: Mobile-first approach with extensive media queries

### Widget System (Two Versions)
1. **V1 Widget** (`/public/widget.js`): Classic stable version
2. **V2 Widget** (`/public/widget-v2.js`): Beta search-first version with enhanced UI

**Widget Features**:
- Configurable positioning (left, center, right)
- Real-time preview system in landing page
- Embeddable on any website via script tag
- AI-powered question answering

### API Layer (`/pages/api/`)
- **`proxy.js`**: Core functionality - proxies websites and injects widget
- **`chat.js`**: Handles AI chat interactions
- **`generate-audio.js`**: Text-to-speech functionality
- **`generate-image.js`**: AI image generation
- **`tts.js`**: Text-to-speech API
- **`health.js`**: System health checks
- **Utilities**: Error logging, rate limiting, HTML modification, header processing

### Demo System
The platform includes a sophisticated demo system:
- Users can input any URL (defaults to theatlantic.com)
- System proxies the target website through `/api/proxy`
- Injects the Ask Anything™ widget into the proxied page
- Opens in new tab so users can interact with live widget
- Includes preset demo links for different site types (news, portfolio, climate)

## Key Features

### Landing Page Sections
1. **Hero Section**: Video demo, main CTA
2. **Trust Section**: Publisher/media company logos
3. **Benefits Grid**: 3 key value propositions (engagement, growth, cost)
4. **Interactive Demo**: URL input + live widget preview
5. **Dashboard Preview**: Tabbed analytics/insights mockup
6. **Case Studies**: TechCrunch example
7. **Retention Analytics**: Before/after engagement data visualization
8. **Customization Options**: "Make it yours" section
9. **Final CTA**: Get started button

### Widget Customization
- **Position Control**: Center (default), left side, right side
- **Version Selection**: V1 (stable) vs V2 (beta)
- **Live Preview**: Shows widget positioning in browser mockup
- **Real-time Updates**: Widget preview updates as user changes settings

### Special Features
- **Easter Egg**: Clickable Gist logo that spins and shows "Remix activated!" popup
- **Smooth Animations**: CSS animations for engagement metrics, logo interactions
- **Error Handling**: Graceful error display for demo failures
- **Loading States**: Visual feedback during demo loading

## File Structure Context

### Components (`/components/`)
- `Headline.tsx`: Main hero title component
- `YouTubeEmbed.tsx`: Embedded video player
- `URLInputForm.jsx`: Demo URL input (with tests)
- `WebsiteDisplay.jsx`: Website preview component
- `ErrorDisplay.jsx`: Error handling component

### Styling Approach
- **CSS-in-JS**: All styles are embedded in components using styled-jsx
- **No External CSS Framework**: Custom styling throughout
- **Dark Theme**: Black/dark background with white text and purple/blue accents
- **Responsive**: Extensive mobile optimizations
- **Animations**: CSS keyframes for hover effects, loading states, popups

### State Management
- React hooks (useState, useEffect) for local state
- No external state management library
- Key state variables:
  - `activeTab`: Dashboard tab switching
  - `widgetPosition`: Widget placement (center/left/right)  
  - `widgetVersion`: V1 vs V2 selection
  - `demoLoading`: Demo loading state
  - `demoError`: Error message display

### API Integration
- Fetch-based API calls to internal endpoints
- Error handling with user-friendly messages
- Loading states for better UX
- Proxy system for cross-origin website embedding

## Dependencies & Setup
- **Next.js**: React framework with SSR/SSG
- **React**: UI library with hooks
- **Jest**: Testing framework (test files in `__tests__/`)
- **Docker**: Containerization support (Dockerfile.txt, docker-compose.yml)
- **Vercel**: Deployment configuration (vercel.json)
- **Node.js**: Runtime environment

## Key User Flows

### Demo Flow
1. User enters URL or clicks preset demo link
2. System validates and formats URL
3. Proxy API fetches target website
4. Widget gets injected based on selected position/version
5. Modified page opens in new tab
6. User can interact with live Ask Anything™ widget

### Widget Integration Flow (for Publishers)
1. Publishers get embed code from platform
2. Add script tag to their website
3. Widget appears based on configuration
4. Visitors can ask questions and get AI answers
5. Analytics/engagement data flows back to dashboard

## Performance & SEO
- Server-side rendering with Next.js
- Optimized images with Next.js Image component
- Minimal JavaScript for fast loading
- SEO-optimized meta tags and structure

This project represents a complete SaaS marketing site with integrated demo functionality, widget preview system, and comprehensive user experience design focused on converting visitors into customers for the Ask Anything™ platform. 