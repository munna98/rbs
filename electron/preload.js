const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  // Authentication
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),
  createUser: (userData) => ipcRenderer.invoke('auth:create-user', userData),
  verifyToken: (token) => ipcRenderer.invoke('auth:verify-token', token),
  
  // Users
  getAllUsers: () => ipcRenderer.invoke('users:get-all'),
});