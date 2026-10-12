import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FooterProps {
  onOpenPrivacy: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacy }) => {
  const { businessProfile, theme } = useApp();

  return (
    <footer className="w-full bg-slate-50 text-slate-600 py-6 px-4 mt-12 border-t border-slate-200 text-xs">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="space-y-1">
          <p className="font-bold text-slate-800 text-sm">
            {businessProfile.name || 'Plataforma de Gestión y Citas'}
          </p>
          <p className="text-[11px] text-slate-500">
            {businessProfile.address || 'Gestión integral de inventario y ventas.'}
          </p>
        </div>

        <div className="flex items-center gap-4 flex-wrap justify-center">
          <button
            type="button"
            onClick={onOpenPrivacy}
            className="hover:underline transition-colors flex items-center gap-1.5 font-medium"
            style={{ color: theme.raw.primaryBtn }}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Aviso de Privacidad</span>
          </button>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] text-slate-400">
            © {new Date().getFullYear()} Todos los derechos reservados.
          </span>
        </div>
      </div>
    </footer>
  );
};
