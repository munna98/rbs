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
  console.log('\n🎉 Seed completed successfully!');
  console.log('Default admin credentials:');
  console.log('Username: admin');
  console.log('Password: admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });