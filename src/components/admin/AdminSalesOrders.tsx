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
  Calendar,
  Sparkles,
  Download,
  Filter,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, Appointment, AppointmentStatus } from '../../types';

export const AdminSalesOrders: React.FC = () => {
  const {
    orders,
    appointments,
    updateOrderStatus,
    updateAppointmentStatus,
    markOrderPaymentReceived,
    deleteOrder,
    deleteAppointment,
    clearAllOrders,
    businessProfile,
    theme,
  } = useApp();

  // Tab filter: 'all' (Todas las comandas), 'pedido' (Solo productos), 'cita' (Solo servicios de spa)
  const [comandaType, setComandaType] = useState<'all' | 'pedido' | 'cita'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [ticketOrder, setTicketOrder] = useState<Order | null>(null);
  const [ticketAppointment, setTicketAppointment] = useState<Appointment | null>(null);
  const [showClearConfirmModal, setShowClearConfirmModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Appointment | null>(null);

  // Status mapping for product orders
  const getOrderStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'en_preparacion':
        return {
          label: 'En Preparación / Empaque',
          bg: 'bg-blue-100 text-blue-900 border-blue-300',
          icon: <RotateCcw className="w-3.5 h-3.5" />,
        };
      case 'entregado':
        return {
          label: 'Entregado / Completado',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'cancelado':
        return {
          label: 'Cancelado',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
      default:
        return {
          label: 'Pendiente',
          bg: 'bg-slate-100 text-slate-900 border-slate-300',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
    }
  };

  // Status mapping for appointment services
  const getAppointmentStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'pendiente':
        return {
          label: 'Cita Pendiente',
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5" />,
        };
      case 'confirmada':
        return {
          label: 'Cita Confirmada',
          bg: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'completada':
        return {
          label: 'Servicio Realizado',
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
        };
      case 'cancelada':
        return {
          label: 'Cita Cancelada',
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          icon: <XCircle className="w-3.5 h-3.5" />,
        };
    }
  };

  const generateWhatsAppOrderLink = (order: Order) => {
    const text = encodeURIComponent(
      `¡Hola ${order.customerName}! Te escribimos de *${businessProfile.name || 'nuestro spa'}* sobre tu pedido *#${order.orderNumber}*.\n` +
      `Estado actual: *${order.status.toUpperCase()}*.\n` +
      `Total: ${businessProfile.currency}${order.total} (Pago en Efectivo al recoger).\n` +
      `Cualquier consulta estamos a tu disposición.`
    );
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  const generateWhatsAppAppointmentLink = (app: Appointment) => {
    const text = encodeURIComponent(
      `¡Hola ${app.customerName}! Te escribimos de *${businessProfile.name || 'nuestro spa'}* respecto a tu cita de servicio *#${app.appointmentNumber}*.\n` +
      `Servicio: *${app.serviceName}* con ${app.providerName}.\n` +
      `Estado: *${app.status.toUpperCase()}*.\n` +
      `Total: ${businessProfile.currency}${app.totalPrice || 0}.\n` +
      `¡Te esperamos en cabina!`
    );
    const cleanPhone = app.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  // Build unified comanda items
  interface UnifiedComanda {
    id: string;
    type: 'pedido' | 'cita';
    number: string;
    customerName: string;
    customerPhone: string;
    customerNotes?: string;
    total: number;
    rawDate: string;
    status: string;
    paid: boolean;
    orderData?: Order;
    appointmentData?: Appointment;
  }

  const uniqueOrders = Array.from(new Map(orders.map((o) => [o.id, o])).values());
  const uniqueAppointments = Array.from(new Map(appointments.map((a) => [a.id, a])).values());

  const unifiedList: UnifiedComanda[] = [
    ...uniqueOrders.map((o) => ({
      id: o.id,
      type: 'pedido' as const,
      number: o.orderNumber,
      customerName: o.customerName,
      customerPhone: o.customerPhone,
      customerNotes: o.customerNotes,
      total: o.total,
      rawDate: o.createdAt,
      status: o.status,
      paid: o.paymentReceived,
      orderData: o,
    })),
    ...uniqueAppointments.map((a) => ({
      id: a.id,
      type: 'cita' as const,
      number: a.appointmentNumber,
      customerName: a.customerName,
      customerPhone: a.customerPhone,
      customerNotes: a.customerNotes,
      total: a.totalPrice || 0,
      rawDate: a.createdAt || a.startTimeUtc,
      status: a.status,
      paid: a.status === 'completada',
      appointmentData: a,
    })),
  ].sort((a, b) => new Date(b.rawDate).getTime() - new Date(a.rawDate).getTime());

  // Filter unified items: when selecting 'pedidos' or 'citas', show all of them by default (including canceled ones) unless specific subfilter is chosen
  const filteredList = unifiedList.filter((item) => {
    if (comandaType !== 'all' && item.type !== comandaType) return false;
    if (filterStatus !== 'all') {
      if (filterStatus === 'activas') {
        return (
          item.status === 'pendiente' ||
          item.status === 'en_preparacion' ||
          item.status === 'confirmada'
        );
      }
      if (filterStatus === 'completadas') {
        return item.status === 'entregado' || item.status === 'completada';
      }
      if (filterStatus === 'canceladas') {
        return item.status === 'cancelado' || item.status === 'cancelada';
      }
      return item.status === filterStatus;
    }
    return true;
  });

  // Export CSV of all comandas (orders + appointments)
  const exportAllCSV = () => {
    if (unifiedList.length === 0) return;
    const headers = ['Folio', 'Tipo', 'Fecha', 'Cliente', 'Telefono', 'Detalle/Concepto', 'Total', 'Estado', 'Cobrado'];
    const rows = unifiedList.map((item) => {
      const concept =
        item.type === 'pedido'
          ? item.orderData?.items.map((i) => `${i.quantity}x ${i.productName}`).join('; ') || ''
          : `Servicio: ${item.appointmentData?.serviceName} (${item.appointmentData?.providerName})`;
      return [
        item.number,
        item.type === 'pedido' ? 'Pedido Producto' : 'Cita Servicio',
        `"${new Date(item.rawDate).toLocaleString('es-ES')}"`,
        `"${item.customerName}"`,
        `"${item.customerPhone}"`,
        `"${concept.replace(/"/g, '""')}"`,
        item.total,
        item.status,
        item.paid ? 'SI' : 'NO',
      ];
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `citas_y_ventas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeComandasCount = unifiedList.filter(
    (c) => c.status === 'pendiente' || c.status === 'en_preparacion' || c.status === 'confirmada'
  ).length;

  return (
    <div className="space-y-6">
      {/* Header & Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">
              Citas & Ventas
            </h2>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              {activeComandasCount} activas
            </span>
          </div>

        </div>

        {/* Clean All Orders Button & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            disabled={unifiedList.length === 0}
            onClick={exportAllCSV}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all ${
              unifiedList.length === 0
                ? 'border border-slate-200 text-slate-400 bg-slate-50 cursor-not-allowed opacity-50'
                : 'border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 cursor-pointer shadow-2xs'
            }`}
            title="Exportar todas las citas y ventas en CSV"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>Exportar CSV</span>
          </button>

          {orders.length > 0 && (
            <button
              type="button"
              onClick={() => setShowClearConfirmModal(true)}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all border border-rose-300 text-rose-700 bg-rose-50/60 hover:bg-rose-100 hover:text-rose-800 cursor-pointer shadow-2xs"
              title="Limpiar registro de órdenes de productos"
            >
              <Trash2 className="w-3.5 h-3.5 shrink-0" />
              <span>Limpiar Productos</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs Filter: All Comandas vs Solo Pedidos vs Solo Citas */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Main Category Filter */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl text-xs sm:text-sm font-medium gap-1 w-full sm:w-auto">
          <button
            onClick={() => {
              setComandaType('all');
              setFilterStatus('all');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
              comandaType === 'all'
                ? `${theme.buttonClass} shadow-sm font-bold`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            <span>Todas las Comandas ({unifiedList.length})</span>
          </button>
          <button
            onClick={() => {
              setComandaType('pedido');
              setFilterStatus('all');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
              comandaType === 'pedido'
                ? `${theme.buttonClass} shadow-sm font-bold`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            <Package className="w-3.5 h-3.5 shrink-0" />
            <span>Pedidos de Productos ({orders.length})</span>
          </button>
          <button
            onClick={() => {
              setComandaType('cita');
              setFilterStatus('all');
            }}
            className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all text-center flex items-center justify-center gap-1.5 ${
              comandaType === 'cita'
                ? `${theme.buttonClass} shadow-sm font-bold`
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50 font-medium'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>Citas de Servicios ({appointments.length})</span>
          </button>
        </div>

        {/* Status Subfilter */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-xs flex-wrap">
          <span className="text-slate-400 font-semibold shrink-0">Filtrar Estado:</span>
          {[
            { id: 'all', label: 'Todos' },
            { id: 'activas', label: 'Activas' },
            { id: 'completadas', label: 'Completadas' },
            { id: 'canceladas', label: 'Canceladas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs transition-all text-center font-medium ${
                filterStatus === tab.id
                  ? `${theme.buttonClass} shadow-sm font-bold`
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-2xs'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Comandas Pipeline List */}
      {filteredList.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Receipt className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">
            {unifiedList.length === 0 ? 'No hay comandas registradas' : 'No hay comandas con el filtro seleccionado'}
          </h3>
          <p className="text-xs text-slate-500">
            Las nuevas órdenes de productos y citas de servicios agendadas aparecerán aquí automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredList.map((item, idx) => {
            const isOrder = item.type === 'pedido';
            const order = item.orderData;
            const appointment = item.appointmentData;

            const orderStatusInfo = order ? getOrderStatusBadge(order.status) : null;
            const appStatusInfo = appointment ? getAppointmentStatusBadge(appointment.status) : null;

            return (
              <div
                key={`${item.type}-${item.id}-${idx}`}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
              >
                {/* Comanda Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {item.number}
                    </span>

                    {isOrder ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <Package className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Pedido Mostrador</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200">
                        <Sparkles className="w-3.5 h-3.5 text-rose-600" />
                        <span>Cita de Servicio</span>
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                      <Store className="w-3.5 h-3.5 text-blue-600" />
                      <span>Atención en Spa</span>
                    </span>

                    {/* Status Badge */}
                    {isOrder && orderStatusInfo && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${orderStatusInfo.bg}`}
                      >
                        {orderStatusInfo.icon}
                        <span>{orderStatusInfo.label}</span>
                      </span>
                    )}
                    {!isOrder && appStatusInfo && (
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${appStatusInfo.bg}`}
                      >
                        {appStatusInfo.icon}
                        <span>{appStatusInfo.label}</span>
                      </span>
                    )}

                    <span className="text-xs text-slate-400">
                      {new Date(item.rawDate).toLocaleString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Actions: Change Status & Delete */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-500">Cambiar estado:</span>
                    {isOrder && order && (
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value as OrderStatus)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="en_preparacion">En Preparación / Empaque</option>
                        <option value="entregado">Completado / Entregado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    )}
                    {!isOrder && appointment && (
                      <select
                        value={appointment.status}
                        onChange={(e) => updateAppointmentStatus(appointment.id, e.target.value as AppointmentStatus)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="pendiente">Pendiente</option>
                        <option value="confirmada">Confirmada</option>
                        <option value="completada">Completada / Realizada</option>
                        <option value="cancelada">Cancelada</option>
                      </select>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        if (isOrder && order) setOrderToDelete(order);
                        if (!isOrder && appointment) setAppointmentToDelete(appointment);
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
                      title="Eliminar esta comanda"
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
                      <span>{item.customerName}</span>
                    </div>
                    <div className="text-slate-600 font-mono">{item.customerPhone}</div>
                    {item.customerNotes && (
                      <p className="text-[11px] text-amber-900 font-medium bg-amber-50 p-1 rounded mt-1">
                        Nota: "{item.customerNotes}"
                      </p>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-slate-400 font-semibold block text-[10px] uppercase">
                      Cobro / Importe
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900 font-mono">
                        Total: {businessProfile.currency}{item.total}
                      </span>
                    </div>
                    {isOrder && order && (
                      <div className="text-[11px] text-slate-600">
                        Paga con {businessProfile.currency}{order.cashPayment.amountPaid} · Cambio:{' '}
                        <strong className="text-emerald-700">
                          {businessProfile.currency}{order.cashPayment.changeNeeded}
                        </strong>
                      </div>
                    )}
                    {!isOrder && appointment && (
                      <div className="text-[11px] text-slate-600">
                        Atención en cabina · Especialista: <strong>{appointment.providerName}</strong>
                      </div>
                    )}
                  </div>
                </div>

                {/* Detail: Product Items or Service Details */}
                <div className="space-y-2 text-xs">
                  <div className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                    {isOrder ? 'Detalle de Productos' : 'Detalle del Servicio Agendado'}
                  </div>

                  {isOrder && order && (
                    <div className="divide-y divide-slate-100">
                      {order.items.map((prodItem) => (
                        <div key={prodItem.id} className="py-2 flex items-start justify-between gap-3">
                          <div>
                            <span className="font-bold text-slate-900">
                              {prodItem.quantity}x {prodItem.productName}
                            </span>
                            {prodItem.selectedOptions.length > 0 && (
                              <div className="pl-3 text-[11px] text-slate-600 mt-0.5 space-y-0.5">
                                {prodItem.selectedOptions.map((opt, i) => (
                                  <span key={i} className="inline-block mr-2 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {opt.groupTitle}: <strong>{opt.optionName}</strong>{' '}
                                    {opt.priceDelta > 0 && `(+${businessProfile.currency}${opt.priceDelta})`}
                                  </span>
                                ))}
                              </div>
                            )}
                            {prodItem.customerNotes && (
                              <p className="text-[11px] text-amber-800 bg-amber-50 p-1 rounded mt-1 font-medium">
                                Nota: "{prodItem.customerNotes}"
                              </p>
                            )}
                          </div>
                          <span className="font-mono font-bold text-slate-800 shrink-0">
                            {businessProfile.currency}{prodItem.unitPrice * prodItem.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {!isOrder && appointment && (
                    <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-slate-900 text-sm">
                          {appointment.serviceName}
                        </div>
                        <div className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-2">
                          <span>Especialista: <strong>{appointment.providerName}</strong></span>
                          <span>·</span>
                          <span>
                            Horario:{' '}
                            {new Date(appointment.startTimeUtc).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            -{' '}
                            {new Date(appointment.endTimeUtc).toLocaleTimeString('es-ES', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-base text-slate-900">
                        {businessProfile.currency}{appointment.totalPrice || 0}
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Buttons: Cash Confirmation, WhatsApp, Ticket */}
                <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {isOrder && order && (
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
                          {order.paymentReceived ? 'Cobrado en Caja ✓' : 'Marcar Cobrado'}
                        </span>
                      </button>
                    )}
                    {!isOrder && appointment && (
                      <button
                        onClick={() =>
                          updateAppointmentStatus(
                            appointment.id,
                            appointment.status === 'completada' ? 'confirmada' : 'completada'
                          )
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          appointment.status === 'completada'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>
                          {appointment.status === 'completada' ? 'Servicio Realizado ✓' : 'Completar y Cobrar'}
                        </span>
                      </button>
                    )}

                    {/* WhatsApp */}
                    <a
                      href={isOrder && order ? generateWhatsAppOrderLink(order) : appointment ? generateWhatsAppAppointmentLink(appointment) : '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </a>
                  </div>

                  {/* Print / Ticket Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => {
                      if (isOrder && order) setTicketOrder(order);
                      if (!isOrder && appointment) setTicketAppointment(appointment);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex items-center gap-1.5"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                    <span>Ver Comanda / Ticket</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Ticket Modal for Product Order */}
      {ticketOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-slate-900 font-mono text-xs">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h3 className="font-black text-sm uppercase tracking-wider">
                {businessProfile.name || 'SPA & BIENESTAR'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">{businessProfile.slogan}</p>
              <p className="text-[10px] text-slate-500">{businessProfile.address}</p>
              <p className="text-[10px] text-slate-500">Tel: {businessProfile.phone}</p>
            </div>

            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>COMANDA:</span>
                <span className="font-bold">{ticketOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{new Date(ticketOrder.createdAt).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex justify-between">
                <span>CLIENTE:</span>
                <span className="font-bold">{ticketOrder.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>MODALIDAD:</span>
                <span>Retiro en Local / Spa</span>
              </div>
            </div>

            {/* Items */}
            <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
              {ticketOrder.items.map((it) => (
                <div key={it.id} className="flex justify-between">
                  <span>{it.quantity}x {it.productName}</span>
                  <span className="font-bold">{businessProfile.currency}{it.unitPrice * it.quantity}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1 text-sm font-bold pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-base">
                <span>TOTAL:</span>
                <span>{businessProfile.currency}{ticketOrder.total}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-normal">
                <span>Efectivo recibido:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.amountPaid}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-normal">
                <span>Cambio:</span>
                <span>{businessProfile.currency}{ticketOrder.cashPayment.changeNeeded}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-1">
              ¡Gracias por tu preferencia!
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTicketOrder(null)}
                className="w-full py-2 border border-slate-300 rounded-xl font-sans text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2 bg-slate-900 text-white rounded-xl font-sans text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ticket Modal for Service Appointment */}
      {ticketAppointment && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-slate-200 text-slate-900 font-mono text-xs">
            <div className="text-center pb-3 border-b border-dashed border-slate-300">
              <h3 className="font-black text-sm uppercase tracking-wider">
                {businessProfile.name || 'SPA & BIENESTAR'}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">COMPROBANTE DE CITA DE SERVICIO</p>
              <p className="text-[10px] text-slate-500">{businessProfile.address}</p>
              <p className="text-[10px] text-slate-500">Tel: {businessProfile.phone}</p>
            </div>

            <div className="space-y-1 text-[11px] pb-2 border-b border-dashed border-slate-300">
              <div className="flex justify-between">
                <span>FOLIO:</span>
                <span className="font-bold">{ticketAppointment.appointmentNumber}</span>
              </div>
              <div className="flex justify-between">
                <span>FECHA:</span>
                <span>{new Date(ticketAppointment.startTimeUtc).toLocaleDateString('es-ES')}</span>
              </div>
              <div className="flex justify-between">
                <span>HORA:</span>
                <span>
                  {new Date(ticketAppointment.startTimeUtc).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>CLIENTE:</span>
                <span className="font-bold">{ticketAppointment.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>ESPECIALISTA:</span>
                <span>{ticketAppointment.providerName}</span>
              </div>
            </div>

            {/* Service item */}
            <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between font-bold">
                <span>1x {ticketAppointment.serviceName}</span>
                <span>{businessProfile.currency}{ticketAppointment.totalPrice || 0}</span>
              </div>
            </div>

            {/* Total */}
            <div className="space-y-1 text-sm font-bold pb-3 border-b border-dashed border-slate-300">
              <div className="flex justify-between text-base">
                <span>TOTAL:</span>
                <span>{businessProfile.currency}{ticketAppointment.totalPrice || 0}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-600 font-normal">
                <span>ESTADO:</span>
                <span className="capitalize">{ticketAppointment.status}</span>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-500 pt-1">
              ¡Gracias por consentirte con nosotros!
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTicketAppointment(null)}
                className="w-full py-2 border border-slate-300 rounded-xl font-sans text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="w-full py-2 bg-slate-900 text-white rounded-xl font-sans text-xs font-bold hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Clear All Product Orders */}
      {showClearConfirmModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <AlertCircle className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ¿Limpiar registro de pedidos?
                </h3>
                <p className="text-[11px] text-slate-500">
                  Esta acción eliminará las órdenes de productos registradas.
                </p>
              </div>
            </div>

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

      {/* Confirmation Modal: Delete Single Appointment */}
      {appointmentToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 bg-rose-100 rounded-xl">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ¿Eliminar cita {appointmentToDelete.appointmentNumber}?
                </h3>
                <p className="text-[11px] text-slate-500">
                  {appointmentToDelete.serviceName} · Cliente: {appointmentToDelete.customerName}
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              ¿Estás seguro de que deseas eliminar esta cita de servicio?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAppointmentToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteAppointment(appointmentToDelete.id);
                  setAppointmentToDelete(null);
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
