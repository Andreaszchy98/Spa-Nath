import React from 'react';
import { useApp } from '../../context/AppContext';
import { AdminDashboard } from './AdminDashboard';
import { AdminSalesOrders } from './AdminSalesOrders';
import { AdminLogistics } from './AdminLogistics';
import { AdminInventory } from './AdminInventory';
import { AdminCatalog } from './AdminCatalog';
import { AdminServices } from './AdminServices';
import { AdminBanners } from './AdminBanners';
import { AdminSettings } from './AdminSettings';
import { AdminSchedule } from './AdminSchedule';

export const AdminPanel: React.FC = () => {
  const { adminTab } = useApp();

  return (
    <div className="space-y-6 pb-16">
      {/* Active Tab Panel (no redundant second tab bar) */}
      {adminTab === 'resumen' && <AdminDashboard />}
      {adminTab === 'agenda' && <AdminSchedule />}
      {adminTab === 'pedidos' && <AdminSalesOrders />}
      {adminTab === 'logistica' && <AdminLogistics />}
      {adminTab === 'inventario' && <AdminInventory />}
      {adminTab === 'servicios' && <AdminServices />}
      {adminTab === 'catalogo' && <AdminCatalog />}
      {adminTab === 'banners' && <AdminBanners />}
      {adminTab === 'configuracion' && <AdminSettings />}
    </div>
  );
};

