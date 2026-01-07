-- ============================================
-- MOCK MESS DATA
-- Run this in Supabase SQL Editor
-- ============================================

-- First, make owner_id nullable (if it has a constraint)
ALTER TABLE public.messes ALTER COLUMN owner_id DROP NOT NULL;

-- Make sure areas exist first (should already be there)
INSERT INTO public.areas (name) VALUES 
  ('Kothrud'), ('Karve Nagar'), ('Warje'), ('Bavdhan'), ('Hinjewadi'),
  ('Wakad'), ('Pimple Saudagar'), ('Aundh'), ('Baner'), ('Pashan')
ON CONFLICT (name) DO NOTHING;

-- Insert mock messes
INSERT INTO public.messes (name, tagline, speciality, address, contact_number, is_active, area_id)
SELECT 
  m.name, m.tagline, m.speciality, m.address, m.contact_number, true, a.id
FROM (VALUES
  ('Shree Krishna Mess', 'Pure Veg Maharashtrian Thali', 'Maharashtrian', 'Shop 4, Prabhat Road, Kothrud, Pune - 411038', '9876543210'),
  ('Annapurna Bhojanalaya', 'Home-style Gujarati Food', 'Gujarati', '15, DP Road, Karve Nagar, Pune - 411052', '9876543211'),
  ('South Indian Delight', 'Authentic South Indian Cuisine', 'South Indian', 'Near MIT College, Kothrud, Pune - 411038', '9876543212'),
  ('Rajasthani Rasoi', 'Traditional Rajasthani Flavors', 'Rajasthani', 'Warje Malwadi, Pune - 411058', '9876543213'),
  ('Punjabi Tadka Mess', 'North Indian Unlimited Thali', 'North Indian', 'Hinjewadi Phase 1, Pune - 411057', '9876543214'),
  ('Green Leaf Veg Mess', 'Healthy & Hygienic Meals', 'Multi-cuisine', 'Wakad Chowk, Pune - 411057', '9876543215'),
  ('Aai''s Kitchen', 'Authentic Konkani Seafood & Veg', 'Konkani', 'Baner Road, Pune - 411045', '9876543216'),
  ('Desi Dhaba Mess', 'Spicy & Tasty Thali', 'North Indian', 'Aundh, Pune - 411007', '9876543217'),
  ('Sagar Ratna', 'Pure Veg South Indian', 'South Indian', 'Pashan Road, Pune - 411021', '9876543218'),
  ('Mumbai Tiffin Center', 'Vada Pav & Maharashtrian Snacks', 'Street Food', 'Pimple Saudagar, Pune - 411027', '9876543219')
) AS m(name, tagline, speciality, address, contact_number)
JOIN public.areas a ON a.name = (
  CASE 
    WHEN m.name = 'Shree Krishna Mess' THEN 'Kothrud'
    WHEN m.name = 'Annapurna Bhojanalaya' THEN 'Karve Nagar'
    WHEN m.name = 'South Indian Delight' THEN 'Kothrud'
    WHEN m.name = 'Rajasthani Rasoi' THEN 'Warje'
    WHEN m.name = 'Punjabi Tadka Mess' THEN 'Hinjewadi'
    WHEN m.name = 'Green Leaf Veg Mess' THEN 'Wakad'
    WHEN m.name = 'Aai''s Kitchen' THEN 'Baner'
    WHEN m.name = 'Desi Dhaba Mess' THEN 'Aundh'
    WHEN m.name = 'Sagar Ratna' THEN 'Pashan'
    WHEN m.name = 'Mumbai Tiffin Center' THEN 'Pimple Saudagar'
  END
);

-- Insert some sample menu posts for each mess (using JSONB for items)
INSERT INTO public.menu_posts (mess_id, meal_type, title, items, is_veg, price, visible_from, expiry_time)
SELECT 
  m.id,
  'lunch',
  'Today''s Special Lunch',
  '["Rice", "Dal Fry", "Sabzi", "Roti (3 pcs)", "Salad", "Pickle", "Papad"]'::jsonb,
  true,
  80.00,
  now(),
  now() + interval '8 hours'
FROM public.messes m;

INSERT INTO public.menu_posts (mess_id, meal_type, title, items, is_veg, price, visible_from, expiry_time)
SELECT 
  m.id,
  'dinner',
  'Evening Thali',
  '["Chapati (4 pcs)", "Dal Tadka", "Paneer Curry", "Rice", "Sweet Dish"]'::jsonb,
  true,
  90.00,
  now(),
  now() + interval '12 hours'
FROM public.messes m;

SELECT 'Successfully added ' || (SELECT COUNT(*) FROM public.messes) || ' messes with menu posts!' as message;
