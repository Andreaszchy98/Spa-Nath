import React, { useState } from 'react';
import { ShieldCheck, CheckCircle2, FileText, Lock } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const FirstLoginConsentModal: React.FC = () => {
  const { currentUser, updateCurrentUser, theme, isAdminUser, authInitialized } = useApp();
  const [accepted, setAccepted] = useState(false);
  const [healthAccepted, setHealthAccepted] = useState(false);

  // Check if user already accepted privacy consent locally on this device
  const isLocallyAccepted = typeof window !== 'undefined' && localStorage.getItem('bl_privacy_consent_accepted') === 'true';

  // NEVER show if:
  // 1. Auth has not initialized yet (prevents 1-second flash on page refresh)
  // 2. User is not logged in
  // 3. User is an administrator / manager
  // 4. Consent has already been accepted locally or in user profile
  if (
    !authInitialized ||
    !currentUser.isLoggedIn ||
    isAdminUser ||
    isLocallyAccepted ||
    Boolean(currentUser.privacyAcceptedAt)
  ) {
    return null;
  }

  const handleAccept = () => {
    if (!accepted) return;
    try {
      localStorage.setItem('bl_privacy_consent_accepted', 'true');
    } catch (_) {}
    updateCurrentUser({
      privacyAcceptedAt: new Date().toISOString(),
      healthConsent: healthAccepted,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-rose-600 shadow-xs">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Aviso de Privacidad y Consentimiento
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Para brindarte una experiencia segura y cumplir con las normativas de protección de datos personales, necesitamos tu consentimiento por única vez.
          </p>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 max-h-48 overflow-y-auto text-xs text-slate-600 space-y-3 leading-relaxed">
          <p className="font-bold text-slate-800">1. Tratamiento de Datos Personales</p>
          <p>
            Tus datos personales (nombre, teléfono, correo y dirección) son recabados con la única finalidad de gestionar tus pedidos, agendar tus citas y brindarte un servicio personalizado. Nunca compartimos tu información con terceros con fines publicitarios.
          </p>
          <p className="font-bold text-slate-800">2. Consentimiento de Salud (Servicios de Spa)</p>
          <p>
            Para tratamientos corporales, masajes y limpiezas, confirmas que la información brindada sobre tu estado de salud es verídica para asegurar tu bienestar durante los procedimientos en cabina.
          </p>
        </div>

        <div className="space-y-3 pt-2">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-slate-900">
              He leído y acepto el <strong className="text-slate-900">Aviso de Privacidad</strong> y el tratamiento de mis datos. *(Obligatorio)*
            </span>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={healthAccepted}
              onChange={(e) => setHealthAccepted(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-rose-600 focus:ring-rose-500 border-slate-300 cursor-pointer"
            />
            <span className="text-xs sm:text-sm text-slate-700 font-medium group-hover:text-slate-900">
              Acepto el consentimiento informado para servicios estéticos y de bienestar.
            </span>
          </label>
        </div>

        <button
          type="button"
          disabled={!accepted}
          onClick={handleAccept}
          className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm text-white shadow-md transition-all flex items-center justify-center gap-2 ${
            accepted
              ? `${theme.buttonClass} ${theme.buttonHoverClass} active:scale-98 cursor-pointer`
              : 'bg-slate-300 cursor-not-allowed opacity-70'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
          <span>Aceptar y Continuar</span>
        </button>
      </div>
    </div>
  );
};
