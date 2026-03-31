import { openDB, DBSchema } from 'idb';

export interface CustomFont {
  id: string;
  name: string;
  displayName?: string;
  data: Blob;
  addedAt: number;
}

export interface Project {
  id: string;
  name: string;
  canvasData: string;
  previewUrl: string;
  lastModified: number;
}

interface PixelLabDB extends DBSchema {
  fonts: {
    key: string;
    value: CustomFont;
  };
  projects: {
    key: string;
    value: Project;
  };
}

export const initDB = async () => {
  return openDB<PixelLabDB>('PixelLabCloneDB', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('fonts')) {
        db.createObjectStore('fonts', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('projects')) {
        db.createObjectStore('projects', { keyPath: 'id' });
      }
    },
  });
};

export const saveFont = async (font: CustomFont) => {
  const db = await initDB();
  await db.put('fonts', font);
};

export const getFonts = async () => {
  const db = await initDB();
  return db.getAll('fonts');
};

export const deleteFont = async (id: string) => {
  const db = await initDB();
  await db.delete('fonts', id);
};

export const saveProject = async (project: Project) => {
  const db = await initDB();
  await db.put('projects', project);
};

export const getProjects = async () => {
  const db = await initDB();
  return db.getAll('projects');
};

export const deleteProject = async (id: string) => {
  const db = await initDB();
  await db.delete('projects', id);
};
