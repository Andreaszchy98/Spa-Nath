import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  User,
  CheckCircle2,
  Lock,
  ArrowRight,
  Mail,
  Eye,
  EyeOff,
  LogOut,
  AlertCircle,
  Loader2,
  Compass,
  LayoutDashboard,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AuthTab = 'login' | 'register' | 'forgot_password';

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const {
    currentUser,
    isAdminUser,
    switchRole,
    theme,
    businessProfile,
    setCustomerTab,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    sendPasswordResetEmail,
    logout,
    authLoading,
    authError,
    clearAuthError,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AuthTab>('login');

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLocalError('');
    clearAuthError();
    try {
      await loginWithGoogle();
      onClose();
    } catch (err: any) {
      console.warn('Google login failed:', err);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    if (!email.trim() || !password) {
      setLocalError('Por favor completa todos los campos.');
      return;
    }

    try {
      await loginWithEmail(email.trim(), password);
      onClose();
    } catch (err: any) {
      console.warn('Email login failed:', err);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    if (!email.trim() || !password) {
      setLocalError('Por favor completa todos los campos.');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      await registerWithEmail(email.trim(), password, displayName.trim() || 'Cliente');
      onClose();
    } catch (err: any) {
      console.warn('Email register failed:', err);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    clearAuthError();

    if (!email.trim()) {
      setLocalError('Ingresa tu correo para recibir el enlace de recuperación.');
      return;
    }

    try {
      await sendPasswordResetEmail(email.trim());
      setResetEmailSent(true);
    } catch (err: any) {
      console.warn('Password reset failed:', err);
    }
  };

  const handleContinueAsGuest = () => {
    switchRole('client');
    setCustomerTab('catalogo');
    onClose();
  };

  const handleLogout = async () => {
    await logout();
    switchRole('client');
  };

  const isCurrentAdminView = currentUser.role === 'admin';
  const displayError = localError || authError;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm overflow-hidden relative shrink-0 shadow-xs">
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
                {currentUser.isLoggedIn ? 'Mi Cuenta' : 'Acceso de Usuarios'}
              </h3>
              <p className="text-[11px] text-slate-500">
                {businessProfile.name || 'Plataforma oficial'}
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

        {/* Logged in state display */}
        {currentUser.isLoggedIn ? (
          <div className="p-5 space-y-4">
            <div className={`p-4 rounded-2xl border ${isAdminUser ? 'bg-indigo-50/70 border-indigo-200' : 'bg-emerald-50/50 border-emerald-100'}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full border-2 border-indigo-400 object-cover shadow-2xs shrink-0"
                    />
                  ) : (
                    <div className={`w-12 h-12 rounded-full font-black text-base flex items-center justify-center shadow-2xs shrink-0 text-white ${isAdminUser ? 'bg-indigo-700' : 'bg-emerald-700'}`}>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-slate-900 text-sm truncate max-w-[160px]">{currentUser.name}</span>
                      {isAdminUser ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-600 text-white flex items-center gap-1 shadow-2xs">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Gerencia / Admin</span>
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Cliente
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 truncate">{currentUser.email}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={authLoading}
                  className="px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors flex items-center gap-1 shrink-0"
                  title="Cerrar Sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Salir</span>
                </button>
              </div>
            </div>

            {/* Admin View Switcher (Only visible to authorized administrator!) */}
            {isAdminUser && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Modo de visualización
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      switchRole('admin');
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      isCurrentAdminView
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Panel de Gerencia</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      switchRole('client');
                      setCustomerTab('catalogo');
                      onClose();
                    }}
                    className={`p-2.5 rounded-xl font-bold flex items-center justify-center gap-2 border transition-all ${
                      !isCurrentAdminView
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Store className="w-4 h-4" />
                    <span>Vista Tienda</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Not logged in: Clean Auth Tabs (Iniciar Sesión & Crear Cuenta only - NO PIN BACKDOOR) */
          <>
            <div className="px-5 pt-3">
              <div className="p-1 bg-slate-100 rounded-2xl flex items-center text-xs font-semibold gap-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setLocalError('');
                    clearAuthError();
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    activeTab === 'login' || activeTab === 'forgot_password'
                      ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Iniciar Sesión
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('register');
                    setLocalError('');
                    clearAuthError();
                  }}
                  className={`flex-1 py-2 rounded-xl transition-all ${
                    activeTab === 'register'
                      ? 'bg-white text-slate-900 shadow-xs font-extrabold'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Crear Cuenta
                </button>
              </div>
            </div>

            {/* Error notification banner */}
            {displayError && (
              <div className="mx-5 mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">Atención: </span>
                  <span>{displayError}</span>
                </div>
              </div>
            )}

            {/* Body content based on activeTab */}
            <div className="p-5 pt-3 space-y-4">
              {activeTab === 'login' && (
                <div className="space-y-4 text-xs">
                  {/* Google One-Click Login */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold flex items-center justify-center gap-3 transition-all shadow-2xs active:scale-98 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continuar con Google</span>
                  </button>

                  {/* Divider */}
                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[11px] text-slate-400 shrink-0 font-medium">
                      o con tu correo
                    </span>
                    <div className="border-t border-slate-200 w-full" />
                  </div>

                  {/* Email Login Form */}
                  <form onSubmit={handleEmailLogin} className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-700">Contraseña</label>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('forgot_password');
                            setResetEmailSent(false);
                          }}
                          className="text-[11px] text-slate-500 hover:text-slate-800 underline"
                        >
                          ¿Olvidaste tu contraseña?
                        </button>
                      </div>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${theme.buttonClass}`}
                    >
                      {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'register' && (
                <div className="space-y-4 text-xs">
                  {/* Google Sign Up */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="w-full py-2.5 px-4 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-bold flex items-center justify-center gap-3 transition-all shadow-2xs active:scale-98 disabled:opacity-50"
                  >
                    {authLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                    ) : (
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Registrarse con Google</span>
                  </button>

                  <div className="relative flex items-center justify-center">
                    <div className="border-t border-slate-200 w-full" />
                    <span className="bg-white px-3 text-[11px] text-slate-400 shrink-0 font-medium">
                      o crea una cuenta con correo
                    </span>
                    <div className="border-t border-slate-200 w-full" />
                  </div>

                  <form onSubmit={handleEmailRegister} className="space-y-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Ej. Sofia Ramos"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="tu@correo.com"
                          className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Contraseña (mín. 6 caracteres)</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          minLength={6}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="p-1 text-slate-400 hover:text-slate-700 absolute right-2.5 top-1/2 -translate-y-1/2"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50 ${theme.buttonClass}`}
                    >
                      {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                      <span>Registrar Cuenta Gratis</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              )}

              {activeTab === 'forgot_password' && (
                <div className="space-y-4 text-xs">
                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-900">
                    <p className="font-bold text-xs mb-1">Recuperación de Contraseña</p>
                    <p className="text-[11px] text-amber-800">
                      Ingresa tu correo registrado y te enviaremos un enlace de Firebase para restablecer tu acceso.
                    </p>
                  </div>

                  {resetEmailSent ? (
                    <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 text-center space-y-2">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                      <p className="font-bold text-xs">¡Correo de recuperación enviado!</p>
                      <p className="text-[11px] text-emerald-700">
                        Revisa tu bandeja de entrada en <strong>{email}</strong> y sigue las instrucciones para cambiar tu contraseña.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('login')}
                        className="mt-2 text-xs font-bold text-slate-900 underline block mx-auto"
                      >
                        Volver a Iniciar Sesión
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handlePasswordReset} className="space-y-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@correo.com"
                            className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setActiveTab('login')}
                          className="flex-1 py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          disabled={authLoading}
                          className={`flex-1 py-2.5 px-3 rounded-xl font-bold shadow-xs transition-all ${theme.buttonClass}`}
                        >
                          {authLoading ? 'Enviando...' : 'Enviar Enlace'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Guest navigation button */}
              <div className="pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleContinueAsGuest}
                  className="w-full py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 font-semibold text-xs flex items-center justify-center gap-2 transition-colors border border-slate-200/60"
                >
                  <Compass className="w-4 h-4 text-slate-500" />
                  <span>Continuar navegando como Invitado (Sin Cuenta)</span>
                </button>
                <p className="text-[10px] text-center text-slate-400 mt-1.5">
                  Puedes ver el catálogo de productos y servicios con total libertad.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
