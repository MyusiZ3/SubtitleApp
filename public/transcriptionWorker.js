import { pipeline, env } from 'https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2';

env.allowLocalModels = false;
env.useBrowserCache = true;
env.remoteHost = 'https://huggingface.co';
env.remotePathTemplate = '{model}/resolve/{revision}/';

let transcriber = null;

const isHallucination = (text) => {
  const repeatedChar = /(.)\1{8,}/.test(text); 
  const repeatedWord = /(\b\w+\b)( \1){5,}/.test(text); 
  return repeatedChar || repeatedWord;
};

self.onmessage = async (event) => {
  const { type, audioData, modelId } = event.data;

  if (type === 'init') {
    try {
      if (!transcriber) {
        self.postMessage({ type: 'log', data: `Loading AI Engine (${modelId})...` });
        transcriber = await pipeline('automatic-speech-recognition', modelId, {
          progress_callback: (p) => {
            self.postMessage({ type: 'progress', data: p });
          }
        });
      }
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }

  if (type === 'transcribe') {
    try {
      const { audioData, language } = event.data;
      if (!transcriber) throw new Error('Transcriber not initialized');
      
      self.postMessage({ type: 'log', data: `AI is processing audio (${language || 'Auto-detect'} mode)...` });
      
      const output = await transcriber(audioData, {
        chunk_length_s: 30,
        stride_length_s: 5,
        return_timestamps: true,
        force_full_sequences: false,
        
        // Quality Settings
        temperature: 0,
        do_sample: false,
        repetition_penalty: 1.2,
        
        language: language || null, 
        task: 'transcribe',
      });
      
      // Log detected language if available
      // Transformers.js Whisper output sometimes includes metadata in the first chunk or separate field
      // but the most reliable way is often seeing the result.
      
      const filteredChunks = (output.chunks || [])
        .filter(chunk => !isHallucination(chunk.text))
        .map(chunk => ({
           ...chunk,
           text: chunk.text.trim()
        }))
        .filter(chunk => chunk.text.length > 0);

      if (filteredChunks.length === 0) {
        self.postMessage({ 
            type: 'result', 
            data: [{ timestamp: [0, 5], text: "No speech detected. Try a clearer audio." }] 
        });
      } else {
        self.postMessage({ type: 'result', data: filteredChunks });
      }
      
    } catch (error) {
      self.postMessage({ type: 'error', error: error.message });
    }
  }
};
