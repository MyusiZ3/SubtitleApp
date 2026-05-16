import { pipeline, env } from '@xenova/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';
env.remotePathTemplate = '{model}/resolve/{revision}/';

let transcriber: any = null;

self.onmessage = async (event: MessageEvent) => {
  const { type, audioUrl, modelId } = event.data;

  if (type === 'init') {
    try {
      if (!transcriber) {
        transcriber = await pipeline('automatic-speech-recognition', modelId, {
          progress_callback: (p: any) => {
            self.postMessage({ type: 'progress', data: p });
          }
        });
      }
      self.postMessage({ type: 'ready' });
    } catch (error: any) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }

  if (type === 'transcribe') {
    try {
      if (!transcriber) throw new Error('Transcriber not initialized');
      
      const output = await transcriber(audioUrl, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
      });
      
      self.postMessage({ type: 'result', data: output.chunks });
    } catch (error: any) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};
