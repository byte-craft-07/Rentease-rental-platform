const serviceCities = ['Bengaluru', 'Pune', 'Hyderabad', 'Delhi NCR', 'Mumbai'];

const categories = [
  {
    name: 'Living Room',
    slug: 'living-room',
    type: 'furniture',
    description: 'Sofas, chairs, and coffee tables for a complete living area.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    sortOrder: 1,
    isActive: true
  },
  {
    name: 'Bedroom',
    slug: 'bedroom',
    type: 'furniture',
    description: 'Beds, mattresses, wardrobes, and bedside essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80',
    sortOrder: 2,
    isActive: true
  },
  {
    name: 'Appliances',
    slug: 'appliances',
    type: 'appliance',
    description: 'Daily-use appliances with delivery, setup, and support.',
    imageUrl: 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=900&q=80',
    sortOrder: 3,
    isActive: true
  },
  {
    name: 'Dining',
    slug: 'dining',
    type: 'furniture',
    description: 'Dining tables, chairs, and compact meal setups.',
    imageUrl: 'https://images.unsplash.com/photo-1615968679312-9b7ed9f04e79?auto=format&fit=crop&w=900&q=80',
    sortOrder: 4,
    isActive: true
  },
  {
    name: 'Decor',
    slug: 'decor',
    type: 'decor',
    description: 'Accent pieces that make a temporary home feel finished.',
    imageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=900&q=80',
    sortOrder: 5,
    isActive: true
  },
  {
    name: 'Bundles',
    slug: 'bundles',
    type: 'bundle',
    description: 'Curated furniture and appliance packs for faster move-ins.',
    imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80',
    sortOrder: 6,
    isActive: true
  },
  {
    name: 'Work Setup',
    slug: 'work-setup',
    type: 'furniture',
    description: 'Desks, chairs, and compact work-from-home essentials.',
    imageUrl: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80',
    sortOrder: 7,
    isActive: true
  }
];

const serviceAreas = [
  {
    city: 'Bengaluru',
    state: 'Karnataka',
    pincodes: ['560001', '560034', '560066', '560076', '560102'],
    deliveryFee: 249,
    pickupFee: 199,
    standardDeliveryDays: 2,
    isActive: true
  },
  {
    city: 'Pune',
    state: 'Maharashtra',
    pincodes: ['411001', '411014', '411028', '411045', '411057'],
    deliveryFee: 249,
    pickupFee: 199,
    standardDeliveryDays: 2,
    isActive: true
  },
  {
    city: 'Hyderabad',
    state: 'Telangana',
    pincodes: ['500001', '500032', '500081', '500084', '500089'],
    deliveryFee: 299,
    pickupFee: 199,
    standardDeliveryDays: 3,
    isActive: true
  },
  {
    city: 'Delhi NCR',
    state: 'Delhi',
    pincodes: ['110001', '110017', '110034', '122001', '201301'],
    deliveryFee: 299,
    pickupFee: 249,
    standardDeliveryDays: 3,
    isActive: true
  },
  {
    city: 'Mumbai',
    state: 'Maharashtra',
    pincodes: ['400001', '400050', '400076', '400086', '400101'],
    deliveryFee: 349,
    pickupFee: 249,
    standardDeliveryDays: 3,
    isActive: true
  }
];

const users = [
  {
    name: 'RentEase Admin',
    email: 'admin@rentease.local',
    phone: '9000000001',
    password: 'Admin@12345',
    role: 'admin',
    city: 'Bengaluru',
    status: 'active',
    addresses: [
      {
        label: 'HQ',
        line1: 'RentEase Operations Hub, Indiranagar',
        line2: '12th Main Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560038',
        landmark: 'Near Metro Station',
        isDefault: true
      }
    ]
  },
  {
    name: 'UrbanNest Vendor',
    email: 'vendor@rentease.local',
    phone: '9000000002',
    password: 'Vendor@12345',
    role: 'vendor',
    city: 'Pune',
    status: 'active',
    addresses: [
      {
        label: 'Warehouse',
        line1: 'UrbanNest Storage Yard, Hinjewadi Phase 1',
        line2: '',
        city: 'Pune',
        state: 'Maharashtra',
        pincode: '411057',
        landmark: 'Behind Tech Park',
        isDefault: true
      }
    ]
  },
  {
    name: 'Aarav Mehta',
    email: 'aarav.customer@rentease.local',
    phone: '9000000003',
    password: 'Customer@12345',
    role: 'customer',
    city: 'Bengaluru',
    status: 'active',
    addresses: [
      {
        label: 'Apartment',
        line1: 'Flat 302, Cedar Heights',
        line2: 'Koramangala 5th Block',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560095',
        landmark: 'Opposite Forum Mall',
        isDefault: true
      }
    ]
  }
];

const products = [
  {
    name: 'Mia 3-Seater Sofa',
    slug: 'mia-3-seater-sofa',
    categorySlug: 'living-room',
    type: 'furniture',
    shortDescription: 'Olive fabric sofa for compact urban living rooms.',
    description: 'A comfortable three-seat sofa with soft woven fabric, sturdy wooden frame, and maintenance support included.',
    monthlyRent: 2599,
    securityDeposit: 5000,
    tenureOptions: [
      { months: 3, monthlyRent: 2799, discountPercent: 0 },
      { months: 6, monthlyRent: 2599, discountPercent: 7 },
      { months: 12, monthlyRent: 2299, discountPercent: 18 }
    ],
    stock: 18,
    availableStock: 11,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      Material: 'Olive woven fabric',
      Seating: '3 adults',
      Dimensions: '78 x 32 x 34 in',
      Condition: 'Sanitized and quality checked'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 2,
    tags: ['top-rated', 'living room', 'sofa', 'fabric'],
    status: 'active'
  },
  {
    name: 'LG 260L Refrigerator',
    slug: 'lg-260l-refrigerator',
    categorySlug: 'appliances',
    type: 'appliance',
    shortDescription: 'Energy-efficient double-door fridge for apartments.',
    description: 'A reliable refrigerator for small families and shared apartments with doorstep setup support.',
    monthlyRent: 1899,
    securityDeposit: 4500,
    tenureOptions: [
      { months: 3, monthlyRent: 2099, discountPercent: 0 },
      { months: 6, monthlyRent: 1899, discountPercent: 10 },
      { months: 12, monthlyRent: 1699, discountPercent: 19 }
    ],
    stock: 22,
    availableStock: 15,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      Capacity: '260 litres',
      EnergyRating: '3 star',
      DoorType: 'Double door',
      Support: 'Maintenance included'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 2,
    tags: ['appliance', 'refrigerator', 'kitchen', 'family'],
    status: 'active'
  },
  {
    name: 'Bosch 8kg Washing Machine',
    slug: 'bosch-8kg-washing-machine',
    categorySlug: 'appliances',
    type: 'appliance',
    shortDescription: 'Front-load washing machine with installation support.',
    description: 'A quiet front-load washing machine suitable for shared homes and working professionals.',
    monthlyRent: 2099,
    securityDeposit: 5000,
    tenureOptions: [
      { months: 3, monthlyRent: 2299, discountPercent: 0 },
      { months: 6, monthlyRent: 2099, discountPercent: 9 },
      { months: 12, monthlyRent: 1899, discountPercent: 17 }
    ],
    stock: 16,
    availableStock: 9,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      Capacity: '8 kg',
      LoadType: 'Front load',
      Programs: 'Quick wash, cotton, delicate',
      Installation: 'Included'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 2,
    tags: ['appliance', 'washing machine', 'laundry', 'installation'],
    status: 'active'
  },
  {
    name: 'Oak Dining Set',
    slug: 'oak-dining-set',
    categorySlug: 'dining',
    type: 'furniture',
    shortDescription: 'Four-seater dining set for daily meals and hosting.',
    description: 'A warm oak-finish table with four matching chairs, ideal for compact dining corners.',
    monthlyRent: 1699,
    securityDeposit: 3500,
    tenureOptions: [
      { months: 3, monthlyRent: 1899, discountPercent: 0 },
      { months: 6, monthlyRent: 1699, discountPercent: 11 },
      { months: 12, monthlyRent: 1499, discountPercent: 21 }
    ],
    stock: 14,
    availableStock: 8,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1615968679312-9b7ed9f04e79?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      Seats: '4',
      Finish: 'Oak veneer',
      TableSize: '48 x 30 in',
      ChairMaterial: 'Solid wood frame'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 3,
    tags: ['dining', 'table', 'chairs', 'oak'],
    status: 'active'
  },
  {
    name: 'Queen Bed Comfort Set',
    slug: 'queen-bed-comfort-set',
    categorySlug: 'bedroom',
    type: 'furniture',
    shortDescription: 'Queen bed frame with mattress and side table.',
    description: 'A complete bedroom starter set designed for quick move-ins and comfortable sleep.',
    monthlyRent: 2299,
    securityDeposit: 4500,
    tenureOptions: [
      { months: 3, monthlyRent: 2499, discountPercent: 0 },
      { months: 6, monthlyRent: 2299, discountPercent: 8 },
      { months: 12, monthlyRent: 1999, discountPercent: 20 }
    ],
    stock: 20,
    availableStock: 12,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      BedSize: 'Queen',
      Includes: 'Frame, mattress, side table',
      MattressType: 'Medium firm foam',
      Storage: 'No storage'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 3,
    tags: ['bedroom', 'bed', 'mattress', 'move-in'],
    status: 'active'
  },
  {
    name: 'Work Desk Kit',
    slug: 'work-desk-kit',
    categorySlug: 'work-setup',
    type: 'furniture',
    shortDescription: 'Desk and ergonomic chair for productive workdays.',
    description: 'A compact work-from-home setup with a sturdy writing desk and adjustable chair.',
    monthlyRent: 999,
    securityDeposit: 2000,
    tenureOptions: [
      { months: 3, monthlyRent: 1199, discountPercent: 0 },
      { months: 6, monthlyRent: 999, discountPercent: 17 },
      { months: 12, monthlyRent: 849, discountPercent: 29 }
    ],
    stock: 26,
    availableStock: 18,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      DeskSize: '42 x 22 in',
      Chair: 'Adjustable mesh chair',
      UseCase: 'Work from home',
      Assembly: 'Included'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 2,
    tags: ['work setup', 'desk', 'chair', 'student'],
    status: 'active'
  },
  {
    name: 'Evergreen Decor Pack',
    slug: 'evergreen-decor-pack',
    categorySlug: 'decor',
    type: 'decor',
    shortDescription: 'Planters, floor lamp, and soft accents for warmth.',
    description: 'A renter-friendly decor pack that brings visual warmth without permanent changes.',
    monthlyRent: 699,
    securityDeposit: 1000,
    tenureOptions: [
      { months: 3, monthlyRent: 799, discountPercent: 0 },
      { months: 6, monthlyRent: 699, discountPercent: 13 },
      { months: 12, monthlyRent: 599, discountPercent: 25 }
    ],
    stock: 30,
    availableStock: 21,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      Includes: 'Two planters, floor lamp, cushion set',
      Style: 'Warm neutral',
      Plants: 'Artificial indoor plants',
      Care: 'Dust wipe only'
    },
    maintenanceIncluded: false,
    deliveryWindowDays: 2,
    tags: ['decor', 'plants', 'lamp', 'home feel'],
    status: 'active'
  },
  {
    name: 'Samsung 43-inch Smart TV',
    slug: 'samsung-43-inch-smart-tv',
    categorySlug: 'appliances',
    type: 'appliance',
    shortDescription: 'Smart TV for streaming, movies, and shared homes.',
    description: 'A full HD smart TV with installation support and rental maintenance coverage.',
    monthlyRent: 1799,
    securityDeposit: 4500,
    tenureOptions: [
      { months: 3, monthlyRent: 1999, discountPercent: 0 },
      { months: 6, monthlyRent: 1799, discountPercent: 10 },
      { months: 12, monthlyRent: 1599, discountPercent: 20 }
    ],
    stock: 18,
    availableStock: 10,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      ScreenSize: '43 in',
      Resolution: 'Full HD',
      Connectivity: 'WiFi, HDMI, USB',
      Mounting: 'Tabletop setup included'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 2,
    tags: ['appliance', 'tv', 'entertainment', 'smart'],
    status: 'active'
  },
  {
    name: 'Solo Studio Bundle',
    slug: 'solo-studio-bundle',
    categorySlug: 'bundles',
    type: 'bundle',
    shortDescription: 'Essential furniture and appliances for a studio move-in.',
    description: 'A curated package with bed, desk, chair, refrigerator, and washing machine for single renters.',
    monthlyRent: 4899,
    securityDeposit: 9000,
    tenureOptions: [
      { months: 3, monthlyRent: 5299, discountPercent: 0 },
      { months: 6, monthlyRent: 4899, discountPercent: 8 },
      { months: 12, monthlyRent: 4299, discountPercent: 19 }
    ],
    stock: 12,
    availableStock: 6,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      Includes: 'Bed, desk kit, refrigerator, washing machine',
      BestFor: 'Studio apartment',
      SetupTime: 'One delivery slot',
      Savings: 'Lower than renting separately'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 3,
    tags: ['bundle', 'studio', 'student', 'professional'],
    status: 'active'
  },
  {
    name: 'Compact Microwave Oven',
    slug: 'compact-microwave-oven',
    categorySlug: 'appliances',
    type: 'appliance',
    shortDescription: 'Quick cooking support for hostel and apartment kitchens.',
    description: 'A compact microwave oven for reheating, simple cooking, and daily convenience.',
    monthlyRent: 799,
    securityDeposit: 1500,
    tenureOptions: [
      { months: 3, monthlyRent: 899, discountPercent: 0 },
      { months: 6, monthlyRent: 799, discountPercent: 11 },
      { months: 12, monthlyRent: 699, discountPercent: 22 }
    ],
    stock: 24,
    availableStock: 17,
    serviceCities,
    images: ['https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=1000&q=80'],
    specifications: {
      Capacity: '20 litres',
      Power: '700 W',
      UseCase: 'Reheat and simple cooking',
      Controls: 'Manual dial'
    },
    maintenanceIncluded: true,
    deliveryWindowDays: 2,
    tags: ['appliance', 'microwave', 'kitchen', 'compact'],
    status: 'active'
  }
];

module.exports = {
  categories,
  products,
  serviceAreas,
  users
};
