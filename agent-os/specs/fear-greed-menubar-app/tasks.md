# Task Breakdown: Fear & Greed Index macOS Menubar App

## Overview
**Total Task Groups**: 8
**Estimated Timeline**: 4-6 weeks
**Target Platform**: macOS 12+ (Universal Binary)

## Task List

### Phase 1: Project Setup & Architecture

#### Task Group 1.1: Backend Project Initialization
**Dependencies:** None
**Priority:** P1 (Must Have)
**Complexity:** Small

- [x] 1.1.1 Initialize FastAPI project structure
  - Create project directory: `backend/`
  - Set up Python virtual environment (Python 3.10+)
  - Create `requirements.txt` with dependencies: fastapi, uvicorn, beautifulsoup4, httpx, pydantic, python-dotenv
  - Initialize git repository with `.gitignore` for Python

- [x] 1.1.2 Create FastAPI application scaffold
  - Create `main.py` with FastAPI app instance
  - Configure CORS middleware for Electron app origin
  - Set up basic logging configuration
  - Create directory structure: `api/`, `scrapers/`, `models/`, `utils/`, `tests/`

- [x] 1.1.3 Write basic tests for API setup
  - Test FastAPI app initialization
  - Test CORS configuration
  - Test health check endpoint
  - Run tests to verify backend scaffold works

**Acceptance Criteria:**
- FastAPI server starts successfully on `http://localhost:8000`
- Health check endpoint returns 200 status
- Basic tests pass

---

#### Task Group 1.2: Frontend Project Initialization
**Dependencies:** None
**Priority:** P1 (Must Have)
**Complexity:** Small

- [x] 1.2.1 Initialize Electron project structure
  - Create project directory: `frontend/`
  - Run `npm init` with Electron boilerplate
  - Install core dependencies: electron, electron-builder, electron-store
  - Create directory structure: `src/main/`, `src/renderer/`, `src/preload/`, `assets/`, `tests/`

- [x] 1.2.2 Configure Electron for menubar app
  - Set up main process (`main.js`) with Tray and Menu imports
  - Configure app as agent app (LSUIElement=1 in Info.plist)
  - Implement single-instance lock
  - Set up IPC communication channels
  - Create preload script for secure renderer-main communication

- [x] 1.2.3 Configure electron-builder
  - Create `electron-builder.yml` config file
  - Configure macOS build target (universal binary: x64 + arm64)
  - Set up app icon and tray icon assets structure
  - Configure code signing placeholders (will be filled later)

- [x] 1.2.4 Write basic Electron tests
  - Test app launches without errors
  - Test single-instance lock prevents multiple instances
  - Test IPC communication works
  - Run tests to verify frontend scaffold works

**Acceptance Criteria:**
- Electron app launches as menubar-only app (no dock icon)
- Single instance enforcement works
- IPC communication established
- Basic tests pass

---

### Phase 2: Backend API Development

#### Task Group 2.1: CNN Fear & Greed Index Scraper
**Dependencies:** Task Group 1.1
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [x] 2.1.1 Write 2-8 focused tests for scraper functionality
  - Test HTML parsing extracts correct values
  - Test data validation for range (0-100)
  - Test error handling for malformed HTML
  - Test fallback mechanism for parsing failures

- [x] 2.1.2 Implement CNN page scraper
  - Create `scrapers/cnn_scraper.py`
  - Use httpx for async HTTP requests to `https://edition.cnn.com/markets/fear-and-greed`
  - Parse HTML with BeautifulSoup4 to extract:
    - Current index value
    - Current status label (Extreme Fear, Fear, Neutral, Greed, Extreme Greed)
    - Historical values (Previous Close, 1 Week, 1 Month, 1 Year)
  - Reference CNN's HTML structure for selectors

- [x] 2.1.3 Add data validation
  - Validate index values are integers between 0-100
  - Validate status labels match expected values
  - Validate timestamp format
  - Raise validation errors for out-of-range or malformed data

- [x] 2.1.4 Implement fallback scraping strategy
  - Add Playwright as optional dependency for JavaScript-rendered content
  - Create fallback scraper if BeautifulSoup fails
  - Log which scraping method was used

- [x] 2.1.5 Run scraper-specific tests
  - Run only the 2-8 tests written in 2.1.1
  - Verify scraper extracts data correctly
  - Verify validation catches bad data
  - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Scraper successfully extracts all required data from CNN page
- Data validation prevents invalid values from being returned
- Tests written in 2.1.1 pass
- Fallback mechanism activates on primary scraper failure

---

#### Task Group 2.2: API Endpoints & Caching
**Dependencies:** Task Group 2.1
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [x] 2.2.1 Write 2-8 focused tests for API endpoints
  - Test `/api/v1/fear-greed` returns correct JSON schema
  - Test caching returns cached data within TTL
  - Test health check endpoint returns service status
  - Test CORS headers are set correctly

- [x] 2.2.2 Create Pydantic data models
  - Create `models/fear_greed.py`
  - Define `CurrentValue` model (value, status, timestamp)
  - Define `HistoricalValue` model (value, status)
  - Define `FearGreedResponse` model matching SR-08 schema

- [x] 2.2.3 Implement in-memory caching
  - Create `utils/cache.py`
  - Use Python dict with TTL for cached data (configurable, default 30 minutes)
  - Add cache invalidation method
  - Add cache hit/miss logging

- [x] 2.2.4 Build `/api/v1/fear-greed` endpoint
  - Create `api/fear_greed.py` router
  - Check cache first, return if valid
  - If cache miss or expired, call scraper
  - Cache successful scrape result
  - Return JSON response matching SR-08 schema
  - Include proper HTTP status codes (200, 500, 503)

- [x] 2.2.5 Add health check endpoint
  - Create `/health` endpoint in `main.py`
  - Return service status, last scrape time, cache status
  - Include uptime and version info

- [x] 2.2.6 Implement rate limiting
  - Add rate limiting middleware to prevent excessive scraping
  - Configure limits: max 1 scrape per 5 minutes per IP
  - Return 429 status code when rate limit exceeded

- [x] 2.2.7 Run API endpoint tests
  - Run only the 2-8 tests written in 2.2.1
  - Verify endpoints return correct data
  - Verify caching works as expected
  - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- `/api/v1/fear-greed` endpoint returns correct JSON schema
- Caching reduces scraping frequency
- Health check endpoint is operational
- Rate limiting prevents abuse
- Tests written in 2.2.1 pass

---

#### Task Group 2.3: Error Handling & Logging
**Dependencies:** Task Group 2.2
**Priority:** P1 (Must Have)
**Complexity:** Small

- [x] 2.3.1 Implement comprehensive error handling
  - Add try-catch blocks in scraper for network failures
  - Add try-catch blocks in API endpoints for unexpected errors
  - Return appropriate HTTP status codes with error messages
  - Log all errors with stack traces

- [x] 2.3.2 Set up structured logging
  - Configure Python logging to file: `logs/backend.log`
  - Add log rotation (max 10MB per file, keep 5 files)
  - Log levels: INFO for normal ops, ERROR for failures
  - Include timestamps, request IDs, and context in logs

- [x] 2.3.3 Add exponential backoff for retries
  - Implement retry logic for failed scraping attempts
  - Use exponential backoff: 1s, 2s, 4s, 8s (max 30s)
  - Max 3 retry attempts before giving up
  - Log retry attempts

**Acceptance Criteria:**
- API gracefully handles scraping failures
- Errors are logged to file with sufficient detail
- Retry logic prevents immediate repeated failures

---

### Phase 3: Frontend UI Components

#### Task Group 3.1: Menubar Tray Icon & Display
**Dependencies:** Task Group 1.2
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [x] 3.1.1 Write 2-8 focused tests for tray functionality
  - Test tray icon updates with new data
  - Test color coding matches index value
  - Test template images render in light/dark mode
  - Test menubar text truncation behavior

- [x] 3.1.2 Create tray icon assets
  - Design template images for macOS (16x16, 32x32 PNG)
  - Create icons for each status: Fear (red), Neutral (gray), Greed (green)
  - Export as Template Images (black with transparency)
  - Save in `assets/icons/` directory

- [x] 3.1.3 Implement tray icon manager
  - Create `src/main/tray.js`
  - Initialize Tray with default icon
  - Implement `updateTrayIcon(value, status)` method
  - Map value ranges to colors (SR-03 color scheme):
    - 0-25: Red (Extreme Fear)
    - 26-45: Orange (Fear)
    - 46-55: Gray (Neutral)
    - 56-75: Light Green (Greed)
    - 76-100: Green (Extreme Greed)

- [x] 3.1.4 Implement menubar text display
  - Update tray title with format: `[emoji] [value]`
  - Use emoji indicators: 📉 (Fear), ➡️ (Neutral), 📈 (Greed)
  - Ensure text is max 10 characters to prevent truncation
  - Update dynamically when new data arrives

- [x] 3.1.5 Support light/dark mode
  - Use Template Images API for automatic color adaptation
  - Test appearance in both light and dark mode
  - Ensure proper contrast in all modes

- [x] 3.1.6 Run tray functionality tests
  - Run only the 2-8 tests written in 3.1.1
  - Verify icon updates correctly
  - Verify color coding works
  - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Tray icon displays in menubar
- Icon and text update dynamically with data
- Colors match specification color scheme
- Works correctly in light and dark mode
- Tests written in 3.1.1 pass

---

#### Task Group 3.2: Dropdown Window UI
**Dependencies:** Task Group 3.1
**Priority:** P1 (Must Have)
**Complexity:** Large

- [x] 3.2.1 Write 2-8 focused tests for dropdown UI
  - Test dropdown window opens on tray click
  - Test window positioning below menubar icon
  - Test window dimensions (320x480)
  - Test focus/blur behavior

- [x] 3.2.2 Create HTML structure for dropdown
  - Create `src/renderer/index.html`
  - Structure sections: gauge, current value, historical data, settings, footer
  - Use semantic HTML tags
  - Include CSS framework or custom styles setup

- [x] 3.2.3 Implement CSS styling
  - Create `src/renderer/styles.css`
  - Style for macOS native appearance
  - Use system fonts (San Francisco)
  - Implement responsive spacing and typography
  - Support light/dark mode using CSS variables
  - Add divider lines between sections

- [x] 3.2.4 Build dropdown window manager
  - Create `src/main/window.js`
  - Create BrowserWindow with dimensions: 320x480
  - Configure window: frameless, non-resizable, always-on-top
  - Position window below tray icon, right-aligned
  - Implement show/hide toggle on tray click
  - Handle focus loss to auto-hide dropdown

- [x] 3.2.5 Implement window positioning logic
  - Calculate tray icon position using Tray.getBounds()
  - Calculate screen dimensions to prevent off-screen rendering
  - Position dropdown at right edge of tray icon
  - Adjust for multiple displays

- [x] 3.2.6 Run dropdown UI tests
  - Run only the 2-8 tests written in 3.2.1
  - Verify window opens/closes correctly
  - Verify positioning works
  - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Dropdown window opens on tray icon click
- Window is positioned correctly below menubar icon
- Fixed size: 320px x 480px
- Focus behavior matches macOS conventions
- Tests written in 3.2.1 pass

---

#### Task Group 3.3: Semi-Circular Gauge Visualization
**Dependencies:** Task Group 3.2
**Priority:** P1 (Must Have)
**Complexity:** Large

- [x] 3.3.1 Write 2-8 focused tests for gauge rendering
  - Test gauge renders correctly with value
  - Test needle animation works
  - Test color gradient displays properly
  - Test Retina display rendering

- [x] 3.3.2 Research CNN gauge design
  - Inspect CNN Fear & Greed page for gauge appearance
  - Document color gradient stops
  - Document needle styling and animation
  - Note arc dimensions and proportions

- [x] 3.3.3 Implement HTML5 Canvas gauge
  - Create `src/renderer/gauge.js`
  - Draw 180-degree arc with Canvas API
  - Implement color gradient (red to green) across arc
  - Draw tick marks and labels (0, 50, 100)
  - Draw needle pointing to current value

- [x] 3.3.4 Add needle animation
  - Implement smooth needle rotation using requestAnimationFrame
  - Animate from 0 to target value on dropdown open
  - Duration: 1 second with easing function
  - Store last position to animate from previous value on update

- [x] 3.3.5 Optimize for Retina displays
  - Scale canvas for high DPI (devicePixelRatio)
  - Use 2x resolution for crisp rendering
  - Test on Retina display to verify clarity

- [x] 3.3.6 Implement lazy loading
  - Only render gauge when dropdown window opens
  - Clear canvas when dropdown closes to save resources
  - Re-render with animation on subsequent opens

- [x] 3.3.7 Run gauge rendering tests
  - Run only the 2-8 tests written in 3.3.1
  - Verify gauge renders correctly
  - Verify animation works smoothly
  - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- Gauge displays 180-degree arc with color gradient
- Needle animates smoothly to current value
- Rendering is crisp on Retina displays
- Lazy loading reduces resource usage
- Tests written in 3.3.1 pass

---

#### Task Group 3.4: Current & Historical Data Display
**Dependencies:** Task Group 3.2
**Priority:** P1 (Must Have)
**Complexity:** Small

- [x] 3.4.1 Display current index value
  - Create section in HTML: "Current Index: [value] ([status])"
  - Use large font size for value (24px)
  - Apply color coding based on status
  - Update dynamically when new data arrives

- [x] 3.4.2 Display historical data list
  - Create unordered list with 4 items:
    - Previous Close: [value] ([status])
    - 1 Week Ago: [value] ([status])
    - 1 Month Ago: [value] ([status])
    - 1 Year Ago: [value] ([status])
  - Use consistent typography (14px)
  - Apply color coding to status labels
  - Add subtle hover states for list items

- [x] 3.4.3 Implement data rendering logic
  - Create `src/renderer/renderer.js`
  - Implement `updateUI(data)` function to populate all fields
  - Parse API response and extract values
  - Handle missing historical data gracefully (display "N/A")

**Acceptance Criteria:**
- Current value displayed prominently with correct styling
- Historical data list shows all 4 time periods
- Color coding matches specification
- UI updates when new data arrives

---

#### Task Group 3.5: Settings & Footer UI
**Dependencies:** Task Group 3.2
**Priority:** P1 (Must Have)
**Complexity:** Small

- [x] 3.5.1 Implement "Launch at Login" toggle
  - Create checkbox in HTML
  - Use electron-store to persist setting
  - Implement IPC handler in main process to update login item
  - Use `app.setLoginItemSettings()` API
  - Reflect current state on dropdown open

- [x] 3.5.2 Add Refresh button
  - Create button in HTML: "Refresh"
  - Add loading spinner (CSS animation or icon)
  - Disable button during active refresh
  - Trigger IPC message to fetch new data
  - Update UI with loading state

- [x] 3.5.3 Add Quit button
  - Create button in HTML: "Quit"
  - Trigger IPC message to quit app
  - Implement graceful shutdown in main process
  - Clean up resources (close windows, stop timers)

- [x] 3.5.4 Display attribution and link
  - Add footer text: "Data from CNN Business"
  - Add link to CNN source page (opens in default browser)
  - Use `shell.openExternal()` for external link
  - Style as subtle, secondary text

- [x] 3.5.5 Display Last Updated timestamp
  - Parse timestamp from API response
  - Format in local timezone: "YYYY-MM-DD HH:mm z"
  - Display above footer
  - Update when new data arrives

- [x] 3.5.6 Add About section
  - Create About modal or section with app version
  - Include attribution: "Data from CNN Business"
  - Add app version from package.json
  - Optionally add GitHub link or credits

**Acceptance Criteria:**
- "Launch at Login" setting persists across app restarts
- Refresh button triggers data fetch with loading state
- Quit button closes app gracefully
- Footer displays attribution and Last Updated timestamp
- About section shows app version

---

### Phase 4: Data Integration & IPC

#### Task Group 4.1: API Client & Data Fetching
**Dependencies:** Task Group 2.2, Task Group 3.4
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [x] 4.1.1 Write 2-8 focused tests for API client
  - Test successful API call returns correct data
  - Test network error handling
  - Test timeout handling
  - Test response parsing

- [x] 4.1.2 Implement API client in main process
  - Create `src/main/api-client.js`
  - Use native fetch or axios to call backend API
  - Implement `fetchFearGreedData()` function
  - Set timeout: 10 seconds
  - Parse JSON response
  - Return data or throw error

- [x] 4.1.3 Handle API errors
  - Catch network errors (offline, timeout)
  - Catch parsing errors (malformed JSON)
  - Log errors to file
  - Return error status to renderer

- [x] 4.1.4 Implement exponential backoff for retries
  - Retry failed requests: 1s, 2s, 4s (max 3 attempts)
  - Use exponential backoff algorithm
  - Log retry attempts
  - Give up after max retries and return cached data

- [x] 4.1.5 Run API client tests
  - Run only the 2-8 tests written in 4.1.1
  - Verify API calls work correctly
  - Verify error handling is robust
  - Do NOT run entire test suite at this stage

**Acceptance Criteria:**
- API client successfully fetches data from backend
- Error handling prevents crashes
- Retry logic handles transient failures
- Tests written in 4.1.1 pass

---

#### Task Group 4.2: IPC Communication Setup
**Dependencies:** Task Group 4.1
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [x] 4.2.1 Define IPC channels
  - Document IPC message types:
    - `fetch-data` (renderer → main): Request data fetch
    - `data-updated` (main → renderer): Send new data
    - `error-occurred` (main → renderer): Send error status
    - `set-launch-at-login` (renderer → main): Update login setting
    - `quit-app` (renderer → main): Quit application

- [x] 4.2.2 Implement IPC handlers in main process
  - Create `src/main/ipc-handlers.js`
  - Register handlers for each channel using `ipcMain.handle()`
  - Implement data fetch handler (calls API client)
  - Implement settings handler (updates electron-store)
  - Implement quit handler (app.quit())

- [x] 4.2.3 Expose IPC methods in preload script
  - Create `src/preload/preload.js`
  - Use `contextBridge.exposeInMainWorld()` to expose safe API
  - Expose methods: `fetchData()`, `setLaunchAtLogin()`, `quitApp()`
  - Expose listeners: `onDataUpdated()`, `onError()`

- [x] 4.2.4 Implement IPC calls in renderer
  - Update `src/renderer/renderer.js`
  - Call `window.api.fetchData()` on refresh button click
  - Listen for `onDataUpdated()` to update UI
  - Listen for `onError()` to display error message
  - Call `setLaunchAtLogin()` on checkbox change
  - Call `quitApp()` on quit button click

**Acceptance Criteria:**
- IPC communication works bidirectionally
- Renderer can request data from main process
- Main process sends updates to renderer
- Security is maintained through preload script

---

#### Task Group 4.3: Automatic & Manual Data Refresh
**Dependencies:** Task Group 4.2
**Priority:** P2 (High Priority)
**Complexity:** Small

- [x] 4.3.1 Implement initial data fetch
  - Fetch data from API on app launch
  - Display loading state in dropdown
  - Update UI with fetched data
  - Handle errors on initial fetch

- [x] 4.3.2 Set up automatic refresh interval
  - Use `setInterval()` in main process
  - Default interval: 60 minutes (configurable)
  - Fetch data every interval
  - Broadcast updates to renderer via IPC

- [x] 4.3.3 Implement manual refresh
  - Connect Refresh button to IPC fetch request
  - Show loading spinner during fetch
  - Disable button during active fetch
  - Re-enable after fetch completes (success or error)

- [x] 4.3.4 Add request cancellation
  - Implement AbortController for fetch requests
  - Cancel in-flight requests if app quits
  - Cancel in-flight requests if new manual refresh triggered

**Acceptance Criteria:**
- Data fetched automatically on app launch
- Automatic refresh runs every 60 minutes
- Manual refresh button triggers immediate fetch
- Loading states display correctly

---

### Phase 5: Offline Support & Error Handling

#### Task Group 5.1: Local Caching & Offline Mode
**Dependencies:** Task Group 4.3
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [x] 5.1.1 Implement localStorage caching
  - Use electron-store to persist last successful API response
  - Cache key: `lastFearGreedData`
  - Store full API response with timestamp
  - Update cache on every successful fetch

- [x] 5.1.2 Load cached data on startup
  - Check for cached data in electron-store
  - If present, display immediately while fetching fresh data
  - If absent, show loading state

- [x] 5.1.3 Implement offline mode indicator
  - Detect when API is unreachable (network error)
  - Display cached data with visual indicator: "⚠️ Offline - Showing Cached Data"
  - Add badge or color to menubar icon when offline
  - Show indicator in dropdown footer

- [x] 5.1.4 Handle stale cache
  - Add cache expiration check (e.g., 24 hours)
  - If cache too old, display warning: "Data may be outdated"
  - Attempt to refresh data in background

**Acceptance Criteria:**
- Last successful data cached locally
- Cached data displayed when API unavailable
- Offline indicator clearly visible to user
- Stale cache handled gracefully

---

#### Task Group 5.2: Error States & User Feedback
**Dependencies:** Task Group 5.1
**Priority:** P1 (Must Have)
**Complexity:** Small

- [x] 5.2.1 Design error messages
  - "Unable to connect to server" - Network error
  - "Data temporarily unavailable" - API error
  - "An unexpected error occurred" - Unknown error
  - Keep messages user-friendly and non-technical

- [x] 5.2.2 Implement error UI in dropdown
  - Add error banner at top of dropdown
  - Use warning color (yellow/orange)
  - Include retry button in error banner
  - Dismiss error banner on successful retry

- [x] 5.2.3 Update menubar icon for error state
  - Show "⚠️" icon when in error state
  - Use gray color to indicate issue
  - Revert to normal icon on successful data fetch

- [x] 5.2.4 Log errors to file
  - Create log directory: `~/Library/Logs/FGTicker/`
  - Write errors to `error.log` with timestamps
  - Include stack traces for debugging
  - Implement log rotation (max 5MB per file, keep 3 files)

**Acceptance Criteria:**
- Clear, user-friendly error messages displayed
- Error states visible in both menubar and dropdown
- Errors logged to file for debugging
- Users can retry after errors

---

### Phase 6: Performance Optimization

#### Task Group 6.1: Resource Optimization
**Dependencies:** Task Group 3.3, Task Group 4.3
**Priority:** P2 (High Priority)
**Complexity:** Medium

- [ ] 6.1.1 Implement lazy gauge rendering
  - Defer gauge rendering until dropdown opens
  - Clear canvas when dropdown closes
  - Use `requestIdleCallback()` for non-critical rendering

- [ ] 6.1.2 Optimize animations
  - Use CSS transforms for smooth animations (GPU-accelerated)
  - Use `will-change` property for animated elements
  - Limit animation frame rate to 60fps
  - Avoid layout thrashing (read-write batching)

- [ ] 6.1.3 Minimize main process blocking
  - Move API calls to async functions
  - Use promises for IPC responses
  - Avoid synchronous operations in main process
  - Use worker threads for CPU-intensive tasks (if needed)

- [ ] 6.1.4 Reduce memory footprint
  - Profile app memory usage with Chrome DevTools
  - Target: <100MB total memory usage
  - Remove unused dependencies
  - Optimize image assets (compress icons)

- [ ] 6.1.5 Implement request debouncing
  - Debounce rapid refresh button clicks
  - Prevent multiple simultaneous API requests
  - Use debounce for window resize events (if implemented)

**Acceptance Criteria:**
- App memory usage <100MB
- Smooth animations at 60fps
- No UI blocking during data fetches
- Resource usage monitored and optimized

---

### Phase 7: Build & Packaging

#### Task Group 7.1: Production Build Configuration
**Dependencies:** All previous task groups
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [ ] 7.1.1 Configure production build
  - Update `package.json` with build scripts
  - Configure webpack/bundler for production mode
  - Enable minification for JavaScript and CSS
  - Enable tree-shaking to remove unused code
  - Generate source maps for debugging

- [ ] 7.1.2 Optimize electron-builder config
  - Update `electron-builder.yml`
  - Configure macOS target: universal binary (x64 + arm64)
  - Set app category: "public.app-category.utilities"
  - Configure app entitlements for macOS sandbox (if needed)
  - Set minimum macOS version: 12.0

- [ ] 7.1.3 Create app icons
  - Design macOS app icon (1024x1024 PNG)
  - Generate icon set (.icns file) using iconutil
  - Add icon to `build/` directory
  - Reference in electron-builder config

- [ ] 7.1.4 Configure code signing
  - Obtain Apple Developer certificate
  - Add certificate to Keychain
  - Configure signing identity in electron-builder config
  - Enable hardened runtime
  - Configure entitlements for network access

- [ ] 7.1.5 Test production build locally
  - Run `npm run build` to create production build
  - Install generated .app bundle
  - Test all functionality in production build
  - Verify app runs without developer tools

**Acceptance Criteria:**
- Production build generates successfully
- Universal binary supports both Intel and Apple Silicon Macs
- App is code signed with valid certificate
- Production build functions identically to dev mode

---

#### Task Group 7.2: App Notarization & Distribution
**Dependencies:** Task Group 7.1
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [ ] 7.2.1 Notarize app with Apple
  - Upload app to Apple for notarization
  - Use `xcrun notarytool` or electron-notarize
  - Wait for notarization approval
  - Staple notarization ticket to app bundle

- [ ] 7.2.2 Create DMG installer
  - Configure electron-builder to generate DMG
  - Customize DMG appearance (background, icon placement)
  - Test DMG installation on clean macOS system

- [ ] 7.2.3 Create update mechanism setup
  - Configure electron-updater (optional for v1.0)
  - Set up update server or GitHub Releases
  - Implement auto-update check in app
  - Add "Check for Updates" menu item

- [ ] 7.2.4 Prepare distribution
  - Upload DMG to distribution platform (website, GitHub)
  - Create installation instructions
  - Write release notes with features and known issues

**Acceptance Criteria:**
- App is notarized and stapled
- DMG installer works on fresh macOS installation
- App can be distributed to users
- (Optional) Auto-update mechanism functional

---

### Phase 8: Testing & Quality Assurance

#### Task Group 8.1: Test Review & Gap Analysis
**Dependencies:** Task Groups 1-7 (all feature tests written)
**Priority:** P1 (Must Have)
**Complexity:** Medium

- [ ] 8.1.1 Review existing tests from all task groups
  - Review backend tests from Tasks 2.1.1, 2.2.1
  - Review frontend tests from Tasks 3.1.1, 3.2.1, 3.3.1
  - Review integration tests from Task 4.1.1
  - Total existing: approximately 8-32 tests

- [ ] 8.1.2 Analyze test coverage gaps for THIS feature only
  - Identify critical user workflows lacking test coverage
  - Focus ONLY on gaps related to Fear & Greed Index app requirements
  - Prioritize end-to-end workflows over unit test gaps
  - Document gaps: initial launch flow, error recovery, offline mode, settings persistence

- [ ] 8.1.3 Write up to 10 additional strategic tests maximum
  - E2E Test: Full app launch → data fetch → display in menubar → dropdown open → display data
  - E2E Test: Offline mode → cached data display → online recovery
  - Integration Test: Settings persistence across app restarts
  - Integration Test: Refresh button triggers data update
  - Integration Test: Error state → retry → success
  - E2E Test: Launch at login setting activation
  - Skip: Detailed performance tests, accessibility tests (unless business-critical for v1.0)

- [ ] 8.1.4 Run feature-specific tests only
  - Run ONLY tests related to Fear & Greed Index app feature
  - Expected total: approximately 18-42 tests maximum
  - Verify critical user workflows pass
  - Do NOT run unrelated application tests

**Acceptance Criteria:**
- All feature-specific tests pass (18-42 tests total)
- Critical user workflows covered by tests
- No more than 10 additional tests added in gap analysis
- Testing focused exclusively on this spec's feature requirements

---

#### Task Group 8.2: Manual Testing & User Acceptance
**Dependencies:** Task Group 8.1
**Priority:** P1 (Must Have)
**Complexity:** Small

- [ ] 8.2.1 Perform manual testing checklist
  - Test on Intel Mac (x64)
  - Test on Apple Silicon Mac (arm64)
  - Test on macOS 12, 13, 14, 15
  - Test in light mode and dark mode
  - Test with multiple displays
  - Test network interruption scenarios
  - Test with VPN or firewall restrictions

- [ ] 8.2.2 Verify all functional requirements
  - Verify F-01: Menubar index display with color coding
  - Verify F-02: Dropdown menu with gauge visualization
  - Verify F-03: Current metrics display (value, status)
  - Verify F-04: Historical data comparison (4 time periods)
  - Verify F-05: Data source attribution, Last Updated, Refresh button
  - Verify F-06: Launch at Login toggle, Quit button
  - Verify F-07: Automatic data refresh (60 min interval)
  - Verify F-08: Link to CNN original page

- [ ] 8.2.3 Test edge cases
  - API returns invalid data (out of range values)
  - API is completely down (503 error)
  - Network is offline (no internet connection)
  - Cache is corrupted or missing
  - App is killed during data fetch
  - Very slow API response (timeout scenario)

- [ ] 8.2.4 Performance validation
  - Verify app launches in <3 seconds
  - Verify memory usage <100MB
  - Verify CPU usage <5% when idle
  - Verify dropdown opens in <0.5 seconds
  - Verify gauge animation is smooth (60fps)

- [ ] 8.2.5 User acceptance testing
  - Recruit 2-3 beta testers (target users)
  - Provide installation instructions
  - Collect feedback on usability and functionality
  - Fix critical issues before release

**Acceptance Criteria:**
- All functional requirements verified manually
- App works on both Intel and Apple Silicon Macs
- Edge cases handled gracefully
- Performance targets met
- Beta testers approve functionality

---

## Execution Order

### Week 1: Foundation
1. **Day 1-2**: Task Group 1.1 (Backend Setup) + Task Group 1.2 (Frontend Setup)
2. **Day 3-5**: Task Group 2.1 (CNN Scraper) + Task Group 2.2 (API Endpoints)

### Week 2: Core Features
3. **Day 1-2**: Task Group 2.3 (Error Handling) + Task Group 3.1 (Tray Icon)
4. **Day 3-5**: Task Group 3.2 (Dropdown Window) + Task Group 3.3 (Gauge Visualization)

### Week 3: Integration
5. **Day 1-2**: Task Group 3.4 (Data Display) + Task Group 3.5 (Settings UI)
6. **Day 3-5**: Task Group 4.1 (API Client) + Task Group 4.2 (IPC Communication)

### Week 4: Polish & Testing
7. **Day 1-2**: Task Group 4.3 (Data Refresh) + Task Group 5.1 (Offline Support)
8. **Day 3-4**: Task Group 5.2 (Error States) + Task Group 6.1 (Performance)
9. **Day 5**: Task Group 8.1 (Test Review & Gap Analysis)

### Week 5: Build & Release
10. **Day 1-3**: Task Group 7.1 (Production Build)
11. **Day 4-5**: Task Group 7.2 (Notarization & Distribution)

### Week 6: Final Testing
12. **Day 1-5**: Task Group 8.2 (Manual Testing & UAT)

---

## Priority Legend
- **P1 (Must Have)**: Core functionality required for v1.0 release
- **P2 (High Priority)**: Important features that significantly improve UX

## Complexity Legend
- **Small**: 1-4 hours
- **Medium**: 4-8 hours
- **Large**: 8-16 hours

---

## Key Milestones

### Milestone 1: Backend Operational (End of Week 1)
- FastAPI server running
- CNN scraper functional
- API endpoint returning data

### Milestone 2: Frontend Skeleton (End of Week 2)
- Menubar app launches
- Tray icon displays
- Dropdown window opens

### Milestone 3: Full Integration (End of Week 3)
- App fetches data from backend
- UI displays all data correctly
- Settings functional

### Milestone 4: Production Ready (End of Week 5)
- All features complete
- Production build tested
- App notarized

### Milestone 5: Release (End of Week 6)
- All tests pass
- Manual testing complete
- Ready for distribution

---

## Notes

- **Testing Strategy**: Each implementation task group (1-3) includes focused test writing (2-8 tests) and test execution, followed by a dedicated test gap analysis phase (Task Group 8.1) that adds maximum 10 additional tests if needed
- **Parallel Development**: Backend (Task Groups 2.x) and Frontend UI (Task Groups 3.x) can be developed in parallel after setup
- **Incremental Integration**: Integration tasks (Task Groups 4.x) should start after both backend and frontend core features are stable
- **Performance Monitoring**: Use Chrome DevTools and Activity Monitor throughout development to ensure performance targets are met
- **Code Signing Preparation**: Obtain Apple Developer certificate early to avoid delays during packaging phase
- **Beta Testing**: Recruit beta testers in Week 4 to provide feedback before final release
