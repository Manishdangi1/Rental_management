const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

// Test database connection
async function testConnection() {
  try {
    await prisma.$connect();
    console.log(' Database connection successful');
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1);
  }
}

// Initialize database with default data
async function initializeDatabase() {
  try {
    // Check if categories exist
    const categoryCount = await prisma.category.count();
    
    if (categoryCount === 0) {
      console.log(' Initializing database with default data...');
      
      // Create default categories
      const defaultCategories = [
        { name: 'Tools & Equipment', description: 'Professional tools and equipment for various industries' },
        { name: 'Party & Events', description: 'Party supplies, decorations, and event equipment' },
        { name: 'Construction', description: 'Construction equipment and machinery' },
        { name: 'Electronics', description: 'Electronic devices and gadgets' },
        { name: 'Furniture', description: 'Furniture and home decor items' },
        { name: 'Vehicles', description: 'Cars, trucks, and other vehicles' },
        { name: 'Sports & Recreation', description: 'Sports equipment and recreational items' },
        { name: 'Medical Equipment', description: 'Medical devices and healthcare equipment' }
      ];

      await prisma.category.createMany({
        data: defaultCategories
      });

      // Create default pricelist
      const defaultPricelist = await prisma.pricelist.create({
        data: {
          name: 'Standard Pricing',
          description: 'Default pricing for all customers',
          validFrom: new Date(),
          isActive: true
        }
      });

      // Create system settings
      const systemSettings = [
        { key: 'NOTIFICATION_LEAD_DAYS', value: '3', description: 'Days before rental return to send notifications' },
        { key: 'LATE_FEE_PERCENTAGE', value: '10', description: 'Percentage of rental cost for late returns' },
        { key: 'SECURITY_DEPOSIT_PERCENTAGE', value: '20', description: 'Percentage of rental cost for security deposit' },
        { key: 'COMPANY_NAME', value: 'Your Rental Company', description: 'Company name for invoices and communications' },
        { key: 'COMPANY_EMAIL', value: 'info@yourcompany.com', description: 'Company email for communications' },
        { key: 'COMPANY_PHONE', value: '+1234567890', description: 'Company phone number' },
        { key: 'COMPANY_ADDRESS', value: '123 Business St, City, State 12345', description: 'Company address' }
      ];

      await prisma.systemSetting.createMany({
        data: systemSettings
      });

      console.log(' Database initialized successfully');
    }
  } catch (error) {
    console.error(' Database initialization failed:', error);
  }
}

module.exports = {
  prisma,
  testConnection,
  initializeDatabase
}; 