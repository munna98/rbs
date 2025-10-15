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