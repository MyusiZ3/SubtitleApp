# Features Implementation Guide

Dokumen ini menjelaskan bagaimana secara spesifik fitur-fitur teknis diimplementasikan tanpa menggunakan database dan memproses file lokal secara optimal.

## 1. Subtitle Converter
Konversi dapat dilakukan menggunakan library `subsrt` atau modul sejenis.
```javascript
import subsrt from 'subsrt-ts';

// Mengubah konten .ass menjadi string .srt
export const convertSubtitle = (content, targetFormat = 'srt') => {
  // Parse dari format asli
  const captions = subsrt.parse(content);
  // Build ke format baru
  const newContent = subsrt.build(captions, { format: targetFormat });
  return newContent;
};
```
**File Handling:**
Setelah file terbentuk, kita memanggil URL blob.
```javascript
const blob = new Blob([newContent], { type: 'text/plain' });
const url = URL.createObjectURL(blob);
// Pasang ke anchor tag `<a href={url} download="subtitle.srt" />`
```

## 2. Subtitle Translator
Karena kita tidak memiliki backend, kita memiliki opsi:
1. Menggunakan **Free Translation API** (seperti MyMemory API) dengan batasan request per hari.
2. Meminta pengguna untuk memasukkan **API Key** mereka sendiri (seperti OpenAI API Key atau Google Translate API Key).
3. Menggunakan **Transformers.js** model terjemahan di browser (sangat berat untuk dimuat pertama kali, tapi 100% gratis).

*Pendekatan Terbaik untuk MVP*: 
Mengekstrak array objek `subsrt`, mengambil bagian teksnya (`caption.text`), menerjemahkannya satu per satu atau dalam batch, kemudian mengembalikan string yang diterjemahkan ke dalam objek `subsrt` aslinya.

## 3. Auto-Subtitle Generator dari Video Besar
Ini adalah fitur paling kompleks. Alur teknisnya:

**A. FFmpeg WebAssembly (Ekstraksi Audio)**
```javascript
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

const ffmpeg = new FFmpeg();

async function extractAudio(videoFile) {
  if (!ffmpeg.loaded) await ffmpeg.load();
  
  // Tulis file video lokal ke memori FFmpeg
  await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));
  
  // Jalankan command ekstraksi audio ke mp3 (kualitas rendah untuk mempercepat proses STT)
  await ffmpeg.exec(['-i', 'input.mp4', '-q:a', '0', '-map', 'a', 'audio.mp3']);
  
  // Ambil file mp3
  const data = await ffmpeg.readFile('audio.mp3');
  return new Blob([data.buffer], { type: 'audio/mp3' });
}
```

**B. Speech-to-Text (Transkripsi)**
Menggunakan `transformers.js` dengan model Whisper.
```javascript
import { pipeline } from '@xenova/transformers';

async function generateSubtitle(audioUrl) {
  // Memuat model Whisper (akan mendownload model sekitar ~70MB di awal)
  const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny');
  
  // Jalankan transkripsi dengan return_timestamps agar kita bisa membuat format SRT
  const output = await transcriber(audioUrl, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true,
  });
  
  // Hasilnya adalah array of chunks dengan timestamp
  // [ { timestamp: [0.00, 5.00], text: " Hello world" }, ... ]
  return convertChunksToSRT(output.chunks);
}
```
Fungsi di atas menjamin tidak ada video besar yang harus diunggah, cukup diproses oleh perangkat pengguna secara lokal (Private & Fast).
