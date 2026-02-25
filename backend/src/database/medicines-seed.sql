-- ============================================================
-- MediReach — Nepal Pharmacy Medicine Seed Data
-- 10 common medicines with realistic Nepal retail prices (NPR)
-- ============================================================

INSERT INTO medicines
  (name, generic_name, category, manufacturer, requires_prescription, price, stock, description, image_url, expiry_date, sold_count)
VALUES
  (
    'Amlodipine 5 mg',
    'Amlodipine Besylate',
    'Cardiac',
    'Deurali-Janta Pharmaceuticals',
    TRUE,
    72.00,
    180,
    'Calcium channel blocker used to treat high blood pressure (hypertension) and angina. Take once daily as prescribed. Store below 30 °C in a dry place.',
    '/uploads/medicines/amlodipine-5mg.jpg',
    '2027-06-30',
    342
  ),
  (
    'Amoxicillin 500 mg',
    'Amoxicillin Trihydrate',
    'Antibiotics',
    'Cipla Ltd',
    TRUE,
    95.00,
    250,
    'Broad-spectrum penicillin antibiotic for bacterial infections of the ear, nose, throat, urinary tract, and skin. Complete the full course even if you feel better.',
    '/uploads/medicines/amoxicillin-500mg.jpg',
    '2027-03-15',
    518
  ),
  (
    'Azithromycin 500 mg',
    'Azithromycin Dihydrate',
    'Antibiotics',
    'Sun Pharmaceutical Industries',
    TRUE,
    155.00,
    120,
    'Macrolide antibiotic effective against respiratory tract infections, skin infections, and sexually transmitted diseases. Usually taken as a 3-day or 5-day course.',
    '/uploads/medicines/azithromycin-500mg.jpg',
    '2027-09-20',
    287
  ),
  (
    'Cetirizine 10 mg',
    'Cetirizine Hydrochloride',
    'Cold & Cough',
    'Nepal Pharmaceuticals Lab',
    FALSE,
    45.00,
    400,
    'Second-generation antihistamine for allergic rhinitis, hay fever, and urticaria. Provides 24-hour relief from sneezing, runny nose, and itchy eyes. May cause mild drowsiness.',
    '/uploads/medicines/cetirizine-10mg.jpg',
    '2027-12-31',
    1240
  ),
  (
    'Clotrimazole Cream 1 %',
    'Clotrimazole',
    'Skin',
    'Lomus Pharmaceuticals',
    FALSE,
    85.00,
    150,
    'Topical antifungal cream for athlete''s foot, ringworm, jock itch, and yeast infections. Apply a thin layer to the affected area twice daily for 2-4 weeks.',
    '/uploads/medicines/clotrimazole-cream.jpg',
    '2028-01-15',
    198
  ),
  (
    'Ibuprofen 400 mg',
    'Ibuprofen',
    'Pain Relief',
    'Mankind Pharma',
    FALSE,
    55.00,
    320,
    'Non-steroidal anti-inflammatory drug (NSAID) for pain relief, fever reduction, and inflammation. Effective for headaches, dental pain, menstrual cramps, and muscle aches. Take with food.',
    '/uploads/medicines/ibuprofen-400mg.jpg',
    '2027-08-10',
    876
  ),
  (
    'Metformin 500 mg',
    'Metformin Hydrochloride',
    'Diabetes',
    'Asian Pharmaceuticals',
    TRUE,
    42.00,
    500,
    'First-line oral medication for type 2 diabetes. Helps control blood sugar levels by improving insulin sensitivity. Take with meals to reduce gastrointestinal side effects.',
    '/uploads/medicines/metformin-500mg.jpg',
    '2027-11-30',
    1580
  ),
  (
    'Omeprazole 20 mg',
    'Omeprazole',
    'Digestive',
    'Hetero Healthcare',
    TRUE,
    110.00,
    220,
    'Proton pump inhibitor (PPI) for gastric and duodenal ulcers, GERD, and acid reflux. Take 30 minutes before breakfast. Do not crush or chew the capsule.',
    '/uploads/medicines/omeprazole-20mg.jpg',
    '2027-05-25',
    714
  ),
  (
    'Paracetamol 500 mg',
    'Paracetamol (Acetaminophen)',
    'Pain Relief',
    'Time Pharmaceuticals',
    FALSE,
    25.00,
    600,
    'Widely used analgesic and antipyretic for mild to moderate pain and fever. Safe when used at recommended doses. Do not exceed 4 g per day. Avoid with alcohol.',
    '/uploads/medicines/paracetamol-500mg.jpg',
    '2028-02-28',
    2350
  ),
  (
    'Vitamin D3 60,000 IU',
    'Cholecalciferol',
    'Vitamins',
    'Simca Laboratories',
    FALSE,
    200.00,
    300,
    'High-dose vitamin D supplement for treating deficiency. Usually taken once weekly for 8 weeks, then monthly maintenance. Helps calcium absorption and supports bone health.',
    '/uploads/medicines/vitamin-d3-60k.jpg',
    '2028-06-30',
    430
  )
ON CONFLICT DO NOTHING;
