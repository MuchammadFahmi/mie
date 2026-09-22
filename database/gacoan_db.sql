-- ============================================================
-- DATABASE: gacoan_db
-- Mie Gacoan - Sistem Manajemen Restoran
-- ============================================================

CREATE DATABASE IF NOT EXISTS gacoan_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE gacoan_db;

-- ============================================================
-- TABEL: users (Akun Kasir & Admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'kasir') NOT NULL DEFAULT 'kasir',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: menu_items (Data Menu)
-- ============================================================
CREATE TABLE IF NOT EXISTS menu_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  category ENUM('mie', 'dimsum', 'minuman', 'paket') NOT NULL,
  subtitle TEXT,
  price INT NOT NULL,
  image VARCHAR(255),
  badge VARCHAR(100),
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: orders (Pesanan)
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(20) NOT NULL UNIQUE,
  customer_name VARCHAR(100) NOT NULL DEFAULT 'Pelanggan',
  order_type ENUM('dine_in', 'takeaway') NOT NULL DEFAULT 'dine_in',
  table_number VARCHAR(10),
  total_price INT NOT NULL DEFAULT 0,
  status ENUM('pending', 'diproses', 'selesai', 'dibatalkan') NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50) DEFAULT 'QRIS',
  payment_proof VARCHAR(255) DEFAULT NULL,
  payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  notes TEXT,
  processed_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (processed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- TABEL: order_items (Detail Item Pesanan)
-- ============================================================
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  menu_item_name VARCHAR(150) NOT NULL,
  menu_item_id VARCHAR(20),
  quantity INT NOT NULL DEFAULT 1,
  unit_price INT NOT NULL,
  subtotal INT NOT NULL,
  notes TEXT,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- SEED: Akun Admin Default
-- Password: admin123 (bcrypt hash)
-- ============================================================
INSERT INTO users (name, email, password, role) VALUES
(
  'Admin Gacoan',
  'admin@gacoan.com',
  '$2b$10$H/psHrkxBrplaOyMoS15VebpHObPlFkZI87MDj8CW7YQ.sfwbnwdG',
  'admin'
),
(
  'Kasir Utama',
  'kasir@gacoan.com',
  '$2b$10$H/psHrkxBrplaOyMoS15VebpHObPlFkZI87MDj8CW7YQ.sfwbnwdG',
  'kasir'
);

-- ============================================================
-- SEED: Data Menu Awal
-- ============================================================
INSERT INTO menu_items (name, category, subtitle, price, image, badge) VALUES
-- Mie
('Mie Gacoan Lv 1-8', 'mie', 'Pedas Manis - Level 1-8 (sesuaikan kemampuan pedas)', 10500, '/assets/miegacoan.webp', 'Terlaris #1'),
('Mie Hompimpa Lv 1-8', 'mie', 'Gurih Asin - Cocok buat yang suka rasa asin pedas nendang', 10500, '/assets/miehompimpa.png', 'Favorit'),
('Mie Suit', 'mie', 'Rasa paling safe buat repeat order (Original tanpa cabai)', 10000, '/assets/miesuit.webp', 'Kids Friendly'),
-- Dimsum
('Udang Rambutan', 'dimsum', 'Daging udang lembut dibalut olahan kulit crispy renyah', 9500, '/assets/udangrambutan.jpg', 'Wajib Coba'),
('Udang Keju', 'dimsum', 'Dimsum udang olahan isi keju lumer meledak gurih saat digigit', 9500, '/assets/udangkeju.webp', 'Best Seller'),
('Lumpia Udang', 'dimsum', 'Lumpia goreng isi adonan udang padat dengan saus cocolan khas', 9500, '/assets/lumpiaudang.jpg', NULL),
('Pangsit Goreng', 'dimsum', 'Pangsit crispy ekstra kriuk isi daging ayam gurih (isi 3 pcs)', 9500, '/assets/pangsitgoreng.jpg', NULL),
-- Minuman
('Teh Gacoan (Tea)', 'minuman', 'Teh manis segar racikan khas Gacoan (Pilih Iced / Hot)', 6000, '/assets/teh.webp', 'Paling Segar'),
('Es Genderuwo', 'minuman', 'Es perpaduan buah-buahan manis, cincau lembut & sirup pereda pedas', 8500, '/assets/esgenderuwo.jpg', 'Favorit #1'),
('Es Gobak Sodor', 'minuman', 'Minuman es buah segar kombinasi jelly dan pembilas dahaga', 8500, '/assets/esgobaksodor.webp', NULL),
-- Paket
('Paket Combo Fest 1', 'paket', 'Mie Gacoan Level 1 2x, Udang Keju 1x, Udang Rambutan 1x, Es Teh 2x', 45000, '/assets/paketcombofest1.webp', 'Hemat 15%'),
('Paket Combo Fest 2', 'paket', 'Mie Gacoan 1x, Lumpia Udang 1x, Es Orange 1x', 25000, '/assets/paketcombofest2.jpg', 'Paket Spesial');

-- ============================================================
-- VIEW: Statistik Harian (opsional, untuk admin)
-- ============================================================
CREATE OR REPLACE VIEW v_daily_stats AS
SELECT
  DATE(created_at) AS tanggal,
  COUNT(*) AS total_pesanan,
  SUM(total_price) AS total_pendapatan,
  SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS pesanan_selesai,
  SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pesanan_pending,
  SUM(CASE WHEN status = 'dibatalkan' THEN 1 ELSE 0 END) AS pesanan_batal
FROM orders
GROUP BY DATE(created_at)
ORDER BY tanggal DESC;
