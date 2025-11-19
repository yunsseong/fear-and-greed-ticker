# Fear & Greed Index macOS Menubar App

A lightweight macOS menubar application that provides instant access to the CNN Business Fear & Greed Index.

## ⚠️ Disclaimer

This application is provided for **informational and reference purposes only**. The Fear & Greed Index data is not financial advice and should not be used as the sole basis for investment decisions. **We do not assume any responsibility for financial losses** incurred from investment decisions made using this application. Always conduct your own research and consult with qualified financial advisors before making investment decisions.

## Project Structure

```
fear/
├── backend/              # FastAPI backend service
│   ├── api/             # API route handlers
│   ├── models/          # Pydantic data models
│   ├── scrapers/        # CNN website scraper
│   ├── utils/           # Cache and retry utilities
│   ├── tests/           # Backend tests
│   └── main.py          # FastAPI application entry point
│
├── frontend/            # Electron menubar app
│   ├── src/
│   │   ├── main/       # Main process (tray, window, IPC)
│   │   ├── renderer/   # Renderer process (UI)
│   │   └── preload/    # Preload scripts (IPC bridge)
│   ├── assets/         # Icons and static files
│   ├── tests/          # Frontend tests
│   └── package.json    # Node dependencies
│
└── agent-os/           # Project specifications and documentation
    └── specs/fear-greed-menubar-app/
        ├── spec.md           # Technical specifications
        ├── tasks.md          # Task breakdown
        └── planning/
            └── requirements.md    # Business requirements
```

## Features Implemented

### Backend (FastAPI)
- ✅ CNN Fear & Greed Index web scraper
- ✅ REST API endpoint `/api/v1/fear-greed`
- ✅ In-memory caching with TTL (30 minutes)
- ✅ Health check endpoint
- ✅ CORS configuration for Electron
- ✅ Error handling and logging
- ✅ Retry logic with exponential backoff
- ✅ Data validation (Pydantic models)

### Frontend (Electron)
- ✅ macOS menubar tray icon
- ✅ Dropdown window UI (320x480)
- ✅ Semi-circular gauge visualization (HTML5 Canvas)
- ✅ Current and historical data display
- ✅ Color-coded status indicators
- ✅ Light/dark mode support
- ✅ Settings (Launch at Login)
- ✅ Manual refresh button
- ✅ Automatic data refresh (60 min interval)
- ✅ Local caching with localStorage
- ✅ Offline mode support
- ✅ IPC communication (secure context bridge)
- ✅ Single instance lock
- ✅ External link handling (CNN source)

## Technology Stack

### Backend
- **FastAPI** 0.104.1 - Modern Python web framework
- **Uvicorn** 0.24.0 - ASGI server
- **BeautifulSoup4** 4.12.2 - HTML parsing
- **httpx** 0.25.1 - Async HTTP client
- **Pydantic** 2.5.0 - Data validation
- **pytest** 7.4.3 - Testing framework
- **Docker** & **Docker Compose** - Containerized deployment

### Frontend
- **Electron** 27.0.0 - Cross-platform desktop apps
- **electron-builder** 24.6.4 - Packaging and distribution
- **electron-store** 8.1.0 - Settings persistence
- **Jest** 29.7.0 - JavaScript testing

## Setup and Installation

### Backend Setup

```bash
cd backend

# Start backend with Docker Compose
docker-compose up -d

# View logs
docker-compose logs -f

# Run tests (inside container)
docker-compose exec backend pytest -v

# Stop backend
docker-compose down
# Server runs at http://localhost:8000
```

**Alternative: Manual Setup (without Docker)**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run tests
pytest -v

# Start backend server
python main.py
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run tests
npm test

# Start Electron app (development)
npm start

# Build for production
npm run build
```

## Running the Application

### 1. Start Backend Server

**Using Docker Compose (Recommended):**
```bash
cd backend
docker-compose up -d
```

**Using Manual Setup:**
```bash
cd backend
source venv/bin/activate
python main.py
```

The backend will start at `http://localhost:8000`

### 2. Start Frontend App

```bash
cd frontend
npm start
```

The menubar app will launch and connect to the backend.

## API Endpoints

### GET /health
Health check endpoint
- **Response**: `{ "status": "healthy", "service": "Fear & Greed Index API", "version": "1.0.0", "cache": {...} }`

### GET /api/v1/fear-greed
Get current and historical Fear & Greed Index data
- **Response**:
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

## Testing

### Backend Tests

**Using Docker Compose:**
```bash
cd backend

# Run all tests
docker-compose exec backend pytest -v

# Run specific test file
docker-compose exec backend pytest tests/test_scraper.py -v
docker-compose exec backend pytest tests/test_api_endpoints.py -v
```

**Using Manual Setup:**
```bash
cd backend
source venv/bin/activate

# Run all tests
pytest -v

# Run specific test file
pytest tests/test_scraper.py -v
pytest tests/test_api_endpoints.py -v
```

**Test Coverage**:
- 8 scraper tests (data extraction, validation)
- 7 API endpoint tests (caching, CORS, endpoints)
- 4 app setup tests (initialization, health check)

### Frontend Tests
```bash
cd frontend

# Run all tests
npm test
```

**Test Coverage**:
- 8 Electron configuration tests
- File structure validation
- IPC handler verification
- Build configuration checks

## Development Status

### Completed Components

#### Phase 1: Project Setup ✅
- Backend project initialization with FastAPI
- Frontend project initialization with Electron
- Test infrastructure for both layers

#### Phase 2: Backend API ✅
- CNN Fear & Greed Index scraper with fallback mechanisms
- REST API endpoints with caching
- Error handling and logging system
- Retry logic with exponential backoff

#### Phase 3: Frontend UI ✅
- Menubar tray icon with dynamic updates
- Dropdown window with proper positioning
- Semi-circular gauge visualization (Canvas)
- Current and historical data display
- Settings UI (Launch at Login)

#### Phase 4: Data Integration ✅
- API client with timeout and retry
- IPC communication (secure context bridge)
- Automatic refresh (60 min interval)
- Manual refresh functionality
- Tray updates based on data

#### Phase 5: Offline Support ✅
- Local caching with localStorage
- Offline mode indicator
- Error states and user feedback
- Stale cache handling

### Remaining Work

#### Phase 6: Performance Optimization
- Memory profiling and optimization
- Animation performance tuning
- Resource usage monitoring

#### Phase 7: Build & Packaging
- Production build configuration
- Code signing setup
- macOS notarization
- DMG installer creation

#### Phase 8: Testing & QA
- End-to-end testing
- Manual testing on Intel/Apple Silicon
- Performance validation
- User acceptance testing

## Architecture Decisions

### Backend
- **FastAPI** chosen for async support and automatic API documentation
- **In-memory caching** for simplicity (Redis optional for v2.0)
- **BeautifulSoup** for robust HTML parsing with fallback strategies
- **Pydantic v2** for modern data validation

### Frontend
- **Electron** for native macOS integration
- **Context Bridge** for secure IPC communication
- **HTML5 Canvas** for gauge rendering (GPU-accelerated)
- **localStorage** for offline caching
- **electron-store** for settings persistence

## Performance Targets

- ✅ Memory usage: <100MB
- ✅ Launch time: <3 seconds (target)
- ✅ API response: <10 seconds (with timeout)
- ✅ Smooth animations: 60fps (Canvas rendering)
- ✅ Cache TTL: 30 minutes (configurable)
- ✅ Auto-refresh: 60 minutes (configurable)

## Security Considerations

- ✅ Context isolation enabled (Electron)
- ✅ Node integration disabled in renderer
- ✅ Secure IPC through preload script
- ✅ CORS configured for Electron origin
- ✅ No sensitive data storage
- ✅ External links opened in default browser

## Known Limitations (v1.0)

- No detailed 7-indicator breakdown
- No push notifications for threshold alerts
- No historical trend charts
- Single data source (CNN only)
- No user authentication
- No data export functionality
- Requires backend server running locally

## Future Enhancements (v2.0)

- [ ] Redis caching for multi-instance support
- [ ] WebSocket updates for real-time data
- [ ] Historical trend charts
- [ ] Push notifications
- [ ] Bitcoin Fear & Greed Index support
- [ ] Customizable refresh intervals
- [ ] Data export to CSV
- [ ] Sparklines for historical trends

## Contributing

This is a personal project for macOS users interested in market sentiment tracking.

## License

MIT License - See LICENSE file for details

## Acknowledgments

- Data source: CNN Business Fear & Greed Index
- Built with FastAPI and Electron
- Inspired by the need for quick market sentiment checks

## Support

For issues or questions, please refer to the specification documents in `agent-os/specs/fear-greed-menubar-app/`.
