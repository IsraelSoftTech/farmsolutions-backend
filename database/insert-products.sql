-- Insert Spethacs Room products: A, B, C
-- Images: pro1.jpeg, pro2.jpeg, pro3.jpeg from assets folder
-- These can be updated later by admin through the admin panel

INSERT INTO products (product_id, name, category, description, capacity, dimensions, price, image_url, benefits, features, best_for, power_requirement, temperature_range, humidity_control, installation_time, warranty, order_index)
VALUES 
  (
    'spethacs-room-a',
    'Spethacs Room A',
    'Solar Storage System',
    'Compact solar storage solution perfect for smallholder farmers looking to reduce post-harvest losses and increase income.',
    '500 kg',
    '2m x 2m x 2.5m',
    'Contact for pricing',
    'pro1.jpeg',
    ARRAY['Reduces post-harvest loss by 80%', 'Solar-powered operation', 'Easy installation', 'Low maintenance'],
    ARRAY['Solar-powered operation', 'Digital temperature display', 'Mobile app monitoring', 'Easy installation', 'Low maintenance requirements', 'Modular design for expansion'],
    'Small-scale farmers, individual plots, trial installations',
    'Solar panels (200W)',
    '5°C - 25°C',
    '60% - 80%',
    '4-6 hours',
    '2 years',
    1
  ),
  (
    'spethacs-room-b',
    'Spethacs Room B',
    'Solar Storage System',
    'Medium-capacity storage solution designed for agricultural cooperatives and medium-sized farms.',
    '2,000 kg',
    '4m x 4m x 3m',
    'Contact for pricing',
    'pro2.jpeg',
    ARRAY['Climate control system', 'Real-time monitoring', 'Modular design', 'Extended shelf life'],
    ARRAY['Advanced climate control system', 'Real-time monitoring dashboard', 'Multiple storage zones', 'Data analytics platform', 'Remote management capabilities', 'Backup power system'],
    'Agricultural cooperatives, medium-sized farms, community storage',
    'Solar panels (800W)',
    '3°C - 25°C',
    '50% - 85%',
    '1-2 days',
    '3 years',
    2
  ),
  (
    'spethacs-room-c',
    'Spethacs Room C',
    'Solar Storage System',
    'Large-scale commercial storage solution for agricultural businesses and large farming operations.',
    '5,000 kg',
    '8m x 6m x 4m',
    'Contact for pricing',
    'pro3.jpeg',
    ARRAY['Advanced climate control', 'Digital analytics platform', 'Multiple zones', 'Commercial grade'],
    ARRAY['Commercial-grade climate control', 'Enterprise analytics platform', 'Multiple independent zones', 'Automated inventory management', 'Integration with ERP systems', '24/7 technical support'],
    'Commercial farms, food processing companies, large agricultural businesses',
    'Solar panels (2kW)',
    '2°C - 25°C',
    '40% - 90%',
    '3-5 days',
    '5 years',
    3
  )
ON CONFLICT (product_id) 
DO UPDATE SET
  name = EXCLUDED.name,
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  capacity = EXCLUDED.capacity,
  dimensions = EXCLUDED.dimensions,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  benefits = EXCLUDED.benefits,
  features = EXCLUDED.features,
  best_for = EXCLUDED.best_for,
  power_requirement = EXCLUDED.power_requirement,
  temperature_range = EXCLUDED.temperature_range,
  humidity_control = EXCLUDED.humidity_control,
  installation_time = EXCLUDED.installation_time,
  warranty = EXCLUDED.warranty,
  order_index = EXCLUDED.order_index,
  updated_at = CURRENT_TIMESTAMP;
