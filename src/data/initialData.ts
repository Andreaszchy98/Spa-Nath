import { BusinessProfile, Ingredient, Order, Product, PromoBanner, Provider, DaySchedule, Service, Appointment } from '../types';

export const INITIAL_SERVICES: Service[] = [];

export const INITIAL_APPOINTMENTS: Appointment[] = [];

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
    name: 'Nathaly Ibarra',
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
