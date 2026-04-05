diff --git a/supabase/migrations/20260405050500_seed_inventory_100.sql b/supabase/migrations/20260405050500_seed_inventory_100.sql
new file mode 100644
index 0000000000000000000000000000000000000000..b906a8a29dd007382f8a27a9b58bc2dfa103bc69
--- /dev/null
+++ b/supabase/migrations/20260405050500_seed_inventory_100.sql
@@ -0,0 +1,37 @@
+-- Seed 100 sample inventory rows when inventory is empty
+INSERT INTO public.inventory (
+  imei,
+  brand,
+  model,
+  ram,
+  storage,
+  color,
+  condition,
+  purchase_source,
+  purchase_price,
+  purchase_date,
+  warranty_status,
+  warranty_expiry,
+  status,
+  notes
+)
+SELECT
+  LPAD((860000000000000 + gs)::text, 15, '0') AS imei,
+  (ARRAY['Samsung','Apple','Xiaomi','OnePlus','Oppo','Vivo','Realme','Motorola','Nokia'])[(gs % 9) + 1] AS brand,
+  CONCAT('Model ', gs) AS model,
+  (ARRAY['4GB','6GB','8GB','12GB'])[(gs % 4) + 1] AS ram,
+  (ARRAY['64GB','128GB','256GB','512GB'])[(gs % 4) + 1] AS storage,
+  (ARRAY['Black','Blue','Silver','Green','Purple'])[(gs % 5) + 1] AS color,
+  (ARRAY['New','Refurbished','Used'])[(gs % 3) + 1] AS condition,
+  (ARRAY['Dealer','Customer'])[(gs % 2) + 1] AS purchase_source,
+  8000 + (gs * 250) AS purchase_price,
+  (CURRENT_DATE - ((gs % 120) * INTERVAL '1 day'))::date AS purchase_date,
+  CASE WHEN gs % 3 = 0 THEN 'No Warranty' ELSE 'Under Warranty' END AS warranty_status,
+  CASE
+    WHEN gs % 3 = 0 THEN NULL
+    ELSE (CURRENT_DATE + (((gs % 365) + 30) * INTERVAL '1 day'))::date
+  END AS warranty_expiry,
+  'In Stock' AS status,
+  'Sample seeded inventory record' AS notes
+FROM generate_series(1, 100) AS gs
+WHERE NOT EXISTS (SELECT 1 FROM public.inventory);
