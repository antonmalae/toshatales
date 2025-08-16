import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import readline from 'readline';

const prisma = new PrismaClient();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createAdmin() {
  try {
    console.log('Создание администратора системы...\n');
    
    const email = await question('Введите email: ');
    const fullName = await question('Введите полное имя: ');
    const password = await question('Введите пароль (минимум 8 символов): ');
    
    if (password.length < 8) {
      console.error('Пароль должен содержать минимум 8 символов');
      process.exit(1);
    }
    
    // Проверка существования пользователя
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      console.error('Пользователь с таким email уже существует');
      process.exit(1);
    }
    
    // Хеширование пароля
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Создание пользователя
    const user = await prisma.user.create({
      data: {
        email,
        fullName,
        passwordHash,
        role: 'ADMIN',
        isActive: true
      }
    });
    
    console.log('\n✅ Администратор успешно создан!');
    console.log(`ID: ${user.id}`);
    console.log(`Email: ${user.email}`);
    console.log(`Имя: ${user.fullName}`);
    console.log(`Роль: ${user.role}`);
    console.log(`Статус: ${user.isActive ? 'Активен' : 'Неактивен'}`);
    
  } catch (error) {
    console.error('Ошибка при создании администратора:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    rl.close();
  }
}

createAdmin();
