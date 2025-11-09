# Quick Start Guide

## Prerequisites

- macOS 12 (Monterey) or later
- Python 3.9 or later
- Node.js 18 or later
- npm 9 or later

## Installation

### 1. Clone and Setup Backend

```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; print('FastAPI installed successfully')"
```

### 2. Setup Frontend

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Verify installation
npx electron --version
```

## Running the Application

### Step 1: Start Backend Server

Open a terminal and run:

```bash
cd backend
source venv/bin/activate
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

The backend is now running at `http://localhost:8000`

### Step 2: Start Frontend App

Open a **new terminal** and run:

```bash
cd frontend
npm start
```

The menubar app will launch and appear in your macOS menu bar.

## Using the App

### Menubar Display
- Look for the Fear & Greed index in your menu bar (top-right)
- Format: `[emoji] [value]`
- Example: `📈 75` (Greed) or `📉 25` (Extreme Fear)

### Dropdown Menu
- Click the menubar icon to open the dropdown
- View the semi-circular gauge visualization
- See current and historical data
- Check last updated timestamp

### Features
- **Refresh**: Click "Refresh" button to fetch latest data
- **Launch at Login**: Check the box to start app on login
- **CNN Source**: Click the link to visit original CNN page
- **Quit**: Click "Quit" to close the app

### Color Coding
- 🔴 **Red (0-25)**: Extreme Fear
- 🟠 **Orange (26-45)**: Fear
- ⚪ **Gray (46-55)**: Neutral
- 🟢 **Light Green (56-75)**: Greed
- 🟢 **Green (76-100)**: Extreme Greed

## Testing

### Run Backend Tests
```bash
cd backend
source venv/bin/activate
pytest -v
```

### Run Frontend Tests
```bash
cd frontend
npm test
```

## Troubleshooting

### Backend won't start
- Check Python version: `python3 --version` (should be 3.9+)
- Ensure virtual environment is activated: `which python` should show venv path
- Check port 8000 isn't in use: `lsof -i :8000`

### Frontend won't connect to backend
- Verify backend is running at http://localhost:8000
- Check browser at http://localhost:8000/health
- Should return: `{"status":"healthy",...}`

### Tray icon not visible
- The icon is currently a 1x1 placeholder
- Check macOS menu bar (may be hidden in overflow menu)
- Look for text display: `📈 --` or `Loading...`

### Data not updating
- Check backend logs for scraping errors
- Verify network connection
- CNN website may have changed structure (check backend logs)

### App crashes on launch
- Check console for errors: `Console.app` → search for "electron"
- Verify all dependencies installed: `npm list` in frontend directory
- Try clearing cache: `rm -rf frontend/node_modules && npm install`

## Development Mode

### Backend with Auto-Reload
```bash
cd backend
source venv/bin/activate
uvicorn main:app --reload
```

### Frontend with DevTools
Modify `frontend/src/main/main.js`:
```javascript
// Add before mainWindow.loadFile(...)
mainWindow.webContents.openDevTools();
```

## API Testing

### Test Health Endpoint
```bash
curl http://localhost:8000/health
```

### Test Fear-Greed Endpoint
```bash
curl http://localhost:8000/api/v1/fear-greed
```

## Stopping the Application

1. **Frontend**: Click "Quit" button in dropdown menu
   - Or: Press `Cmd+Q` when window is focused

2. **Backend**: Press `Ctrl+C` in the terminal running the server

## Next Steps

- Review `README.md` for full documentation
- Check `IMPLEMENTATION_SUMMARY.md` for technical details
- See `agent-os/specs/` for specifications and requirements

## Support

For issues or questions:
1. Check backend logs: `backend/logs/backend.log`
2. Check frontend console (if DevTools enabled)
3. Review specification documents in `agent-os/specs/`

## Production Build (Coming Soon)

Production build and packaging are planned for Phase 7-8. Current implementation is for development use.
