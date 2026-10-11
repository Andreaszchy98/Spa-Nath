/**
 * Utilidades para normalizar y procesar enlaces de imágenes de Google Drive
 * Transforma URLs compartidas de Drive en URLs de visualización directa aptas para etiquetas <img>
 */

export interface GoogleDriveNormalizeResult {
  isGoogleDrive: boolean;
  isValid: boolean;
  fileId: string | null;
  normalizedUrl: string;
  errorMessage?: string;
  tip?: string;
}

/**
 * Extrae el ID de archivo de cualquier formato común de enlace de Google Drive
 */
export function extractGoogleDriveFileId(inputUrl: string): string | null {
  if (!inputUrl) return null;
  const trimmed = inputUrl.trim();

  // Caso 1: https://drive.google.com/file/d/{FILE_ID}/view?usp=sharing
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{20,})/);
  if (fileDMatch && fileDMatch[1]) {
    return fileDMatch[1];
  }

  // Caso 2: https://drive.google.com/open?id={FILE_ID} o /uc?id={FILE_ID} o /uc?export=view&id={FILE_ID}
  const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{20,})/);
  if (idParamMatch && idParamMatch[1]) {
    return idParamMatch[1];
  }

  // Caso 3: https://lh3.googleusercontent.com/d/{FILE_ID}
  const lh3Match = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{20,})/);
  if (lh3Match && lh3Match[1]) {
    return lh3Match[1];
  }

  // Caso 4: El usuario pegó únicamente el ID alfanumérico largo de Drive
  if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
}

/**
 * Normaliza una URL o enlace de Google Drive
 * Si es de Drive, genera la URL canónica de streaming directo en CDN (lh3.googleusercontent.com/d/{ID})
 * Si no es de Drive, retorna la URL original limpia.
 */
export function normalizeDriveOrDirectUrl(url: string): GoogleDriveNormalizeResult {
  if (!url || !url.trim()) {
    return {
      isGoogleDrive: false,
      isValid: false,
      fileId: null,
      normalizedUrl: '',
      errorMessage: 'Por favor ingresa una URL válida',
    };
  }

  const trimmed = url.trim();
  const isDrivePattern = trimmed.includes('drive.google.com') || trimmed.includes('googleusercontent.com') || trimmed.includes('docs.google.com');

  const fileId = extractGoogleDriveFileId(trimmed);

  if (fileId) {
    // Generamos la URL de visualización directa mediante CDN de Google
    const directCdnUrl = `https://lh3.googleusercontent.com/d/${fileId}`;
    return {
      isGoogleDrive: true,
      isValid: true,
      fileId,
      normalizedUrl: directCdnUrl,
      tip: 'Recuerda que en Google Drive el archivo debe estar configurado como "Cualquier persona con el enlace puede ver".',
    };
  }

  if (isDrivePattern && !fileId) {
    return {
      isGoogleDrive: true,
      isValid: false,
      fileId: null,
      normalizedUrl: trimmed,
      errorMessage: 'El enlace de Google Drive no contiene un ID de archivo reconocible. Copia el enlace desde "Compartir > Copiar enlace".',
      tip: 'Ejemplo válido: https://drive.google.com/file/d/1a2b3c4d5e.../view?usp=sharing',
    };
  }

  // No es Google Drive: es una URL HTTP(S) normal o asset local
  const isValidUrl = trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/src/assets') || trimmed.startsWith('data:image');

  return {
    isGoogleDrive: false,
    isValid: isValidUrl,
    fileId: null,
    normalizedUrl: trimmed,
    tip: isValidUrl ? 'URL directa detectada' : 'Asegúrate de que la URL comience con https://',
  };
}

/**
 * URLs de ejemplo de Google Drive para demostración o prueba rápida
 */
export const GOOGLE_DRIVE_EXAMPLES = [
  {
    label: 'Enlace compartir típico de Drive',
    sample: 'https://drive.google.com/file/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs/view?usp=sharing',
  },
  {
    label: 'Enlace corto con ?id=',
    sample: 'https://drive.google.com/open?id=1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs',
  },
];
