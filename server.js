const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Serve static frontend files from project root
app.use(express.static(path.join(__dirname)));

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ecommerce';
mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Mongo connection error:', err));

// Update Order schema to handle cart items
const orderSchema = new mongoose.Schema({
    name: String,
    phone: String,
    address: String,
    items: [{ id: Number, title: String, price: Number, size: String }],
    totalPrice: Number,
    cartCount: Number,
    productId: Number, // legacy support
    productTitle: String, // legacy
    price: Number, // legacy
    size: String, // legacy
    color: String, // legacy
    createdAt: { type: Date, default: Date.now }
});

const Order = mongoose.model('Order', orderSchema);

// --- User schema for simple auth ---
const userSchema = new mongoose.Schema({
    name: String,
    phone: { type: String, unique: true },
    password: String, // hashed
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Register endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, phone, password } = req.body;
        if (!name || !phone || !password) return res.status(400).json({ error: 'Missing fields' });

        const existing = await User.findOne({ phone });
        if (existing) return res.status(400).json({ error: 'User already exists' });

        const hashed = await bcrypt.hash(password, 10);
        const user = new User({ name, phone, password: hashed });
        await user.save();
        return res.status(201).json({ message: 'User registered', user: { id: user._id, name: user.name, phone: user.phone } });
    } catch (err) {
        console.error('Register error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Login endpoint
app.post('/api/login', async (req, res) => {
    try {
        const { phone, password } = req.body;
        if (!phone || !password) return res.status(400).json({ error: 'Missing fields' });

        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ error: 'Invalid credentials' });

        const ok = await bcrypt.compare(password, user.password);
        if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

        return res.json({ message: 'Login successful', user: { id: user._id, name: user.name, phone: user.phone } });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// Helper: list users (for quick testing) - remove in production
app.get('/api/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').limit(100);
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

// API: create order
app.post('/api/orders', async (req, res) => {
    try {
        const { name, phone, address, items, totalPrice, cartCount } = req.body;

        // Support both new cart format and old single-item format
        if (!name || !phone || !address) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        let orderData = { name, phone, address };

        // New format: items array
        if (items && Array.isArray(items)) {
            orderData.items = items;
            orderData.totalPrice = totalPrice || 0;
            orderData.cartCount = cartCount || items.length;
        } else {
            // Legacy format: single product
            const { productId, productTitle, price, size, color } = req.body;
            if (!productId) {
                return res.status(400).json({ error: 'Missing product info' });
            }
            orderData.productId = productId;
            orderData.productTitle = productTitle;
            orderData.price = price;
            orderData.size = size;
            orderData.color = color;
            orderData.items = [{ id: productId, title: productTitle, price, size }];
            orderData.totalPrice = price;
            orderData.cartCount = 1;
        }

        const order = new Order(orderData);
        await order.save();
        return res.status(201).json({ message: 'Order saved', order });
    } catch (err) {
        console.error('Error saving order:', err);
        return res.status(500).json({ error: 'Server error' });
    }
});

// API: fetch all orders (for admin/testing)
app.get('/api/orders', async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 }).limit(100);
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
