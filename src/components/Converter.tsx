import React, { useState, useRef } from 'react';
import { Upload, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import { convertSubtitle, downloadFile } from '../utils/subtitle';
import type { SubtitleFormat } from '../utils/subtitle';

const Converter: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<SubtitleFormat>('srt');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setStatus('processing');
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const converted = convertSubtitle(content, targetFormat);
          const newFileName = file.name.replace(/\.[^/.]+$/, "") + `.${targetFormat}`;
          downloadFile(converted, newFileName);
          setStatus('success');
        } catch (err: any) {
          setError(err.message);
          setStatus('error');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Error reading file.');
      setStatus('error');
    }
  };

  return (
    <div className="max-w-xl w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`bg-accent/5 p-12 neo-border border-dashed mb-6 cursor-pointer hover:bg-accent/10 transition-colors relative group`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".srt,.ass,.vtt,.sbv"
        />
        <Upload size={48} className="mx-auto mb-4 group-hover:scale-110 transition-transform" />
        <p className="font-bold uppercase">
          {file ? file.name : 'DROP SUBTITLE FILE HERE'}
        </p>
        <p className="text-sm opacity-60">ASS, SRT, VTT, SBV SUPPORTED</p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1">
          <label className="block text-xs font-black mb-1 uppercase">Target Format</label>
          <select 
            value={targetFormat}
            onChange={(e) => setTargetFormat(e.target.value as SubtitleFormat)}
            className="neo-input w-full font-bold"
          >
            <option value="srt">SRT (SubRip)</option>
            <option value="ass">ASS (Advanced SubStation Alpha)</option>
            <option value="vtt">VTT (WebVTT)</option>
            <option value="sbv">SBV (YouTube)</option>
            <option value="json">JSON</option>
          </select>
        </div>
      </div>

      <button 
        onClick={handleConvert}
        disabled={!file || status === 'processing'}
        className={`neo-button w-full bg-secondary text-white disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {status === 'processing' ? (
          'Processing...'
        ) : status === 'success' ? (
          <><CheckCircle2 size={20} /> Converted & Saved!</>
        ) : (
          <><Zap size={20} /> Convert Now</>
        )}
      </button>

      {status === 'error' && (
        <div className="mt-4 p-4 bg-red-100 neo-border text-red-600 flex items-center gap-2">
          <AlertCircle size={20} />
          <span className="font-bold">{error}</span>
        </div>
      )}
    </div>
  );
};

export default Converter;
