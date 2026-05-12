/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Upload, X, ImageIcon, FileWarning } from 'lucide-react';
import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface UploaderProps {
  onImagesSelected: (files: File[]) => void;
  selectedCount: number;
}

export default function Uploader({ onImagesSelected, selectedCount }: UploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) onImagesSelected(files);
  }, [onImagesSelected]);

  const handleInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      onImagesSelected(files);
    }
  }, [onImagesSelected]);

  return (
    <div className="w-full">
      <label
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`relative flex items-center justify-center w-full h-20 border-2 border-dashed rounded-xl transition-all cursor-pointer overflow-hidden ${
          isDragging
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200 bg-slate-50 hover:bg-blue-50/50'
        }`}
      >
        <input type="file" className="hidden" multiple accept="image/*" onChange={handleInput} />

        <div className="flex items-center gap-3 text-slate-600">
           <Upload className="h-6 w-6 text-blue-500" />
           <p className="text-sm font-medium">
             {isDragging ? 'Drop images here' : <span>Drop your images here, or <span className="text-blue-600 underline">browse files</span></span>}
           </p>
           <p className="text-xs text-slate-400 ml-4 hidden sm:block">Supports PNG, JPG, WebP, HEIC up to 50MB</p>
        </div>

        {selectedCount > 0 && (
          <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-0.5 rounded text-[10px] font-bold shadow-sm">
            {selectedCount} Selected
          </div>
        )}
      </label>
    </div>
  );
}
