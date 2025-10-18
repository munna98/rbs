import prisma from './prisma.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { app } from 'electron';

const menuService = {
  async getMenuItems() {
    try {
      const items = await prisma.menuItem.findMany({
        include: {
          category: true,
        },
      });
      return items;
    } catch (error) {
      throw error;
    }
  },

  async getCategories() {
    try {
      const categories = await prisma.category.findMany();
      return categories;
    } catch (error) {
      throw error;
    }
  },

async createMenuItem(data) {
  try {
    let imagePath = null;
    if (data.image) {
      const imageDir = join(app.getPath('userData'), 'images');
      mkdirSync(imageDir, { recursive: true });

      const imageName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      imagePath = join(imageDir, imageName);

      if (data.image.startsWith('data:image')) {
        const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
        writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
      }
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        categoryId: data.categoryId,
        name: data.name,
        code: data.code.toUpperCase(), // NEW: Store code in uppercase
        price: parseFloat(data.price),
        image: imagePath,
        available: true,
      },
      include: {
        category: true,
      },
    });

    return menuItem;
  } catch (error) {
    throw error;
  }
},

async updateMenuItem(data) {
  try {
    let updateData = {
      categoryId: data.categoryId,
      name: data.name,
      code: data.code.toUpperCase(), // NEW
      price: parseFloat(data.price),
      available: data.available,
    };

    if (data.image && data.image.startsWith('data:image')) {
      const imageDir = join(app.getPath('userData'), 'images');
      mkdirSync(imageDir, { recursive: true });

      const imageName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`;
      const imagePath = join(imageDir, imageName);

      const base64Data = data.image.replace(/^data:image\/\w+;base64,/, '');
      writeFileSync(imagePath, Buffer.from(base64Data, 'base64'));
      updateData.image = imagePath;
    }

    const menuItem = await prisma.menuItem.update({
      where: { id: data.id },
      data: updateData,
      include: {
        category: true,
      },
    });

    return menuItem;
  } catch (error) {
    throw error;
  }
},

  async deleteMenuItem(id) {
    try {
      await prisma.menuItem.delete({
        where: { id },
      });
      return id;
    } catch (error) {
      throw error;
    }
  },

  async createCategory(data) {
    try {
      const category = await prisma.category.create({
        data: {
          name: data.name,
          description: data.description,
        },
      });
      return category;
    } catch (error) {
      throw error;
    }
  },
};

export default menuService;