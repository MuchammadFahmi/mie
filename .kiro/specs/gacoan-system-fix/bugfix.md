# Bugfix Requirements Document

## Introduction

Audit menyeluruh pada website pembelian Mie Gacoan mengidentifikasi sejumlah bug kritis di berbagai lapisan sistem: API routes, halaman publik (menu, checkout), panel admin, panel kasir, autentikasi, dan konfigurasi Next.js. Bug-bug ini menyebabkan error halaman, data tidak muncul, fitur tidak berfungsi, dan potensi kerentanan keamanan. Dokumen ini mencatat semua perilaku salah yang ditemukan beserta perilaku yang seharusnya terjadi dan perilaku yang harus tetap terjaga.

---

## Bug Analysis

### Current Behavior (Defect)

**[BUG-01] GET /api/menu — Response format tidak konsisten dengan yang dikonsumsi halaman menu**

1.1 WHEN halaman publik `/menu` memanggil `GET /api/menu` THEN API mengembalikan `{ menu: rows }` namun kode client di `menu/page.tsx` sudah menangani kedua format (`data.menu || []`) sehingga bukan bug fatal — namun `GET /api/menu/[id]` juga mengembalikan `{ menu: row }` padahal admin panel melakukan `fetch` tanpa mengakses properti tersebut; efeknya panel admin menampilkan data kosong untuk detail item.

**[BUG-02] `initialPaymentStatus` mengandung string garbage di `POST /api/orders`**

1.2 WHEN pelanggan membuat pesanan baru dengan metode Cash tanpa bukti transfer THEN nilai `initialPaymentStatus` yang dihitung adalah `"pending font-medium"` (string Tailwind CSS terselip di dalam logika bisnis) namun variabel ini tidak pernah dipakai sehingga `payment_status` tetap dikirim hardcoded sebagai `"pending"` — meski tidak langsung crash, logika penentuan status pembayaran awal salah dan dapat menyebabkan inkonsistensi jika kode tersebut dipakai kembali.

**[BUG-03] `next.config.ts` tidak mengkonfigurasi `images.remotePatterns` / `images.domains`**

1.3 WHEN komponen `Image` dari Next.js mencoba memuat gambar dari URL eksternal atau path `/uploads/` yang baru diunggah THEN Next.js Image Optimization menolak sumber gambar yang tidak terdaftar dan menampilkan error `Invalid src` atau gambar kosong di halaman admin menu setelah upload foto.

**[BUG-04] Halaman admin/kasir tidak punya `SessionProvider` di root layout**

1.4 WHEN pengguna mengakses halaman admin atau kasir di browser THEN `useSession()` di dalam halaman tersebut bergantung pada `SessionProvider` yang dibungkus di masing-masing layout child (`AdminLayout`, `KasirLayout`, `LoginLayout`) namun root `app/layout.tsx` tidak membungkus seluruh aplikasi; ini menyebabkan komponen yang menggunakan `useSession()` di luar sub-tree tersebut (misal Navbar di halaman publik jika nantinya ditambahkan) tidak mendapat session, dan dapat menyebabkan hydration error.

**[BUG-05] Middleware menggunakan `AUTH_SECRET` sementara `lib/auth.ts` menggunakan `AUTH_SECRET` dengan fallback string hardcoded berbeda nama**

1.5 WHEN middleware Next.js memanggil `getToken({ req, secret: process.env.AUTH_SECRET })` dan environment variable `AUTH_SECRET` tidak di-set THEN `getToken` menggunakan `undefined` sebagai secret sedangkan NextAuth di `lib/auth.ts` menggunakan fallback `"gacoan_secret_key_2026"`; akibatnya token tidak dapat divalidasi oleh middleware dan semua request ke `/admin` dan `/kasir` diredirect ke `/login` meskipun pengguna sudah login.

**[BUG-06] API `GET /api/menu` tidak memiliki try-catch — error DB menyebabkan 500 unhandled**

1.6 WHEN database tidak dapat dijangkau atau query gagal pada `GET /api/menu` THEN tidak ada error handling sehingga Next.js mengembalikan unhandled server error dan halaman `/menu` publik crash total alih-alih menampilkan data statis fallback.

**[BUG-07] API `GET /api/stats` tidak memiliki try-catch — dashboard admin crash saat DB error**

1.7 WHEN database tidak dapat dijangkau atau query gagal pada `GET /api/stats` THEN tidak ada error handling sehingga halaman `/admin` (dashboard) crash dan menampilkan layar error alih-alih state kosong yang informatif.

**[BUG-08] Upload gambar menggunakan `fs.writeFile` yang tidak kompatibel di deployment serverless**

1.8 WHEN admin mengunggah foto menu melalui `POST /api/upload` pada environment selain local (Vercel, dll.) THEN `writeFile` ke `public/uploads/` gagal karena filesystem bersifat read-only di serverless platform; hasilnya gambar tidak tersimpan dan admin mendapat error "Gagal mengunggah file".

**[BUG-09] Kasir: fungsi `handleVerifyPayment` dan `handleUpdateStatus` tidak menangani response error dari API**

1.9 WHEN request `PATCH /api/orders/[id]` gagal (network error atau 401/500) di halaman kasir THEN UI tidak menampilkan pesan error apapun; status order di UI tetap berubah secara optimistis (karena `setOrders` dipanggil tanpa memeriksa `res.ok`) sehingga data di layar tidak sinkron dengan database.

**[BUG-10] Halaman `/menu`: `orderType` mapping salah antara UI value dan API value**

1.10 WHEN pelanggan memilih tipe order "Dine In" di modal checkout (nilai UI: `"dinein"`) THEN data dikirim sebagai `orderType: "Dine In"` ke API, namun logika normalisasi di `POST /api/orders` mengecek `.toLowerCase().includes("away")` — string `"Dine In"` tidak mengandung `"away"` sehingga akan di-set sebagai `"dine_in"` (benar secara kebetulan) namun pengiriman `orderType: "Take Away"` untuk online order sudah benar; mapping ini rapuh dan tidak eksplisit.

**[BUG-11] `GET /api/orders` tidak memiliki try-catch — kasir page crash saat DB error**

1.11 WHEN database tidak dapat dijangkau atau query gagal pada `GET /api/orders` THEN tidak ada error handling sehingga halaman kasir crash dengan unhandled server error alih-alih menampilkan pesan kosong.

**[BUG-12] Hardcoded fallback credentials plaintext di `lib/auth.ts` adalah risiko keamanan**

1.12 WHEN seseorang mencoba login dengan `admin@gacoan.com` / `admin123` dan database tidak tersedia THEN sistem mengizinkan login dengan password plaintext yang ter-hardcode di source code, membuka akses admin meskipun database sedang offline atau belum terkonfigurasi.

**[BUG-13] `lucide-react` versi `^1.47.0` tidak valid — package hanya tersedia sampai `0.x`**

1.13 WHEN menjalankan `npm install` atau build pada environment baru THEN npm gagal menemukan `lucide-react@^1.47.0` karena versi tersebut tidak ada di registry; build gagal dengan error `ETARGET No matching version found`.

---

### Expected Behavior (Correct)

**[BUG-01 Fix]**

2.1 WHEN admin panel mengambil detail menu item THEN API `GET /api/menu/[id]` SHALL mengembalikan format yang konsisten dan dikonsumsi dengan benar oleh semua client yang memanggilnya tanpa menghasilkan data kosong.

**[BUG-02 Fix]**

2.2 WHEN pelanggan membuat pesanan baru dengan metode Cash tanpa bukti transfer THEN `POST /api/orders` SHALL menentukan `payment_status` awal menggunakan logika yang bersih tanpa string CSS terselip, dan nilai yang ditulis ke database SHALL selalu berupa salah satu dari `'pending'`, `'verified'`, atau `'rejected'`.

**[BUG-03 Fix]**

2.3 WHEN komponen `Image` memuat gambar dari path `/uploads/` atau domain eksternal yang diizinkan THEN `next.config.ts` SHALL mendefinisikan konfigurasi domain/pattern yang sesuai sehingga gambar yang diunggah oleh admin tampil tanpa error di halaman admin menu.

**[BUG-04 Fix]**

2.4 WHEN aplikasi dirender di browser THEN `SessionProvider` SHALL tersedia di level yang cukup tinggi sehingga semua komponen yang menggunakan `useSession()` mendapat akses session tanpa hydration error.

**[BUG-05 Fix]**

2.5 WHEN middleware memvalidasi JWT token dari cookies THEN secret yang digunakan middleware SHALL identik dengan secret yang digunakan NextAuth untuk menandatangani token, sehingga pengguna yang sudah login tidak diredirect kembali ke halaman login.

**[BUG-06 Fix]**

2.6 WHEN database tidak dapat dijangkau saat `GET /api/menu` dipanggil THEN API SHALL mengembalikan response JSON dengan status 500 dan pesan error yang informatif, dan halaman `/menu` SHALL menampilkan data menu statis fallback yang sudah ada di dalam kode.

**[BUG-07 Fix]**

2.7 WHEN database tidak dapat dijangkau saat `GET /api/stats` dipanggil THEN API SHALL mengembalikan response JSON dengan status 500 dan pesan error, dan halaman admin dashboard SHALL menampilkan state kosong/loading yang informatif alih-alih crash.

**[BUG-08 Fix]**

2.8 WHEN admin mengunggah foto menu di semua environment THEN `POST /api/upload` SHALL menyimpan file ke lokasi yang dapat ditulis (misalnya `public/uploads/` pada local, atau menggunakan solusi alternatif yang kompatibel), dan URL gambar yang dikembalikan SHALL dapat diakses di browser.

**[BUG-09 Fix]**

2.9 WHEN request PATCH ke API orders gagal di halaman kasir THEN UI SHALL menampilkan pesan error yang jelas dan state order di UI SHALL TIDAK diperbarui secara optimistis apabila response dari server tidak `ok`, sehingga data di layar tetap sinkron dengan database.

**[BUG-10 Fix]**

2.10 WHEN pelanggan memilih tipe order di modal checkout THEN nilai `orderType` yang dikirim ke API SHALL dipetakan secara eksplisit ke nilai yang diterima database (`'dine_in'` atau `'takeaway'`) tanpa bergantung pada substring matching yang rapuh.

**[BUG-11 Fix]**

2.11 WHEN database tidak dapat dijangkau saat `GET /api/orders` dipanggil THEN API SHALL mengembalikan response JSON dengan status 500, dan halaman kasir SHALL menampilkan pesan error yang informatif alih-alih crash.

**[BUG-12 Fix]**

2.12 WHEN environment database tersedia THEN sistem SHALL mengautentikasi pengguna hanya melalui database dengan password yang di-hash; fallback hardcoded credentials plaintext SHALL dihapus dari source code dan diganti dengan mekanisme yang aman (misalnya seeding database).

**[BUG-13 Fix]**

2.13 WHEN `npm install` dijalankan pada environment baru THEN `lucide-react` SHALL terdaftar dengan versi yang valid dan tersedia di npm registry sehingga instalasi dan build berhasil tanpa error `ETARGET`.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN pengguna publik mengakses halaman `/`, `/menu`, dan `/contact` tanpa login THEN sistem SHALL CONTINUE TO menampilkan halaman-halaman tersebut tanpa redirect ke login.

3.2 WHEN pengguna dengan role `admin` login dengan kredensial yang valid dari database THEN sistem SHALL CONTINUE TO meredirect pengguna ke `/admin` setelah login berhasil.

3.3 WHEN pengguna dengan role `kasir` login dengan kredensial yang valid dari database THEN sistem SHALL CONTINUE TO meredirect pengguna ke `/kasir` setelah login berhasil.

3.4 WHEN pengguna yang sudah login mencoba mengakses `/login` THEN middleware SHALL CONTINUE TO meredirect pengguna ke halaman dashboard sesuai role-nya.

3.5 WHEN pengguna tanpa session mencoba mengakses `/admin` atau `/kasir` THEN middleware SHALL CONTINUE TO meredirect pengguna ke `/login`.

3.6 WHEN admin menambah, mengedit, atau menghapus item menu melalui panel admin THEN operasi CRUD menu SHALL CONTINUE TO berfungsi dan perubahan SHALL CONTINUE TO tercermin di database.

3.7 WHEN pelanggan menambah item ke keranjang dan melakukan checkout di halaman `/menu` THEN pesanan SHALL CONTINUE TO tersimpan ke database dan kode pesanan (format `GCN-YYYYMMDD-XXXX`) SHALL CONTINUE TO dikembalikan sebagai konfirmasi.

3.8 WHEN kasir mengkonfirmasi pembayaran atau mengubah status pesanan menjadi `diproses` atau `selesai` THEN perubahan status SHALL CONTINUE TO tersimpan ke database melalui `PATCH /api/orders/[id]`.

3.9 WHEN admin mengakses dashboard THEN statistik hari ini (total pesanan, omzet, pesanan pending) SHALL CONTINUE TO ditampilkan dari database.

3.10 WHEN admin mengelola akun staf (tambah, edit, hapus) di halaman `/admin/users` THEN operasi tersebut SHALL CONTINUE TO berfungsi dengan benar dan perubahan SHALL CONTINUE TO tersimpan ke database.

3.11 WHEN pelanggan mengisi dan mengirim form kontak di halaman `/contact` THEN form SHALL CONTINUE TO menampilkan konfirmasi "Pesan Terkirim" setelah submit (meskipun pengiriman email sesungguhnya belum diimplementasi).

3.12 WHEN admin atau kasir menekan tombol "Keluar" THEN sistem SHALL CONTINUE TO melakukan sign-out dan meredirect ke halaman `/login`.
