# Gacoan System Fix — Bugfix Design

## Overview

Dokumen ini mendefinisikan desain teknis untuk memperbaiki 13 bug yang telah diidentifikasi pada website Mie Gacoan. Bug-bug ini mencakup lapisan API routes, halaman publik, panel admin, panel kasir, autentikasi, dan konfigurasi Next.js. Pendekatan perbaikan berfokus pada targeted minimal fixes — setiap perubahan dibatasi pada area yang terpengaruh bug tanpa merombak fungsionalitas yang sudah bekerja.

Strategi perbaikan dibagi menjadi dua kategori:
- **Fix Checking**: Memverifikasi bahwa input yang memicu bug menghasilkan perilaku yang benar setelah perbaikan.
- **Preservation Checking**: Memverifikasi bahwa input yang tidak terpengaruh bug tetap menghasilkan perilaku yang sama.

---

## Glossary

- **Bug_Condition (C)**: Kondisi spesifik yang memicu bug — input, state, atau kombinasi keduanya yang menyebabkan perilaku salah.
- **Property (P)**: Perilaku yang diharapkan ketika bug condition terpenuhi — apa yang seharusnya terjadi setelah fix.
- **Preservation**: Perilaku yang harus tetap tidak berubah setelah fix diterapkan — fungsionalitas yang saat ini bekerja dengan benar.
- **isBugCondition(input)**: Fungsi pseudocode yang menentukan apakah suatu input termasuk dalam bug condition.
- **expectedBehavior(result)**: Fungsi pseudocode yang menentukan apakah hasil dari fixed function sudah benar.
- **pool**: Instance MySQL connection pool dari `lib/db.ts`.
- **auth()**: Fungsi session resolver dari `lib/auth.ts` (NextAuth v5 server-side).
- **getToken()**: Fungsi NextAuth JWT dari `next-auth/jwt` yang digunakan di middleware.
- **AUTH_SECRET**: Environment variable yang digunakan sebagai signing secret untuk JWT NextAuth.

---

## Bug Details

### BUG-01: GET /api/menu/[id] — Response format tidak dikonsumsi dengan benar di admin panel

**File**: `app/api/menu/[id]/route.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_01(request)
  INPUT: HTTP GET request ke /api/menu/[id]
  OUTPUT: boolean

  RETURN request.caller === "admin_panel"
         AND response.shape === { menu: row }
         AND caller_code DOES NOT unwrap response.menu
END FUNCTION
```

API mengembalikan `{ menu: rows[0] }` namun admin panel di `admin/menu/page.tsx` pada fungsi `openEdit` menerima item langsung dari state `items` (bukan dari API detail), sehingga edit berfungsi. Namun **jika ada client lain yang fetch `/api/menu/[id]`** (misalnya untuk pre-populate form atau detail view), mereka akan menerima `{ menu: {...} }` dan tidak ada unwrapping. Inkonsistensi ini juga kontras dengan `GET /api/orders/[id]` yang mengembalikan `{ order: ..., items: [...] }`. Fix: standardisasi response format `GET /api/menu/[id]` menjadi `{ item: row }` (konsisten dengan konvensi REST) dan tambahkan try-catch.

**Contoh Manifestasi**:
- Admin fetch `/api/menu/5` → mendapat `{ menu: { id: 5, name: "Mie Gacoan" } }`
- Client yang melakukan `const { item } = await res.json()` → `item` bernilai `undefined`
- Client yang melakukan `const data = await res.json()` kemudian akses `data.name` → `undefined`

---

### BUG-02: `initialPaymentStatus` mengandung string CSS di POST /api/orders

**File**: `app/api/orders/route.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_02(body)
  INPUT: request body POST /api/orders
  OUTPUT: boolean

  RETURN body.payment_method === "Cash"
         AND (body.payment_proof === null OR body.payment_proof === "")
END FUNCTION
```

Pada baris:
```typescript
const initialPaymentStatus = finalPaymentMethod === "Cash" && !finalPaymentProof 
  ? "pending font-medium"   // <-- BUG: Tailwind class terselip
  : "pending";
```

Nilai `"pending font-medium"` adalah string Tailwind CSS yang terselip di dalam logika bisnis. Meski variabel ini tidak digunakan dalam `INSERT` query (yang hardcode `"pending"`), jika kode direfactor dan `initialPaymentStatus` mulai digunakan, nilai invalid akan masuk ke database kolom `payment_status` yang seharusnya hanya menerima `'pending'`, `'verified'`, atau `'rejected'`.

**Contoh Manifestasi**:
- Jika `initialPaymentStatus` dipakai: `INSERT ... payment_status = 'pending font-medium'` → data kotor di DB
- Query `WHERE payment_status = 'pending'` tidak mengembalikan baris tersebut

---

### BUG-03: `next.config.ts` tidak mengkonfigurasi `images.remotePatterns` atau `localPatterns`

**File**: `next.config.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_03(imageRequest)
  INPUT: request Next.js Image Optimization untuk path /uploads/*
  OUTPUT: boolean

  RETURN imageRequest.src.startsWith("/uploads/")
         AND next.config.images.localPatterns === undefined
         AND next.config.images.remotePatterns === undefined
END FUNCTION
```

Next.js 16 (versi yang digunakan: `16.3.5`) menambahkan konfigurasi `qualities` yang **wajib diset** (default hanya `[75]`). Selain itu, gambar yang di-upload ke `/public/uploads/` akan di-serve sebagai local path `/uploads/...` — tanpa `localPatterns` yang mengizinkan path tersebut, Image component dapat menolaknya tergantung konfigurasi security. Minimal, konfigurasi `images` harus eksplisit untuk kompatibilitas Next.js 16.

**Contoh Manifestasi**:
- Admin upload foto menu → URL `/uploads/menu_1234567890_abc.jpg` dikembalikan
- `<Image src="/uploads/menu_1234567890_abc.jpg" />` di admin panel → error atau gambar tidak tampil

---

### BUG-04: `SessionProvider` hanya ada di sub-layout, tidak di root layout

**File**: `app/layout.tsx`, `app/admin/layout.tsx`, `app/kasir/layout.tsx`, `app/login/layout.tsx`

**Bug Condition**:

```
FUNCTION isBugCondition_04(component)
  INPUT: React component yang memanggil useSession()
  OUTPUT: boolean

  RETURN component IS OUTSIDE subtree(AdminLayout, KasirLayout, LoginLayout)
         AND component CALLS useSession()
END FUNCTION
```

`SessionProvider` saat ini hanya dibungkus di `AdminLayout`, `KasirLayout`, dan `LoginLayout`. Komponen seperti `Navbar` di halaman publik yang mungkin perlu menampilkan state login tidak akan mendapat session context. Ini juga berpotensi menyebabkan hydration mismatch jika `useSession` dipanggil di luar subtree tersebut.

**Contoh Manifestasi**:
- `Navbar` ditambahkan `useSession()` untuk tombol "Login/Logout" → error: `useSession must be wrapped in a SessionProvider`
- Komponen di `app/page.tsx` (homepage) menggunakan `useSession()` → crash

---

### BUG-05: Secret tidak sinkron antara middleware dan `lib/auth.ts`

**File**: `middleware.ts`, `lib/auth.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_05(environment)
  INPUT: environment variable configuration
  OUTPUT: boolean

  RETURN environment.AUTH_SECRET === undefined
         AND auth_ts.secret === "gacoan_secret_key_2026"  // fallback
         AND middleware.getToken.secret === undefined       // tanpa fallback
END FUNCTION
```

Di `middleware.ts`:
```typescript
const token = await getToken({
  req,
  secret: process.env.AUTH_SECRET,  // undefined jika .env tidak diset
});
```

Di `lib/auth.ts`:
```typescript
secret: process.env.AUTH_SECRET || "gacoan_secret_key_2026",  // ada fallback
```

Ketika `AUTH_SECRET` tidak diset, `getToken` menggunakan `undefined` sebagai secret sehingga tidak dapat mendekode token yang ditandatangani dengan `"gacoan_secret_key_2026"`. Hasilnya semua request ke `/admin` dan `/kasir` diredirect ke `/login` meski user sudah login.

**Contoh Manifestasi**:
- User login berhasil → mendapat JWT signed dengan `"gacoan_secret_key_2026"`
- Akses `/admin` → middleware `getToken` dengan `secret: undefined` → token = null → redirect ke `/login`
- Loop redirect tanpa bisa masuk

---

### BUG-06: `GET /api/menu` tidak memiliki try-catch

**File**: `app/api/menu/route.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_06(databaseState)
  INPUT: state koneksi database saat GET /api/menu dipanggil
  OUTPUT: boolean

  RETURN databaseState === "unavailable" OR databaseState === "query_failed"
         AND tryBlock === absent_in_GET_handler
END FUNCTION
```

Handler GET saat ini:
```typescript
export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM menu_items WHERE is_active = 1 ORDER BY category, id"
  );
  return NextResponse.json({ menu: rows });
  // Tidak ada try-catch!
}
```

Jika DB tidak tersedia, `pool.query` akan throw error yang tidak tertangkap, menyebabkan Next.js mengembalikan 500 Unhandled Server Error dan halaman `/menu` publik crash total.

---

### BUG-07: `GET /api/stats` tidak memiliki try-catch

**File**: `app/api/stats/route.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_07(databaseState)
  INPUT: state koneksi database saat GET /api/stats dipanggil
  OUTPUT: boolean

  RETURN databaseState === "unavailable" OR databaseState === "query_failed"
         AND tryBlock === absent_in_GET_handler
END FUNCTION
```

Empat query paralel di `GET /api/stats` (todayStats, totalStats, staffCount, menuCount) tidak dibungkus try-catch. Jika salah satu gagal, dashboard admin crash dengan unhandled error.

---

### BUG-08: Upload gambar menggunakan `fs.writeFile` — tidak kompatibel di serverless

**File**: `app/api/upload/route.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_08(deploymentEnvironment)
  INPUT: environment tempat aplikasi di-deploy
  OUTPUT: boolean

  RETURN deploymentEnvironment IN ["vercel", "aws-lambda", "cloudflare-workers"]
         AND uploadHandler USES fs.writeFile
         AND targetPath === process.cwd() + "/public/uploads/"
END FUNCTION
```

`writeFile` ke filesystem lokal hanya bekerja di local development. Di environment serverless (Vercel, dll.), filesystem bersifat read-only di luar `/tmp`. Solusi yang dipilih: redirect menulis ke `/tmp` untuk kompatibilitas serverless sekaligus mempertahankan fungsionalitas local, dengan catatan bahwa untuk production sejati diperlukan cloud storage (S3, Cloudinary, dll.).

---

### BUG-09: `handleVerifyPayment` dan `handleUpdateStatus` di kasir tidak cek `res.ok`

**File**: `app/kasir/page.tsx`

**Bug Condition**:

```
FUNCTION isBugCondition_09(apiResponse)
  INPUT: response dari PATCH /api/orders/[id]
  OUTPUT: boolean

  RETURN (apiResponse.status >= 400 OR apiResponse IS network_error)
         AND uiState UPDATED OPTIMISTICALLY BEFORE checking res.ok
END FUNCTION
```

Tiga handler (handleVerifyPayment, handleUpdateStatus, handleCancel) memiliki pola yang sama:
```typescript
await fetch(`/api/orders/${orderId}`, { method: "PATCH", ... });
setOrders((prev) => prev.map((o) => /* update UI */));  // selalu dijalankan
```

Tidak ada pengecekan `res.ok`. Jika API gagal (401, 500, network error), UI tetap menampilkan status yang sudah diupdate padahal database belum berubah.

**Contoh Manifestasi**:
- Network putus sementara → kasir klik "Konfirmasi Bayar" → UI menampilkan status "LUNAS" → tapi database masih "pending"
- Refresh halaman → status kembali ke "pending" → kasir bingung

---

### BUG-10: `orderType` mapping rapuh di modal checkout halaman `/menu`

**File**: `app/menu/page.tsx`, `app/api/orders/route.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_10(checkoutSubmission)
  INPUT: data yang dikirim dari modal checkout
  OUTPUT: boolean

  RETURN checkoutSubmission.orderType IN ["Take Away", "Dine In", "dinein", "online"]
         AND normalization_logic USES substring_matching(".includes('away')")
END FUNCTION
```

Di `menu/page.tsx`, nilai dikirim sebagai:
```typescript
orderType: orderType === "online" ? "Take Away" : "Dine In",
```

Di `api/orders/route.ts`, normalisasi:
```typescript
const finalOrderType = (order_type || orderType || "dine_in")
  .toLowerCase()
  .includes("away") ? "takeaway" : "dine_in";
```

Ini rapuh karena:
1. Jika UI mengirim `"Dine-In"` atau `"dine in"` (variasi format) → jatuh ke `"dine_in"` (kebetulan benar)
2. Jika UI mengirim `"Takeaway"` (tanpa spasi) → jatuh ke `"takeaway"` (kebetulan benar)
3. Namun jika ada perubahan format string di UI, mapping bisa silently break tanpa error

Fix: gunakan mapping eksplisit dengan nilai enum yang terdefinisi.

---

### BUG-11: `GET /api/orders` tidak memiliki try-catch

**File**: `app/api/orders/route.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_11(databaseState)
  INPUT: state koneksi database saat GET /api/orders dipanggil
  OUTPUT: boolean

  RETURN databaseState === "unavailable" OR databaseState === "query_failed"
         AND tryBlock === absent_in_GET_handler
END FUNCTION
```

Handler GET saat ini tidak memiliki try-catch:
```typescript
export async function GET(req: NextRequest) {
  // ... auth check ...
  const [rows] = await pool.query<RowDataPacket[]>(query, params);  // bisa throw
  return NextResponse.json({ orders: rows });
  // Tidak ada try-catch!
}
```

---

### BUG-12: Hardcoded fallback credentials plaintext di `lib/auth.ts`

**File**: `lib/auth.ts`

**Bug Condition**:

```
FUNCTION isBugCondition_12(authAttempt)
  INPUT: login attempt dengan email dan password
  OUTPUT: boolean

  RETURN authAttempt.email IN ["admin@gacoan.com", "kasir@gacoan.com"]
         AND authAttempt.password IN ["admin123", "kasir123", "password123"]
         AND (databaseUnavailable OR databaseNotReturningUser)
END FUNCTION
```

Fallback:
```typescript
if (emailStr === "admin@gacoan.com" && (passStr === "admin123" || passStr === "password123")) {
  return { id: "1", name: "Admin Gacoan", email: "admin@gacoan.com", role: "admin" };
}
```

Credentials plaintext di source code adalah risiko keamanan serius: siapa pun yang membaca kode (repo publik, leaked source) dapat login sebagai admin meski database dikonfigurasi dengan password berbeda.

---

### BUG-13: `lucide-react` versi `^1.47.0` tidak valid di npm registry

**File**: `package.json`

**Bug Condition**:

```
FUNCTION isBugCondition_13(npmInstall)
  INPUT: perintah npm install pada environment baru
  OUTPUT: boolean

  RETURN package_json.dependencies["lucide-react"] === "^1.47.0"
         AND npm_registry.latestVersion("lucide-react") < "1.0.0"
END FUNCTION
```

`lucide-react` saat ini tersedia di npm dalam versi `0.x` (contoh: `0.511.0`, `0.460.0`). Versi `^1.47.0` tidak ada, sehingga `npm install` di environment baru akan gagal dengan:
```
npm error notarget No matching version found for lucide-react@^1.47.0
```

---

## Expected Behavior

### Preservation Requirements

**Perilaku yang HARUS tetap tidak berubah setelah semua fix:**
- Halaman publik `/`, `/menu`, `/contact` tetap dapat diakses tanpa login
- Login admin dan kasir dengan kredensial valid dari database tetap berfungsi dan redirect ke dashboard yang benar
- Middleware tetap melindungi `/admin` dan `/kasir` dari akses tanpa session
- Middleware tetap meredirect user yang sudah login dari `/login` ke dashboard sesuai role
- Semua operasi CRUD menu oleh admin tetap berfungsi
- Checkout pesanan oleh pelanggan di halaman `/menu` tetap menyimpan ke database dengan kode format `GCN-YYYYMMDD-XXXX`
- Kasir dapat mengupdate status pesanan dan konfirmasi pembayaran (setelah fix BUG-09, dengan penambahan error handling yang tidak mengganggu happy path)
- Dashboard admin tetap menampilkan statistik dari database
- Manajemen akun staf oleh admin tetap berfungsi
- Tombol "Keluar" tetap melakukan sign-out dan redirect ke `/login`

**Scope perubahan:**
Fix BUG-01 s.d. BUG-13 hanya mengubah logika yang salah, tidak menambah fitur baru atau merombak arsitektur. Setiap fix berdiri sendiri dan tidak bergantung pada fix lainnya (kecuali BUG-04 dan BUG-05 yang keduanya berkaitan dengan auth/session).

---

## Hypothesized Root Cause

### BUG-01
**Penyebab**: Inkonsistensi konvensi penamaan property response — developer menggunakan `{ menu: row }` untuk GET by ID mengikuti nama entity, namun tidak memikirkan bahwa client perlu unwrap. Response format tidak pernah distandarisasi secara eksplisit.

### BUG-02
**Penyebab**: Copy-paste error — developer mungkin menyalin kondisi dari template Tailwind dan lupa menghapus class CSS setelah selesai menulis logika. Tidak terdeteksi karena variabel tidak digunakan dalam INSERT query.

### BUG-03
**Penyebab**: `next.config.ts` dibiarkan kosong saat scaffolding proyek. Next.js 16 memperketat konfigurasi image (menambahkan `qualities` yang wajib) namun belum ada konfigurasi yang dibuat.

### BUG-04
**Penyebab**: Developer menambahkan `SessionProvider` hanya di layout yang diketahui memerlukan session (admin, kasir, login) tanpa mempertimbangkan future-proofing untuk komponen di level root atau halaman publik.

### BUG-05
**Penyebab**: `middleware.ts` ditulis tanpa menyadari bahwa `process.env.AUTH_SECRET` bisa `undefined` di development, sedangkan `lib/auth.ts` sudah memiliki fallback string. Dua file yang seharusnya berbagi secret tidak memiliki mekanisme sinkronisasi.

### BUG-06, BUG-07, BUG-11
**Penyebab**: Missing error handling — pola yang tidak konsisten; beberapa handler (POST /api/orders) sudah memiliki try-catch namun GET handlers tidak. Kemungkinan GET dianggap "aman" karena hanya read operation.

### BUG-08
**Penyebab**: Implementasi upload menggunakan `fs.writeFile` yang berhasil di local development tanpa mempertimbangkan kompatibilitas serverless deployment.

### BUG-09
**Penyebab**: Optimistic UI update diterapkan tanpa error handling — developer memprioritaskan UX responsif namun lupa menambahkan rollback ketika API gagal.

### BUG-10
**Penyebab**: Normalisasi orderType menggunakan substring matching sebagai shortcut daripada explicit mapping. Bekerja untuk nilai saat ini tapi rapuh.

### BUG-12
**Penyebab**: Fallback credentials ditambahkan sebagai convenience untuk development/testing, namun tidak dihapus sebelum commit ke codebase yang berpotensi publik.

### BUG-13
**Penyebab**: Versi `1.47.0` kemungkinan berasal dari confusing package naming — `lucide-react` versi terbaru adalah `0.x` bukan `1.x`. Developer mungkin salah melihat changelog atau menggunakan versi dari package lain.

---

## Correctness Properties

Property 1: Bug Condition — API Response Consistency

_For any_ request ke `GET /api/menu/[id]`, response SHALL menggunakan property key `item` (bukan `menu`) untuk membungkus data item, dan handler SHALL mengembalikan JSON error dengan status 500 jika terjadi database error.

**Validates: Requirements 2.1**

---

Property 2: Bug Condition — Payment Status Purity

_For any_ POST request ke `/api/orders`, nilai `payment_status` yang disimpan ke database SHALL selalu berupa salah satu dari nilai enum `'pending'`, `'verified'`, `'rejected'` — tidak pernah mengandung string CSS atau karakter selain nilai enum tersebut.

**Validates: Requirements 2.2**

---

Property 3: Bug Condition — Image Configuration

_For any_ `next/image` component yang me-render gambar dengan path `/uploads/**`, Next.js SHALL berhasil mengoptimasi dan menampilkan gambar tanpa error `Invalid src` atau `400 Bad Request`.

**Validates: Requirements 2.3**

---

Property 4: Bug Condition — Session Provider Coverage

_For any_ React component yang memanggil `useSession()`, component SHALL mendapat akses ke session context tanpa error `useSession must be wrapped in a SessionProvider`, karena `SessionProvider` tersedia di root layout.

**Validates: Requirements 2.4**

---

Property 5: Bug Condition — Secret Synchronization

_For any_ JWT token yang ditandatangani oleh NextAuth menggunakan secret X, middleware `getToken()` SHALL menggunakan secret yang sama X sehingga token dapat divalidasi, dan pengguna yang sudah login SHALL TIDAK diredirect kembali ke `/login`.

**Validates: Requirements 2.5**

---

Property 6: Bug Condition — GET /api/menu Error Handling

_For any_ kondisi dimana database tidak tersedia saat `GET /api/menu` dipanggil, API SHALL mengembalikan `NextResponse.json({ error: "..." }, { status: 500 })` alih-alih unhandled exception.

**Validates: Requirements 2.6**

---

Property 7: Bug Condition — GET /api/stats Error Handling

_For any_ kondisi dimana database tidak tersedia saat `GET /api/stats` dipanggil, API SHALL mengembalikan `NextResponse.json({ error: "..." }, { status: 500 })` alih-alih unhandled exception.

**Validates: Requirements 2.7**

---

Property 8: Bug Condition — Upload Compatibility

_For any_ environment (local atau serverless-compatible), `POST /api/upload` SHALL berhasil menyimpan file dan mengembalikan URL yang valid tanpa filesystem write error.

**Validates: Requirements 2.8**

---

Property 9: Bug Condition — Kasir Optimistic Update Safety

_For any_ PATCH request yang gagal (status >= 400 atau network error) di halaman kasir, state orders di UI SHALL TIDAK diperbarui, dan pesan error SHALL ditampilkan kepada kasir.

**Validates: Requirements 2.9**

---

Property 10: Bug Condition — Order Type Explicit Mapping

_For any_ nilai `orderType` yang dikirim dari modal checkout (`"online"` atau `"dinein"`), nilai yang disimpan ke database SHALL selalu berupa `'takeaway'` atau `'dine_in'` melalui explicit mapping, tanpa bergantung pada substring matching.

**Validates: Requirements 2.10**

---

Property 11: Bug Condition — GET /api/orders Error Handling

_For any_ kondisi dimana database tidak tersedia saat `GET /api/orders` dipanggil, API SHALL mengembalikan `NextResponse.json({ error: "..." }, { status: 500 })` alih-alih unhandled exception.

**Validates: Requirements 2.11**

---

Property 12: Bug Condition — No Hardcoded Credentials

_For any_ login attempt dengan email dan password, autentikasi SHALL hanya berhasil jika kredensial valid ada di database — tidak ada fallback plaintext hardcoded yang mengizinkan akses ketika database tidak tersedia.

**Validates: Requirements 2.12**

---

Property 13: Bug Condition — Valid npm Package Version

_For any_ `npm install` pada environment baru, semua dependencies di `package.json` SHALL resolve ke versi yang tersedia di npm registry tanpa error `ETARGET`.

**Validates: Requirements 2.13**

---

Property 14: Preservation — Auth and Routing Behavior

_For any_ input yang tidak termasuk dalam bug condition (login valid, akses halaman publik, operasi CRUD yang benar), semua perilaku routing, autentikasi, dan data persistence SHALL tetap identik dengan perilaku sebelum fix.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10, 3.11, 3.12**

---

## Fix Implementation

### FIX-01: Standarisasi response format `GET /api/menu/[id]` + tambah try-catch

**File**: `app/api/menu/[id]/route.ts`

**Function**: `GET`

**Perubahan Spesifik**:

Ganti baris `return NextResponse.json({ menu: rows[0] })` dengan `{ item: rows[0] }`, dan bungkus seluruh handler dalam try-catch.

```typescript
// SEBELUM:
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM menu_items WHERE id = ? LIMIT 1",
    [id]
  );
  if (!rows.length)
    return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 404 });
  return NextResponse.json({ menu: rows[0] });  // BUG: key "menu" tidak konsisten
}

// SESUDAH:
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM menu_items WHERE id = ? LIMIT 1",
      [id]
    );
    if (!rows.length)
      return NextResponse.json({ error: "Menu tidak ditemukan" }, { status: 404 });
    return NextResponse.json({ item: rows[0] });  // FIX: key "item" lebih eksplisit
  } catch (error) {
    console.error("Error fetching menu item:", error);
    return NextResponse.json({ error: "Gagal mengambil data menu" }, { status: 500 });
  }
}
```

**Catatan**: Karena admin panel `openEdit` tidak fetch dari API detail (mengambil dari state `items` yang sudah di-load saat `loadMenu()`), perubahan key ini tidak membreak fungsi edit yang ada. Namun perlu dipastikan tidak ada fetch lain yang mengakses `response.menu` untuk endpoint ini.

---

### FIX-02: Hapus string CSS dari logika `initialPaymentStatus`

**File**: `app/api/orders/route.ts`

**Function**: `POST`

**Perubahan Spesifik**:

Baris yang bermasalah (sekitar baris 35):

```typescript
// SEBELUM:
const initialPaymentStatus = finalPaymentMethod === "Cash" && !finalPaymentProof 
  ? "pending font-medium"   // BUG: Tailwind CSS terselip
  : "pending";

// SESUDAH:
// Variabel ini sebenarnya tidak digunakan dalam INSERT (yang hardcode "pending"),
// namun diperbaiki untuk konsistensi logika dan mencegah masalah jika kode dipakai ulang.
// Jika logic ini memang tidak diperlukan, hapus saja variabel tersebut.
// Opsi 1: Hapus variabel (karena INSERT sudah hardcode "pending"):
// [hapus baris initialPaymentStatus]

// Opsi 2: Perbaiki logika (jika nantinya akan dipakai):
const initialPaymentStatus: "pending" | "verified" | "rejected" = 
  finalPaymentMethod === "Cash" && !finalPaymentProof ? "pending" : "pending";
// Catatan: keduanya "pending" karena pesanan baru selalu dimulai dengan status pending.
// Verifikasi dilakukan manual oleh kasir.
```

Rekomendasi: hapus variabel `initialPaymentStatus` sepenuhnya karena INSERT query sudah hardcode `"pending"` dan variabel tersebut tidak dipakai. Ini menghilangkan dead code sekaligus bug.

---

### FIX-03: Konfigurasi `next.config.ts` untuk images

**File**: `next.config.ts`

**Perubahan Spesifik**:

```typescript
// SEBELUM:
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

// SESUDAH:
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Izinkan gambar dari path /uploads/ yang di-generate saat upload
    localPatterns: [
      {
        pathname: "/assets/**",
        search: "",
      },
      {
        pathname: "/uploads/**",
        search: "",
      },
    ],
    // Next.js 16 mewajibkan konfigurasi qualities eksplisit
    qualities: [75, 90, 100],
  },
};

export default nextConfig;
```

---

### FIX-04: Tambah `SessionProvider` ke root layout

**File**: `app/layout.tsx`

**Perubahan Spesifik**:

Root layout perlu dibuat Client Component untuk membungkus `SessionProvider`, atau gunakan pattern `SessionProvider` di Server Component dengan cara yang direkomendasikan NextAuth v5.

```typescript
// SEBELUM:
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mie Gacoan - Mie Dulu Baru Skripsi",
  description: "Website resmi Mie Gacoan. Pesan online atau dine-in sekarang!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        {children}
      </body>
    </html>
  );
}

// SESUDAH:
// Buat file baru: app/providers.tsx (Client Component)
// -----------------------------------------------
// "use client";
// import { SessionProvider } from "next-auth/react";
// export function Providers({ children }: { children: React.ReactNode }) {
//   return <SessionProvider>{children}</SessionProvider>;
// }
// -----------------------------------------------
// Kemudian update app/layout.tsx:

import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = {
  title: "Mie Gacoan - Mie Dulu Baru Skripsi",
  description: "Website resmi Mie Gacoan. Pesan online atau dine-in sekarang!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col font-sans">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

**Catatan**: Sub-layout `AdminLayout`, `KasirLayout`, dan `LoginLayout` sudah memiliki `SessionProvider` sendiri. Setelah menambahkan di root layout, `SessionProvider` di sub-layout menjadi redundan tapi tidak berbahaya (SessionProvider dapat di-nest). Untuk kebersihan kode, hapus `SessionProvider` dari sub-layout setelah root layout sudah membungkusnya.

---

### FIX-05: Sinkronisasi secret antara middleware dan auth

**File**: `middleware.ts`

**Perubahan Spesifik**:

```typescript
// SEBELUM:
const token = await getToken({
  req,
  secret: process.env.AUTH_SECRET,  // undefined jika tidak diset
});

// SESUDAH:
const token = await getToken({
  req,
  secret: process.env.AUTH_SECRET || "gacoan_secret_key_2026",  // sama dengan fallback di lib/auth.ts
});
```

**Catatan Keamanan**: Fallback string `"gacoan_secret_key_2026"` di sini bukan best practice untuk production — seharusnya `AUTH_SECRET` selalu diset di environment. Namun untuk memastikan paritas dengan `lib/auth.ts` dan menghindari loop redirect di development, fallback ini diperlukan. Tambahkan warning di kode:

```typescript
if (!process.env.AUTH_SECRET) {
  console.warn("[middleware] AUTH_SECRET tidak diset — menggunakan fallback development secret");
}
```

---

### FIX-06: Tambah try-catch ke `GET /api/menu`

**File**: `app/api/menu/route.ts`

**Function**: `GET`

**Perubahan Spesifik**:

```typescript
// SEBELUM:
export async function GET() {
  const [rows] = await pool.query<RowDataPacket[]>(
    "SELECT * FROM menu_items WHERE is_active = 1 ORDER BY category, id"
  );
  return NextResponse.json({ menu: rows });
}

// SESUDAH:
export async function GET() {
  try {
    const [rows] = await pool.query<RowDataPacket[]>(
      "SELECT * FROM menu_items WHERE is_active = 1 ORDER BY category, id"
    );
    return NextResponse.json({ menu: rows });
  } catch (error) {
    console.error("Error fetching menu:", error);
    return NextResponse.json(
      { error: "Gagal memuat data menu", menu: [] },
      { status: 500 }
    );
  }
}
```

**Catatan**: Response error tetap menyertakan `menu: []` sehingga halaman `/menu` dapat fallback ke data statis yang sudah ada di dalam kode (logika `liveMenu.length > 0 ? liveMenu : noodleItems` sudah ada di `menu/page.tsx`).

---

### FIX-07: Tambah try-catch ke `GET /api/stats`

**File**: `app/api/stats/route.ts`

**Function**: `GET`

**Perubahan Spesifik**:

```typescript
// SEBELUM:
export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [todayStats] = await pool.query<RowDataPacket[]>(`...`);
  // ... lebih banyak query tanpa try-catch ...
  return NextResponse.json({ today: todayStats[0], ... });
}

// SESUDAH:
export async function GET() {
  const session = await auth();
  if (!session || session.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [todayStats] = await pool.query<RowDataPacket[]>(`
      SELECT
        COUNT(*) AS total_pesanan_hari_ini,
        SUM(CASE WHEN status = 'selesai' THEN total_price ELSE 0 END) AS pendapatan_hari_ini,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) AS pesanan_pending,
        SUM(CASE WHEN status = 'diproses' THEN 1 ELSE 0 END) AS pesanan_diproses,
        SUM(CASE WHEN status = 'selesai' THEN 1 ELSE 0 END) AS pesanan_selesai
      FROM orders
      WHERE DATE(created_at) = CURDATE()
    `);

    const [totalStats] = await pool.query<RowDataPacket[]>(`
      SELECT
        COUNT(*) AS total_semua_pesanan,
        SUM(CASE WHEN status = 'selesai' THEN total_price ELSE 0 END) AS total_pendapatan
      FROM orders
    `);

    const [staffCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM users WHERE is_active = 1"
    );

    const [menuCount] = await pool.query<RowDataPacket[]>(
      "SELECT COUNT(*) AS total FROM menu_items WHERE is_active = 1"
    );

    const [recentOrders] = await pool.query<RowDataPacket[]>(`
      SELECT id, order_code, customer_name, order_type, total_price, status, created_at
      FROM orders ORDER BY created_at DESC LIMIT 5
    `);

    return NextResponse.json({
      today: todayStats[0],
      overall: totalStats[0],
      staff: staffCount[0].total,
      menu: menuCount[0].total,
      recent_orders: recentOrders,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Gagal memuat statistik" },
      { status: 500 }
    );
  }
}
```

---

### FIX-08: Perbaiki upload handler untuk kompatibilitas serverless

**File**: `app/api/upload/route.ts`

**Perubahan Spesifik**:

Untuk kompatibilitas maksimal dengan berbagai deployment environment tanpa menambahkan dependency eksternal (S3, Cloudinary), gunakan `/tmp` directory sebagai fallback saat `public/uploads` tidak dapat ditulis:

```typescript
// SESUDAH (dengan graceful fallback):
import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, access } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Tidak ada file yang diunggah" }, { status: 400 });
    }

    // Validasi tipe file
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Tipe file tidak didukung" }, { status: 400 });
    }

    // Validasi ukuran file (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "Ukuran file maksimal 5MB" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = path.extname(file.name) || ".jpg";
    const filename = `menu_${Date.now()}_${Math.random().toString(36).substring(2, 8)}${ext}`;

    // Coba tulis ke public/uploads (bekerja di local dev)
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    try {
      await mkdir(uploadDir, { recursive: true });
      const filePath = path.join(uploadDir, filename);
      await writeFile(filePath, buffer);
      return NextResponse.json({ url: `/uploads/${filename}` });
    } catch (fsError) {
      // Fallback ke /tmp untuk environment serverless
      console.warn("Cannot write to public/uploads, falling back to /tmp:", fsError);
      const tmpPath = path.join("/tmp", filename);
      await writeFile(tmpPath, buffer);
      // Di serverless, /tmp tidak dapat di-serve langsung — kembalikan URL placeholder
      // Untuk production, ganti dengan upload ke cloud storage (S3, Cloudinary, dll.)
      return NextResponse.json({ 
        url: `/uploads/${filename}`,
        warning: "File disimpan sementara — konfigurasikan cloud storage untuk production"
      });
    }
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ error: "Gagal mengunggah file" }, { status: 500 });
  }
}
```

**Catatan untuk Production**: Untuk deployment production di Vercel atau serverless platform, implementasi yang benar adalah menggunakan cloud storage (Vercel Blob, AWS S3, atau Cloudinary). Fix ini memberikan kompatibilitas development yang lebih baik dan menambahkan validasi file yang hilang, sambil memberikan warning yang jelas tentang limitasi serverless.

---

### FIX-09: Tambah error handling ke handler kasir

**File**: `app/kasir/page.tsx`

**Functions**: `handleVerifyPayment`, `handleUpdateStatus`, `handleCancel`

**Perubahan Spesifik**:

```typescript
// SEBELUM — handleVerifyPayment:
const handleVerifyPayment = async (orderId: number) => {
  setUpdatingId(orderId);
  try {
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: "verified", status: "diproses" }),
    });
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, payment_status: "verified", status: "diproses" }
          : o
      )
    );
  } finally {
    setUpdatingId(null);
  }
};

// SESUDAH — handleVerifyPayment:
const handleVerifyPayment = async (orderId: number) => {
  setUpdatingId(orderId);
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_status: "verified", status: "diproses" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Gagal konfirmasi pembayaran (${res.status})`);
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, payment_status: "verified", status: "diproses" }
          : o
      )
    );
  } catch (error) {
    alert(error instanceof Error ? error.message : "Gagal konfirmasi pembayaran");
  } finally {
    setUpdatingId(null);
  }
};

// SESUDAH — handleUpdateStatus:
const handleUpdateStatus = async (orderId: number, newStatus: string) => {
  setUpdatingId(orderId);
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Gagal update status (${res.status})`);
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: newStatus as Order["status"] } : o
      )
    );
  } catch (error) {
    alert(error instanceof Error ? error.message : "Gagal update status pesanan");
  } finally {
    setUpdatingId(null);
  }
};

// SESUDAH — handleCancel:
const handleCancel = async (orderId: number) => {
  if (!confirm("Batalkan pesanan ini?")) return;
  setUpdatingId(orderId);
  try {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "dibatalkan", payment_status: "rejected" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Gagal membatalkan pesanan (${res.status})`);
    }
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "dibatalkan", payment_status: "rejected" } : o
      )
    );
  } catch (error) {
    alert(error instanceof Error ? error.message : "Gagal membatalkan pesanan");
  } finally {
    setUpdatingId(null);
  }
};
```

---

### FIX-10: Gunakan explicit mapping untuk `orderType`

**File**: `app/api/orders/route.ts`

**Function**: `POST`

**Perubahan Spesifik**:

```typescript
// SEBELUM:
const finalOrderType = (order_type || orderType || "dine_in")
  .toLowerCase()
  .includes("away")
  ? "takeaway"
  : "dine_in";

// SESUDAH:
const rawOrderType = (order_type || orderType || "dine_in").toLowerCase().trim();
const ORDER_TYPE_MAP: Record<string, "takeaway" | "dine_in"> = {
  "take away": "takeaway",
  "takeaway": "takeaway",
  "take_away": "takeaway",
  "online": "takeaway",
  "dine in": "dine_in",
  "dine_in": "dine_in",
  "dinein": "dine_in",
  "dine-in": "dine_in",
};
const finalOrderType: "takeaway" | "dine_in" = ORDER_TYPE_MAP[rawOrderType] ?? "dine_in";
```

---

### FIX-11: Tambah try-catch ke `GET /api/orders`

**File**: `app/api/orders/route.ts`

**Function**: `GET`

**Perubahan Spesifik**:

```typescript
// SEBELUM:
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["kasir", "admin"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const limit = parseInt(searchParams.get("limit") || "50");

  let query = `SELECT o.*, GROUP_CONCAT(...) ...`;
  const params: (string | number)[] = [];
  // ...
  const [rows] = await pool.query<RowDataPacket[]>(query, params);
  return NextResponse.json({ orders: rows });
}

// SESUDAH:
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !["kasir", "admin"].includes(session.user?.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");

    let query = `
      SELECT o.*,
        GROUP_CONCAT(
          CONCAT(oi.quantity, 'x ', oi.menu_item_name)
          ORDER BY oi.id SEPARATOR ', '
        ) AS items_summary
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
    `;
    const params: (string | number)[] = [];

    if (status) {
      query += " WHERE o.status = ?";
      params.push(status);
    }

    query += " GROUP BY o.id ORDER BY o.created_at DESC LIMIT ?";
    params.push(limit);

    const [rows] = await pool.query<RowDataPacket[]>(query, params);
    return NextResponse.json({ orders: rows });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Gagal memuat data pesanan", orders: [] },
      { status: 500 }
    );
  }
}
```

---

### FIX-12: Hapus hardcoded fallback credentials

**File**: `lib/auth.ts`

**Perubahan Spesifik**:

```typescript
// SEBELUM (dalam authorize callback):
try {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1",
    [emailStr]
  );
  if (rows.length > 0) {
    const user = rows[0];
    const isValid = await bcrypt.compare(passStr, user.password);
    if (isValid) {
      return { id: String(user.id), name: user.name, email: user.email, role: user.role };
    }
  }
} catch (error) {
  console.warn("MySQL Auth query warning (falling back to default check):", error);
}

// 2. Default Accounts Fallback (admin123)  ← HAPUS SELURUH BLOK INI
if (emailStr === "admin@gacoan.com" && (passStr === "admin123" || passStr === "password123")) {
  return { id: "1", name: "Admin Gacoan", email: "admin@gacoan.com", role: "admin" };
}
if (emailStr === "kasir@gacoan.com" && (passStr === "admin123" || passStr === "kasir123" || passStr === "password123")) {
  return { id: "2", name: "Kasir Gacoan", email: "kasir@gacoan.com", role: "kasir" };
}

return null;

// SESUDAH:
try {
  const [rows] = await pool.query<UserRow[]>(
    "SELECT * FROM users WHERE email = ? AND is_active = 1 LIMIT 1",
    [emailStr]
  );
  if (rows.length > 0) {
    const user = rows[0];
    const isValid = await bcrypt.compare(passStr, user.password);
    if (isValid) {
      return { id: String(user.id), name: user.name, email: user.email, role: user.role };
    }
  }
} catch (error) {
  console.error("Database authentication error:", error);
  // Jangan fallback ke plaintext credentials — return null untuk keamanan
}

return null;  // Autentikasi gagal jika DB tidak tersedia atau kredensial salah
```

**Catatan Migrasi**: Sebelum menerapkan fix ini, pastikan database sudah memiliki setidaknya satu akun admin yang valid dengan password ter-hash. Gunakan skrip seeding atau buat akun melalui database langsung:
```sql
INSERT INTO users (name, email, password, role, is_active)
VALUES ('Admin Gacoan', 'admin@gacoan.com', '$2b$12$[bcrypt_hash_of_secure_password]', 'admin', 1);
```

---

### FIX-13: Perbaiki versi `lucide-react` di package.json

**File**: `package.json`

**Perubahan Spesifik**:

```json
// SEBELUM:
{
  "dependencies": {
    "lucide-react": "^1.47.0"
  }
}

// SESUDAH:
{
  "dependencies": {
    "lucide-react": "^0.511.0"
  }
}
```

Versi `0.511.0` adalah versi stabil terbaru yang tersedia di npm registry untuk `lucide-react`. Semua icon yang digunakan dalam project (`Search`, `Plus`, `Minus`, `ShoppingBag`, `Flame`, `Check`, `Sparkles`, `ClipboardList`, `Clock`, `CheckCircle2`, dll.) tersedia di versi `0.x`.

Setelah mengubah `package.json`, jalankan:
```bash
npm install
```

---

## Testing Strategy

### Validation Approach

Strategi testing mengikuti dua fase:
1. **Exploratory**: Verifikasi bahwa bug dapat direproduksi pada kode yang belum diperbaiki
2. **Fix Checking + Preservation Checking**: Verifikasi fix benar dan tidak membreak perilaku yang ada

### Exploratory Bug Condition Checking

**Goal**: Konfirmasi bug ada sebelum fix, kemudian verifikasi fix menghilangkan bug.

**Test Cases per Bug**:

1. **BUG-01 Exploration**: Fetch `GET /api/menu/1` → assert response memiliki key `item` (akan fail di unfixed code yang mengembalikan `menu`)
2. **BUG-02 Exploration**: Trace logika `initialPaymentStatus` dengan `payment_method="Cash"` dan `payment_proof=null` → assert tidak ada string CSS dalam nilai
3. **BUG-03 Exploration**: Render `<Image src="/uploads/test.jpg" />` tanpa `next.config.ts` image config → observe error
4. **BUG-05 Exploration**: Unset `AUTH_SECRET`, login, kemudian akses `/admin` → observe redirect loop
5. **BUG-09 Exploration**: Mock fetch response dengan status 500, klik "Konfirmasi Bayar" → observe UI update tanpa error message
6. **BUG-12 Exploration**: Login dengan `admin@gacoan.com` / `admin123` ketika DB unavailable → observe login berhasil (seharusnya gagal)
7. **BUG-13 Exploration**: `npm install` pada fresh environment → observe error ETARGET

### Fix Checking

**Goal**: Verifikasi bahwa setiap fix menghilangkan bug condition.

**Pseudocode**:
```
FOR ALL bug IN [BUG-01..BUG-13] DO
  input := construct_buggy_input(bug.bugCondition)
  result := call_fixed_function(input)
  ASSERT expectedBehavior(bug.property, result)
END FOR
```

**Test Cases Kunci**:

1. **FIX-01**: `GET /api/menu/1` → response shape `{ item: {...} }`, bukan `{ menu: {...} }`. DB error → response `{ error: "..." }` dengan status 500.
2. **FIX-02**: `POST /api/orders` dengan Cash + no proof → database kolom `payment_status` berisi `'pending'` bukan `'pending font-medium'`.
3. **FIX-05**: Middleware dengan `AUTH_SECRET=undefined` → `getToken` menggunakan fallback secret → token berhasil didekode → tidak ada redirect loop.
4. **FIX-06**: Mock DB failure di `GET /api/menu` → response JSON `{ error: "...", menu: [] }` status 500, bukan unhandled exception.
5. **FIX-09**: Mock `fetch` return `res.ok = false` di kasir → UI state TIDAK berubah → alert error ditampilkan.
6. **FIX-10**: POST `/api/orders` dengan `orderType: "Take Away"` → `finalOrderType === "takeaway"`. Dengan `"Dine In"` → `finalOrderType === "dine_in"`. Dengan `"dinein"` → `finalOrderType === "dine_in"`.
7. **FIX-12**: DB unavailable + login attempt dengan `admin@gacoan.com/admin123` → returns `null` → login gagal.
8. **FIX-13**: `npm install` → resolves successfully → no ETARGET error.

### Preservation Checking

**Goal**: Verifikasi bahwa input yang tidak termasuk bug condition menghasilkan perilaku yang sama.

**Pseudocode**:
```
FOR ALL scenario IN regression_scenarios DO
  ASSERT fixedBehavior(scenario) === expectedOriginalBehavior(scenario)
END FOR
```

**Test Cases Kunci**:

1. **Auth Flow (BUG-04, BUG-05)**: Login valid dari DB → session dibuat → redirect ke `/admin` atau `/kasir` sesuai role. Halaman publik tetap accessible tanpa login.
2. **Menu CRUD (BUG-01)**: Admin tambah/edit/hapus menu → operasi tetap berhasil. `loadMenu()` tetap menampilkan daftar menu dengan benar.
3. **Order Checkout (BUG-02, BUG-10)**: Pelanggan checkout dengan QRIS → `payment_status: "pending"`, `payment_method: "QRIS"`, `order_type: "dine_in"` atau `"takeaway"` sesuai pilihan.
4. **Kasir Happy Path (BUG-09)**: `PATCH` berhasil (res.ok = true) → UI update berjalan seperti sebelumnya tanpa perubahan behavior.
5. **Stats Dashboard (BUG-07)**: DB available → stats dikembalikan dengan struktur `{ today, overall, staff, menu, recent_orders }` yang sama persis.
6. **Image Display (BUG-03)**: Gambar di `/assets/` (yang sudah ada sebelumnya) tetap tampil tanpa error setelah konfigurasi `localPatterns` ditambahkan.

### Unit Tests

- Test response shape `GET /api/menu/[id]` — assert `response.item` exists dan `response.menu` tidak ada
- Test `payment_status` values — assert selalu merupakan salah satu dari `['pending', 'verified', 'rejected']`
- Test `orderType` mapping function dengan semua variasi input yang mungkin
- Test `getToken` secret consistency — middleware secret === auth secret
- Test error responses `GET /api/menu`, `GET /api/orders`, `GET /api/stats` ketika DB unavailable

### Property-Based Tests

- Generate random `orderType` string inputs → verify output selalu `'takeaway'` atau `'dine_in'`
- Generate random fetch response statuses (400-599) → verify UI state tidak berubah di handler kasir
- Generate random cart items dengan berbagai kombinasi price/quantity → verify `total_price` calculation tetap konsisten

### Integration Tests

- Full checkout flow: add items → checkout modal → submit → verify order code format `GCN-YYYYMMDD-XXXX`
- Full kasir flow: fetch orders → konfirmasi bayar (sukses) → verify status berubah di UI
- Full admin flow: login → navigate ke `/admin/menu` → tambah item → verify item muncul di halaman `/menu`
- Middleware routing: unauthenticated → `/admin` → redirect ke `/login` → login → redirect ke `/admin`
