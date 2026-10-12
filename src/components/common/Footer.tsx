import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  const { businessProfile } = useApp();

  return (
    <footer className="w-full bg-slate-900 text-slate-400 py-8 px-4 mt-12 border-t border-slate-800 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <p className="font-extrabold text-white text-sm">
            {businessProfile.name || 'Plataforma de Gestión y Citas'}
          </p>
          <p className="text-[11px] text-slate-400">
            {businessProfile.address || 'Gestión integral de inventario, logística y ventas.'}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:text-white transition-colors flex items-center gap-1.5 font-medium underline"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Aviso de Privacidad</span>
          </button>
          <span className="text-slate-700">|</span>
          <span className="text-[11px]">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
};
