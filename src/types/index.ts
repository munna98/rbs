export interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'CASHIER' | 'WAITER';
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  token: string | null; 
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface DashboardStats {
  todaySales: number;
  activeOrders: number;
  completedOrders: number;
  revenue: number;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
}

export interface MenuItem {
  id: string;
  categoryId: string;
  name: string;
  price: number;
  image?: string;
  available: boolean;
  category?: Category;
}

export interface Table {
  id: string;
  tableNumber: number;
  capacity: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED';
  orders?: Order[];
}

export interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Order {
  id: string;
  tableId?: string;
  userId: String;
  user: User;
  status: 'PENDING' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
  total: number;
  createdAt: Date;
  orderItems?: OrderItem[];
  table?: Table;
}

export interface OrderItem {
  id: string;
  orderId: string;
  menuItemId: string;
  quantity: number;
  price: number;
  menuItem?: MenuItem;
}

export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'CASH' | 'CARD' | 'UPI' | 'OTHER';
  transactionId?: string;
  createdAt: Date;
}

export interface ReceiptData {
  orderId: string;
  orderNumber: string;
  tableNumber?: number;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  taxRate: number;
  total: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  cashier: string;
  date: Date;
  restaurantInfo: {
    name: string;
    address?: string;
    phone?: string;
    gstNumber?: string;
  };
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface PrinterSettings {
  printerName: string;
  paperWidth: number; // in mm (58mm or 80mm)
  copies: number;
  enableSound: boolean;
  autoOpenDrawer: boolean;
}