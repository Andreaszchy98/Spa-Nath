import React, { useState, useEffect, useId } from 'react';
import { X, Check, AlertCircle, Plus, Minus, ShoppingBag, Info, Tag } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CartItem, SelectedOptionItem } from '../../types';

export const ProductCustomizerModal: React.FC = () => {
  const { modalProductId, closeProductModal, products, addToCart, theme, businessProfile, ingredients } = useApp();
  const notesId = useId();

  const product = products.find((p) => p.id === modalProductId);

  // Selected options map: groupId -> array of selected optionIds
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [imageError, setImageError] = useState(false);

  // Initialize default selections when modal opens
  useEffect(() => {
    if (!product) return;

    const initialMap: Record<string, string[]> = {};
    // Preselect the first option for required single-choice groups for great UX
    product.optionGroups.forEach((group) => {
      if (group.required && group.type === 'single' && group.options.length > 0) {
        initialMap[group.id] = [group.options[0].id];
      } else {
        initialMap[group.id] = [];
      }
    });

    setSelections(initialMap);
    setQuantity(1);
    setNotes('');
    setValidationErrors([]);
    setImageError(false);
  }, [modalProductId, product]);

  if (!product) return null;

  // Toggle selection for a group
  const handleToggleOption = (groupId: string, optionId: string, groupType: 'single' | 'multiple') => {
    setSelections((prev) => {
      const currentSelected = prev[groupId] || [];

      if (groupType === 'single') {
        return {
          ...prev,
          [groupId]: [optionId],
        };
      } else {
        // Multiple
        const exists = currentSelected.includes(optionId);
        const updated = exists
          ? currentSelected.filter((id) => id !== optionId)
          : [...currentSelected, optionId];
        return {
          ...prev,
          [groupId]: updated,
        };
      }
    });

    // Clear errors dynamically
    setValidationErrors([]);
  };

  // Calculate pricing
  let optionsExtraCost = 0;
  const flatSelectedList: SelectedOptionItem[] = [];

  product.optionGroups.forEach((group) => {
    const selectedIds = selections[group.id] || [];
    selectedIds.forEach((sId) => {
      const opt = group.options.find((o) => o.id === sId);
      if (opt) {
        optionsExtraCost += opt.priceDelta;
        flatSelectedList.push({
          groupId: group.id,
          groupTitle: group.title,
          optionId: opt.id,
          optionName: opt.name,
          priceDelta: opt.priceDelta,
        });
      }
    });
  });

  const unitPrice = product.price + optionsExtraCost;
  const totalPrice = unitPrice * quantity;

  // Validate required groups
  const validate = (): boolean => {
    const missing: string[] = [];
    product.optionGroups.forEach((group) => {
      if (group.required) {
        const count = (selections[group.id] || []).length;
        if (count === 0) {
          missing.push(`Debes seleccionar al menos una opción en "${group.title}"`);
        }
      }
    });

    setValidationErrors(missing);
    return missing.length === 0;
  };

  const handleAddToCart = () => {
    if (!validate()) return;

    const cartItem: CartItem = {
      id: `cart-item-${Date.now()}-${Math.random()}`,
      productId: product.id,
      productName: product.name,
      basePrice: product.price,
      unitPrice,
      quantity,
      selectedOptions: flatSelectedList,
      customerNotes: notes.trim() || undefined,
      imageUrl: product.imageUrl,
    };

    addToCart(cartItem);
    closeProductModal();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Click outside backdrop to dismiss */}
      <div 
        className="fixed inset-0 -z-10" 
        onClick={closeProductModal} 
        aria-hidden="true" 
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Case 1: Product with Image */}
        {product.imageUrl && !imageError ? (
          <div className="relative h-48 sm:h-56 w-full bg-slate-900 overflow-hidden shrink-0">
            {/* Mobile handle indicator floating over photo */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-20 sm:hidden pointer-events-none">
              <div className="w-12 h-1.5 bg-white/70 backdrop-blur-md rounded-full shadow-xs" />
            </div>

            {/* Close Button floating over photo */}
            <button
              onClick={closeProductModal}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-md backdrop-blur-md border border-white/60 flex items-center justify-center transition-all hover:scale-105 active:scale-95"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Product Image */}
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
              referrerPolicy="no-referrer"
              onError={() => setImageError(true)}
            />

            {/* Top & bottom gradient overlay for maximum contrast of controls and badges */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-black/35 pointer-events-none" />

            {/* Badges on image */}
            <div className="absolute bottom-3 left-4 flex items-center gap-1.5 flex-wrap z-10">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-white/95 text-slate-900 shadow-xs backdrop-blur-xs">
                {product.category}
              </span>
              {product.badge && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  <span>{product.badge}</span>
                </span>
              )}
            </div>
          </div>
        ) : (
          /* Case 2: Header when there is NO image or image fails */
          <div className="relative shrink-0 border-b border-slate-100 bg-slate-50/70">
            {/* Mobile handle indicator */}
            <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-slate-200 text-slate-800">
                  {product.category}
                </span>
                {product.badge && (
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    <span>{product.badge}</span>
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                onClick={closeProductModal}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200/80 hover:bg-slate-300 text-slate-700 flex items-center justify-center transition-colors active:scale-95"
                aria-label="Cerrar modal"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Scrollable Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1 overscroll-contain">
          {/* Header Info (clean text presentation outside the photo) */}
          <div className="space-y-1.5 pb-3 border-b border-slate-100">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {product.name}
              </h3>
              <div className="text-right shrink-0 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-xl">
                <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                  Base
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-900">
                  {businessProfile.currency}{product.price}
                </span>
              </div>
            </div>

            {product.description && (
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-0.5">
                {product.description}
              </p>
            )}
          </div>

          {/* Option Groups */}
          {product.optionGroups.length === 0 ? (
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500 flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Este producto no requiere personalización adicional. Listo para ordenar.</span>
            </div>
          ) : (
            <div className="space-y-4">
              {product.optionGroups.map((group) => {
                const groupSelected = selections[group.id] || [];
                const isGroupRequired = group.required;

                return (
                  <div
                    key={group.id}
                    className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 bg-slate-50/60 space-y-2.5 shadow-2xs"
                  >
                    {/* Group Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                          {group.title}
                        </h4>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            isGroupRequired
                              ? 'bg-amber-100 text-amber-900 border border-amber-300/80 font-bold'
                              : 'bg-slate-200/70 text-slate-600'
                          }`}
                        >
                          {isGroupRequired ? 'Obligatorio' : 'Opcional'}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-medium shrink-0">
                        {group.type === 'single' ? 'Elige 1' : 'Opciones múltiples'}
                      </span>
                    </div>

                    {/* Options List without text truncation */}
                    <div className="space-y-2">
                      {group.options.map((opt) => {
                        const isSelected = groupSelected.includes(opt.id);
                        const linkedIng = opt.extraIngredientId
                          ? ingredients.find((i) => i.id === opt.extraIngredientId)
                          : null;
                        const reqQty = (opt.extraIngredientQuantity && opt.extraIngredientQuantity > 0)
                          ? opt.extraIngredientQuantity
                          : 1;
                        const isOutOfStock = Boolean(
                          businessProfile.enableStockControl && linkedIng && linkedIng.stock < reqQty
                        );

                        return (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={isOutOfStock}
                            onClick={() => {
                              if (!isOutOfStock) {
                                handleToggleOption(group.id, opt.id, group.type);
                              }
                            }}
                            className={`w-full text-left p-3 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between gap-3 active:scale-[0.99] ${
                              isOutOfStock
                                ? 'opacity-50 bg-slate-100 border-slate-200 cursor-not-allowed'
                                : isSelected
                                ? 'border-slate-900 bg-white ring-1 ring-slate-900/10 shadow-xs'
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            {/* Checkbox / Radio indicator & full text wrapping */}
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <div
                                className={`w-4 h-4 rounded-${
                                  group.type === 'single' ? 'full' : 'md'
                                } border flex items-center justify-center shrink-0 transition-colors ${
                                  isSelected
                                    ? 'bg-slate-950 border-slate-950 text-white'
                                    : 'border-slate-300 bg-white'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="font-medium text-slate-800 break-words leading-tight">
                                  {opt.name}
                                </span>
                                {isOutOfStock && (
                                  <span className="text-[10px] text-rose-600 font-bold">
                                    Agotado en almacén ({linkedIng?.stock || 0} {linkedIng?.unit} disponible)
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Extra price badge */}
                            <span
                              className={`shrink-0 font-semibold text-xs whitespace-nowrap px-2 py-0.5 rounded-md ${
                                opt.priceDelta > 0
                                  ? 'bg-slate-100 text-slate-900'
                                  : 'text-slate-500 font-normal'
                              }`}
                            >
                              {opt.priceDelta > 0
                                ? `+${businessProfile.currency}${opt.priceDelta}`
                                : 'Incluido'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Special Instructions Note */}
          <div className="space-y-1.5 pt-1">
            <label htmlFor={notesId} className="text-xs font-semibold text-slate-700 block">
              Instrucciones especiales para cocina / preparación (opcional)
            </label>
            <input
              id={notesId}
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin sal, aderezo aparte, bien dorado..."
              className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900 transition-colors placeholder:text-slate-400"
            />
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 space-y-1 animate-in fade-in duration-200">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Por favor completa las selecciones obligatorias:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 pl-2">
                {validationErrors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Sticky Footer / Quantity Stepper & Add to Cart */}
        <div className="p-3.5 sm:p-5 pb-6 sm:pb-5 border-t border-slate-200/80 bg-slate-50/90 backdrop-blur-xs flex items-center justify-between gap-3 shrink-0">
          {/* Quantity Controls */}
          <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="px-3 py-2.5 text-slate-600 hover:bg-slate-100 transition-colors active:bg-slate-200"
              aria-label="Disminuir cantidad"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="px-2.5 py-2 text-xs sm:text-sm font-bold min-w-8 text-center text-slate-900">
              {quantity}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-2.5 text-slate-600 hover:bg-slate-100 transition-colors active:bg-slate-200"
              aria-label="Aumentar cantidad"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Submit Action */}
          <button
            type="button"
            onClick={handleAddToCart}
            className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.98] ${theme.buttonClass}`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Añadir al Carrito</span>
            <span className="opacity-90">· {businessProfile.currency}{totalPrice}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
