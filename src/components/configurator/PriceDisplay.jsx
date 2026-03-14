import React from 'react';
import { motion } from 'framer-motion';

export default function PriceDisplay({ price }) {
  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center"
    >
      <span className="text-sm text-slate-600 mb-1">Preț estimat</span>
      <p className="text-3xl font-bold text-blue-700">
        {price.toLocaleString('ro-RO', { style: 'currency', currency: 'RON' })}
      </p>
    </motion.div>
  );
}