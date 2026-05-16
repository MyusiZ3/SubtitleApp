// Use the worker from the public folder
let worker: Worker | null = null;

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

async function decodeAudioData(audioData: Uint8Array): Promise<Float32Array> {
  const buffer = new ArrayBuffer(audioData.byteLength);
  new Uint8Array(buffer).set(audioData);

  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
  const audioBuffer = await audioContext.decodeAudioData(buffer);
  audioContext.close();
  return audioBuffer.getChannelData(0);
}

export const transcribeAudio = async (
  audioData: Uint8Array, 
  onProgress?: (p: any) => void,
  onLog?: (msg: string) => void,
  language: string | null = null // Optional manual override
): Promise<string> => {
  if (!worker) {
    worker = new Worker('/transcriptionWorker.js', { type: 'module' });
  }

  if (onLog) onLog('Decoding audio for AI processing...');
  const float32Data = await decodeAudioData(audioData);

  return new Promise((resolve, reject) => {
    worker!.onmessage = (event) => {
      const { type, data, error } = event.data;

      if (type === 'progress' && onProgress) {
        onProgress(data);
      } else if (type === 'ready') {
        worker?.postMessage({ type: 'transcribe', audioData: float32Data, language });
      } else if (type === 'result') {
        resolve(generateSRT(data));
      } else if (type === 'error') {
        reject(new Error(error));
      } else if (type === 'log') {
        if (onLog) onLog(data);
      }
    };

    worker!.postMessage({ 
      type: 'init', 
      modelId: 'Xenova/whisper-base' // Use base for better language detection
    });
  });
};
