# Specification: Fear & Greed Index macOS Menubar App

## Goal
Create a lightweight macOS menubar application that provides instant access to the CNN Business Fear & Greed Index without requiring browser navigation, utilizing an Electron frontend with a FastAPI backend for data scraping.

## User Stories
- As an investor, I want to see the current market sentiment value in my menubar so that I can quickly assess market conditions without interrupting my workflow
- As a trader, I want to view historical comparison data (previous close, 1 week/month/year ago) so that I can understand sentiment trends over time

## Specific Requirements

### SR-01: Electron Menubar Application Architecture
- Use Electron framework to create native macOS menubar app with tray icon integration
- Implement menubar-specific Electron APIs (Tray, Menu, BrowserWindow) for dropdown behavior
- Configure app to run as agent app (LSUIElement=1 in Info.plist) without dock icon
- Support macOS 12+ with universal binary build (x64 and arm64)
- Implement single-instance lock to prevent multiple app instances
- Use electron-builder for packaging and distribution with code signing
- Keep renderer process minimal to reduce memory footprint (target <100MB)
- Implement IPC (Inter-Process Communication) between main and renderer for secure data flow

### SR-02: FastAPI Backend Data Scraping Service
- Build standalone FastAPI service that scrapes CNN Fear & Greed Index page at configurable intervals
- Use BeautifulSoup4 or Playwright for robust HTML parsing with fallback mechanisms
- Implement in-memory caching (Redis optional) with TTL for scraped data
- Expose single REST endpoint `/api/v1/fear-greed` returning JSON with current and historical values
- Include data validation to ensure scraped values are within expected ranges (0-100)
- Add health check endpoint `/health` for monitoring service availability
- Use asyncio for non-blocking scraping operations
- Implement rate limiting to avoid overwhelming CNN servers

### SR-03: Menubar UI Display with Dynamic Status Indicators
- Display numeric index value in menubar with emoji or color-coded icon prefix
- Color scheme: Red (0-25 Extreme Fear), Orange (26-45 Fear), Gray (46-55 Neutral), Light Green (56-75 Greed), Green (76-100 Extreme Greed)
- Text format in menubar: "[icon] [value]" (e.g., "📉 25" or "📈 85")
- Update menubar text and icon color dynamically when new data arrives
- Support both light and dark mode with appropriate color contrast
- Use Template Images for tray icons to ensure proper rendering in both modes
- Menubar text should be concise (max 10 characters) to avoid truncation

### SR-04: Dropdown Menu with Semi-Circular Gauge Visualization
- Create HTML/CSS canvas-based semi-circular gauge matching CNN website design
- Gauge should display 180-degree arc with color gradient (red to green)
- Animate needle position to current index value on dropdown open
- Render gauge as high-DPI image for Retina display support
- Dropdown window size: 320px width x 480px height (fixed, non-resizable)
- Position dropdown below menubar icon aligned to right edge
- Implement proper window focus/blur behavior for macOS menubar conventions

### SR-05: Historical Data Comparison Display
- Display four historical comparison points in clean list format with labels
- Format: "Previous Close: 72 (Greed)" with status label in parentheses
- Include all five time periods: Now, Previous Close, 1 Week Ago, 1 Month Ago, 1 Year Ago
- Use consistent typography and spacing for visual hierarchy
- Add subtle divider lines between sections for clarity
- Status labels should match color scheme from menubar (red/orange/gray/green)

### SR-06: Automatic and Manual Data Refresh
- Fetch data from backend API on app launch with loading state
- Auto-refresh every 60 minutes (configurable) using Electron's setInterval
- Provide manual "Refresh" button in dropdown with loading spinner during fetch
- Disable refresh button during active fetch to prevent concurrent requests
- Display "Last Updated" timestamp in local timezone (format: "YYYY-MM-DD HH:mm z")
- Show error state with retry option if API request fails
- Implement exponential backoff for failed requests (1s, 2s, 4s, max 30s)

### SR-07: App Settings and System Integration
- "Launch at Login" toggle using Electron's app.setLoginItemSettings()
- Persist settings in JSON file at ~/Library/Application Support/FGTicker/settings.json
- "Quit" button that gracefully closes app and cleans up resources
- Include "About" section with app version and data attribution
- Link to CNN source page with system default browser open
- Support keyboard shortcuts: Cmd+Q (quit), Cmd+R (refresh)

### SR-08: API Contract and Data Models
- Backend API endpoint: `GET /api/v1/fear-greed`
- Response schema:
  ```json
  {
    "current": {
      "value": 75,
      "status": "Extreme Greed",
      "timestamp": "2025-11-07T14:00:00Z"
    },
    "historical": {
      "previous_close": {"value": 72, "status": "Greed"},
      "one_week_ago": {"value": 60, "status": "Greed"},
      "one_month_ago": {"value": 30, "status": "Fear"},
      "one_year_ago": {"value": 45, "status": "Fear"}
    },
    "source_url": "https://edition.cnn.com/markets/fear-and-greed",
    "last_scraped": "2025-11-07T14:00:00Z"
  }
  ```
- Include HTTP status codes: 200 (success), 500 (scraping error), 503 (service unavailable)
- Set CORS headers to allow Electron app origin

### SR-09: Error Handling and Offline Support
- Cache last successful API response in localStorage for offline access
- Display cached data with visual indicator when API is unreachable
- Show user-friendly error messages: "Unable to connect", "Data temporarily unavailable"
- Implement retry logic with exponential backoff for network failures
- Log errors to file for debugging (~/Library/Logs/FGTicker/error.log)
- Gracefully handle malformed API responses with fallback to cached data
- Add network status indicator in dropdown footer

### SR-10: Performance Optimization Strategies
- Lazy-load gauge rendering only when dropdown is opened
- Use CSS transforms for smooth animations (GPU-accelerated)
- Debounce window resize events (if resizing is later supported)
- Minimize main process blocking operations by using async APIs
- Preload script to securely expose IPC methods to renderer
- Use production build optimizations: minification, tree-shaking
- Implement request cancellation for in-flight API calls when app quits

## Out of Scope
- Detailed 7-indicator breakdown (Stock Price Momentum, Market Volatility, etc.)
- Push notifications for threshold alerts
- Historical trend charts or sparklines
- Multi-index support (Bitcoin Fear & Greed, etc.)
- User authentication or personalization features
- Mobile or Windows/Linux platform support
- Backend database persistence (cache-only for v1.0)
- Real-time WebSocket updates
- Customizable gauge themes or colors
- Export data to CSV/Excel functionality
