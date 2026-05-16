import React, { useState, useRef } from 'react';
import { Languages, Upload, Download, Loader2, AlertCircle, Trash2, RotateCcw } from 'lucide-react';
import subsrt from 'subsrt-ts';
import { translateSubtitles } from '../utils/translate';
import type { TranslationStyle } from '../utils/translate';
import { downloadFile, buildSubtitle } from '../utils/subtitle';
import type { SubtitleFormat } from '../utils/subtitle';

const languages = [
  { code: 'en', name: 'English' },
  { code: 'id', name: 'Indonesian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
];

type TranslationStatus = 'idle' | 'translating' | 'editing' | 'error' | 'success';

const Translator: React.FC = () => {
  const [status, setStatus] = useState<TranslationStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);
  
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('id');
  const [style, setStyle] = useState<TranslationStyle>('normal');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setError(null);
      setStatus('idle');
    }
  };

  const startTranslation = async () => {
    if (!file) return;

    try {
      setStatus('translating');
      setProgress(0);
      setError(null);

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const parsed = subsrt.parse(content);
          
          const translated = await translateSubtitles(
            parsed,
            sourceLang,
            targetLang,
            style,
            (cur, tot) => setProgress(Math.round((cur / tot) * 100))
          );

          setCaptions(translated);
          setStatus('editing');
        } catch (err: any) {
          setError(err.message || 'Translation failed.');
          setStatus('error');
        }
      };
      reader.readAsText(file);
    } catch (err: any) {
      setError(err.message || 'Failed to read file.');
      setStatus('error');
    }
  };

  const handleEdit = (index: number, field: 'text' | 'originalText', newText: string) => {
    const updated = [...captions];
    updated[index][field] = newText;
    setCaptions(updated);
  };

  const handleDownload = (format: SubtitleFormat) => {
    const content = buildSubtitle(captions, format);
    const name = file?.name.replace(/\.[^/.]+$/, "") || 'translated';
    downloadFile(content, `${name}.${targetLang}.${format}`);
    setStatus('success');
    setTimeout(() => setStatus('editing'), 2000);
  };

  const formatTime = (ms: number) => {
    const date = new Date(ms);
    return date.getUTCHours().toString().padStart(2, '0') + ':' +
           date.getUTCMinutes().toString().padStart(2, '0') + ':' +
           date.getUTCSeconds().toString().padStart(2, '0');
  };

  return (
    <div className="w-full max-w-6xl p-4">
      {status === 'idle' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="neo-card bg-accent/5 border-dashed border-4 cursor-pointer hover:bg-accent/10 transition-all p-12 group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
              accept=".srt,.ass,.vtt"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 bg-primary neo-border group-hover:scale-110 transition-transform">
                <Upload size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase">Upload Subtitle File</h3>
                <p className="text-sm opacity-60 font-bold">SRT, ASS, or VTT supported</p>
              </div>
              {file && (
                <div className="mt-4 px-4 py-2 bg-black text-white font-bold uppercase text-xs">
                  Selected: {file.name}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="neo-card bg-white">
              <label className="block text-xs font-black mb-2 uppercase">Source Language</label>
              <select 
                value={sourceLang} 
                onChange={(e) => setSourceLang(e.target.value)}
                className="neo-input w-full font-bold"
              >
                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <div className="neo-card bg-white">
              <label className="block text-xs font-black mb-2 uppercase">Target Language</label>
              <select 
                value={targetLang} 
                onChange={(e) => setTargetLang(e.target.value)}
                className="neo-input w-full font-bold"
              >
                {languages.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
              </select>
            </div>
            <div className="neo-card bg-white">
              <label className="block text-xs font-black mb-2 uppercase">Translation Style</label>
              <div className="flex gap-2 h-[42px]">
                <button 
                  onClick={() => setStyle('normal')}
                  className={`flex-1 neo-border font-bold text-xs uppercase ${style === 'normal' ? 'bg-black text-white' : 'bg-white'}`}
                >
                  Formal
                </button>
                <button 
                  onClick={() => setStyle('anime')}
                  className={`flex-1 neo-border font-bold text-xs uppercase ${style === 'anime' ? 'bg-primary' : 'bg-white'}`}
                >
                  Casual / Anime
                </button>
              </div>
            </div>
          </div>

          <button 
            disabled={!file}
            onClick={startTranslation}
            className="neo-button bg-secondary text-white w-full py-6 text-2xl group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Languages className="group-hover:rotate-12 transition-transform" />
            Start Fast Translation
          </button>
        </div>
      )}

      {status === 'translating' && (
        <div className="neo-card bg-white p-12 text-center space-y-6">
          <Loader2 size={60} className="mx-auto animate-spin text-secondary" />
          <div>
            <h2 className="text-3xl font-black uppercase mb-2">Translating...</h2>
            <p className="font-bold opacity-60">Speeding through with Google API</p>
          </div>
          <div className="w-full bg-black/5 h-8 neo-border overflow-hidden">
            <div 
              className="h-full bg-secondary transition-all duration-300 flex items-center justify-end px-4"
              style={{ width: `${progress}%` }}
            >
              <span className="text-white font-black text-xs">{progress}%</span>
            </div>
          </div>
        </div>
      )}

      {(status === 'editing' || status === 'success') && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-wrap justify-between items-end gap-4">
            <div className="text-left">
              <h2 className="text-3xl font-black uppercase">Subtitle Editor</h2>
              <p className="text-sm font-bold opacity-60">Review and refine your translations</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatus('idle')} className="neo-button bg-white text-xs">
                <RotateCcw size={16} /> New File
              </button>
              <button onClick={() => handleDownload('srt')} className="neo-button bg-primary text-xs">
                <Download size={16} /> Download SRT
              </button>
              <button onClick={() => handleDownload('ass')} className="neo-button bg-secondary text-white text-xs">
                <Download size={16} /> Download ASS
              </button>
            </div>
          </div>

          <div className="neo-card p-0 bg-white overflow-hidden shadow-neo-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white uppercase text-[10px] font-black tracking-widest">
                    <th className="p-4 border-r border-white/20 w-16">ID</th>
                    <th className="p-4 border-r border-white/20 w-40">Time Range</th>
                    <th className="p-4 border-r border-white/20">Original Text</th>
                    <th className="p-4 border-r border-white/20">Translated Text (Edit here)</th>
                    <th className="p-4 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-bold">
                  {captions.map((cap, i) => (
                    <tr key={i} className="border-b-2 border-black hover:bg-accent/5 transition-colors group">
                      <td className="p-4 border-r-2 border-black text-center opacity-40">{i + 1}</td>
                      <td className="p-4 border-r-2 border-black whitespace-nowrap">
                        <div className="flex flex-col text-[10px] opacity-60">
                          <span>{formatTime(cap.start)}</span>
                          <span className="h-[2px] w-4 bg-black my-1"></span>
                          <span>{formatTime(cap.end)}</span>
                        </div>
                      </td>
                      <td className="p-2 border-r-2 border-black bg-black/5">
                        <textarea 
                          value={cap.originalText || cap.text}
                          onChange={(e) => handleEdit(i, 'originalText', e.target.value)}
                          className="w-full bg-transparent p-2 focus:bg-accent/10 focus:outline-none resize-none h-auto min-h-[40px] opacity-60"
                          rows={1}
                        />
                      </td>
                      <td className="p-2 border-r-2 border-black">
                        <textarea 
                          value={cap.text}
                          onChange={(e) => handleEdit(i, 'text', e.target.value)}
                          className="w-full bg-transparent p-2 focus:bg-accent/10 focus:outline-none resize-none h-auto min-h-[40px]"
                          rows={1}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => {
                            const updated = captions.filter((_, idx) => idx !== i);
                            setCaptions(updated);
                          }}
                          className="text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {status === 'error' && (
        <div className="neo-card bg-white p-12 text-center border-secondary">
          <AlertCircle size={60} className="mx-auto text-secondary mb-4" />
          <h2 className="text-2xl font-black uppercase mb-2">Translation Error</h2>
          <p className="font-bold opacity-60 mb-6">{error}</p>
          <button onClick={() => setStatus('idle')} className="neo-button bg-black text-white">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default Translator;
