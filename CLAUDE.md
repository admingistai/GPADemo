# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14.2 application that provides an AI-powered reader engagement platform called "Ask Anything™". The main product is an embeddable chat widget that publishers can add to their websites, allowing readers to ask questions about the content and receive AI-powered answers.

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run ESLint
npm run lint

# Run tests
npm run test

# Run tests in watch mode
npm run test:watch
```

## Architecture

### Core Structure
- **pages/index.js**: Main landing page (2600+ lines) - contains the entire homepage implementation
- **pages/api/**: Serverless API endpoints
  - `proxy.js`: Clones websites and injects the widget
  - `chat.js`: OpenAI chat endpoint
  - `tts.js`: Text-to-speech using ElevenLabs
- **public/widget.js**: V1 stable widget (production)
- **public/widget-v2.js**: V2 beta widget with enhanced features

### Widget System
The project provides two widget versions:
1. **V1 (Stable)**: Basic chat functionality with website content analysis
2. **V2 (Beta)**: Enhanced features including audio responses, customizable position, and improved UI

Both widgets are standalone JavaScript files that can be embedded via script tags.

### Testing
- Framework: Jest with React Testing Library
- Run a single test: `npm test -- path/to/test.js`
- Test coverage includes components, pages, and utilities
- Tests are located in `__tests__/` with subdirectories for components and utils

### Key Technologies
- **Frontend**: React 18.2, Next.js 14.2, GSAP for animations
- **AI Integration**: OpenAI API for chat, ElevenLabs for TTS
- **Security**: DOMPurify for XSS prevention, express-rate-limit for API protection
- **Styling**: CSS-in-JS with styled-jsx

### Important Implementation Details
1. The proxy endpoint (`/api/proxy`) clones target websites and injects the widget script
2. Rate limiting is implemented on all API endpoints
3. ESLint is currently disabled during builds (`ignoreDuringBuilds: true`)
4. The project uses Vercel for deployment with specific function configurations
5. CORS is configured to allow widget distribution across domains

### Environment Variables
Key environment variables needed:
- `OPENAI_API_KEY`: For chat functionality
- `ELEVENLABS_API_KEY`: For text-to-speech
- `NODE_ENV`: Development/production mode
- Rate limiting configurations

### Security Considerations
- All user inputs are sanitized using DOMPurify
- Rate limiting prevents API abuse
- CORS headers are properly configured
- Security headers (HSTS, X-Content-Type-Options) are set in vercel.json