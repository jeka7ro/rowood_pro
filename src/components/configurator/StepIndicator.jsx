import React from 'react';
import { motion } from 'framer-motion';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex justify-between items-center max-w-3xl mx-auto p-2 bg-white rounded-full shadow-md border border-slate-200/80">
      {steps.map((step, index) => (
        <div key={step.id} className="flex-1 flex flex-col items-center relative">
          <div className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
              currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'
            }`}>
              {step.id}
            </div>
          </div>
          <p className={`mt-2 text-xs md:text-sm text-center font-medium transition-all duration-300 ${
            currentStep === step.id ? 'text-blue-700' : 'text-slate-500'
          }`}>
            {step.name}
          </p>
          {index < steps.length - 1 && (
            <div className="absolute top-4 left-1/2 w-full h-0.5 bg-slate-200 -z-10">
              <motion.div 
                className="h-full bg-blue-600"
                initial={{ width: 0 }}
                animate={{ width: currentStep > step.id ? '100%' : '0%' }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}