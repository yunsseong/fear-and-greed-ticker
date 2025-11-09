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
    const handler = (event, data) => {
      // Validate data structure
      if (data && typeof data === 'object' && data.current) {
        callback(data);
      } else {
        console.error('Invalid data-updated payload:', data);
      }
    };
    ipcRenderer.on('data-updated', handler);
    return () => ipcRenderer.removeListener('data-updated', handler);
  },

  // Listen for errors
  onError: (callback) => {
    const handler = (event, error) => callback(error);
    ipcRenderer.on('error-occurred', handler);
    return () => ipcRenderer.removeListener('error-occurred', handler);
  },

  // Listen for update events
  onUpdateAvailable: (callback) => {
    const handler = (event, info) => callback(info);
    ipcRenderer.on('update-available', handler);
    return () => ipcRenderer.removeListener('update-available', handler);
  },

  onUpdateDownloadProgress: (callback) => {
    const handler = (event, progress) => callback(progress);
    ipcRenderer.on('update-download-progress', handler);
    return () => ipcRenderer.removeListener('update-download-progress', handler);
  },
});
