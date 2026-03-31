import { useEffect, useRef, useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { fabric } from 'fabric';
import { ArrowLeft, Save, Undo, Redo, Layers, Download } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { saveProject, getProjects } from '../../lib/db';
import BottomBar from './BottomBar';
import TextPanel from './panels/TextPanel';
import FontPanel from './panels/FontPanel';
import BackgroundPanel from './panels/BackgroundPanel';
import LayersPanel from './panels/LayersPanel';
import ImagePanel from './panels/ImagePanel';

export default function EditorScreen() {
  const { setScreen, setCanvas, currentProjectId, projects, setProjects, activePanel, setActivePanel, setActiveObject } = useAppStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const initCanvas = () => {
      const container = containerRef.current!;
      const size = Math.min(container.clientWidth, container.clientHeight) - 40;

      const canvas = new fabric.Canvas(canvasRef.current, {
        width: size,
        height: size,
        backgroundColor: '#ffffff',
        preserveObjectStacking: true,
      });

      setCanvas(canvas);

      if (currentProjectId) {
        const project = projects.find(p => p.id === currentProjectId);
        if (project) {
          canvas.loadFromJSON(project.canvasData, () => {
            canvas.getObjects('i-text').forEach(obj => {
              (obj as fabric.IText).set('editable', false);
              // Ensure legacy fonts have their unicodeText preserved if missing
              if (!(obj as any).unicodeText) {
                (obj as any).set('unicodeText', (obj as fabric.IText).text);
              }
            });
            canvas.renderAll();
            saveHistory(canvas);
          });
        }
      } else {
        saveHistory(canvas);
      }

      canvas.on('selection:created', (e) => setActiveObject(e.selected?.[0] || null));
      canvas.on('selection:updated', (e) => setActiveObject(e.selected?.[0] || null));
      canvas.on('selection:cleared', () => setActiveObject(null));
      
      canvas.on('object:modified', () => saveHistory(canvas));
      canvas.on('object:added', () => saveHistory(canvas));
      canvas.on('object:removed', () => saveHistory(canvas));

      return canvas;
    };

    const canvas = initCanvas();

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      const size = Math.min(containerRef.current.clientWidth, containerRef.current.clientHeight) - 40;
      const scale = size / canvas.width!;
      
      canvas.setDimensions({ width: size, height: size });
      
      const objects = canvas.getObjects();
      for (let i in objects) {
        const obj = objects[i];
        obj.scaleX = obj.scaleX! * scale;
        obj.scaleY = obj.scaleY! * scale;
        obj.left = obj.left! * scale;
        obj.top = obj.top! * scale;
        obj.setCoords();
      }
      canvas.renderAll();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.dispose();
      setCanvas(null);
    };
  }, []);

  const saveHistory = (canvas: fabric.Canvas) => {
    if (!canvas) return;
    const json = JSON.stringify(canvas.toJSON(['unicodeText', 'fontEncoding']));
    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(json);
      if (newHistory.length > 20) newHistory.shift();
      return newHistory;
    });
    setHistoryIndex(prev => Math.min(prev + 1, 19));
  };

  const handleUndo = () => {
    const canvas = useAppStore.getState().canvas;
    if (!canvas || historyIndex <= 0) return;
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.getObjects('i-text').forEach(obj => (obj as fabric.IText).set('editable', false));
      canvas.renderAll();
    });
  };

  const handleRedo = () => {
    const canvas = useAppStore.getState().canvas;
    if (!canvas || historyIndex >= history.length - 1) return;
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    canvas.loadFromJSON(history[newIndex], () => {
      canvas.getObjects('i-text').forEach(obj => (obj as fabric.IText).set('editable', false));
      canvas.renderAll();
    });
  };

  const handleSave = async () => {
    const canvas = useAppStore.getState().canvas;
    if (!canvas) return;
    
    const id = currentProjectId || uuidv4();
    const name = currentProjectId ? projects.find(p => p.id === id)?.name || 'Untitled' : `Project ${projects.length + 1}`;
    
    const project = {
      id,
      name,
      canvasData: JSON.stringify(canvas.toJSON(['unicodeText', 'fontEncoding'])),
      previewUrl: canvas.toDataURL({ format: 'png', multiplier: 0.5 }),
      lastModified: Date.now(),
    };

    await saveProject(project);
    const updatedProjects = await getProjects();
    setProjects(updatedProjects);
    // Optional: add a non-blocking toast here instead of alert
  };

  const handleExport = () => {
    const canvas = useAppStore.getState().canvas;
    if (!canvas) return;
    
    canvas.discardActiveObject();
    canvas.renderAll();
    
    const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 3 });
    const link = document.createElement('a');
    link.download = `PixelLab_Export_${Date.now()}.png`;
    link.href = dataUrl;
    link.click();
  };

  return (
    <div className="w-full h-full flex flex-col bg-zinc-950">
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <button onClick={() => setScreen('home')} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 disabled:opacity-50">
            <Undo className="w-5 h-5" />
          </button>
          <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400 disabled:opacity-50">
            <Redo className="w-5 h-5" />
          </button>
          <button onClick={() => setActivePanel(activePanel === 'layers' ? null : 'layers')} className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400">
            <Layers className="w-5 h-5" />
          </button>
          <button onClick={handleSave} className="p-2 rounded-full hover:bg-zinc-800 text-indigo-400">
            <Save className="w-5 h-5" />
          </button>
          <button onClick={handleExport} className="p-2 rounded-full bg-indigo-500 text-white hover:bg-indigo-600">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative flex items-center justify-center overflow-hidden" ref={containerRef}>
        <div className="shadow-2xl shadow-black/50 bg-white/5 bg-checkered">
          <canvas ref={canvasRef} />
        </div>
        
        {activePanel === 'layers' && <LayersPanel />}
      </main>

      {activePanel === 'text' && <TextPanel />}
      {activePanel === 'fonts' && <FontPanel />}
      {activePanel === 'image' && <ImagePanel />}
      {activePanel === 'background' && <BackgroundPanel />}

      <BottomBar />
    </div>
  );
}
