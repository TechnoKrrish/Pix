import { useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import { getFonts, getProjects } from './lib/db';
import SplashScreen from './components/SplashScreen';
import HomeScreen from './components/HomeScreen';
import EditorScreen from './components/editor/EditorScreen';

export default function App() {
  const { currentScreen, setScreen, setCustomFonts, setProjects } = useAppStore();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [fonts, projects] = await Promise.all([getFonts(), getProjects()]);
        
        for (const font of fonts) {
          const fontFace = new FontFace(font.name, `url(${font.dataUrl})`);
          await fontFace.load();
          document.fonts.add(fontFace);
        }

        setCustomFonts(fonts);
        setProjects(projects);
      } catch (e) {
        console.error('Failed to load local data', e);
      }
      
      setTimeout(() => {
        setScreen('home');
      }, 1500);
    };

    loadData();
  }, [setCustomFonts, setProjects, setScreen]);

  return (
    <div className="w-full h-[100dvh] bg-zinc-950 text-zinc-100 overflow-hidden font-sans">
      {currentScreen === 'splash' && <SplashScreen />}
      {currentScreen === 'home' && <HomeScreen />}
      {currentScreen === 'editor' && <EditorScreen />}
    </div>
  );
}
