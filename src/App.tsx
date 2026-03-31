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
          try {
            let fontData: ArrayBuffer;
            if (font.data instanceof Blob) {
              fontData = await font.data.arrayBuffer();
            } else if (typeof (font as any).dataUrl === 'string') {
              // Backward compatibility for old dataUrl format
              const base64 = (font as any).dataUrl.split(',')[1];
              const binary = atob(base64);
              const bytes = new Uint8Array(binary.length);
              for (let i = 0; i < binary.length; i++) {
                bytes[i] = binary.charCodeAt(i);
              }
              fontData = bytes.buffer;
            } else {
              continue;
            }

            const fontFace = new FontFace(font.name, fontData);
            await fontFace.load();
            document.fonts.add(fontFace);
          } catch (err) {
            console.error(`Failed to load font ${font.name}:`, err);
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
