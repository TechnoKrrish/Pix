import React, { useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { saveFont, getFonts } from '../../../lib/db';
import { Upload, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function FontPanel() {
  const { canvas, activeObject, customFonts, setCustomFonts } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      const fontName = file.name.split('.')[0].replace(/[^a-zA-Z0-9]/g, '');
      
      const newFont = {
        id: uuidv4(),
        name: fontName,
        dataUrl,
        addedAt: Date.now(),
      };

      await saveFont(newFont);
      const updatedFonts = await getFonts();
      setCustomFonts(updatedFonts);

      const fontFace = new FontFace(fontName, `url(${dataUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);

      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const applyFont = (fontName: string) => {
    if (!canvas || !activeObject || activeObject.type !== 'i-text') return;
    (activeObject as fabric.IText).set('fontFamily', fontName);
    canvas.renderAll();
  };

  const defaultFonts = ['sans-serif', 'serif', 'monospace', 'Arial', 'Times New Roman', 'Courier New'];

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-zinc-300">Fonts</h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-lg text-xs font-medium hover:bg-indigo-500/20"
        >
          <Upload className="w-4 h-4" /> Upload Font
        </button>
        <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff" className="hidden" onChange={handleUpload} />
      </div>

      <div className="space-y-4">
        {customFonts.length > 0 && (
          <div>
            <h4 className="text-xs text-zinc-500 uppercase mb-2">My Fonts</h4>
            <div className="grid grid-cols-2 gap-2">
              {customFonts.map(font => (
                <button 
                  key={font.id}
                  onClick={() => applyFont(font.name)}
                  className="p-3 bg-zinc-800/50 rounded-xl text-left hover:bg-zinc-800 transition-colors"
                  style={{ fontFamily: font.name }}
                >
                  <span className="text-lg text-white">{font.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h4 className="text-xs text-zinc-500 uppercase mb-2">Default Fonts</h4>
          <div className="grid grid-cols-2 gap-2">
            {defaultFonts.map(font => (
              <button 
                key={font}
                onClick={() => applyFont(font)}
                className="p-3 bg-zinc-800/50 rounded-xl text-left hover:bg-zinc-800 transition-colors"
                style={{ fontFamily: font }}
              >
                <span className="text-lg text-white">{font}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
