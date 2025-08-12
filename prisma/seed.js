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
        specifications: JSON.stringify({
          brand: 'ProTool',
          power: '1200W',
          voltage: '120V',
          weight: '2.5kg',
          includes: ['Drill', 'Charger', '5 drill bits', 'Carrying case']
        }),
        totalQuantity: 10,
        availableQuantity: 8,
        minimumRentalDays: 1,
        maximumRentalDays: 30,
        weight: 2.5,
        dimensions: JSON.stringify({ length: 30, width: 15, height: 25 })
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
        specifications: JSON.stringify({
          brand: 'EventPro',
          dimensions: '20ft x 30ft',
          capacity: '100 people',
          material: 'Waterproof polyester',
          includes: ['Tent', 'Poles', 'Stakes', 'Carrying bag']
        }),
        totalQuantity: 5,
        availableQuantity: 3,
        minimumRentalDays: 1,
        maximumRentalDays: 7,
        weight: 45.0,
        dimensions: JSON.stringify({ length: 600, width: 900, height: 300 })
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
        specifications: JSON.stringify({
          brand: 'ConstructionMax',
          engine: 'Diesel',
          horsepower: '25HP',
          bucketCapacity: '0.1 cubic yards',
          weight: '2.5 tons',
          includes: ['Machine', 'Bucket', 'Operator manual']
        }),
        totalQuantity: 2,
        availableQuantity: 1,
        minimumRentalDays: 1,
        maximumRentalDays: 90,
        weight: 2500.0,
        dimensions: JSON.stringify({ length: 400, width: 150, height: 220 })
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
        specifications: JSON.stringify({
          brand: 'TechPro',
          resolution: '1920x1080',
          brightness: '3000 lumens',
          connectivity: ['HDMI', 'VGA', 'USB', 'WiFi'],
          includes: ['Projector', 'Remote', 'Power cable', 'Carrying case']
        }),
        totalQuantity: 8,
        availableQuantity: 6,
        minimumRentalDays: 1,
        maximumRentalDays: 14,
        weight: 2.8,
        dimensions: JSON.stringify({ length: 28, width: 20, height: 8 })
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
        specifications: JSON.stringify({
          brand: 'ComfortMax',
          material: 'Mesh fabric',
          features: ['Adjustable height', 'Lumbar support', 'Swivel', 'Rolling wheels'],
          includes: ['10 chairs', 'Assembly tools', 'Care instructions']
        }),
        totalQuantity: 5,
        availableQuantity: 3,
        minimumRentalDays: 7,
        maximumRentalDays: 365,
        weight: 15.0,
        dimensions: JSON.stringify({ length: 60, width: 60, height: 120 })
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
        specifications: JSON.stringify({
          brand: 'RentAMove',
          capacity: '24 feet',
          fuelType: 'Gasoline',
          transmission: 'Automatic',
          includes: ['Truck', 'Fuel', 'Insurance', 'Moving blankets']
        }),
        totalQuantity: 3,
        availableQuantity: 2,
        minimumRentalDays: 1,
        maximumRentalDays: 7,
        weight: 4500.0,
        dimensions: JSON.stringify({ length: 720, width: 240, height: 300 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Laptop Workstation',
        description: 'High-performance laptop with docking station for remote work',
        sku: 'TECH-001',
        categoryId: categories[3].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'TechPro',
          processor: 'Intel i7-11th Gen',
          ram: '16GB DDR4',
          storage: '512GB SSD',
          display: '15.6" Full HD',
          includes: ['Laptop', 'Docking station', 'Mouse', 'Keyboard', 'Charger']
        }),
        totalQuantity: 15,
        availableQuantity: 12,
        minimumRentalDays: 1,
        maximumRentalDays: 90,
        weight: 2.2,
        dimensions: JSON.stringify({ length: 36, width: 24, height: 2 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Garden Tools Set',
        description: 'Complete set of professional garden tools for landscaping',
        sku: 'GARDEN-001',
        categoryId: categories[0].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'GreenThumb',
          includes: ['Shovel', 'Rake', 'Hoe', 'Pruners', 'Gloves', 'Tool belt'],
          material: 'Stainless steel',
          handleMaterial: 'Hardwood'
        }),
        totalQuantity: 20,
        availableQuantity: 18,
        minimumRentalDays: 1,
        maximumRentalDays: 30,
        weight: 8.5,
        dimensions: JSON.stringify({ length: 120, width: 40, height: 15 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Sound System Pro',
        description: 'Professional sound system for events and parties',
        sku: 'AUDIO-001',
        categoryId: categories[3].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'SoundMax',
          power: '2000W RMS',
          speakers: '2x 15" woofers, 2x horn tweeters',
          connectivity: ['Bluetooth', 'USB', 'XLR', 'RCA'],
          includes: ['Speakers', 'Mixer', 'Microphones', 'Cables', 'Stands']
        }),
        totalQuantity: 6,
        availableQuantity: 4,
        minimumRentalDays: 1,
        maximumRentalDays: 14,
        weight: 45.0,
        dimensions: JSON.stringify({ length: 60, width: 40, height: 80 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Camping Equipment Set',
        description: 'Complete camping set for outdoor adventures',
        sku: 'OUTDOOR-001',
        categoryId: categories[1].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'AdventurePro',
          includes: ['4-person tent', 'Sleeping bags', 'Camping stove', 'Cooler', 'Lantern'],
          tentCapacity: '4 people',
          weatherRating: '3-season',
          material: 'Waterproof nylon'
        }),
        totalQuantity: 12,
        availableQuantity: 10,
        minimumRentalDays: 2,
        maximumRentalDays: 21,
        weight: 25.0,
        dimensions: JSON.stringify({ length: 80, width: 60, height: 40 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Photography Studio Kit',
        description: 'Professional photography studio setup for portraits and events',
        sku: 'PHOTO-001',
        categoryId: categories[3].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'PhotoPro',
          includes: ['Camera', 'Lenses', 'Lighting setup', 'Backdrop', 'Tripod'],
          camera: 'Canon EOS R6',
          resolution: '20.1MP',
          video: '4K recording'
        }),
        totalQuantity: 4,
        availableQuantity: 3,
        minimumRentalDays: 1,
        maximumRentalDays: 14,
        weight: 12.0,
        dimensions: JSON.stringify({ length: 50, width: 40, height: 30 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Fitness Equipment Set',
        description: 'Complete home gym setup for fitness enthusiasts',
        sku: 'FITNESS-001',
        categoryId: categories[4].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'FitMax',
          includes: ['Treadmill', 'Dumbbells', 'Resistance bands', 'Yoga mat', 'Bench'],
          treadmill: 'Motorized, 12 programs',
          weightRange: '5-50 lbs dumbbells',
          spaceRequired: '10x12 feet'
        }),
        totalQuantity: 8,
        availableQuantity: 6,
        minimumRentalDays: 7,
        maximumRentalDays: 180,
        weight: 150.0,
        dimensions: JSON.stringify({ length: 180, width: 144, height: 60 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Cleaning Equipment Set',
        description: 'Professional cleaning equipment for commercial and residential use',
        sku: 'CLEAN-001',
        categoryId: categories[0].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'CleanPro',
          includes: ['Vacuum cleaner', 'Steam mop', 'Floor buffer', 'Cleaning supplies'],
          vacuumPower: '2000W',
          steamTemperature: '212°F',
          suitableFor: ['Hardwood', 'Tile', 'Carpet']
        }),
        totalQuantity: 15,
        availableQuantity: 13,
        minimumRentalDays: 1,
        maximumRentalDays: 30,
        weight: 35.0,
        dimensions: JSON.stringify({ length: 100, width: 60, height: 40 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Wedding Decor Package',
        description: 'Elegant wedding decoration package for special occasions',
        sku: 'EVENT-001',
        categoryId: categories[1].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'EleganceEvents',
          includes: ['Table linens', 'Chair covers', 'Centerpieces', 'Lighting', 'Arches'],
          colorOptions: ['White', 'Ivory', 'Champagne', 'Rose gold'],
          setupIncluded: true,
          capacity: 'Up to 200 guests'
        }),
        totalQuantity: 10,
        availableQuantity: 8,
        minimumRentalDays: 1,
        maximumRentalDays: 3,
        weight: 80.0,
        dimensions: JSON.stringify({ length: 200, width: 150, height: 100 })
      }
    }),
    prisma.product.create({
      data: {
        name: 'Medical Equipment Kit',
        description: 'Essential medical equipment for healthcare professionals',
        sku: 'MEDICAL-001',
        categoryId: categories[3].id,
        isRentable: true,
        isActive: true,
        specifications: JSON.stringify({
          brand: 'MediCare',
          includes: ['Blood pressure monitor', 'Thermometer', 'Stethoscope', 'Pulse oximeter'],
          accuracy: 'FDA approved',
          batteryLife: 'Up to 1000 readings',
          suitableFor: ['Home care', 'Clinics', 'Emergency response']
        }),
        totalQuantity: 25,
        availableQuantity: 22,
        minimumRentalDays: 1,
        maximumRentalDays: 90,
        weight: 3.5,
        dimensions: JSON.stringify({ length: 30, width: 25, height: 15 })
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
        orderNumber: 'RO-2024-001',
        customerId: users[1].id, // Mike Customer (was users[2])
        customerName: 'Mike Customer',
        status: 'RETURNED',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-03'),
        totalAmount: 150.00,
        subtotal: 150.00,
        tax: 0.00,
        securityDeposit: 30.00,
        pickupAddress: '789 Customer Rd, Tech City, TC 12345',
        returnAddress: '789 Customer Rd, Tech City, TC 12345',
        notes: 'Customer requested early pickup'
      }
    }),
    prisma.rental.create({
      data: {
        orderNumber: 'RO-2024-002',
        customerId: users[2].id, // Lisa Business (was users[3])
        customerName: 'Lisa Business',
        status: 'PICKED_UP',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-15'),
        totalAmount: 450.00,
        subtotal: 450.00,
        tax: 0.00,
        securityDeposit: 90.00,
        pickupAddress: '321 Business Blvd, Tech City, TC 12345',
        returnAddress: '321 Business Blvd, Tech City, TC 12345',
        notes: 'Business event setup'
      }
    }),
    prisma.rental.create({
      data: {
        orderNumber: 'RO-2024-003',
        customerId: users[3].id, // David Contractor (was users[4])
        customerName: 'David Contractor',
        status: 'QUOTATION_SENT',
        startDate: new Date('2024-08-20'),
        endDate: new Date('2024-09-20'),
        totalAmount: 1200.00,
        subtotal: 1200.00,
        tax: 0.00,
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
        productName: 'Professional Drill Set',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-03'),
        quantity: 1,
        rentalType: 'DAILY',
        unitPrice: 50.00,
        totalPrice: 50.00,
        notes: 'Customer was very satisfied with the quality'
      }
    }),
    prisma.rentalItem.create({
      data: {
        rentalId: rentals[1].id,
        productId: products[1].id, // Party Tent
        productName: 'Party Tent 20x30',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-15'),
        quantity: 1,
        rentalType: 'DAILY',
        unitPrice: 150.00,
        totalPrice: 150.00,
        notes: 'Event setup completed successfully'
      }
    }),
    prisma.rentalItem.create({
      data: {
        rentalId: rentals[1].id,
        productId: products[3].id, // Projector
        productName: 'Projector HD',
        startDate: new Date('2024-08-10'),
        endDate: new Date('2024-08-15'),
        quantity: 1,
        rentalType: 'DAILY',
        unitPrice: 90.00,
        totalPrice: 90.00,
        notes: 'Event setup completed successfully'
      }
    }),
    prisma.rentalItem.create({
      data: {
        rentalId: rentals[2].id,
        productId: products[2].id, // Excavator
        productName: 'Excavator Mini',
        startDate: new Date('2024-08-20'),
        endDate: new Date('2024-09-20'),
        quantity: 1,
        rentalType: 'DAILY',
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
        customerId: users[1].id, // Mike Customer (was users[2])
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
        customerId: users[2].id, // Lisa Business (was users[3])
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
        customerId: users[3].id, // David Contractor (was users[4])
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
        customerId: users[1].id, // Mike Customer (was users[2])
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
        customerId: users[2].id, // Lisa Business (was users[3])
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
        customerId: users[3].id, // David Contractor (was users[4])
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
        userId: users[1].id, // Mike Customer (was users[2])
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
        userId: users[1].id, // Mike Customer (was users[2])
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
        userId: users[1].id, // Mike Customer (was users[2])
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
        userId: users[2].id, // Lisa Business (was users[3])
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
        userId: users[3].id, // David Contractor (was users[4])
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