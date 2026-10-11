import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCircle2,
  AlertCircle,
  Calendar,
  ShoppingBag,
  Package,
  Trash2,
  Check,
  Volume2,
  VolumeX,
  Smartphone,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NotificationType } from '../../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    notifications,
    unreadNotificationsCount,
    pushPermission,
    pushPreferences,
    requestPushPermission,
    updatePushPreferences,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    clearAllNotifications,
    sendTestPushNotification,
    setAdminTab,
    setCustomerTab,
    currentUser,
    theme,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [testingPush, setTestingPush] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  if (!isOpen) return null;

  const uniqueNotifications = Array.from(
    new Map(notifications.map((n) => [n.id, n])).values()
  );
  const filteredNotifications = uniqueNotifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    return true;
  });

  const handleTestNotification = async () => {
    setTestingPush(true);
    try {
      await sendTestPushNotification();
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => setTestingPush(false), 1200);
    }
  };

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);
    if (notif.linkTab) {
      if (currentUser.role === 'admin') {
        setAdminTab(notif.linkTab as any);
      } else {
        if (notif.linkTab === 'pedidos') {
          setCustomerTab('pedidos');
        } else {
          setCustomerTab('catalogo');
        }
      }
      onClose();
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'appointment_created':
        return <Calendar className="w-4 h-4 text-rose-500" />;
      case 'appointment_updated':
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'appointment_cancelled':
        return <AlertCircle className="w-4 h-4 text-rose-600" />;
      case 'order_created':
        return <ShoppingBag className="w-4 h-4 text-amber-500" />;
      case 'order_updated':
        return <Package className="w-4 h-4 text-blue-500" />;
      case 'system_alert':
      default:
        return <Bell className="w-4 h-4 text-indigo-500" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

      if (diffSec < 60) return 'Hace unos momentos';
      if (diffSec < 3600) return `Hace ${Math.floor(diffSec / 60)} min`;
      if (diffSec < 86400) return `Hace ${Math.floor(diffSec / 3600)} h`;
      return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 border-l border-slate-100">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs"
              style={{ backgroundColor: theme.raw.primaryBtn }}
            >
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                Notificaciones Push
                {unreadNotificationsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    {unreadNotificationsCount} nueva{unreadNotificationsCount > 1 ? 's' : ''}
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">Alertas en tiempo real de citas y pedidos</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Browser Push Permission Banner */}
        <div className="p-4 bg-slate-50/80 border-b border-slate-100 shrink-0 space-y-3">
          {pushPermission === 'default' ? (
            <div className="bg-white p-3.5 rounded-2xl border border-rose-100 shadow-2xs space-y-2.5">
              <div className="flex items-start gap-2.5">
                <Smartphone className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="text-xs font-bold text-slate-800">
                    Activar notificaciones en el navegador
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                    Recibe avisos inmediatos en tu dispositivo cuando entren nuevas citas o pedidos, incluso con la pestaña en segundo plano.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={requestPushPermission}
                className="w-full py-2.5 px-3 rounded-xl text-xs font-bold text-white shadow-xs transition-all active:scale-95 flex items-center justify-center gap-1.5"
                style={{ backgroundColor: theme.raw.primaryBtn }}
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Permitir Notificaciones Push</span>
              </button>
            </div>
          ) : pushPermission === 'granted' ? (
            <div className="bg-white p-3 rounded-2xl border border-emerald-100 shadow-2xs flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-emerald-800">
                  Notificaciones push activadas
                </span>
              </div>
              <button
                type="button"
                onClick={handleTestNotification}
                disabled={testingPush}
                className="text-xs px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-rose-500" />
                <span>{testingPush ? 'Enviando...' : 'Probar push'}</span>
              </button>
            </div>
          ) : (
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-[11px]">Notificaciones bloqueadas en el navegador</p>
                <p className="text-[10px] text-amber-700 mt-0.5">
                  Haz clic en el candado de la barra de direcciones de tu navegador para conceder permiso.
                </p>
              </div>
            </div>
          )}

          {/* Quick Push Settings Toggle */}
          <div className="flex items-center justify-between text-xs text-slate-600 pt-1">
            <button
              type="button"
              onClick={() => setShowPreferences(!showPreferences)}
              className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline flex items-center gap-1"
            >
              <span>{showPreferences ? 'Ocultar ajustes push' : 'Configurar alertas y sonido'}</span>
            </button>

            <button
              type="button"
              onClick={() => updatePushPreferences({ soundEnabled: !pushPreferences.soundEnabled })}
              className={`p-1.5 rounded-lg border flex items-center gap-1 text-[11px] font-medium transition-colors ${
                pushPreferences.soundEnabled
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-white text-slate-500 border-slate-200'
              }`}
              title={pushPreferences.soundEnabled ? 'Sonido activado' : 'Sonido silenciado'}
            >
              {pushPreferences.soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              <span>{pushPreferences.soundEnabled ? 'Sonido ON' : 'Silencio'}</span>
            </button>
          </div>

          {/* Collapsible Preferences */}
          {showPreferences && (
            <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 text-xs text-slate-700 animate-in fade-in duration-150">
              <label className="flex items-center justify-between cursor-pointer">
                <span>Alertas de nuevas citas</span>
                <input
                  type="checkbox"
                  checked={pushPreferences.notifyAppointments}
                  onChange={(e) => updatePushPreferences({ notifyAppointments: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Alertas de nuevos pedidos</span>
                <input
                  type="checkbox"
                  checked={pushPreferences.notifyOrders}
                  onChange={(e) => updatePushPreferences({ notifyOrders: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span>Alertas de cancelaciones</span>
                <input
                  type="checkbox"
                  checked={pushPreferences.notifyCancellations}
                  onChange={(e) => updatePushPreferences({ notifyCancellations: e.target.checked })}
                  className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
                />
              </label>
            </div>
          )}
        </div>

        {/* Filter & Actions Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filter === 'unread' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              No leídas ({unreadNotificationsCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadNotificationsCount > 0 && (
              <button
                type="button"
                onClick={markAllNotificationsAsRead}
                className="text-[11px] font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1"
                title="Marcar todas como leídas"
              >
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>Leídas</span>
              </button>
            )}
            {notifications.length > 0 && (
              <button
                type="button"
                onClick={clearAllNotifications}
                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-colors"
                title="Borrar todas"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredNotifications.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Sin notificaciones</h3>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {filter === 'unread'
                  ? 'No tienes notificaciones pendientes por leer.'
                  : 'Aquí aparecerán los avisos de nuevas reservas, cancelaciones y pedidos en tiempo real.'}
              </p>
              <button
                type="button"
                onClick={handleTestNotification}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors mt-2"
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Generar notificación de prueba</span>
              </button>
            </div>
          ) : (
            filteredNotifications.map((notif, index) => {
              return (
                <div
                  key={`${notif.id}-${index}`}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-3 ${
                    notif.read
                      ? 'bg-white border-slate-200/80 hover:border-slate-300 opacity-80 hover:opacity-100'
                      : 'bg-rose-50/20 border-rose-200/80 shadow-2xs hover:shadow-xs'
                  }`}
                >
                  {/* Status dot */}
                  {!notif.read && (
                    <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500" />
                  )}

                  {/* Icon */}
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs mt-0.5">
                    {getNotificationIcon(notif.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pr-4">
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed break-words">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                      <span>{formatTimeAgo(notif.createdAt)}</span>
                      {notif.linkTab && (
                        <span className="text-rose-600 font-semibold flex items-center gap-0.5 group-hover:underline">
                          <span>Ver en {notif.linkTab}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Delete individual button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 rounded-lg transition-all"
                    title="Eliminar notificación"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 text-center shrink-0">
          <p className="text-[11px] text-slate-500">
            Alertas sincronizadas con la nube y el navegador de tu dispositivo.
          </p>
        </div>
      </div>
    </div>
  );
};
