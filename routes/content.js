const express = require('express');
const router = express.Router();
const { query } = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const ftpClient = require('../config/ftp');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Helper function to upload file to FTP
async function uploadToFTP(localPath, filename) {
  try {
    const remotePath = `/uploads/${filename}`;
    await ftpClient.uploadFile(localPath, remotePath);
    const publicUrl = ftpClient.getPublicUrl(remotePath);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return publicUrl;
  } catch (error) {
    console.error('FTP upload error:', error);
    throw error;
  }
}

// ========== HOME CONTENT ==========
router.get('/home', async (req, res) => {
  try {
    const [contentResult, bannersResult, heroStatsResult, problemStatsResult, solutionCardsResult, impactStatsResult] = await Promise.all([
      query('SELECT * FROM home_content ORDER BY order_index ASC'),
      query('SELECT * FROM hero_banners ORDER BY order_index ASC'),
      query('SELECT * FROM hero_stats ORDER BY order_index ASC'),
      query('SELECT * FROM problem_stats ORDER BY order_index ASC'),
      query('SELECT * FROM solution_cards ORDER BY order_index ASC'),
      query('SELECT * FROM impact_stats ORDER BY order_index ASC')
    ]);
    res.json({ 
      success: true, 
      data: {
        content: contentResult.rows,
        banners: bannersResult.rows,
        heroStats: heroStatsResult.rows,
        problemStats: problemStatsResult.rows,
        solutionCards: solutionCardsResult.rows,
        impactStats: impactStatsResult.rows
      }
    });
  } catch (error) {
    console.error('Error fetching home content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/home', upload.single('image'), async (req, res) => {
  try {
    const { section, title, subtitle, description, button_text, button_link, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      `INSERT INTO home_content (section, title, subtitle, description, image_url, button_text, button_link, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (section) 
       DO UPDATE SET title = $2, subtitle = $3, description = $4, image_url = COALESCE($5, home_content.image_url), 
                     button_text = $6, button_link = $7, order_index = $8, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [section, title, subtitle, description, imageUrl, button_text, button_link, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving home content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hero banners
router.post('/home/banners', upload.single('image'), async (req, res) => {
  try {
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const { order_index } = req.body;
    const result = await query(
      'INSERT INTO hero_banners (image_url, order_index) VALUES ($1, $2) RETURNING *',
      [imageUrl, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error saving banner:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/home/banners/:id', async (req, res) => {
  try {
    await query('DELETE FROM hero_banners WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Hero stats
router.post('/home/hero-stats', async (req, res) => {
  try {
    const { number, label, order_index } = req.body;
    const result = await query(
      'INSERT INTO hero_stats (number, label, order_index) VALUES ($1, $2, $3) RETURNING *',
      [number, label, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/home/hero-stats/:id', async (req, res) => {
  try {
    const { number, label, order_index } = req.body;
    const result = await query(
      'UPDATE hero_stats SET number = $1, label = $2, order_index = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [number, label, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Problem stats
router.post('/home/problem-stats', async (req, res) => {
  try {
    const { number, label, icon, order_index } = req.body;
    const result = await query(
      'INSERT INTO problem_stats (number, label, icon, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [number, label, icon, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/home/problem-stats/:id', async (req, res) => {
  try {
    const { number, label, icon, order_index } = req.body;
    const result = await query(
      'UPDATE problem_stats SET number = $1, label = $2, icon = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [number, label, icon, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Solution cards
router.post('/home/solution-cards', async (req, res) => {
  try {
    const { icon, title, description, features, order_index } = req.body;
    const result = await query(
      'INSERT INTO solution_cards (icon, title, description, features, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [icon, title, description, JSON.stringify(features || []), order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/home/solution-cards/:id', async (req, res) => {
  try {
    const { icon, title, description, features, order_index } = req.body;
    const result = await query(
      'UPDATE solution_cards SET icon = $1, title = $2, description = $3, features = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [icon, title, description, JSON.stringify(features || []), order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Impact stats (home page)
router.post('/home/impact-stats', async (req, res) => {
  try {
    const { number, label, description, order_index } = req.body;
    const result = await query(
      'INSERT INTO impact_stats (number, label, description, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [number, label, description, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/home/impact-stats/:id', async (req, res) => {
  try {
    const { number, label, description, order_index } = req.body;
    const result = await query(
      'UPDATE impact_stats SET number = $1, label = $2, description = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [number, label, description, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== ABOUT CONTENT ==========
router.get('/about', async (req, res) => {
  try {
    const [contentResult, teamResult] = await Promise.all([
      query('SELECT * FROM about_content ORDER BY order_index ASC'),
      query('SELECT * FROM team_members ORDER BY order_index ASC')
    ]);
    res.json({ success: true, data: { content: contentResult.rows, team: teamResult.rows } });
  } catch (error) {
    console.error('Error fetching about content:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/about/content', upload.single('image'), async (req, res) => {
  try {
    const { section, title, content, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      `INSERT INTO about_content (section, title, content, image_url, order_index)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (section) 
       DO UPDATE SET title = $2, content = $3, image_url = COALESCE($4, about_content.image_url), 
                     order_index = $5, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [section, title, content, imageUrl, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/about/team', upload.single('image'), async (req, res) => {
  try {
    const { name, position, qualification, bio, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      'INSERT INTO team_members (name, position, qualification, image_url, bio, order_index) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, position, qualification, imageUrl, bio, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/about/team/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, position, qualification, bio, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      `UPDATE team_members SET name = $1, position = $2, qualification = $3, bio = $4, 
       image_url = COALESCE($5, image_url), order_index = $6, updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, position, qualification, bio, imageUrl, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/about/team/:id', async (req, res) => {
  try {
    await query('DELETE FROM team_members WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Team member deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PRODUCTS ==========
router.get('/products', async (req, res) => {
  try {
    const result = await query('SELECT * FROM products ORDER BY order_index ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/products', upload.single('image'), async (req, res) => {
  try {
    const { product_id, name, category, description, capacity, dimensions, price, benefits, features, best_for, power_requirement, temperature_range, humidity_control, installation_time, warranty, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      `INSERT INTO products (product_id, name, category, description, capacity, dimensions, price, image_url, benefits, features, best_for, power_requirement, temperature_range, humidity_control, installation_time, warranty, order_index)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
       ON CONFLICT (product_id) 
       DO UPDATE SET name = $2, category = $3, description = $4, capacity = $5, dimensions = $6, 
                     price = $7, image_url = COALESCE($8, products.image_url), benefits = $9, 
                     features = $10, best_for = $11, power_requirement = $12, temperature_range = $13,
                     humidity_control = $14, installation_time = $15, warranty = $16, order_index = $17, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [product_id, name, category, description, capacity, dimensions, price, imageUrl, 
       JSON.stringify(benefits || []), JSON.stringify(features || []), best_for, power_requirement,
       temperature_range, humidity_control, installation_time, warranty, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/products/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, category, description, capacity, dimensions, price, benefits, features, best_for, power_requirement, temperature_range, humidity_control, installation_time, warranty, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      `UPDATE products SET name = $1, category = $2, description = $3, capacity = $4, dimensions = $5, 
       price = $6, image_url = COALESCE($7, image_url), benefits = $8, features = $9, best_for = $10,
       power_requirement = $11, temperature_range = $12, humidity_control = $13, installation_time = $14,
       warranty = $15, order_index = $16, updated_at = CURRENT_TIMESTAMP
       WHERE id = $17 RETURNING *`,
      [name, category, description, capacity, dimensions, price, imageUrl,
       JSON.stringify(benefits || []), JSON.stringify(features || []), best_for, power_requirement,
       temperature_range, humidity_control, installation_time, warranty, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/products/:id', async (req, res) => {
  try {
    await query('DELETE FROM products WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== HOW IT WORKS ==========
router.get('/how-it-works', async (req, res) => {
  try {
    const result = await query('SELECT * FROM how_it_works_steps ORDER BY order_index ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/how-it-works', async (req, res) => {
  try {
    const { step_number, title, description, icon, order_index } = req.body;
    const result = await query(
      'INSERT INTO how_it_works_steps (step_number, title, description, icon, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [step_number, title, description, icon, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/how-it-works/:id', async (req, res) => {
  try {
    const { step_number, title, description, icon, order_index } = req.body;
    const result = await query(
      'UPDATE how_it_works_steps SET step_number = $1, title = $2, description = $3, icon = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [step_number, title, description, icon, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/how-it-works/:id', async (req, res) => {
  try {
    await query('DELETE FROM how_it_works_steps WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Step deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== IMPACT ==========
router.get('/impact', async (req, res) => {
  try {
    const [statsResult, testimonialsResult] = await Promise.all([
      query('SELECT * FROM impact_stats ORDER BY order_index ASC'),
      query('SELECT * FROM testimonials ORDER BY order_index ASC')
    ]);
    res.json({ success: true, data: { stats: statsResult.rows, testimonials: testimonialsResult.rows } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/impact/stats', async (req, res) => {
  try {
    const { number, label, description, order_index } = req.body;
    const result = await query(
      'INSERT INTO impact_stats (number, label, description, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [number, label, description, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/impact/stats/:id', async (req, res) => {
  try {
    const { number, label, description, order_index } = req.body;
    const result = await query(
      'UPDATE impact_stats SET number = $1, label = $2, description = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [number, label, description, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/impact/testimonials', upload.single('image'), async (req, res) => {
  try {
    const { name, location, role, text, rating, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      'INSERT INTO testimonials (name, location, role, text, rating, image_url, order_index) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [name, location, role, text, rating || 5, imageUrl, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/impact/testimonials/:id', upload.single('image'), async (req, res) => {
  try {
    const { name, location, role, text, rating, order_index } = req.body;
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    }
    const result = await query(
      `UPDATE testimonials SET name = $1, location = $2, role = $3, text = $4, rating = $5, 
       image_url = COALESCE($6, image_url), order_index = $7, updated_at = CURRENT_TIMESTAMP
       WHERE id = $8 RETURNING *`,
      [name, location, role, text, rating || 5, imageUrl, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/impact/testimonials/:id', async (req, res) => {
  try {
    await query('DELETE FROM testimonials WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== KNOWLEDGE ==========
router.get('/knowledge', async (req, res) => {
  try {
    const result = await query('SELECT * FROM knowledge_resources ORDER BY order_index ASC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/knowledge', async (req, res) => {
  try {
    const { title, description, type, icon, url, order_index } = req.body;
    const result = await query(
      'INSERT INTO knowledge_resources (title, description, type, icon, url, order_index) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, description, type, icon, url, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/knowledge/:id', async (req, res) => {
  try {
    const { title, description, type, icon, url, order_index } = req.body;
    const result = await query(
      'UPDATE knowledge_resources SET title = $1, description = $2, type = $3, icon = $4, url = $5, order_index = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $7 RETURNING *',
      [title, description, type, icon, url, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/knowledge/:id', async (req, res) => {
  try {
    await query('DELETE FROM knowledge_resources WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PRICING ==========
router.get('/pricing', async (req, res) => {
  try {
    const [packagesResult, infoCardsResult] = await Promise.all([
      query('SELECT * FROM pricing_packages ORDER BY order_index ASC'),
      query('SELECT * FROM pricing_info_cards ORDER BY order_index ASC')
    ]);
    res.json({ success: true, data: { packages: packagesResult.rows, infoCards: infoCardsResult.rows } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pricing/packages', async (req, res) => {
  try {
    const { name, capacity, features, price_note, order_index } = req.body;
    const result = await query(
      'INSERT INTO pricing_packages (name, capacity, features, price_note, order_index) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, capacity, JSON.stringify(features || []), price_note, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/pricing/packages/:id', async (req, res) => {
  try {
    const { name, capacity, features, price_note, order_index } = req.body;
    const result = await query(
      'UPDATE pricing_packages SET name = $1, capacity = $2, features = $3, price_note = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [name, capacity, JSON.stringify(features || []), price_note, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pricing/info-cards', async (req, res) => {
  try {
    const { icon, title, description, order_index } = req.body;
    const result = await query(
      'INSERT INTO pricing_info_cards (icon, title, description, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [icon, title, description, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/pricing/info-cards/:id', async (req, res) => {
  try {
    const { icon, title, description, order_index } = req.body;
    const result = await query(
      'UPDATE pricing_info_cards SET icon = $1, title = $2, description = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [icon, title, description, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== CONTACT ==========
router.get('/contact', async (req, res) => {
  try {
    const [infoResult, hoursResult] = await Promise.all([
      query('SELECT * FROM contact_info ORDER BY order_index ASC'),
      query('SELECT * FROM business_hours ORDER BY order_index ASC')
    ]);
    res.json({ success: true, data: { info: infoResult.rows, hours: hoursResult.rows } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/contact/info', async (req, res) => {
  try {
    const { type, label, value, icon, order_index } = req.body;
    const result = await query(
      `INSERT INTO contact_info (type, label, value, icon, order_index)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [type, label, value, icon, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/contact/info/:id', async (req, res) => {
  try {
    const { type, label, value, icon, order_index } = req.body;
    const result = await query(
      'UPDATE contact_info SET type = $1, label = $2, value = $3, icon = $4, order_index = $5, updated_at = CURRENT_TIMESTAMP WHERE id = $6 RETURNING *',
      [type, label, value, icon, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/contact/hours', async (req, res) => {
  try {
    const { day, hours, order_index } = req.body;
    const result = await query(
      'INSERT INTO business_hours (day, hours, order_index) VALUES ($1, $2, $3) RETURNING *',
      [day, hours, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/contact/hours/:id', async (req, res) => {
  try {
    const { day, hours, order_index } = req.body;
    const result = await query(
      'UPDATE business_hours SET day = $1, hours = $2, order_index = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [day, hours, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.delete('/contact/hours/:id', async (req, res) => {
  try {
    await query('DELETE FROM business_hours WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Business hours deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== FOOTER ==========
router.get('/footer', async (req, res) => {
  try {
    const [contentResult, socialResult, contactResult] = await Promise.all([
      query('SELECT * FROM footer_content ORDER BY order_index ASC'),
      query('SELECT * FROM social_links ORDER BY order_index ASC'),
      query('SELECT * FROM contact_info ORDER BY order_index ASC')
    ]);
    res.json({ 
      success: true, 
      data: { 
        content: contentResult.rows, 
        social: socialResult.rows,
        contact: contactResult.rows
      } 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/footer/content', async (req, res) => {
  try {
    const { section, title, content, order_index } = req.body;
    const result = await query(
      `INSERT INTO footer_content (section, title, content, order_index)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (section) 
       DO UPDATE SET title = $2, content = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [section, title, content, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/footer/social', async (req, res) => {
  try {
    const { platform, url, icon, order_index } = req.body;
    const result = await query(
      'INSERT INTO social_links (platform, url, icon, order_index) VALUES ($1, $2, $3, $4) RETURNING *',
      [platform, url, icon, order_index || 0]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/footer/social/:id', async (req, res) => {
  try {
    const { platform, url, icon, order_index } = req.body;
    const result = await query(
      'UPDATE social_links SET platform = $1, url = $2, icon = $3, order_index = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [platform, url, icon, order_index || 0, req.params.id]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== PAGE METADATA ==========
router.get('/pages/:page', async (req, res) => {
  try {
    const { page } = req.params;
    const result = await query(
      'SELECT * FROM page_metadata WHERE page = $1 ORDER BY section ASC',
      [page]
    );
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/pages', async (req, res) => {
  try {
    const { page, section, title, subtitle, cta_title, cta_text, cta_button_text, cta_button_link } = req.body;
    const result = await query(
      `INSERT INTO page_metadata (page, section, title, subtitle, cta_title, cta_text, cta_button_text, cta_button_link)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (page, section) 
       DO UPDATE SET title = $3, subtitle = $4, cta_title = $5, cta_text = $6, 
                     cta_button_text = $7, cta_button_link = $8, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [page, section, title, subtitle, cta_title, cta_text, cta_button_text, cta_button_link]
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ========== FILE UPLOAD ==========
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const imageUrl = await uploadToFTP(req.file.path, req.file.filename);
    res.json({ success: true, data: { url: imageUrl } });
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
