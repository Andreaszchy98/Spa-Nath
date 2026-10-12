import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  collection,
  onSnapshot,
  query,
  where,
  setDoc,
  deleteDoc,
  writeBatch,
  runTransaction,
  getDoc,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import {
  Product,
  Ingredient,
  Order,
  PromoBanner,
  BusinessProfile,
  Provider,
  DaySchedule,
  ScheduleException,
  Appointment,
  Service,
  UserProfile,
  AppNotification,
} from './types';

// 1. Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Initialize Firestore using the designated databaseId
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
export const auth = getAuth(app);

export const firebaseInfo = {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  appName: 'MultiRestaurant',
  consoleUrl: `https://console.firebase.google.com/project/${firebaseConfig.projectId}/firestore/databases/${firebaseConfig.firestoreDatabaseId}/data`,
};

// 3. Error handling specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
      return false;
    }
    // Expected to receive either document-not-found or permission-denied without breaking offline usage
    return true;
  }
}

// Auto-run connection test
testConnection();

// ============================================================================
// FIRESTORE SYNC & PERSISTENCE SERVICES
// ============================================================================

// --- Products ---
export function subscribeProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'products';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Product[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Product);
      });
      onSuccess(items);
    },
    (err) => {
      console.warn('Products listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function upsertProductFirestore(product: Product): Promise<void> {
  const path = `products/${product.id}`;
  try {
    // Sanitized document payload matching schema
    const payload = {
      id: product.id,
      name: product.name,
      description: product.description || '',
      category: product.category || 'General',
      type: product.type || 'comida',
      price: Number(product.price) || 0,
      costPrice: Number(product.costPrice) || 0,
      stock: Number(product.stock) || 0,
      minStockAlert: Number(product.minStockAlert) || 0,
      imageUrl: product.imageUrl || '',
      isDriveUrl: Boolean(product.isDriveUrl),
      driveRawUrl: product.driveRawUrl || '',
      available: Boolean(product.available),
      badge: product.badge || '',
      optionGroups: product.optionGroups || [],
      recipe: product.recipe || [],
    };
    await setDoc(doc(db, 'products', product.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProductFirestore(productId: string): Promise<void> {
  const path = `products/${productId}`;
  try {
    await deleteDoc(doc(db, 'products', productId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Ingredients ---
export function subscribeIngredients(
  onSuccess: (ingredients: Ingredient[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'ingredients';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Ingredient[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Ingredient);
      });
      onSuccess(items);
    },
    (err) => {
      console.warn('Ingredients listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function upsertIngredientFirestore(ingredient: Ingredient): Promise<void> {
  const path = `ingredients/${ingredient.id}`;
  try {
    const payload = {
      id: ingredient.id,
      name: ingredient.name,
      unit: ingredient.unit,
      stock: Number(ingredient.stock) || 0,
      minStockAlert: Number(ingredient.minStockAlert) || 0,
      costPerUnit: Number(ingredient.costPerUnit) || 0,
      category: ingredient.category || 'General',
      supplier: ingredient.supplier || '',
    };
    await setDoc(doc(db, 'ingredients', ingredient.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteIngredientFirestore(ingredientId: string): Promise<void> {
  const path = `ingredients/${ingredientId}`;
  try {
    await deleteDoc(doc(db, 'ingredients', ingredientId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Orders ---
export function subscribeOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (err: Error) => void,
  userId?: string
) {
  const path = 'orders';
  const q = userId ? query(collection(db, path), where('customerUid', '==', userId)) : collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Order[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as Order);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(items);
    },
    (err) => {
      console.warn('Orders listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function saveOrderFirestore(order: Order): Promise<void> {
  const path = `orders/${order.id}`;
  try {
    const payload = {
      id: order.id,
      orderNumber: order.orderNumber,
      orderType: order.orderType || 'recoger',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      customerNotes: order.customerNotes || '',
      items: order.items || [],
      subtotal: Number(order.subtotal) || 0,
      total: Number(order.total) || 0,
      paymentMethod: order.paymentMethod || 'efectivo',
      cashPayment: order.cashPayment || { amountPaid: 0, changeNeeded: 0 },
      paymentReceived: Boolean(order.paymentReceived),
      status: order.status || 'pendiente',
      createdAt: order.createdAt,
    };
    await setDoc(doc(db, 'orders', order.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateOrderStatusFirestore(orderId: string, status: Order['status'], paymentReceived?: boolean): Promise<void> {
  const path = `orders/${orderId}`;
  try {
    const patch: Record<string, unknown> = { status };
    if (paymentReceived !== undefined) {
      patch.paymentReceived = paymentReceived;
    }
    await setDoc(doc(db, 'orders', orderId), patch, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

// --- Banners ---
export function subscribeBanners(
  onSuccess: (banners: PromoBanner[]) => void,
  onError?: (err: Error) => void
) {
  const path = 'banners';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: PromoBanner[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ ...data, id: docSnap.id } as PromoBanner);
      });
      onSuccess(items);
    },
    (err) => {
      console.warn('Banners listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function upsertBannerFirestore(banner: PromoBanner): Promise<void> {
  const path = `banners/${banner.id}`;
  try {
    const payload = {
      id: banner.id,
      title: banner.title,
      subtitle: banner.subtitle,
      tagline: banner.tagline || '',
      badge: banner.badge,
      imageUrl: banner.imageUrl,
      targetProductId: banner.targetProductId || '',
      active: Boolean(banner.active),
      discountHighlight: banner.discountHighlight || '',
    };
    await setDoc(doc(db, 'banners', banner.id), payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteBannerFirestore(bannerId: string): Promise<void> {
  const path = `banners/${bannerId}`;
  try {
    await deleteDoc(doc(db, 'banners', bannerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Business Profile ---
export function subscribeBusinessProfile(
  onSuccess: (profile: BusinessProfile) => void,
  onError?: (err: Error) => void
) {
  const path = 'business_profiles/main';
  return onSnapshot(
    doc(db, 'business_profiles', 'main'),
    (snapshot) => {
      if (snapshot.exists()) {
        onSuccess(snapshot.data() as BusinessProfile);
      }
    },
    (err) => {
      console.warn('BusinessProfile listener error:', err);
      if (onError) onError(err);
      try {
        handleFirestoreError(err, OperationType.GET, path);
      } catch (_) {
        // Logged
      }
    }
  );
}

export async function saveBusinessProfileFirestore(profile: BusinessProfile): Promise<void> {
  const path = 'business_profiles/main';
  try {
    await setDoc(doc(db, 'business_profiles', 'main'), profile, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Batch Push to Cloud (Explicit Only, Never Offline) ---
export async function pushAllToFirestore(data: {
  products: Product[];
  ingredients: Ingredient[];
  banners: PromoBanner[];
  orders: Order[];
  profile: BusinessProfile;
  services?: Service[];
}): Promise<void> {
  // Guard against seeding/syncing offline to avoid database discrepancies
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    console.warn('Sincronización cancelada: No se puede sembrar o sincronizar datos sin conexión a internet.');
    return;
  }
  const batch = writeBatch(db);

  // Profile
  batch.set(doc(db, 'business_profiles', 'main'), data.profile, { merge: true });

  // Products
  data.products.forEach((p) => {
    batch.set(doc(db, 'products', p.id), p);
  });

  // Services
  if (data.services) {
    data.services.forEach((s) => {
      batch.set(doc(db, 'services', s.id), s);
    });
  }

  // Ingredients
  data.ingredients.forEach((i) => {
    batch.set(doc(db, 'ingredients', i.id), i);
  });

  // Banners
  data.banners.forEach((b) => {
    batch.set(doc(db, 'banners', b.id), b);
  });

  // Orders
  data.orders.forEach((o) => {
    batch.set(doc(db, 'orders', o.id), o);
  });

  try {
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'batch_seed');
  }
}

// ============================================================================
// APPOINTMENT SCHEDULING SERVICES
// ============================================================================

// --- Providers ---
export function subscribeProviders(onSuccess: (providers: Provider[]) => void, onError?: (err: Error) => void) {
  const path = 'providers';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Provider[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as Provider));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertProviderFirestore(provider: Provider): Promise<void> {
  const path = `providers/${provider.id}`;
  try {
    await setDoc(doc(db, 'providers', provider.id), provider);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteProviderFirestore(providerId: string): Promise<void> {
  const path = `providers/${providerId}`;
  try {
    await deleteDoc(doc(db, 'providers', providerId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Weekly Schedule ---
export function subscribeWeeklySchedule(onSuccess: (schedule: DaySchedule[]) => void, onError?: (err: Error) => void) {
  const path = 'weekly_schedule';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: DaySchedule[] = [];
      snapshot.forEach((docSnap) => items.push(docSnap.data() as DaySchedule));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function saveDayScheduleFirestore(daySchedule: DaySchedule): Promise<void> {
  const path = `weekly_schedule/day_${daySchedule.dayOfWeek}`;
  try {
    await setDoc(doc(db, 'weekly_schedule', `day_${daySchedule.dayOfWeek}`), daySchedule);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// --- Schedule Exceptions ---
export function subscribeExceptions(onSuccess: (exceptions: ScheduleException[]) => void, onError?: (err: Error) => void) {
  const path = 'exceptions';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: ScheduleException[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as ScheduleException));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertExceptionFirestore(exc: ScheduleException): Promise<void> {
  const path = `exceptions/${exc.id}`;
  try {
    await setDoc(doc(db, 'exceptions', exc.id), exc);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteExceptionFirestore(excId: string): Promise<void> {
  const path = `exceptions/${excId}`;
  try {
    await deleteDoc(doc(db, 'exceptions', excId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Appointments ---
export function subscribeAppointments(
  onSuccess: (appointments: Appointment[]) => void, 
  onError?: (err: Error) => void,
  userId?: string
) {
  const path = 'appointments';
  const q = userId ? query(collection(db, path), where('customerUid', '==', userId)) : collection(db, path);
  return onSnapshot(
    q,
    (snapshot) => {
      const items: Appointment[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as Appointment));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function saveAppointmentFirestore(app: Appointment): Promise<void> {
  const path = `appointments/${app.id}`;
  try {
    const cleaned = cleanObject(app);
    await setDoc(doc(db, 'appointments', app.id), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function cleanObject<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(cleanObject) as unknown as T;
  }
  const cleaned: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      cleaned[key] = cleanObject(value);
    }
  }
  return cleaned as T;
}

export async function updateAppointmentStatusFirestore(appId: string, status: Appointment['status']): Promise<void> {
  const path = `appointments/${appId}`;
  try {
    await setDoc(doc(db, 'appointments', appId), { status }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteAppointmentFirestore(appId: string): Promise<void> {
  const path = `appointments/${appId}`;
  try {
    await deleteDoc(doc(db, 'appointments', appId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Services ---
export function subscribeServices(onSuccess: (services: Service[]) => void, onError?: (err: Error) => void) {
  const path = 'services';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: Service[] = [];
      snapshot.forEach((docSnap) => items.push({ ...docSnap.data(), id: docSnap.id } as Service));
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertServiceFirestore(service: Service): Promise<void> {
  const path = `services/${service.id}`;
  try {
    await setDoc(doc(db, 'services', service.id), service);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteServiceFirestore(serviceId: string): Promise<void> {
  const path = `services/${serviceId}`;
  try {
    await deleteDoc(doc(db, 'services', serviceId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// --- Notifications ---
export function subscribeNotifications(onSuccess: (notifications: AppNotification[]) => void, onError?: (err: Error) => void) {
  const path = 'notifications';
  return onSnapshot(
    collection(db, path),
    (snapshot) => {
      const items: AppNotification[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId || 'all',
          title: data.title || 'Notificación',
          message: data.message || '',
          type: data.type || 'system_alert',
          read: Boolean(data.read),
          linkTab: data.linkTab,
          createdAt: data.createdAt || new Date().toISOString(),
        } as AppNotification);
      });
      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      onSuccess(items);
    },
    (err) => {
      if (onError) onError(err);
      try { handleFirestoreError(err, OperationType.LIST, path); } catch (_) {}
    }
  );
}

export async function upsertNotificationFirestore(notif: AppNotification): Promise<void> {
  const path = `notifications/${notif.id}`;
  try {
    const cleaned = cleanObject(notif);
    await setDoc(doc(db, 'notifications', notif.id), cleaned);
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function markNotificationReadFirestore(notifId: string): Promise<void> {
  const path = `notifications/${notifId}`;
  try {
    await setDoc(doc(db, 'notifications', notifId), { read: true }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteNotificationFirestore(notifId: string): Promise<void> {
  const path = `notifications/${notifId}`;
  try {
    await deleteDoc(doc(db, 'notifications', notifId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function clearAllNotificationsFirestore(notificationIds: string[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    notificationIds.forEach((id) => {
      batch.delete(doc(db, 'notifications', id));
    });
    await batch.commit();
  } catch (error) {
    console.warn('Error clearing notifications batch:', error);
  }
}

// ============================================================================
// USER PROFILES & FIREBASE AUTH SERVICES
// ============================================================================

export async function getUserProfileFirestore(uid: string): Promise<UserProfile | null> {
  const path = `users/${uid}`;
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('getUserProfileFirestore error:', error);
    return null;
  }
}

export async function upsertUserProfileFirestore(profile: Partial<UserProfile> & { uid: string }): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const cleaned = cleanObject({
      ...profile,
      updatedAt: new Date().toISOString(),
    });
    await setDoc(doc(db, 'users', profile.uid), cleaned, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Administrator authorized emails
export const ADMIN_EMAILS = [
  'jorgeandres980706@gmail.com',
];

export function isUserAdminEmail(email?: string | null): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.some((adminEmail) => adminEmail.toLowerCase() === email.toLowerCase().trim());
}

// Provider instance
export const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({ prompt: 'select_account' });

export async function loginWithGoogle(): Promise<FirebaseUser> {
  try {
    const result = await signInWithPopup(auth, googleAuthProvider);
    const user = result.user;
    // Check if user already exists in Firestore or save initial data
    const existing = await getUserProfileFirestore(user.uid);
    const isAdmin = isUserAdminEmail(user.email) || existing?.role === 'admin';
    await upsertUserProfileFirestore({
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || existing?.displayName || (isAdmin ? 'Administrador' : 'Cliente'),
      photoURL: user.photoURL || existing?.photoURL || '',
      phone: existing?.phone || user.phoneNumber || '',
      address: existing?.address || '',
      role: isAdmin ? 'admin' : 'client',
      createdAt: existing?.createdAt || new Date().toISOString(),
    });
    return user;
  } catch (error: any) {
    console.error('Error al iniciar sesión con Google:', error);
    throw error;
  }
}

export async function loginWithEmail(email: string, pass: string): Promise<FirebaseUser> {
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error('Error al iniciar sesión con correo:', error);
    throw error;
  }
}

export async function registerWithEmail(email: string, pass: string, displayName: string): Promise<FirebaseUser> {
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName.trim()) {
      await updateProfile(result.user, { displayName: displayName.trim() });
    }
    const isAdmin = isUserAdminEmail(result.user.email);
    await upsertUserProfileFirestore({
      uid: result.user.uid,
      email: result.user.email || email,
      displayName: displayName.trim() || (isAdmin ? 'Administrador' : 'Cliente'),
      role: isAdmin ? 'admin' : 'client',
      createdAt: new Date().toISOString(),
    });
    return result.user;
  } catch (error: any) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
}

export async function sendPasswordReset(email: string): Promise<void> {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error: any) {
    console.error('Error al enviar correo de recuperación:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error: any) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
}

export { onAuthStateChanged, reauthenticateWithPopup, reauthenticateWithCredential, EmailAuthProvider, deleteUser };
export type { FirebaseUser };


