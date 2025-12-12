const { app, BrowserWindow, shell, ipcMain, dialog, Menu } = require('electron');
const path = require('path');
const fs = require('fs');

const isDev = !app.isPackaged;

let mainWindow;

// Config file path for storing vault location
const getConfigPath = () => {
  return path.join(app.getPath('userData'), 'config.json');
};

// Read config
const readConfig = () => {
  try {
    const configPath = getConfigPath();
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (e) {
    console.error('Error reading config:', e);
  }
  return {};
};

// Write config
const writeConfig = (config) => {
  try {
    const configPath = getConfigPath();
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  } catch (e) {
    console.error('Error writing config:', e);
  }
};

// Get vault path from config
const getVaultPath = () => {
  const config = readConfig();
  return config.vaultPath || null;
};

// Ensure directory exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Initialize vault structure
const initializeVault = (vaultPath) => {
  const dirs = ['journal', 'dreams', 'notes', 'ideas', 'wisdom', '.microlog'];
  dirs.forEach(dir => {
    ensureDir(path.join(vaultPath, dir));
  });

  // Create initial config in vault
  const vaultConfigPath = path.join(vaultPath, '.microlog', 'config.json');
  if (!fs.existsSync(vaultConfigPath)) {
    fs.writeFileSync(vaultConfigPath, JSON.stringify({
      created: new Date().toISOString(),
      version: '1.0.0'
    }, null, 2));
  }
};

function createWindow() {
  // Remove menu bar on Windows
  Menu.setApplicationMenu(null);

  const iconPath = isDev
    ? path.join(__dirname, '../public/icon.ico')
    : path.join(__dirname, '../dist/icon.ico');

  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 400,
    minHeight: 500,
    icon: iconPath,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 15, y: 15 },
    autoHideMenuBar: true,
    backgroundColor: '#0a0a0a',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const url = isDev
    ? 'http://localhost:5173'
    : `file://${path.join(__dirname, '../dist/index.html')}`;

  mainWindow.loadURL(url);

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// IPC Handlers

// Select vault folder
ipcMain.handle('select-vault-folder', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory', 'createDirectory'],
    title: 'Select folder for your micro.log vault',
    buttonLabel: 'Select Vault Location'
  });

  if (!result.canceled && result.filePaths.length > 0) {
    return result.filePaths[0];
  }
  return null;
});

// Get vault path
ipcMain.handle('get-vault-path', () => {
  return getVaultPath();
});

// Set vault path
ipcMain.handle('set-vault-path', (event, vaultPath) => {
  try {
    initializeVault(vaultPath);
    const config = readConfig();
    config.vaultPath = vaultPath;
    writeConfig(config);
    return { success: true };
  } catch (e) {
    console.error('Error setting vault path:', e);
    return { success: false, error: e.message };
  }
});

// Clear vault path
ipcMain.handle('clear-vault-path', () => {
  try {
    const config = readConfig();
    delete config.vaultPath;
    writeConfig(config);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Read file
ipcMain.handle('read-file', (event, relativePath) => {
  try {
    const vaultPath = getVaultPath();
    if (!vaultPath) return { success: false, error: 'No vault configured' };

    const fullPath = path.join(vaultPath, relativePath);
    if (!fs.existsSync(fullPath)) {
      return { success: true, content: null };
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    return { success: true, content };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Write file
ipcMain.handle('write-file', (event, relativePath, content) => {
  try {
    const vaultPath = getVaultPath();
    if (!vaultPath) return { success: false, error: 'No vault configured' };

    const fullPath = path.join(vaultPath, relativePath);
    const dir = path.dirname(fullPath);

    // Ensure directory exists
    ensureDir(dir);

    fs.writeFileSync(fullPath, content, 'utf-8');
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Delete file
ipcMain.handle('delete-file', (event, relativePath) => {
  try {
    const vaultPath = getVaultPath();
    if (!vaultPath) return { success: false, error: 'No vault configured' };

    const fullPath = path.join(vaultPath, relativePath);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// List files in directory
ipcMain.handle('list-files', (event, relativePath) => {
  try {
    const vaultPath = getVaultPath();
    if (!vaultPath) return { success: false, error: 'No vault configured' };

    const fullPath = path.join(vaultPath, relativePath);
    if (!fs.existsSync(fullPath)) {
      return { success: true, files: [] };
    }

    const files = fs.readdirSync(fullPath);
    return { success: true, files };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

// Ensure directory exists
ipcMain.handle('ensure-dir', (event, relativePath) => {
  try {
    const vaultPath = getVaultPath();
    if (!vaultPath) return { success: false, error: 'No vault configured' };

    const fullPath = path.join(vaultPath, relativePath);
    ensureDir(fullPath);
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
