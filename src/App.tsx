import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { PrivacyPolicyModal } from './components/common/PrivacyPolicyModal';
import { CustomerCatalogView } from './components/customer/CustomerCatalogView';
import { CustomerOrdersHistory } from './components/customer/CustomerOrdersHistory';
import { CustomerProfileView } from './components/customer/CustomerProfileView';
import { BottomNavBar } from './components/customer/BottomNavBar';
import { ProductCustomizerModal } from './components/customer/ProductCustomizerModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { AdminPanel } from './components/admin/AdminPanel';
import { ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { theme, currentUser, customerTab, businessProfile, isPrivacyModalOpen, setIsPrivacyModalOpen } = useApp();
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
        
        {/* Footer with Privacy Notice Link */}
        <Footer onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
      </main>

      {/* Customer Bottom Navigation Bar */}
      {!isAdmin && <BottomNavBar />}

      {/* Global Modals & Drawers */}
      <ProductCustomizerModal />
      <CartDrawer />
      <PrivacyPolicyModal isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} />
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
