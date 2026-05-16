import React, { useState, useRef } from 'react';
import { 
  Wrench, 
  Trash2, 
  Clock, 
  Search, 
  Palette, 
  Download, 
  Upload, 
  RefreshCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import subsrt from 'subsrt-ts';
import { shiftTime, cleanupSubtitles, bulkSearchReplace, applyStyleToAss } from '../utils/editor';
import { downloadFile, buildSubtitle } from '../utils/subtitle';

const Editor: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [captions, setCaptions] = useState<any[]>([]);
  const [format, setFormat] = useState<string>('srt');
  
  // States for tools
  const [timeShift, setTimeShift] = useState<number>(0);
  const [search, setSearch] = useState('');
  const [replace, setReplace] = useState('');
  
  // States for ASS Style
  const [fontSize, setFontSize] = useState<number>(20);
  const [primaryColor, setPrimaryColor] = useState('#ffffff');
  
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const parsed = subsrt.parse(content);
        setCaptions(parsed);
        
        // Detect format
        if (selectedFile.name.endsWith('.ass')) setFormat('ass');
        else if (selectedFile.name.endsWith('.vtt')) setFormat('vtt');
        else setFormat('srt');
      };
      reader.readAsText(selectedFile);
    }
  };

  const applyShift = () => {
    setCaptions(prev => shiftTime(prev, timeShift));
    showSuccess(`Shifted by ${timeShift}ms`);
  };

  const applyCleanup = () => {
    setCaptions(prev => cleanupSubtitles(prev));
    showSuccess('Cleanup complete (Ads & HI tags removed)');
  };

  const applyReplace = () => {
    setCaptions(prev => bulkSearchReplace(prev, search, replace, false));
    showSuccess(`Replaced "${search}" with "${replace}"`);
  };

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDownload = () => {
    if (captions.length === 0 || !file) return;
    
    let content = buildSubtitle(captions, format as any);
    
    // Apply ASS styles if needed
    if (format === 'ass') {
      content = applyStyleToAss(content, { fontSize, color: primaryColor });
    }

    const newFileName = file.name.replace(/\.[^/.]+$/, "") + `_edited.${format}`;
    downloadFile(content, newFileName);
  };

  return (
    <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Panel: File Info & Download */}
      <div className="md:col-span-1 space-y-6">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="neo-card bg-white p-8 cursor-pointer hover:bg-black/5 transition-colors text-center border-dashed border-4"
        >
          <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".srt,.ass,.vtt,.sbv" />
          <Upload size={32} className="mx-auto mb-2" />
          <p className="font-bold text-sm uppercase">{file ? file.name : 'Load Subtitle'}</p>
        </div>

        {file && (
          <div className="neo-card bg-secondary text-white space-y-4">
            <h3 className="font-black uppercase flex items-center gap-2">
              <RefreshCcw size={18} /> Stats
            </h3>
            <div className="text-sm font-bold">
              <p>CAPTIONS: {captions.length}</p>
              <p>FORMAT: {format.toUpperCase()}</p>
            </div>
            <button onClick={handleDownload} className="neo-button bg-white text-black w-full text-sm">
              <Download size={18} /> Download Result
            </button>
          </div>
        )}

        {successMsg && (
          <div className="neo-card bg-green-400 text-black p-4 flex items-center gap-2 font-bold animate-bounce">
            <CheckCircle2 size={20} /> {successMsg}
          </div>
        )}
      </div>

      {/* Right Panel: Tools */}
      <div className="md:col-span-2 space-y-6">
        {/* Time Shifter */}
        <div className="neo-card bg-white border-primary">
          <h3 className="font-black uppercase mb-4 flex items-center gap-2">
            <Clock size={20} className="text-primary" /> Time Shifter
          </h3>
          <div className="flex gap-4">
            <input 
              type="number" 
              value={timeShift}
              onChange={(e) => setTimeShift(parseInt(e.target.value) || 0)}
              className="neo-input flex-1 font-bold"
              placeholder="Milliseconds (e.g. 1000 or -500)"
            />
            <button onClick={applyShift} disabled={!file} className="neo-button bg-primary disabled:opacity-50">
              Apply
            </button>
          </div>
        </div>

        {/* Search & Replace */}
        <div className="neo-card bg-white border-accent">
          <h3 className="font-black uppercase mb-4 flex items-center gap-2">
            <Search size={20} className="text-accent" /> Bulk Replace
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Search text..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="neo-input font-bold"
            />
            <input 
              type="text" 
              placeholder="Replace with..." 
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              className="neo-input font-bold"
            />
          </div>
          <button onClick={applyReplace} disabled={!file} className="neo-button bg-accent w-full disabled:opacity-50">
            Replace All
          </button>
        </div>

        {/* Cleanup & Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="neo-card bg-white border-secondary flex flex-col justify-between">
            <div>
              <h3 className="font-black uppercase mb-4 flex items-center gap-2">
                <Trash2 size={20} className="text-secondary" /> Cleanup
              </h3>
              <p className="text-xs font-bold opacity-70 mb-4">Remove Ads, URLs, and HI tags</p>
            </div>
            <button onClick={applyCleanup} disabled={!file} className="neo-button bg-secondary text-white w-full disabled:opacity-50">
              Clean
            </button>
          </div>

          <div className={`neo-card transition-all ${format === 'ass' ? 'bg-black text-white' : 'bg-gray-200 opacity-50'}`}>
            <h3 className="font-black uppercase mb-4 flex items-center gap-2">
              <Palette size={20} className="text-primary" /> Style Editor
            </h3>
            {format === 'ass' ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">Font Size</span>
                  <input 
                    type="number" 
                    value={fontSize} 
                    onChange={(e) => setFontSize(parseInt(e.target.value) || 20)}
                    className="w-16 bg-white text-black px-2 py-1 neo-border font-bold text-center"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold">Text Color</span>
                  <input 
                    type="color" 
                    value={primaryColor} 
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-16 h-8 bg-white cursor-pointer neo-border"
                  />
                </div>
                <div className="bg-primary/20 p-2 text-[10px] font-bold border-l-4 border-primary">
                  Applied during Download
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-bold italic">
                <Info size={14} /> Only for .ass files
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Editor;
