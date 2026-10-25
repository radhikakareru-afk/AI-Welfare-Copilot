const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../db');

const SALT_ROUNDS = 10;

// POST /api/users/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide email and password' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const { rows } = await db.query('SELECT * FROM users WHERE LOWER(email) = $1 AND is_active = TRUE;', [cleanEmail]);

    if (rows.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Don't return password hash
    delete user.password_hash;
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error logging in:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/users (Register)
router.post('/', async (req, res) => {
  const { email, password, full_name, state, district } = req.body;
  if (!email || !password || !full_name) {
    return res.status(400).json({ success: false, message: 'Please provide email, password, and full name' });
  }

  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    // Check if user exists
    const checkUser = await db.query('SELECT id FROM users WHERE LOWER(email) = $1;', [cleanEmail]);
    if (checkUser.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const hash = await bcrypt.hash(password, SALT_ROUNDS);

    // Insert user
    const userRes = await db.query(
      `INSERT INTO users (full_name, email, password_hash, role, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, $4, TRUE, NOW(), NOW())
       RETURNING id, email, role, full_name;`,
      [full_name, cleanEmail, hash, 'citizen']
    );

    const newUser = userRes.rows[0];

    // Insert default profile
    await db.query(
      `INSERT INTO user_profiles (user_id, age, gender, state, district, occupation, education, annual_income, category, disability_status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW());`,
      [
        newUser.id,
        30, // Default age
        'Male', // Default gender
        state || 'Maharashtra',
        district || 'Pune',
        'Farmer', // Default occupation
        'Secondary Education', // Default education
        0.00, // Default income
        'General', // Default category
        'No' // Default disability
      ]
    );

    res.status(201).json({ success: true, user: newUser });
  } catch (err) {
    console.error('Error registering user:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT id, email, role, full_name, phone, is_active, created_at FROM users WHERE id = $1;', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({ success: true, user: rows[0] });
  } catch (err) {
    console.error('Error fetching user:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Helper to calculate age from DOB
function calculateAge(dobString) {
  if (!dobString) return 30;
  const today = new Date();
  const birthDate = new Date(dobString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

// GET /api/users/:id/profile
router.get('/:id/profile', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT p.*, u.full_name, u.email
       FROM user_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1;`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profile not found' });
    }
    
    const profile = rows[0];
    // Map age back to date_of_birth for the frontend
    const birthYear = new Date().getFullYear() - (profile.age || 30);
    profile.date_of_birth = `${birthYear}-01-01`;
    
    res.json({ success: true, profile });
  } catch (err) {
    console.error('Error fetching profile:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST & PUT /api/users/:id/profile (Save or update profile details)
const saveProfile = async (req, res) => {
  const { id: userId } = req.params;
  let {
    age,
    date_of_birth,
    gender,
    state,
    district,
    occupation,
    education,
    annual_income,
    category,
    disability_status,
    address,
    full_name
  } = req.body;

  // Calculate age if date_of_birth is provided
  if (date_of_birth && !age) {
    age = calculateAge(date_of_birth);
  }

  try {
    // If full_name is provided, update it in users table
    if (full_name) {
      await db.query('UPDATE users SET full_name = $1 WHERE id = $2;', [full_name, userId]);
    }

    // Check if profile exists
    const checkRes = await db.query('SELECT id FROM user_profiles WHERE user_id = $1;', [userId]);
    
    if (checkRes.rows.length > 0) {
      // Update profile
      await db.query(
        `UPDATE user_profiles
         SET age = $1, gender = $2, state = $3, district = $4, occupation = $5,
             education = $6, annual_income = $7, category = $8, disability_status = $9,
             address = $10, updated_at = NOW()
         WHERE user_id = $11;`,
        [
          age !== undefined ? parseInt(age) : null,
          gender || null,
          state || null,
          district || null,
          occupation || null,
          education || null,
          annual_income !== undefined ? parseFloat(annual_income) : null,
          category || null,
          disability_status || 'No',
          address || null,
          userId
        ]
      );
    } else {
      // Insert profile
      await db.query(
        `INSERT INTO user_profiles (user_id, age, gender, state, district, occupation, education, annual_income, category, disability_status, address, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW());`,
        [
          userId,
          age !== undefined ? parseInt(age) : null,
          gender || null,
          state || null,
          district || null,
          occupation || null,
          education || null,
          annual_income !== undefined ? parseFloat(annual_income) : null,
          category || null,
          disability_status || 'No',
          address || null
        ]
      );
    }

    // Retrieve updated profile joined with users table
    const updatedProfileRes = await db.query(
      `SELECT p.*, u.full_name, u.email
       FROM user_profiles p
       JOIN users u ON p.user_id = u.id
       WHERE p.user_id = $1;`,
      [userId]
    );

    const savedProfile = updatedProfileRes.rows[0];
    const birthYear = new Date().getFullYear() - (savedProfile.age || 30);
    savedProfile.date_of_birth = `${birthYear}-01-01`;

    res.json({ success: true, profile: savedProfile });
  } catch (err) {
    console.error('Error saving profile:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
};

router.post('/:id/profile', saveProfile);
router.put('/:id/profile', saveProfile);

module.exports = router;
