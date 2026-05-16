import { pipeline } from '@xenova/transformers';

let transcriber: any = null;

export const getTranscriber = async (onProgress?: (progress: any) => void) => {
  if (transcriber) return transcriber;
  
  transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
    progress_callback: (p: any) => {
      if (onProgress) onProgress(p);
    }
  });
  return transcriber;
};

// Helper to convert seconds to SRT timestamp format
const formatTimestamp = (seconds: number): string => {
  const date = new Date(0);
  date.setSeconds(seconds);
  const hh = date.getUTCHours().toString().padStart(2, '0');
  const mm = date.getUTCMinutes().toString().padStart(2, '0');
  const ss = date.getUTCSeconds().toString().padStart(2, '0');
  const ms = Math.floor((seconds % 1) * 1000).toString().padStart(3, '0');
  return `${hh}:${mm}:${ss},${ms}`;
};

export const generateSRT = (chunks: any[]): string => {
  return chunks.map((chunk, i) => {
    const start = formatTimestamp(chunk.timestamp[0]);
    const end = formatTimestamp(chunk.timestamp[1] || chunk.timestamp[0] + 2);
    return `${i + 1}\n${start} --> ${end}\n${chunk.text.trim()}\n`;
  }).join('\n');
};

export const transcribeAudio = async (
  audioData: Uint8Array, 
  onProgress?: (p: any) => void
): Promise<string> => {
  const instance = await getTranscriber(onProgress);
  
  // Convert Uint8Array to Float32Array (required by transformers.js)
  // Note: This assumes the audio is already 16kHz mono WAV from FFmpeg
  const blob = new Blob([audioData], { type: 'audio/wav' });
  const url = URL.createObjectURL(blob);
  
  const output = await instance(url, {
    chunk_length_s: 30,
    stride_length_s: 5,
    return_timestamps: true,
  });
  
  URL.revokeObjectURL(url);
  return generateSRT(output.chunks);
};
