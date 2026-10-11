import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit2,
  Clock,
  DollarSign,
  MapPin,
  ShieldCheck,
  Scissors,
  User,
  Users,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Service, ServiceModality, ConfirmationType, PriceType } from '../../types';
import { GoogleDriveInput } from '../common/GoogleDriveInput';

export const AdminServices: React.FC = () => {
  const { services, addService, updateService, deleteService, providers, businessProfile, theme } = useApp();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null);

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

  // Group services by category
  const servicesByCategory = services.reduce((acc, s) => {
    const cat = s.category.trim() || 'General';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(s);
    return acc;
  }, {} as Record<string, Service[]>);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [priceType, setPriceType] = useState<PriceType>('fijo');
  const [price, setPrice] = useState<number>(0);
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [bufferMinutes, setBufferMinutes] = useState<number>(15);

  const [modality, setModality] = useState<ServiceModality>('local');
  const [travelSurcharge, setTravelSurcharge] = useState<number>(0);
  const [travelTimeMinutes, setTravelTimeMinutes] = useState<number>(0);
  const [roundTripTravel, setRoundTripTravel] = useState<boolean>(true);
  const [maxHomeZoneKm, setMaxHomeZoneKm] = useState<number>(10);

  const [confirmationType, setConfirmationType] = useState<ConfirmationType>('automatica');
  const [hybridHoursThreshold, setHybridHoursThreshold] = useState<number>(6);
  const [providerResponseDeadlineMinutes, setProviderResponseDeadlineMinutes] = useState<number>(120);
  const [minCancellationHours, setMinCancellationHours] = useState<number>(4);
  const [selectedProviderIds, setSelectedProviderIds] = useState<string[]>(
    providers.length > 0 ? [providers[0].id] : []
  );

  const handleOpenNew = () => {
    setEditingServiceId(null);
    setName('');
    setDescription('');
    setImageUrl('');
    setCategory('');
    setPriceType('fijo');
    setPrice(0);
    setDurationMinutes(60);
    setBufferMinutes(15);
    setModality('local');
    setTravelSurcharge(0);
    setTravelTimeMinutes(0);
    setRoundTripTravel(true);
    setMaxHomeZoneKm(10);
    setConfirmationType('automatica');
    setHybridHoursThreshold(6);
    setProviderResponseDeadlineMinutes(120);
    setMinCancellationHours(4);
    setSelectedProviderIds(providers.length > 0 ? [providers[0].id] : []);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (serv: Service) => {
    setEditingServiceId(serv.id);
    setName(serv.name);
    setDescription(serv.description);
    setImageUrl(serv.imageUrl);
    setCategory(serv.category);
    setPriceType(serv.priceType);
    setPrice(serv.price);
    setDurationMinutes(serv.durationMinutes);
    setBufferMinutes(serv.bufferMinutes);
    setModality(serv.modality);
    setTravelSurcharge(serv.travelSurcharge);
    setTravelTimeMinutes(serv.travelTimeMinutes);
    setRoundTripTravel(serv.roundTripTravel);
    setMaxHomeZoneKm(serv.maxHomeZoneKm);
    setConfirmationType(serv.confirmationType);
    setHybridHoursThreshold(serv.hybridHoursThreshold || 6);
    setProviderResponseDeadlineMinutes(serv.providerResponseDeadlineMinutes || 120);
    setMinCancellationHours(serv.minCancellationHours || 4);
    setSelectedProviderIds(serv.providerIds || (providers.length > 0 ? [providers[0].id] : []));
    setIsEditorOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // If price type is 'a_cotizar', force confirmation to 'aprobacion'
    const finalConfirmationType = priceType === 'a_cotizar' ? 'aprobacion' : confirmationType;
    const finalPrice = priceType === 'a_cotizar' ? 0 : Number(price);

    const payload = {
      name: name.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim() || '/src/assets/images/hero_artisan_banner_1791387671351.jpg',
      category: category.trim(),
      priceType,
      price: finalPrice,
      durationMinutes: Math.max(10, Number(durationMinutes)),
      bufferMinutes: Math.max(0, Number(bufferMinutes)),
      modality,
      travelSurcharge: modality === 'local' ? 0 : Math.max(0, Number(travelSurcharge)),
      travelTimeMinutes: modality === 'local' ? 0 : Math.max(0, Number(travelTimeMinutes)),
      roundTripTravel: modality === 'local' ? false : roundTripTravel,
      maxHomeZoneKm: modality === 'local' ? 0 : Math.max(0, Number(maxHomeZoneKm)),
      confirmationType: finalConfirmationType,
      hybridHoursThreshold: finalConfirmationType === 'hibrida' ? Math.max(1, Number(hybridHoursThreshold)) : 6,
      providerResponseDeadlineMinutes: Math.max(10, Number(providerResponseDeadlineMinutes)),
      minCancellationHours: Math.max(0, Number(minCancellationHours)),
      providerIds: selectedProviderIds,
      available: true,
    };

    if (editingServiceId) {
      updateService(editingServiceId, payload);
    } else {
      addService(payload);
    }

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Catálogo de Servicios de Spa & Tratamientos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Servicios sin stock ni SKU, con duración, pausas, modalidades presenciales/domicilio y reglas de confirmación.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${theme.buttonClass}`}
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Servicio</span>
        </button>
      </div>

      {/* Services Grouped by Category */}
      {services.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Sparkles className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay servicios registrados</h3>
          <p className="text-xs text-slate-500">Crea el primer servicio agendable para que los clientes puedan reservar.</p>
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
                        {catServices.length} {catServices.length === 1 ? 'servicio registrado' : 'servicios registrados'}
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
                  <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {catServices.map((serv) => (
                      <div key={serv.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between">
                        <div>
                          <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                            <img
                              src={serv.imageUrl}
                              alt={serv.name}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="absolute top-2.5 left-2.5 flex items-center gap-1 flex-wrap">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/90 text-slate-900">
                                {serv.category}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-600 text-white capitalize">
                                {serv.modality}
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="font-bold text-slate-900 text-sm leading-snug">{serv.name}</h3>
                              <span className="font-mono font-extrabold text-slate-900 text-sm shrink-0">
                                {serv.priceType === 'a_cotizar'
                                  ? 'A cotizar'
                                  : `${serv.priceType === 'desde' ? 'Desde ' : ''}${businessProfile.currency}${serv.price}`}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">{serv.description}</p>

                            <div className="pt-2 flex items-center justify-between gap-2 text-[11px] text-slate-600 border-t border-slate-100">
                              <div className="flex items-center gap-3">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>{serv.durationMinutes} min (+{serv.bufferMinutes}p)</span>
                                </div>
                                {serv.modality !== 'local' && (
                                  <div className="flex items-center gap-1 text-amber-700">
                                    <MapPin className="w-3.5 h-3.5" />
                                    <span>Hasta {serv.maxHomeZoneKm} km</span>
                                  </div>
                                )}
                              </div>
                              {serv.providerIds && serv.providerIds.length > 0 && (
                                <div className="flex items-center gap-1 text-slate-500 font-medium">
                                  <Users className="w-3 h-3 text-slate-400" />
                                  <span>{serv.providerIds.length} personal</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                          <span className="text-[10px] uppercase font-bold text-slate-500">
                            Confirmación: {serv.confirmationType}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(serv)}
                              className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                            >
                              <Edit2 className="w-3 h-3" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setServiceToDelete(serv)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar servicio"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <form
            onSubmit={handleSave}
            className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col text-xs"
          >
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {editingServiceId ? 'Editar Servicio de Spa' : 'Crear Nuevo Servicio'}
                </h3>
                <p className="text-xs text-slate-500">Configura tiempos, modalidad local/domicilio y reglas de agenda.</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  1. Información Principal
                </h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Nombre del Servicio *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="ej. Masaje Relajante Sueco"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Descripción</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalle de la experiencia y beneficios..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Categoría</label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="ej. Masajes, Faciales"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipo de Precio</label>
                    <select
                      value={priceType}
                      onChange={(e) => setPriceType(e.target.value as PriceType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    >
                      <option value="fijo">Precio Fijo</option>
                      <option value="desde">Precio "Desde"</option>
                      <option value="a_cotizar">A Cotizar (Requiere Aprobación)</option>
                    </select>
                  </div>
                </div>

                {priceType !== 'a_cotizar' && (
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Precio ({businessProfile.currency}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Image */}
              <div className="pt-3 border-t border-slate-200">
                <GoogleDriveInput
                  value={imageUrl}
                  onChange={(normalized) => setImageUrl(normalized)}
                  label="Fotografía del Servicio"
                  placeholder="URL o Google Drive..."
                />
              </div>

              {/* Tiempos de Agenda */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  2. Tiempos & Agenda
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Duración (minutos) *</label>
                    <input
                      type="number"
                      min="10"
                      required
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Pausa / Limpieza (min)</label>
                    <input
                      type="number"
                      min="0"
                      value={bufferMinutes}
                      onChange={(e) => setBufferMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Modalidad y Domicilio (Ocultos si es 'local') */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  3. Modalidad & Domicilio
                </h4>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Modalidad del Servicio</label>
                  <select
                    value={modality}
                    onChange={(e) => setModality(e.target.value as ServiceModality)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                  >
                    <option value="local">Solo en Local / Spa</option>
                    <option value="domicilio">Solo a Domicilio</option>
                    <option value="ambas">Ambas (Local y Domicilio)</option>
                  </select>
                </div>

                {modality !== 'local' && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="font-semibold text-amber-900 block mb-1">Recargo Domicilio ($)</label>
                        <input
                          type="number"
                          min="0"
                          value={travelSurcharge}
                          onChange={(e) => setTravelSurcharge(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="font-semibold text-amber-900 block mb-1">Tiempo Traslado (min)</label>
                        <input
                          type="number"
                          min="0"
                          value={travelTimeMinutes}
                          onChange={(e) => setTravelTimeMinutes(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white font-bold outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 items-center">
                      <div>
                        <label className="font-semibold text-amber-900 block mb-1">Zona Máxima (km)</label>
                        <input
                          type="number"
                          min="1"
                          value={maxHomeZoneKm}
                          onChange={(e) => setMaxHomeZoneKm(Number(e.target.value))}
                          className="w-full px-3 py-1.5 border border-amber-300 rounded-lg bg-white font-bold outline-none"
                        />
                      </div>
                      <div className="pt-5">
                        <label className="flex items-center gap-2 cursor-pointer font-semibold text-amber-950">
                          <input
                            type="checkbox"
                            checked={roundTripTravel}
                            onChange={(e) => setRoundTripTravel(e.target.checked)}
                            className="w-4 h-4 rounded text-amber-600"
                          />
                          <span>Traslado cuenta Ida y Regreso (x2 en agenda)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reglas de Confirmación y Plazos */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600">
                  4. Reglas de Confirmación & Plazos
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tipo de Confirmación</label>
                    <select
                      value={priceType === 'a_cotizar' ? 'aprobacion' : confirmationType}
                      disabled={priceType === 'a_cotizar'}
                      onChange={(e) => setConfirmationType(e.target.value as ConfirmationType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none disabled:bg-slate-100"
                    >
                      <option value="automatica">Automática</option>
                      <option value="aprobacion">Aprobación (Siempre manual)</option>
                      <option value="hibrida">Híbrida (Según horas de anticipación)</option>
                    </select>
                    {priceType === 'a_cotizar' && (
                      <p className="text-[10px] text-amber-700 mt-0.5">Forzado a Aprobación por ser servicio "A cotizar".</p>
                    )}
                  </div>

                  {confirmationType === 'hibrida' && priceType !== 'a_cotizar' && (
                    <div>
                      <label className="font-semibold text-slate-700 block mb-1">Umbral Híbrido (Horas antes)</label>
                      <input
                        type="number"
                        min="1"
                        value={hybridHoursThreshold}
                        onChange={(e) => setHybridHoursThreshold(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                      />
                      <p className="text-[10px] text-slate-500 mt-0.5">Si faltan menos de X horas, requiere aprobación manual.</p>
                    </div>
                  )}

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Límite Respuesta Proveedor (min)</label>
                    <input
                      type="number"
                      min="10"
                      value={providerResponseDeadlineMinutes}
                      onChange={(e) => setProviderResponseDeadlineMinutes(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Anticipación Mínima Cancelación (h)</label>
                    <input
                      type="number"
                      min="0"
                      value={minCancellationHours}
                      onChange={(e) => setMinCancellationHours(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg font-bold focus:ring-2 focus:ring-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Personal / Terapeutas que realizan el servicio */}
              <div className="pt-3 border-t border-slate-200 space-y-3">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  5. Personal que lo Realiza
                </h4>
                {providers.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No hay terapeutas registrados en el sistema.</p>
                ) : (
                  <div className="space-y-2">
                    {providers.map((prov) => {
                      const isChecked = selectedProviderIds.includes(prov.id);
                      return (
                        <label
                          key={prov.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isChecked ? 'bg-rose-50/70 border-rose-300 text-slate-900' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedProviderIds([...selectedProviderIds, prov.id]);
                              } else {
                                setSelectedProviderIds(selectedProviderIds.filter((id) => id !== prov.id));
                              }
                            }}
                            className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                          />
                          <div className="flex items-center gap-2 min-w-0">
                            {prov.avatarUrl ? (
                              <img src={prov.avatarUrl} alt={prov.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                            ) : (
                              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                                {prov.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-bold text-xs truncate">{prov.name}</p>
                              <p className="text-[10px] text-slate-400 truncate">{prov.role}</p>
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`px-5 py-2 rounded-xl text-xs font-bold text-white shadow-xs ${theme.buttonClass}`}
              >
                Guardar Servicio
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {serviceToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl space-y-4 border border-slate-200 text-xs">
            <h3 className="font-bold text-slate-900 text-sm">¿Eliminar servicio "{serviceToDelete.name}"?</h3>
            <p className="text-slate-600">Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setServiceToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteService(serviceToDelete.id);
                  setServiceToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
