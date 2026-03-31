import React, { useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { saveFont, getFonts, deleteFont } from '../../../lib/db';
import { Upload, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

export default function FontPanel() {
  const { canvas, activeObject, customFonts, setCustomFonts } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['ttf', 'otf', 'woff', 'woff2'];
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !allowedExtensions.includes(extension)) {
      alert(`Unsupported file type: .${extension}. Please upload a standard font file (.ttf, .otf, .woff, or .woff2).`);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      if (!arrayBuffer) return;

      const fontBlob = new Blob([arrayBuffer]);
      const fontUrl = URL.createObjectURL(fontBlob);

      // Sanitize font name - make it very simple
      let fontName = 'custom-' + Math.random().toString(36).substring(2, 9);
      
      try {
        let fontFace: FontFace;
        
        try {
          // Attempt 1: Load using ArrayBuffer (Direct)
          fontFace = new FontFace(fontName, arrayBuffer);
          await fontFace.load();
        } catch (e) {
          console.warn('Attempt 1 (ArrayBuffer) failed, trying Attempt 2 (Blob URL)...');
          // Attempt 2: Load using Blob URL (Fallback)
          fontFace = new FontFace(fontName, `url(${fontUrl})`);
          await fontFace.load();
        }

        document.fonts.add(fontFace);

        const newFont = {
          id: uuidv4(),
          name: fontName,
          displayName: file.name.split('.')[0], // Keep original name for UI
          data: fontBlob,
          addedAt: Date.now(),
        };

        await saveFont(newFont);
        const updatedFonts = await getFonts();
        setCustomFonts(updatedFonts);
        
        // Clean up the temporary URL
        URL.revokeObjectURL(fontUrl);
      } catch (err) {
        console.error('Font Load Error:', err);
        URL.revokeObjectURL(fontUrl);
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        alert(`Font Compatibility Error: Your browser rejected this font file. \n\nReason: ${errorMessage}\n\nSolution: Please convert this font to .woff2 format using an online "TTF to WOFF2" converter. WOFF2 files are much more compatible with mobile browsers.`);
      }

      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsArrayBuffer(file);
  };

  const applyFont = (fontName: string) => {
    if (!canvas || !activeObject || activeObject.type !== 'i-text') return;
    const textObj = activeObject as any;
    
    // Clean and add quotes if fontName has spaces to ensure fabric.js handles it correctly
    const cleanFontName = fontName.replace(/['"]/g, '');
    const formattedFontName = cleanFontName.includes(' ') ? `"${cleanFontName}"` : cleanFontName;
    textObj.set('fontFamily', formattedFontName);
    
    import('../../../lib/hindiConverter').then(({ detectFontEncoding, convertToLegacy }) => {
      const encoding = detectFontEncoding(fontName);
      textObj.set('fontEncoding', encoding);
      
      const currentUnicodeText = textObj.unicodeText || textObj.text;
      const textToRender = convertToLegacy(currentUnicodeText, encoding);
      
      textObj.set('text', textToRender);
      textObj.dirty = true;
      
      if (textObj.initDimensions) {
        textObj.initDimensions();
      }
      canvas.requestRenderAll();
      
      // Ensure canvas re-renders after font is fully ready
      document.fonts.load(`1em "${cleanFontName}"`).then(() => {
        textObj.dirty = true;
        canvas.requestRenderAll();
      }).catch(err => {
        console.warn('Font load warning:', err);
        // Fallback render
        textObj.dirty = true;
        canvas.requestRenderAll();
      });
      
      // Update the active object in the store to trigger a re-render of the UI
      useAppStore.setState({ activeObject: null });
      setTimeout(() => useAppStore.setState({ activeObject: textObj }), 0);
    });
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
        <input type="file" ref={fileInputRef} accept=".ttf,.otf,.woff,.woff2" className="hidden" onChange={handleUpload} />
      </div>

      <div className="space-y-4">
        {customFonts.length > 0 && (
          <div>
            <h4 className="text-xs text-zinc-500 uppercase mb-2">My Fonts</h4>
            <div className="grid grid-cols-2 gap-2">
              {customFonts.map(font => (
                <div key={font.id} className="relative group">
                  <button 
                    onClick={() => applyFont(font.name)}
                    className="w-full p-3 bg-zinc-800/50 rounded-xl text-left hover:bg-zinc-800 transition-colors"
                    style={{ fontFamily: `"${font.name}"` }}
                  >
                    <span className="text-lg text-white truncate block pr-6">{font.displayName || font.name}</span>
                  </button>
                  <button 
                    onClick={async (e) => {
                      e.stopPropagation();
                      if (confirm(`Delete font "${font.displayName || font.name}"?`)) {
                        await deleteFont(font.id);
                        const updatedFonts = await getFonts();
                        setCustomFonts(updatedFonts);
                      }
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/10 text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
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
                style={{ fontFamily: `"${font}"` }}
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
