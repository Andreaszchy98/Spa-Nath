export type ThemeId = 'default' | 'rojo' | 'cafe' | 'naranja' | 'rosa' | 'crema';

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  description: string;
  badge: string;
  // Colors applied to the app
  bgClass: string;
  surfaceClass: string;
  buttonClass: string;
  buttonHoverClass: string;
  buttonTextClass: string;
  accentTextClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  headerBgClass: string;
  // Raw hex codes for custom styles if needed
  raw: {
    bg: string;
    primaryBtn: string;
    primaryBtnText: string;
    accent: string;
    border: string;
  };
}

export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'unidad' | 'porcion';

export interface Ingredient {
  id: string;
  name: string;
  unit: IngredientUnit;
  stock: number; // Stock central en almacén
  minStockAlert: number;
  costPerUnit: number; // Costo por unidad de medida (ej. $0.35/g o $12/unidad)
  category: string; // ej. "Café & Granos", "Lácteos", "Carnes & Panes", "Empaques"
  supplier?: string;
}

export interface ProductRecipeItem {
  ingredientId: string; // Referencia al ID del ingrediente en el catálogo central
  quantity: number; // Cantidad requerida de ese ingrediente por 1 unidad de producto
}

export type ServiceModality = 'local' | 'domicilio' | 'ambas';
export type ConfirmationType = 'automatica' | 'aprobacion' | 'hibrida';
export type PriceType = 'fijo' | 'desde' | 'a_cotizar';

export interface Service {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  category: string;
  price: number;
  priceType: PriceType; // 'fijo', 'desde', 'a_cotizar'
  durationMinutes: number;
  bufferMinutes: number;

  // Modality & Home service
  modality: ServiceModality; // 'local', 'domicilio', 'ambas'
  travelSurcharge: number;
  travelTimeMinutes: number;
  roundTripTravel: boolean;
  maxHomeZoneKm: number; // numeric value in km

  // Business rules & appointments
  confirmationType: ConfirmationType; // 'automatica', 'aprobacion' (manual), 'hibrida'
  hybridHoursThreshold: number; // hours threshold for hybrid
  providerResponseDeadlineMinutes: number; // minutes, validated <= appointment start
  minCancellationHours: number;
  minNoticeHours: number; // hours of notice required for same-day appointments

  providerIds: string[];
  available: boolean;
}

export type ProductType = 'comida' | 'bebida' | 'producto_fisico' | 'servicio';

export interface ProductOption {
  id: string;
  name: string;
  priceDelta: number; // 0 for no price change, > 0 for extra cost
  extraIngredientId?: string; // Opcional: si la opción consume un ingrediente extra central
  extraIngredientQuantity?: number; // Cantidad consumida por la opción
}

export interface ProductOptionGroup {
  id: string;
  title: string; // e.g. "Tamaño", "Tipo de leche", "Ingredientes Extras"
  type: 'single' | 'multiple'; // radio vs checkboxes
  required: boolean; // Obligatorio o no
  minSelections?: number;
  maxSelections?: number;
  options: ProductOption[];
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  type: ProductType;
  price: number; // Precio base de venta
  costPrice: number; // Costo de compra/producción para inventario
  stock: number; // Cantidad en inventario directo
  minStockAlert: number; // Alerta de stock bajo
  imageUrl: string;
  isDriveUrl?: boolean;
  driveRawUrl?: string;
  available: boolean;
  badge?: string;
  optionGroups: ProductOptionGroup[];
  recipe?: ProductRecipeItem[]; // Relación Many-to-Many: insumos requeridos del catálogo central
  // Campos específicos para servicios agendables
  durationMinutes?: number; // Duración del servicio en minutos (ej. 60)
  bufferMinutes?: number;   // Tiempo de pausa/limpieza entre citas (ej. 15)
  providerIds?: string[];   // IDs de proveedores que realizan este servicio
}

export type BannerBadge = 'PROMOCIÓN' | 'PATROCINIO' | 'NOVEDAD' | 'ANUNCIO';

export interface PromoBanner {
  id: string;
  title: string;
  subtitle: string;
  tagline?: string;
  badge: BannerBadge;
  imageUrl: string;
  targetProductId?: string; // ID del producto del catálogo al que dirige
  active: boolean;
  discountHighlight?: string; // e.g. "-20% HOY"
}

export interface SelectedOptionItem {
  groupId: string;
  groupTitle: string;
  optionId: string;
  optionName: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item cart instance id
  productId: string;
  productName: string;
  basePrice: number;
  unitPrice: number; // basePrice + total options
  quantity: number;
  selectedOptions: SelectedOptionItem[];
  customerNotes?: string;
  imageUrl: string;
}

export type OrderStatus = 'pendiente' | 'en_preparacion' | 'en_ruta' | 'entregado' | 'cancelado';

export interface CashPaymentDetail {
  amountPaid: number; // Con cuánto paga el cliente
  changeNeeded: number; // Cambio que se debe dar
}

export interface ShippingDetails {
  carrierName?: string; // ej. 'Reparto Propio', 'MotoEnvío Express', 'DHL', 'FedEx', 'Estafeta'
  trackingNumber?: string; // Guía de rastreo
  driverName?: string; // Nombre del repartidor
  driverPhone?: string; // Teléfono del repartidor
  dispatchedAt?: string; // Fecha y hora de despacho
  estimatedDelivery?: string; // Estimado de entrega
  deliveredAt?: string; // Fecha de entrega efectiva
  notes?: string; // Notas de entrega / referencias
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "PED-108"
  orderType?: 'recoger' | 'domicilio'; // Recoger en local o entrega a domicilio
  customerName: string;
  customerPhone: string;
  customerAddress?: string; // Dirección para envío / reparto
  customerNotes?: string;
  customerUid?: string | null;
  privacyAcceptedAt?: string;
  healthConsent?: boolean;
  items: CartItem[];
  subtotal: number;
  shippingFee?: number; // Costo de flete / envío
  total: number;
  paymentMethod: 'efectivo';
  cashPayment: CashPaymentDetail;
  paymentReceived: boolean; // Marcar cobrado
  status: OrderStatus;
  shippingDetails?: ShippingDetails;
  createdAt: string;
}

// ==========================================
// MÓDULO DE AGENDAMIENTO DE CITAS DE SERVICIOS
// ==========================================

export interface Provider {
  id: string;
  name: string;
  role: string; // ej. "Especialista Principal"
  avatarUrl?: string;
  active: boolean;
  weeklySchedule?: DaySchedule[];
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "18:00"
  breakStartTime?: string; // "14:00"
  breakEndTime?: string;   // "15:00"
}

export interface ScheduleException {
  id: string;
  providerId: string; // ID del proveedor o "all"
  date: string;       // "2026-10-15" (YYYY-MM-DD)
  type: 'bloqueo_total' | 'horario_especial';
  startTime?: string; // "09:00" si es horario especial
  endTime?: string;   // "14:00"
  reason: string;     // ej. "Vacaciones" o "Festivo"
}

export type AppointmentStatus = 'pendiente' | 'confirmada' | 'completada' | 'cancelada';

export interface Appointment {
  id: string;
  appointmentNumber: string; // ej. "CITA-4821"
  serviceId: string;
  serviceName: string;
  providerId: string;
  providerName: string;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  customerAddress?: string;
  customerUid?: string | null;
  privacyAcceptedAt?: string;
  healthConsent?: boolean;
  modality?: ServiceModality; // 'local' | 'domicilio'
  travelDistanceKm?: number;
  travelSurcharge?: number;
  priceType?: PriceType;
  startTimeUtc: string; // ISO string UTC
  endTimeUtc: string;   // ISO string UTC
  status: AppointmentStatus;
  totalPrice: number;
  confirmationType?: ConfirmationType;
  providerResponseDeadlineUtc?: string; // deadline timestamp in UTC
  minCancellationHours?: number;
  createdAt: string;
}

export interface BusinessProfile {
  name: string;
  slogan: string;
  logoUrl: string;
  category: string;
  currency: string;
  currencyCode: string;
  phone: string;
  address: string;
  currentTheme: ThemeId;
  enableStockControl: boolean;
  licenseCode: string;
  customBackgroundColor?: string;
}

export type UserRole = 'admin' | 'client';

export interface CurrentUser {
  role: UserRole;
  name: string;
  phone: string;
  address: string;
  uid?: string;
  email?: string;
  emailVerified?: boolean;
  photoUrl?: string;
  isLoggedIn?: boolean;
  authProvider?: 'google' | 'password' | 'guest';
}

export interface BusySlot {
  id: string;
  providerId: string;
  startTimeUtc: string;
  endTimeUtc: string;
  appointmentId: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  phone?: string;
  address?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export type NotificationType =
  | 'appointment_created'
  | 'appointment_updated'
  | 'appointment_cancelled'
  | 'order_created'
  | 'order_updated'
  | 'system_alert';

export interface AppNotification {
  id: string;
  userId?: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  linkTab?: 'agenda' | 'pedidos' | 'inventario' | 'servicios' | 'catalogo' | 'logistica';
  createdAt: string;
  audience: 'admin' | 'user';
  recipientUid: string | null;
}

export interface PushPreferences {
  enabled: boolean;
  notifyAppointments: boolean;
  notifyOrders: boolean;
  notifyCancellations: boolean;
  soundEnabled: boolean;
}

