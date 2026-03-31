import { create } from 'zustand';
import { fabric } from 'fabric';
import { CustomFont, Project } from '../lib/db';

type Screen = 'splash' | 'home' | 'editor' | 'settings';

interface AppState {
  currentScreen: Screen;
  setScreen: (screen: Screen) => void;
  
  canvas: fabric.Canvas | null;
  setCanvas: (canvas: fabric.Canvas | null) => void;
  
  activeObject: fabric.Object | null;
  setActiveObject: (obj: fabric.Object | null) => void;

  activePanel: string | null;
  setActivePanel: (panel: string | null) => void;

  customFonts: CustomFont[];
  setCustomFonts: (fonts: CustomFont[]) => void;

  projects: Project[];
  setProjects: (projects: Project[]) => void;

  currentProjectId: string | null;
  setCurrentProjectId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentScreen: 'splash',
  setScreen: (screen) => set({ currentScreen: screen }),
  
  canvas: null,
  setCanvas: (canvas) => set({ canvas }),
  
  activeObject: null,
  setActiveObject: (obj) => set({ activeObject: obj }),

  activePanel: null,
  setActivePanel: (panel) => set({ activePanel: panel }),

  customFonts: [],
  setCustomFonts: (fonts) => set({ customFonts: fonts }),

  projects: [],
  setProjects: (projects) => set({ projects }),

  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
}));
