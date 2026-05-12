/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Uploader from './components/Uploader';
import { Tool } from './types';
import { TOOLS } from './constants';
import { motion, AnimatePresence } from 'motion/react';
import * as Icons from 'lucide-react';
import { Download, Share2, Info, ChevronRight, Zap, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { CanvasEngine, DEFAULT_FILTERS, FilterOptions } from './lib/canvasEngine';

// Tool Components Import (Placeholder for now, we will add them)
// In a real app, we'd code-split these

export default function App() {
  const [activeTool, setActiveTool] = useState<Tool>(TOOLS[0]);
  const [images, setImages] = useState<File[]>([]);
  const [processedUrl, setProcessedUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(DEFAULT_FILTERS);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Tool Specific States
  const [quoteText, setQuoteText] = useState('Dream big. Work hard. Stay focused.');
  const [quoteAuthor, setQuoteAuthor] = useState('Anonymous');
  const [exportQuality, setExportQuality] = useState(0.85);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<CanvasEngine | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);

  const [batchResults, setBatchResults] = useState<string[]>([]);
  const [currentDimensions, setCurrentDimensions] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    document.title = `${activeTool.name} - Free Browser-Based Tool | PixelForge`;
  }, [activeTool]);

  const handleImagesSelected = (newFiles: File[]) => {
    setImages(prev => [...prev, ...newFiles]);
  };

  const currentImageUrl = images.length > 0 ? URL.createObjectURL(images[0]) : null;

  const processBatch = useCallback(async () => {
    if (images.length === 0 || !canvasRef.current) return;
    setIsProcessing(true);
    const results: string[] = [];
    
    if (!engineRef.current) {
      engineRef.current = new CanvasEngine(canvasRef.current);
    }
    const engine = engineRef.current;

    for (const file of images) {
      const url = URL.createObjectURL(file);
      try {
        const img = await engine.loadImage(url);
        if (file === images[0]) {
          setCurrentDimensions({ width: img.width, height: img.height });
          imageRef.current = img;
        }

        // Apply Tool-Specific Engine Logic
        if (activeTool.id === 'ig-square') {
          engine.resizeToSquare(img);
        } else {
          engine.setSize(img.width, img.height);
          engine.clear();
          engine.applyFilters(filters);
          engine.drawImage(img);
        }

        if (activeTool.id === 'watermark') {
          engine.addWatermark('PixelForge Toolkit');
        }

        if (activeTool.id === 'quote-maker') {
          engine.addQuote(quoteText, quoteAuthor);
        }

        results.push(engine.export('image/jpeg', activeTool.id === 'compressor' ? exportQuality : 0.92));
      } catch (err) {
        console.error('Batch processing error:', err);
      }
      URL.revokeObjectURL(url);
    }
    setBatchResults(results);
    setProcessedUrl(results[0] || null);
    setIsProcessing(false);
  }, [images, filters, activeTool.id, quoteText, quoteAuthor, exportQuality]);

  useEffect(() => {
    processBatch();
  }, [processBatch]);

  const downloadAll = () => {
    batchResults.forEach((url, i) => {
      const link = document.createElement('a');
      link.download = `pixelforge-${activeTool.id}-${i}-${Date.now()}.jpg`;
      link.href = url;
      link.click();
    });
  };

  const downloadImage = () => {
    if (!processedUrl) return;
    const link = document.createElement('a');
    link.download = `pixelforge-${activeTool.id}-${Date.now()}.jpg`;
    link.href = processedUrl;
    link.click();
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-800 antialiased overflow-hidden relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <div className={`fixed inset-y-0 left-0 z-50 transform lg:relative lg:translate-x-0 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar onSelectTool={(tool) => { setActiveTool(tool); setIsSidebarOpen(false); }} activeToolId={activeTool.id} />
      </div>

      <main className="flex-1 flex flex-col h-full overflow-hidden w-full">
        {/* Mobile Navbar Header */}
        <div className="lg:hidden h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600">
            <Icons.Menu size={20} />
          </button>
          <div className="flex items-center gap-2 text-blue-600">
            <Zap size={20} fill="currentColor" />
            <span className="font-extrabold text-slate-900 text-sm">PixelForge</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Top: Universal Uploader Bar */}
        <div className="border-b border-slate-200 bg-white p-4">
          <Uploader onImagesSelected={handleImagesSelected} selectedCount={images.length} />
        </div>

        {/* Workspace Area */}
        <div className="flex-1 overflow-y-auto lg:overflow-hidden p-4 lg:p-6 flex flex-col lg:flex-row gap-6">
          
          {/* Main Area: Preview */}
          <div className="relative flex-1 min-h-[400px] lg:min-h-0 flex flex-col items-center justify-center rounded-2xl bg-slate-200 shadow-inner overflow-hidden border border-slate-300/30">
            <div className="absolute inset-0 opacity-10 bg-grid-transparency"></div>
            
            <div className="relative flex flex-col items-center max-w-full max-h-full p-4 lg:p-8">
              <AnimatePresence mode="wait">
                {!currentImageUrl ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center gap-4 text-slate-400"
                  >
                    <ImageIcon size={48} className="opacity-20" />
                    <p className="text-xs font-medium">Ready for your magic.</p>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative bg-white shadow-2xl p-2 lg:p-4 rounded-lg flex items-center justify-center max-w-full max-h-full"
                  >
                    <canvas ref={canvasRef} className="max-w-full max-h-[50vh] lg:max-h-[60vh] object-contain rounded border border-slate-100" />
                  </motion.div>
                )}
              </AnimatePresence>

              {images.length > 0 && currentDimensions && (
                <div className="mt-4 lg:mt-6 flex flex-wrap justify-center items-center gap-2 rounded-full bg-black/80 px-4 py-1.5 text-[10px] lg:text-[11px] text-white backdrop-blur shadow-lg">
                  <span className="opacity-60">{currentDimensions.width} x {currentDimensions.height}px</span>
                  <span className="h-1 w-1 rounded-full bg-white/30"></span>
                  <span className="opacity-60 capitalize">{images[0]?.name.split('.').pop()}</span>
                  <span className="h-1 w-1 rounded-full bg-white/30"></span>
                  <span className="text-green-400 font-bold uppercase tracking-wider">Processed</span>
                </div>
              )}
            </div>

            {images.length > 1 && (
              <div className="absolute bottom-4 left-4">
                <div className="flex items-center gap-2 rounded-lg bg-white/90 backdrop-blur px-3 py-1.5 text-xs font-semibold shadow-sm border border-slate-200 text-slate-700">
                  <Zap size={14} className="text-blue-500" />
                  Batch processing {images.length} files
                </div>
              </div>
            )}

            {isProcessing && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest bg-white/80 px-2 py-1 rounded shadow-sm">Syncing Changes</span>
                </div>
              </div>
            )}
          </div>

          {/* Side Area: Settings */}
          <div className="w-full lg:w-80 flex flex-col shrink-0 pb-10 lg:pb-0">
            <div className="flex-1 rounded-2xl border border-slate-200 bg-white p-5 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100 shrink-0">
                <h3 className="font-bold text-slate-800 tracking-tight">Tool Settings</h3>
                <span className="rounded bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase text-blue-700 whitespace-nowrap">
                  {activeTool.category}
                </span>
              </div>

              <div className="flex-1 overflow-y-auto lg:overflow-y-auto space-y-6 scrollbar-hide">
                <div>
                   <h4 className="text-[10px] font-bold uppercase text-slate-400 tracking-wider mb-1">{activeTool.name}</h4>
                   <p className="text-xs text-slate-500 leading-relaxed">{activeTool.description}</p>
                </div>

                {activeTool.id === 'filter-suite' && (
                  <div className="space-y-5">
                    {Object.entries(filters).map(([key, value]) => (
                      <div key={key} className="space-y-3">
                        <div className="flex justify-between text-[11px] font-bold text-slate-600">
                          <span className="capitalize">{key}</span>
                          <span className="text-blue-600">{value}%</span>
                        </div>
                        <input
                          type="range"
                          min={key === 'hueRotate' ? 0 : 0}
                          max={key === 'blur' ? 20 : (key === 'brightness' || key === 'contrast' || key === 'saturation' ? 200 : 100)}
                          value={value}
                          onChange={(e) => setFilters(prev => ({ ...prev, [key]: Number(e.target.value) }))}
                          className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600 transition-all hover:bg-slate-200"
                        />
                      </div>
                    ))}
                  </div>
                )}

                {activeTool.id === 'watermark' && (
                  <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-xs text-blue-700 leading-relaxed italic">
                    Universal PixelForge watermark added to lower-right corner. Custom branding coming soon.
                  </div>
                )}

                {activeTool.id === 'ig-square' && (
                  <div className="space-y-4">
                    <p className="text-xs text-slate-500">Automatically pads your image to a 1:1 square ratio with a white background, perfect for Instagram grid posts.</p>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                      <Icons.Maximize className="text-blue-500" size={16} />
                      <span className="text-[10px] font-bold text-slate-600 uppercase">Automatic Center Alignment</span>
                    </div>
                  </div>
                )}

                {activeTool.id === 'compressor' && (
                  <div className="space-y-5">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[11px] font-bold text-slate-600">
                        <span>Quality</span>
                        <span className="text-blue-600">{Math.round(exportQuality * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0.1"
                        max="1"
                        step="0.01"
                        value={exportQuality}
                        onChange={(e) => setExportQuality(Number(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                    <div className="p-4 bg-green-50 rounded-xl border border-green-100 text-[10px] text-green-700 font-medium">
                      Lower quality results in smaller file sizes. 85% is the recommended sweet spot for web.
                    </div>
                  </div>
                )}

                {activeTool.id === 'quote-maker' && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Quote Text</label>
                      <textarea
                        value={quoteText}
                        onChange={(e) => setQuoteText(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500 h-24"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase text-slate-400">Author</label>
                      <input
                        type="text"
                        value={quoteAuthor}
                        onChange={(e) => setQuoteAuthor(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-1 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                )}

                {!['filter-suite', 'watermark', 'ig-square', 'compressor', 'quote-maker'].includes(activeTool.id) && (
                  <div className="py-12 flex flex-col items-center text-center text-slate-300">
                    <Info size={40} className="mb-2 opacity-50" />
                    <p className="text-[11px] font-bold uppercase tracking-widest text-slate-400">Settings Pending</p>
                    <p className="text-[10px] mt-2 px-4 italic leading-tight">This tool logic is being finalized. Try Filter Suite for live effects.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                onClick={downloadImage}
                disabled={!processedUrl}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-sm font-bold text-white shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:shadow-none"
              >
                <Download size={18} strokeWidth={2.5} />
                Download Result
              </button>
              
              {images.length > 1 && (
                <button
                  onClick={downloadAll}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition-all"
                >
                  Download All ({images.length} Files)
                </button>
              )}
              
              <p className="text-center text-[10px] text-slate-400 font-medium italic">
                Processed locally in-browser &bull; 100% Private
              </p>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <footer className="hidden h-8 lg:flex items-center justify-between border-t border-slate-200 bg-white px-6 text-[10px] shrink-0">
          <div className="flex gap-4">
            <span className="font-semibold text-slate-500 uppercase tracking-tight">Active: {activeTool.name}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
             <div className="flex h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="font-medium tracking-wide">WebAssembly Canvas Engine v1.0.4</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
