import React from 'react';
import { Home, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

const pageNames = {
  'AdminDashboard': 'Dashboard',
  'Analytics': 'Analytics & Tracking',
  'LeadManager': 'Management Lead-uri',
  'DealManager': 'Pipeline Vânzări',
  'ActivityManager': 'Management Activități',
  'ContactManager': 'Management Contacte',
  'ProductManager': 'Management Produse',
  'MaterialManager': 'Management Materiale',
  'SubMaterialManager': 'Sub-Materiale',
  'ColorManager': 'Management Culori',
  'GlazingManager': 'Management Sticlă',
  'AccessoryManager': 'Management Accesorii',
  'PresetDimensionManager': 'Management Dimensiuni',
  'PromotionManager': 'Promoții',
  'PaymentProcessorManager': 'Procesatori Plăți',
  'UserManager': 'Utilizatori',
  'AdminLogs': 'Jurnal Admin',
  'ContentManager': 'Management Conținut',
  'CompanySettingsManager': 'Date Companie',
  'EmailTemplateManager': 'Template-uri Email',
  'InstallationCompanyManager': 'Companii Montaj',
  'OrderManager': 'Comenzi'
};

export default function Breadcrumbs({ currentPageName }) {
  const displayName = pageNames[currentPageName] || currentPageName;

  return (
    <nav className="mb-6 flex items-center gap-2 text-sm bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl px-4 py-3 rounded-2xl border border-gray-100 dark:border-slate-700">
      <Link 
        to={createPageUrl('AdminDashboard')} 
        className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300 hover:text-green-600 dark:hover:text-green-400 transition-colors"
      >
        <Home className="w-4 h-4" />
        <span className="font-medium">Dashboard</span>
      </Link>
      
      {currentPageName !== 'AdminDashboard' && (
        <>
          <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-gray-100">{displayName}</span>
        </>
      )}
    </nav>
  );
}