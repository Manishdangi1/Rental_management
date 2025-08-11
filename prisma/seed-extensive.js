const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting extensive database seeding...');

  // Clear existing data
  console.log('🧹 Clearing existing data...');
  await prisma.notification.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.rentalItem.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.pricelistItem.deleteMany();
  await prisma.pricelist.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSetting.deleteMany();

  // Create system settings
  console.log('⚙️ Creating system settings...');
  const systemSettings = [
    { key: 'NOTIFICATION_LEAD_DAYS', value: '3', description: 'Days before rental return to send notifications' },
    { key: 'LATE_FEE_PERCENTAGE', value: '10', description: 'Percentage of rental cost for late returns' },
    { key: 'SECURITY_DEPOSIT_PERCENTAGE', value: '20', description: 'Percentage of rental cost for security deposit' },
    { key: 'COMPANY_NAME', value: 'RentPro Equipment', description: 'Company name for invoices and communications' },
    { key: 'COMPANY_EMAIL', value: 'info@rentpro.com', description: 'Company email for communications' },
    { key: 'COMPANY_PHONE', value: '+1-555-123-4567', description: 'Company phone number' },
    { key: 'COMPANY_ADDRESS', value: '123 Business Ave, Tech City, TC 12345', description: 'Company address' }
  ];

  await prisma.systemSetting.createMany({ data: systemSettings });

  // Create extensive users
  console.log('👥 Creating extensive users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const userData = [
    // Admin users (same as END_USER)
    { email: 'admin@rentpro.com', firstName: 'John', lastName: 'Admin', role: 'ADMIN', phone: '+1-555-100-0001' },
    { email: 'manager@rentpro.com', firstName: 'Sarah', lastName: 'Manager', role: 'ADMIN', phone: '+1-555-100-0002' },
    
    // More Admin users (Staff members)
    { email: 'staff@rentpro.com', firstName: 'Mike', lastName: 'Staff', role: 'ADMIN', phone: '+1-555-100-0003' },
    { email: 'staff1@rentpro.com', firstName: 'Lisa', lastName: 'Helper', role: 'ADMIN', phone: '+1-555-100-0004' },
    { email: 'staff2@rentpro.com', firstName: 'David', lastName: 'Support', role: 'ADMIN', phone: '+1-555-100-0005' },
    
    // Customer users (many more for realistic data)
    { email: 'customer1@example.com', firstName: 'Alice', lastName: 'Johnson', role: 'CUSTOMER', phone: '+1-555-200-0001' },
    { email: 'customer2@example.com', firstName: 'Bob', lastName: 'Smith', role: 'CUSTOMER', phone: '+1-555-200-0002' },
    { email: 'customer3@example.com', firstName: 'Carol', lastName: 'Davis', role: 'CUSTOMER', phone: '+1-555-200-0003' },
    { email: 'customer4@example.com', firstName: 'Dan', lastName: 'Wilson', role: 'CUSTOMER', phone: '+1-555-200-0004' },
    { email: 'customer5@example.com', firstName: 'Eva', lastName: 'Brown', role: 'CUSTOMER', phone: '+1-555-200-0005' },
    { email: 'customer6@example.com', firstName: 'Frank', lastName: 'Miller', role: 'CUSTOMER', phone: '+1-555-200-0006' },
    { email: 'customer7@example.com', firstName: 'Grace', lastName: 'Taylor', role: 'CUSTOMER', phone: '+1-555-200-0007' },
    { email: 'customer8@example.com', firstName: 'Henry', lastName: 'Anderson', role: 'CUSTOMER', phone: '+1-555-200-0008' },
    { email: 'customer9@example.com', firstName: 'Ivy', lastName: 'Thomas', role: 'CUSTOMER', phone: '+1-555-200-0009' },
    { email: 'customer10@example.com', firstName: 'Jack', lastName: 'Jackson', role: 'CUSTOMER', phone: '+1-555-200-0010' },
    { email: 'customer11@example.com', firstName: 'Kate', lastName: 'White', role: 'CUSTOMER', phone: '+1-555-200-0011' },
    { email: 'customer12@example.com', firstName: 'Leo', lastName: 'Harris', role: 'CUSTOMER', phone: '+1-555-200-0012' },
    { email: 'customer13@example.com', firstName: 'Maya', lastName: 'Clark', role: 'CUSTOMER', phone: '+1-555-200-0013' },
    { email: 'customer14@example.com', firstName: 'Nick', lastName: 'Lewis', role: 'CUSTOMER', phone: '+1-555-200-0014' },
    { email: 'customer15@example.com', firstName: 'Olivia', lastName: 'Robinson', role: 'CUSTOMER', phone: '+1-555-200-0015' },
    { email: 'customer16@example.com', firstName: 'Paul', lastName: 'Walker', role: 'CUSTOMER', phone: '+1-555-200-0016' },
    { email: 'customer17@example.com', firstName: 'Quinn', lastName: 'Young', role: 'CUSTOMER', phone: '+1-555-200-0017' },
    { email: 'customer18@example.com', firstName: 'Ruby', lastName: 'King', role: 'CUSTOMER', phone: '+1-555-200-0018' },
    { email: 'customer19@example.com', firstName: 'Sam', lastName: 'Wright', role: 'CUSTOMER', phone: '+1-555-200-0019' },
    { email: 'customer20@example.com', firstName: 'Tina', lastName: 'Lopez', role: 'CUSTOMER', phone: '+1-555-200-0020' }
  ];

  console.log(`Creating ${userData.length} users...`);
  const users = await Promise.all(
    userData.map(user => 
      prisma.user.create({
        data: {
          ...user,
          password: hashedPassword,
          address: `${Math.floor(Math.random() * 9999)} ${user.lastName} St`,
          city: 'Tech City',
          state: 'TC',
          zipCode: '12345',
          country: 'USA',
          isActive: true,
          emailVerified: true
        }
      })
    )
  );
  console.log(`✅ Created ${users.length} users successfully`);

  // Create extensive categories
  console.log('📂 Creating extensive categories...');
  const categoryData = [
    { name: 'Tools & Equipment', description: 'Professional tools and equipment for various industries' },
    { name: 'Party & Events', description: 'Party supplies, decorations, and event equipment' },
    { name: 'Construction', description: 'Construction equipment and machinery' },
    { name: 'Electronics', description: 'Electronic devices and gadgets' },
    { name: 'Furniture', description: 'Furniture and home decor items' },
    { name: 'Vehicles', description: 'Cars, trucks, and other vehicles' },
    { name: 'Sports & Recreation', description: 'Sports equipment and recreational items' },
    { name: 'Medical Equipment', description: 'Medical devices and healthcare equipment' },
    { name: 'Audio & Visual', description: 'Audio and visual equipment for events' },
    { name: 'Outdoor & Camping', description: 'Outdoor and camping equipment' },
    { name: 'Kitchen & Catering', description: 'Kitchen equipment and catering supplies' },
    { name: 'Office & Business', description: 'Office equipment and business supplies' }
  ];

  const categories = await Promise.all(
    categoryData.map(cat => 
      prisma.category.create({
        data: {
          ...cat,
          image: `/images/categories/${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.jpg`
        }
      })
    )
  );

  // Create extensive products
  console.log('🛠️ Creating extensive products...');
  const productData = [
    // Tools & Equipment
    { name: 'Professional Drill Set', sku: 'TOOL-001', categoryId: categories[0].id, totalQuantity: 25, availableQuantity: 18 },
    { name: 'Circular Saw', sku: 'TOOL-002', categoryId: categories[0].id, totalQuantity: 20, availableQuantity: 12 },
    { name: 'Hammer Drill', sku: 'TOOL-003', categoryId: categories[0].id, totalQuantity: 15, availableQuantity: 8 },
    { name: 'Impact Wrench', sku: 'TOOL-004', categoryId: categories[0].id, totalQuantity: 18, availableQuantity: 10 },
    { name: 'Angle Grinder', sku: 'TOOL-005', categoryId: categories[0].id, totalQuantity: 22, availableQuantity: 15 },
    
    // Party & Events
    { name: 'Party Tent 20x30', sku: 'PARTY-001', categoryId: categories[1].id, totalQuantity: 8, availableQuantity: 3 },
    { name: 'Party Tent 10x15', sku: 'PARTY-002', categoryId: categories[1].id, totalQuantity: 12, availableQuantity: 7 },
    { name: 'LED Dance Floor', sku: 'PARTY-003', categoryId: categories[1].id, totalQuantity: 5, availableQuantity: 1 },
    { name: 'Balloon Arch Kit', sku: 'PARTY-004', categoryId: categories[1].id, totalQuantity: 20, availableQuantity: 15 },
    { name: 'Table & Chair Set', sku: 'PARTY-005', categoryId: categories[1].id, totalQuantity: 10, availableQuantity: 4 },
    
    // Construction
    { name: 'Mini Excavator', sku: 'CONST-001', categoryId: categories[2].id, totalQuantity: 3, availableQuantity: 1 },
    { name: 'Concrete Mixer', sku: 'CONST-002', categoryId: categories[2].id, totalQuantity: 8, availableQuantity: 5 },
    { name: 'Scaffolding Set', sku: 'CONST-003', categoryId: categories[2].id, totalQuantity: 6, availableQuantity: 2 },
    { name: 'Jackhammer', sku: 'CONST-004', categoryId: categories[2].id, totalQuantity: 12, availableQuantity: 8 },
    { name: 'Welding Machine', sku: 'CONST-005', categoryId: categories[2].id, totalQuantity: 10, availableQuantity: 6 },
    
    // Electronics
    { name: 'HD Projector', sku: 'ELEC-001', categoryId: categories[3].id, totalQuantity: 15, availableQuantity: 8 },
    { name: 'LED TV 65"', sku: 'ELEC-002', categoryId: categories[3].id, totalQuantity: 8, availableQuantity: 3 },
    { name: 'PA System', sku: 'ELEC-003', categoryId: categories[3].id, totalQuantity: 12, availableQuantity: 7 },
    { name: 'Laptop Set', sku: 'ELEC-004', categoryId: categories[3].id, totalQuantity: 20, availableQuantity: 12 },
    { name: 'Security Camera Kit', sku: 'ELEC-005', categoryId: categories[3].id, totalQuantity: 10, availableQuantity: 4 },
    
    // Furniture
    { name: 'Office Chair Set', sku: 'FURN-001', categoryId: categories[4].id, totalQuantity: 15, availableQuantity: 8 },
    { name: 'Conference Table', sku: 'FURN-002', categoryId: categories[4].id, totalQuantity: 8, availableQuantity: 3 },
    { name: 'Filing Cabinet Set', sku: 'FURN-003', categoryId: categories[4].id, totalQuantity: 12, availableQuantity: 7 },
    { name: 'Workstation Set', sku: 'FURN-004', categoryId: categories[4].id, totalQuantity: 10, availableQuantity: 5 },
    { name: 'Reception Furniture', sku: 'FURN-005', categoryId: categories[4].id, totalQuantity: 6, availableQuantity: 2 },
    
    // Vehicles
    { name: 'Moving Truck 24ft', sku: 'VEH-001', categoryId: categories[5].id, totalQuantity: 5, availableQuantity: 2 },
    { name: 'Pickup Truck', sku: 'VEH-002', categoryId: categories[5].id, totalQuantity: 8, availableQuantity: 4 },
    { name: 'Van Passenger', sku: 'VEH-003', categoryId: categories[5].id, totalQuantity: 6, availableQuantity: 3 },
    { name: 'Trailer 16ft', sku: 'VEH-004', categoryId: categories[5].id, totalQuantity: 10, availableQuantity: 6 },
    { name: 'Forklift', sku: 'VEH-005', categoryId: categories[5].id, totalQuantity: 4, availableQuantity: 1 },
    
    // Sports & Recreation
    { name: 'Basketball Court Setup', sku: 'SPORT-001', categoryId: categories[6].id, totalQuantity: 3, availableQuantity: 1 },
    { name: 'Tennis Court Setup', sku: 'SPORT-002', categoryId: categories[6].id, totalQuantity: 2, availableQuantity: 0 },
    { name: 'Gym Equipment Set', sku: 'SPORT-003', categoryId: categories[6].id, totalQuantity: 8, availableQuantity: 4 },
    { name: 'Swimming Pool', sku: 'SPORT-004', categoryId: categories[6].id, totalQuantity: 5, availableQuantity: 2 },
    { name: 'Golf Simulator', sku: 'SPORT-005', categoryId: categories[6].id, totalQuantity: 3, availableQuantity: 1 },
    
    // Medical Equipment
    { name: 'Hospital Bed', sku: 'MED-001', categoryId: categories[7].id, totalQuantity: 25, availableQuantity: 18 },
    { name: 'Wheelchair Set', sku: 'MED-002', categoryId: categories[7].id, totalQuantity: 30, availableQuantity: 22 },
    { name: 'Patient Monitor', sku: 'MED-003', categoryId: categories[7].id, totalQuantity: 15, availableQuantity: 8 },
    { name: 'Oxygen Tank Set', sku: 'MED-004', categoryId: categories[7].id, totalQuantity: 20, availableQuantity: 12 },
    { name: 'Medical Cart', sku: 'MED-005', categoryId: categories[7].id, totalQuantity: 18, availableQuantity: 10 },
    
    // Audio & Visual
    { name: 'Professional Sound System', sku: 'AV-001', categoryId: categories[8].id, totalQuantity: 8, availableQuantity: 3 },
    { name: 'Stage Lighting Kit', sku: 'AV-002', categoryId: categories[8].id, totalQuantity: 12, availableQuantity: 7 },
    { name: 'Video Wall Setup', sku: 'AV-003', categoryId: categories[8].id, totalQuantity: 5, availableQuantity: 1 },
    { name: 'Microphone Set', sku: 'AV-004', categoryId: categories[8].id, totalQuantity: 25, availableQuantity: 18 },
    { name: 'DJ Equipment Set', sku: 'AV-005', categoryId: categories[8].id, totalQuantity: 10, availableQuantity: 5 },
    
    // Outdoor & Camping
    { name: 'Camping Tent Set', sku: 'OUT-001', categoryId: categories[9].id, totalQuantity: 20, availableQuantity: 15 },
    { name: 'Portable Generator', sku: 'OUT-002', categoryId: categories[9].id, totalQuantity: 15, availableQuantity: 8 },
    { name: 'Camping Equipment Kit', sku: 'OUT-003', categoryId: categories[9].id, totalQuantity: 25, availableQuantity: 18 },
    { name: 'Outdoor Furniture Set', sku: 'OUT-004', categoryId: categories[9].id, totalQuantity: 12, availableQuantity: 7 },
    { name: 'BBQ Grill Set', sku: 'OUT-005', categoryId: categories[9].id, totalQuantity: 18, availableQuantity: 12 },
    
    // Kitchen & Catering
    { name: 'Commercial Oven', sku: 'KIT-001', categoryId: categories[10].id, totalQuantity: 8, availableQuantity: 4 },
    { name: 'Refrigerator Set', sku: 'KIT-002', categoryId: categories[10].id, totalQuantity: 12, availableQuantity: 7 },
    { name: 'Coffee Machine Set', sku: 'KIT-003', categoryId: categories[10].id, totalQuantity: 15, availableQuantity: 10 },
    { name: 'Dishwasher Set', sku: 'KIT-004', categoryId: categories[10].id, totalQuantity: 10, availableQuantity: 5 },
    { name: 'Kitchen Utensil Set', sku: 'KIT-005', categoryId: categories[10].id, totalQuantity: 30, availableQuantity: 22 },
    
    // Office & Business
    { name: 'Printer Set', sku: 'OFF-001', categoryId: categories[11].id, totalQuantity: 20, availableQuantity: 15 },
    { name: 'Scanner Set', sku: 'OFF-002', categoryId: categories[11].id, totalQuantity: 15, availableQuantity: 10 },
    { name: 'Shredder Set', sku: 'OFF-003', categoryId: categories[11].id, totalQuantity: 18, availableQuantity: 12 },
    { name: 'Whiteboard Set', sku: 'OFF-004', categoryId: categories[11].id, totalQuantity: 25, availableQuantity: 18 },
    { name: 'Presentation Equipment', sku: 'OFF-005', categoryId: categories[11].id, totalQuantity: 12, availableQuantity: 7 }
  ];

  const products = await Promise.all(
    productData.map(prod => 
      prisma.product.create({
        data: {
          ...prod,
          description: `${prod.name} - Professional quality equipment for rent`,
          isRentable: true,
          isActive: true,
          images: [`/images/products/${prod.sku.toLowerCase()}-1.jpg`],
          specifications: {
            brand: 'ProRent',
            category: prod.categoryId,
            weight: Math.floor(Math.random() * 50) + 5,
            dimensions: { length: Math.floor(Math.random() * 100) + 20, width: Math.floor(Math.random() * 50) + 10, height: Math.floor(Math.random() * 50) + 10 }
          },
          minimumRentalDays: 1,
          maximumRentalDays: 365,
          weight: Math.floor(Math.random() * 50) + 5
        }
      })
    )
  );

  // Create pricelists
  console.log('💰 Creating pricelists...');
  const pricelists = await Promise.all([
    prisma.pricelist.create({
      data: { name: 'Standard Pricing', description: 'Default pricing for all customers', isActive: true, validFrom: new Date(), customerType: 'REGULAR' }
    }),
    prisma.pricelist.create({
      data: { name: 'VIP Pricing', description: 'Discounted pricing for VIP customers', isActive: true, validFrom: new Date(), customerType: 'VIP' }
    }),
    prisma.pricelist.create({
      data: { name: 'Corporate Pricing', description: 'Special pricing for corporate clients', isActive: true, validFrom: new Date(), customerType: 'CORPORATE' }
    })
  ]);

  // Create pricelist items with realistic prices
  console.log('📋 Creating pricelist items...');
  const pricelistItems = [];
  
  // Define base prices for each product type
  const basePrices = {
    'TOOL': 75, 'PARTY': 200, 'CONST': 300, 'ELEC': 150, 'FURN': 120, 'VEH': 150,
    'SPORT': 400, 'MED': 100, 'AV': 400, 'OUT': 100, 'KIT': 150, 'OFF': 100
  };
  
  for (const product of products) {
    const productType = product.sku.split('-')[0];
    const basePrice = basePrices[productType] || 100;
    
    // Standard pricing
    pricelistItems.push(
      prisma.pricelistItem.create({
        data: {
          pricelistId: pricelists[0].id,
          productId: product.id,
          rentalType: 'DAILY',
          price: basePrice,
          currency: 'USD',
          minimumDays: 1,
          maximumDays: 30
        }
      })
    );
    
    // VIP pricing (10% discount)
    pricelistItems.push(
      prisma.pricelistItem.create({
        data: {
          pricelistId: pricelists[1].id,
          productId: product.id,
          rentalType: 'DAILY',
          price: Math.floor(basePrice * 0.9),
          currency: 'USD',
          minimumDays: 1,
          maximumDays: 30
        }
      })
    );
    
    // Corporate pricing (15% discount)
    pricelistItems.push(
      prisma.pricelistItem.create({
        data: {
          pricelistId: pricelists[2].id,
          productId: product.id,
          rentalType: 'DAILY',
          price: Math.floor(basePrice * 0.85),
          currency: 'USD',
          minimumDays: 1,
          maximumDays: 30
        }
      })
    );
  }
  
  await Promise.all(pricelistItems);

  // Create extensive rentals
  console.log('📦 Creating extensive rentals...');
  const rentalData = [];
  const statuses = ['COMPLETED', 'IN_PROGRESS', 'CONFIRMED', 'CANCELLED'];
  const customerUsers = users.filter(u => u.role === 'CUSTOMER');
  
  // Generate 50+ rentals over the past year
  for (let i = 0; i < 60; i++) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 365));
    const duration = Math.floor(Math.random() * 30) + 1;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    
    const customer = customerUsers[Math.floor(Math.random() * customerUsers.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const totalAmount = Math.floor(Math.random() * 1000) + 100;
    
    rentalData.push({
      customerId: customer.id,
      status,
      startDate,
      endDate,
      totalAmount,
      securityDeposit: Math.floor(totalAmount * 0.2),
      pickupAddress: `${Math.floor(Math.random() * 9999)} ${customer.lastName} St, Tech City, TC 12345`,
      returnAddress: `${Math.floor(Math.random() * 9999)} ${customer.lastName} St, Tech City, TC 12345`,
      notes: `Rental ${i + 1} - ${status.toLowerCase()}`
    });
  }

  const rentals = await Promise.all(
    rentalData.map(rental => prisma.rental.create({ data: rental }))
  );

  // Create rental items
  console.log('📝 Creating rental items...');
  const rentalItems = [];
  
  // Get standard pricing for products
  const standardPricing = await prisma.pricelistItem.findMany({
    where: { pricelistId: pricelists[0].id },
    select: { productId: true, price: true }
  });
  
  const priceMap = {};
  standardPricing.forEach(item => {
    priceMap[item.productId] = item.price;
  });
  
  for (const rental of rentals) {
    const numItems = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = products.sort(() => 0.5 - Math.random()).slice(0, numItems);
    
    for (const product of selectedProducts) {
      const quantity = Math.floor(Math.random() * 2) + 1;
      const unitPrice = priceMap[product.id] || 100; // Default price if not found
      const totalPrice = unitPrice * quantity;
      
      rentalItems.push(
        prisma.rentalItem.create({
          data: {
            rentalId: rental.id,
            productId: product.id,
            quantity,
            unitPrice,
            totalPrice,
            notes: `Rented ${quantity}x ${product.name}`
          }
        })
      );
    }
  }
  
  await Promise.all(rentalItems);

  // Create invoices (quotations)
  console.log('🧾 Creating invoices/quotations...');
  const invoiceData = [];
  
  for (let i = 0; i < 40; i++) {
    const rental = rentals[Math.floor(Math.random() * rentals.length)];
    const statuses = ['DRAFT', 'SENT', 'PAID', 'OVERDUE'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    invoiceData.push({
      rentalId: rental.id,
      customerId: rental.customerId,
      invoiceNumber: `INV-2024-${String(i + 1).padStart(3, '0')}`,
      amount: rental.totalAmount,
      tax: Math.floor(rental.totalAmount * 0.08),
      total: Math.floor(rental.totalAmount * 1.08),
      status,
      dueDate: new Date(rental.startDate),
      paidAt: status === 'PAID' ? new Date(rental.startDate.getTime() + Math.random() * 86400000) : null,
      notes: `Invoice for rental ${rental.id}`
    });
  }

  const invoices = await Promise.all(
    invoiceData.map(invoice => prisma.invoice.create({ data: invoice }))
  );

  // Create payments
  console.log('💳 Creating payments...');
  const paymentData = [];
  
  for (const invoice of invoices.filter(inv => inv.status === 'PAID')) {
    paymentData.push({
      rentalId: invoice.rentalId,
      customerId: invoice.customerId,
      amount: invoice.total,
      currency: 'USD',
      status: 'COMPLETED',
      method: ['CREDIT_CARD', 'STRIPE', 'BANK_TRANSFER'][Math.floor(Math.random() * 3)],
      transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      description: `Payment for invoice ${invoice.invoiceNumber}`
    });
  }

  const payments = await Promise.all(
    paymentData.map(payment => prisma.payment.create({ data: payment }))
  );

  console.log('✅ Extensive database seeding completed successfully!');
  console.log(`📊 Created ${users.length} users`);
  console.log(`📂 Created ${categories.length} categories`);
  console.log(`🛠️ Created ${products.length} products`);
  console.log(`💰 Created ${pricelists.length} pricelists`);
  console.log(`📦 Created ${rentals.length} rentals`);
  console.log(`🧾 Created ${invoices.length} invoices`);
  console.log(`💳 Created ${payments.length} payments`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 