import { useState, useEffect } from "react";
import { Languages, Type, Video, Zap, Wrench } from "lucide-react";
import Converter from "./components/Converter";
import Translator from "./components/Translator";
import Editor from "./components/Editor";

import BackgroundShapes from "./components/BackgroundShapes";

function App() {
  const [activeTab, setActiveTab] = useState<
    "convert" | "translate" | "auto" | "tools"
  >("convert");

  useEffect(() => {
    const titles = {
      convert: "Subtitle Converter | SRT, ASS, VTT",
      translate: "Subtitle Translator | Anime & Casual Style",
      auto: "AI Auto-Subtitle | Whisper AI",
      tools: "Subtitle Tools | Sync & Cleanup"
    };
    document.title = `${titles[activeTab]} - Subtitle Master`;
  }, [activeTab]);

  return (
    <div className="min-h-screen p-4 md:p-8 relative z-0">
      <BackgroundShapes />
      {/* Header */}
      <header className="max-w-6xl mx-auto mb-12 relative">
        <div className="neo-card bg-primary inline-block mb-4 rotate-[-2deg]">
          <h1 className="text-4xl md:text-6xl tracking-tighter">
            Subtitle Tool
          </h1>
        </div>
        <div className="absolute top-[-10px] left-[-10px] text-3xl">✨</div>
        <div className="inline-block bg-black text-white neo-border px-4 py-2 mt-2 -rotate-1">
          <p className="text-xl font-bold uppercase">
            Powerful. Private. Neo-Brutalist.
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto">
        {/* Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setActiveTab("convert")}
            className={`neo-button ${activeTab === "convert" ? "bg-secondary text-white translate-x-[4px] translate-y-[4px] shadow-none" : "bg-white"}`}
          >
            <Type size={20} /> Convert
          </button>
          <button
            onClick={() => setActiveTab("translate")}
            className={`neo-button ${activeTab === "translate" ? "bg-accent translate-x-[4px] translate-y-[4px] shadow-none" : "bg-white"}`}
          >
            <Languages size={20} /> Translate
          </button>
          <button
            onClick={() => setActiveTab("auto")}
            className={`neo-button ${activeTab === "auto" ? "bg-primary translate-x-[4px] translate-y-[4px] shadow-none" : "bg-white"}`}
          >
            <Video size={20} /> Auto-Subtitle
          </button>
          <button
            onClick={() => setActiveTab("tools")}
            className={`neo-button ${activeTab === "tools" ? "bg-white border-dashed border-4" : "bg-white opacity-80"}`}
          >
            <Wrench size={20} /> Tools
          </button>
        </div>

        {/* Feature Content */}
        <div className="neo-card min-h-[500px] flex flex-col items-center justify-center text-center">
          {activeTab === "convert" && <Converter />}
          {activeTab === "translate" && <Translator />}
          {activeTab === "tools" && <Editor />}

          {activeTab === "auto" && (
            <div className="max-w-md">
              <div className="bg-primary/20 p-8 neo-border border-dashed mb-6 cursor-pointer hover:bg-primary/30 transition-colors">
                <Video size={48} className="mx-auto mb-4" />
                <p className="font-bold">UPLOAD VIDEO FILE</p>
                <p className="text-sm text-red-600 font-bold italic">
                  No Upload Required - Local Extraction
                </p>
              </div>
              <button className="neo-button bg-primary w-full">
                <Zap size={20} /> Generate Subtitles
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-12 pt-8 border-t-4 border-black flex justify-between items-center text-white">
        <p className="font-bold uppercase drop-shadow-[2px_2px_0px_rgba(0,0,0,1)]">
          © 2026 Arch | SubtitleApp
        </p>
        <div className="flex gap-4">
          <div className="neo-card p-2 bg-white text-black text-xs font-bold">
            LOCAL-ONLY
          </div>
          <div className="neo-card p-2 bg-white text-black text-xs font-bold">
            NO DATABASE
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
