const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

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

  await prisma.systemSetting.createMany({
    data: systemSettings
  });

  // Create users
  console.log('👥 Creating users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: 'admin@rentpro.com',
        password: hashedPassword,
        firstName: 'John',
        lastName: 'Admin',
        phone: '+1-555-100-0001',
        address: '123 Admin St',
        city: 'Tech City',
        state: 'TC',
        zipCode: '12345',
        country: 'USA',
        role: 'ADMIN',
        isActive: true,
        emailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'staff@rentpro.com',
        password: hashedPassword,
        firstName: 'Sarah',
        lastName: 'Staff',
        phone: '+1-555-100-0002',
        address: '456 Staff Ave',
        city: 'Tech City',
        state: 'TC',
        zipCode: '12345',
        country: 'USA',
        role: 'STAFF',
        isActive: true,
        emailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer1@example.com',
        password: hashedPassword,
        firstName: 'Mike',
        lastName: 'Customer',
        phone: '+1-555-200-0001',
        address: '789 Customer Rd',
        city: 'Tech City',
        state: 'TC',
        zipCode: '12345',
        country: 'USA',
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer2@example.com',
        password: hashedPassword,
        firstName: 'Lisa',
        lastName: 'Business',
        phone: '+1-555-200-0002',
        address: '321 Business Blvd',
        city: 'Tech City',
        state: 'TC',
        zipCode: '12345',
        country: 'USA',
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true
      }
    }),
    prisma.user.create({
      data: {
        email: 'customer3@example.com',
        password: hashedPassword,
        firstName: 'David',
        lastName: 'Contractor',
        phone: '+1-555-200-0003',
        address: '654 Contractor Ct',
        city: 'Tech City',
        state: 'TC',
        zipCode: '12345',
        country: 'USA',
        role: 'CUSTOMER',
        isActive: true,
        emailVerified: true
      }
    })
  ]);

  // Create categories
  console.log('📂 Creating categories...');
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Tools & Equipment',
        description: 'Professional tools and equipment for various industries',
        image: '/images/categories/tools.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Party & Events',
        description: 'Party supplies, decorations, and event equipment',
        image: '/images/categories/party.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Construction',
        description: 'Construction equipment and machinery',
        image: '/images/categories/construction.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Electronics',
        description: 'Electronic devices and gadgets',
        image: '/images/categories/electronics.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Furniture',
        description: 'Furniture and home decor items',
        image: '/images/categories/furniture.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Vehicles',
        description: 'Cars, trucks, and other vehicles',
        image: '/images/categories/vehicles.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Sports & Recreation',
        description: 'Sports equipment and recreational items',
        image: '/images/categories/sports.jpg'
      }
    }),
    prisma.category.create({
      data: {
        name: 'Medical Equipment',
        description: 'Medical devices and healthcare equipment',
        image: '/images/categories/medical.jpg'
      }
    })
  ]);

  // Create products
  console.log('🛠️ Creating products...');
  const products = await Promise.all([
    prisma.product.create({
      data: {
        name: 'Professional Drill Set',
        description: 'Complete professional drill set with multiple bits and attachments',
        sku: 'TOOL-001',
        categoryId: categories[0].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/drill-set-1.jpg', '/images/products/drill-set-2.jpg'],
        specifications: {
          brand: 'ProTool',
          power: '1200W',
          voltage: '120V',
          weight: '2.5kg',
          includes: ['Drill', 'Charger', '5 drill bits', 'Carrying case']
        },
        totalQuantity: 10,
        availableQuantity: 8,
        minimumRentalDays: 1,
        maximumRentalDays: 30,
        weight: 2.5,
        dimensions: { length: 30, width: 15, height: 25 }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Party Tent 20x30',
        description: 'Large party tent perfect for outdoor events',
        sku: 'PARTY-001',
        categoryId: categories[1].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/tent-1.jpg', '/images/products/tent-2.jpg'],
        specifications: {
          brand: 'EventPro',
          dimensions: '20ft x 30ft',
          capacity: '100 people',
          material: 'Waterproof polyester',
          includes: ['Tent', 'Poles', 'Stakes', 'Carrying bag']
        },
        totalQuantity: 5,
        availableQuantity: 3,
        minimumRentalDays: 1,
        maximumRentalDays: 7,
        weight: 45.0,
        dimensions: { length: 600, width: 900, height: 300 }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Excavator Mini',
        description: 'Mini excavator for small construction projects',
        sku: 'CONST-001',
        categoryId: categories[2].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/excavator-1.jpg'],
        specifications: {
          brand: 'ConstructionMax',
          engine: 'Diesel',
          horsepower: '25HP',
          bucketCapacity: '0.1 cubic yards',
          weight: '2.5 tons',
          includes: ['Machine', 'Bucket', 'Operator manual']
        },
        totalQuantity: 2,
        availableQuantity: 1,
        minimumRentalDays: 1,
        maximumRentalDays: 90,
        weight: 2500.0,
        dimensions: { length: 400, width: 150, height: 220 }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Projector HD',
        description: 'High-definition projector for presentations and events',
        sku: 'ELEC-001',
        categoryId: categories[3].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/projector-1.jpg', '/images/products/projector-2.jpg'],
        specifications: {
          brand: 'TechPro',
          resolution: '1920x1080',
          brightness: '3000 lumens',
          connectivity: ['HDMI', 'VGA', 'USB', 'WiFi'],
          includes: ['Projector', 'Remote', 'Power cable', 'Carrying case']
        },
        totalQuantity: 8,
        availableQuantity: 6,
        minimumRentalDays: 1,
        maximumRentalDays: 14,
        weight: 2.8,
        dimensions: { length: 28, width: 20, height: 8 }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Office Chair Set',
        description: 'Set of 10 ergonomic office chairs',
        sku: 'FURN-001',
        categoryId: categories[4].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/office-chairs-1.jpg'],
        specifications: {
          brand: 'ComfortMax',
          material: 'Mesh fabric',
          features: ['Adjustable height', 'Lumbar support', 'Swivel', 'Rolling wheels'],
          includes: ['10 chairs', 'Assembly tools', 'Care instructions']
        },
        totalQuantity: 5,
        availableQuantity: 3,
        minimumRentalDays: 7,
        maximumRentalDays: 365,
        weight: 15.0,
        dimensions: { length: 60, width: 60, height: 120 }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Moving Truck',
        description: '24-foot moving truck for residential and commercial moves',
        sku: 'VEH-001',
        categoryId: categories[5].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/moving-truck-1.jpg'],
        specifications: {
          brand: 'MovePro',
          capacity: '24ft',
          fuelType: 'Gasoline',
          transmission: 'Automatic',
          includes: ['Truck', 'Fuel', 'Insurance', 'Moving blankets']
        },
        totalQuantity: 3,
        availableQuantity: 2,
        minimumRentalDays: 1,
        maximumRentalDays: 7,
        weight: 3500.0,
        dimensions: { length: 720, width: 240, height: 300 }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Basketball Court Setup',
        description: 'Complete basketball court setup for events',
        sku: 'SPORT-001',
        categoryId: categories[6].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/basketball-court-1.jpg'],
        specifications: {
          brand: 'SportEvent',
          courtSize: 'Full court',
          surface: 'Professional vinyl',
          includes: ['Court surface', 'Baskets', 'Scoreboard', 'Balls', 'Setup crew']
        },
        totalQuantity: 2,
        availableQuantity: 1,
        minimumRentalDays: 1,
        maximumRentalDays: 7,
        weight: 500.0,
        dimensions: { length: 2800, width: 1500, height: 300 }
      }
    }),
    prisma.product.create({
      data: {
        name: 'Hospital Bed',
        description: 'Electric hospital bed for medical facilities',
        sku: 'MED-001',
        categoryId: categories[7].id,
        isRentable: true,
        isActive: true,
        images: ['/images/products/hospital-bed-1.jpg'],
        specifications: {
          brand: 'MedEquip',
          type: 'Electric',
          features: ['Adjustable height', 'Trendelenburg', 'Side rails', 'Wheels'],
          includes: ['Bed', 'Mattress', 'Remote control', 'Delivery and setup']
        },
        totalQuantity: 15,
        availableQuantity: 12,
        minimumRentalDays: 30,
        maximumRentalDays: 365,
        weight: 120.0,
        dimensions: { length: 210, width: 100, height: 60 }
      }
    })
  ]);

  // Create pricelists
  console.log('💰 Creating pricelists...');
  const pricelists = await Promise.all([
    prisma.pricelist.create({
      data: {
        name: 'Standard Pricing',
        description: 'Default pricing for all customers',
        isActive: true,
        validFrom: new Date(),
        customerType: 'REGULAR'
      }
    }),
    prisma.pricelist.create({
      data: {
        name: 'VIP Pricing',
        description: 'Discounted pricing for VIP customers',
        isActive: true,
        validFrom: new Date(),
        customerType: 'VIP'
      }
    }),
    prisma.pricelist.create({
      data: {
        name: 'Corporate Pricing',
        description: 'Special pricing for corporate clients',
        isActive: true,
        validFrom: new Date(),
        customerType: 'CORPORATE'
      }
    })
  ]);

  // Create pricelist items
  console.log('📋 Creating pricelist items...');
  const pricelistItems = [];
  
  for (const product of products) {
    // Standard pricing
    pricelistItems.push(
      prisma.pricelistItem.create({
        data: {
          pricelistId: pricelists[0].id,
          productId: product.id,
          rentalType: 'DAILY',
          price: Math.floor(Math.random() * 200) + 50, // Random price between 50-250
          currency: 'USD',
          minimumDays: 1,
          maximumDays: 30
        }
      })
    );
    
    // VIP pricing (10% discount)
    const vipPrice = Math.floor((Math.floor(Math.random() * 200) + 50) * 0.9);
    pricelistItems.push(
      prisma.pricelistItem.create({
        data: {
          pricelistId: pricelists[1].id,
          productId: product.id,
          rentalType: 'DAILY',
          price: vipPrice,
          currency: 'USD',
          minimumDays: 1,
          maximumDays: 30
        }
      })
    );
    
    // Corporate pricing (15% discount)
    const corporatePrice = Math.floor((Math.floor(Math.random() * 200) + 50) * 0.85);
    pricelistItems.push(
      prisma.pricelistItem.create({
        data: {
          pricelistId: pricelists[2].id,
          productId: product.id,
          rentalType: 'DAILY',
          price: corporatePrice,
          currency: 'USD',
          minimumDays: 1,
          maximumDays: 30
        }
      })
    );
  }
  
  await Promise.all(pricelistItems);

  // Create rentals
  console.log('📦 Creating rentals...');
  const rentals = await Promise.all([
    prisma.rental.create({
      data: {
        customerId: users[2].id, // Mike Customer
        status: 'COMPLETED',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-03'),
        totalAmount: 150.00,
        securityDeposit: 30.00,
        pickupAddress: '789 Customer Rd, Tech City, TC 12345',
        returnAddress: '789 Customer Rd, Tech City, TC 12345',
        notes: 'Customer requested early pickup'
      }
    }),
    prisma.rental.create({
      data: {
        customerId: users[3].id, // Lisa Business
        status: 'IN_PROGRESS',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-15'),
        totalAmount: 450.00,
        securityDeposit: 90.00,
        pickupAddress: '321 Business Blvd, Tech City, TC 12345',
        returnAddress: '321 Business Blvd, Tech City, TC 12345',
        notes: 'Business event setup'
      }
    }),
    prisma.rental.create({
      data: {
        customerId: users[4].id, // David Contractor
        status: 'CONFIRMED',
        startDate: new Date('2024-08-20'),
        endDate: new Date('2024-09-20'),
        totalAmount: 1200.00,
        securityDeposit: 240.00,
        pickupAddress: '654 Contractor Ct, Tech City, TC 12345',
        returnAddress: '654 Contractor Ct, Tech City, TC 12345',
        notes: 'Long-term construction project'
      }
    })
  ]);

  // Create rental items
  console.log('📝 Creating rental items...');
  const rentalItems = await Promise.all([
    prisma.rentalItem.create({
      data: {
        rentalId: rentals[0].id,
        productId: products[0].id, // Drill Set
        quantity: 1,
        unitPrice: 50.00,
        totalPrice: 50.00,
        notes: 'Customer was very satisfied with the quality'
      }
    }),
    prisma.rentalItem.create({
      data: {
        rentalId: rentals[1].id,
        productId: products[1].id, // Party Tent
        quantity: 1,
        unitPrice: 150.00,
        totalPrice: 150.00,
        notes: 'Event setup completed successfully'
      }
    }),
    prisma.rentalItem.create({
      data: {
        rentalId: rentals[1].id,
        productId: products[3].id, // Projector
        quantity: 1,
        unitPrice: 90.00,
        totalPrice: 90.00,
        notes: 'Event setup completed successfully'
      }
    }),
    prisma.rentalItem.create({
      data: {
        rentalId: rentals[2].id,
        productId: products[2].id, // Excavator
        quantity: 1,
        unitPrice: 40.00,
        totalPrice: 40.00,
        notes: 'Construction project in progress'
      }
    })
  ]);

  // Create deliveries
  console.log('🚚 Creating deliveries...');
  const deliveries = await Promise.all([
    prisma.delivery.create({
      data: {
        rentalId: rentals[0].id,
        type: 'PICKUP',
        status: 'COMPLETED',
        scheduledAt: new Date('2024-07-01T09:00:00Z'),
        completedAt: new Date('2024-07-01T09:15:00Z'),
        address: '789 Customer Rd, Tech City, TC 12345',
        contactName: 'Mike Customer',
        contactPhone: '+1-555-200-0001',
        notes: 'Customer was ready and waiting'
      }
    }),
    prisma.delivery.create({
      data: {
        rentalId: rentals[0].id,
        type: 'RETURN',
        status: 'COMPLETED',
        scheduledAt: new Date('2024-07-03T17:00:00Z'),
        completedAt: new Date('2024-07-03T17:10:00Z'),
        address: '789 Customer Rd, Tech City, TC 12345',
        contactName: 'Mike Customer',
        contactPhone: '+1-555-200-0001',
        notes: 'Equipment returned in excellent condition'
      }
    }),
    prisma.delivery.create({
      data: {
        rentalId: rentals[1].id,
        type: 'PICKUP',
        status: 'COMPLETED',
        scheduledAt: new Date('2024-08-10T08:00:00Z'),
        completedAt: new Date('2024-08-10T08:20:00Z'),
        address: '321 Business Blvd, Tech City, TC 12345',
        contactName: 'Lisa Business',
        contactPhone: '+1-555-200-0002',
        notes: 'Business setup completed'
      }
    })
  ]);

  // Create payments
  console.log('💳 Creating payments...');
  const payments = await Promise.all([
    prisma.payment.create({
      data: {
        rentalId: rentals[0].id,
        customerId: users[2].id,
        amount: 150.00,
        currency: 'USD',
        status: 'COMPLETED',
        method: 'CREDIT_CARD',
        transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        description: 'Payment for drill set rental'
      }
    }),
    prisma.payment.create({
      data: {
        rentalId: rentals[1].id,
        customerId: users[3].id,
        amount: 450.00,
        currency: 'USD',
        status: 'COMPLETED',
        method: 'STRIPE',
        transactionId: 'TXN_' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        description: 'Payment for event equipment rental'
      }
    }),
    prisma.payment.create({
      data: {
        rentalId: rentals[2].id,
        customerId: users[4].id,
        amount: 1200.00,
        currency: 'USD',
        status: 'PENDING',
        method: 'BANK_TRANSFER',
        description: 'Payment for long-term equipment rental'
      }
    })
  ]);

  // Create invoices
  console.log('🧾 Creating invoices...');
  const invoices = await Promise.all([
    prisma.invoice.create({
      data: {
        rentalId: rentals[0].id,
        customerId: users[2].id,
        invoiceNumber: 'INV-2024-001',
        amount: 150.00,
        tax: 12.00,
        total: 162.00,
        status: 'PAID',
        dueDate: new Date('2024-07-01'),
        paidAt: new Date('2024-07-01T10:00:00Z'),
        notes: 'Invoice for drill set rental'
      }
    }),
    prisma.invoice.create({
      data: {
        rentalId: rentals[1].id,
        customerId: users[3].id,
        invoiceNumber: 'INV-2024-002',
        amount: 450.00,
        tax: 36.00,
        total: 486.00,
        status: 'PAID',
        dueDate: new Date('2024-08-10'),
        paidAt: new Date('2024-08-10T09:00:00Z'),
        notes: 'Invoice for event equipment rental'
      }
    }),
    prisma.invoice.create({
      data: {
        rentalId: rentals[2].id,
        customerId: users[4].id,
        invoiceNumber: 'INV-2024-003',
        amount: 1200.00,
        tax: 96.00,
        total: 1296.00,
        status: 'SENT',
        dueDate: new Date('2024-08-20'),
        notes: 'Invoice for long-term equipment rental'
      }
    })
  ]);

  // Create notifications
  console.log('🔔 Creating notifications...');
  const notifications = await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[2].id,
        rentalId: rentals[0].id,
        type: 'RENTAL_CONFIRMATION',
        title: 'Rental Confirmed',
        message: 'Your rental for Professional Drill Set has been confirmed for July 1-3, 2024.',
        isRead: true,
        channel: 'EMAIL'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        rentalId: rentals[0].id,
        type: 'PICKUP_REMINDER',
        title: 'Pickup Reminder',
        message: 'Reminder: Your equipment pickup is scheduled for tomorrow at 9:00 AM.',
        isRead: true,
        channel: 'EMAIL'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[2].id,
        rentalId: rentals[0].id,
        type: 'RETURN_REMINDER',
        title: 'Return Reminder',
        message: 'Reminder: Your equipment return is scheduled for July 3rd at 5:00 PM.',
        isRead: true,
        channel: 'EMAIL'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[3].id,
        rentalId: rentals[1].id,
        type: 'RENTAL_CONFIRMATION',
        title: 'Rental Confirmed',
        message: 'Your rental for Party Tent and Projector has been confirmed for August 10-15, 2024.',
        isRead: false,
        channel: 'EMAIL'
      }
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        rentalId: rentals[2].id,
        type: 'RENTAL_CONFIRMATION',
        title: 'Rental Confirmed',
        message: 'Your rental for Mini Excavator has been confirmed for August 20 - September 20, 2024.',
        isRead: false,
        channel: 'EMAIL'
      }
    })
  ]);

  console.log('✅ Database seeding completed successfully!');
  console.log(`📊 Created ${users.length} users`);
  console.log(`📂 Created ${categories.length} categories`);
  console.log(`🛠️ Created ${products.length} products`);
  console.log(`💰 Created ${pricelists.length} pricelists`);
  console.log(`📦 Created ${rentals.length} rentals`);
  console.log(`🚚 Created ${deliveries.length} deliveries`);
  console.log(`💳 Created ${payments.length} payments`);
  console.log(`🧾 Created ${invoices.length} invoices`);
  console.log(`🔔 Created ${notifications.length} notifications`);
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 