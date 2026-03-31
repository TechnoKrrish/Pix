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

      // Sanitize font name - make it very simple and safe
      const fontName = 'f-' + Math.random().toString(36).substring(2, 9);
      const displayName = file.name.split('.')[0];
      
      try {
        let fontFace: FontFace | null = null;
        let lastError: any = null;

        // Step 1: Try ArrayBuffer (Direct & Modern)
        try {
          console.log('Attempting Step 1: ArrayBuffer');
          fontFace = new FontFace(fontName, arrayBuffer);
          await fontFace.load();
          document.fonts.add(fontFace);
          console.log('Step 1 successful');
        } catch (e) {
          lastError = e;
          console.warn('Step 1 (ArrayBuffer) failed:', e);
          
          // Step 2: Try Blob URL
          try {
            console.log('Attempting Step 2: Blob URL');
            fontFace = new FontFace(fontName, `url(${fontUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            console.log('Step 2 successful');
          } catch (e2) {
            lastError = e2;
            console.warn('Step 2 (Blob URL) failed:', e2);
            
            // Step 3: Try Data URL (Most compatible)
            try {
              console.log('Attempting Step 3: Data URL');
              const dataUrl = await new Promise<string>((resolve) => {
                const r = new FileReader();
                r.onload = () => resolve(r.result as string);
                r.readAsDataURL(fontBlob);
              });
              
              fontFace = new FontFace(fontName, `url(${dataUrl})`);
              await fontFace.load();
              document.fonts.add(fontFace);
              console.log('Step 3 successful');
            } catch (e3) {
              lastError = e3;
              console.error('Step 3 (Data URL) failed:', e3);
              throw e3; // Re-throw to be caught by outer catch
            }
          }
        }

        const newFont = {
          id: uuidv4(),
          name: fontName,
          displayName: displayName,
          data: fontBlob,
          addedAt: Date.now(),
        };

        await saveFont(newFont);
        const updatedFonts = await getFonts();
        setCustomFonts(updatedFonts);
        
        URL.revokeObjectURL(fontUrl);
      } catch (err) {
        console.error('Final Font Load Error:', err);
        URL.revokeObjectURL(fontUrl);
        
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        alert(`Font Load Failed: ${errorMessage}\n\nYour mobile browser is rejecting the font data. \n\nThis usually happens if the font file is "Legacy" or has internal errors. \n\nTry this: \n1. Open the site in "Desktop Mode" in your mobile browser.\n2. Try a different Shree Lipi font file.\n3. Use a PC/Laptop to upload.`);
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
