import { Type, Image as ImageIcon, Palette, ImagePlus } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { cn } from '../../lib/utils';

export default function BottomBar() {
  const { activePanel, setActivePanel } = useAppStore();

  const tabs = [
    { id: 'text', icon: Type, label: 'Text' },
    { id: 'fonts', icon: Palette, label: 'Fonts' },
    { id: 'image', icon: ImagePlus, label: 'Image' },
    { id: 'background', icon: ImageIcon, label: 'Background' },
  ];

  return (
    <div className="flex items-center justify-around p-2 bg-zinc-900 border-t border-zinc-800 pb-safe">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => setActivePanel(activePanel === tab.id ? null : tab.id)}
          className={cn(
            "flex flex-col items-center justify-center p-3 rounded-xl min-w-[80px] transition-colors",
            activePanel === tab.id ? "text-indigo-400 bg-indigo-500/10" : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
          )}
        >
          <tab.icon className="w-6 h-6 mb-1" />
          <span className="text-xs font-medium">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}
