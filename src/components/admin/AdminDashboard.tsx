import React from 'react';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  AlertTriangle,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const { orders, products, ingredients, businessProfile, setAdminTab, theme } = useApp();

  // Metrics calculation
  const totalSales = orders
    .filter((o) => o.status !== 'cancelado')
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCashOrders = orders.filter(
    (o) => o.status !== 'cancelado' && !o.paymentReceived
  );
  const pendingCashAmount = pendingCashOrders.reduce((sum, o) => sum + o.total, 0);

  const completedOrders = orders.filter((o) => o.status === 'entregado').length;
  const inProgressOrders = orders.filter(
    (o) => o.status === 'pendiente' || o.status === 'en_preparacion'
  ).length;

  const validOrdersCount = orders.filter((o) => o.status !== 'cancelado').length;
  const averageTicket = validOrdersCount > 0 ? Math.round(totalSales / validOrdersCount) : 0;

  // Inventory alerts (both finished products and central ingredients)
  const lowStockProducts = products.filter(
    (p) => businessProfile.enableStockControl && p.stock <= p.minStockAlert
  );
  const lowStockIngredients = ingredients.filter(
    (i) => businessProfile.enableStockControl && i.stock <= i.minStockAlert
  );
  const totalCriticalStock = lowStockProducts.length + lowStockIngredients.length;

  return (
    <div className="space-y-6">
      {/* Title & Quick Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Panel de Control Ejecutivo & Ventas
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Métricas del negocio, cobros en efectivo e inventario para: <strong>{businessProfile.name || 'Mi Negocio'}</strong>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAdminTab('pedidos')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 ${theme.buttonClass}`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ver Pedidos ({inProgressOrders} activos)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Ventas Totales</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">
            {businessProfile.currency}{totalSales}
          </div>
          <div className="text-[11px] text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span>{validOrdersCount} pedidos procesados</span>
          </div>
        </div>

        {/* Pending Cash to Collect */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Efectivo por Cobrar</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-900 font-mono">
            {businessProfile.currency}{pendingCashAmount}
          </div>
          <div className="text-[11px] text-amber-700 flex items-center gap-1">
            <span>{pendingCashOrders.length} pedidos sin cobrar en caja</span>
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
          <div className="text-[11px] text-slate-500">
            <span>Promedio por cliente</span>
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-semibold uppercase tracking-wider">Alertas de Stock</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              totalCriticalStock > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-400'
            }`}>
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
                Revisar {lowStockIngredients.length > 0 ? `${lowStockIngredients.length} insumos y ` : ''}{lowStockProducts.length} productos &rarr;
              </button>
            ) : (
              <span className="text-emerald-600 font-medium">Inventario óptimo</span>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Últimos Pedidos Registrados
            </h3>
          </div>
          <button
            onClick={() => setAdminTab('pedidos')}
            className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 transition-colors"
          >
            <span>Ver todos los pedidos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-y border-slate-200">
              <tr>
                <th className="py-2.5 px-3">Pedido</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Artículos</th>
                <th className="py-2.5 px-3">Total</th>
                <th className="py-2.5 px-3">Efectivo / Cobro</th>
                <th className="py-2.5 px-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No hay pedidos registrados en este momento.
                  </td>
                </tr>
              ) : (
                orders.slice(0, 5).map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {order.orderNumber}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-800">
                      <div>{order.customerName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{order.customerPhone}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {order.items.reduce((s, i) => s + i.quantity, 0)} items ({order.items[0]?.productName}...)
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900">
                      {businessProfile.currency}{order.total}
                    </td>
                    <td className="py-3 px-3">
                      {order.paymentReceived ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          Cobrado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          Por Cobrar (${order.cashPayment.amountPaid})
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 capitalize">
                        {order.status.replace('_', ' ')}
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
