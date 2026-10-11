import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  RotateCcw,
  DollarSign,
  AlertCircle,
  Receipt,
  MessageCircle,
  Printer,
  User,
  XCircle,
  Trash2,
  Store,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';

export const AdminSalesOrders: React.FC = () => {
  const {
    orders,
    updateOrderStatus,
    markOrderPaymentReceived,
    deleteOrder,
    clearAllOrders,
    businessProfile,
    theme,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus === 'all') return true;
    return o.status === filterStatus;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'en_preparacion':
        return {
          label: 'En Tratamiento / Sesión',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <RotateCcw className="w-3.5 h-3.5" />,
        };
      case 'entregado':
        return {
          label: 'Completado / Finalizado',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  const generateWhatsAppLink = (order: Order) => {
    const text = encodeURIComponent(
      `¡Hola ${order.customerName}! Te escribimos de *${businessProfile.name || 'nuestro spa'}* sobre tu orden *#${order.orderNumber}*.\n` +
      `Estado actual: *${order.status.toUpperCase()}*.\n` +
      `Total: ${businessProfile.currency}${order.total} (Pago en Efectivo).\n` +
      `Cualquier consulta estamos a tu disposición.`
    );
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Administración de Ventas y Órdenes de Spa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Control de órdenes de servicios, productos de cuidado personal y cobros en efectivo.
          </p>
        </div>

        {/* Clean All Orders Button & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={orders.length === 0}
            onClick={() => setShowClearConfirmModal(true)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              orders.length === 0
                ? 'border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-50'
                : 'border border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-800 cursor-pointer shadow-2xs'
            }`}
            title={orders.length === 0 ? 'No hay órdenes registradas' : 'Limpiar todo el registro de ventas'}
          >
            <Trash2 className="w-3.5 h-3.5 shrink-0" />
            <span>Limpiar Registro</span>
          </button>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {[
              { id: 'all', label: `Todas (${orders.length})` },
              { id: 'pendiente', label: `Pendientes (${orders.filter((o) => o.status === 'pendiente').length})` },
              { id: 'en_preparacion', label: `En Tratamiento (${orders.filter((o) => o.status === 'en_preparacion').length})` },
              { id: 'entregado', label: `Completadas (${orders.filter((o) => o.status === 'entregado').length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterStatus(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === tab.id
                    ? 'shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
                style={
                  filterStatus === tab.id
                    ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                    : undefined
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Pipeline List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {orders.length === 0 ? 'El registro de ventas está vacío' : 'No hay órdenes con este estado'}
          </h3>
          <p className="text-xs text-slate-500">
            Las nuevas órdenes de servicios y productos aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const statusInfo = getStatusBadge(order.status);

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>Atención en Spa</span>
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}
                    >
                      {statusInfo.icon}
                      <span>{statusInfo.label}</span>
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleTimeString('es-ES', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Order Status Selector & Delete */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Cambiar estado:</span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="pendiente">Pendiente</option>
                      <option value="en_preparacion">En Tratamiento</option>
                      <option value="entregado">Completado / Finalizado</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => setOrderToDelete(order)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      title="Eliminar esta orden"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Customer Details & Cash Payment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Cliente
                    </span>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="text-slate-600 font-mono">{order.customerPhone}</div>
                    {order.customerNotes && (
                      <p className="text-[11px] text-amber-900 font-medium bg-amber-50 p-1 rounded mt-1">
                        Nota: "{order.customerNotes}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Cobro en Efectivo
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        Total: {businessProfile.currency}{order.total}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-600">
                      Paga con {businessProfile.currency}{order.cashPayment.amountPaid} · Cambio:{' '}
                      <strong className="text-emerald-700">
                        {businessProfile.currency}{order.cashPayment.changeNeeded}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Items & Customizer Modifiers */}
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    Detalle de Servicios y Productos
                  </div>
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div key={item.id} className="py-2 flex items-start justify-between gap-3">
                        <div>
                          <span className="font-bold text-slate-900">
                            {item.quantity}x {item.productName}
                          </span>
                          {item.selectedOptions.length > 0 && (
                            <div className="pl-3 text-[11px] text-slate-600 mt-0.5 space-y-0.5">
                              {item.selectedOptions.map((opt, i) => (
                                <span key={i} className="inline-block mr-2 bg-slate-100 px-1.5 py-0.5 rounded">
                                  {opt.groupTitle}: <strong>{opt.optionName}</strong>{' '}
                                  {opt.priceDelta > 0 && `(+${businessProfile.currency}${opt.priceDelta})`}
                                </span>
                              ))}
                            </div>
                          )}
                          {item.customerNotes && (
                            <p className="text-[11px] text-amber-800 bg-amber-50 p-1 rounded mt-1 font-medium">
                              Nota: "{item.customerNotes}"
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-bold text-slate-800 shrink-0">
                          {businessProfile.currency}{item.unitPrice * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons: Cash Confirmation, WhatsApp, Ticket */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => markOrderPaymentReceived(order.id, !order.paymentReceived)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                        order.paymentReceived
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-amber-500 text-white hover:bg-amber-600 shadow-xs'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {order.paymentReceived
                          ? '✓ Cobrado en Efectivo'
                          : 'Confirmar Cobro Recibido'}
                      </span>
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={generateWhatsAppLink(order)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Notificar por WhatsApp</span>
                    </a>

                    <button
                      onClick={() => setTicketOrder(order)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
                    >
                      <Receipt className="w-3.5 h-3.5" />
                      <span>Ticket de Servicio</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal */}
      {ticketOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 font-mono text-xs">
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h3 className="font-bold text-sm tracking-tight text-slate-900">
                {businessProfile.name || 'Ticket de Spa'}
              </h3>
              <div className="font-bold text-slate-800 text-xs">
                TICKET DE SERVICIO & CAJA: {ticketOrder.orderNumber}
              </div>
              <p className="text-[10px] text-slate-500">
                {new Date(ticketOrder.createdAt).toLocaleString('es-ES')}
              </p>
            </div>

            <div className="space-y-1 text-[11px]">
              <div><strong>Tipo:</strong> <span className="font-bold text-blue-700">Atención en Spa</span></div>
              <div><strong>Cliente:</strong> {ticketOrder.customerName} ({ticketOrder.customerPhone})</div>
              {ticketOrder.customerNotes && <div><strong>Notas:</strong> {ticketOrder.customerNotes}</div>}
            </div>

            <div className="py-2 border-y border-dashed border-slate-300 space-y-1 text-[11px]">
              {ticketOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <span className="font-bold">{item.quantity}x {item.productName}</span>
                    {item.selectedOptions.map((o, i) => (
                      <p key={i} className="text-[9px] text-slate-500 pl-2">+ {o.optionName}</p>
                    ))}
                    {item.customerNotes && (
                      <p className="text-[9px] text-amber-900 italic pl-2">Nota: {item.customerNotes}</p>
                    )}
                  </div>
                  <span>{businessProfile.currency}{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t border-slate-200">
                <span>TOTAL:</span>
                <span>{businessProfile.currency}{ticketOrder.total}</span>
              </div>
              <div className="flex justify-between text-slate-700 pt-1">
                <span>Efectivo recibido:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.amountPaid}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Cambio a entregar:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.changeNeeded}</span>
              </div>
            </div>

            <div className="pt-2 flex gap-2 font-sans">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketOrder(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Orders */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ¿Limpiar registro de ventas?
                </h3>
                <p className="text-[11px] text-slate-500">
                  {orders.length} pedidos registrados actualmente
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Esta acción eliminará todos los pedidos del historial, cocina y caja registradora. Esta acción no se puede deshacer.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowClearConfirmModal(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllOrders();
                  setShowClearConfirmModal(false);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, limpiar todo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Delete Single Order */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ¿Eliminar pedido {orderToDelete.orderNumber}?
                </h3>
                <p className="text-[11px] text-slate-500">
                  Cliente: {orderToDelete.customerName} · ${orderToDelete.total}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar este pedido del registro?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteOrder(orderToDelete.id);
                  setOrderToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
