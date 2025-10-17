import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
    
    // Test database with a simple query
    await prisma.$queryRaw`SELECT 1`;
    logger.info('✅ Database query test successful');
    
    return true;
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Database connection closed');
});

export { prisma, testConnection }; 