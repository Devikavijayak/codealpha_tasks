const mongoose = require('mongoose');
const User = require('./models/User');
const Product = require('./models/Product');
const dotenv = require('dotenv');

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce';

const products = [
    {
        name: "Wireless Headphones",
        description: "High quality wireless headphones with noise cancellation and long battery life.",
        price: 2499,
        category: "Electronics",
        brand: "SoundMaster",
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80",
        stock: 15,
        rating: 4.5,
        numReviews: 120,
        discountPercentage: 50
    },
    {
        name: "Smart Watch Series 7",
        description: "Advanced fitness tracker with heart rate monitor and GPS.",
        price: 3999,
        category: "Electronics",
        brand: "TechFit",
        image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80",
        stock: 25,
        rating: 4.3,
        numReviews: 85,
        discountPercentage: 40
    },
    {
        name: "Premium Men Hoodie",
        description: "Comfortable cotton hoodie for everyday wear.",
        price: 799,
        category: "Clothing",
        brand: "UrbanStyle",
        image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&q=80",
        stock: 50,
        rating: 4.2,
        numReviews: 45,
        discountPercentage: 45
    },
    {
        name: "Running Shoes Elite",
        description: "Professional running shoes with responsive cushioning.",
        price: 1899,
        category: "Sports",
        brand: "SpeedPro",
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80",
        stock: 10,
        rating: 4.6,
        numReviews: 210,
        discountPercentage: 35
    },
    {
        name: "Leather Messenger Bag",
        description: "Elegant leather bag for work and travel.",
        price: 2999,
        category: "Accessories",
        brand: "LuxuryCraft",
        image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&q=80",
        stock: 8,
        rating: 4.8,
        numReviews: 32,
        discountPercentage: 10
    },
    {
        name: "Mechanical Keyboard",
        description: "RGB mechanical keyboard with blue switches.",
        price: 1499,
        category: "Electronics",
        brand: "GameOn",
        image: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?w=500&q=80",
        stock: 30,
        rating: 4.4,
        numReviews: 156,
        discountPercentage: 20
    },
    {
        name: "Premium Leather Notebook",
        description: "Handcrafted leather-bound notebook with high-quality ivory paper.",
        price: 599,
        category: "Books",
        brand: "WriteWell",
        image: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&q=80",
        stock: 40,
        rating: 4.7,
        numReviews: 28,
        discountPercentage: 15
    },
    {
        name: "4K Digital Camera",
        description: "Compact 4K camera with 20MP sensor and optical zoom.",
        price: 45000,
        category: "Electronics",
        brand: "OptiCam",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=500&q=80",
        stock: 5,
        rating: 4.9,
        numReviews: 12,
        discountPercentage: 10
    },
    {
        name: "Professional Stand Mixer",
        description: "Heavy-duty kitchen mixer for all your baking needs.",
        price: 12999,
        category: "Home & Kitchen",
        brand: "ChefPro",
        image: "https://images.unsplash.com/photo-1594385208974-2e75f9d8bb28?w=500&q=80",
        stock: 12,
        rating: 4.8,
        numReviews: 42,
        discountPercentage: 25
    },
    {
        name: "Adjustable Dumbbells",
        description: "Set of two adjustable dumbbells for home workouts.",
        price: 8999,
        category: "Sports",
        brand: "IronGrip",
        image: "https://images.unsplash.com/photo-1583454110551-21f2fa2000c2?w=500&q=80",
        stock: 15,
        rating: 4.5,
        numReviews: 88,
        discountPercentage: 20
    }
];

const seedData = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // Seed Admin
        const adminEmail = 'admin@shopeasy.com';
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (!existingAdmin) {
            await User.create({
                name: 'System Admin',
                email: adminEmail,
                password: 'admin123',
                role: 'admin'
            });
            console.log('Admin account created!');
        }

        // Seed Products
        await Product.deleteMany(); // Clear existing products
        await Product.insertMany(products);
        console.log('Products seeded successfully!');

        process.exit();
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
};

seedData();
