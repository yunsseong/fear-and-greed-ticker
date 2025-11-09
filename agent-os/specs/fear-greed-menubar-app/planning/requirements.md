# Requirements for Fear & Greed Index macOS Menubar App

## Project Overview
**Product Name**: F&G Ticker (working title)
**Category**: macOS Utility / Menubar Application
**Core Goal**: Enable users to quickly check the CNN Business Fear & Greed Index from the macOS menubar without visiting the website

## Problem Statement
- Investors and market observers frequently want to check the Fear & Greed Index
- Current process requires opening a browser and navigating to CNN Business website
- This interrupts workflow and wastes time
- Need for quick, non-intrusive access to market sentiment data

## Solution
- Display core metrics (current value and status) permanently in macOS menubar
- Provide detailed information via dropdown menu with one click
- Background data updates to ensure latest information
- Present data similar to CNN website design (semi-circular gauge)

## Target Users
**Primary**: macOS users who are stock/crypto investors, traders, financial market analysts
**Secondary**: General users interested in economic trends and market sentiment

## Functional Requirements - Release 1.0

### P1 (Must Have)

#### F-01: Menubar Index Display
- Display current Fear & Greed Index numeric value in menubar
- Dynamic color changes based on status:
  - Fear = Red
  - Greed = Green
  - Neutral = Gray

#### F-02: Detailed Information Dropdown
- Dropdown menu appears on menubar icon click
- Semi-circular gauge visualization at the top (similar to CNN website design)

#### F-03: Main Metrics Display
- Current index value (e.g., "75")
- Current status (e.g., "Extreme Greed")

#### F-04: Historical Data Comparison
Display in dropdown menu:
1. Previous Close
2. 1 Week Ago
3. 1 Month Ago
4. 1 Year Ago

#### F-05: Data Source & Updates
- Display "Data from CNN Business" attribution
- Show "Last Updated" timestamp
- Provide "Refresh" button for manual updates

#### F-06: Basic App Settings
- "Launch at Login" checkbox option
- "Quit" button

### P2 (High Priority)

#### F-07: Automatic Data Refresh
- Auto-refresh data at regular intervals (e.g., every 1 hour) while app is running

#### F-08: Original Link
- Provide link at bottom of dropdown to CNN original page

## Non-Functional Requirements

### Technology Stack

#### Desktop Application (Client)
**Technology**: Electron
- Build macOS menubar app using web technologies (HTML/CSS/JavaScript)

#### Backend API
**Technology**: FastAPI (Python)
- Scrape data from CNN website
- Provide data to Electron client via JSON API

### Data Source & Processing

#### Backend (FastAPI) Responsibilities
- Source URL: `https://edition.cnn.com/markets/fear-and-greed`
- Periodic scraping (e.g., every 30 minutes or 1 hour)
- Cache scraped data
- Note: Stable parsing logic needed to handle CNN website structure changes

#### Client (Electron) Responsibilities
- Call backend API on app start and periodically
- Required data:
  1. Current index value and status (Now)
  2. Previous Close value
  3. 1 Week Ago value
  4. 1 Month Ago value
  5. 1 Year Ago value

### Platform Support
- macOS 12 (Monterey) and above
- Electron build target

### Performance
- Lightweight app despite Electron framework
- Minimize CPU and memory usage (background utility)
- Fast API response times

### UI/UX
- Follow macOS design guidelines
- Support both Light Mode and Dark Mode
- High-resolution (Retina) display support for icons and fonts

### Network
- Handle offline scenarios or API errors gracefully
- Display last successful data or clear "connection failed" status when API is unavailable

## UX/UI Concept

### Menubar (Default State)
- Display format: `[📈 75]` or `[😱 25]` with icon and current index
- Intuitive status recognition via icon/text color (green/gray/red)

### Dropdown (On Click)
Structure:
```
[ (Visual Gauge Image) ]

### Current Index: 75 (Extreme Greed)

--- (divider)

* Previous Close: 72 (Greed)
* 1 Week Ago: 60 (Greed)
* 1 Month Ago: 30 (Fear)
* 1 Year Ago: 45 (Fear)

--- (divider)

*Last Updated: 2025-11-07 14:00 (KST)*
*Data from CNN Business [↗]*

--- (divider)

[ ] Launch at Login
[ Refresh ] [ Quit ]
```

## Out of Scope - Future v2.0

- **Detailed Sub-Metrics**: Individual values for 7 sub-indicators (Stock Price Momentum, Market Volatility, etc.)
- **Push Notifications**: Alerts when index reaches specific values (e.g., entering "Extreme Fear")
- **History Charts**: Detailed graphs showing index changes over time (sparklines, etc.)
- **Other Indices**: Integration with other data sources like Bitcoin (cryptocurrency) Fear & Greed Index
