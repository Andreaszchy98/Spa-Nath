import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { CustomerCatalogView } from './components/customer/CustomerCatalogView';
import { CustomerOrdersHistory } from './components/customer/CustomerOrdersHistory';
import { CustomerProfileView } from './components/customer/CustomerProfileView';
import { BottomNavBar } from './components/customer/BottomNavBar';
import { ProductCustomizerModal } from './components/customer/ProductCustomizerModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { AdminPanel } from './components/admin/AdminPanel';
import { ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { theme, currentUser, customerTab, businessProfile } = useApp();
  const isAdmin = currentUser.role === 'admin';

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 ${theme.bgClass}`}
      style={businessProfile.customBackgroundColor ? { backgroundColor: businessProfile.customBackgroundColor } : undefined}
    >
      {/* Top Header with Brand Name and Login Popup */}
      <Header />

      {/* Main Content Area */}
      <main className={`flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-5 ${!isAdmin ? 'pb-24' : ''}`}>
        {isAdmin ? (
          <AdminPanel />
        ) : customerTab === 'catalogo' ? (
          <CustomerCatalogView />
        ) : customerTab === 'pedidos' ? (
          <CustomerOrdersHistory />
        ) : (
          <CustomerProfileView />
        )}
      </main>

      {/* Customer Bottom Navigation Bar */}
      {!isAdmin && <BottomNavBar />}

      {/* Global Modals & Drawers */}
      <ProductCustomizerModal />
      <CartDrawer />

      {/* Footer */}
      <footer className={`mt-auto border-t border-slate-200/80 bg-white/80 py-4 text-center text-xs text-slate-500 ${!isAdmin ? 'mb-16' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-slate-600" />
            <span className="font-semibold text-slate-800">
              {businessProfile.name || 'Plataforma Comercial'}
            </span>
            <span>· Pagos en Efectivo & Envíos</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Tema activo: {theme.name}</span>
            <span>·</span>
            <span>Licencia: {businessProfile.licenseCode}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
