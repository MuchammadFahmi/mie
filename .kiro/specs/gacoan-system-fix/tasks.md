# Implementation Tasks

## Task Overview
Perbaikan 13 bug kritis pada website pembelian Mie Gacoan, diurutkan dari yang paling kritikal (keamanan & auth) ke konfigurasi & code quality.

---

- [x] 1. [BUG-05] Sinkronisasi JWT secret antara middleware dan lib/auth.ts
  - Buka `middleware.ts`
  - Tambahkan fallback `|| "gacoan_secret_key_2026"` pada `secret: process.env.AUTH_SECRET`
  - Tambahkan `console.warn` jika `AUTH_SECRET` tidak diset
  - Verifikasi `lib/auth.ts` sudah punya fallback yang identik
  - **File**: `middleware.ts`
  - **Validates**: Property 5 — Secret Synchronization

- [x] 2. [BUG-04] Tambah SessionProvider ke root layout
  - Buat file `app/providers.tsx` sebagai Client Component yang membungkus `SessionProvider`
  - Import dan gunakan `<Providers>` di `app/layout.tsx` untuk membungkus `{children}`
  - Hapus `SessionProvider` yang redundan di `app/admin/layout.tsx`, `app/kasir/layout.tsx`, dan `app/login/layout.tsx` (opsional, tapi recommended untuk kebersihan kode)
  - **Files**: `app/providers.tsx` (baru), `app/layout.tsx`, `app/admin/layout.tsx`, `app/kasir/layout.tsx`, `app/login/layout.tsx`
  - **Validates**: Property 4 — Session Provider Coverage

- [x] 3. [BUG-12] Hapus hardcoded fallback credentials plaintext dari lib/auth.ts
  - Buka `lib/auth.ts`
  - Hapus seluruh blok fallback plaintext credentials (bagian "Default Accounts Fallback")
  - Pastikan `return null` tetap ada setelah try-catch sehingga autentikasi gagal jika DB tidak tersedia
  - **File**: `lib/auth.ts`
  - **Validates**: Property 12 — No Hardcoded Credentials

- [-] 4. [BUG-13] Perbaiki versi lucide-react di package.json
  - Buka `package.json`
  - Ganti `"lucide-react": "^1.47.0"` menjadi `"lucide-react": "^0.511.0"`
  - Jalankan `npm install` untuk memverifikasi instalasi berhasil
  - **File**: `package.json`
  - **Validates**: Property 13 — Valid npm Package Version

- [x] 5. [BUG-06] Tambah try-catch ke GET /api/menu
  - Buka `app/api/menu/route.ts`
  - Bungkus seluruh body handler GET dalam try-catch block
  - Pada catch: kembalikan `NextResponse.json({ error: "Gagal memuat data menu", menu: [] }, { status: 500 })`
  - **File**: `app/api/menu/route.ts`
  - **Validates**: Property 6 — GET /api/menu Error Handling

- [x] 6. [BUG-07] Tambah try-catch ke GET /api/stats
  - Buka `app/api/stats/route.ts`
  - Bungkus semua query paralel dalam satu try-catch block (setelah auth check)
  - Pada catch: kembalikan `NextResponse.json({ error: "Gagal memuat statistik" }, { status: 500 })`
  - **File**: `app/api/stats/route.ts`
  - **Validates**: Property 7 — GET /api/stats Error Handling

- [x] 7. [BUG-11] Tambah try-catch ke GET /api/orders
  - Buka `app/api/orders/route.ts`
  - Bungkus seluruh logika GET (setelah auth check) dalam try-catch block
  - Pada catch: kembalikan `NextResponse.json({ error: "Gagal memuat data pesanan", orders: [] }, { status: 500 })`
  - **File**: `app/api/orders/route.ts`
  - **Validates**: Property 11 — GET /api/orders Error Handling

- [x] 8. [BUG-01] Standarisasi response format GET /api/menu/[id] + tambah try-catch
  - Buka `app/api/menu/[id]/route.ts`
  - Ganti `return NextResponse.json({ menu: rows[0] })` menjadi `return NextResponse.json({ item: rows[0] })`
  - Bungkus seluruh handler GET dalam try-catch block
  - Pada catch: kembalikan `NextResponse.json({ error: "Gagal mengambil data menu" }, { status: 500 })`
  - **File**: `app/api/menu/[id]/route.ts`
  - **Validates**: Property 1 — API Response Consistency

- [x] 9. [BUG-02] Hapus string CSS dari logika initialPaymentStatus di POST /api/orders
  - Buka `app/api/orders/route.ts`
  - Hapus atau perbaiki variabel `initialPaymentStatus` yang mengandung string `"pending font-medium"`
  - Opsi yang direkomendasikan: hapus variabel tersebut sepenuhnya (dead code karena INSERT sudah hardcode `"pending"`)
  - **File**: `app/api/orders/route.ts`
  - **Validates**: Property 2 — Payment Status Purity

- [x] 10. [BUG-10] Ganti orderType substring matching dengan explicit mapping
  - Buka `app/api/orders/route.ts`
  - Ganti logika `.toLowerCase().includes("away")` dengan `ORDER_TYPE_MAP` dictionary eksplisit
  - Map: `"take away"`, `"takeaway"`, `"take_away"`, `"online"` → `"takeaway"`; `"dine in"`, `"dine_in"`, `"dinein"`, `"dine-in"` → `"dine_in"`
  - Gunakan `?? "dine_in"` sebagai fallback untuk nilai yang tidak dikenal
  - **File**: `app/api/orders/route.ts`
  - **Validates**: Property 10 — Order Type Explicit Mapping

- [x] 11. [BUG-09] Tambah error handling ke handler kasir (handleVerifyPayment, handleUpdateStatus, handleCancel)
  - Buka `app/kasir/page.tsx`
  - Di `handleVerifyPayment`: tambahkan `if (!res.ok) throw new Error(...)` sebelum `setOrders`, pindahkan `setOrders` ke dalam blok kondisi sukses
  - Di `handleUpdateStatus`: tambahkan `if (!res.ok) throw new Error(...)` sebelum `setOrders`, pindahkan `setOrders` ke dalam blok kondisi sukses
  - Di `handleCancel`: tambahkan `if (!res.ok) throw new Error(...)` sebelum `setOrders`, pindahkan `setOrders` ke dalam blok kondisi sukses
  - Pada catch di setiap handler: tampilkan `alert(error.message)` untuk memberi tahu kasir
  - **File**: `app/kasir/page.tsx`
  - **Validates**: Property 9 — Kasir Optimistic Update Safety

- [x] 12. [BUG-03] Konfigurasi next.config.ts untuk images
  - Buka `next.config.ts`
  - Tambahkan konfigurasi `images` dengan `localPatterns` untuk `/assets/**` dan `/uploads/**`
  - Tambahkan `qualities: [75, 90, 100]` untuk kompatibilitas Next.js 16
  - **File**: `next.config.ts`
  - **Validates**: Property 3 — Image Configuration

- [x] 13. [BUG-08] Perbaiki upload handler untuk kompatibilitas serverless
  - Buka `app/api/upload/route.ts`
  - Tambahkan validasi tipe file (hanya JPEG, PNG, WebP, GIF)
  - Tambahkan validasi ukuran file (maksimal 5MB)
  - Bungkus `writeFile` ke `public/uploads` dalam try-catch inner
  - Pada filesystem error: fallback ke `/tmp` directory untuk kompatibilitas serverless
  - Tambahkan outer try-catch untuk menangani error tak terduga
  - **File**: `app/api/upload/route.ts`
  - **Validates**: Property 8 — Upload Compatibility
