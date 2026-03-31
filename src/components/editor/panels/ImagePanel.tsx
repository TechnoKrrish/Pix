import React, { useRef } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { fabric } from 'fabric';
import { Image as ImageIcon, Trash2, Copy } from 'lucide-react';

export default function ImagePanel() {
  const { canvas, activeObject } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !canvas) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      fabric.Image.fromURL(dataUrl, (img) => {
        const maxDim = Math.min(canvas.width!, canvas.height!) * 0.8;
        if (img.width! > maxDim || img.height! > maxDim) {
          const scale = maxDim / Math.max(img.width!, img.height!);
          img.scale(scale);
        }

        img.set({
          left: canvas.width! / 2,
          top: canvas.height! / 2,
          originX: 'center',
          originY: 'center',
        });

        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsDataURL(file);
  };

  const updateProperty = (key: string, value: any) => {
    if (!canvas || !activeObject) return;
    activeObject.set(key as keyof fabric.Object, value);
    canvas.renderAll();
  };

  const handleDelete = () => {
    if (!canvas || !activeObject) return;
    canvas.remove(activeObject);
    canvas.discardActiveObject();
    canvas.renderAll();
  };

  const handleDuplicate = () => {
    if (!canvas || !activeObject) return;
    activeObject.clone((cloned: fabric.Object) => {
      cloned.set({
        left: cloned.left! + 20,
        top: cloned.top! + 20,
      });
      canvas.add(cloned);
      canvas.setActiveObject(cloned);
      canvas.renderAll();
    });
  };

  const isImage = activeObject && activeObject.type === 'image';

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 overflow-x-auto whitespace-nowrap flex items-center gap-4 scrollbar-hide">
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="flex flex-col items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 rounded-xl min-w-[80px]"
      >
        <ImageIcon className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Add Image</span>
      </button>
      <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleAddImage} />

      {isImage && (
        <>
          <div className="w-px h-10 bg-zinc-800 mx-2" />
          
          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">Opacity</span>
            <input 
              type="range" min="0" max="1" step="0.01"
              value={activeObject.get('opacity') ?? 1}
              onChange={(e) => updateProperty('opacity', parseFloat(e.target.value))}
              className="w-24"
            />
          </div>

          <div className="w-px h-10 bg-zinc-800 mx-2" />

          <button onClick={handleDuplicate} className="p-3 bg-zinc-800/50 text-zinc-300 rounded-xl hover:bg-zinc-800">
            <Copy className="w-5 h-5" />
          </button>
          <button onClick={handleDelete} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20">
            <Trash2 className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
}
