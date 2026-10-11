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
    theme,
  } = useApp();

  const [name, setName] = useState(currentUser.name || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [isSaved, setIsSaved] = useState(false);

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
  const clientOrders = orders.filter(
    (o) => (currentUser.phone && o.customerPhone === currentUser.phone) || (currentUser.name && o.customerName === currentUser.name)
  );
  const activeOrders = clientOrders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion' || o.status === 'en_ruta'
  );

  // Appointments statistics
  const clientAppointments = appointments.filter(
    (a) => (currentUser.phone && a.customerPhone === currentUser.phone) || (currentUser.name && a.customerName === currentUser.name)
  );

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
        <div className="bg-linear-to-r from-slate-900 via-neutral-900 to-slate-800 text-white rounded-3xl p-5 sm:p-6 shadow-md border border-slate-800 space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Navegando como Invitado</span>
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight pt-1">
                ¿Deseas guardar tus pedidos y citas?
              </h2>
              <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                Inicia sesión con Google o con tu correo para acceder a tu historial de compras y citas desde cualquier dispositivo. Si lo prefieres, puedes seguir como invitado.
              </p>
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
              className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all flex items-center gap-1.5 active:scale-95"
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
            {isSaved ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Datos guardados con éxito!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                {currentUser.isLoggedIn
                  ? 'Sincronizado en la nube con tu cuenta de Firebase.'
                  : 'Guardado en tu dispositivo para tus compras como invitado.'}
              </span>
            )}

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95 bg-slate-900 text-white hover:bg-slate-800"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Perfil</span>
            </button>
          </div>
        </form>
      </div>

      {/* Authorized Admin Section (Only shown if current logged-in user is the administrator) */}
      {isAdminUser && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-extrabold text-xs text-indigo-950">Acceso Administrativo Habilitado</p>
              <p className="text-[11px] text-indigo-700">Sesión iniciada como administrador ({currentUser.email})</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => switchRole('admin')}
            className="w-full sm:w-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            Ir al Panel de Gerencia
          </button>
        </div>
      )}
    </div>
  );
};
