import React, { useState, useRef } from 'react';
import { Video, Zap, AlertCircle, Loader2, Terminal, Download, RotateCcw, Trash2 } from 'lucide-react';
import { extractAudio } from '../utils/audio';
import { transcribeAudio } from '../utils/transcribe';
import { downloadFile, buildSubtitle } from '../utils/subtitle';
import type { SubtitleFormat } from '../utils/subtitle';
import subsrt from 'subsrt-ts';

type AutoSubStatus = 'idle' | 'extracting' | 'transcribing' | 'editing' | 'success' | 'error';

const AutoSubtitle: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<AutoSubStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [language, setLanguage] = useState<string>('auto');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logEndRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev.slice(-15), msg]);
    setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 10);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
      setProgress(0);
      setLogs([]);
      setCaptions([]);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    try {
      setError(null);
      setStatus('extracting');
      addLog('🚀 Initializing FFmpeg Engine...');
      
      const audioData = await extractAudio(file, (msg) => {
        if (msg.includes('time=')) addLog(`[FFmpeg] ${msg.split('time=')[1].split(' ')[0]}`);
      });
      
      setStatus('transcribing');
      addLog('🤖 Starting Whisper AI...');
      
      const srtContent = await transcribeAudio(
        audioData, 
        (p) => {
          if (p.status === 'progress') {
             setProgress(Math.round(p.progress));
          }
        },
        (msg) => addLog(`[AI] ${msg}`),
        language === 'auto' ? null : language
      );
      
      // Parse the generated SRT to objects for the editor
      const parsed = subsrt.parse(srtContent);
      setCaptions(parsed);
      setStatus('editing');
      addLog('✅ Transcription Complete! You can now edit below.');
      
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Auto-generation failed.');
      setStatus('error');
    }
  };

  const handleEdit = (index: number, newText: string) => {
    const updated = [...captions];
    updated[index].text = newText;
    setCaptions(updated);
  };

  const handleDownload = (format: SubtitleFormat) => {
    const content = buildSubtitle(captions, format);
    const name = file?.name.replace(/\.[^/.]+$/, "") || 'auto_subtitle';
    downloadFile(content, `${name}.${format}`);
    addLog(`📦 Downloaded as ${format.toUpperCase()}`);
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
        <div className="max-w-2xl mx-auto space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="neo-card bg-primary/5 border-dashed border-4 p-12 cursor-pointer hover:bg-primary/10 transition-all group"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="video/*"
            />
            <Video size={60} className="mx-auto mb-4 group-hover:scale-110 transition-transform text-secondary" />
            <h3 className="text-2xl font-black uppercase">Select Video File</h3>
            <p className="font-bold opacity-60">AI will process your video locally</p>
            {file && (
              <div className="mt-4 inline-block bg-black text-white px-4 py-2 text-xs font-bold uppercase">
                {file.name}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs font-black uppercase opacity-60">Speech Language</label>
            <select 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="neo-border p-4 bg-white font-bold uppercase text-sm focus:outline-none"
            >
              <option value="auto">✨ Auto Detect (Slow)</option>
              <option value="id">🇮🇩 Indonesian</option>
              <option value="en">🇺🇸 English</option>
              <option value="ja">🇯🇵 Japanese</option>
              <option value="ko">🇰🇷 Korean</option>
            </select>
          </div>

          <button 
            disabled={!file}
            onClick={handleGenerate}
            className="neo-button bg-primary w-full py-6 text-2xl disabled:opacity-50"
          >
            <Zap size={24} /> Start AI Transcription
          </button>
          
          <p className="text-[10px] font-black uppercase opacity-40">
            * No data leaves your device. Everything is processed locally in your browser.
          </p>
        </div>
      )}

      {(status === 'extracting' || status === 'transcribing') && (
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="neo-card bg-white p-8 text-center">
            <Loader2 size={50} className="mx-auto animate-spin mb-4 text-primary" />
            <h2 className="text-3xl font-black uppercase mb-1">
              {status === 'extracting' ? 'Extracting Audio' : 'AI Transcribing'}
            </h2>
            <p className="font-bold opacity-60 mb-6">Please keep this tab open</p>
            
            <div className="w-full h-8 neo-border bg-black/5 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300 flex items-center justify-end px-4"
                style={{ width: `${progress}%` }}
              >
                <span className="text-black font-black text-xs">{progress}%</span>
              </div>
            </div>
          </div>

          <div className="bg-black text-white p-4 neo-border font-mono text-[10px] text-left">
            <div className="flex items-center gap-2 mb-2 border-b border-white/20 pb-1">
              <Terminal size={12} /> <span className="uppercase font-bold">Execution Logs</span>
            </div>
            <div className="space-y-1 h-32 overflow-y-auto">
              {logs.map((log, i) => (
                <div key={i} className="opacity-70">{log}</div>
              ))}
              <div ref={logEndRef} />
            </div>
          </div>
        </div>
      )}

      {status === 'editing' && (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-wrap justify-between items-end gap-4 text-left">
            <div>
              <h2 className="text-3xl font-black uppercase leading-none">Review Subtitles</h2>
              <p className="text-sm font-bold opacity-60">AI results found {captions.length} segments</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStatus('idle')} className="neo-button bg-white text-xs">
                <RotateCcw size={16} /> New Video
              </button>
              <button onClick={() => handleDownload('srt')} className="neo-button bg-primary text-xs">
                <Download size={16} /> Save SRT
              </button>
              <button onClick={() => handleDownload('ass')} className="neo-button bg-secondary text-white text-xs">
                <Download size={16} /> Save ASS
              </button>
            </div>
          </div>

          <div className="neo-card p-0 bg-white overflow-hidden shadow-neo-lg border-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black text-white uppercase text-[10px] font-black tracking-widest">
                    <th className="p-4 border-r border-white/20 w-16">ID</th>
                    <th className="p-4 border-r border-white/20 w-40">Time Range</th>
                    <th className="p-4 border-r border-white/20">Generated Text (Edit if needed)</th>
                    <th className="p-4 w-12 text-center">X</th>
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
                      <td className="p-2 border-r-2 border-black">
                        <textarea 
                          value={cap.text}
                          onChange={(e) => handleEdit(i, e.target.value)}
                          className="w-full bg-transparent p-2 focus:bg-accent/10 focus:outline-none resize-none min-h-[40px]"
                          rows={1}
                        />
                      </td>
                      <td className="p-4 text-center">
                        <button 
                          onClick={() => setCaptions(captions.filter((_, idx) => idx !== i))}
                          className="text-red-500 hover:scale-125 transition-transform"
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
        <div className="neo-card bg-white p-12 text-center max-w-xl mx-auto border-secondary">
          <AlertCircle size={60} className="mx-auto text-secondary mb-4" />
          <h2 className="text-2xl font-black uppercase mb-2">Something went wrong</h2>
          <p className="font-bold opacity-60 mb-6">{error}</p>
          <button onClick={() => setStatus('idle')} className="neo-button bg-black text-white">
            Try Another Video
          </button>
        </div>
      )}
    </div>
  );
};

export default AutoSubtitle;
