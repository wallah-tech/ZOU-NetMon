const { app, BrowserWindow, session, globalShortcut } = require('electron');
const path = require('path');

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 768,
    title: 'Ministry of ICT NetMon',
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Allow HTTP requests to local Supabase
    }
  });

  // Allow all local HTTP requests (needed for local Supabase at 127.0.0.1:54321)
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    callback({ requestHeaders: details.requestHeaders });
  });

  // Register refresh shortcuts
  globalShortcut.register('f5', function() {
    mainWindow.reload();
  });
  globalShortcut.register('CommandOrControl+R', function() {
    mainWindow.reload();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools(); // Open DevTools for debugging
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// When electron is ready to render windows
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
