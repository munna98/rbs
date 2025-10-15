import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import userService from './database/userService.js';
import menuService from './database/menuService.js';
import orderService from './database/orderService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

// Register custom protocol before app ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'image', privileges: { secure: true, standard: true } }
]);

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

// Handle custom image protocol
app.whenReady().then(() => {
  protocol.handle('image', (request) => {
    // Extract file path from URL
    // image://C:/Users/.../image.jpg -> C:/Users/.../image.jpg
    const filepath = request.url.slice('image://'.length);
    return net.fetch(`file://${filepath}`);
  });

  createWindow();
});

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

// Menu IPC Handlers
ipcMain.handle('menu:get-items', async () => {
  try {
    const items = await menuService.getMenuItems();
    return { success: true, data: items };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('menu:get-categories', async () => {
  try {
    const categories = await menuService.getCategories();
    return { success: true, data: categories };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('menu:create-item', async (event, data) => {
  try {
    const item = await menuService.createMenuItem(data);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('menu:update-item', async (event, data) => {
  try {
    const item = await menuService.updateMenuItem(data);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('menu:delete-item', async (event, id) => {
  try {
    await menuService.deleteMenuItem(id);
    return { success: true, data: id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('menu:create-category', async (event, data) => {
  try {
    const category = await menuService.createCategory(data);
    return { success: true, data: category };
  } catch (error) {
    return { success: false, error: error.message };
  }
});


// Orders IPC Handlers
ipcMain.handle('order:get-tables', async () => {
  try {
    const tables = await orderService.getTables();
    return { success: true, data: tables };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('order:get-orders', async () => {
  try {
    const orders = await orderService.getOrders();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('order:get-by-table', async (event, tableId) => {
  try {
    const orders = await orderService.getOrdersByTableId(tableId);
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('order:create', async (event, data) => {
  try {
    const order = await orderService.createOrder(data);
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('order:update', async (event, data) => {
  try {
    const order = await orderService.updateOrder(data);
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('order:record-payment', async (event, data) => {
  try {
    const payment = await orderService.recordPayment(data);
    return { success: true, data: payment };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('order:update-table-status', async (event, data) => {
  try {
    const table = await orderService.updateTableStatus(data);
    return { success: true, data: table };
  } catch (error) {
    return { success: false, error: error.message };
  }
});