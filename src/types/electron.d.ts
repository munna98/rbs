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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 