const { app, BrowserWindow, globalShortcut, ipcMain, Menu, session } = require('electron');
const path = require('path');
const http = require('http');
const fs = require('fs');

// Crucial: allow media and audio embeds to autoplay with sound without requiring explicit in-frame click
app.commandLine.appendSwitch('autoplay-policy', 'no-user-gesture-required');
app.commandLine.appendSwitch('disable-features', 'PreloadMediaEngagementData,MediaEngagementBypassAutoplayPolicies');

let mainWindow = null;
let staticServer = null;

const MIME_MAP = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.wasm': 'application/wasm'
};

function startLocalStaticServer(distDir) {
  return new Promise((resolve) => {
    if (staticServer) {
      const addr = staticServer.address();
      if (addr && addr.port) return resolve(addr.port);
    }
    const server = http.createServer((req, res) => {
      try {
        const rawUrl = req.url.split('?')[0].split('#')[0];
        let filePath = path.join(distDir, rawUrl === '/' ? 'index.html' : rawUrl);

        if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
          filePath = path.join(distDir, 'index.html');
        }

        const ext = path.extname(filePath).toLowerCase();
        const mimeType = MIME_MAP[ext] || 'application/octet-stream';

        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(404);
            res.end('Not Found');
            return;
          }
          res.writeHead(200, {
            'Content-Type': mimeType,
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          });
          res.end(data);
        });
      } catch (_) {
        res.writeHead(500);
        res.end('Server Error');
      }
    });

    server.listen(0, '127.0.0.1', () => {
      staticServer = server;
      const port = server.address().port;
      resolve(port);
    });
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 840,
    minHeight: 600,
    backgroundColor: '#080808',
    show: false,
    autoHideMenuBar: true,
    title: 'Jennie — Music Streaming Platform',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: false,
      allowRunningInsecureContent: true,
      backgroundThrottling: false // Keep audio running smoothly when desktop app is minimized!
    }
  });

  // Guarantee audio output is unmuted at the webContents layer
  mainWindow.webContents.setAudioMuted(false);

  // Forward renderer console to stdout for debugging
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Renderer Console]:`, message);
  });

  // Load dev server URL or production dist bundle through local HTTP server
  const isDev = !app.isPackaged && process.env.NODE_ENV !== 'production' && process.env.VITE_DEV_SERVER_URL;

  if (isDev) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    const distPath = path.join(__dirname, '..', 'dist');
    const port = await startLocalStaticServer(distPath);
    mainWindow.loadURL(`http://127.0.0.1:${port}`);
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  registerMediaShortcuts();
}

function registerMediaShortcuts() {
  // Global Media Key bindings so media keys on keyboards control Jennie
  try {
    globalShortcut.register('MediaPlayPause', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('media-action', 'play-pause');
      }
    });

    globalShortcut.register('MediaNextTrack', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('media-action', 'next-track');
      }
    });

    globalShortcut.register('MediaPreviousTrack', () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send('media-action', 'previous-track');
      }
    });
  } catch (err) {
    console.warn('Failed to register global shortcuts:', err);
  }
}

// Window control IPC handlers
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

// App lifecycle
app.whenReady().then(() => {
  // Remove default menu for minimalist luxury aesthetic
  Menu.setApplicationMenu(null);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
