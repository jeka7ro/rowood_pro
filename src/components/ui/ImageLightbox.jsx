import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function ImageLightbox({ src, alt, onClose }) {
  if (!src) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative max-w-4xl max-h-[90vh]"
          onClick={(e) => e.stopPropagation()}
        >
          <img src={src} alt={alt} className="w-full h-full object-contain rounded-lg shadow-2xl" />
          <button
            onClick={onClose}
            className="absolute -top-3 -right-3 bg-white rounded-full p-2 text-slate-700 hover:bg-slate-200 transition-all shadow-lg"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}