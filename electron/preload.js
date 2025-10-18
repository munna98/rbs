const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  createUser: (userData) => ipcRenderer.invoke('auth:create-user', userData),
  verifyToken: (token) => ipcRenderer.invoke('auth:verify-token', token),
  
  // Users
  getAllUsers: () => ipcRenderer.invoke('users:get-all'),

  // Menu APIs
  getMenuItems: () => ipcRenderer.invoke('menu:get-items'),
  getCategories: () => ipcRenderer.invoke('menu:get-categories'),
  createMenuItem: (data) => ipcRenderer.invoke('menu:create-item', data),
  updateMenuItem: (data) => ipcRenderer.invoke('menu:update-item', data),
  deleteMenuItem: (id) => ipcRenderer.invoke('menu:delete-item', id),
  createCategory: (data) => ipcRenderer.invoke('menu:create-category', data),

  // Order APIs
  getTables: () => ipcRenderer.invoke('order:get-tables'),
  getOrders: () => ipcRenderer.invoke('order:get-orders'),
  getOrdersByTable: (tableId) => ipcRenderer.invoke('order:get-by-table', tableId),
  createOrder: (data) => ipcRenderer.invoke('order:create', data),
  updateOrder: (data) => ipcRenderer.invoke('order:update', data),
  recordPayment: (data) => ipcRenderer.invoke('order:record-payment', data),
  updateTableStatus: (data) => ipcRenderer.invoke('order:update-table-status', data),

  // Table APIs
  getAllTables: () => ipcRenderer.invoke('table:get-all'),
  createTable: (data) => ipcRenderer.invoke('table:create', data),
  updateTable: (data) => ipcRenderer.invoke('table:update', data),
  deleteTable: (id) => ipcRenderer.invoke('table:delete', id),
  updateTableStatus: (data) => ipcRenderer.invoke('table:update-status', data),
  transferOrder: (data) => ipcRenderer.invoke('table:transfer-order', data),
  reserveTable: (data) => ipcRenderer.invoke('table:reserve', data),
  mergeTables: (data) => ipcRenderer.invoke('table:merge', data),
  swapTables: (data) => ipcRenderer.invoke('table:swap', data),
  clearTable: (tableId) => ipcRenderer.invoke('table:clear', tableId),
  
  // Kitchen APIs
  getKitchenOrders: () => ipcRenderer.invoke('kitchen:get-orders'),
  updateOrderStatus: (data) => ipcRenderer.invoke('kitchen:update-status', data),
  markItemPrepared: (data) => ipcRenderer.invoke('kitchen:mark-item-prepared', data),

  // User Management APIs
  getAllUsers: () => ipcRenderer.invoke('users:get-all'),
  createUser: (data) => ipcRenderer.invoke('users:create', data),
  updateUser: (data) => ipcRenderer.invoke('users:update', data),
  deleteUser: (id) => ipcRenderer.invoke('users:delete', id),
  
  // Settings APIs
  getRestaurantSettings: () => ipcRenderer.invoke('settings:get-restaurant'),
  updateRestaurantSettings: (data) => ipcRenderer.invoke('settings:update-restaurant', data),

  // Printing APIs
  printReceipt: (data) => ipcRenderer.invoke('print:receipt', data),
  printPreview: (data) => ipcRenderer.invoke('print:preview', data),
  getAvailablePrinters: () => ipcRenderer.invoke('print:get-printers'),
  testPrint: (printerName) => ipcRenderer.invoke('print:test', printerName),
  openCashDrawer: (printerName) => ipcRenderer.invoke('print:open-drawer', printerName),
  getPrinterSettings: () => ipcRenderer.invoke('settings:get-printer'),
  updatePrinterSettings: (data) => ipcRenderer.invoke('settings:update-printer', data),

  // KOT APIs
  printKOT: (data) => ipcRenderer.invoke('kot:print', data),
  previewKOT: (data) => ipcRenderer.invoke('kot:preview', data),
  getKOTQueue: () => ipcRenderer.invoke('kot:get-queue'),
  markKOTPrinted: (orderId) => ipcRenderer.invoke('kot:mark-printed', orderId),


});