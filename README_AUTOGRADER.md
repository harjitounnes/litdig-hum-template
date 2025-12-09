# Auto-Grader Hybrid (OpenAI + Local Checks)

## Singkat
Template ini menjalankan pengecekan lokal (HTMLHint, markdownlint) dan analisis teks menggunakan OpenAI bila `OPENAI_API_KEY` disetel sebagai secret di repository.

## Langkah pemasangan
1. Fork atau tambah file ini ke repository tugas mahasiswa.
2. Di repo mahasiswa, buka Settings → Secrets → Actions → add `OPENAI_API_KEY` (jika ingin hasil penilaian AI lebih dalam).
3. Pastikan file `rubric.json` tetap ada di root.
4. Workflow akan berjalan otomatis saat mahasiswa membuat Pull Request.

## Output
- `grading.json` di root yang berisi skor & feedback ringkas.
- Komentar PR otomatis berisi ringkasan (di-post oleh action `marocchino/sticky-pull-request-comment`).

## Catatan
- OpenAI model yang dipanggil dapat diubah di `scripts/grade-with-ai.js`.
- Jika kampus ingin LLM lokal, ganti bagian `analyzeTextWithOpenAI` dengan pemanggilan ke endpoint internal.