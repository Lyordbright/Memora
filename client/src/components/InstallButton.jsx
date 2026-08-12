import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Share, X, Plus } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall.js';

export default function InstallButton() {
  const { canOfferInstall, canPromptDirectly, isIos, promptInstall } = usePwaInstall();
  const [showIosSteps, setShowIosSteps] = useState(false);

  if (!canOfferInstall) return null;

  const handleClick = () => {
    if (canPromptDirectly) {
      promptInstall();
    } else if (isIos) {
      setShowIosSteps(true);
    }
  };

  return (
    <>
      <motion.button
        onClick={handleClick}
        initial={{ opacity: 0, y: 30, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 1.2, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.97 }}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-brand-gradient text-white font-semibold text-sm pl-4 pr-5 py-3 rounded-full shadow-glow"
      >
        <Download size={16} />
        Download App
      </motion.button>

      <AnimatePresence>
        {showIosSteps && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowIosSteps(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface border border-white/10 rounded-2xl p-6 max-w-sm w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-lg">Add Memora to your Home Screen</h3>
                <button onClick={() => setShowIosSteps(false)} className="text-mist/40 hover:text-mist">
                  <X size={18} />
                </button>
              </div>
              <ol className="space-y-3 text-sm text-mist/70">
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-bright/15 text-blue-bright flex items-center justify-center text-xs font-semibold shrink-0">1</span>
                  Tap the <Share size={14} className="inline mx-1" /> Share button in Safari
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-bright/15 text-blue-bright flex items-center justify-center text-xs font-semibold shrink-0">2</span>
                  Scroll down and tap <Plus size={14} className="inline mx-1" /> "Add to Home Screen"
                </li>
                <li className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-bright/15 text-blue-bright flex items-center justify-center text-xs font-semibold shrink-0">3</span>
                  Tap "Add" — Memora opens like a regular app from now on
                </li>
              </ol>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
