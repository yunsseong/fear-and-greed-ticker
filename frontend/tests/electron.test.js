/**
 * Tests for Electron app setup and configuration
 * Note: These are basic structural tests. Full E2E tests require Spectron or Playwright
 */

const path = require('path');
const fs = require('fs');

describe('Electron App Setup', () => {
  test('package.json exists and has correct main entry', () => {
    const packagePath = path.join(__dirname, '../package.json');
    expect(fs.existsSync(packagePath)).toBe(true);

    const packageJson = require(packagePath);
    expect(packageJson.main).toBe('src/main/main.js');
    expect(packageJson.name).toBe('fear-greed-ticker');
  });

  test('main process file exists', () => {
    const mainPath = path.join(__dirname, '../src/main/main.js');
    expect(fs.existsSync(mainPath)).toBe(true);
  });

  test('preload script exists', () => {
    const preloadPath = path.join(__dirname, '../src/preload/preload.js');
    expect(fs.existsSync(preloadPath)).toBe(true);
  });

  test('renderer HTML exists', () => {
    const htmlPath = path.join(__dirname, '../src/renderer/index.html');
    expect(fs.existsSync(htmlPath)).toBe(true);
  });

  test('single instance lock is configured', () => {
    const mainContent = fs.readFileSync(
      path.join(__dirname, '../src/main/main.js'),
      'utf8'
    );
    expect(mainContent).toContain('requestSingleInstanceLock');
  });

  test('IPC handlers are defined', () => {
    const mainContent = fs.readFileSync(
      path.join(__dirname, '../src/main/main.js'),
      'utf8'
    );
    expect(mainContent).toContain('ipcMain.handle');
    expect(mainContent).toContain('fetch-data');
    expect(mainContent).toContain('set-launch-at-login');
    expect(mainContent).toContain('quit-app');
  });

  test('preload script exposes secure API', () => {
    const preloadContent = fs.readFileSync(
      path.join(__dirname, '../src/preload/preload.js'),
      'utf8'
    );
    expect(preloadContent).toContain('contextBridge.exposeInMainWorld');
    expect(preloadContent).toContain('fetchData');
    expect(preloadContent).toContain('setLaunchAtLogin');
    expect(preloadContent).toContain('quitApp');
  });

  test('build configuration includes universal binary', () => {
    const packageJson = require('../package.json');
    expect(packageJson.build.mac.target[0].arch).toContain('universal');
  });
});
