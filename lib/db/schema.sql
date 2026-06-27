-- ONYX Supabase Database Schema
-- Version 2.0 | WhatsApp Order Flow

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- 1. PRODUCTS & CATALOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  category TEXT NOT NULL,
  intent_tags TEXT[],
  description TEXT,
  fabric_details TEXT,
  fit_notes TEXT,
  care_instructions TEXT,
  base_price INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_live BOOLEAN DEFAULT FALSE,
  is_featured BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS product_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  is_cover BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS product_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size TEXT NOT NULL,
  color TEXT NOT NULL,
  color_hex TEXT,
  stock_quantity INT NOT NULL DEFAULT 0,
  is_out_of_stock BOOLEAN DEFAULT FALSE
);

-- ============================================================================
-- 2. CUSTOMERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  mobile TEXT UNIQUE NOT NULL,
  email TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 3. ORDERS
-- ============================================================================

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_ref TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending',
  customer_id UUID REFERENCES customers(id),
  customer_name TEXT NOT NULL,
  customer_mobile TEXT NOT NULL,
  customer_email TEXT,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  pincode TEXT NOT NULL,
  notes TEXT,
  subtotal INTEGER NOT NULL,
  item_count INTEGER NOT NULL,
  whatsapp_opened BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  product_name TEXT NOT NULL,
  variant_label TEXT NOT NULL,
  product_image_url TEXT NOT NULL,
  unit_price INTEGER NOT NULL,
  quantity INTEGER NOT NULL,
  line_total INTEGER NOT NULL
);

-- ============================================================================
-- 4. REVIEWS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  reviewer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  title TEXT,
  body TEXT NOT NULL,
  customer_mobile TEXT,
  purchase_verified BOOLEAN DEFAULT FALSE,
  is_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 5. ADMIN & INVENTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id),
  order_item_id UUID NOT NULL REFERENCES order_items(id),
  type TEXT NOT NULL CHECK (type IN ('return','exchange')),
  reason TEXT NOT NULL CHECK (reason IN ('wrong_size','defective','changed_mind','other')),
  status TEXT NOT NULL CHECK (status IN ('requested','approved','picked_up','received','resolved')),
  exchange_variant_id UUID,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS inventory_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id UUID NOT NULL REFERENCES product_variants(id),
  change_amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT NOT NULL,
  changed_by TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS staff_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('inventory_editor','order_fulfillment','full_admin')),
  is_active BOOLEAN DEFAULT TRUE,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  created_by UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_by UUID,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 6. AUDIT LOGGING
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  changed_by TEXT DEFAULT 'SYSTEM',
  old_values JSONB,
  new_values JSONB,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
  acting_user TEXT;
  jwt_claims JSON;
BEGIN
  -- Get the current staff ID from app setting
  BEGIN
    acting_user := current_setting('app.current_staff_id', true);
  EXCEPTION WHEN OTHERS THEN
    acting_user := NULL;
  END;

  -- Fallback to JWT email if app.current_staff_id is not set
  IF acting_user IS NULL OR acting_user = '' THEN
    BEGIN
      jwt_claims := current_setting('request.jwt.claims', true)::JSON;
      IF jwt_claims IS NOT NULL AND jwt_claims->>'email' IS NOT NULL THEN
        acting_user := jwt_claims->>'email';
      END IF;
    EXCEPTION WHEN OTHERS THEN
      acting_user := NULL;
    END;
  END IF;

  -- Fallback to SYSTEM if still not set
  IF acting_user IS NULL OR acting_user = '' THEN
    acting_user := 'SYSTEM';
  END IF;

  IF (TG_OP = 'DELETE') THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, old_values)
    VALUES (TG_TABLE_NAME, OLD.id::TEXT, 'DELETE', acting_user, row_to_json(OLD)::JSONB);
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, old_values, new_values)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'UPDATE', acting_user, row_to_json(OLD)::JSONB, row_to_json(NEW)::JSONB);
    RETURN NEW;
  ELSIF (TG_OP = 'INSERT') THEN
    INSERT INTO audit_log (table_name, record_id, action, changed_by, new_values)
    VALUES (TG_TABLE_NAME, NEW.id::TEXT, 'INSERT', acting_user, row_to_json(NEW)::JSONB);
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply triggers
CREATE TRIGGER products_audit AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER product_variants_audit AFTER INSERT OR UPDATE OR DELETE ON product_variants FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER product_images_audit AFTER INSERT OR UPDATE OR DELETE ON product_images FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER customers_audit AFTER INSERT OR UPDATE OR DELETE ON customers FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER orders_audit AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER returns_audit AFTER INSERT OR UPDATE OR DELETE ON returns FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER staff_accounts_audit AFTER INSERT OR UPDATE OR DELETE ON staff_accounts FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER settings_audit AFTER INSERT OR UPDATE OR DELETE ON settings FOR EACH ROW EXECUTE FUNCTION process_audit_log();
CREATE TRIGGER reviews_audit AFTER INSERT OR UPDATE OR DELETE ON reviews FOR EACH ROW EXECUTE FUNCTION process_audit_log();

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Public read access for catalog and reviews
CREATE POLICY "Public catalog access" ON products FOR SELECT USING (is_active = true AND is_live = true);
CREATE POLICY "Public catalog images" ON product_images FOR SELECT USING (true);
CREATE POLICY "Public catalog variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Public reviews" ON reviews FOR SELECT USING (is_approved = true);

-- Staff (authenticated) can read all products including drafts and archived ones
CREATE POLICY "Staff can read all products" ON products FOR SELECT TO authenticated USING (true);

-- Public can insert orders and customers during checkout (DELETED for security, handles via server actions / service role)
-- CREATE POLICY "Public order insert" ON orders FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public order items insert" ON order_items FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public customer insert" ON customers FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Public review insert" ON reviews FOR INSERT WITH CHECK (true);

-- Central Database-backed Rate Limiter Table
CREATE TABLE IF NOT EXISTS rate_limits (
  ip TEXT NOT NULL,
  route TEXT NOT NULL,
  count INTEGER NOT NULL DEFAULT 1,
  reset_time TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (ip, route)
);
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

-- (In a real application, you'd add strict Staff-Only policies for UPDATE/DELETE based on auth.uid() or similar JWT claims)

-- ============================================================================
-- 8. STORAGE BUCKET POLICIES (For product-images bucket)
-- ============================================================================
-- Note: These policies configure access to storage.objects for the 'product-images' bucket.
-- Public read access to images:
-- CREATE POLICY "Allow public select on product-images" ON storage.objects FOR SELECT TO public USING (bucket_id = 'product-images');
-- Authenticated staff write access:
-- CREATE POLICY "Allow authenticated inserts to product-images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');
-- CREATE POLICY "Allow authenticated updates to product-images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images');
-- CREATE POLICY "Allow authenticated deletes to product-images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');

