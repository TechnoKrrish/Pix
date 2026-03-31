import { motion } from 'framer-motion';
import { Palette } from 'lucide-react';

export default function SplashScreen() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-950">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-24 h-24 bg-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-6">
          <Palette className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">PixelLab Web</h1>
        <p className="text-zinc-400 text-sm">Professional Design Editor</p>
      </motion.div>
    </div>
  );
}
