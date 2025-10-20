export interface ElectronAPI {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  createUser: (userData: { username: string; password: string; role: string }) => Promise<any>;
  verifyToken: (token: string) => Promise<any>;
  getAllUsers: () => Promise<any>;

  // menu operations
  getMenuItems: () => Promise<{ success: boolean; data: any; error?: string }>;
  getCategories: () => Promise<{ success: boolean; data: any; error?: string }>;
  createMenuItem: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  updateMenuItem: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  deleteMenuItem: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  createCategory: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  
  // Order operations
  getTables: () => Promise<{ success: boolean; data: any; error?: string }>;
  getOrders: () => Promise<{ success: boolean; data: any; error?: string }>;
  getOrdersByTable: (tableId: string) => Promise<{ success: boolean; data: any; error?: string }>;
  createOrder: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  updateOrder: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  recordPayment: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  updateTableStatus: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;


  // Table operations
  getAllTables: () => Promise<{ success: boolean; data: any; error?: string }>;
  createTable: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  updateTable: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  deleteTable: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  updateTableStatus: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  transferOrder: (data: any) => Promise<{ success: boolean; error?: string }>;
  reserveTable: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  mergeTables: (data: any) => Promise<{ success: boolean; data?: any; error?: string }>;
  swapTables: (data: any) => Promise<{ success: boolean; error?: string }>;
  clearTable: (tableId: string) => Promise<{ success: boolean; data?: any; error?: string }>;

  // Kitchen operations
  getKitchenOrders: () => Promise<{ success: boolean; data: any; error?: string }>;
  updateOrderStatus: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  markItemPrepared: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;

 // User Management
  getAllUsers: () => Promise<{ success: boolean; data: any; error?: string }>;
  createUser: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  updateUser: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;
  deleteUser: (id: string) => Promise<{ success: boolean; data?: any; error?: string }>;
  
  // Settings
  getRestaurantSettings: () => Promise<{ success: boolean; data: any; error?: string }>;
  updateRestaurantSettings: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;

  // Printing operations
  printReceipt: (data: any) => Promise<{ success: boolean; error?: string }>;
  printPreview: (data: any) => Promise<{ success: boolean; error?: string }>;
  getAvailablePrinters: () => Promise<{ success: boolean; data?: any; error?: string }>;
  testPrint: (printerName: string) => Promise<{ success: boolean; error?: string }>;
  openCashDrawer: (printerName: string) => Promise<{ success: boolean; error?: string }>;
  getPrinterSettings: () => Promise<{ success: boolean; data: any; error?: string }>;
  updatePrinterSettings: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;

  // KOT operations
  printKOT: (data: any) => Promise<{ success: boolean; error?: string }>;
  previewKOT: (data: any) => Promise<{ success: boolean; error?: string }>;
  getKOTQueue: () => Promise<{ success: boolean; data?: any; error?: string }>;
  markKOTPrinted: (orderId: string) => Promise<{ success: boolean; data?: any; error?: string }>;

  // Workflow Settings
  getOrderWorkflowSettings: () => Promise<{ success: boolean; data: any; error?: string }>;
  updateOrderWorkflowSettings: (data: any) => Promise<{ success: boolean; data: any; error?: string }>;

}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 