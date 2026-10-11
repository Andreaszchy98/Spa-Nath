import React, { useState, useEffect } from 'react';
import { HelpCircle, CheckCircle2, AlertCircle, ExternalLink, Image as ImageIcon, Sparkles } from 'lucide-react';
import { normalizeDriveOrDirectUrl, GOOGLE_DRIVE_EXAMPLES } from '../../utils/googleDrive';

interface GoogleDriveInputProps {
  value: string;
  onChange: (normalizedUrl: string, isDrive: boolean, rawValue: string) => void;
  label?: string;
  placeholder?: string;
  helperText?: string;
}

export const GoogleDriveInput: React.FC<GoogleDriveInputProps> = ({
  value,
  onChange,
  label = 'URL de la Imagen (Google Drive o enlace directo)',
  placeholder = 'Pega aquí el enlace de Google Drive o URL de imagen...',
  helperText,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [showDriveGuide, setShowDriveGuide] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    setInputValue(raw);
    setImageError(false);

    const result = normalizeDriveOrDirectUrl(raw);
    onChange(result.normalizedUrl, result.isGoogleDrive, raw);
  };

  const handleLoadSample = (sampleUrl: string) => {
    setInputValue(sampleUrl);
    setImageError(false);
    const result = normalizeDriveOrDirectUrl(sampleUrl);
    onChange(result.normalizedUrl, result.isGoogleDrive, sampleUrl);
  };

  const result = normalizeDriveOrDirectUrl(inputValue);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-slate-500" />
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowDriveGuide(!showDriveGuide)}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
        >
          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
          <span>¿Cómo usar Google Drive?</span>
        </button>
      </div>

      {showDriveGuide && (
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-lg text-xs text-amber-900 space-y-1.5 leading-relaxed">
          <div className="font-semibold flex items-center gap-1 text-amber-950">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            Normalizador automático de Google Drive:
          </div>
          <p>
            1. Sube tu imagen a tu carpeta de Google Drive.
          </p>
          <p>
            2. Haz clic derecho en el archivo &gt; <strong>Compartir</strong> &gt; En "Acceso general" cámbialo a <strong>"Cualquier persona con el enlace"</strong> (Lector).
          </p>
          <p>
            3. Haz clic en <strong>"Copiar enlace"</strong> y pégalo directamente en este campo. El sistema lo transformará automáticamente al CDN de alta velocidad para que cargue en la app.
          </p>
          <div className="pt-1 flex items-center gap-2">
            <span className="text-[11px] text-amber-800">Probar ejemplo:</span>
            <button
              type="button"
              onClick={() => handleLoadSample(GOOGLE_DRIVE_EXAMPLES[0].sample)}
              className="px-2 py-0.5 bg-amber-200/70 hover:bg-amber-300/80 rounded text-[11px] font-medium text-amber-950 transition-colors"
            >
              Cargar enlace de muestra
            </button>
          </div>
        </div>
      )}

      <div className="relative">
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all pr-24"
        />
        {result.isGoogleDrive && result.isValid && (
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-medium rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Drive OK
          </span>
        )}
      </div>

      {/* Info status feedback */}
      {inputValue && (
        <div className="space-y-1 text-xs">
          {result.isGoogleDrive && !result.isValid && (
            <div className="flex items-start gap-1.5 text-rose-700 bg-rose-50 p-2 rounded border border-rose-200">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">{result.errorMessage}</p>
                {result.tip && <p className="text-[11px] text-rose-600 mt-0.5">{result.tip}</p>}
              </div>
            </div>
          )}

          {helperText && <p className="text-slate-500 text-[11px]">{helperText}</p>}
        </div>
      )}

      {/* Live Preview Container with Zero-Broken-Image Fallback */}
      {inputValue && (
        <div className="mt-2 p-2.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
          <div className="w-16 h-16 rounded-md bg-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center border border-slate-300">
            {imageError ? (
              <div className="text-[10px] text-slate-500 text-center p-1 leading-tight flex flex-col items-center">
                <AlertCircle className="w-4 h-4 text-amber-500 mb-0.5" />
                <span>Sin vista</span>
              </div>
            ) : (
              <img
                src={result.normalizedUrl}
                alt="Vista previa"
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <div className="text-xs text-slate-600 min-w-0 flex-1">
            <p className="font-medium text-slate-800">Vista previa de imagen</p>
            <p className="text-[11px] text-slate-500 truncate mt-0.5">
              {result.normalizedUrl}
            </p>
            {imageError && (
              <p className="text-[11px] text-amber-700 mt-0.5">
                Si no se ve la imagen, verifica que el archivo de Drive sea público ("Cualquier persona con el enlace").
              </p>
            )}
          </div>
          {result.normalizedUrl && (
            <a
              href={result.normalizedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded transition-colors shrink-0"
              title="Abrir en pestaña nueva"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};
