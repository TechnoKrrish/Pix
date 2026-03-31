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
            const dataUrl = await new Promise<string>((resolve) => {
              const r = new FileReader();
              r.onload = () => resolve(r.result as string);
              r.readAsDataURL(font.data);
            });

            const styleId = `font-style-${font.name}`;
            let styleTag = document.getElementById(styleId) as HTMLStyleElement;
            if (!styleTag) {
              styleTag = document.createElement('style');
              styleTag.id = styleId;
              document.head.appendChild(styleTag);
            }
            
            styleTag.textContent = `
              @font-face {
                font-family: "${font.name}";
                src: url("${dataUrl}");
                font-display: swap;
              }
            `;

            // Silently load
            document.fonts.load(`1em "${font.name}"`).catch(() => {});
          } catch (err) {
            console.error(`Failed to inject font ${font.name} on startup:`, err);
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
