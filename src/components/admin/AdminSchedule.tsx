import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  Users,
  CalendarDays,
  Shield,
  Phone,
  User,
  Scissors,
  Pencil,
  Save,
} from 'lucide-react';
import { AppointmentStatus, DaySchedule, ScheduleException, Provider } from '../../types';
import { GoogleDriveInput } from '../common/GoogleDriveInput';

export const AdminSchedule: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    deleteAppointment,
    providers,
    addProvider,
    updateProvider,
    deleteProvider,
    weeklySchedule,
    updateDaySchedule,
    updateProviderWeeklySchedule,
    exceptions,
    addException,
    deleteException,
    businessProfile,
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'agenda' | 'horario' | 'excepciones' | 'proveedores'>('agenda');
  const [statusFilter, setStatusFilter] = useState<string>('todas');

  // Selected provider for schedule configuration
  const [selectedScheduleProviderId, setSelectedScheduleProviderId] = useState<string>(
    providers.length > 0 ? providers[0].id : 'prov-1'
  );

  // Exception form state
  const [excDate, setExcDate] = useState('');
  const [excType, setExcType] = useState<'bloqueo_total' | 'horario_especial'>('bloqueo_total');
  const [excStart, setExcStart] = useState('09:00');
  const [excEnd, setExcEnd] = useState('14:00');
  const [excReason, setExcReason] = useState('');
  const [excProviderId, setExcProviderId] = useState('all');

  // Provider form state
  const [editingProviderId, setEditingProviderId] = useState<string | null>(null);
  const [newProvName, setNewProvName] = useState('');
  const [newProvRole, setNewProvRole] = useState('');
  const [newProvAvatar, setNewProvAvatar] = useState('');

  const activeScheduleProvider = providers.find((p) => p.id === selectedScheduleProviderId) || providers[0];
  const currentProviderSchedule = activeScheduleProvider?.weeklySchedule || weeklySchedule;

  const uniqueAppointments = Array.from(new Map(appointments.map((a) => [a.id, a])).values());
  const filteredAppointments = uniqueAppointments.filter((app) => {
    if (statusFilter === 'todas') return true;
    return app.status === statusFilter;
  });

  const handleCreateException = (e: React.FormEvent) => {
    e.preventDefault();
    if (!excDate || !excReason) return;
    addException({
      date: excDate,
      type: excType,
      startTime: excType === 'horario_especial' ? excStart : undefined,
      endTime: excType === 'horario_especial' ? excEnd : undefined,
      reason: excReason,
      providerId: excProviderId,
    });
    setExcDate('');
    setExcReason('');
  };

  const handleSaveProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProvName) return;
    const finalAvatar = newProvAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    if (editingProviderId) {
      updateProvider(editingProviderId, {
        name: newProvName,
        role: newProvRole || 'Especialista',
        avatarUrl: finalAvatar,
      });
      setEditingProviderId(null);
    } else {
      addProvider({
        name: newProvName,
        role: newProvRole || 'Especialista',
        active: true,
        avatarUrl: finalAvatar,
      });
    }
    setNewProvName('');
    setNewProvRole('');
    setNewProvAvatar('');
  };

  const handleStartEditProvider = (prov: Provider) => {
    setEditingProviderId(prov.id);
    setNewProvName(prov.name);
    setNewProvRole(prov.role);
    setNewProvAvatar(prov.avatarUrl || '');
  };

  const handleCancelEditProvider = () => {
    setEditingProviderId(null);
    setNewProvName('');
    setNewProvRole('');
    setNewProvAvatar('');
  };

  const handleUpdateProviderDay = (daySchedule: DaySchedule) => {
    const updated = currentProviderSchedule.map((s) => (s.dayOfWeek === daySchedule.dayOfWeek ? daySchedule : s));
    updateProviderWeeklySchedule(activeScheduleProvider.id, updated);
  };

  const getStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'confirmada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Confirmada
          </span>
        );
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <AlertCircle className="w-3.5 h-3.5" /> Pendiente (Mismo Día)
          </span>
        );
      case 'completada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completada
          </span>
        );
      case 'cancelada':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Cancelada
          </span>
        );
    }
  };

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Subtabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-rose-500" /> Gestión de Agenda & Citas
          </h2>
          <p className="text-sm text-slate-500">
            Administra citas de servicios, horarios semanales personalizados, bloqueos y personal.
          </p>
        </div>

        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl text-xs sm:text-sm font-medium gap-1">
          <button
            onClick={() => setActiveSubTab('agenda')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeSubTab === 'agenda' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Agenda ({appointments.length})
          </button>
          <button
            onClick={() => setActiveSubTab('horario')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeSubTab === 'horario' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Horario Semanal
          </button>
          <button
            onClick={() => setActiveSubTab('excepciones')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeSubTab === 'excepciones' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bloqueos ({exceptions.length})
          </button>
          <button
            onClick={() => setActiveSubTab('proveedores')}
            className={`px-3 py-2 rounded-lg transition-all ${
              activeSubTab === 'proveedores' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Personal ({providers.length})
          </button>
        </div>
      </div>

      {/* SUBTAB 1: AGENDA DE CITAS */}
      {activeSubTab === 'agenda' && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <span>Filtrar por estado:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-rose-500 outline-none"
              >
                <option value="todas">Todas las Citas</option>
                <option value="pendiente">Pendientes (Requieren revisión)</option>
                <option value="confirmada">Confirmadas</option>
                <option value="completada">Completadas</option>
                <option value="cancelada">Canceladas</option>
              </select>
            </div>
            <div className="text-xs text-slate-500">
              Regla: 30 días de anticipación max · Mínimo 2 horas para agendar · Mismo día requiere aprobación.
            </div>
          </div>

          {filteredAppointments.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-100 shadow-sm">
              <CalendarDays className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-semibold text-slate-700">No hay citas registradas</h3>
              <p className="text-sm text-slate-400 mt-1">Las reservas de servicios de los clientes aparecerán aquí.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredAppointments.map((app, index) => {
                const startDate = new Date(app.startTimeUtc);
                const endDate = new Date(app.endTimeUtc);
                return (
                  <div key={`${app.id}-${index}`} className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow space-y-4">
                    {/* Encabezado: Título con flex: 1 y min-width: 0, badge alineado arriba a la derecha */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-rose-600 tracking-wide uppercase">
                          {app.appointmentNumber}
                        </div>
                        <h3 className="text-base sm:text-lg font-bold text-slate-800 mt-0.5 break-words">
                          {app.serviceName}
                        </h3>
                      </div>
                      <div className="shrink-0 self-start pt-0.5">
                        {getStatusBadge(app.status)}
                      </div>
                    </div>

                    {/* Bloque de detalles (16px, etiquetas en gris, valores en negrita, teléfono en segunda línea) */}
                    <div className="bg-slate-50 p-4 rounded-2xl space-y-2.5 text-base text-slate-600">
                      <div className="flex items-center gap-2.5 text-[15px] sm:text-base">
                        <CalendarDays className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800 capitalize">
                          {startDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5 text-[15px] sm:text-base">
                        <Clock className="w-5 h-5 text-slate-400 shrink-0" />
                        <span className="font-bold text-slate-800">
                          {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <div className="flex items-start gap-2.5 text-[15px] sm:text-base">
                        <User className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                        <div className="min-w-0 flex-1">
                          <div>
                            <span className="text-slate-500 font-normal">Cliente: </span>
                            <span className="font-bold text-slate-900">{app.customerName}</span>
                          </div>
                          {app.customerPhone && (
                            <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 font-normal">
                              <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              <span>{app.customerPhone}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2.5 text-[15px] sm:text-base">
                        <Scissors className="w-5 h-5 text-slate-400 shrink-0" />
                        <div>
                          <span className="text-slate-500 font-normal">Especialista: </span>
                          <span className="font-bold text-slate-900">{app.providerName}</span>
                        </div>
                      </div>

                      {/* Modalidad y Domicilio */}
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap items-center justify-between gap-1 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                          app.modality === 'domicilio' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {app.modality === 'domicilio' ? 'A Domicilio' : 'En Spa / Local'}
                        </span>
                        {app.customerAddress && (
                          <span className="text-xs text-slate-600 truncate max-w-xs">
                            📍 {app.customerAddress}
                          </span>
                        )}
                      </div>

                      {/* Plazo de respuesta proveedor si está pendiente */}
                      {app.status === 'pendiente' && app.providerResponseDeadlineUtc && (
                        <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-center justify-between">
                          <span>⏱ Plazo máx respuesta proveedor:</span>
                          <strong>
                            {new Date(app.providerResponseDeadlineUtc).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </strong>
                        </div>
                      )}

                      {app.customerNotes && (
                        <div className="text-xs text-slate-500 italic pt-1.5 border-t border-slate-200">
                          Notas: "{app.customerNotes}"
                        </div>
                      )}
                    </div>

                    {/* Footer de la tarjeta: 2 filas */}
                    <div className="pt-3 border-t border-slate-100">
                      {/* Fila 1: Precio a la izquierda en grande y negrita, basura a la derecha pequeño y discreto */}
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xl sm:text-2xl font-bold text-slate-900">
                            {app.priceType === 'a_cotizar' ? 'A Cotizar' : `${businessProfile.currency}${app.totalPrice.toFixed(2)}`}
                          </span>
                          {app.travelSurcharge && app.travelSurcharge > 0 ? (
                            <span className="text-xs text-amber-700 block font-medium">
                              (incluye +{businessProfile.currency}{app.travelSurcharge} traslado)
                            </span>
                          ) : null}
                        </div>
                        <button
                          type="button"
                          onClick={() => deleteAppointment(app.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                          title="Eliminar registro"
                          aria-label="Eliminar cita"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Fila 2: Separación de 16px, 2 botones de igual ancho con gap de 12px */}
                      <div className="mt-4 grid grid-cols-2 gap-[12px]">
                        {app.status === 'pendiente' ? (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(app.id, 'confirmada')}
                            className="w-full h-[48px] rounded-[14px] whitespace-nowrap text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors flex items-center justify-center px-2"
                          >
                            Aprobar Cita
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => updateAppointmentStatus(app.id, 'completada')}
                            disabled={app.status === 'completada' || app.status === 'cancelada'}
                            className="w-full h-[48px] rounded-[14px] whitespace-nowrap text-[15px] font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-blue-100 disabled:text-blue-700 text-white shadow-xs transition-colors flex items-center justify-center px-2"
                          >
                            {app.status === 'completada' ? 'Completada' : 'Marcar completada'}
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(app.id, 'cancelada')}
                          disabled={app.status === 'cancelada'}
                          className="w-full h-[48px] rounded-[14px] whitespace-nowrap text-[15px] font-semibold bg-rose-50 hover:bg-rose-100 disabled:opacity-40 text-rose-600 border border-rose-100 transition-colors flex items-center justify-center px-2"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SUBTAB 2: HORARIO SEMANAL PERSONALIZADO POR PERSONAL */}
      {activeSubTab === 'horario' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Horario Semanal por Especialista</h3>
              <p className="text-sm text-slate-500">
                Selecciona al miembro del personal para configurar su disponibilidad y descansos individuales.
              </p>
            </div>
            {providers.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Personal:</span>
                <select
                  value={selectedScheduleProviderId}
                  onChange={(e) => setSelectedScheduleProviderId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  {providers.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.role})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="space-y-3">
            {currentProviderSchedule.map((day) => (
              <div
                key={day.dayOfWeek}
                className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-3 transition-all ${
                  day.enabled ? 'bg-slate-50/70 border-slate-200' : 'bg-slate-100/50 border-slate-200 opacity-70'
                }`}
              >
                <div className="flex items-center gap-3 shrink-0">
                  <input
                    type="checkbox"
                    checked={day.enabled}
                    onChange={(e) => handleUpdateProviderDay({ ...day, enabled: e.target.checked })}
                    className="w-5 h-5 text-rose-600 rounded border-slate-300 focus:ring-rose-500"
                  />
                  <span className="font-bold text-slate-800 w-24">{dayNames[day.dayOfWeek]}</span>
                </div>

                {day.enabled ? (
                  <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm">
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 font-medium">Aper:</span>
                      <input
                        type="time"
                        value={day.startTime}
                        onChange={(e) => handleUpdateProviderDay({ ...day, startTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 font-medium">Cier:</span>
                      <input
                        type="time"
                        value={day.endTime}
                        onChange={(e) => handleUpdateProviderDay({ ...day, endTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-1 bg-white px-2.5 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
                      <span className="text-slate-500 font-medium">Descanso:</span>
                      <input
                        type="time"
                        value={day.breakStartTime || ''}
                        onChange={(e) => handleUpdateProviderDay({ ...day, breakStartTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none w-20"
                      />
                      <span className="text-slate-400">-</span>
                      <input
                        type="time"
                        value={day.breakEndTime || ''}
                        onChange={(e) => handleUpdateProviderDay({ ...day, breakEndTime: e.target.value })}
                        className="bg-transparent text-slate-800 font-bold outline-none w-20"
                      />
                    </div>
                  </div>
                ) : (
                  <span className="text-sm font-medium text-slate-400 italic">Cerrado / No laborable</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUBTAB 3: EXCEPCIONES Y BLOQUEOS */}
      {activeSubTab === 'excepciones' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Agregar Bloqueo / Excepción</h3>
            <form onSubmit={handleCreateException} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Fecha</label>
                <input
                  type="date"
                  value={excDate}
                  onChange={(e) => setExcDate(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Tipo de Excepción</label>
                <select
                  value={excType}
                  onChange={(e) => setExcType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                >
                  <option value="bloqueo_total">Bloqueo Total (Día libre / Vacaciones)</option>
                  <option value="horario_especial">Horario Especial (Modificar horas)</option>
                </select>
              </div>

              {excType === 'horario_especial' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Desde</label>
                    <input
                      type="time"
                      value={excStart}
                      onChange={(e) => setExcStart(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Hasta</label>
                    <input
                      type="time"
                      value={excEnd}
                      onChange={(e) => setExcEnd(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-medium text-slate-700 mb-1">Motivo / Razón</label>
                <input
                  type="text"
                  placeholder="ej. Feriado Nacional, Mantenimiento"
                  value={excReason}
                  onChange={(e) => setExcReason(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Registrar Bloqueo
              </button>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Bloqueos & Excepciones Activas ({exceptions.length})</h3>
            {exceptions.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <CalendarDays className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                <p>No hay excepciones ni días bloqueados registrados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exceptions.map((exc) => (
                  <div key={exc.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{exc.date}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-medium ${
                            exc.type === 'bloqueo_total' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {exc.type === 'bloqueo_total' ? 'Bloqueo Total' : `Horario: ${exc.startTime} - ${exc.endTime}`}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{exc.reason}</p>
                    </div>
                    <button
                      onClick={() => deleteException(exc.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUBTAB 4: PROVEEDORES / PERSONAL */}
      {activeSubTab === 'proveedores' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">
              {editingProviderId ? 'Editar Personal / Proveedor' : 'Agregar Personal / Proveedor'}
            </h3>
            <form onSubmit={handleSaveProvider} className="space-y-4 text-sm">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Nombre Completo</label>
                <input
                  type="text"
                  placeholder="ej. Dra. Mariana Gómez"
                  value={newProvName}
                  onChange={(e) => setNewProvName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Especialidad / Rol</label>
                <input
                  type="text"
                  placeholder="ej. Cosmetóloga & Masajista"
                  value={newProvRole}
                  onChange={(e) => setNewProvRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 focus:ring-2 focus:ring-rose-500 outline-none"
                />
              </div>

              <div>
                <GoogleDriveInput
                  label="Foto de Perfil (URL o Drive)"
                  value={newProvAvatar}
                  onChange={(normalizedUrl) => setNewProvAvatar(normalizedUrl)}
                  placeholder="Pega enlace de foto o Google Drive..."
                />
              </div>

              <div className="flex gap-2 pt-2">
                {editingProviderId && (
                  <button
                    type="button"
                    onClick={handleCancelEditProvider}
                    className="flex-1 py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium rounded-xl transition-colors"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2"
                >
                  {editingProviderId ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  {editingProviderId ? 'Guardar Cambios' : 'Registrar Personal'}
                </button>
              </div>
            </form>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-slate-800">Personal Registrado ({providers.length})</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {providers.map((prov) => (
                <div key={prov.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={prov.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                      alt={prov.name}
                      className="w-12 h-12 rounded-full object-cover border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 truncate">{prov.name}</h4>
                      <p className="text-xs text-slate-500 truncate">{prov.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => handleStartEditProvider(prov)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                      title="Modificar datos e imagen"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    {providers.length > 1 && (
                      <button
                        onClick={() => deleteProvider(prov.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
