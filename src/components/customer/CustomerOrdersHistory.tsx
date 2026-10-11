import React, { useState } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  RotateCcw,
  Receipt,
  DollarSign,
  AlertCircle,
  Printer,
  Store,
  Calendar,
  Scissors,
  User,
  XCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, Appointment, AppointmentStatus } from '../../types';

export const CustomerOrdersHistory: React.FC = () => {
  const { orders, appointments, updateAppointmentStatus, updateOrderStatus, businessProfile, theme, setCustomerTab, addToCart } = useApp();
  const uniqueOrders = Array.from(new Map(orders.map((o) => [o.id, o])).values());
  const uniqueAppointments = Array.from(new Map(appointments.map((a) => [a.id, a])).values());
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [activeTab, setActiveTab] = useState<'pedidos' | 'citas'>('pedidos');

  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'En Espera de Confirmación',
          bg: 'bg-amber-100 text-amber-900 border-amber-200',
          icon: <Clock className="w-3.5 h-3.5" />,
          step: 1,
        };
      case 'en_preparacion':
        return {
          label: 'En Preparación / Tratamiento',
          bg: 'bg-blue-100 text-blue-900 border-blue-200',
          icon: <RotateCcw className="w-3.5 h-3.5" />,
          step: 2,
        };
      case 'en_ruta':
        return {
          label: 'En Camino / En Ruta',
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-200',
          icon: <RotateCcw className="w-3.5 h-3.5" />,
          step: 3,
        };
      case 'entregado':
        return {
          label: 'Entregado / Completado',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          step: 4,
        };
      case 'cancelado':
        return {
          label: 'Pedido Cancelado',
          bg: 'bg-rose-100 text-rose-900 border-rose-200',
          icon: <AlertCircle className="w-3.5 h-3.5" />,
          step: 0,
        };
      default:
        return {
          label: 'En Proceso',
          bg: 'bg-slate-100 text-slate-900 border-slate-200',
          icon: <Clock className="w-3.5 h-3.5" />,
          step: 1,
        };
    }
  };

  const getAppointmentStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> Pendiente de Aprobación
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
    }
  };

  const handleRepeatOrder = (order: Order) => {
    order.items.forEach((item) => {
      addToCart({
        ...item,
        id: `cart-repeat-${Date.now()}-${Math.random()}`,
      });
    });
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Tabs: Pedidos | Citas */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'pedidos'
              ? `${theme.buttonClass} shadow-sm`
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Mis Pedidos ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('citas')}
          className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'citas'
              ? `${theme.buttonClass} shadow-sm`
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Mis Citas de Servicios ({appointments.length})</span>
        </button>
      </div>

      {activeTab === 'pedidos' ? (
        orders.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <Package className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No tienes pedidos registrados</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Realiza tu primer pedido en el catálogo y podrás ver el avance de tu preparación aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {uniqueOrders.map((order, index) => {
              const statusInfo = getOrderStatusBadge(order.status);

              return (
                <div
                  key={`${order.id}-${index}`}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
                >
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-base text-slate-900">
                          {order.orderNumber}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                          <Store className="w-3 h-3 text-blue-600" />
                          <span>Para Recoger</span>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.bg}`}
                        >
                          {statusInfo.icon}
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setTicketOrder(order)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Comprobante Digital</span>
                      </button>
                      <button
                        onClick={() => handleRepeatOrder(order)}
                        className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
                        <span>Pedir de nuevo</span>
                      </button>
                      {order.status === 'pendiente' && (
                        <button
                          onClick={() => {
                            if (window.confirm('¿Confirmas que deseas cancelar este pedido? Se liberará el stock automáticamente.')) {
                              updateOrderStatus(order.id, 'cancelado');
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors border border-rose-200"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Cancelar pedido</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Progress bar tracker if active */}
                  {order.status !== 'cancelado' && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                      <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                        <span className={statusInfo.step >= 1 ? 'text-slate-900 font-bold' : ''}>
                          1. Recibido
                        </span>
                        <span className={statusInfo.step >= 2 ? 'text-slate-900 font-bold' : ''}>
                          2. En Preparación
                        </span>
                        <span className={statusInfo.step >= 3 ? 'text-emerald-700 font-bold' : ''}>
                          3. Listo / Entregado
                        </span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-slate-900 h-full rounded-full transition-all duration-500"
                          style={{ width: `${(statusInfo.step / 3) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Items List */}
                  <div className="space-y-2 text-xs">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start justify-between py-1.5 border-b border-slate-100 last:border-b-0"
                      >
                        <div className="min-w-0 pr-3">
                          <span className="font-bold text-slate-800">
                            {item.quantity}x {item.productName}
                          </span>
                          {item.selectedOptions.length > 0 && (
                            <p className="text-[11px] text-slate-500 pl-2">
                              {item.selectedOptions.map((o) => o.optionName).join(', ')}
                            </p>
                          )}
                          {item.customerNotes && (
                            <p className="text-[10px] text-amber-700 italic">
                              Nota: {item.customerNotes}
                            </p>
                          )}
                        </div>
                        <span className="font-mono font-medium text-slate-800 shrink-0">
                          {businessProfile.currency}{item.unitPrice * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Payment Breakdown / Pagos: Efectivo */}
                  <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 p-3 rounded-xl">
                    <div className="text-xs space-y-1">
                      <div className="flex items-center gap-2 text-slate-700">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Pago en <strong>Efectivo</strong>: Pagas con {businessProfile.currency}{order.cashPayment.amountPaid}</span>
                      </div>
                      {order.cashPayment.changeNeeded > 0 ? (
                        <p className="text-[11px] text-emerald-700 font-semibold pl-5">
                          Cambio que recibirás: {businessProfile.currency}{order.cashPayment.changeNeeded}
                        </p>
                      ) : (
                        <p className="text-[11px] text-slate-500 pl-5">
                          Monto exacto (sin cambio).
                        </p>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-[11px] text-slate-500 block">Total</span>
                      <span className="text-lg font-extrabold text-slate-900 font-mono">
                        {businessProfile.currency}{order.total}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        /* CITAS TAB */
        appointments.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No tienes citas agendadas</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Explora los servicios de spa y bienestar en el catálogo para programar tu próxima cita.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {uniqueAppointments.map((app, index) => {
              const startDate = new Date(app.startTimeUtc);
              const endDate = new Date(app.endTimeUtc);

              return (
                <div key={`${app.id}-${index}`} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                  <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                    <div>
                      <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                        {app.appointmentNumber}
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{app.serviceName}</h3>
                    </div>
                    <div>{getAppointmentStatusBadge(app.status)}</div>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl space-y-2 text-sm text-slate-700">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <strong className="text-slate-900">
                        {startDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>
                        {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                        {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-slate-400" />
                      <span>Especialista: <strong className="text-slate-900">{app.providerName}</strong></span>
                    </div>

                    <div className="pt-1 flex items-center justify-between gap-2 text-xs border-t border-slate-200/60">
                      <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                        app.modality === 'domicilio' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {app.modality === 'domicilio' ? 'A Domicilio' : 'En Spa / Local'}
                      </span>
                      {app.customerAddress && (
                        <span className="text-[11px] text-slate-600 truncate">
                          📍 {app.customerAddress}
                        </span>
                      )}
                    </div>

                    {app.customerNotes && (
                      <div className="text-xs text-slate-500 italic pt-1 border-t border-slate-200">
                        Notas: "{app.customerNotes}"
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-base font-extrabold text-slate-900 font-mono">
                        {app.priceType === 'a_cotizar' ? 'A Cotizar' : `${businessProfile.currency}${app.totalPrice.toFixed(2)}`}
                      </span>
                      {app.travelSurcharge && app.travelSurcharge > 0 ? (
                        <span className="text-[10px] text-amber-700 block font-medium">
                          (incluye +{businessProfile.currency}{app.travelSurcharge} traslado)
                        </span>
                      ) : null}
                    </div>

                    {app.status !== 'cancelada' && app.status !== 'completada' && (() => {
                      const now = new Date();
                      const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
                      const minHours = app.minCancellationHours || 4;
                      const canCancel = hoursUntilStart >= minHours;

                      return canCancel ? (
                        <button
                          onClick={() => {
                            if (window.confirm('¿Confirmas que deseas cancelar esta cita?')) {
                              updateAppointmentStatus(app.id, 'cancelada');
                            }
                          }}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-semibold transition-colors"
                        >
                          Cancelar Cita
                        </button>
                      ) : (
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 block italic">
                            Política de cancelación ({minHours}h antes)
                          </span>
                          <span className="text-[11px] font-semibold text-rose-600">
                            No cancelable en línea
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Digital Ticket Modal */}
      {ticketOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 font-mono text-xs">
            {/* Ticket Header */}
            <div className="text-center pb-3 border-b border-dashed border-slate-300 space-y-1">
              <h3 className="font-bold text-sm tracking-tight text-slate-900">
                {businessProfile.name || 'Ticket Comercial'}
              </h3>
              <p className="text-[11px] text-slate-500">{businessProfile.slogan}</p>
              <p className="text-[10px] text-slate-400">{businessProfile.address}</p>
              <p className="text-[10px] text-slate-400">Tel: {businessProfile.phone}</p>
              <div className="pt-2 font-bold text-slate-800 text-xs">
                TICKET {ticketOrder.orderNumber}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between">
                <span>Tipo de Pedido:</span>
                <span className="font-bold text-blue-700">Para Recoger en Local</span>
              </div>
              <div className="flex justify-between">
                <span>Fecha:</span>
                <span>{new Date(ticketOrder.createdAt).toLocaleString('es-ES')}</span>
              </div>
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span>{ticketOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Teléfono:</span>
                <span>{ticketOrder.customerPhone}</span>
              </div>
              {ticketOrder.customerNotes && (
                <div className="text-[10px] text-slate-600 pt-0.5">
                  Notas: {ticketOrder.customerNotes}
                </div>
              )}
            </div>

            {/* Line items */}
            <div className="py-2 border-y border-dashed border-slate-300 space-y-1.5 text-[11px]">
              {ticketOrder.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div>
                    <span>{item.quantity}x {item.productName}</span>
                    {item.selectedOptions.length > 0 && (
                      <p className="text-[9px] text-slate-500">
                        {item.selectedOptions.map((o) => o.optionName).join(', ')}
                      </p>
                    )}
                  </div>
                  <span>{businessProfile.currency}{item.unitPrice * item.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between font-bold text-sm text-slate-900 pt-1">
                <span>TOTAL:</span>
                <span>{businessProfile.currency}{ticketOrder.total}</span>
              </div>
              <div className="flex justify-between text-slate-600 pt-1">
                <span>Paga en Efectivo:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.amountPaid}</span>
              </div>
              <div className="flex justify-between font-bold text-emerald-700">
                <span>Cambio:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.changeNeeded}</span>
              </div>
            </div>

            <div className="text-center pt-2 text-[10px] text-slate-400">
              ¡Gracias por tu compra!
            </div>

            {/* Actions */}
            <div className="pt-2 flex gap-2 font-sans">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={() => setTicketOrder(null)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors ${theme.buttonClass}`}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

