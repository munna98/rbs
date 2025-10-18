import prisma from './prisma.js';
import bcrypt from 'bcryptjs';

const settingsService = {
  // User Management
  async getAllUsers() {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      return users;
    } catch (error) {
      throw error;
    }
  },

  async createUser(data) {
    try {
      const { username, password, role } = data;

      // Check if username exists
      const existing = await prisma.user.findUnique({
        where: { username },
      });

      if (existing) {
        throw new Error('Username already exists');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          passwordHash: hashedPassword,
          role,
        },
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  async updateUser(data) {
    try {
      const { id, username, password, role } = data;

      const updateData = {
        ...(username && { username }),
        ...(role && { role }),
      };

      if (password) {
        updateData.passwordHash = await bcrypt.hash(password, 10);
      }

      const user = await prisma.user.update({
        where: { id },
        data: updateData,
        select: {
          id: true,
          username: true,
          role: true,
          createdAt: true,
        },
      });

      return user;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      // Prevent deleting the last admin
      const adminCount = await prisma.user.count({
        where: { role: 'ADMIN' },
      });

      const user = await prisma.user.findUnique({
        where: { id },
      });

      if (user?.role === 'ADMIN' && adminCount === 1) {
        throw new Error('Cannot delete the last admin user');
      }

      await prisma.user.delete({
        where: { id },
      });

      return id;
    } catch (error) {
      throw error;
    }
  },

  // Restaurant Settings
  async getRestaurantSettings() {
    try {
      let settings = await prisma.restaurantSettings.findFirst();

      if (!settings) {
        // Create default settings if none exist
        settings = await prisma.restaurantSettings.create({
          data: {
            name: 'My Restaurant',
            address: '',
            phone: '',
            email: '',
            taxRate: 5,
            currency: 'INR',
            gstNumber: '',
          },
        });
      }

      return settings;
    } catch (error) {
      throw error;
    }
  },

  async updateRestaurantSettings(data) {
    try {
      const { name, address, phone, email, taxRate, currency, gstNumber } = data;

      // Get or create settings
      let settings = await prisma.restaurantSettings.findFirst();

      if (!settings) {
        settings = await prisma.restaurantSettings.create({
          data: {
            name,
            address,
            phone,
            email,
            taxRate: parseFloat(taxRate),
            currency,
            gstNumber,
          },
        });
      } else {
        settings = await prisma.restaurantSettings.update({
          where: { id: settings.id },
          data: {
            name,
            address,
            phone,
            email,
            taxRate: parseFloat(taxRate),
            currency,
            gstNumber,
          },
        });
      }

      return settings;
    } catch (error) {
      throw error;
    }
  },

  // Add these methods to settingsService

async getPrinterSettings() {
  try {
    let settings = await prisma.printerSettings.findFirst();

    if (!settings) {
      settings = await prisma.printerSettings.create({
        data: {
          printerName: '',
          kitchenPrinterName: null, // NEW
          paperWidth: 80,
          copies: 1,
          kotCopies: 1, // NEW
          enableSound: false,
          autoOpenDrawer: true,
        },
      });
    }

    return settings;
  } catch (error) {
    throw error;
  }
},

async updatePrinterSettings(data) {
  try {
    const { 
      printerName, 
      kitchenPrinterName, // NEW
      paperWidth, 
      copies, 
      kotCopies, // NEW
      enableSound, 
      autoOpenDrawer 
    } = data;

    let settings = await prisma.printerSettings.findFirst();

    if (!settings) {
      settings = await prisma.printerSettings.create({
        data: {
          printerName,
          kitchenPrinterName,
          paperWidth: parseInt(paperWidth),
          copies: parseInt(copies),
          kotCopies: parseInt(kotCopies || 1),
          enableSound,
          autoOpenDrawer,
        },
      });
    } else {
      settings = await prisma.printerSettings.update({
        where: { id: settings.id },
        data: {
          printerName,
          kitchenPrinterName,
          paperWidth: parseInt(paperWidth),
          copies: parseInt(copies),
          kotCopies: parseInt(kotCopies || 1),
          enableSound,
          autoOpenDrawer,
        },
      });
    }

    return settings;
  } catch (error) {
    throw error;
  }
},

};

export default settingsService;