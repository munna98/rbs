export interface ElectronAPI {
  login: (credentials: { username: string; password: string }) => Promise<any>;
  createUser: (userData: { username: string; password: string; role: string }) => Promise<any>;
  verifyToken: (token: string) => Promise<any>;
  getAllUsers: () => Promise<any>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
} 