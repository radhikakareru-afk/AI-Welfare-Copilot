const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from backend directory
dotenv.config({ path: path.resolve(__dirname, '.env') });

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// GET /api/test-db
app.get('/api/test-db', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT NOW();');
    res.json({
      success: true,
      message: 'PostgreSQL connected successfully'
    });
  } catch (err) {
    console.error('Database test error:', err.message);
    res.status(500).json({ success: false, message: 'Database connection failed', error: err.message });
  }
});

// GET /api/categories (Direct mapping)
app.get('/api/categories', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM scheme_categories ORDER BY name;');
    res.json({ success: true, categories: rows });
  } catch (err) {
    console.error('Error fetching categories:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Import and register route modules
app.use('/api/users', require('./routes/users'));
app.use('/api/schemes', require('./routes/schemes'));
app.use('/api/eligibility', require('./routes/eligibility'));
app.use('/api/comparisons', require('./routes/comparisons'));
app.use('/api/admin', require('./routes/admin'));

// Mount routers that have paths starting with /api/users or directly in /api
app.use('/api', require('./routes/public'));
app.use('/api/public', require('./routes/public'));
app.use('/api', require('./routes/favorites'));
app.use('/api', require('./routes/recentlyViewed'));
app.use('/api', require('./routes/notifications'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const bcrypt = require('bcrypt');

async function seedDemoUsers() {
  try {
    // Check citizen@demo.com
    const citRes = await db.query('SELECT id FROM users WHERE LOWER(email) = $1;', ['citizen@demo.com']);
    if (citRes.rows.length === 0) {
      console.log('Seeding demo citizen user...');
      const citHash = await bcrypt.hash('Citizen@123', 10);
      const userInsert = await db.query(
        `INSERT INTO users (full_name, email, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
         RETURNING id;`,
        ['Demo Citizen', 'citizen@demo.com', citHash, 'citizen']
      );
      const userId = userInsert.rows[0].id;
      await db.query(
        `INSERT INTO user_profiles (user_id, age, gender, state, district, occupation, education, annual_income, category, disability_status, created_at, updated_at)
         VALUES ($1, 30, 'Male', 'Maharashtra', 'Pune', 'Farmer', 'Secondary Education', 120000.00, 'OBC', 'No', NOW(), NOW());`,
        [userId]
      );
      console.log('Demo citizen user seeded successfully.');
    }

    // Check admin@demo.com
    const admRes = await db.query('SELECT id FROM users WHERE LOWER(email) = $1;', ['admin@demo.com']);
    if (admRes.rows.length === 0) {
      console.log('Seeding demo admin user...');
      const admHash = await bcrypt.hash('Admin@123', 10);
      await db.query(
        `INSERT INTO users (full_name, email, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW());`,
        ['Demo Admin', 'admin@demo.com', admHash, 'admin']
      );
      console.log('Demo admin user seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding demo users:', err.message);
  }
}

// Start Server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await seedDemoUsers();
});
