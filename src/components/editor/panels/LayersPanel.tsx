import React, { useEffect, useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { fabric } from 'fabric';
import { ArrowUp, ArrowDown, Trash2, Lock, Unlock } from 'lucide-react';
import { cn } from '../../../lib/utils';

export default function LayersPanel() {
  const { canvas, activeObject, setActiveObject } = useAppStore();
  const [layers, setLayers] = useState<fabric.Object[]>([]);

  const updateLayers = () => {
    if (!canvas) return;
    setLayers([...canvas.getObjects()].reverse());
  };

  useEffect(() => {
    if (!canvas) return;
    updateLayers();
    canvas.on('object:added', updateLayers);
    canvas.on('object:removed', updateLayers);
    canvas.on('object:modified', updateLayers);
    return () => {
      canvas.off('object:added', updateLayers);
      canvas.off('object:removed', updateLayers);
      canvas.off('object:modified', updateLayers);
    };
  }, [canvas]);

  const handleSelect = (obj: fabric.Object) => {
    if (!canvas) return;
    canvas.setActiveObject(obj);
    canvas.renderAll();
  };

  const handleMoveUp = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.bringForward(obj);
    updateLayers();
  };

  const handleMoveDown = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.sendBackwards(obj);
    updateLayers();
  };

  const handleDelete = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    if (!canvas) return;
    canvas.remove(obj);
    canvas.discardActiveObject();
  };

  const handleToggleLock = (e: React.MouseEvent, obj: fabric.Object) => {
    e.stopPropagation();
    if (!canvas) return;
    const isLocked = obj.lockMovementX;
    obj.set({
      lockMovementX: !isLocked,
      lockMovementY: !isLocked,
      lockRotation: !isLocked,
      lockScalingX: !isLocked,
      lockScalingY: !isLocked,
      selectable: isLocked,
    });
    canvas.renderAll();
    updateLayers();
  };

  return (
    <div className="absolute top-0 right-0 w-64 h-full bg-zinc-900/95 backdrop-blur border-l border-zinc-800 flex flex-col z-10 shadow-2xl">
      <div className="p-4 border-b border-zinc-800">
        <h3 className="font-semibold text-zinc-200">Layers</h3>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {layers.length === 0 && (
          <div className="text-center p-4 text-zinc-500 text-sm">No layers</div>
        )}
        {layers.map((layer, i) => {
          const isSelected = activeObject === layer;
          const isText = layer.type === 'i-text';
          const name = isText ? (layer as fabric.IText).text?.substring(0, 15) : layer.type;
          const isLocked = layer.lockMovementX;

          return (
            <div 
              key={i}
              onClick={() => handleSelect(layer)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors",
                isSelected ? "bg-indigo-500/20 border border-indigo-500/30" : "bg-zinc-800/50 hover:bg-zinc-800"
              )}
            >
              <span className="text-sm font-medium text-zinc-300 truncate flex-1">{name || 'Object'}</span>
              <div className="flex items-center gap-1">
                <button onClick={(e) => handleToggleLock(e, layer)} className="p-1.5 text-zinc-500 hover:text-zinc-300">
                  {isLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                </button>
                <button onClick={(e) => handleMoveUp(e, layer)} className="p-1.5 text-zinc-500 hover:text-zinc-300">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => handleMoveDown(e, layer)} className="p-1.5 text-zinc-500 hover:text-zinc-300">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button onClick={(e) => handleDelete(e, layer)} className="p-1.5 text-red-400/70 hover:text-red-400">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
