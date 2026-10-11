import { BusinessProfile, Ingredient, Order, Product, PromoBanner, Provider, DaySchedule, Service, Appointment } from '../types';

export const INITIAL_SERVICES: Service[] = [
  {
    id: 'serv-limpieza-espalda',
    name: 'Limpieza profunda en espalda',
    description: 'Exfoliación profunda, vapor con ozono, extracción de impurezas y mascarilla calmante para la espalda.',
    imageUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800',
    category: 'Faciales y Corporales',
    priceType: 'fijo',
    price: 450,
    durationMinutes: 60,
    bufferMinutes: 15,
    modality: 'local',
    travelSurcharge: 0,
    travelTimeMinutes: 0,
    roundTripTravel: false,
    maxHomeZoneKm: 10,
    confirmationType: 'automatica',
    hybridHoursThreshold: 6,
    providerResponseDeadlineMinutes: 120,
    minCancellationHours: 4,
    minNoticeHours: 2,
    providerIds: ['prov-1'],
    available: true,
  },
  {
    id: 'serv-masaje-relajante',
    name: 'Masaje Relajante Anti-Estrés',
    description: 'Terapia relajante corporal con aromaterapia, aceites nutritivos y alivio de tensiones musculares.',
    imageUrl: 'https://images.unsplash.com/photo-1600334129128-685c5582fd35?w=800',
    category: 'Masajes y Terapias',
    priceType: 'fijo',
    price: 650,
    durationMinutes: 75,
    bufferMinutes: 15,
    modality: 'local',
    travelSurcharge: 0,
    travelTimeMinutes: 0,
    roundTripTravel: false,
    maxHomeZoneKm: 10,
    confirmationType: 'automatica',
    hybridHoursThreshold: 6,
    providerResponseDeadlineMinutes: 120,
    minCancellationHours: 4,
    minNoticeHours: 2,
    providerIds: ['prov-1'],
    available: true,
  },
  {
    id: 'serv-facial-hidratante',
    name: 'Facial Hidratante Glow & Colágeno',
    description: 'Limpieza profunda de rostro, exfoliación suave, mascarilla de ácido hialurónico y masaje facial.',
    imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800',
    category: 'Faciales y Corporales',
    priceType: 'fijo',
    price: 520,
    durationMinutes: 60,
    bufferMinutes: 15,
    modality: 'local',
    travelSurcharge: 0,
    travelTimeMinutes: 0,
    roundTripTravel: false,
    maxHomeZoneKm: 10,
    confirmationType: 'automatica',
    hybridHoursThreshold: 6,
    providerResponseDeadlineMinutes: 120,
    minCancellationHours: 4,
    minNoticeHours: 2,
    providerIds: ['prov-1'],
    available: true,
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'app-sample-1',
    appointmentNumber: 'CITA-4821',
    serviceId: 'serv-limpieza-espalda',
    serviceName: 'Limpieza profunda en espalda',
    providerId: 'prov-1',
    providerName: 'Nathalia Silva',
    customerName: 'María Fernández',
    customerPhone: '55 1234 5678',
    customerNotes: 'Piel sensible en zona superior de la espalda.',
    customerAddress: 'Polanco V Secc, Miguel Hidalgo, CDMX',
    modality: 'local',
    travelDistanceKm: 0,
    travelSurcharge: 0,
    priceType: 'fijo',
    startTimeUtc: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    endTimeUtc: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
    status: 'confirmada',
    totalPrice: 450,
    confirmationType: 'automatica',
    providerResponseDeadlineUtc: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    minCancellationHours: 4,
    createdAt: new Date().toISOString(),
  },
];

export const INITIAL_WEEKLY_SCHEDULE: DaySchedule[] = [
  { dayOfWeek: 0, enabled: false, startTime: '09:00', endTime: '18:00' }, // Domingo
  { dayOfWeek: 1, enabled: true, startTime: '09:00', endTime: '19:00', breakStartTime: '14:00', breakEndTime: '15:00' }, // Lunes
  { dayOfWeek: 2, enabled: true, startTime: '09:00', endTime: '19:00', breakStartTime: '14:00', breakEndTime: '15:00' }, // Martes
  { dayOfWeek: 3, enabled: true, startTime: '09:00', endTime: '19:00', breakStartTime: '14:00', breakEndTime: '15:00' }, // Miércoles
  { dayOfWeek: 4, enabled: true, startTime: '09:00', endTime: '19:00', breakStartTime: '14:00', breakEndTime: '15:00' }, // Jueves
  { dayOfWeek: 5, enabled: true, startTime: '09:00', endTime: '19:00', breakStartTime: '14:00', breakEndTime: '15:00' }, // Viernes
  { dayOfWeek: 6, enabled: true, startTime: '10:00', endTime: '16:00' }, // Sábado
];

export const INITIAL_PROVIDERS: Provider[] = [
  {
    id: 'prov-1',
    name: 'Nathalia Silva',
    role: 'Terapeuta & Especialista Principal',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    active: true,
    weeklySchedule: INITIAL_WEEKLY_SCHEDULE,
  },
];

export const INITIAL_BUSINESS_PROFILE: BusinessProfile = {
  name: 'Spa Nath',
  slogan: 'Centro de Bienestar, Masajes Relajantes y Tratamientos Faciales',
  logoUrl: '',
  category: 'Spa & Bienestar',
  currency: '$',
  currencyCode: 'MXN',
  phone: '+52 55 1234 5678',
  address: 'Av. Masaryk 402, Polanco, CDMX',
  currentTheme: 'rosa',
  enableStockControl: true,
  licenseCode: 'LIC-SPANATH-2026',
  customBackgroundColor: '',
};


export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_BANNERS: PromoBanner[] = [];

export const INITIAL_ORDERS: Order[] = [];

export const INITIAL_INGREDIENTS: Ingredient[] = [];

