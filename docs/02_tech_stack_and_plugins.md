# Tech Stack & Plugins

Aplikasi ini dibangun tanpa database dan difokuskan pada performa sisi klien (client-side) untuk mengolah file lokal. Berikut adalah rekomendasi teknologi yang digunakan:

## 1. Core Framework
- **Vite + React (TypeScript)**: Framework utama untuk membangun antarmuka pengguna. Vite memberikan proses build yang sangat cepat. React sangat cocok untuk membangun komponen UI yang interaktif.

## 2. Styling (UI/UX)
- **Tailwind CSS**: Digunakan untuk menerapkan gaya Neo-brutalism dengan cepat melalui utility classes.
- **Konfigurasi Neo-Brutalism**: Akan ada kustomisasi pada `tailwind.config.js` untuk menambahkan class seperti `box-shadow` tebal (`shadow-neo`), warna latar belakang yang mencolok, dan ketebalan border (`border-4`, `border-black`).

## 3. Libraries & Plugins Utama

### A. Subtitle Converter
- **`subsrt-ts` / `subtitle.js`**: Library JavaScript untuk mem-parsing dan mengonversi format subtitle (.srt, .ass, .vtt, dll).

### B. Auto-Subtitle Generator (Audio Extraction & Speech-to-Text)
Untuk mengatasi masalah ukuran file video yang besar, proses dibagi menjadi dua tahap yang semuanya berjalan di browser:
1. **Audio Extraction**:
   - **`@ffmpeg/ffmpeg` (FFmpeg.wasm)**: Memungkinkan kita menjalankan FFmpeg langsung di dalam browser menggunakan WebAssembly.
   - *Fungsi*: Ketika pengguna mengunggah video 1GB, FFmpeg.wasm akan mengekstrak audionya saja secara offline menjadi file `.mp3` atau `.wav` berukuran beberapa Megabyte.
2. **Speech-to-Text (Transcription)**:
   - **Opsi 1 (Full Offline / Browser-based)**: Menggunakan **`@xenova/transformers`** (Transformers.js) dengan model **Whisper (Tiny/Base)**. Menjalankan AI transkripsi sepenuhnya di browser pengguna.
   - **Opsi 2 (API-based)**: Mengirimkan file audio (yang sudah diekstrak dan ukurannya kecil) ke layanan backend gratis/berbayar (seperti Groq API / OpenAI Whisper API) untuk transkripsi yang sangat cepat.

### C. Subtitle Translator
- Menggunakan public translation API atau mengintegrasikan model machine learning ringan melalui `transformers.js` untuk menerjemahkan array teks subtitle sebelum dibungkus kembali menjadi file `.srt` atau `.ass`.

### D. File Handling
- **Native HTML5 File API**: Menggunakan `<input type="file">`, `FileReader`, dan `URL.createObjectURL` untuk membaca file dari komputer pengguna dan mengunduh hasil (tanpa perlu menyimpannya di server).
