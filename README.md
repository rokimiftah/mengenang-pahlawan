# Mengenang Pahlawan

<div align="center">
  <img src="https://cdn.mengenangpahlawan.web.id/mengenang-pahlawan.png" alt="Mengenang Pahlawan Logo" />
  <br><br>
</div>

**Mengenang Pahlawan** adalah platform digital untuk mengenang dan mempelajari kisah pahlawan nasional Indonesia. Aplikasi ini menyajikan biografi, foto, serta informasi resmi terkait penetapan gelar pahlawan.

Selain sebagai ensiklopedia digital, platform ini juga dilengkapi fitur interaktif seperti kuis edukatif, pencarian, dan poin penghargaan.

## ✨ Fitur Utama

- **Daftar Pahlawan**: Tampilan daftar pahlawan dengan navigasi slider atau grid avatar.
- **Detail Pahlawan**: Informasi lengkap meliputi biografi, gelar, pendidikan, warisan, pengakuan resmi, serta foto.
- **Kuis Interaktif**: Pertanyaan multiple-choice (A, B, C) seputar pahlawan dengan sistem poin.
- **Riwayat Poin & Badge**: Sistem poin dengan tooltip + modal riwayat untuk melihat pencapaian pengguna.
- **AI Chat Edukatif**: Chat dengan guardrails, hanya seputar tokoh pahlawan.
- **Search & Filter**: Fitur pencarian dan filter berdasarkan era.

## 🛠️ Teknologi

- **Frontend**: React 18 + TypeScript
- **Backend**: Convex (database, auth, query & mutation)
- **Database**: Convex Tables (users, heroes, points)
- **Styling**: Tailwind CSS
- **Deployment**: Cloudflare Workers + Convex (Self-Hosted)

### Struktur Proyek

```
/mengenang-pahlawan/
├───convex/
│   ├───mailry/
│   │   ├───mailryHttp.ts
│   │   ├───OTP.ts
│   │   └───OTPPasswordReset.ts
│   ├───agent.ts
│   ├───ai.ts
│   ├───auth.config.ts
│   ├───auth.ts
│   ├───heroes.ts
│   ├───http.ts
│   ├───points.ts
│   ├───quizzes.ts
│   ├───README.md
│   ├───schema.ts
│   ├───tsconfig.json
│   └───users.ts
├───src/
│   ├───components/
│   │   ├───auth/
│   │   │   ├───template/
│   │   │   │   ├───PasswordResetEmail.tsx
│   │   │   │   └───VerificationCodeEmail.tsx
│   │   │   ├───ui/
│   │   │   │   ├───ErrorModalAuth.tsx
│   │   │   │   ├───GitHubButton.tsx
│   │   │   │   ├───PasswordStrength.tsx
│   │   │   │   ├───SignOut.tsx
│   │   │   │   ├───UserInfo.tsx
│   │   │   │   └───UserMenu.tsx
│   │   │   └───AuthenticationForm.tsx
│   │   ├───dashboard/
│   │   │   ├───Dashboard.css
│   │   │   └───Dashboard.tsx
│   │   ├───filters/
│   │   │   ├───FilterContext.tsx
│   │   │   └───SearchFilterLauncher.tsx
│   │   ├───heroes/
│   │   │   ├───HeroDetail.tsx
│   │   │   ├───HeroGrid.tsx
│   │   │   └───HeroShelf.tsx
│   │   ├───home/
│   │   │   ├───Home.css
│   │   │   └───Home.tsx
│   │   └───points/
│   │       ├───PointsBadge.tsx
│   │       └───PointsHistoryModal.tsx
│   ├───env.d.ts
│   ├───index.css
│   └───index.tsx
```

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone repository

```bash
git clone <repository-url>
cd mengenang-pahlawan
```

2. Install dependencies

```bash
npm install
```

3. Setup environment variables

```bash
cp .env.local.example .env.local
```

Isi dengan:

```env
CONVEX_SELF_HOSTED_URL="..."
CONVEX_SELF_HOSTED_ADMIN_KEY="..."
PUBLIC_CONVEX_URL="..."
LUNOS_API_KEY="..."
LUNOS_API_URL="..."
LUNOS_LLM_MODEL="..."
MAILRY_API_KEY="..."
MAILRY_EMAIL_ID_ACCOUNTS="..."
MAILRY_EMAIL_ID_NOTIFICATIONS="..."
UNLI_API_KEY="..."
UNLI_API_URL="..."
```

4. Jalankan development server

```bash
npx convex dev && npm run dev
```

---

## 📱 Halaman & Routing

| Route                   | Halaman        | Deskripsi                        |
| ----------------------- | -------------- | -------------------------------- |
| `/`                     | Home           | Landing page dengan tombol mulai |
| `/dashboard`            | Dashboard      | Katalog pahlawan dengan tab era  |
| `/dashboard/hero/:slug` | Hero Detail    | Detail lengkap pahlawan          |
| `/quiz/:hero`           | Modal Kuis     | Pertanyaan seputar tokoh         |
| `/points`               | Riwayat Poin   | Modal riwayat poin               |
| `/auth`                 | Login/Register | Autentikasi GitHub / Email OTP   |

---

## 📊 Fitur Edukatif

- **Era Filtering**: Pahlawan difilter berdasarkan era perjuangan.
- **Kuis Dinamis**: Pertanyaan otomatis diambil dari slide biografi.
- **Poin & Badge**: Pengguna dapat poin tiap menjawab kuis.
- **Tooltip Riwayat**: Hover badge poin untuk lihat ringkasan pencapaian.
- **Modal Riwayat Poin**: Menampilkan detail perolehan poin.

---

# 🔌 Integrasi Layanan Eksternal

Proyek **Mengenang Pahlawan** menggunakan tiga layanan utama untuk meningkatkan fungsionalitas aplikasi:

1. **📧 Mailry.co** - Layanan email profesional
2. **🧠 Lunos.tech** - Layanan analisis AI
3. **🤖 Unli.dev** - Layanan AI pemrosesan teks

Setiap layanan digunakan untuk tujuan yang spesifik dan saling melengkapi.

---

## 📧 Mailry.co - Email Service

**Tujuan utama:** menangani seluruh proses pengiriman email (verifikasi OTP, konfirmasi login, dan notifikasi akun).

### ✅ Fitur yang digunakan:

| Fitur                         | Penjelasan                                                                       |
| ----------------------------- | -------------------------------------------------------------------------------- |
| 🔐 **OTP Verification Email** | Mengirim email verifikasi kode OTP saat login/register via email.                |
| 📩 **Password Reset Email**   | Mengirim kode atau link reset password ke pengguna.                              |
| 🧱 **HTML Email Template**    | Template email dengan desain yang konsisten (judul, teks utama, highlight kode). |
| 🔁 **Retry Mechanism**        | Jika pengiriman gagal, sistem otomatis mencoba ulang.                            |
| 📊 **Delivery Tracking**      | (Opsional) Mencatat status pengiriman email untuk keperluan log/debug.           |
| 📎 **Attachment Support**     | (Jika diperlukan) mengirim lampiran seperti gambar/berkas.                       |

### ⚙️ Implementasi teknis:

- Endpoint: `https://api.mailry.co/v1/`
- Autentikasi: API Key
- Library: `fetch` atau `axios` dengan header `Authorization: Bearer`
- Template menggunakan komponen `@react-email/components`

```ts
await mailryService.sendVerificationCode(email, code);
await mailryService.sendPasswordReset(email, code);
```

---

## 🧠 Lunos.tech - AI Analysis

**Tujuan utama:** menganalisis konten biografi pahlawan secara lebih mendalam dan menyarankan metadata tambahan.

### ✅ Fitur yang digunakan:

| Fitur                                 | Penjelasan                                                         |
| ------------------------------------- | ------------------------------------------------------------------ |
| 🗂️ **Automatic Categorization**       | Mengkategorikan era/jenis pahlawan berdasarkan konten biografi.    |
| 📑 **Summary Generation**             | Membuat ringkasan biografi yang lebih ringkas dan padat.           |
| 🧠 **Legacy & Highlight Extraction**  | Mengekstrak poin-poin penting dari biografi menjadi highlight.     |
| 📌 **Title & Recognition Suggestion** | Memberi saran judul, pengakuan, atau pengelompokan.                |
| 🔍 **Quality Assurance**              | Mengevaluasi kelengkapan dan konsistensi data sebelum ditampilkan. |

### ⚙️ Implementasi teknis:

- Endpoint: `https://api.lunos.tech/v1/`
- Model: GPT-4o
- Autentikasi: Bearer Token
- Mendukung batch processing
- Fallback: analisis lokal jika API gagal

```ts
const summary = await lunosService.generateReportSummary(hero.raw);
const category = await lunosService.categorizeReport(hero.raw);
const highlights = await lunosService.extractHighlights(hero.raw);
```

---

## 🤖 Unli.dev - AI Text Processing

**Tujuan utama:** meningkatkan kualitas teks atau menghasilkan pertanyaan kuis dari konten pahlawan.

### ✅ Fitur yang digunakan:

| Fitur                           | Penjelasan                                                                 |
| ------------------------------- | -------------------------------------------------------------------------- |
| ✍️ **Text Quality Improvement** | Membersihkan dan memperbaiki teks biografi (grammar, kejelasan, struktur). |
| 🔤 **Translation (opsional)**   | Menerjemahkan teks ke bahasa Indonesia dari sumber lain (jika impor).      |
| 💡 **Quiz Question Generation** | Menghasilkan pertanyaan kuis A/B/C berdasarkan ringkasan atau highlight.   |
| 📋 **Suggestion Generation**    | Menyediakan saran ringkasan, highlight, atau alternatif wording.           |

### ⚙️ Implementasi teknis:

- Endpoint: `https://api.unli.dev/v1/`
- Model: GPT-3.5-turbo (lebih ringan dan cepat)
- Autentikasi: API Key
- Retry & fallback: disediakan jika koneksi error

```ts
const improved = await unliService.improveTextQuality(biography);
const quiz = await unliService.generateQuizFromHighlights(highlights);
```

---

## 🧭 Arsitektur Integrasi

### 🔄 Orkestrasi Layanan

- Semua layanan berjalan **asinkron**.
- Jika salah satu gagal, sistem menggunakan fallback atau degradasi anggun.
- Retry logic dengan exponential backoff.
- Logging & monitoring status request.

### 🔐 Environment Variables

```env
# Mailry
MAILRY_API_KEY=your_mailry_key
MAILRY_API_URL=https://api.mailry.co/v1/

# Lunos
LUNOS_API_KEY=your_lunos_key
LUNOS_API_URL=https://api.lunos.tech/v1/

# Unli
UNLI_API_KEY=your_unli_key
UNLI_API_URL=https://api.unli.dev/v1/
```

---

## 🗂️ Ringkasan Tabel

| Layanan    | Digunakan Untuk                                             | Model/Tech   |
| ---------- | ----------------------------------------------------------- | ------------ |
| **Mailry** | OTP login, reset password, konfirmasi akun, hasil kuis      | Email Engine |
| **Lunos**  | Ringkasan biografi, klasifikasi pahlawan, highlight warisan | GPT-5        |
| **Unli**   | Perbaikan teks, kuis otomatis, saran bahasa                 | GPT-4        |
