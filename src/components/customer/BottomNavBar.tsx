import React from 'react';
import { BookOpen, Package, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const BottomNavBar: React.FC = () => {
  const { customerTab, setCustomerTab, orders, currentUser, theme } = useApp();

  // Active orders count for customer badge (only orders created by or for this client)
  const activeOrdersCount = orders.filter(
    (o) =>
      o.customerPhone === currentUser.phone &&
      (o.status === 'pendiente' || o.status === 'en_preparacion')
  ).length;

  const navItems = [
    {
      id: 'catalogo' as const,
      label: 'Catálogo',
      icon: BookOpen,
      badge: 0,
    },
    {
      id: 'pedidos' as const,
      label: 'Mis pedidos',
      icon: Package,
      badge: activeOrdersCount,
    },
    {
      id: 'perfil' as const,
      label: 'Perfil',
      icon: User,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="Navegación inferior del cliente"
      className="fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 sm:px-6 py-1.5 pb-[max(0.4rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-md mx-auto flex items-center justify-around gap-1">
        {navItems.map((item) => {
          const isActive = customerTab === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setCustomerTab(item.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`relative flex-1 py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'font-bold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
              style={isActive ? { color: theme.raw.primaryBtn } : undefined}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 bg-slate-100 rounded-xl -z-10 animate-in fade-in zoom-in-95 duration-150" />
              )}

              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {item.badge > 0 && (
                  <span className="absolute -top-1 -right-2.5 px-1.5 min-w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[11px] tracking-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.label}
              </span>

              {/* Indicator bar */}
              {isActive && (
                <span
                  className="w-4 h-0.75 rounded-full mt-0.5"
                  style={{ backgroundColor: theme.raw.primaryBtn }}
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
