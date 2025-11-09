/**
 * Main process for Fear & Greed Index Menubar App
 * Handles app lifecycle, tray icon, and window management
 */

const { app, Tray, BrowserWindow, Menu, ipcMain, shell, nativeImage, dialog } = require('electron');
const path = require('path');
const Store = require('electron-store');
const { fetchWithRetry } = require('./api-client');
const { createCanvas } = require('canvas');
const { autoUpdater } = require('electron-updater');

// Initialize electron-store for settings persistence
const store = new Store();

// Keep references to prevent garbage collection
let tray = null;
let mainWindow = null;
let autoRefreshInterval = null;

// Single instance lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Focus window if user tries to launch a second instance
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  // App is ready
  app.whenReady().then(() => {
    createTray();
    setupIPC();
    startAutoRefresh();
    setupAutoUpdater();
    console.log('Fear & Greed Index App started');

    // Initial data fetch
    fetchAndUpdateData();
  });
}

// Quit when all windows are closed (macOS behavior)
app.on('window-all-closed', (e) => {
  // Prevent app from quitting when dropdown closes
  e.preventDefault();
});

app.on('before-quit', () => {
  // Cleanup before quitting
  if (tray) {
    tray.destroy();
  }
  if (autoRefreshInterval) {
    clearInterval(autoRefreshInterval);
  }
});

/**
 * Create system tray icon
 */
function createTray() {
  // In development, use source path; in production, use app path
  let iconPath;
  if (process.env.VITE_DEV_SERVER_URL) {
    iconPath = path.join(process.cwd(), 'assets/icons/trayTemplate.png');
  } else {
    iconPath = path.join(__dirname, '../../assets/icons/trayTemplate.png');
  }

  // For now, create a simple icon using canvas if file doesn't exist
  try {
    tray = new Tray(iconPath);
  } catch (error) {
    console.log('Creating tray icon from canvas...');
    const icon = createTrayIcon(50, 'Neutral');
    tray = new Tray(icon);
  }

  tray.setToolTip('Fear & Greed Index');
  tray.setTitle('Loading...');

  tray.on('click', () => {
    toggleWindow();
  });
}

/**
 * Create dropdown window
 */
function createWindow() {
  // Determine preload path based on environment
  let preloadPath;
  if (process.env.VITE_DEV_SERVER_URL) {
    preloadPath = path.join(__dirname, 'preload.js');
  } else {
    preloadPath = path.join(__dirname, '../preload/preload.js');
  }

  mainWindow = new BrowserWindow({
    width: 320,
    height: 383,
    show: false,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    webPreferences: {
      preload: preloadPath,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // Load from Vite dev server in development, built files in production
  const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']

  if (VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // Open DevTools in development
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'));
  }

  // Hide window when it loses focus
  mainWindow.on('blur', () => {
    if (!mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.hide();
    }
  });

  return mainWindow;
}

/**
 * Toggle window visibility
 */
function toggleWindow() {
  if (!mainWindow) {
    mainWindow = createWindow();
  }

  if (mainWindow.isVisible()) {
    mainWindow.hide();
  } else {
    showWindow();
  }
}

/**
 * Show window positioned below tray icon
 */
function showWindow() {
  const trayBounds = tray.getBounds();
  const windowBounds = mainWindow.getBounds();

  // Calculate position
  const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2));
  const y = Math.round(trayBounds.y + trayBounds.height);

  mainWindow.setPosition(x, y, false);
  mainWindow.show();
  mainWindow.focus();
}

/**
 * Animate window height change
 * @param {number} startHeight - Starting height
 * @param {number} endHeight - Target height
 */
function animateWindowHeight(startHeight, endHeight) {
  if (!mainWindow || mainWindow.isDestroyed()) return;

  const duration = 200; // Animation duration in ms
  const startTime = Date.now();
  const heightDiff = endHeight - startHeight;

  const animate = () => {
    if (!mainWindow || mainWindow.isDestroyed()) return;

    const elapsed = Date.now() - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Easing function (ease-out)
    const eased = 1 - Math.pow(1 - progress, 3);
    const currentHeight = Math.round(startHeight + (heightDiff * eased));

    const currentBounds = mainWindow.getBounds();
    mainWindow.setBounds({
      ...currentBounds,
      height: currentHeight
    }, false);

    if (progress < 1) {
      setTimeout(animate, 16); // ~60fps
    }
  };

  animate();
}

/**
 * Fetch data and update UI
 */
async function fetchAndUpdateData() {
  try {
    // Get selected index type from store (default: 'stock')
    const indexType = store.get('indexType', 'stock');
    console.log(`Fetching Fear & Greed data for ${indexType}...`);

    const data = await fetchWithRetry(3, indexType);

    // Update tray
    if (data && data.current) {
      updateTray(data.current.value, data.current.status, indexType);
    }

    // Send data to renderer if window exists
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('data-updated', { ...data, indexType });
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error fetching data:', error);

    // Send error to renderer
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('error-occurred', {
        message: error.message || 'Failed to fetch data',
      });
    }

    return { success: false, error: error.message };
  }
}

/**
 * Start automatic refresh interval
 */
function startAutoRefresh() {
  // Refresh every 60 minutes
  const refreshInterval = 60 * 60 * 1000; // 60 minutes in milliseconds

  autoRefreshInterval = setInterval(() => {
    console.log('Auto-refreshing data...');
    fetchAndUpdateData();
  }, refreshInterval);
}

/**
 * Setup auto-updater
 */
function setupAutoUpdater() {
  // Configure auto-updater
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  // Check for updates on startup (after 3 seconds)
  setTimeout(() => {
    autoUpdater.checkForUpdates();
  }, 3000);

  // Check for updates every 6 hours
  setInterval(() => {
    autoUpdater.checkForUpdates();
  }, 6 * 60 * 60 * 1000);

  // Update available
  autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-available', {
        version: info.version,
        releaseDate: info.releaseDate
      });
    }
  });

  // Update not available
  autoUpdater.on('update-not-available', () => {
    console.log('App is up to date');
  });

  // Download progress
  autoUpdater.on('download-progress', (progressObj) => {
    console.log(`Download speed: ${progressObj.bytesPerSecond} - Downloaded ${progressObj.percent}%`);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('update-download-progress', progressObj);
    }
  });

  // Update downloaded
  autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info.version);

    // Show dialog
    dialog.showMessageBox({
      type: 'info',
      title: 'Update Ready',
      message: `Version ${info.version} has been downloaded.`,
      detail: 'The app will restart to install the update.',
      buttons: ['Restart Now', 'Later']
    }).then((result) => {
      if (result.response === 0) {
        autoUpdater.quitAndInstall();
      }
    });
  });

  // Error handling
  autoUpdater.on('error', (error) => {
    console.error('Update error:', error);
  });
}

/**
 * Setup IPC communication handlers
 */
function setupIPC() {
  ipcMain.handle('fetch-data', async () => {
    return await fetchAndUpdateData();
  });

  ipcMain.handle('set-launch-at-login', async (event, enabled) => {
    app.setLoginItemSettings({
      openAtLogin: enabled,
    });
    store.set('launchAtLogin', enabled);
    return { success: true };
  });

  ipcMain.handle('set-index-type', async (event, indexType) => {
    store.set('indexType', indexType);
    // Fetch new data immediately
    await fetchAndUpdateData();
    return { success: true };
  });

  ipcMain.handle('quit-app', () => {
    app.quit();
  });

  ipcMain.handle('get-settings', () => {
    return {
      launchAtLogin: store.get('launchAtLogin', false),
      indexType: store.get('indexType', 'stock'),
      language: store.get('language', 'en'),
    };
  });

  ipcMain.handle('open-external-link', async (event, url) => {
    await shell.openExternal(url);
    return { success: true };
  });

  ipcMain.handle('set-window-height', (event, height) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      const currentBounds = mainWindow.getBounds();
      const targetHeight = Math.ceil(height);

      // Animate height change
      animateWindowHeight(currentBounds.height, targetHeight);
    }
    return { success: true };
  });

  ipcMain.handle('set-setting', async (event, key, value) => {
    store.set(key, value);
    return { success: true };
  });

  ipcMain.handle('check-for-updates', async () => {
    try {
      const result = await autoUpdater.checkForUpdates();
      return { success: true, updateInfo: result?.updateInfo };
    } catch (error) {
      console.error('Error checking for updates:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('download-update', async () => {
    try {
      await autoUpdater.downloadUpdate();
      return { success: true };
    } catch (error) {
      console.error('Error downloading update:', error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle('install-update', () => {
    autoUpdater.quitAndInstall();
  });
}

/**
 * Create circular tray icon with value
 * @param {number} value - Index value (0-100)
 * @param {string} status - Status label
 * @returns {NativeImage} - Tray icon image
 */
function createTrayIcon(value, status) {
  const size = 22; // macOS menubar icon size
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Determine color based on value
  let color;
  if (value <= 25) color = '#DC2626'; // Extreme Fear - Red
  else if (value <= 45) color = '#F97316'; // Fear - Orange
  else if (value <= 55) color = '#6B7280'; // Neutral - Gray
  else if (value <= 75) color = '#10B981'; // Greed - Green
  else color = '#059669'; // Extreme Greed - Dark Green

  // Draw circle
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2);
  ctx.fill();

  // Draw white border for better visibility
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Draw text
  ctx.fillStyle = '#FFFFFF';
  ctx.font = 'bold 12px -apple-system';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(value.toString(), size / 2, size / 2);

  // Convert canvas to NativeImage
  const buffer = canvas.toBuffer('image/png');
  return nativeImage.createFromBuffer(buffer);
}

/**
 * Update tray icon and title
 * @param {number} value - Index value (0-100)
 * @param {string} status - Status label
 * @param {string} indexType - Type of index ('stock' or 'crypto')
 */
function updateTray(value, status, indexType = 'stock') {
  if (!tray) return;

  try {
    // Set text-only display in menubar
    tray.setTitle(value.toString());

    // Set tooltip to show status and index type
    const indexName = indexType === 'crypto' ? 'Crypto' : 'Stock Market';
    tray.setToolTip(`${indexName} Fear & Greed Index: ${value} (${status})`);
  } catch (error) {
    console.error('Error updating tray:', error);
    // Fallback to text-only display
    tray.setTitle(value.toString());
  }
}

// Export for testing
module.exports = { updateTray };
