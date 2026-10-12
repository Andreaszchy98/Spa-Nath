import React, { useState } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  Clock,
  CheckCircle2,
  Printer,
  Search,
  MessageCircle,
  User,
  Navigation,
  DollarSign,
  AlertCircle,
  Store,
  ExternalLink,
  ChevronRight,
  Send,
  Edit2,
  Save,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus, ShippingDetails } from '../../types';

export const AdminLogistics: React.FC = () => {
  const { orders, updateOrderShipping, updateOrderStatus, businessProfile, theme } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'domicilio' | 'recoger'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pendiente' | 'en_preparacion' | 'en_ruta' | 'entregado'>('all');

  // Shipment being edited for courier / tracking details
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [carrierName, setCarrierName] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [driverName, setDriverName] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  // Shipping label / slip modal
  const [labelOrder, setLabelOrder] = useState<Order | null>(null);

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    // Delivery type filter
    if (filterType === 'domicilio' && order.orderType === 'recoger') return false;
    if (filterType === 'recoger' && order.orderType !== 'recoger') return false;

    // Status filter
    if (statusFilter !== 'all' && order.status !== statusFilter) return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNumber = order.orderNumber.toLowerCase().includes(q);
      const matchCustomer = order.customerName.toLowerCase().includes(q);
      const matchPhone = order.customerPhone.includes(q);
      const matchAddress = order.customerAddress?.toLowerCase().includes(q);
      const matchTracking = order.shippingDetails?.trackingNumber?.toLowerCase().includes(q);
      const matchCarrier = order.shippingDetails?.carrierName?.toLowerCase().includes(q);
      return matchNumber || matchCustomer || matchPhone || matchAddress || matchTracking || matchCarrier;
    }

    return true;
  });

  // Logistics metrics
  const deliveryOrders = orders.filter((o) => o.orderType !== 'recoger');
  const pickupOrders = orders.filter((o) => o.orderType === 'recoger');
  const pendingDispatch = orders.filter((o) => o.status === 'pendiente' || o.status === 'en_preparacion');
  const inTransit = orders.filter((o) => o.status === 'en_ruta');
  const delivered = orders.filter((o) => o.status === 'entregado');

  const openEditModal = (order: Order) => {
    setEditingOrder(order);
    setCarrierName(order.shippingDetails?.carrierName || 'Reparto Propio (Spa Nath)');
    setTrackingNumber(order.shippingDetails?.trackingNumber || `GUIA-${order.orderNumber.replace('PED-', '')}`);
    setDriverName(order.shippingDetails?.driverName || '');
    setDriverPhone(order.shippingDetails?.driverPhone || '');
    setDeliveryNotes(order.shippingDetails?.notes || '');
    setEstimatedDelivery(order.shippingDetails?.estimatedDelivery || 'Hoy (1 a 2 horas)');
  };

  const handleSaveShipping = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrder) return;

    const updates: Partial<ShippingDetails> = {
      carrierName: carrierName.trim() || undefined,
      trackingNumber: trackingNumber.trim() || undefined,
      driverName: driverName.trim() || undefined,
      driverPhone: driverPhone.trim() || undefined,
      notes: deliveryNotes.trim() || undefined,
      estimatedDelivery: estimatedDelivery.trim() || undefined,
      dispatchedAt: editingOrder.shippingDetails?.dispatchedAt || new Date().toISOString(),
    };

    await updateOrderShipping(editingOrder.id, updates);
    setEditingOrder(null);
  };

  const handleQuickStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return;

    const updates: Partial<ShippingDetails> = {};
    if (newStatus === 'en_ruta') {
      updates.dispatchedAt = new Date().toISOString();
    } else if (newStatus === 'entregado') {
      updates.deliveredAt = new Date().toISOString();
    }

    await updateOrderShipping(orderId, updates, newStatus);
  };

  const printShippingLabel = (order: Order) => {
    setLabelOrder(order);
  };

  const generateWhatsAppTrackingLink = (order: Order) => {
    const isPickup = order.orderType === 'recoger';
    const text = encodeURIComponent(
      `¡Hola ${order.customerName}! Te escribimos de *${businessProfile.name || 'Spa Nath'}*.\n` +
      `📦 Actualización de tu pedido *#${order.orderNumber}*:\n` +
      `• Estado: *${order.status.toUpperCase()}*\n` +
      (isPickup
        ? `• Modalidad: *Retiro en Spa / Mostrador*\n• Dirección: ${businessProfile.address || 'Local principal'}\n`
        : `• Modalidad: *Envío a Domicilio*\n• Dirección de Entrega: ${order.customerAddress || 'Registrada en perfil'}\n` +
          (order.shippingDetails?.carrierName ? `• Repartidor / Paquetería: ${order.shippingDetails.carrierName}\n` : '') +
          (order.shippingDetails?.trackingNumber ? `• Guía de Rastreo: *${order.shippingDetails.trackingNumber}*\n` : '') +
          (order.shippingDetails?.estimatedDelivery ? `• Estimado de llegada: ${order.shippingDetails.estimatedDelivery}\n` : '')) +
      `• Total a pagar: ${businessProfile.currency}${order.total} (en efectivo contra entrega).\n\n` +
      `¡Cualquier duda estamos para servirte!`
    );
    const cleanPhone = order.customerPhone.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Quick Overview */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
              <Truck className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Logística de Envíos & Despacho
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Control de paquetes para entrega a domicilio, asignación de repartidores, guías de rastreo y retiros en tienda.
          </p>
        </div>

        {/* Global summary badge */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center gap-1.5 shadow-2xs">
            <Package className="w-3.5 h-3.5" />
            <span>{orders.length} pedidos totales</span>
          </span>
          <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1.5 shadow-2xs">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingDispatch.length} pendientes</span>
          </span>
        </div>
      </div>

      {/* 2. Key Logistics Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">A Domicilio</span>
            <Truck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 font-mono">{deliveryOrders.length}</div>
          <p className="text-[10px] text-slate-500">Envíos por mensajería/reparto</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Por Despachar</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-mono">{pendingDispatch.length}</div>
          <p className="text-[10px] text-amber-600 font-semibold">Requieren empaque/salida</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">En Ruta</span>
            <Navigation className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-blue-700 font-mono">{inTransit.length}</div>
          <p className="text-[10px] text-blue-600">Con repartidor en camino</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-semibold uppercase tracking-wider">Entregados</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 font-mono">{delivered.length}</div>
          <p className="text-[10px] text-emerald-600 font-semibold">Entregas completadas</p>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por orden, cliente, dirección o guía de rastreo..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                filterType === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({orders.length})
            </button>
            <button
              onClick={() => setFilterType('domicilio')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filterType === 'domicilio'
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>A Domicilio ({deliveryOrders.length})</span>
            </button>
            <button
              onClick={() => setFilterType('recoger')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                filterType === 'recoger'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              <span>En Spa ({pickupOrders.length})</span>
            </button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Filtro de Estado:
          </span>
          {[
            { id: 'all' as const, label: 'Cualquiera' },
            { id: 'pendiente' as const, label: 'Pendiente de despacho' },
            { id: 'en_preparacion' as const, label: 'En empaque' },
            { id: 'en_ruta' as const, label: 'En ruta de reparto' },
            { id: 'entregado' as const, label: 'Entregados' },
          ].map((statusTab) => (
            <button
              key={statusTab.id}
              onClick={() => setStatusFilter(statusTab.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === statusTab.id
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {statusTab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Shipments / Orders Dispatch List */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <Truck className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay envíos que coincidan con el filtro</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Cuando los clientes realicen pedidos a domicilio o para retiro en mostrador, aparecerán aquí para gestionar su despacho.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isPickup = order.orderType === 'recoger';

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4 transition-all hover:border-slate-300"
              >
                {/* Header of shipment */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-mono text-base font-extrabold text-slate-900">
                      {order.orderNumber}
                    </span>

                    {/* Delivery type tag */}
                    {isPickup ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200">
                        <Store className="w-3.5 h-3.5 text-blue-600" />
                        <span>Retiro en Mostrador</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Envío a Domicilio</span>
                      </span>
                    )}

                    {/* Status badge */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        order.status === 'entregado'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : order.status === 'en_ruta'
                          ? 'bg-blue-50 text-blue-800 border-blue-200'
                          : order.status === 'en_preparacion'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {order.status === 'entregado' ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      ) : order.status === 'en_ruta' ? (
                        <Navigation className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
                      ) : (
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                      )}
                      <span>
                        {order.status === 'entregado'
                          ? 'Entregado'
                          : order.status === 'en_ruta'
                          ? 'En Ruta de Entrega'
                          : order.status === 'en_preparacion'
                          ? 'En Empaque'
                          : 'Por Despachar'}
                      </span>
                    </span>

                    <span className="text-xs text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString('es-ES', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>

                  {/* Quick Dispatch Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <select
                      value={order.status}
                      onChange={(e) => handleQuickStatusChange(order.id, e.target.value as OrderStatus)}
                      className="px-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="pendiente">Por Despachar</option>
                      <option value="en_preparacion">En Empaque</option>
                      <option value="en_ruta">En Ruta de Entrega</option>
                      <option value="entregado">Entregado con Éxito</option>
                      <option value="cancelado">Cancelado</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => openEditModal(order)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Editar datos de paquetería o repartidor"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden xs:inline">Detalles Envío</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => printShippingLabel(order)}
                      className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1 transition-all"
                      title="Imprimir remisión / etiqueta de empaque"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-500" />
                      <span className="hidden xs:inline">Etiqueta</span>
                    </button>
                  </div>
                </div>

                {/* Logistics Body */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  {/* Customer & Destination */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Destinatario y Entrega
                    </span>
                    <div className="font-bold text-slate-900 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="text-slate-600 font-mono flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="text-slate-700 flex items-start gap-1.5 pt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        {isPickup
                          ? `Recoge en mostrador: ${businessProfile.address || 'Local central'}`
                          : order.customerAddress || 'Dirección no especificada'}
                      </span>
                    </div>
                    {order.customerNotes && (
                      <p className="text-[11px] text-amber-900 bg-amber-50 p-1.5 rounded-lg border border-amber-200 font-medium">
                        Nota: "{order.customerNotes}"
                      </p>
                    )}
                  </div>

                  {/* Courier / Driver / Tracking Details */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Transporte y Guía
                      </span>
                      <button
                        onClick={() => openEditModal(order)}
                        className="text-[11px] text-indigo-600 hover:underline font-bold"
                      >
                        Editar
                      </button>
                    </div>

                    <div className="space-y-1">
                      <p className="font-semibold text-slate-900">
                        {order.shippingDetails?.carrierName || (isPickup ? 'Retiro en persona' : 'Sin asignar aún')}
                      </p>
                      {order.shippingDetails?.trackingNumber && (
                        <p className="font-mono text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block font-bold">
                          Guía: {order.shippingDetails.trackingNumber}
                        </p>
                      )}
                      {order.shippingDetails?.driverName && (
                        <p className="text-slate-600 text-[11px]">
                          Repartidor: <strong>{order.shippingDetails.driverName}</strong>
                          {order.shippingDetails.driverPhone ? ` (${order.shippingDetails.driverPhone})` : ''}
                        </p>
                      )}
                      {order.shippingDetails?.estimatedDelivery && (
                        <p className="text-slate-500 text-[11px]">
                          Estimado: {order.shippingDetails.estimatedDelivery}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Package contents & Cash on delivery */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Contenido del Paquete
                    </span>
                    <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-slate-800 text-[11px]">
                          <span className="font-medium truncate max-w-[170px]">
                            {item.quantity}x {item.productName}
                          </span>
                          <span className="font-mono text-slate-500">
                            {businessProfile.currency}{item.unitPrice * item.quantity}
                          </span>
                        </div>
                      ))}
                    </div>
                    <div className="pt-1.5 border-t border-slate-200 flex justify-between items-center font-bold text-slate-900">
                      <span>Cobro en Efectivo:</span>
                      <span className="text-sm font-mono text-emerald-700">
                        {businessProfile.currency}{order.total}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer with WhatsApp tracking share */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span>
                      {order.items.reduce((sum, it) => sum + it.quantity, 0)} artículos en paquete
                    </span>
                    {order.paymentReceived ? (
                      <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ Pagado
                      </span>
                    ) : (
                      <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        Cobro pendiente al entregar
                      </span>
                    )}
                  </div>

                  <a
                    href={generateWhatsAppTrackingLink(order)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-2xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Enviar Guía por WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Courier & Tracking Editor Modal */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-600" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  Datos de Envío · {editingOrder.orderNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingOrder(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveShipping} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Empresa de Paquetería o Método de Reparto
                </label>
                <input
                  type="text"
                  value={carrierName}
                  onChange={(e) => setCarrierName(e.target.value)}
                  placeholder="Ej. Reparto Propio (Spa Nath), MotoEnvío Express, DHL, FedEx..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Número de Guía o Código de Rastreo
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="Ej. GUIA-84920, TRACK-MEX-1029..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Nombre del Repartidor (Opcional)
                  </label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Ej. Carlos Mendoza"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Teléfono del Repartidor (Opcional)
                  </label>
                  <input
                    type="tel"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    placeholder="+52 55..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Estimado de Entrega
                </label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  placeholder="Ej. Hoy entre 3:00pm y 5:00pm, Mañana por la mañana..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Notas de Ruta / Indicaciones para la Entrega
                </label>
                <textarea
                  rows={2}
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                  placeholder="Ej. Tocar timbre blanco, dejar con portería, llamar al llegar..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingOrder(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Guardar Datos de Envío</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Printable Shipping Slip Modal */}
      {labelOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 p-6 space-y-4">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Hoja de Despacho / Remisión
                </h3>
                <p className="text-xs text-slate-500 font-mono">
                  {labelOrder.orderNumber}
                </p>
              </div>
              <button
                onClick={() => setLabelOrder(null)}
                className="p-1 text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Label Print Preview Content */}
            <div className="border-2 border-dashed border-slate-300 p-4 rounded-2xl space-y-3 bg-slate-50/50 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-extrabold text-sm text-slate-900">
                  {businessProfile.name || 'Spa Nath'}
                </span>
                <span className="font-mono text-[11px] font-bold bg-slate-200 px-2 py-0.5 rounded">
                  {labelOrder.orderType === 'recoger' ? 'RETIRO EN SPA' : 'ENVÍO A DOMICILIO'}
                </span>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Destinatario:</span>
                <p className="font-extrabold text-sm text-slate-900">{labelOrder.customerName}</p>
                <p className="font-mono text-slate-700 font-bold">{labelOrder.customerPhone}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase block">Dirección de Entrega:</span>
                <p className="text-slate-800 font-medium">
                  {labelOrder.orderType === 'recoger'
                    ? `Mostrador: ${businessProfile.address || 'Local principal'}`
                    : labelOrder.customerAddress || 'No especificada'}
                </p>
              </div>

              {labelOrder.shippingDetails?.trackingNumber && (
                <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-200 font-mono text-center">
                  <span className="text-[10px] text-indigo-700 block uppercase font-bold">Guía de Rastreo</span>
                  <span className="text-sm font-black text-indigo-900">{labelOrder.shippingDetails.trackingNumber}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Productos a Empacar:</span>
                <div className="space-y-1">
                  {labelOrder.items.map((it, i) => (
                    <div key={i} className="flex justify-between font-medium text-slate-800 text-[11px]">
                      <span>{it.quantity}x {it.productName}</span>
                      <span>{businessProfile.currency}{it.unitPrice * it.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-extrabold text-slate-900 text-sm">
                <span>Total a Cobrar:</span>
                <span className="font-mono text-emerald-700">{businessProfile.currency}{labelOrder.total}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLabelOrder(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 text-xs"
              >
                Cerrar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center gap-1.5 text-xs shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir Hoja</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
