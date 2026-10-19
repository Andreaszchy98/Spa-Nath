import React, { useState } from 'react';
import {
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
  Calendar,
  Sparkles,
  DollarSign,
  ChevronRight,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { orders, appointments, products, ingredients, businessProfile, setAdminTab, theme } = useApp();

  // Mode: All vs Products vs Services
  const [metricScope, setMetricScope] = useState<'all' | 'products' | 'services'>('all');

  // --- 1. Products (Orders) Metrics ---
  const validOrders = orders.filter((o) => o.status !== 'cancelado');
  const productSales = validOrders.reduce((sum, o) => sum + o.total, 0);
  const pendingProductCashOrders = validOrders.filter((o) => !o.paymentReceived);
  const pendingProductCashAmount = pendingProductCashOrders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter((o) => o.status === 'pendiente' || o.status === 'en_preparacion').length;

  // --- 2. Services (Appointments) Metrics ---
  // Confirmed and completed services count towards realized/projected revenue
  const validAppointments = appointments.filter((a) => a.status !== 'cancelada');
  const completedAppointments = appointments.filter((a) => a.status === 'completada');
  const serviceSales = validAppointments.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
  const serviceRealizedSales = completedAppointments.reduce((sum, a) => sum + (a.totalPrice || 0), 0);
  const pendingAppointments = appointments.filter((a) => a.status === 'pendiente');
  const confirmedAppointments = appointments.filter((a) => a.status === 'confirmada');
  const activeAppointmentsCount = pendingAppointments.length + confirmedAppointments.length;

  // --- 3. Combined Metrics ---
  const combinedTotalSales = productSales + serviceSales;
  const combinedPendingCash = pendingProductCashAmount + (serviceSales - serviceRealizedSales);
  const totalOperationsCount = validOrders.length + validAppointments.length;
  const averageTicket = totalOperationsCount > 0 ? Math.round(combinedTotalSales / totalOperationsCount) : 0;

  // Current display metric based on filter
  const displayedSales =
    metricScope === 'all' ? combinedTotalSales : metricScope === 'products' ? productSales : serviceSales;
  const displayedOperationsCount =
    metricScope === 'all' ? totalOperationsCount : metricScope === 'products' ? validOrders.length : validAppointments.length;

  // Inventory alerts
  const lowStockProducts = products.filter(
    (p) => businessProfile.enableStockControl && p.stock <= p.minStockAlert
  );
  const lowStockIngredients = ingredients.filter(
    (i) => businessProfile.enableStockControl && i.stock <= i.minStockAlert
  );
  const totalCriticalStock = lowStockProducts.length + lowStockIngredients.length;

  // Recent unified operations (comandas) with robust deduplication
  const uniqueOrders = Array.from(new Map(orders.map((o) => [o.id, o])).values());
  const uniqueAppointments = Array.from(new Map(appointments.map((a) => [a.id, a])).values());

  const recentOrders = uniqueOrders.slice(0, 5).map((o) => ({
    type: 'order' as const,
    id: o.id,
    number: o.orderNumber,
    customerName: o.customerName,
    customerPhone: o.customerPhone,
    concept: `${o.items.reduce((s, i) => s + i.quantity, 0)} productos (${o.items[0]?.productName || 'Venta'}...)`,
    total: o.total,
    paid: o.paymentReceived,
    status: o.status,
    date: o.createdAt,
  }));

  const recentAppointments = uniqueAppointments.slice(0, 5).map((a) => ({
    type: 'appointment' as const,
    id: a.id,
    number: a.appointmentNumber,
    customerName: a.customerName,
    customerPhone: a.customerPhone,
    concept: `Servicio: ${a.serviceName} (${a.providerName})`,
    total: a.totalPrice || 0,
    paid: a.status === 'completada',
    status: a.status,
    date: a.createdAt || a.startTimeUtc,
  }));

  const combinedRecent = Array.from(
    new Map(
      [...recentOrders, ...recentAppointments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((op) => [`${op.type}-${op.id}`, op])
    ).values()
  ).slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Panel de control de ventas
        </h2>
      </div>

      {/* Scope Selector: General, Solo Productos, Solo Servicios */}
      <div className="flex items-center justify-between flex-wrap gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200">
        <div className="flex items-center gap-1 text-xs">
          <button
            type="button"
            onClick={() => setMetricScope('all')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              metricScope === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas las Ventas (Total)
          </button>
          <button
            type="button"
            onClick={() => setMetricScope('products')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              metricScope === 'products'
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-600" />
            <span>Productos de Spa (${productSales})</span>
          </button>
          <button
            type="button"
            onClick={() => setMetricScope('services')}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              metricScope === 'services'
                ? 'bg-white text-rose-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Servicios & Citas (${serviceSales})</span>
          </button>
        </div>
        <div className="text-[11px] text-slate-500 pr-2">
          {metricScope === 'all' && (
            <span>
              Productos: <strong>{businessProfile.currency}{productSales}</strong> | Servicios: <strong>{businessProfile.currency}{serviceSales}</strong>
            </span>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales (with Services + Products breakdown) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">
              {metricScope === 'all'
                ? 'Ventas Globales'
                : metricScope === 'products'
                ? 'Venta de Productos'
                : 'Venta de Servicios'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {businessProfile.currency}{displayedSales}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-between">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>{displayedOperationsCount} operaciones</span>
            </span>
            {metricScope === 'all' && (
              <span className="text-[10px] text-slate-400 font-mono">
                {validOrders.length} ped. + {validAppointments.length} citas
              </span>
            )}
          </div>
        </div>

        {/* Pending Cash to Collect */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Por Cobrar en Caja</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            {businessProfile.currency}{combinedPendingCash}
          </div>
          <div className="text-[11px] text-amber-700 flex items-center justify-between">
            <span>{pendingProductCashOrders.length} pedidos sin cobrar</span>
            <span className="text-[10px] text-amber-600">
              {pendingAppointments.length + confirmedAppointments.length} citas pend.
            </span>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Ticket Promedio</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {businessProfile.currency}{averageTicket}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>Promedio por comanda</span>
            <span className="text-[10px] text-indigo-600 font-medium">Spa & Retail</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Alertas de Stock</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                totalCriticalStock > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {totalCriticalStock}
          </div>
          <div className="text-[11px] text-slate-500">
            {totalCriticalStock > 0 ? (
              <button
                onClick={() => setAdminTab('inventario')}
                className="text-rose-600 hover:underline font-semibold"
              >
                Revisar {lowStockIngredients.length > 0 ? `${lowStockIngredients.length} insumos y ` : ''}
                {lowStockProducts.length} productos &rarr;
              </button>
            ) : (
              <span className="text-emerald-600 font-medium">Inventario óptimo</span>
            )}
          </div>
        </div>
      </div>

      {/* Services vs Products Breakdown Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Spa Services Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Ventas de Servicios & Citas</h3>
            </div>
            <button
              onClick={() => setAdminTab('agenda')}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1"
            >
              <span>Ver Agenda</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Servicios</div>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                {businessProfile.currency}{serviceSales}
              </div>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Completadas</div>
              <div className="text-base font-extrabold text-emerald-800 font-mono mt-0.5">
                {completedAppointments.length}
              </div>
            </div>
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
              <div className="text-[10px] uppercase font-bold text-amber-700">Por Realizar</div>
              <div className="text-base font-extrabold text-amber-800 font-mono mt-0.5">
                {activeAppointmentsCount}
              </div>
            </div>
          </div>
        </div>

        {/* Spa Products Summary Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Ventas de Productos de Cuidado</h3>
            </div>
            <button
              onClick={() => setAdminTab('pedidos')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Ver Comandas</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="text-[10px] uppercase font-bold text-slate-400">Total Productos</div>
              <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
                {businessProfile.currency}{productSales}
              </div>
            </div>
            <div className="bg-emerald-50/60 p-2.5 rounded-xl border border-emerald-100">
              <div className="text-[10px] uppercase font-bold text-emerald-700">Entregados</div>
              <div className="text-base font-extrabold text-emerald-800 font-mono mt-0.5">
                {orders.filter((o) => o.status === 'entregado').length}
              </div>
            </div>
            <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100">
              <div className="text-[10px] uppercase font-bold text-amber-700">En Proceso</div>
              <div className="text-base font-extrabold text-amber-800 font-mono mt-0.5">
                {activeOrdersCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Unified Comandas Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Últimas Comandas y Citas Registradas
            </h3>
          </div>
          <button
            onClick={() => setAdminTab('pedidos')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>Ver todas las comandas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Comanda / Folio</th>
                <th className="py-2.5 px-3">Tipo</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Concepto</th>
                <th className="py-2.5 px-3">Monto</th>
                <th className="py-2.5 px-3">Cobro</th>
                <th className="py-2.5 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {combinedRecent.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No hay comandas ni citas registradas en este momento.
                  </td>
                </tr>
              ) : (
                combinedRecent.map((op, idx) => (
                  <tr key={`${op.type}-${op.id}-${idx}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {op.number}
                    </td>
                    <td className="py-3 px-3">
                      {op.type === 'order' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                          <ShoppingBag className="w-3 h-3" />
                          Producto
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <Sparkles className="w-3 h-3" />
                          Servicio Cita
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      <div>{op.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{op.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate">
                      {op.concept}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {businessProfile.currency}{op.total}
                    </td>
                    <td className="py-3 px-3">
                      {op.paid ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Cobrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Por Cobrar
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 capitalize">
                        {op.status.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
