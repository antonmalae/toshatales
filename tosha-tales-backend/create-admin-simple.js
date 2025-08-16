import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('Создание администратора...');
    
    // Проверяем, существует ли уже администратор
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });
    
    if (existingAdmin) {
      console.log('Администратор уже существует:', existingAdmin.email);
      return;
    }
    
    // Создаем хеш пароля
    const password = 'admin123';
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Создаем администратора
    const admin = await prisma.user.create({
      data: {
        email: 'admin@tosha-tales.com',
        fullName: 'Администратор системы',
        passwordHash: passwordHash,
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('✅ Администратор успешно создан!');
    console.log('Email:', admin.email);
    console.log('Пароль:', password);
    console.log('Роль:', admin.role);
    
  } catch (error) {
    console.error('❌ Ошибка при создании администратора:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
