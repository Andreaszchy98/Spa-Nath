import React, { useState } from 'react';
import {
  Sparkles,
  Palette,
  Save,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Flame,
  Coffee,
  Heart,
  Sun,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleDriveInput } from '../common/GoogleDriveInput';
import { ThemeId } from '../../types';
import { THEMES } from '../../utils/themes';

export const AdminSettings: React.FC = () => {
  const {
    businessProfile,
    updateBusinessProfile,
    themeId,
    setThemeId,
    theme,
  } = useApp();

  const [name, setName] = useState(businessProfile.name);
  const [logoUrl, setLogoUrl] = useState(businessProfile.logoUrl || '');
  const [slogan, setSlogan] = useState(businessProfile.slogan);
  const [category, setCategory] = useState(businessProfile.category);
  const [currency, setCurrency] = useState(businessProfile.currency);
  const [currencyCode, setCurrencyCode] = useState(businessProfile.currencyCode);
  const [phone, setPhone] = useState(businessProfile.phone);
  const [address, setAddress] = useState(businessProfile.address);

  const [savedSuccess, setSavedSuccess] = useState(false);

  React.useEffect(() => {
    setName(businessProfile.name);
    setLogoUrl(businessProfile.logoUrl || '');
    setSlogan(businessProfile.slogan);
    setCategory(businessProfile.category);
    setCurrency(businessProfile.currency);
    setCurrencyCode(businessProfile.currencyCode);
    setPhone(businessProfile.phone);
    setAddress(businessProfile.address);
  }, [businessProfile]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessProfile({
      name: name.trim(),
      logoUrl: logoUrl.trim(),
      slogan: slogan.trim(),
      category: category.trim(),
      currency: currency.trim() || '$',
      currencyCode: currencyCode.trim() || 'MXN',
      phone: phone.trim(),
      address: address.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const themeList: Array<{ id: ThemeId; icon: React.ReactNode }> = [
    { id: 'default', icon: <Palette className="w-4 h-4" /> },
    { id: 'rosa', icon: <Heart className="w-4 h-4 text-pink-500 fill-pink-500/20" /> },
    { id: 'crema', icon: <Sun className="w-4 h-4 text-amber-700" /> },
    { id: 'rojo', icon: <Flame className="w-4 h-4 text-rose-500" /> },
    { id: 'cafe', icon: <Coffee className="w-4 h-4 text-amber-800" /> },
    { id: 'naranja', icon: <Sparkles className="w-4 h-4 text-orange-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Selector de Temas & Color de Fondo */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-1 flex items-center gap-2">
            <Palette className="w-4 h-4 text-slate-700" />
            Temas Visuales y Color de Fondo
          </h3>

        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {themeList.map(({ id, icon }) => {
            const t = THEMES[id];
            const isSelected = themeId === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setThemeId(id)}
                className={`p-3 sm:p-3.5 rounded-xl border text-left transition-all relative flex flex-col justify-between gap-3 ${
                  isSelected
                    ? 'border-slate-950 bg-slate-50 ring-2 ring-slate-950 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 text-xs sm:text-sm truncate">
                    {icon}
                    <span className="truncate">{t.name}</span>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-2 pt-1.5 border-t border-slate-100">
                  <div
                    className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                    style={{ backgroundColor: t.raw.bg }}
                    title="Fondo"
                  />
                  <div
                    className={`flex-1 py-1 px-2 rounded-lg text-[10px] sm:text-[11px] font-bold text-center shadow-2xs truncate ${t.buttonClass}`}
                  >
                    Botón
                  </div>
                </div>
              </button>
            );
          })}
        </div>


      </div>

      {/* BUSINESS PROFILE CONFIGURATION FORM */}
      <form
        onSubmit={handleSaveProfile}
        className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-5"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-slate-700" />
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Identidad del Negocio & Datos Comerciales
            </h3>
          </div>
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ¡Guardado exitosamente!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Nombre Comercial del Negocio *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Giro o Categoría Comercial
            </label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-slate-700 block mb-1">
              Eslogan o Frase de Presentación
            </label>
            <input
              type="text"
              value={slogan}
              onChange={(e) => setSlogan(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Símbolo de Moneda (ej. $)
            </label>
            <input
              type="text"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono font-bold"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Código de Moneda (ej. MXN, USD, COP, EUR)
            </label>
            <input
              type="text"
              value={currencyCode}
              onChange={(e) => setCurrencyCode(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 font-mono"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Teléfono / WhatsApp de Pedidos
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Dirección del Establecimiento
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="sm:col-span-2 pt-2 border-t border-slate-100">
            <GoogleDriveInput
              value={logoUrl}
              onChange={(normalized) => setLogoUrl(normalized)}
              label="Logotipo del Negocio (Google Drive o Enlace Directo)"
              placeholder="https://drive.google.com/file/d/... o https://..."
              helperText="Pega el enlace compartido de Google Drive de tu logotipo para normalizarlo automáticamente y mostrarlo en la barra superior."
            />
          </div>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-xs flex items-center gap-1.5 transition-all active:scale-95 ${theme.buttonClass}`}
          >
            <Save className="w-4 h-4" />
            <span>Guardar Configuración</span>
          </button>
        </div>
      </form>
    </div>
  );
};
