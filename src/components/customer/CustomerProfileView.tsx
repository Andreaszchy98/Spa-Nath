import React, { useState, useEffect } from 'react';
import {
  User,
  Phone,
  MapPin,
  Save,
  CheckCircle2,
  Package,
  Clock,
  LogOut,
  Mail,
  ShieldCheck,
  Calendar,
  Sparkles,
  Settings,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerProfileView: React.FC = () => {
  const {
    currentUser,
    isAdminUser,
    switchRole,
    updateCurrentUser,
    orders,
    appointments,
    setCustomerTab,
    setIsAuthModalOpen,
    loginWithGoogle,
    logout,
    deleteMyAccount,
    theme,
  } = useApp();

  const currentTheme = theme;

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [isSaved, setIsSaved] = useState(false);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSettingsMenu, setShowSettingsMenu] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    setName(currentUser.name || '');
    setPhone(currentUser.phone || '');
    setAddress(currentUser.address || '');
  }, [currentUser]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateCurrentUser({
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
    });

    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  // Orders statistics for this customer
  const clientOrders = orders.filter((o) => {
    if (currentUser.uid) return o.customerUid === currentUser.uid;
    return (currentUser.phone && o.customerPhone === currentUser.phone) || (currentUser.name && o.customerName === currentUser.name);
  });
  const activeOrders = clientOrders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion' || o.status === 'en_ruta'
  );

  // Appointments statistics
  const clientAppointments = appointments.filter((a) => {
    if (currentUser.uid) return a.customerUid === currentUser.uid;
    return (currentUser.phone && a.customerPhone === currentUser.phone) || (currentUser.name && a.customerName === currentUser.name);
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28 pt-2 animate-in fade-in duration-200">
      {/* 1. Header Card: Logged in or Guest */}
      {currentUser.isLoggedIn ? (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {currentUser.photoUrl ? (
            <img
              src={currentUser.photoUrl}
              alt={currentUser.name}
              className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0 relative">
              <span>{name ? name.charAt(0).toUpperCase() : 'C'}</span>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" />
            </div>
          )}

          <div className="flex-1 text-center sm:text-left space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUser.name || 'Mi Perfil'}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 self-center sm:self-auto">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>Cuenta Verificada</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 font-medium flex items-center justify-center sm:justify-start gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentUser.email || 'Correo registrado'}</span>
              {currentUser.authProvider === 'google' && (
                <span className="text-[10px] bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold ml-1">
                  Google
                </span>
              )}
            </p>

            <p className="text-xs text-slate-400">
              {phone ? `Tel: ${phone}` : 'Sin teléfono registrado aún'}
            </p>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => logout()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-center sm:self-start border border-slate-200/60"
            title="Cerrar Sesión"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      ) : (
        /* Guest Banner: Invites to log in without blocking navigation */
        <div className={`${currentTheme.accentBgClass} text-white rounded-3xl p-5 sm:p-6 shadow-md border border-white/20 space-y-4`}>
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Navegando como Invitado</span>
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight pt-1">
                Inicia sesión o regístrate
              </h2>
            </div>

            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/10 border border-white/20 items-center justify-center text-white shrink-0">
              <User className="w-7 h-7 text-white" />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 pt-1">
            <button
              type="button"
              onClick={() => loginWithGoogle()}
              className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-extrabold flex items-center gap-2 transition-all shadow-xs active:scale-95"
            >
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
              <span>Acceder con Google</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="py-2.5 px-4 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold border border-white/30 transition-all flex items-center gap-1.5 active:scale-95"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>Entrar con Correo</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Order & Appointment Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <div
          onClick={() => setCustomerTab('pedidos')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs cursor-pointer hover:border-slate-300 transition-all flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-500 font-medium">Tus Pedidos</p>
            <p className="text-xl font-black text-slate-900">{clientOrders.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div
          onClick={() => setCustomerTab('pedidos')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs cursor-pointer hover:border-slate-300 transition-all flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-500 font-medium">En Curso</p>
            <p className="text-xl font-black text-emerald-600">{activeOrders.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-500 font-medium">Citas Agendadas</p>
            <p className="text-xl font-black text-indigo-600">{clientAppointments.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <Calendar className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Personal Data Form (Editable by both logged in user and guest) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
              <User className="w-4 h-4 text-slate-600" />
              <span>Datos Personales de Contacto</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Esta información se autocompleta en tus compras y reservas de citas.
            </p>
          </div>
        </div>

        {currentUser.isLoggedIn ? (
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Nombre Completo *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Teléfono / WhatsApp *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Te contactaremos a este número para confirmar tus citas y cuando tus pedidos estén listos.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Dirección o Referencia de Domicilio
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <textarea
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Calle, número, colonia o referencias para tus servicios o pedidos..."
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                {isSaved && (
                  <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Datos guardados con éxito!</span>
                  </span>
                )}

                {currentUser.isLoggedIn && (
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowSettingsMenu(!showSettingsMenu)}
                      className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 border border-slate-200/60"
                      title="Ajustes"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Ajustes</span>
                    </button>

                    {showSettingsMenu && (
                      <div className="absolute left-0 bottom-full mb-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-30 space-y-1 text-left animate-in fade-in zoom-in-95">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">Ajustes</p>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirm(true);
                            setShowSettingsMenu(false);
                            setDeleteError(null);
                          }}
                          className="w-full text-left px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center gap-2"
                        >
                          Eliminar mi cuenta
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className={`py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95 ${currentTheme.buttonClass}`}
              >
                <Save className="w-4 h-4" />
                <span>Guardar Perfil</span>
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm text-slate-500 italic p-4 text-center">
            Inicia sesión para gestionar tus datos personales y configuración de cuenta.
          </p>
        )}
      </div>

      {/* Delete Account Confirmation Modal Popup */}
      {currentUser.isLoggedIn && showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-md w-full space-y-4 text-left animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-black text-slate-900 text-base tracking-tight flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">⚠️</span>
                <span>Confirmar Eliminación de Cuenta</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletePassword('');
                  setDeleteError(null);
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás totalmente segura de que deseas eliminar tu cuenta? Esta acción no se puede deshacer y borrará permanentemente tus datos de acceso.
            </p>

            <form onSubmit={async (e) => {
              e.preventDefault();
              setDeleteError(null);
              setDeleting(true);
              try {
                await deleteMyAccount(currentUser.authProvider === 'password' ? deletePassword : undefined);
              } catch (err: any) {
                console.error('Delete account error:', err);
                setDeleteError(err?.message || 'Error al eliminar la cuenta. Verifica tu contraseña.');
                setDeleting(false);
              }
            }} className="space-y-4 text-xs pt-1">

              {currentUser.authProvider === 'password' && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ingresa tu contraseña actual:</label>
                  <input
                    type="password"
                    required
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono"
                  />
                </div>
              )}

              {deleteError && (
                <p className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                  {deleteError}
                </p>
              )}

              <div className="flex gap-2.5 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletePassword('');
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold bg-white hover:bg-slate-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs flex items-center gap-2 transition-all active:scale-95"
                >
                  {deleting && <span className="animate-spin w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />}
                  <span>Sí, eliminar mi cuenta</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
