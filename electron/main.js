const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const userService = require('./database/userService');
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Authentication IPC Handlers
ipcMain.handle('auth:login', async (event, { username, password }) => {
  try {
    const result = await userService.login(username, password);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:create-user', async (event, { username, password, role }) => {
  try {
    const user = await userService.createUser(username, password, role);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('auth:verify-token', async (event, token) => {
  try {
    const decoded = userService.verifyToken(token);
    return { success: true, data: decoded };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:get-all', async () => {
  try {
    const users = await userService.getAllUsers();
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
});