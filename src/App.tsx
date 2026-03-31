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
          let fontUrl: string | null = null;
          try {
            if (font.data instanceof Blob) {
              fontUrl = URL.createObjectURL(font.data);
            } else if (typeof (font as any).dataUrl === 'string') {
              // Backward compatibility for old dataUrl format
              fontUrl = (font as any).dataUrl;
            } else {
              continue;
            }

            const fontFace = new FontFace(font.name, `url(${fontUrl})`);
            await fontFace.load();
            document.fonts.add(fontFace);
            
            // Note: We don't revokeObjectURL here because the font needs the URL to stay active in some browsers
            // until it's fully rendered. We'll let the browser handle it or revoke it later if needed.
          } catch (err) {
            console.error(`Failed to load font ${font.name}:`, err);
            if (fontUrl && fontUrl.startsWith('blob:')) URL.revokeObjectURL(fontUrl);
          }
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
