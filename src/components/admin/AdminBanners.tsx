import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Tag,
  Award,
  Sparkles,
  Megaphone,
  CheckCircle2,
  ExternalLink,
  Power,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleDriveInput } from '../common/GoogleDriveInput';
import { BannerBadge, PromoBanner } from '../../types';

export const AdminBanners: React.FC = () => {
  const {
    banners,
    addBanner,
    updateBanner,
    deleteBanner,
    toggleBannerActive,
    products,
    theme,
  } = useApp();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null);
  const [bannerToDelete, setBannerToDelete] = useState<PromoBanner | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [badge, setBadge] = useState<BannerBadge>('PROMOCIÓN');
  const [imageUrl, setImageUrl] = useState('/src/assets/images/hero_artisan_banner_1791387671351.jpg');
  const [targetProductId, setTargetProductId] = useState<string>(products[0]?.id || '');
  const [discountHighlight, setDiscountHighlight] = useState('');
  const [active, setActive] = useState(true);

  const handleOpenNew = () => {
    setEditingBannerId(null);
    setTitle('Especial de la Semana');
    setSubtitle('Descubre nuestra creación destacada y disfruta envío gratis hoy');
    setTagline('Promoción por Tiempo Limitado');
    setBadge('PROMOCIÓN');
    setImageUrl('/src/assets/images/hero_artisan_banner_1791387671351.jpg');
    setTargetProductId(products[0]?.id || '');
    setDiscountHighlight('2x1 Especial');
    setActive(true);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (b: PromoBanner) => {
    setEditingBannerId(b.id);
    setTitle(b.title);
    setSubtitle(b.subtitle);
    setTagline(b.tagline || '');
    setBadge(b.badge);
    setImageUrl(b.imageUrl);
    setTargetProductId(b.targetProductId || '');
    setDiscountHighlight(b.discountHighlight || '');
    setActive(b.active);
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const payload = {
      title: title.trim(),
      subtitle: subtitle.trim(),
      tagline: tagline.trim() || undefined,
      badge,
      imageUrl: imageUrl.trim() || '/src/assets/images/hero_artisan_banner_1791387671351.jpg',
      targetProductId: targetProductId || undefined,
      discountHighlight: discountHighlight.trim() || undefined,
      active,
    };

    if (editingBannerId) {
      updateBanner(editingBannerId, payload);
    } else {
      addBanner(payload);
    }

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Banners de Anuncios, Patrocinios & Promociones
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configura anuncios que dirigen al cliente a ver un producto específico del catálogo al hacer clic.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all ${theme.buttonClass}`}
        >
          <Plus className="w-4 h-4" />
          <span>Crear Nuevo Banner</span>
        </button>
      </div>

      {/* Banners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {banners.map((banner) => {
          const linkedProduct = products.find((p) => p.id === banner.targetProductId);

          return (
            <div
              key={banner.id}
              className={`bg-white rounded-2xl border overflow-hidden shadow-2xs flex flex-col justify-between transition-all ${
                banner.active ? 'border-slate-200' : 'border-slate-200 opacity-60'
              }`}
            >
              <div>
                {/* Banner Preview Frame with Scrim */}
                <div className="relative aspect-[16/8] bg-slate-900 overflow-hidden">
                  <img
                    src={banner.imageUrl}
                    alt={banner.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

                  {/* Badges */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-white text-slate-950 shadow-xs">
                      {banner.badge}
                    </span>
                    {banner.discountHighlight && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-400 text-slate-950 shadow-xs">
                        {banner.discountHighlight}
                      </span>
                    )}
                  </div>

                  {/* Status chip */}
                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        banner.active
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {banner.active ? 'Activo en Tienda' : 'Pausado'}
                    </span>
                  </div>

                  {/* Title overlay */}
                  <div className="absolute bottom-3 left-3 right-3 text-white">
                    <h3 className="font-bold text-base leading-tight line-clamp-1">
                      {banner.title}
                    </h3>
                    <p className="text-[11px] text-slate-200 line-clamp-1 mt-0.5">
                      {banner.subtitle}
                    </p>
                  </div>
                </div>

                {/* Linked Product Info */}
                <div className="p-4 space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium">Producto Destino vinculado:</span>
                    {linkedProduct ? (
                      <span className="font-bold text-slate-900 flex items-center gap-1">
                        <span>{linkedProduct.name}</span>
                        <span className="text-slate-500">(${linkedProduct.price})</span>
                      </span>
                    ) : (
                      <span className="text-amber-700 font-medium italic">Sin producto asociado</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => toggleBannerActive(banner.id)}
                  className={`px-2.5 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors ${
                    banner.active
                      ? 'text-amber-800 bg-amber-100 hover:bg-amber-200'
                      : 'text-emerald-800 bg-emerald-100 hover:bg-emerald-200'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{banner.active ? 'Pausar' : 'Activar'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(banner)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg font-semibold text-slate-800 hover:bg-slate-100 flex items-center gap-1 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" />
                    <span>Editar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBannerToDelete(banner)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Eliminar banner"
                    aria-label="Eliminar banner"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Banner Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingBannerId ? 'Editar Banner Promocional' : 'Crear Banner / Anuncio'}
                </h3>
                <p className="text-xs text-slate-500">
                  Asocia una imagen y vincula al producto que se abrirá al hacer clic.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs overflow-y-auto max-h-[75vh]">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Título del Anuncio *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ej: Festival 2x1 en Smash Burgers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">
                  Subtítulo / Texto Descriptivo
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="Ej: Pruébalas con nuestra salsa secreta de la casa"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tipo de Banner / Insignia
                  </label>
                  <select
                    value={badge}
                    onChange={(e) => setBadge(e.target.value as BannerBadge)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="PROMOCIÓN">PROMOCIÓN</option>
                    <option value="PATROCINIO">PATROCINIO</option>
                    <option value="NOVEDAD">NOVEDAD</option>
                    <option value="ANUNCIO">ANUNCIO</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Etiqueta Destacada (Opcional)
                  </label>
                  <input
                    type="text"
                    value={discountHighlight}
                    onChange={(e) => setDiscountHighlight(e.target.value)}
                    placeholder="Ej: -20% HOY, Envío Gratis"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              {/* Linked Product Dropdown */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <label className="font-bold text-slate-800 block text-xs">
                  Producto Destino del Catálogo (Al hacer clic en el banner) *
                </label>
                <p className="text-[11px] text-slate-500">
                  Cuando el cliente pulse en el banner, se abrirá directamente el modal de personalización de este producto.
                </p>
                <select
                  value={targetProductId}
                  onChange={(e) => setTargetProductId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 bg-white"
                >
                  <option value="">-- Sin producto vinculado --</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.category} · ${p.price})
                    </option>
                  ))}
                </select>
              </div>

              {/* Google Drive Image Normalizer */}
              <GoogleDriveInput
                value={imageUrl}
                onChange={(normalized) => setImageUrl(normalized)}
                label="Imagen del Banner (Google Drive o enlace directo)"
                placeholder="Pega el enlace de Google Drive..."
              />

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="w-4 h-4 rounded text-slate-900"
                  />
                  <span>Mostrar activamente en el carrusel de la tienda</span>
                </label>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              {editingBannerId ? (
                <button
                  type="button"
                  onClick={() => {
                    const b = banners.find((item) => item.id === editingBannerId);
                    if (b) {
                      setIsEditorOpen(false);
                      setBannerToDelete(b);
                    }
                  }}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Banner</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs ${theme.buttonClass}`}
                >
                  Guardar Banner
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Banner Confirmation Modal */}
      {bannerToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">¿Eliminar banner?</h3>
                <p className="text-xs text-slate-500">Dejará de mostrarse en la tienda.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              ¿Estás seguro de que deseas eliminar el banner <strong className="text-slate-900 font-semibold">{bannerToDelete.title}</strong>?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setBannerToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteBanner(bannerToDelete.id);
                  setBannerToDelete(null);
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
