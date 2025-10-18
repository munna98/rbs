import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import userService from './database/userService.js';
import menuService from './database/menuService.js';
import orderService from './database/orderService.js';
import tableService from './database/tableService.js';
import settingsService from './database/settingsService.js';
import printService from './services/printService.js';
import kotPrintService from './services/kotPrintService.js';



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

// ==================== IPC HANDLERS ====================

// ========== AUTHENTICATION ==========
ipcMain.handle('auth:login', async (event, { username, password }) => {
  try {
    const result = await userService.login(username, password);
    return { success: true, data: result };
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

// ========== USER MANAGEMENT ==========
ipcMain.handle('users:get-all', async () => {
  try {
    const users = await settingsService.getAllUsers();
    return { success: true, data: users };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:create', async (event, data) => {
  try {
    const user = await settingsService.createUser(data);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:update', async (event, data) => {
  try {
    const user = await settingsService.updateUser(data);
    return { success: true, data: user };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('users:delete', async (event, id) => {
  try {
    await settingsService.deleteUser(id);
    return { success: true, data: id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========== MENU MANAGEMENT ==========
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

// ========== TABLE MANAGEMENT ==========
ipcMain.handle('table:get-all', async () => {
  try {
    const tables = await tableService.getAllTables();
    return { success: true, data: tables };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:create', async (event, data) => {
  try {
    const table = await tableService.createTable(data);
    return { success: true, data: table };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:update', async (event, data) => {
  try {
    const table = await tableService.updateTable(data);
    return { success: true, data: table };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:delete', async (event, id) => {
  try {
    await tableService.deleteTable(id);
    return { success: true, data: id };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:update-status', async (event, data) => {
  try {
    const table = await tableService.updateTableStatus(data);
    return { success: true, data: table };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:transfer-order', async (event, data) => {
  try {
    await tableService.transferOrder(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:reserve', async (event, data) => {
  try {
    const table = await tableService.reserveTable(data);
    return { success: true, data: table };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:merge', async (event, data) => {
  try {
    const result = await tableService.mergeTables(data);
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:swap', async (event, data) => {
  try {
    await tableService.swapTables(data);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('table:clear', async (event, tableId) => {
  try {
    const table = await tableService.clearTable(tableId);
    return { success: true, data: table };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========== ORDER MANAGEMENT ==========
ipcMain.handle('order:get-tables', async () => {
  try {
    const tables = await tableService.getAllTables();
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

// ========== KITCHEN DISPLAY ==========
ipcMain.handle('kitchen:get-orders', async () => {
  try {
    const orders = await orderService.getKitchenOrders();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('kitchen:update-status', async (event, data) => {
  try {
    const order = await orderService.updateOrderStatus(data);
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('kitchen:mark-item-prepared', async (event, data) => {
  try {
    const item = await orderService.markItemPrepared(data);
    return { success: true, data: item };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// ========== SETTINGS ==========
ipcMain.handle('settings:get-restaurant', async () => {
  try {
    const settings = await settingsService.getRestaurantSettings();
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:update-restaurant', async (event, data) => {
  try {
    const settings = await settingsService.updateRestaurantSettings(data);
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Printing IPC Handlers
ipcMain.handle('print:receipt', async (event, data) => {
  try {
    await printService.printReceipt(data.receiptData, data.printerSettings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:preview', async (event, data) => {
  try {
    await printService.printPreview(data.receiptData, data.printerSettings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:get-printers', async () => {
  try {
    const printers = await printService.getAvailablePrinters();
    return { success: true, data: printers };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:test', async (event, printerName) => {
  try {
    await printService.testPrint(printerName);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('print:open-drawer', async (event, printerName) => {
  try {
    await printService.openCashDrawer(printerName);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Printer Settings
ipcMain.handle('settings:get-printer', async () => {
  try {
    const settings = await settingsService.getPrinterSettings();
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('settings:update-printer', async (event, data) => {
  try {
    const settings = await settingsService.updatePrinterSettings(data);
    return { success: true, data: settings };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// KOT IPC Handlers
ipcMain.handle('kot:print', async (event, data) => {
  try {
    await kotPrintService.printKOT(data.kotData, data.printerSettings);
    
    // Mark KOT as printed
    await orderService.markKOTPrinted(data.kotData.orderId);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('kot:preview', async (event, data) => {
  try {
    await kotPrintService.printKOTPreview(data.kotData, data.printerSettings);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('kot:get-queue', async () => {
  try {
    const orders = await orderService.getKOTQueue();
    return { success: true, data: orders };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('kot:mark-printed', async (event, orderId) => {
  try {
    const order = await orderService.markKOTPrinted(orderId);
    return { success: true, data: order };
  } catch (error) {
    return { success: false, error: error.message };
  }
});