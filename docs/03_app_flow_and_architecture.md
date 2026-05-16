# App Flow & Architecture

Aplikasi ini berjalan seluruhnya di dalam browser pengguna (Client-Side Processing). Berikut adalah alur kerja untuk masing-masing fitur utama.

## 1. Flow: Convert Subtitle Format
**Tujuan**: Mengubah `.ass` menjadi `.srt` atau sebaliknya.
1. **Upload**: Pengguna menekan tombol "Upload Subtitle" dan memilih file (misal: `movie.ass`).
2. **Parsing**: Aplikasi menggunakan `FileReader` untuk membaca teks di dalam file.
3. **Processing**: Library (misal: `subsrt`) membaca struktur file `.ass` dan mengekstrak objek data (teks, timestamp mulai, timestamp akhir).
4. **Formatting**: Objek data tersebut di-format ulang sesuai struktur format tujuan (misal: `.srt`).
5. **Save/Download**: Teks hasil format diubah menjadi `Blob` dan sebuah link unduhan (Download) di-generate untuk menyimpan `movie_converted.srt` ke komputer pengguna.

## 2. Flow: Translate Subtitle
**Tujuan**: Menerjemahkan subtitle dari satu bahasa ke bahasa lain.
1. **Upload**: Pengguna mengunggah file subtitle sumber.
2. **Parsing**: File dibaca dan diekstrak menjadi array of subtitle objects (ID, Start, End, Text).
3. **Translating**:
   - Teks dari setiap objek dikumpulkan.
   - Aplikasi mengirimkan teks ke layanan penerjemah (atau memproses secara lokal via WebAssembly).
   - *Catatan Penting*: Timestamp tidak ikut diterjemahkan untuk menghindari rusaknya timing subtitle.
4. **Re-assembly**: Teks yang sudah diterjemahkan digabungkan kembali dengan timestamp aslinya.
5. **Save/Download**: Hasil akhir dapat diunduh sebagai file subtitle baru.

## 3. Flow: Auto-Generate Subtitle dari Video
**Tujuan**: Menghasilkan subtitle dari file video (meskipun ukurannya bergiga-giga).
1. **Video Selection**: Pengguna memilih file video lokal. File **tidak diunggah ke internet**, hanya dibaca secara lokal di browser.
2. **Audio Extraction (Offline)**: 
   - Aplikasi memuat `FFmpeg.wasm`.
   - FFmpeg membaca file video lokal secara streaming di browser dan mengekstrak jalur audionya (Audio Track).
   - Output: File audio `.mp3` atau `.wav` (ukuran < 50MB).
3. **Transcription (Speech-to-Text)**:
   - File audio tersebut diproses menggunakan model AI (Whisper via `transformers.js` di browser, atau dikirim via API).
   - AI menghasilkan teks beserta timestamp (kapan kata tersebut diucapkan).
4. **Subtitle Generation**: Teks dan timestamp disusun menjadi format standar (seperti `.srt`).
5. **Save/Download**: Pengguna mengunduh file `.srt` hasil generate.

## Arsitektur Data (State Management)
- **Zustand** atau **React Context** digunakan untuk mengelola status (Loading, Error, Success, dan Data Subtitle saat ini).
- Tidak ada penyimpanan persisten (Database). Jika halaman di-refresh, state akan hilang.
