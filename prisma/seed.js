import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create default admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ User created:', admin.username);

  // Create sample cashier
  const cashierPassword = await bcrypt.hash('cashier123', 10);
  await prisma.user.upsert({
    where: { username: 'cashier' },
    update: {},
    create: {
      username: 'cashier',
      passwordHash: cashierPassword,
      role: 'CASHIER',
    },
  });

  console.log('✅ Sample users created');

  // Create sample categories
  const categories = [
    { name: 'Appetizers', description: 'Starters and appetizers' },
    { name: 'Main Course', description: 'Main dishes' },
    { name: 'Beverages', description: 'Drinks' },
    { name: 'Desserts', description: 'Desserts and sweets' },
    { name: 'Breads', description: 'Breads and rotis' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { name: cat.name },
      update: {},
      create: cat,
    });
  }

  console.log('✅ Categories created');

  // Create sample tables
  for (let i = 1; i <= 10; i++) {
    await prisma.table.upsert({
      where: { tableNumber: i },
      update: {},
      create: {
        tableNumber: i,
        capacity: 4,
        status: 'AVAILABLE',
      },
    });
  }

  console.log('✅ Tables created (10 tables)');

  // Create default restaurant settings
  await prisma.restaurantSettings.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      name: 'My Restaurant',
      address: '123 Main Street, City, State',
      phone: '+91 1234567890',
      email: 'restaurant@example.com',
      taxRate: 5,
      currency: 'INR',
      gstNumber: '',
    },
  });

  // Create default printer settings
  await prisma.printerSettings.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      printerName: '',
      paperWidth: 80,
      copies: 1,
      enableSound: false,
      autoOpenDrawer: true,
    },
  });

  console.log('✅ Printer settings created');

  console.log('✅ Restaurant settings created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('Default credentials:');
  console.log('Admin - Username: admin, Password: admin123');
  console.log('Cashier - Username: cashier, Password: cashier123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });