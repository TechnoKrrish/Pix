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
            let fontFace: FontFace | null = null;

            if (font.data instanceof Blob) {
              // Try ArrayBuffer first (most reliable for binary data)
              try {
                const buffer = await font.data.arrayBuffer();
                fontFace = new FontFace(font.name, buffer);
                document.fonts.add(fontFace);
                await fontFace.load();
              } catch (e) {
                console.warn(`Startup: ArrayBuffer failed for ${font.name}, trying Blob URL...`, e);
                // Fallback to Blob URL
                fontUrl = URL.createObjectURL(font.data);
                fontFace = new FontFace(font.name, `url(${fontUrl})`);
                document.fonts.add(fontFace);
                await fontFace.load();
              }
            } else if (typeof (font as any).dataUrl === 'string') {
              // Backward compatibility for old dataUrl format
              fontUrl = (font as any).dataUrl;
              fontFace = new FontFace(font.name, `url(${fontUrl})`);
              document.fonts.add(fontFace);
              await fontFace.load();
            }
          } catch (err) {
            console.error(`Failed to load font ${font.name} on startup:`, err);
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
