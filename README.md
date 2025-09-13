# Mengenang Pahlawan

<div align="center">
  <img src="https://cdn.mengenangpahlawan.web.id/mengenang-pahlawan.png" alt="Mengenang Pahlawan Logo" />
  <br><br>
</div>

**Mengenang Pahlawan** adalah platform digital untuk mengenang dan mempelajari kisah pahlawan nasional Indonesia. Aplikasi ini menyajikan biografi, foto, serta informasi resmi terkait penetapan gelar pahlawan.

Selain berfungsi sebagai ensiklopedia digital, platform ini dilengkapi fitur interaktif seperti kuis edukatif, pencarian, dan sistem poin penghargaan.

## ✨ Fitur Utama

- **Daftar Pahlawan**: Tampilan daftar pahlawan dengan navigasi slider atau grid avatar.
- **Detail Pahlawan**: Informasi lengkap meliputi biografi, gelar, pendidikan, warisan, pengakuan resmi, serta foto.
- **Kuis Interaktif**: Pertanyaan pilihan ganda (A/B/C) seputar pahlawan dengan sistem poin.
- **Riwayat Poin & Lencana**: Lihat riwayat dan akumulasi poin melalui tooltip dan modal ringkasan.
- **Percakapan AI Edukatif**: Percakapan terbatas pada topik pahlawan untuk menjaga relevansi.
- **Pencarian & Filter**: Pencarian dan penyaringan berdasarkan era.

## 🛠️ Teknologi

- **Frontend**: React 18 + TypeScript
- **Backend**: Convex (database, auth, query & mutation)
- **Database**: Convex Tables (users, heroes, points)
- **Styling**: Tailwind CSS
- **Email**: Resend (+ templat React Email)
- **LLM**: OpenAI (Responses/Chat Completions)
- **Deployment**: Cloudflare Workers + Convex (hosting mandiri)

### Struktur Proyek

```
/mengenang-pahlawan/
├───convex/
│   ├───agent.ts                 # Rekomendasi & chat edukatif (LLM)
│   ├───ai.ts                    # Pembuatan kuis berbasis LLM
│   ├───auth.config.ts           # Konfigurasi Convex Auth
│   ├───auth.ts                  # Provider GitHub + Password (OTP)
│   ├───heroes.ts                # Query/mutation data pahlawan
│   ├───http.ts                  # Router HTTP Convex
│   ├───llm.ts                   # Klien OpenAI (LLM)
│   ├───otp.ts                   # OTP via Resend (email)
│   ├───points.ts                # Ringkasan & riwayat poin
│   ├───quizzes.ts               # Logika kuis + email hasil
│   ├───schema.ts                # Definisi skema tabel Convex
│   └───users.ts                 # Profil & unggah avatar
├───src/
│   ├───app/
│   │   ├───providers/            # AppProviders: Mantine + ConvexAuth
│   │   ├───router/               # Definisi routes (wouter)
│   │   └───App.tsx
│   ├───pages/
│   │   ├───HomePage/             # Landing page
│   │   ├───DashboardPage/        # Layout dashboard + list pahlawan
│   │   └───HeroDetailPage/       # Layout dashboard + detail pahlawan
│   ├───features/
│   │   ├───auth/
│   │   │   ├───ui/               # AuthenticationForm, UserMenu, dll
│   │   │   └───templates/        # VerificationEmail, PasswordResetEmail
│   │   ├───heroes/
│   │   │   ├───ui/               # HeroGrid, HeroShelf, HeroDetail, HeroFilters
│   │   │   ├───api/              # Adapter Convex (useHeroesList, dsb)
│   │   │   └───model/            # FilterContext
│   │   └───points/
│   │       ├───ui/               # PointsBadge, PointsHistoryModal
│   │       └───templates/        # QuizResultEmail (email)
│   ├───shared/
│   │   └───styles/tailwind.css   # Tailwind global + animasi
│   ├───env.d.ts
│   └───index.tsx
```

---

## 🚀 Mulai Cepat

### Prasyarat

- Bun 1.1+ (disarankan)
- Alternatif: Node.js 18+ dan npm

### Instalasi

1. Clone repository

```bash
git clone <repository-url>
cd mengenang-pahlawan
```

2. Instal dependensi

```bash
bun install
```

3. Siapkan variabel lingkungan

```bash
cp .env.local.example .env.local
```

Isi dengan (sesuaikan):

```env
CONVEX_SELF_HOSTED_URL="..."
CONVEX_SELF_HOSTED_ADMIN_KEY="..."
PUBLIC_CONVEX_URL="..."
# Email (Resend)
MAIL_API_KEY="..."            # Resend API Key

# LLM (OpenAI)
LLM_API_KEY="..."             # OpenAI API Key
LLM_MODEL="gpt-4o-mini"       # Contoh model
LLM_API_URL="https://api.openai.com/v1"  # Opsional (biarkan default jika tidak perlu)
```

4. Jalankan server pengembangan

```bash
# Jalankan di dua terminal terpisah:
# Terminal A (Convex)
bunx convex dev

# Terminal B (Frontend)
bun run dev
```

Menggunakan npm (opsional):

```bash
npm install
# Terminal A
npx convex dev
# Terminal B
npm run dev
```

---

## 📱 Halaman & Routing

| Route                | Halaman              | Deskripsi                                                                 |
| -------------------- | -------------------- | ------------------------------------------------------------------------- |
| `/`                  | Beranda              | Halaman utama                                                             |
| `/login`             | Login                | Form masuk; jika sudah login → redirect ke `/pahlawan`                    |
| `/register`          | Daftar               | Form pendaftaran; jika sudah login → redirect ke `/pahlawan`              |
| `/forgot-password`   | Lupa Kata Sandi      | Kirim kode reset; jika sudah login → redirect ke `/pahlawan`              |
| `/verify-email`      | Verifikasi Email     | Verifikasi email via kode; baca `?email=`                                  |
| `/reset-password`    | Reset Kata Sandi     | Reset kata sandi via kode; baca `?email=`                                  |
| `/pahlawan`          | Dasbor               | Katalog pahlawan (protected; jika belum login → redirect ke `/login`)     |
| `/pahlawan/:slug`    | Detail Pahlawan      | Info lengkap pahlawan (protected; jika belum login → redirect ke `/login`) |
| (modal di halaman)   | Kuis / Poin          | Kuis dan riwayat poin ditampilkan melalui antarmuka                        |

Catatan routing & guard:

- Rute auth (login/register/forgot/verify/reset) bersifat guest-only. Jika pengguna sudah login, diarahkan ke `/pahlawan`.
- Rute dashboard (daftar & detail pahlawan) bersifat protected. Jika belum login, diarahkan ke `/login`.
- Alur auth otomatis memindahkan rute sesuai aksi:
  - Sign up atau sign in (email belum terverifikasi) → `/verify-email?email=...`
  - Forgot/Reset → `/reset-password?email=...`
  - Verifikasi/reset sukses → `/login`

---

## 📊 Fitur Edukatif

- **Era Filtering**: Pahlawan difilter berdasarkan era perjuangan.
- **Kuis Dinamis**: Pertanyaan otomatis diambil dari ringkasan/sorotan biografi.
- **Poin & Lencana**: Poin bertambah setiap menjawab kuis.
- **Ringkasan Riwayat**: Lihat ringkasan pencapaian pada lencana poin.
- **Modal Riwayat Poin**: Menampilkan detail perolehan poin.

---

# 🔌 Integrasi Layanan

Proyek menggunakan dua layanan utama:

1. 📧 Resend — Pengiriman email (OTP, reset password, hasil kuis) dengan React Email.
2. 🧠 OpenAI — Pembuatan ringkasan, rekomendasi, dan soal kuis (LLM).

---

## 📧 Resend — Layanan Email

Digunakan untuk verifikasi email (OTP), pengaturan ulang kata sandi, dan pengiriman hasil kuis.

- Templat: `@react-email/components` di `src/features/*/templates/*`
- Kunci API: `MAIL_API_KEY` (Resend)
- Alamat pengirim: pastikan domain `mengenangpahlawan.web.id` terverifikasi di Resend

Contoh pemakaian (lihat `convex/otp.ts` dan `convex/quizzes.ts`):

```ts
import { Resend as ResendAPI } from "resend";

const resend = new ResendAPI(process.env.MAIL_API_KEY);
await resend.emails.send({
	from: "Mengenang Pahlawan <accounts@mengenangpahlawan.web.id>",
	to: [email],
	subject: "Verifikasi Email Anda",
	react: VerificationEmail({ code, minutesUntilExpiry }),
});
```

---

## 🧠 OpenAI — LLM

Digunakan untuk ringkasan biografi, rekomendasi pahlawan, chat edukatif, dan pembuatan kuis.

- File klien: `convex/llm.ts`
- API Key: `LLM_API_KEY`
- Model: `LLM_MODEL` (contoh: `gpt-4o-mini`)
- Base URL: `LLM_API_URL` (opsional; gunakan bawaan OpenAI bila tidak diubah)

Contoh sederhana (lihat `convex/ai.ts`, `convex/agent.ts`):

```ts
import { llm } from "./llm";

const res = await llm.responses.create({
	model: process.env.LLM_MODEL!,
	input: "Ringkas biografi pahlawan berikut...",
} as any);
```

---

## 🧭 Arsitektur Integrasi

### 🔄 Orkestrasi Layanan

- Semua layanan berjalan **asinkron**.
- Jika salah satu gagal, sistem menggunakan mekanisme cadangan (fallback).
- Logika percobaan ulang (retry) dengan backoff eksponensial.
- Pencatatan dan pemantauan status permintaan.

### 🔐 Variabel Lingkungan

```env
# Convex (self-hosted)
CONVEX_SELF_HOSTED_URL=
CONVEX_SELF_HOSTED_ADMIN_KEY=
PUBLIC_CONVEX_URL=

# Resend (email)
MAIL_API_KEY=

# OpenAI (LLM)
LLM_API_KEY=
LLM_MODEL=
LLM_API_URL=https://api.openai.com/v1
```

---

## 🗂️ Ringkasan Tabel

| Layanan | Digunakan Untuk                                       | Model/Tech        |
| ------- | ----------------------------------------------------- | ----------------- |
| Resend  | OTP, reset password, hasil kuis                       | React Email + API |
| OpenAI  | Ringkasan, rekomendasi, chat edukatif, pembuatan kuis | GPT-4o family     |
