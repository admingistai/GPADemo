# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-06-16

### Added
- **Website Styling Extraction**: Automatic color and font detection
- **Dynamic Widget Styling**: Adapts to target website's design

### Changed
- **Widget Injection**: Improved reliability and cross-origin compatibility
- **Documentation**: Updated all guides

### Fixed
- Widget script loading issues with defer attribute
- Cross-origin script injection reliability
- Cache busting problems with relative URLs

## [1.0.0] - 2025-06-16

### Added
- Core proxy functionality for website replication
- Automatic JavaScript injection (widget.js)
- Comprehensive URL validation and security checks
- Rate limiting to prevent abuse
- Beautiful, responsive UI with React components
- Error handling with user-friendly messages
- Performance monitoring utilities
- Health check endpoint for monitoring
- Docker support for containerized deployment
- Nginx configuration example for production
- Comprehensive test suite
- Full API documentation
- Security policy and contributing guidelines

### Features
- **URL Replication**: 1:1 website copying with automatic URL rewriting
- **Script Injection**: Automatic injection of custom widget.js into all HTML pages
- **Security**: Blocks local/private IPs, validates URLs, strips dangerous headers
- **Performance**: Streaming responses, efficient memory usage, request timeouts
- **Error Handling**: Graceful error handling with helpful user messages
- **Rate Limiting**: Configurable per-IP rate limiting
- **Monitoring**: Built-in performance tracking and health checks
- **Deployment**: Optimized for Vercel with serverless functions
- **Documentation**: Complete setup, API, and deployment guides

### Technical Details
- Built with Next.js 14.1.0 and React 18.2.0
- Serverless architecture using Vercel Functions
- Axios for HTTP requests
- Cheerio for HTML parsing and modification
- Comprehensive input validation with validator.js
- Jest and React Testing Library for tests
- ESLint for code quality
- Docker support for self-hosting

### Security Measures
- Input validation for all URLs
- Protection against SSRF attacks
- Rate limiting to prevent abuse
- Header sanitization
- XSS prevention
- No data persistence

### Known Limitations
- Maximum response size: 50MB
- Request timeout: 30 seconds
- Form submissions have limited functionality
- Authentication-protected pages not supported
- Some JavaScript-heavy SPAs may not work perfectly

## Version History

### Pre-release Development
- 2025-06-15: Initial project structure
- 2025-06-16: Core functionality implementation
- 2025-06-16: Security hardening and testing
- 2025-06-16: Documentation and deployment guides

---

For detailed release notes, see the [GitHub Releases](https://github.com/your-org/gpa/releases) page.