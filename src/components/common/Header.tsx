import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  ShieldCheck,
  User,
  Package,
  Layers,
  Sparkles,
  TrendingUp,
  Settings,
  ChevronDown,
  Calendar,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuthModal } from './AuthModal';

export const Header: React.FC = () => {
  const {
    theme,
    businessProfile,
    currentUser,
    switchRole,
    cartCount,
    setIsCartDrawerOpen,
    adminTab,
    setAdminTab,
    customerTab,
    setCustomerTab,
    orders,
    products,
    appointments,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  const [isPageMenuOpen, setIsPageMenuOpen] = useState(false);
  const pageMenuRef = useRef<HTMLDivElement>(null);

  const isAdmin = currentUser.role === 'admin';

  const pendingOrdersCount = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
  ).length;

  const pendingAppointmentsCount = appointments.filter((a) => a.status === 'pendiente').length;

  const lowStockCount = products.filter((p) => p.stock <= p.minStockAlert).length;

  // Admin pages list with clean icons and names
  const adminPages = [
    {
      id: 'resumen' as const,
      name: 'Dashboard & Métricas',
      icon: <TrendingUp className="w-4 h-4" />,
    },
    {
      id: 'agenda' as const,
      name: 'Agenda & Citas',
      icon: <Calendar className="w-4 h-4" />,
      badge: pendingAppointmentsCount,
    },
    {
      id: 'pedidos' as const,
      name: 'Ventas & Órdenes de Spa',
      icon: <ShoppingBag className="w-4 h-4" />,
      badge: pendingOrdersCount,
    },
    {
      id: 'inventario' as const,
      name: 'Gestión de Inventario',
      icon: <Package className="w-4 h-4" />,
      badge: lowStockCount,
    },
    {
      id: 'servicios' as const,
      name: 'Catálogo de Servicios',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'catalogo' as const,
      name: 'Catálogo de Productos',
      icon: <Layers className="w-4 h-4" />,
    },
    {
      id: 'banners' as const,
      name: 'Banners & Promos',
      icon: <Sparkles className="w-4 h-4" />,
    },
    {
      id: 'configuracion' as const,
      name: 'Temas & Licencia',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const currentPage = adminPages.find((p) => p.id === adminTab) || adminPages[0];

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pageMenuRef.current && !pageMenuRef.current.contains(event.target as Node)) {
        setIsPageMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-colors">
        {/* Top bar: Business Name on the left, Login/Account Popup button on the right */}
        <div
          className="text-white px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs transition-colors"
          style={{ backgroundColor: theme.raw.primaryBtn }}
        >
          {/* Business Name Branding */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white/10 text-white font-black text-sm flex items-center justify-center shrink-0 border border-white/20 shadow-2xs overflow-hidden relative">
              {businessProfile.name ? (
                <span>{businessProfile.name.charAt(0).toUpperCase()}</span>
              ) : (
                <div className="w-3.5 h-3.5 rounded-xs bg-white/20 animate-pulse" />
              )}
              {businessProfile.logoUrl && (
                <img
                  src={businessProfile.logoUrl}
                  alt={businessProfile.name || 'Logo'}
                  className="absolute inset-0 w-full h-full object-cover bg-white"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              )}
            </div>
            <div className="min-w-0">
              {businessProfile.name ? (
                <h1 className="text-sm sm:text-base font-extrabold tracking-tight text-white truncate leading-tight">
                  {businessProfile.name}
                </h1>
              ) : (
                <div className="h-4 w-32 bg-white/20 rounded animate-pulse my-0.5" />
              )}
              {businessProfile.slogan && (
                <p className="text-[10px] text-slate-300 truncate hidden sm:block">
                  {businessProfile.slogan}
                </p>
              )}
            </div>
          </div>

          {/* Right side in Top Bar: Shopping Bag & User Profile Button */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cart Button (Only for clients) */}
            {!isAdmin && (
              <button
                type="button"
                onClick={() => setIsCartDrawerOpen(true)}
                className="relative p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5 active:scale-95 border border-white/15"
                title="Abrir Carrito"
                aria-label="Abrir Carrito"
              >
                <ShoppingBag className="w-4 h-4 text-white" />
                <span className="hidden xs:inline text-xs font-semibold">Carrito</span>
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[10px] font-black px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cartCount}
                  </span>
                )}
              </button>
            )}

            {/* Login / Role Profile Button (opens popup modal) */}
            <button
              type="button"
              onClick={() => setIsAuthModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/15 transition-all shrink-0 active:scale-95"
              title="Abrir inicio de sesión / cambiar perfil"
            >
              {isAdmin ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-300" />
                  <span className="hidden xs:inline">Admin:</span>
                  <span className="text-indigo-100">Gerencia</span>
                </>
              ) : currentUser.isLoggedIn ? (
                <>
                  {currentUser.photoUrl ? (
                    <img
                      src={currentUser.photoUrl}
                      alt={currentUser.name}
                      className="w-4 h-4 rounded-full object-cover border border-white/30"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-300" />
                  )}
                  <span className="truncate max-w-[85px] sm:max-w-[110px]">
                    {currentUser.name || 'Mi Cuenta'}
                  </span>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-white/80" />
                  <span>Acceder</span>
                </>
              )}
              <ChevronDown className="w-3 h-3 text-white/70 ml-0.5" />
            </button>
          </div>
        </div>

        {/* Lower navigation bar: Only for Admin pages selector */}
        {isAdmin && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 sm:h-14 flex items-center justify-between gap-3 border-t border-slate-100">
            {/* Admin Single Clean Page Selector */}
            <div className="relative" ref={pageMenuRef}>
              <button
                type="button"
                onClick={() => setIsPageMenuOpen(!isPageMenuOpen)}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-900 font-bold text-xs sm:text-sm transition-all shadow-2xs active:scale-98"
              >
                <span className="text-slate-800 flex items-center">
                  {currentPage.icon}
                </span>
                <span>{currentPage.name}</span>
                {currentPage.badge && currentPage.badge > 0 ? (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-600 text-white">
                    {currentPage.badge}
                  </span>
                ) : null}
                <ChevronDown
                  className={`w-3.5 h-3.5 text-slate-500 transition-transform duration-200 ${
                    isPageMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu of Admin Sections */}
              {isPageMenuOpen && (
                <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    Seleccionar Página / Módulo
                  </div>
                  {adminPages.map((page) => (
                    <button
                      key={page.id}
                      type="button"
                      onClick={() => {
                        setAdminTab(page.id);
                        setIsPageMenuOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs transition-colors rounded-xl ${
                        adminTab === page.id
                          ? 'text-white font-bold shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      style={
                        adminTab === page.id
                          ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                          : undefined
                      }
                    >
                      <div className="flex items-center gap-2.5">
                        <span className={adminTab === page.id ? 'text-white' : 'text-slate-500'}>
                          {page.icon}
                        </span>
                        <span>{page.name}</span>
                      </div>
                      {page.badge && page.badge > 0 ? (
                        <span
                          className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                            adminTab === page.id
                              ? 'bg-rose-500 text-white'
                              : 'bg-rose-100 text-rose-700'
                          }`}
                        >
                          {page.badge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Preview Store button for the admin */}
            <button
              type="button"
              onClick={() => {
                switchRole('client');
                setCustomerTab('catalogo');
              }}
              className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs active:scale-95"
              title="Ver cómo ve la tienda un cliente"
            >
              <Store className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden xs:inline">Vista Cliente</span>
            </button>
          </div>
        )}
      </header>

      {/* Auth Modal Popup */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};
