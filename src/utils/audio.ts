import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile } from '@ffmpeg/util';

let ffmpeg: FFmpeg | null = null;

export const getFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;
  
  ffmpeg = new FFmpeg();
  await ffmpeg.load({
    coreURL: 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm/ffmpeg-core.js',
  });
  return ffmpeg;
};

export const extractAudio = async (videoFile: File, onLog?: (msg: string) => void): Promise<Uint8Array> => {
  const instance = await getFFmpeg();
  
  if (onLog) {
    instance.on('log', ({ message }) => onLog(message));
  }

  const inputName = 'input.mp4';
  const outputName = 'output.wav';
  
  await instance.writeFile(inputName, await fetchFile(videoFile));
  
  // Extract audio as WAV 16kHz mono (optimal for Whisper)
  await instance.exec([
    '-i', inputName,
    '-ar', '16000',
    '-ac', '1',
    '-c:a', 'pcm_s16le',
    outputName
  ]);
  
  const data = await instance.readFile(outputName);
  return data as Uint8Array;
};
