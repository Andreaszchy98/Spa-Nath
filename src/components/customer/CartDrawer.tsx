import React, { useState } from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  User,
  Phone,
  FileText,
  Store,
  MapPin,
  Clock,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const CartDrawer: React.FC = () => {
  const {
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    cartTotal,
    businessProfile,
    currentUser,
    createOrder,
    setCustomerTab,
    theme,
  } = useApp();

  // Checkout form state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [customerName, setCustomerName] = useState(currentUser.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser.phone || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  if (!isCartDrawerOpen) return null;

  const grandTotal = cartTotal;

  // Auto initialize cashAmount default to round figure
  const defaultCashSuggestion = Math.ceil(grandTotal / 50) * 50 || grandTotal;
  const effectiveCashAmount = cashAmount > 0 ? cashAmount : defaultCashSuggestion;
  const changeNeeded = Math.max(0, effectiveCashAmount - grandTotal);
  const isCashInsufficient = effectiveCashAmount < grandTotal;

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (cart.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      setCheckoutError('Por favor ingresa tu nombre y teléfono de contacto.');
      return;
    }
    if (isCashInsufficient) {
      setCheckoutError(`El monto en efectivo debe cubrir el total (${businessProfile.currency}${grandTotal}).`);
      return;
    }

    const newOrder = createOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerNotes: customerNotes.trim() || undefined,
      items: cart,
      subtotal: cartTotal,
      total: grandTotal,
      paymentMethod: 'efectivo',
      cashPayment: {
        amountPaid: effectiveCashAmount,
        changeNeeded,
      },
      paymentReceived: false,
      status: 'pendiente',
    });

    setConfirmedOrderId(newOrder.orderNumber);
    clearCart();
  };

  const handleFinishAndTrack = () => {
    setIsCartDrawerOpen(false);
    setIsCheckingOut(false);
    setConfirmedOrderId(null);
    setCustomerTab('pedidos');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-slate-900 text-base">
              {confirmedOrderId
                ? '¡Pedido Confirmado!'
                : isCheckingOut
                ? 'Finalizar Pedido en Efectivo'
                : `Tu Carrito (${cart.length})`}
            </h3>
          </div>
          <button
            onClick={() => {
              setIsCartDrawerOpen(false);
              setIsCheckingOut(false);
              setConfirmedOrderId(null);
            }}
            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {confirmedOrderId ? (
            /* Order Placed Confirmation Screen */
            <div className="text-center py-8 px-2 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Orden Registrada
                </span>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">
                  #{confirmedOrderId}
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 mt-2">
                  Hemos enviado tu pedido a <strong>{businessProfile.name || 'nuestro local'}</strong>.
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-left text-xs space-y-1.5">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Modalidad:</span>
                  <span className="text-blue-600 font-bold">Para Recoger en Local</span>
                </div>
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>Método de pago:</span>
                  <span>Efectivo</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pagas con:</span>
                  <span>{businessProfile.currency}{effectiveCashAmount}</span>
                </div>
                {changeNeeded > 0 && (
                  <div className="flex justify-between font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded">
                    <span>Cambio que recibirás:</span>
                    <span>{businessProfile.currency}{changeNeeded}</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleFinishAndTrack}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm shadow-sm transition-all ${theme.buttonClass}`}
              >
                Ver Estado en Mis Pedidos
              </button>
            </div>
          ) : isCheckingOut ? (
            /* Checkout Form (Solo para recoger en tienda / pickup) */
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4">
              {/* Pickup Mode Notice */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                <Store className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-950">
                    <span>Modalidad de Pedido: Para Recoger</span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-blue-200 text-blue-800 font-extrabold uppercase">
                      Exclusivo
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 leading-relaxed">
                    Preparamos tu orden en nuestro establecimiento y estará lista para su retiro en:
                  </p>
                  <p className="text-[11px] font-semibold text-blue-950 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0 text-blue-600" />
                    <span>{businessProfile.address || 'Mostrador principal del local'}</span>
                  </p>
                </div>
              </div>

              {/* Customer Contact Information */}
              <div className="space-y-3">
                {checkoutError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{checkoutError}</span>
                  </div>
                )}
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Tu Nombre Completo *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej. Mariana Gómez"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Teléfono / WhatsApp *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Ej. +52 55 1234 5678"
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hora estimada de recogida o notas
                  </label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <textarea
                      rows={2}
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Ej: Paso a recoger a las 2:30pm, empacar para llevar..."
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Cash Payment Section (Pagos: Efectivo) */}
              <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-950">
                  <DollarSign className="w-4 h-4 text-amber-700" />
                  <span>Pago en Efectivo</span>
                </div>
                <p className="text-[11px] text-amber-800">
                  Para tener listo tu cambio exacto, indícanos con cuánto vas a pagar:
                </p>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                      {businessProfile.currency}
                    </span>
                    <input
                      type="number"
                      min={grandTotal}
                      step={5}
                      value={effectiveCashAmount}
                      onChange={(e) => setCashAmount(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 text-sm font-bold bg-white border border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {/* Quick round amounts */}
                  {[grandTotal, Math.ceil(grandTotal / 50) * 50, Math.ceil(grandTotal / 100) * 100]
                    .filter((val, idx, arr) => arr.indexOf(val) === idx && val >= grandTotal)
                    .map((quickVal) => (
                      <button
                        key={quickVal}
                        type="button"
                        onClick={() => setCashAmount(quickVal)}
                        className={`px-2 py-2 text-xs rounded-lg border font-medium transition-colors ${
                          effectiveCashAmount === quickVal
                            ? 'bg-amber-700 text-white border-amber-700'
                            : 'bg-white text-slate-700 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        {businessProfile.currency}{quickVal}
                      </button>
                    ))}
                </div>

                {/* Real-time change calculation */}
                {isCashInsufficient ? (
                  <div className="text-[11px] text-rose-700 font-medium flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Monto insuficiente. El total es {businessProfile.currency}{grandTotal}.</span>
                  </div>
                ) : (
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-semibold text-emerald-800 flex items-center justify-between">
                    <span>Cambio a devolverte:</span>
                    <span className="text-sm font-bold text-emerald-700 font-mono">
                      {businessProfile.currency}{changeNeeded}
                    </span>
                  </div>
                )}
              </div>
            </form>
          ) : cart.length === 0 ? (
            /* Empty Cart */
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">Tu carrito está vacío</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Explora el catálogo y personaliza tus platillos o productos favoritos.
              </p>
            </div>
          ) : (
            /* Items List */
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.productName}
                        className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                          {item.productName}
                        </h4>
                        <span className="text-slate-500 font-mono">
                          {businessProfile.currency}{item.unitPrice} c/u
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                      aria-label="Eliminar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Selected Options Breakdown */}
                  {item.selectedOptions.length > 0 && (
                    <div className="pl-2 border-l-2 border-slate-200 space-y-0.5 text-[11px] text-slate-600">
                      {item.selectedOptions.map((opt, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>• {opt.optionName}</span>
                          {opt.priceDelta > 0 && (
                            <span className="font-medium text-slate-700">
                              +{businessProfile.currency}{opt.priceDelta}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {item.customerNotes && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-1 rounded font-medium">
                      Nota: {item.customerNotes}
                    </p>
                  )}

                  {/* Quantity Stepper & Line Subtotal */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white overflow-hidden shadow-2xs">
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 py-1 text-xs font-bold text-slate-900 min-w-6 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-slate-900 text-sm font-mono">
                      {businessProfile.currency}{item.unitPrice * item.quantity}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer / Pricing & Actions */}
        {!confirmedOrderId && cart.length > 0 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 space-y-3">
            <div className="space-y-1 text-xs text-slate-600">
              <div className="flex justify-between text-base font-bold text-slate-900 pt-1">
                <span>Total a Pagar:</span>
                <span className="font-mono">{businessProfile.currency}{grandTotal}</span>
              </div>
            </div>

            {isCheckingOut ? (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsCheckingOut(false)}
                  className="px-3 py-2.5 rounded-xl border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-100 transition-colors"
                >
                  Volver al Carrito
                </button>
                <button
                  type="submit"
                  form="checkout-form"
                  disabled={isCashInsufficient}
                  className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${
                    isCashInsufficient ? 'bg-slate-400 text-white cursor-not-allowed' : theme.buttonClass
                  }`}
                >
                  <span>Confirmar Pedido (Efectivo)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setIsCheckingOut(true)}
                className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2 ${theme.buttonClass}`}
              >
                <span>Proceder al Pago en Efectivo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
