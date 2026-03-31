import React from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { fabric } from 'fabric';
import { Type, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Trash2, Copy } from 'lucide-react';

export default function TextPanel() {
  const { canvas, activeObject } = useAppStore();

  const handleAddText = () => {
    if (!canvas) return;
    const text = new fabric.IText('New Text', {
      left: canvas.width! / 2,
      top: canvas.height! / 2,
      fontFamily: 'sans-serif',
      fill: '#000000',
      fontSize: 40,
      originX: 'center',
      originY: 'center',
    });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
  };

  const updateProperty = (key: string, value: any) => {
    if (!canvas || !activeObject) return;
    activeObject.set(key as keyof fabric.Object, value);
    canvas.renderAll();
  };

  const toggleProperty = (key: string, onValue: any, offValue: any) => {
    if (!canvas || !activeObject) return;
    const current = activeObject.get(key as keyof fabric.Object);
    activeObject.set(key as keyof fabric.Object, current === onValue ? offValue : onValue);
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

  const isText = activeObject && activeObject.type === 'i-text';

  return (
    <div className="bg-zinc-900 border-t border-zinc-800 p-4 overflow-x-auto whitespace-nowrap flex items-center gap-4 scrollbar-hide">
      <button onClick={handleAddText} className="flex flex-col items-center justify-center p-3 bg-indigo-500/10 text-indigo-400 rounded-xl min-w-[80px]">
        <Type className="w-6 h-6 mb-1" />
        <span className="text-xs font-medium">Add Text</span>
      </button>

      {isText && (
        <>
          <div className="w-px h-10 bg-zinc-800 mx-2" />
          
          <div className="flex flex-col gap-1 min-w-[150px]">
            <span className="text-[10px] text-zinc-500 uppercase">Text</span>
            <input 
              type="text" 
              value={(activeObject as fabric.IText).text || ''} 
              onChange={(e) => updateProperty('text', e.target.value)}
              className="bg-zinc-800 text-white px-2 py-1.5 rounded text-sm border border-zinc-700 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="w-px h-10 bg-zinc-800 mx-2" />

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">Color</span>
            <input 
              type="color" 
              value={(activeObject.get('fill') as string) || '#000000'} 
              onChange={(e) => updateProperty('fill', e.target.value)}
              className="w-8 h-8 rounded cursor-pointer bg-transparent border-0 p-0"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">Size</span>
            <input 
              type="range" min="10" max="200" 
              value={(activeObject as fabric.IText).get('fontSize') || 40}
              onChange={(e) => updateProperty('fontSize', parseInt(e.target.value))}
              className="w-24"
            />
          </div>

          <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg">
            <button onClick={() => toggleProperty('fontWeight', 'bold', 'normal')} className={`p-2 rounded ${(activeObject as fabric.IText).get('fontWeight') === 'bold' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}><Bold className="w-4 h-4" /></button>
            <button onClick={() => toggleProperty('fontStyle', 'italic', 'normal')} className={`p-2 rounded ${(activeObject as fabric.IText).get('fontStyle') === 'italic' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}><Italic className="w-4 h-4" /></button>
            <button onClick={() => toggleProperty('underline', true, false)} className={`p-2 rounded ${(activeObject as fabric.IText).get('underline') ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}><Underline className="w-4 h-4" /></button>
          </div>

          <div className="flex items-center gap-1 bg-zinc-800/50 p-1 rounded-lg">
            <button onClick={() => updateProperty('textAlign', 'left')} className={`p-2 rounded ${(activeObject as fabric.IText).get('textAlign') === 'left' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}><AlignLeft className="w-4 h-4" /></button>
            <button onClick={() => updateProperty('textAlign', 'center')} className={`p-2 rounded ${(activeObject as fabric.IText).get('textAlign') === 'center' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}><AlignCenter className="w-4 h-4" /></button>
            <button onClick={() => updateProperty('textAlign', 'right')} className={`p-2 rounded ${(activeObject as fabric.IText).get('textAlign') === 'right' ? 'bg-zinc-700 text-white' : 'text-zinc-400'}`}><AlignRight className="w-4 h-4" /></button>
          </div>

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

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">Stroke</span>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={(activeObject.get('stroke') as string) || '#000000'} 
                onChange={(e) => updateProperty('stroke', e.target.value)}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input 
                type="range" min="0" max="20" 
                value={activeObject.get('strokeWidth') || 0}
                onChange={(e) => updateProperty('strokeWidth', parseInt(e.target.value))}
                className="w-16"
              />
            </div>
          </div>

          <div className="w-px h-10 bg-zinc-800 mx-2" />

          <div className="flex flex-col gap-1">
            <span className="text-[10px] text-zinc-500 uppercase">Shadow</span>
            <div className="flex items-center gap-2">
              <input 
                type="color" 
                value={(activeObject.get('shadow') as fabric.Shadow)?.color || '#000000'} 
                onChange={(e) => {
                  const currentShadow = activeObject.get('shadow') as fabric.Shadow;
                  const newShadow = new fabric.Shadow({
                    color: e.target.value,
                    blur: currentShadow?.blur || 10,
                    offsetX: currentShadow?.offsetX || 5,
                    offsetY: currentShadow?.offsetY || 5,
                  });
                  updateProperty('shadow', newShadow);
                }}
                className="w-6 h-6 rounded cursor-pointer bg-transparent border-0 p-0"
              />
              <input 
                type="range" min="0" max="50" 
                value={(activeObject.get('shadow') as fabric.Shadow)?.blur || 0}
                onChange={(e) => {
                  const currentShadow = activeObject.get('shadow') as fabric.Shadow;
                  const newShadow = new fabric.Shadow({
                    color: currentShadow?.color || '#000000',
                    blur: parseInt(e.target.value),
                    offsetX: currentShadow?.offsetX || 5,
                    offsetY: currentShadow?.offsetY || 5,
                  });
                  updateProperty('shadow', newShadow);
                }}
                className="w-16"
              />
            </div>
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
