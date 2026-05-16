# SubtitleApp - Project Overview

## Deskripsi Proyek
SubtitleApp adalah sebuah perangkat lunak berbasis web (Web App) yang berfungsi sebagai alat pengolah subtitle serbaguna. Aplikasi ini dirancang untuk berjalan secara efisien di sisi klien (browser) tanpa memerlukan database (serverless/local-first approach), sehingga privasi pengguna terjaga dan operasional lebih cepat.

## Fitur Utama

1. **Subtitle Converter (Konversi Format)**
   - Mengubah format subtitle dari satu format ke format lainnya.
   - Format yang didukung: `.srt`, `.ass`, `.vtt`, `.sbv`, dll.

2. **Subtitle Translator (Penerjemah)**
   - Menerjemahkan teks subtitle ke berbagai bahasa (misal: Inggris ke Indonesia, atau sebaliknya).
   - Mempertahankan timestamp dari file asli agar sinkronisasi waktu tidak rusak.

3. **Auto-Subtitle Generator (Pembuat Subtitle Otomatis)**
   - Menghasilkan subtitle secara otomatis dari file video.
   - **Optimasi Ukuran File**: Menggunakan pemrosesan lokal. Alih-alih mengunggah file video berukuran besar ke server, aplikasi akan mengekstrak audio dari video langsung di dalam browser pengguna. Audio (yang ukurannya jauh lebih kecil) kemudian diproses menjadi teks (Speech-to-Text).

4. **Local Storage & File Handling (Tanpa Database)**
   - Aplikasi tidak menggunakan database eksternal. Semua file diproses secara lokal di RAM browser.
   - Fitur unggah (Upload) menggunakan File API native HTML5.
   - Fitur simpan (Save/Download) menghasilkan file langsung ke perangkat pengguna.

## Gaya Desain (UI/UX)
- **Neo-Brutalism**: Menggunakan gaya desain yang mencolok dengan warna-warna solid yang kontras, garis batas (border) hitam yang tebal, bayangan keras (hard drop shadows), dan tipografi yang berani (bold).
