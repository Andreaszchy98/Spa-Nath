import React from 'react';
import { X, ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Aviso de Privacidad y Protección de Datos
              </h2>
              <p className="text-[11px] text-slate-500">
                Conformidad con normativas de privacidad y tratamiento de datos personales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-200/60 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            aria-label="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-900 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-extrabold text-xs mb-1">Compromiso con tu Privacidad</p>
              <p className="text-[11px] text-emerald-800">
                Tus datos personales y de salud son tratados bajo estrictas medidas de seguridad, confidencialidad y conforme a la legislación aplicable de protección de datos.
              </p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>1. Responsable del Tratamiento de Datos</span>
            </h3>
            <p>
              La administración de la plataforma y del centro de servicios estéticos y de pedidos es la responsable del uso, almacenamiento y protección de tus datos personales, garantizando que sean empleados exclusivamente para los fines descritos en el presente aviso.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-700" />
              <span>2. Datos Personales que Recabamos</span>
            </h3>
            <p>
              Para la gestión adecuada de tus citas, reservas, pedidos y comunicaciones, podemos recopilar los siguientes datos:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li><strong>Datos de Identificación y Contacto:</strong> Nombre completo, correo electrónico, número de teléfono / WhatsApp y dirección de domicilio (en caso de requerir entrega a domicilio o servicios).</li>
              <li><strong>Datos de Citas y Pedidos:</strong> Historial de servicios agendados, productos comprados, fechas, horarios y notas personalizadas.</li>
              <li><strong>Datos de Salud Opcionales:</strong> Alergias, condiciones cutáneas o notas de salud que decidas voluntariamente proporcionar en las notas de tus citas para garantizar un servicio seguro y personalizado.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm">3. Finalidades del Tratamiento de Datos</h3>
            <p>
              Tus datos son utilizados para las siguientes finalidades esenciales:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-600">
              <li>Gestionar, confirmar, reprogramar o cancelar tus citas en el centro de estética y servicios.</li>
              <li>Procesar, preparar y entregar tus pedidos de productos físicos o consumibles.</li>
              <li>Enviar notificaciones y recordatorios importantes sobre el estatus de tus servicios y compras.</li>
              <li>Cumplir con obligaciones legales y normativas aplicables.</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm">4. Consentimiento y Datos de Salud</h3>
            <p>
              Al registrarte o confirmar una cita, otorgas tu consentimiento expreso mediante casilla de verificación para el tratamiento de tus datos personales. El uso de información sobre alergias o datos sensibles en las notas de citas requiere tu autorización explícita adicional, la cual se gestiona de forma transparente al agendar.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm">5. Derechos ARCO y Eliminación de Cuenta</h3>
            <p>
              En todo momento tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (Derechos ARCO) al tratamiento de tus datos personales. Puedes ejercer estos derechos directamente desde tu perfil de usuario utilizando la función <strong>"Eliminar mi cuenta"</strong>, la cual procederá a la anonimización de tus registros históricos y a la eliminación definitiva de tu cuenta y datos asociados en la base de datos y en Firebase Authentication.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm">6. Modificaciones al Aviso de Privacidad</h3>
            <p>
              Cualquier actualización o modificación al presente aviso de privacidad será notificada a través de esta misma plataforma.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 shrink-0 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
          >
            Entendido, cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
