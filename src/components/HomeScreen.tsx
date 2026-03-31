import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Plus, Image as ImageIcon, Settings, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { deleteProject } from '../lib/db';

export default function HomeScreen() {
  const { setScreen, projects, setProjects, setCurrentProjectId } = useAppStore();

  const handleNewProject = () => {
    setCurrentProjectId(null);
    setScreen('editor');
  };

  const handleOpenProject = (id: string) => {
    setCurrentProjectId(id);
    setScreen('editor');
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteProject(id);
    setProjects(projects.filter(p => p.id !== id));
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="w-full h-full flex flex-col bg-zinc-950"
    >
      <header className="flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-900/50">
        <h1 className="text-xl font-bold text-white">PixelLab Web</h1>
        <button className="p-2 rounded-full hover:bg-zinc-800 text-zinc-400">
          <Settings className="w-5 h-5" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <button 
            onClick={handleNewProject}
            className="flex flex-col items-center justify-center p-6 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl hover:bg-indigo-500/20 transition-colors"
          >
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="font-medium text-indigo-400">New Design</span>
          </button>
          
          <button 
            onClick={() => {
              setCurrentProjectId(null);
              setScreen('editor');
              // We could pass a template ID here, but for now just start new
            }}
            className="flex flex-col items-center justify-center p-6 bg-zinc-900 border border-zinc-800 rounded-2xl hover:bg-zinc-800 transition-colors"
          >
            <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center mb-3">
              <ImageIcon className="w-6 h-6 text-zinc-400" />
            </div>
            <span className="font-medium text-zinc-400">Templates</span>
          </button>
        </div>

        <h2 className="text-lg font-semibold text-zinc-200 mb-4">Recent Projects</h2>
        
        {projects.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p>No recent projects.</p>
            <p className="text-sm">Create a new design to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {projects.map(p => (
              <div 
                key={p.id} 
                onClick={() => handleOpenProject(p.id)}
                className="group relative bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 cursor-pointer hover:border-zinc-700 transition-colors"
              >
                <div className="aspect-square bg-zinc-800">
                  {p.previewUrl ? (
                    <img src={p.previewUrl} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600">No Preview</div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-medium text-zinc-200 truncate">{p.name}</h3>
                  <p className="text-xs text-zinc-500">{new Date(p.lastModified).toLocaleDateString()}</p>
                </div>
                <button 
                  onClick={(e) => handleDelete(e, p.id)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-lg text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </motion.div>
  );
}
