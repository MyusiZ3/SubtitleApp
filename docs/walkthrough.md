# Subtitle Master - Project Walkthrough

Subtitle Master is a modern, client-side web application for subtitle management, featuring a bold Neo-Brutalist design. All processing happens locally in your browser, ensuring maximum privacy and zero data uploads.

## ✨ Features

### 1. Subtitle Converter
- **Supported Formats**: `.srt`, `.ass`, `.vtt`, `.sbv`, `.json`.
- **How it works**: Uses `subsrt-ts` to parse and convert between different subtitle standards instantly.

### 2. Multi-Language Translator
- **Supported Languages**: English, Indonesian, Japanese, Spanish, Korean, French, German.
- **Privacy-First**: Translates text while maintaining original timestamps.
- **Service**: Integrated with MyMemory API for high-quality translations.

### 3. Auto-Subtitle Generator
- **Local AI**: Uses **Whisper Tiny** (Transformers.js) running directly in your browser.
- **Local Extraction**: Uses **FFmpeg.wasm** to extract audio from video files without uploading them to any server.
- **Efficiency**: Optimized for 16kHz mono audio processing to ensure speed and accuracy.

---

## 🎨 Design System: Neo-Brutalism
The application utilizes a sharp, high-contrast UI style:
- **Bold Borders**: 4px solid black borders on all interactive elements.
- **Hard Shadows**: Fixed `4px 4px` offsets for a retro, tactile feel.
- **Vibrant Palette**:
  - **Primary (Yellow)**: For conversion.
  - **Secondary (Pink)**: For navigation.
  - **Accent (Cyan)**: For translation.
- **Typography**: Uses *Space Grotesk* for a modern, industrial look.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS v4 (with custom Neo-Brutalist utilities)
- **Core Libraries**:
  - `subsrt-ts`: Subtitle manipulation.
  - `@ffmpeg/ffmpeg`: Client-side audio extraction.
  - `@xenova/transformers`: Browser-based AI transcription.
  - `lucide-react`: Iconography.

---

## 🚀 Getting Started
1. Run the development server:
   ```bash
   npm run dev
   ```
2. Open `http://localhost:5173/` in your browser.
3. **Important Note**: The first time you use the Auto-Subtitle feature, your browser will download the Whisper AI model (~77MB). Subsequent uses will be much faster as the model is cached.
