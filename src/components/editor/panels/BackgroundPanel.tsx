import React, { useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { fabric } from 'fabric';
import { Image as ImageIcon, X } from 'lucide-react';

export default function BackgroundPanel() {
  const { canvas } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvas) return;
    canvas.setBackgroundColor(e.target.value, () => canvas.renderAll());
    canvas.backgroundImage = undefined;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      fabric.Image.fromURL(dataUrl, (img) => {
        const canvasAspect = canvas.width! / canvas.height!;
        const imgAspect = img.width! / img.height!;
        let scaleFactor;

        if (canvasAspect >= imgAspect) {
          scaleFactor = canvas.width! / img.width!;
        } else {
          scaleFactor = canvas.height! / img.height!;
        }

        img.set({
          scaleX: scaleFactor,
          scaleY: scaleFactor,
          originX: 'center',
          originY: 'center',
          left: canvas.width! / 2,
          top: canvas.height! / 2,
        });

        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas));
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const handleClear = () => {
    if (!canvas) return;
    canvas.setBackgroundColor('transparent', () => canvas.renderAll());
    canvas.backgroundImage = undefined;
  };

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
      <div className="flex flex-col gap-1">
        <span className="text-[10px] text-zinc-500 uppercase">Color</span>
        <input 
          type="color" 
          onChange={handleColorChange}
          className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0 p-0"
        />
      </div>

      <div className="w-px h-10 bg-zinc-800 mx-2" />

      <button 
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-3 bg-zinc-800/50 text-zinc-300 rounded-xl min-w-[80px] hover:bg-zinc-800"
      >
        <ImageIcon className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">Image</span>
      </button>
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleImageUpload} />

      <button 
        onClick={handleClear}
        className="flex flex-col items-center justify-center p-3 bg-red-500/10 text-red-400 rounded-xl min-w-[80px] hover:bg-red-500/20"
      >
        <X className="w-5 h-5 mb-1" />
        <span className="text-xs font-medium">Clear</span>
      </button>
    </div>
  );
}
