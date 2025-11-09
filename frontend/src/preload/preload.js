/**
 * Preload script for secure IPC communication
 * Exposes safe API to renderer process
 */

const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('api', {
  // Fetch data from backend API
  fetchData: () => ipcRenderer.invoke('fetch-data'),

  // Set launch at login setting
  setLaunchAtLogin: (enabled) => ipcRenderer.invoke('set-launch-at-login', enabled),

  // Set index type (stock or crypto)
  setIndexType: (indexType) => ipcRenderer.invoke('set-index-type', indexType),

  // Quit application
  quitApp: () => ipcRenderer.invoke('quit-app'),

  // Get current settings
  getSettings: () => ipcRenderer.invoke('get-settings'),

  // Open external link
  openExternalLink: (url) => ipcRenderer.invoke('open-external-link', url),

  // Set window height
  setWindowHeight: (height) => ipcRenderer.invoke('set-window-height', height),

  // Set generic setting
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),

  // Update functions
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  downloadUpdate: () => ipcRenderer.invoke('download-update'),
  installUpdate: () => ipcRenderer.invoke('install-update'),

  // Listen for data updates
  onDataUpdated: (callback) => {
    ipcRenderer.on('data-updated', (event, data) => callback(data));
  },

  // Listen for errors
  onError: (callback) => {
    ipcRenderer.on('error-occurred', (event, error) => callback(error));
  },

  // Listen for update events
  onUpdateAvailable: (callback) => {
    ipcRenderer.on('update-available', (event, info) => callback(info));
  },

  onUpdateDownloadProgress: (callback) => {
    ipcRenderer.on('update-download-progress', (event, progress) => callback(progress));
  },
});
