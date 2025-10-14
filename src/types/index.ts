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