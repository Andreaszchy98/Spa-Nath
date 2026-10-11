import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, switchRole, theme, businessProfile, setCustomerTab } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>(currentUser.role);
  // Admin PIN / password field
  const [adminPin, setAdminPin] = useState('1234');
  const [pinError, setPinError] = useState('');

  if (!isOpen) return null;

  const handleSelectClient = () => {
    switchRole('client');
    setCustomerTab('catalogo');
    onClose();
  };

  const handleLoginAsAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin.trim() !== '1234' && adminPin.trim() !== 'admin' && adminPin.trim() !== '') {
      setPinError('PIN incorrecto. Usa 1234 o admin');
      return;
    }

    setPinError('');
    switchRole('admin');
    onClose();
  };

  const isCurrentAdmin = currentUser.role === 'admin';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden relative shrink-0">
              <span>{businessProfile.name ? businessProfile.name.charAt(0).toUpperCase() : 'N'}</span>
              {businessProfile.logoUrl && (
                <img
                  src={businessProfile.logoUrl}
                  alt={businessProfile.name || 'Negocio'}
                  className="absolute inset-0 w-full h-full object-cover bg-white"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-sm sm:text-base tracking-tight">
                Selector de Perfil & Acceso
              </h3>
              <p className="text-[11px] text-slate-500">
                Selecciona tu modalidad de acceso a {businessProfile.name || 'la plataforma'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current status pill */}
        <div className="px-5 pt-4 pb-2">
          <div className="p-3 bg-slate-100 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-slate-500 font-medium">Modo activo actualmente:</span>
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              {isCurrentAdmin ? (
                <>
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Administrador</span>
                </>
              ) : (
                <>
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Cliente ({currentUser.name || 'Mariana'})</span>
                </>
              )}
            </span>
          </div>
        </div>

        {/* Role Selector Tabs inside modal */}
        <div className="px-5 pt-2">
          <div className="p-1 bg-slate-100 rounded-2xl flex items-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('client');
                setPinError('');
              }}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'client'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <User className="w-4 h-4 text-emerald-600" />
              <span>Cliente</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedRole('admin');
                setPinError('');
              }}
              className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Administrador</span>
            </button>
          </div>
        </div>

        {/* Pure Role Switcher Actions (NO profile inputs here!) */}
        <div className="p-5">
          {selectedRole === 'client' ? (
            /* Client Mode Selection */
            <div className="space-y-4 text-xs">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl text-emerald-950 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-900">
                  <User className="w-4 h-4 text-emerald-600" />
                  <span>Modo Comprador / Cliente</span>
                </div>
                <p className="text-[11px] leading-relaxed text-emerald-800">
                  Navega el catálogo, personaliza tus productos y servicios, y realiza pedidos exclusivos para recoger en tienda con pago en efectivo.
                </p>
                <div className="pt-2 text-[10px] text-emerald-700/90 font-medium">
                  Nota: Puedes editar tus datos personales de contacto directamente en la sección <strong>Perfil</strong> de la barra inferior.
                </div>
              </div>

              <button
                type="button"
                onClick={handleSelectClient}
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${theme.buttonClass}`}
              >
                <span>Acceder como Cliente</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Admin Mode Selection */
            <form onSubmit={handleLoginAsAdmin} className="space-y-4 text-xs">
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/60 rounded-2xl text-indigo-950 space-y-1">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-900">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Panel Administrativo (Gerencia)</span>
                </div>
                <p className="text-[11px] leading-relaxed text-indigo-800">
                  Acceso con PIN de seguridad para gestionar ventas, pedidos en cocina, inventario central, catálogo y configuración comercial.
                </p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Código PIN de Acceso
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={adminPin}
                    onChange={(e) => {
                      setAdminPin(e.target.value);
                      setPinError('');
                    }}
                    placeholder="Ingresa PIN (1234)"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs sm:text-sm bg-white font-mono"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  PIN por defecto: <code className="font-bold text-slate-700">1234</code> o <code className="font-bold text-slate-700">admin</code>
                </p>
                {pinError && (
                  <p className="text-[11px] text-rose-600 font-semibold mt-1">
                    {pinError}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className={`w-full py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-95 ${theme.buttonClass}`}
              >
                <span>Acceder al Panel de Administrador</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
