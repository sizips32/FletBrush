import { app, BrowserWindow, screen } from 'electron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let mainWindow = null;

function createWindow() {
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width, height } = primaryDisplay.workAreaSize;

  console.log('Creating window with dimensions:', width, 'x', height);
  console.log('isDev:', isDev);
  console.log('app.isPackaged:', app.isPackaged);

  mainWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    fullscreen: false, // fullscreen 대신 전체 화면 크기 사용
    skipTaskbar: false, // Dock에 표시되도록
    resizable: true,
    movable: true,
    minimizable: true,
    maximizable: true,
    closable: true,
    hasShadow: false,
    backgroundColor: '#00000000', // 완전 투명 배경
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webSecurity: true,
      backgroundThrottling: false
    }
  });

  // Set window to cover entire screen
  mainWindow.setBounds({ x: 0, y: 0, width, height });
  mainWindow.setAlwaysOnTop(true, 'screen-saver');

  // Load the app
  if (isDev) {
    // Development: Load from Vite dev server
    console.log('Loading from dev server: http://localhost:5173');
    mainWindow.loadURL('http://localhost:5173').catch(err => {
      console.error('Failed to load dev server:', err);
    });
    // DevTools can be opened with Cmd+Option+I (macOS) or Ctrl+Shift+I
  } else {
    // Production: Load from built files
    let indexPath;
    
    if (app.isPackaged) {
      // In packaged app, dist files are in app.asar/dist
      indexPath = join(process.resourcesPath, 'app.asar', 'dist', 'index.html');
      
      // If not found in app.asar, try Resources folder
      if (!existsSync(indexPath)) {
        indexPath = join(process.resourcesPath, 'dist', 'index.html');
      }
    } else {
      // Development build (not packaged)
      indexPath = join(__dirname, '../dist/index.html');
    }
    
    console.log('Loading from:', indexPath);
    console.log('File exists:', existsSync(indexPath));
    
    if (existsSync(indexPath)) {
      mainWindow.loadFile(indexPath).catch(err => {
        console.error('Failed to load file:', err);
        // Fallback: try loading as URL
        const fileUrl = `file://${indexPath}`;
        console.log('Trying to load as URL:', fileUrl);
        mainWindow.loadURL(fileUrl).catch(urlErr => {
          console.error('Failed to load URL:', urlErr);
        });
      });
    } else {
      console.error('Built files not found at:', indexPath);
      console.error('__dirname:', __dirname);
      console.error('process.resourcesPath:', process.resourcesPath);
      console.error('app.getAppPath():', app.getAppPath());
    }
  }

  // Handle window closed
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Error handling
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  mainWindow.webContents.on('crashed', () => {
    console.error('Window crashed');
  });

  // Prevent navigation to external URLs
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
    }
  });

  // Show window when ready
  mainWindow.webContents.once('did-finish-load', () => {
    console.log('Window loaded successfully');
    mainWindow.show();
  });
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    // On macOS, re-create window when dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed
app.on('window-all-closed', () => {
  // On macOS, keep app running even when all windows are closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Security: Prevent new window creation
app.on('web-contents-created', (event, contents) => {
  contents.on('new-window', (event, navigationUrl) => {
    event.preventDefault();
  });
});

