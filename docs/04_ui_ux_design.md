# UI/UX Design: Neo-Brutalism

Desain antarmuka (UI) untuk SubtitleApp akan mengadopsi gaya **Neo-Brutalism**. Gaya ini mengedepankan fungsionalitas, kejujuran material digital, dan estetika yang mencolok.

## Elemen Inti Neo-Brutalism

### 1. Warna (Color Palette)
- **Background**: Menggunakan warna cerah yang saling bertabrakan namun estetik.
  - Primary Yellow: `#FFE600` atau `#FFD700`
  - Hot Pink: `#FF007F` atau `#FF499E`
  - Electric Blue: `#00E5FF` atau `#4D9DE0`
- **Surface / Card Background**: Putih murni `#FFFFFF` atau krem terang `#F8F9FA`.
- **Text & Borders**: Hitam pekat `#000000` atau sangat gelap `#1A1A1A`.

### 2. Tipografi
- Menggunakan font sans-serif yang tebal, geometris, dan mudah dibaca.
- **Rekomendasi Font**: `Space Grotesk`, `Public Sans`, `Inter`, atau `Lexend`.
- Judul (Headings) harus sangat tebal (Black/ExtraBold) dan besar.
- Teks paragraf jelas dan kontras tinggi.

### 3. Border & Bayangan (Borders & Shadows)
Ini adalah ciri khas utama Neo-Brutalism.
- **Border**: Semua elemen (tombol, card, input) memiliki border hitam tebal, misalnya `border: 3px solid #000;`.
- **Hard Drop Shadows**: Bayangan tidak disamarkan (blur), melainkan solid (offset shadow).
  - Contoh CSS: `box-shadow: 6px 6px 0px 0px #000000;`
  - Saat elemen (seperti tombol) ditekan (Active state), bayangan hilang dan elemen bergeser (`transform: translate(6px, 6px);`), memberikan sensasi tombol fisik.

### 4. Layout
- Desain berpusat pada grid (kotak-kotak tegas) atau asimetris namun terstruktur.
- Jarak antar elemen (Whitespace) besar agar terasa luas.
- Tidak ada gradien (gradients) atau sudut yang sangat melengkung (rounded corners cukup minimal, misal `border-radius: 4px` atau `8px`).

## Komponen Utama

- **Upload Box**: Kotak besar putus-putus atau solid dengan instruksi "Drag & Drop File Here" berukuran besar.
- **Action Buttons**: Tombol "Convert", "Translate", dan "Generate" berukuran besar dengan warna solid (kuning/pink/biru) dan border/shadow hitam tebal.
- **Log/Terminal View**: Untuk menampilkan status proses (terutama saat ekstraksi FFmpeg atau Transkripsi), menggunakan kotak bergaya terminal (teks hijau/putih dengan latar belakang hitam).
