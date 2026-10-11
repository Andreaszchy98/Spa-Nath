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
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CustomerProfileView: React.FC = () => {
  const {
    currentUser,
    updateCurrentUser,
    orders,
    setCustomerTab,
    setIsAuthModalOpen,
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
  const clientOrders = orders.filter((o) => o.customerPhone === currentUser.phone);
  const activeOrders = clientOrders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-28 pt-2 animate-in fade-in duration-200">
      {/* 1. Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shrink-0 relative">
          <span>{name ? name.charAt(0).toUpperCase() : 'C'}</span>
          <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center" />
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {name || 'Mi Perfil'}
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 self-center sm:self-auto">
              Cliente Registrado
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            {phone || 'Sin teléfono registrado'}
          </p>
          <p className="text-xs text-slate-400">
            {address ? `Dirección: ${address}` : 'Sin dirección guardada'}
          </p>
        </div>

        {/* Switch / Auth selector trigger */}
        <button
          type="button"
          onClick={() => setIsAuthModalOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 self-center sm:self-start"
          title="Cambiar a cuenta de Administrador o cambiar perfil"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cambiar Cuenta</span>
        </button>
      </div>

      {/* 2. Order Quick Stats */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div
          onClick={() => setCustomerTab('pedidos')}
          className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs cursor-pointer hover:border-slate-300 transition-all flex items-center justify-between"
        >
          <div className="space-y-0.5">
            <p className="text-[11px] text-slate-500 font-medium">Total de Pedidos</p>
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
            <p className="text-[11px] text-slate-500 font-medium">Pedidos en Curso</p>
            <p className="text-xl font-black text-emerald-600">{activeOrders.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* 3. Personal Data Form */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-slate-900 text-base tracking-tight flex items-center gap-2">
            <User className="w-4 h-4 text-slate-600" />
            <span>Datos Personales de Contacto</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Esta información se utiliza al generar tus pedidos para identificarte y notificarte.
          </p>
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
              El negocio se comunicará a este número para avisarte cuando tu pedido esté listo para recoger.
            </p>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">
              Dirección o Referencia
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <textarea
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Calle, número, colonia o referencias para tu ficha de cliente..."
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {isSaved ? (
              <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4" />
                <span>¡Cambios guardados con éxito!</span>
              </span>
            ) : (
              <span className="text-[11px] text-slate-400">
                Los datos se guardan en tu dispositivo.
              </span>
            )}

            <button
              type="submit"
              className="py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center gap-2 active:scale-95 bg-black text-white hover:bg-neutral-800"
            >
              <Save className="w-4 h-4" />
              <span>Guardar Perfil</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
