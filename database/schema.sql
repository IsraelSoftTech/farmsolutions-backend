-- Content Management Database Schema
-- This schema stores all editable content for the Farmers Solutions website
--
-- IMPORTANT: Before running this script, you MUST set permissions first!
-- Run this command as 'postgres' user in pgAdmin:
--   ALTER SCHEMA public OWNER TO farmsolutionss_user;
--
-- Then run this entire script as 'farmsolutionss_user'

-- ============================================
-- PERMISSION CHECK
-- ============================================
DO $$
BEGIN
    -- Check if current user can create tables
    IF NOT has_schema_privilege(current_user, 'public', 'CREATE') THEN
        RAISE EXCEPTION 'PERMISSION DENIED: You do not have CREATE permission on the public schema. 
        
SOLUTION:
1. Connect to pgAdmin as "postgres" user (admin)
2. Open Query Tool on farmsolutionss_db
3. Run this command:
   ALTER SCHEMA public OWNER TO farmsolutionss_user;
4. Disconnect and reconnect as farmsolutionss_user
5. Then run this schema.sql script again';
    END IF;
END
$$;

-- ============================================
-- HOME PAGE CONTENT
-- ============================================

-- Hero section content (title, subtitle, banner images)
CREATE TABLE IF NOT EXISTS home_content (
  id SERIAL PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  title TEXT,
  subtitle TEXT,
  description TEXT,
  content TEXT,
  image_url TEXT,
  button_text VARCHAR(100),
  button_link VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hero banner images
CREATE TABLE IF NOT EXISTS hero_banners (
  id SERIAL PRIMARY KEY,
  image_url TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Hero stats (displayed in hero section)
CREATE TABLE IF NOT EXISTS hero_stats (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Problem section stats
CREATE TABLE IF NOT EXISTS problem_stats (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  label TEXT NOT NULL,
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Solution cards
CREATE TABLE IF NOT EXISTS solution_cards (
  id SERIAL PRIMARY KEY,
  icon VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  features TEXT[],
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Impact stats (home page impact section)
CREATE TABLE IF NOT EXISTS impact_stats (
  id SERIAL PRIMARY KEY,
  number VARCHAR(50) NOT NULL,
  label VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- ABOUT PAGE CONTENT
-- ============================================

-- About page content sections
CREATE TABLE IF NOT EXISTS about_content (
  id SERIAL PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  title TEXT,
  content TEXT,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(255),
  qualification TEXT,
  image_url TEXT,
  bio TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRODUCTS
-- ============================================

-- Products table
CREATE TABLE IF NOT EXISTS products (
  id SERIAL PRIMARY KEY,
  product_id VARCHAR(100) UNIQUE,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  capacity VARCHAR(100),
  dimensions VARCHAR(100),
  price VARCHAR(100),
  image_url TEXT,
  benefits TEXT[],
  features TEXT[],
  best_for TEXT,
  power_requirement VARCHAR(255),
  temperature_range VARCHAR(100),
  humidity_control VARCHAR(100),
  installation_time VARCHAR(100),
  warranty VARCHAR(100),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- HOW IT WORKS
-- ============================================

-- How it works steps
CREATE TABLE IF NOT EXISTS how_it_works_steps (
  id SERIAL PRIMARY KEY,
  step_number INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- IMPACT PAGE
-- ============================================

-- Testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  role VARCHAR(255),
  text TEXT NOT NULL,
  rating INTEGER DEFAULT 5,
  image_url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- KNOWLEDGE HUB
-- ============================================

-- Knowledge resources
CREATE TABLE IF NOT EXISTS knowledge_resources (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(100),
  icon VARCHAR(50),
  url TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PRICING
-- ============================================

-- Pricing packages
CREATE TABLE IF NOT EXISTS pricing_packages (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  capacity VARCHAR(100),
  features TEXT[],
  price_note VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Pricing info cards
CREATE TABLE IF NOT EXISTS pricing_info_cards (
  id SERIAL PRIMARY KEY,
  icon VARCHAR(50),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- CONTACT PAGE
-- ============================================

-- Contact information
CREATE TABLE IF NOT EXISTS contact_info (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  label VARCHAR(255),
  value TEXT NOT NULL,
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Business hours
CREATE TABLE IF NOT EXISTS business_hours (
  id SERIAL PRIMARY KEY,
  day VARCHAR(50) NOT NULL,
  hours VARCHAR(100) NOT NULL,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- FOOTER CONTENT
-- ============================================

-- Footer content sections
CREATE TABLE IF NOT EXISTS footer_content (
  id SERIAL PRIMARY KEY,
  section VARCHAR(100) NOT NULL UNIQUE,
  title VARCHAR(255),
  content TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Social media links
CREATE TABLE IF NOT EXISTS social_links (
  id SERIAL PRIMARY KEY,
  platform VARCHAR(50) NOT NULL,
  url VARCHAR(255) NOT NULL,
  icon VARCHAR(50),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- PAGE METADATA (for page titles, subtitles, CTAs)
-- ============================================

-- Page metadata (titles, subtitles, CTA sections)
CREATE TABLE IF NOT EXISTS page_metadata (
  id SERIAL PRIMARY KEY,
  page VARCHAR(100) NOT NULL,
  section VARCHAR(100) NOT NULL,
  title TEXT,
  subtitle TEXT,
  cta_title TEXT,
  cta_text TEXT,
  cta_button_text VARCHAR(100),
  cta_button_link VARCHAR(255),
  UNIQUE(page, section),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_home_content_section ON home_content(section);
CREATE INDEX IF NOT EXISTS idx_about_content_section ON about_content(section);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_order ON products(order_index);
CREATE INDEX IF NOT EXISTS idx_contact_info_type ON contact_info(type);
CREATE INDEX IF NOT EXISTS idx_page_metadata_page_section ON page_metadata(page, section);

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '✅✅✅ All tables created successfully! ✅✅✅';
    RAISE NOTICE 'Total tables: 20';
END
$$;
