import React, { useState } from 'react';
import {
  Sparkles,
  Plus,
  AlertCircle,
  ShoppingBag,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Product, Service } from '../../types';
import { PromoBannerCarousel } from './PromoBannerCarousel';

export const CustomerCatalogView: React.FC = () => {
  const { products, services, openProductModal, openAppointmentModal, businessProfile, theme } = useApp();

  // Accordion collapsed state per category (default true = collapsed/hidden)
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => {
      const currentlyCollapsed = prev[cat] ?? true;
      return {
        ...prev,
        [cat]: !currentlyCollapsed,
      };
    });
  };

  // Available physical products (not hidden/deactivated)
  const availableProducts = products.filter((p) => p.available !== false);

  // Available spa services (not hidden/deactivated)
  const availableServices = services.filter((s) => s.available !== false);

  const hasProducts = availableProducts.length > 0;
  const hasServices = availableServices.length > 0;

  const [activeTab, setActiveTab] = useState<'productos' | 'servicios'>(() => {
    return hasServices ? 'servicios' : 'productos';
  });

  React.useEffect(() => {
    if (!hasProducts && hasServices) {
      setActiveTab('servicios');
    } else if (hasProducts && !hasServices) {
      setActiveTab('productos');
    }
  }, [hasProducts, hasServices]);

  // Group services by category
  const servicesByCategory = availableServices.reduce((acc, s) => {
    const cat = s.category.trim() || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  // Group products by category
  const productsByCategory = availableProducts.reduce((acc, p) => {
    const cat = p.category.trim() || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  // Render physical product card
  const renderProductCard = (product: Product, index: number = 0) => {
    const isOutOfStock = businessProfile.enableStockControl && product.stock <= 0;
    const hasOptions = product.optionGroups && product.optionGroups.length > 0;

    return (
      <div
        key={`${product.id}-${index}`}
        className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
      >
        <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />

          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white/90 text-slate-900 backdrop-blur-xs shadow-2xs">
              {product.category}
            </span>
            {product.badge && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-2xs">
                {product.badge}
              </span>
            )}
          </div>

          {businessProfile.enableStockControl && (
            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded-lg text-[10px] font-bold">
              Stock: {product.stock}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-1.5">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
              {product.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Precio
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                {businessProfile.currency}
                {product.price}
              </span>
            </div>

            <button
              onClick={() => openProductModal(product.id)}
              disabled={isOutOfStock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 ${
                isOutOfStock
                  ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  : theme.buttonClass
              }`}
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>{hasOptions ? 'Personalizar' : 'Agregar'}</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Render Service card (No stock, No SKU, with duration, modality, confirmation)
  const renderServiceCard = (service: Service, index: number = 0) => {
    return (
      <div
        key={`${service.id}-${index}`}
        className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group justify-between"
      >
        <div>
          <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden">
            <img
              src={service.imageUrl}
              alt={service.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />

            {/* Badges */}
            <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-rose-600 text-white shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>{service.category}</span>
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/95 text-slate-900 uppercase shadow-2xs">
                {service.modality === 'ambas' ? 'Local y Domicilio' : service.modality === 'domicilio' ? 'A Domicilio' : 'En Spa'}
              </span>
            </div>

            {/* Duration badge */}
            <div className="absolute bottom-2.5 right-2.5 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1">
              <Clock className="w-3 h-3 text-rose-400" />
              <span>{service.durationMinutes} min</span>
            </div>
          </div>

          <div className="p-4 sm:p-5 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug line-clamp-1">
              {service.name}
            </h3>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {service.description}
            </p>

            {/* Service details & modality info */}
            <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-600 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-600">
                <Clock className="w-3 h-3 text-slate-400" />
                <span>Pausa: {service.bufferMinutes} min</span>
              </div>

              {service.modality !== 'local' && (
                <div className="flex items-center gap-1 text-amber-700 font-medium">
                  <MapPin className="w-3 h-3 text-amber-600" />
                  <span>Hasta {service.maxHomeZoneKm} km</span>
                </div>
              )}

              <div className="flex items-center gap-1 text-emerald-700 font-medium text-[10px]">
                <ShieldCheck className="w-3 h-3" />
                <span className="capitalize">{service.confirmationType}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer price & action */}
        <div className="p-4 sm:p-5 pt-0">
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                Precio de Sesión
              </span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900 font-mono">
                {service.priceType === 'a_cotizar'
                  ? 'A Cotizar'
                  : `${service.priceType === 'desde' ? 'Desde ' : ''}${businessProfile.currency}${service.price}`}
              </span>
            </div>

            <button
              onClick={() => openAppointmentModal(service.id)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 text-white active:scale-95 bg-rose-600 hover:bg-rose-700"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Reservar Cita</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-5 sm:space-y-6 pb-20">
      {/* 1. Promotional Banners Carousel */}
      <PromoBannerCarousel />

      {/* 2. Centered Two Buttons: Servicios | Productos */}
      {(hasProducts || hasServices) && (
        <div className="flex items-center justify-center gap-3">
          {hasServices && (
            <button
              type="button"
              onClick={() => setActiveTab('servicios')}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center gap-2 ${
                activeTab === 'servicios'
                  ? 'shadow-md scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              style={
                activeTab === 'servicios'
                  ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                  : undefined
              }
            >
              <Sparkles className="w-4 h-4" />
              <span>Servicios & Spa</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'servicios' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {availableServices.length}
              </span>
            </button>
          )}

          {hasProducts && (
            <button
              type="button"
              onClick={() => setActiveTab('productos')}
              className={`px-6 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all shadow-xs flex items-center gap-2 ${
                activeTab === 'productos'
                  ? 'shadow-md scale-102'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
              style={
                activeTab === 'productos'
                  ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                  : undefined
              }
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Productos</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  activeTab === 'productos' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {availableProducts.length}
              </span>
            </button>
          )}
        </div>
      )}

      {/* 3. Items Grouped by Category with Collapsible Accordions */}
      {activeTab === 'servicios' ? (
        availableServices.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No hay servicios registrados en este momento
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              El administrador puede agregarlos desde el panel de Catálogo de Servicios.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(servicesByCategory).map(([categoryName, catServices]) => {
              const isCollapsed = collapsedCategories[categoryName] ?? true;
              return (
                <div key={categoryName} className="bg-slate-50/70 rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  {/* Category Header (Clickable Collapsible) */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(categoryName)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.raw.primaryBtn }}
                      >
                        <Sparkles className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base tracking-tight uppercase">
                          {categoryName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {catServices.length} {catServices.length === 1 ? 'servicio disponible' : 'servicios disponibles'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Category Items Grid */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {catServices.map((serv, sIdx) => renderServiceCard(serv, sIdx))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      ) : (
        availableProducts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white rounded-3xl border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              No hay productos a la venta en este momento
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Pronto se añadirán productos al catálogo.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(productsByCategory).map(([categoryName, catProducts]) => {
              const isCollapsed = collapsedCategories[categoryName] ?? false;
              return (
                <div key={categoryName} className="bg-slate-50/70 rounded-3xl border border-slate-200/80 overflow-hidden shadow-2xs">
                  {/* Category Header (Clickable Collapsible) */}
                  <button
                    type="button"
                    onClick={() => toggleCategory(categoryName)}
                    className="w-full px-5 py-4 flex items-center justify-between bg-white hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-xl flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: theme.raw.primaryBtn }}
                      >
                        <ShoppingBag className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base tracking-tight uppercase">
                          {categoryName}
                        </h3>
                        <p className="text-[11px] text-slate-500 font-medium">
                          {catProducts.length} {catProducts.length === 1 ? 'producto disponible' : 'productos disponibles'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {isCollapsed ? (
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      ) : (
                        <ChevronUp className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                  </button>

                  {/* Category Items Grid */}
                  {!isCollapsed && (
                    <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {catProducts.map((prod, pIdx) => renderProductCard(prod, pIdx))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )
      )}
    </div>
  );
};

