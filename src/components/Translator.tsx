import React, { useState, useRef } from 'react';
import { Upload, Languages, CheckCircle2, AlertCircle, Loader2, Save, Edit3, X } from 'lucide-react';
import { translateSubtitles } from '../utils/translate';
import { downloadFile, buildSubtitle } from '../utils/subtitle';

const Translator: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('id');
  const [style, setStyle] = useState<'normal' | 'anime'>('normal');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'id', name: 'Indonesian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'es', name: 'Spanish' },
    { code: 'ko', name: 'Korean' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setIsPreviewing(false);
      setCaptions([]);
    }
  };

  const handleTranslate = async () => {
    if (!file) return;

    setStatus('processing');
    setProgress(0);
    
    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target?.result as string;
        try {
          const results = await translateSubtitles(content, sourceLang, targetLang, style, (p) => {
            setProgress(p);
          });
          
          setCaptions(results);
          setIsPreviewing(true);
          setStatus('success');
        } catch (err: any) {
          setError(err.message || 'Translation failed.');
          setStatus('error');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Error reading file.');
      setStatus('error');
    }
  };

  const handleCaptionEdit = (index: number, newText: string) => {
    const updated = [...captions];
    updated[index].text = newText;
    setCaptions(updated);
  };

  const handleDownload = () => {
    if (captions.length === 0 || !file) return;
    const srt = buildSubtitle(captions);
    const newFileName = file.name.replace(/\.[^/.]+$/, "") + `_${targetLang}_${style}.srt`;
    downloadFile(srt, newFileName);
  };

  const handleReset = () => {
    setIsPreviewing(false);
    setStatus('idle');
    setCaptions([]);
  };

  if (isPreviewing) {
    return (
      <div className="max-w-4xl w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black uppercase tracking-tight">Preview & Edit</h2>
          <div className="flex gap-2">
            <button onClick={handleReset} className="neo-button bg-white text-xs py-2 px-3 flex items-center gap-2">
              <X size={14} /> CANCEL
            </button>
            <button onClick={handleDownload} className="neo-button bg-accent text-xs py-2 px-4 flex items-center gap-2">
              <Save size={14} /> SAVE & DOWNLOAD
            </button>
          </div>
        </div>

        <div className="bg-white neo-border max-h-[600px] overflow-y-auto p-4 space-y-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          {captions.map((cap, i) => (
            <div key={i} className="p-4 bg-accent/5 border-2 border-black flex flex-col gap-2 relative">
               <div className="flex justify-between text-[10px] font-black opacity-50 uppercase">
                 <span>Caption #{i + 1}</span>
                 <span>{cap.start} → {cap.end}</span>
               </div>
               <textarea 
                 value={cap.text} 
                 onChange={(e) => handleCaptionEdit(i, e.target.value)}
                 className="w-full p-2 bg-white border-2 border-black font-bold focus:bg-accent/10 outline-none transition-colors resize-none"
                 rows={2}
               />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full">
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-left">
          <label className="block text-xs font-black mb-1 uppercase">Source</label>
          <select 
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value)}
            className="neo-input w-full font-bold"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
        <div className="text-left">
          <label className="block text-xs font-black mb-1 uppercase">Target</label>
          <select 
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="neo-input w-full font-bold"
          >
            {languages.map(lang => (
              <option key={lang.code} value={lang.code}>{lang.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mb-6 text-left">
        <label className="block text-xs font-black mb-2 uppercase">Translation Style</label>
        <div className="flex gap-4">
          <button 
            onClick={() => setStyle('normal')}
            className={`flex-1 neo-button py-2 text-sm ${style === 'normal' ? 'bg-accent' : 'bg-white'}`}
          >
            NORMAL
          </button>
          <button 
            onClick={() => setStyle('anime')}
            className={`flex-1 neo-button py-2 text-sm ${style === 'anime' ? 'bg-secondary' : 'bg-white'}`}
          >
            ANIME / CASUAL
          </button>
        </div>
        <p className="mt-2 text-[10px] font-bold italic opacity-60">
          {style === 'anime' ? '* Using informal Indonesian/Anime terms' : '* Standard neutral translation'}
        </p>
      </div>

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
          {file ? file.name : 'SELECT SUBTITLE FILE'}
        </p>
      </div>

      {status === 'processing' && (
        <div className="mb-6">
          <div className="flex justify-between font-black text-xs mb-1 uppercase">
            <span>Translating...</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full h-8 neo-border bg-white overflow-hidden p-1">
            <div 
              className="h-full bg-accent transition-all duration-300" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button 
        onClick={handleTranslate}
        disabled={!file || status === 'processing'}
        className={`neo-button w-full bg-accent disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {status === 'processing' ? (
          <><Loader2 className="animate-spin" size={20} /> Processing...</>
        ) : (
          <><Languages size={20} /> Translate & Preview</>
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

export default Translator;
