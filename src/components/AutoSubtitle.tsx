import React, { useState, useRef } from 'react';
import { Video, Zap, CheckCircle2, AlertCircle, Loader2, Terminal } from 'lucide-react';
import { extractAudio } from '../utils/audio';
import { transcribeAudio } from '../utils/transcribe';
import { downloadFile } from '../utils/subtitle';

const AutoSubtitle: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<'idle' | 'extracting' | 'transcribing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-10), msg]);
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setLogs([]);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    try {
      setStatus('extracting');
      addLog('Initializing FFmpeg...');
      
      const audioData = await extractAudio(file, (msg) => {
        if (msg.includes('time=')) addLog(msg);
      });
      
      setStatus('transcribing');
      addLog('Loading Whisper AI Model...');
      
      const srt = await transcribeAudio(audioData, (p) => {
        if (p.status === 'progress') {
           setProgress(Math.round(p.progress));
        } else if (p.status === 'ready') {
           addLog('AI Model Ready. Starting Transcriptions...');
        }
      });
      
      const newFileName = file.name.replace(/\.[^/.]+$/, "") + `.srt`;
      downloadFile(srt, newFileName);
      setStatus('success');
      addLog('Successfully generated subtitle!');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Auto-generation failed.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`bg-primary/5 p-12 neo-border border-dashed mb-6 cursor-pointer hover:bg-primary/10 transition-colors relative group`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept="video/*"
        />
        <Video size={48} className="mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <p className="font-bold uppercase">
          {file ? file.name : 'UPLOAD VIDEO FILE'}
        </p>
        <p className="text-sm text-red-600 font-bold italic">PROCESSED LOCALLY - NO UPLOAD</p>
      </div>

      {(status !== 'idle' && status !== 'error' && status !== 'success') && (
        <div className="mb-6">
          <div className="flex justify-between font-black text-xs mb-1 uppercase">
            <span>{status === 'extracting' ? 'Extracting Audio...' : 'Transcribing AI...'}</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-8 neo-border bg-white overflow-hidden p-1">
            <div 
              className="h-full bg-primary transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {logs.length > 0 && (
        <div className="mb-6 bg-black text-white p-4 neo-border text-left font-mono text-[10px] overflow-hidden">
          <div className="flex items-center gap-2 mb-2 border-b border-white/20 pb-1">
            <Terminal size={12} /> <span className="uppercase font-bold">Process Logs</span>
          </div>
          {logs.map((log, i) => (
            <div key={i} className="truncate opacity-70">{log}</div>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      <button 
        onClick={handleGenerate}
        disabled={!file || (status !== 'idle' && status !== 'error' && status !== 'success')}
        className={`neo-button w-full bg-primary disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {status === 'extracting' || status === 'transcribing' ? (
          <><Loader2 className="animate-spin" size={20} /> Generating...</>
        ) : status === 'success' ? (
          <><CheckCircle2 size={20} /> Generated & Saved!</>
        ) : (
          <><Zap size={20} /> Generate Subtitles</>
        )}
      </button>

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-100 neo-border text-red-600 flex items-center gap-2 text-left">
          <AlertCircle size={20} />
          <span className="font-bold">{error}</span>
        </div>
      )}
    </div>
  );
};

export default AutoSubtitle;
