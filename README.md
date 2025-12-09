# 📘 Literasi Digital & Kemanusiaan

**Tugas Berbasis GitHub Codespaces & Automasi Penilaian**

Selamat datang! Pada mata kuliah ini, Anda akan belajar:

* Literasi digital secara bertanggung jawab
* Etika penggunaan teknologi
* Pemrograman dasar (JavaScript)
* Kolaborasi menggunakan Git & GitHub
* Automasi penilaian dengan GitHub Actions + AI

---

## 🎯 Tujuan Pembelajaran

1. Mahasiswa mampu bekerja pada lingkungan **cloud development (Codespace)**
2. Mahasiswa memahami **etika digital** & **AI secara bertanggung jawab**
3. Mahasiswa menghasilkan **artefak digital** berbasis JavaScript
4. Penilaian berlangsung secara otomatis melalui **GitHub Actions**

---

## 🧩 Daftar Tugas

| Kode | Nama Tugas                    | Deskripsi Singkat                               | Output          |
| ---- | ----------------------------- | ----------------------------------------------- | --------------- |
| T01  | Jejak Digital Ku              | Pemetaan aktivitas digital yang aman & beretika | Markdown        |
| T02  | Aksesibilitas Web             | Evaluasi aksesibilitas situs                    | Markdown + JSON |
| T03  | Hoax Detector Sederhana       | Script JS analisis kredibilitas berita          | JS              |
| T04  | Privasi Data                  | Refleksi risiko jejak data pribadi              | Markdown        |
| T05  | Sejarah Teknologi Kemanusiaan | Timeline digital (HTML/JS)                      | HTML            |
| T06  | AI untuk Kebaikan             | Demo pemanfaatan AI bertanggung jawab           | JS + Laporan    |

> Semua tugas dikumpulkan di dalam folder **/tasks/** dengan nama masing-masing.

---

## 🛠️ Persiapan Kerja di GitHub Codespaces

### Langkah 1 — Buka Repo Ini di Codespaces

Klik tombol **<> Code** → Pilih **Codespaces** → **Create new Codespace on main**
→ Tunggu sampai editor Visual Studio Code berbasis web terbuka.

### Langkah 2 — Cek Node.js dan npm

```sh
node -v
npm -v
```

Jika muncul versi seperti:

```
Node v22.x.x
npm 9.x.x
```

➡ Siap digunakan.

---

## 📍 Cara Mengerjakan Tugas

1️⃣ Pilih tugas yang sedang dikerjakan
2️⃣ Buat folder dalam `/tasks/` misalnya:

```sh
mkdir tasks/T01
```

3️⃣ Buat file sesuai panduan masing-masing tugas, contoh:

```sh
echo "# Jejak Digital Saya" > tasks/T01/README.md
```

4️⃣ Commit perubahan

```sh
git add .
git commit -m "T01 selesai"
```

5️⃣ Push ke GitHub

```sh
git push
```

6️⃣ Tunggu hasil **penilaian otomatis**

---

## 🧳 Penilaian Otomatis

Setiap kali Anda **push** ke GitHub:
➡ Workflow **GitHub Actions** akan berjalan

Cara melihat hasil:

1. Buka tab **Actions**
2. Pilih workflow **Auto Grading**
3. Lihat hasil output pada file:

   ```
   grading/grading.json
   ```
4. Nilai akan diperbarui otomatis saat tugas diperbaiki

---

## 📝 Rubrik Penilaian

| Aspek                       | Bobot |
| --------------------------- | ----- |
| Pemenuhan instruksi         | 30%   |
| Kejelasan & kebaruan ide    | 30%   |
| Etika & nilai kemanusiaan   | 20%   |
| Kualitas teknis (kode/file) | 20%   |

---

## 🆘 Bantuan & Troubleshooting

Jika Codespaces bermasalah:

```sh
npm install
npm run grade
```

Bila error masih muncul → hubungi dosen/kelompok teknis.

---

## 🤝 Sikap Akademik

❌ Dilarang menggunakan AI untuk menyalin karya orang lain
✔️ Dibenarkan menggunakan AI sebagai **alat bantu analisis**
✔️ Semua sumber referensi harus dicantumkan

---

## ✨ Selamat Belajar!

Gunakan teknologi untuk **kebaikan manusia**, bukan sebaliknya 🌍
