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
});