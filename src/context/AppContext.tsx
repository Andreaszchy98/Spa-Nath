import { doc, runTransaction, collection, setDoc, getDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_BANNERS,
  INITIAL_BUSINESS_PROFILE,
  INITIAL_INGREDIENTS,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_PROVIDERS,
  INITIAL_SERVICES,
  INITIAL_WEEKLY_SCHEDULE,
} from '../data/initialData';
import {
  Appointment,
  AppointmentStatus,
  BusinessProfile,
  CartItem,
  CurrentUser,
  DaySchedule,
  Ingredient,
  Order,
  OrderStatus,
  Product,
  ProductRecipeItem,
  PromoBanner,
  Provider,
  ScheduleException,
  Service,
  ShippingDetails,
  ThemeConfig,
  ThemeId,
  UserRole,
  AppNotification,
  NotificationType,
  PushPreferences,
  BusySlot,
} from '../types';
import { getTheme, THEMES } from '../utils/themes';
import {
  firebaseInfo,
  subscribeProducts,
  subscribeIngredients,
  subscribeOrders,
  subscribeBanners,
  subscribeBusinessProfile,
  subscribeProviders,
  subscribeWeeklySchedule,
  subscribeExceptions,
  subscribeAppointments,
  subscribeServices,
  subscribeNotifications,
  subscribeBusySlots,
  upsertBusySlotFirestore,
  deleteBusySlotFirestore,
  upsertProductFirestore,
  deleteProductFirestore,
  upsertIngredientFirestore,
  deleteIngredientFirestore,
  saveOrderFirestore,
  updateOrderStatusFirestore,
  deleteOrderFirestore,
  upsertBannerFirestore,
  deleteBannerFirestore,
  saveBusinessProfileFirestore,
  upsertProviderFirestore,
  deleteProviderFirestore,
  saveDayScheduleFirestore,
  upsertExceptionFirestore,
  deleteExceptionFirestore,
  saveAppointmentFirestore,
  updateAppointmentStatusFirestore,
  deleteAppointmentFirestore,
  upsertServiceFirestore,
  deleteServiceFirestore,
  upsertNotificationFirestore,
  markNotificationReadFirestore,
  deleteNotificationFirestore,
  clearAllNotificationsFirestore,
  pushAllToFirestore,
  auth,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  sendPasswordReset,
  logoutUser,
  getUserProfileFirestore,
  upsertUserProfileFirestore,
  onAuthStateChanged,
  isUserAdminEmail,
  ADMIN_EMAILS,
  cleanObject,
  reauthenticateWithPopup,
  reauthenticateWithCredential,
  EmailAuthProvider,
  deleteUser,
  googleAuthProvider,
} from '../firebase';
import {
  getPushPermission,
  requestPushPermission as requestPushPermissionService,
  triggerDevicePushNotification,
  loadPushPreferences,
  savePushPreferences,
  registerPushServiceWorker,
} from '../services/pushNotificationService';

interface AppContextType {
  // Theme
  theme: ThemeConfig;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;

  // Cloud / Firestore
  firebaseSyncStatus: 'synced' | 'syncing' | 'offline' | 'error';
  firebaseInfo: typeof firebaseInfo;
  syncAllToFirestore: () => Promise<void>;

  // Business Profile
  businessProfile: BusinessProfile;
  updateBusinessProfile: (partial: Partial<BusinessProfile>) => void;
  resetToDefaultData: () => void;
  loadBusinessPreset: (presetType: 'cafe' | 'grill' | 'boutique') => void;

  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => string;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  setProductRecipe: (productId: string, recipe: ProductRecipeItem[]) => void;
  clearProductRecipe: (productId: string) => void;
  clearAllRecipes: () => void;

  // Central Ingredients / Insumos (Many-to-Many Architecture)
  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id'>) => string;
  updateIngredient: (id: string, updates: Partial<Ingredient>) => void;
  deleteIngredient: (id: string) => void;
  adjustIngredientStock: (id: string, delta: number) => void;

  // Banners
  banners: PromoBanner[];
  addBanner: (banner: Omit<PromoBanner, 'id'>) => string;
  updateBanner: (id: string, updates: Partial<PromoBanner>) => void;
  deleteBanner: (id: string) => void;
  toggleBannerActive: (id: string) => void;

  // Orders
  orders: Order[];
  createOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
  markOrderPaymentReceived: (orderId: string, received: boolean) => void;
  deleteOrder: (orderId: string) => void;
  clearAllOrders: () => void;

  // Auth / Role / Users
  currentUser: CurrentUser;
  isAdminUser: boolean;
  switchRole: (role: UserRole) => void;
  updateCurrentUser: (updates: Partial<CurrentUser>) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  registerWithEmail: (email: string, password: string, name: string) => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  authLoading: boolean;
  authError: string | null;
  clearAuthError: () => void;

  // Shopping Cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  updateCartItemQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Product Customizer Modal
  modalProductId: string | null;
  openProductModal: (productId: string) => void;
  closeProductModal: () => void;

  // Cart Drawer
  isCartDrawerOpen: boolean;
  setIsCartDrawerOpen: (open: boolean) => void;

  // Notification Drawer
  isNotificationDrawerOpen: boolean;
  setIsNotificationDrawerOpen: (open: boolean) => void;

  // Auth / Role Selector Modal
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Privacy Policy Modal
  isPrivacyModalOpen: boolean;
  setIsPrivacyModalOpen: (open: boolean) => void;

  // Account deletion
  deleteMyAccount: (password?: string) => Promise<void>;

  // Active Admin Tab
  adminTab: 'resumen' | 'pedidos' | 'logistica' | 'inventario' | 'servicios' | 'catalogo' | 'banners' | 'configuracion' | 'agenda';
  setAdminTab: (tab: 'resumen' | 'pedidos' | 'logistica' | 'inventario' | 'servicios' | 'catalogo' | 'banners' | 'configuracion' | 'agenda') => void;

  // Active Customer Tab
  customerTab: 'catalogo' | 'pedidos' | 'perfil';
  setCustomerTab: (tab: 'catalogo' | 'pedidos' | 'perfil') => void;

  // Logistics & Shipping
  updateOrderShipping: (
    orderId: string,
    shippingUpdates: Partial<ShippingDetails>,
    newStatus?: OrderStatus
  ) => Promise<void>;

  // Services (Spa Catalog - No Stock, No SKU)
  services: Service[];
  addService: (service: Omit<Service, 'id'>) => string;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  calculateServiceTotalDuration: (
    service: Service,
    modality?: 'local' | 'domicilio'
  ) => {
    baseMinutes: number;
    bufferMinutes: number;
    travelMinutes: number;
    totalMinutes: number;
  };

  // Providers
  providers: Provider[];
  addProvider: (provider: Omit<Provider, 'id'>) => string;
  updateProvider: (id: string, updates: Partial<Provider>) => void;
  deleteProvider: (id: string) => void;

  // Weekly Schedule
  weeklySchedule: DaySchedule[];
  updateDaySchedule: (daySchedule: DaySchedule) => void;
  updateProviderWeeklySchedule: (providerId: string, newSchedule: DaySchedule[]) => void;

  // Exceptions
  exceptions: ScheduleException[];
  addException: (exc: Omit<ScheduleException, 'id'>) => string;
  deleteException: (id: string) => void;

  // Appointments
  appointments: Appointment[];
  createAppointment: (data: {
    serviceId: string;
    providerId: string;
    customerName: string;
    customerPhone: string;
    customerNotes?: string;
    customerAddress?: string;
    modality?: 'local' | 'domicilio';
    dateStr: string;
    timeStr: string;
    privacyAcceptedAt?: string;
    healthConsent?: boolean;
  }) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;
  cancelAppointment: (id: string) => Promise<void>;
  getAvailableSlotsForDate: (
    serviceId: string,
    dateStr: string,
    providerId: string,
    modality?: 'local' | 'domicilio'
  ) => string[];

  // Push Notifications & Notification Center
  notifications: AppNotification[];
  unreadNotificationsCount: number;
  pushPermission: NotificationPermission;
  pushPreferences: PushPreferences;
  requestPushPermission: () => Promise<NotificationPermission>;
  updatePushPreferences: (prefs: Partial<PushPreferences>) => void;
  sendPushNotification: (data: {
    title: string;
    message: string;
    type: NotificationType;
    linkTab?: 'agenda' | 'pedidos' | 'inventario' | 'servicios' | 'catalogo' | 'logistica';
    userId?: string;
    audience?: 'admin' | 'user';
    recipientUid?: string | null;
    localOnly?: boolean;
  }) => Promise<void>;
  notifyAdmin: (data: {
    title: string;
    message: string;
    type: NotificationType;
    linkTab?: 'agenda' | 'pedidos' | 'inventario' | 'servicios' | 'catalogo' | 'logistica';
  }) => Promise<void>;
  notifyCustomer: (
    uid: string | null | undefined,
    data: {
      title: string;
      message: string;
      type: NotificationType;
      linkTab?: 'agenda' | 'pedidos' | 'inventario' | 'servicios' | 'catalogo' | 'logistica';
    }
  ) => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  sendTestPushNotification: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'bl_theme_id',
  PROFILE: 'bl_business_profile',
  PRODUCTS: 'bl_products_list',
  INGREDIENTS: 'bl_ingredients_central_stock',
  BANNERS: 'bl_banners_list',
  ORDERS: 'bl_orders_list_v2', // Updated key to ensure clean order state
  ROLE: 'bl_user_role',
  CART: 'bl_cart_items',
  RECIPES_CLEARED: 'bl_recipes_cleared_by_admin',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme state
  const [themeId, setThemeIdState] = useState<ThemeId>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME) as ThemeId;
    return saved && THEMES[saved] ? saved : 'rosa';
  });

  const theme = getTheme(themeId);

  // Firestore Sync State
  const [firebaseSyncStatus, setFirebaseSyncStatus] = useState<'synced' | 'syncing' | 'offline' | 'error'>('synced');
  const isCloudLoadedRef = useRef(false);

  const setThemeId = (newId: ThemeId) => {
    setThemeIdState(newId);
    localStorage.setItem(STORAGE_KEYS.THEME, newId);
    setBusinessProfileState((prev) => {
      const updated = { ...prev, currentTheme: newId };
      saveBusinessProfileFirestore(updated).catch(() => {});
      return updated;
    });
  };

  // Business Profile
  const [businessProfile, setBusinessProfileState] = useState<BusinessProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          // If the cached profile has the seeded 'Valhalla' title, purge it so it never flashes
          if (parsed.name && parsed.name.toLowerCase().includes('valhalla')) {
            localStorage.removeItem(STORAGE_KEYS.PROFILE);
            return INITIAL_BUSINESS_PROFILE;
          }
          return { ...INITIAL_BUSINESS_PROFILE, ...parsed };
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_BUSINESS_PROFILE;
  });

  const updateBusinessProfile = (partial: Partial<BusinessProfile>) => {
    setBusinessProfileState((prev) => {
      const updated = { ...prev, ...partial };
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
      saveBusinessProfileFirestore(updated).catch((err) => console.warn('Firestore profile sync error:', err));
      return updated;
    });
  };

  // Central Ingredients / Insumos (Many-to-Many Architecture)
  const [ingredients, setIngredients] = useState<Ingredient[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INGREDIENTS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INGREDIENTS, JSON.stringify(ingredients));
  }, [ingredients]);

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>): string => {
    const id = `ing-${Date.now()}`;
    const newIng: Ingredient = { ...ingredient, id };
    setIngredients((prev) => [newIng, ...prev]);
    upsertIngredientFirestore(newIng).catch((err) => console.warn('Firestore addIngredient error:', err));
    return id;
  };

  const updateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients((prev) => {
      const updated = prev.map((ing) => (ing.id === id ? { ...ing, ...updates } : ing));
      const target = updated.find((i) => i.id === id);
      if (target) {
        upsertIngredientFirestore(target).catch((err) => console.warn('Firestore updateIngredient error:', err));
      }
      return updated;
    });
  };

  const deleteIngredient = (id: string) => {
    setIngredients((prev) => prev.filter((ing) => ing.id !== id));
    deleteIngredientFirestore(id).catch((err) => console.warn('Firestore deleteIngredient error:', err));
    // Also remove reference from any product recipe and options
    setProducts((prev) =>
      prev.map((p) => ({
        ...p,
        recipe: p.recipe ? p.recipe.filter((r) => r.ingredientId !== id) : [],
        optionGroups: p.optionGroups
          ? p.optionGroups.map((g) => ({
              ...g,
              options: g.options.map((opt) =>
                opt.extraIngredientId === id
                  ? { ...opt, extraIngredientId: undefined, extraIngredientQuantity: undefined }
                  : opt
              ),
            }))
          : p.optionGroups,
      }))
    );
  };

  const adjustIngredientStock = (id: string, delta: number) => {
    setIngredients((prev) => {
      const updated = prev.map((ing) => {
        if (ing.id === id) {
          return { ...ing, stock: Math.max(0, ing.stock + delta) };
        }
        return ing;
      });
      const target = updated.find((i) => i.id === id);
      if (target) {
        upsertIngredientFirestore(target).catch((err) => console.warn('Firestore adjustIngredientStock error:', err));
      }
      return updated;
    });
  };

  // Products
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (p: Product) => p && !p.id.startsWith('prod-burger') && !p.id.startsWith('prod-latte') && !p.id.startsWith('prod-beans')
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  const addProduct = (product: Omit<Product, 'id'>): string => {
    const id = `prod-${Date.now()}`;
    const newProduct: Product = { ...product, id };
    setProducts((prev) => [newProduct, ...prev]);
    upsertProductFirestore(newProduct).catch((err) => console.warn('Firestore addProduct error:', err));
    return id;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...updates } : p));
      const target = updated.find((p) => p.id === id);
      if (target) {
        upsertProductFirestore(target).catch((err) => console.warn('Firestore updateProduct error:', err));
      }
      return updated;
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    deleteProductFirestore(id).catch((err) => console.warn('Firestore deleteProduct error:', err));
  };

  const adjustStock = (id: string, delta: number) => {
    setProducts((prev) => {
      const updated = prev.map((p) => {
        if (p.id === id) {
          const newStock = Math.max(0, p.stock + delta);
          return { ...p, stock: newStock };
        }
        return p;
      });
      const target = updated.find((p) => p.id === id);
      if (target) {
        upsertProductFirestore(target).catch((err) => console.warn('Firestore adjustStock error:', err));
      }
      return updated;
    });
  };

  const setProductRecipe = (productId: string, recipe: ProductRecipeItem[]) => {
    setProducts((prev) => {
      const updated = prev.map((p) => (p.id === productId ? { ...p, recipe } : p));
      const target = updated.find((p) => p.id === productId);
      if (target) {
        upsertProductFirestore(target).catch((err) => console.warn('Firestore setProductRecipe error:', err));
      }
      return updated;
    });
  };

  const clearProductRecipe = (productId: string) => {
    setProductRecipe(productId, []);
  };

  const clearAllRecipes = () => {
    localStorage.setItem(STORAGE_KEYS.RECIPES_CLEARED, 'true');
    setProducts((prev) => {
      const updated = prev.map((p) => ({
        ...p,
        recipe: [],
      }));
      updated.forEach((p) => {
        upsertProductFirestore(p).catch(() => {});
      });
      return updated;
    });
  };

  // Banners
  const [banners, setBanners] = useState<PromoBanner[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter(
            (b: PromoBanner) => b && !b.id.startsWith('ban-1') && !b.id.startsWith('ban-2') && !b.id.startsWith('ban-3')
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners]);

  const addBanner = (banner: Omit<PromoBanner, 'id'>): string => {
    const id = `ban-${Date.now()}`;
    const newBanner: PromoBanner = { ...banner, id };
    setBanners((prev) => [newBanner, ...prev]);
    upsertBannerFirestore(newBanner).catch((err) => console.warn('Firestore addBanner error:', err));
    return id;
  };

  const updateBanner = (id: string, updates: Partial<PromoBanner>) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, ...updates } : b));
      const target = updated.find((b) => b.id === id);
      if (target) {
        upsertBannerFirestore(target).catch((err) => console.warn('Firestore updateBanner error:', err));
      }
      return updated;
    });
  };

  const deleteBanner = (id: string) => {
    setBanners((prev) => prev.filter((b) => b.id !== id));
    deleteBannerFirestore(id).catch((err) => console.warn('Firestore deleteBanner error:', err));
  };

  const toggleBannerActive = (id: string) => {
    setBanners((prev) => {
      const updated = prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b));
      const target = updated.find((b) => b.id === id);
      if (target) {
        upsertBannerFirestore(target).catch((err) => console.warn('Firestore toggleBannerActive error:', err));
      }
      return updated;
    });
  };

  // Orders: Cleaned empty registry
  const [orders, setOrders] = useState<Order[]>(() => {
    // Clear old legacy orders
    localStorage.removeItem('bl_orders_list');
    const saved = localStorage.getItem(STORAGE_KEYS.ORDERS);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ORDERS; // Empty array
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }, [orders]);

  const createOrder = (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>): Order => {
    if (!currentUser.isLoggedIn) {
      setIsAuthModalOpen(true);
      throw new Error('Debes iniciar sesión para realizar pedidos.');
    }
    const orderNumber = `PED-${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber,
      customerUid: currentUser.uid || null,
      orderType: orderData.orderType || 'recoger',
      customerAddress: orderData.customerAddress || currentUser.address || '',
      createdAt: new Date().toISOString(),
    };

    // 1. Deduct direct finished product stock
    orderData.items.forEach((item) => {
      adjustStock(item.productId, -item.quantity);
    });

    // 2. Relación Many-to-Many: Descontar stock central de ingredientes según la receta
    const ingredientDeductions: Record<string, number> = {};

    orderData.items.forEach((cartItem) => {
      const prod = products.find((p) => p.id === cartItem.productId);
      if (!prod) return;

      // A) Ingredientes de la receta base del producto
      if (prod.recipe && prod.recipe.length > 0) {
        prod.recipe.forEach((recipeItem) => {
          const totalReq = recipeItem.quantity * cartItem.quantity;
          ingredientDeductions[recipeItem.ingredientId] =
            (ingredientDeductions[recipeItem.ingredientId] || 0) + totalReq;
        });
      }

      // B) Ingredientes adicionales vinculados a opciones seleccionadas
      if (cartItem.selectedOptions && cartItem.selectedOptions.length > 0) {
        cartItem.selectedOptions.forEach((selectedOpt) => {
          for (const group of prod.optionGroups || []) {
            const opt = group.options.find((o) => o.id === selectedOpt.optionId);
            if (opt?.extraIngredientId) {
              const qty = (opt.extraIngredientQuantity && opt.extraIngredientQuantity > 0) ? opt.extraIngredientQuantity : 1;
              const extraTotal = qty * cartItem.quantity;
              ingredientDeductions[opt.extraIngredientId] =
                (ingredientDeductions[opt.extraIngredientId] || 0) + extraTotal;
            }
          }
        });
      }
    });

    // Aplicar los descuentos al catálogo central de ingredientes
    if (Object.keys(ingredientDeductions).length > 0) {
      setIngredients((prev) =>
        prev.map((ing) => {
          const toDeduct = ingredientDeductions[ing.id];
          if (toDeduct && toDeduct > 0) {
            const updatedStock = Math.max(0, ing.stock - toDeduct);
            const updated = { ...ing, stock: updatedStock };
            upsertIngredientFirestore(updated).catch(() => {});
            return updated;
          }
          return ing;
        })
      );
    }

    setOrders((prev) => [newOrder, ...prev]);
    saveOrderFirestore(newOrder).catch((err) => console.warn('Firestore saveOrder error:', err));

    // Send push notification for new order: notifyAdmin + notifyCustomer
    notifyAdmin({
      title: '¡Nuevo Pedido Recibido!',
      message: `Orden #${orderNumber} por ${businessProfile.currency}${newOrder.total.toFixed(2)} (${newOrder.customerName})`,
      type: 'order_created',
      linkTab: 'pedidos',
    });

    if (currentUser.uid) {
      notifyCustomer(currentUser.uid, {
        title: 'Pedido recibido',
        message: `Tu orden #${orderNumber} ha sido recibida y está siendo procesada.`,
        type: 'order_created',
        linkTab: 'pedidos',
      });
    }

    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const target = orders.find((o) => o.id === orderId);
    if (target && target.status !== 'cancelado' && status === 'cancelado') {
      // 1. Restore product stock
      target.items.forEach((item) => {
        adjustStock(item.productId, item.quantity);
      });

      // 2. Restore central ingredient stock
      const ingredientRestorations: Record<string, number> = {};
      target.items.forEach((cartItem) => {
        const prod = products.find((p) => p.id === cartItem.productId);
        if (!prod) return;

        if (prod.recipe && prod.recipe.length > 0) {
          prod.recipe.forEach((recipeItem) => {
            const totalReq = recipeItem.quantity * cartItem.quantity;
            ingredientRestorations[recipeItem.ingredientId] =
              (ingredientRestorations[recipeItem.ingredientId] || 0) + totalReq;
          });
        }

        if (cartItem.selectedOptions && cartItem.selectedOptions.length > 0) {
          cartItem.selectedOptions.forEach((selectedOpt) => {
            for (const group of prod.optionGroups || []) {
              const opt = group.options.find((o) => o.id === selectedOpt.optionId);
              if (opt?.extraIngredientId) {
                const qty = (opt.extraIngredientQuantity && opt.extraIngredientQuantity > 0) ? opt.extraIngredientQuantity : 1;
                const extraTotal = qty * cartItem.quantity;
                ingredientRestorations[opt.extraIngredientId] =
                  (ingredientRestorations[opt.extraIngredientId] || 0) + extraTotal;
              }
            }
          });
        }
      });

      if (Object.keys(ingredientRestorations).length > 0) {
        setIngredients((prev) =>
          prev.map((ing) => {
            const toRestore = ingredientRestorations[ing.id];
            if (toRestore && toRestore > 0) {
              const updatedStock = ing.stock + toRestore;
              const updated = { ...ing, stock: updatedStock };
              upsertIngredientFirestore(updated).catch(() => {});
              return updated;
            }
            return ing;
          })
        );
      }
    }

    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status } : o)));
    updateOrderStatusFirestore(orderId, status).catch((err) => console.warn('Firestore updateOrderStatus error:', err));
    if (target) {
      const isActingAsAdmin = isAdminUser || currentUser.role === 'admin';
      if (isActingAsAdmin) {
        if (target.customerUid) {
          notifyCustomer(target.customerUid, {
            title: status === 'cancelado' ? 'Pedido Cancelado' : 'Pedido Actualizado',
            message: status === 'cancelado'
              ? `Tu orden #${target.orderNumber} ha sido cancelada.`
              : `Tu orden #${target.orderNumber} cambió a "${status}".`,
            type: 'order_updated',
            linkTab: 'pedidos',
          });
        }
      } else {
        notifyAdmin({
          title: status === 'cancelado' ? 'Pedido Cancelado por Cliente' : 'Pedido Actualizado',
          message: status === 'cancelado'
            ? `La orden #${target.orderNumber} de ${target.customerName} ha sido cancelada.`
            : `La orden #${target.orderNumber} cambió a "${status}".`,
          type: 'order_updated',
          linkTab: 'pedidos',
        });
      }
    }
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    updateAppointmentStatusFirestore(id, status).catch((err) => console.warn('Firestore updateAppointmentStatus error:', err));
    if (status === 'cancelada') {
      deleteBusySlotFirestore(id).catch((err) => console.warn('Firestore deleteBusySlot error:', err));
    }
    const target = appointments.find((a) => a.id === id);
    if (target) {
      if (status === 'confirmada' || status === 'completada') {
        if (target.customerUid) {
          notifyCustomer(target.customerUid, {
            title: status === 'confirmada' ? 'Cita Confirmada' : 'Cita Completada',
            message: status === 'confirmada'
              ? `La cita #${target.appointmentNumber} de ${target.customerName} ha sido confirmada.`
              : `La cita #${target.appointmentNumber} de ${target.customerName} fue marcada como completada.`,
            type: 'appointment_updated',
            linkTab: 'agenda',
          });
        }
      }
    }
  };

  const deleteAppointment = async (id: string) => {
    setAppointments((prev) => prev.filter((a) => a.id !== id));
    await deleteAppointmentFirestore(id).catch((err) => console.warn('Firestore deleteAppointment error:', err));
    await deleteBusySlotFirestore(id).catch((err) => console.warn('Firestore deleteBusySlot error:', err));
  };

  const markOrderPaymentReceived = (orderId: string, received: boolean) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, paymentReceived: received } : o)));
    const target = orders.find((o) => o.id === orderId);
    if (target) {
      updateOrderStatusFirestore(orderId, target.status, received).catch((err) => console.warn('Firestore markOrder error:', err));
    }
  };

  const deleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const updated = prev.filter((o) => o.id !== orderId);
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(updated));
      return updated;
    });
    deleteOrderFirestore(orderId).catch((err) => console.warn('Firestore deleteOrder error:', err));
  };

  const clearAllOrders = () => {
    setOrders([]);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
  };

  // --- NOTIFICACIONES & ALERTAS PUSH ---
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('bl_notifications_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {}
    }
    return [];
  });

  const [pushPermission, setPushPermission] = useState<NotificationPermission>(() => {
    return getPushPermission();
  });

  const [pushPreferences, setPushPreferencesState] = useState<PushPreferences>(() => {
    return loadPushPreferences();
  });

  const lastSeenNotifIdsRef = useRef<Set<string>>(new Set());
  const recentlyPushedIdsRef = useRef<Set<string>>(new Set());

  const triggerPushOnce = (notif: Pick<AppNotification, 'id' | 'title' | 'message' | 'type' | 'linkTab'>) => {
    if (recentlyPushedIdsRef.current.has(notif.id)) {
      return;
    }
    recentlyPushedIdsRef.current.add(notif.id);
    setTimeout(() => {
      recentlyPushedIdsRef.current.delete(notif.id);
    }, 15000);
    triggerDevicePushNotification(notif, pushPreferences);
  };

  useEffect(() => {
    localStorage.setItem('bl_notifications_list', JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    // Register Service Worker for background push on boot
    registerPushServiceWorker().catch(() => {});
  }, []);

  const requestPushPermission = async (): Promise<NotificationPermission> => {
    const perm = await requestPushPermissionService();
    setPushPermission(perm);
    return perm;
  };

  const updatePushPreferences = (updates: Partial<PushPreferences>) => {
    setPushPreferencesState((prev) => {
      const next = { ...prev, ...updates };
      savePushPreferences(next);
      return next;
    });
  };

  const sendPushNotification = async (data: {
    title: string;
    message: string;
    type: NotificationType;
    linkTab?: 'agenda' | 'pedidos' | 'inventario' | 'servicios' | 'catalogo' | 'logistica';
    userId?: string;
    audience?: 'admin' | 'user';
    recipientUid?: string | null;
    localOnly?: boolean;
  }) => {
    const audience = data.audience || 'admin';
    const recipientUid = data.recipientUid ?? null;

    // No guarda una notificación 'user' sin recipientUid
    if (audience === 'user' && !recipientUid && !data.localOnly) {
      return;
    }

    const newNotif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: data.title,
      message: data.message,
      type: data.type,
      read: false,
      linkTab: data.linkTab,
      userId: data.userId || 'all',
      audience,
      recipientUid,
      createdAt: new Date().toISOString(),
    };

    // Solo muestra el aviso en el dispositivo si corresponde a la sesión actual (o si localOnly es true)
    const matchesCurrentSession =
      Boolean(data.localOnly) ||
      (audience === 'admin' && (isAdminUser || currentUser.role === 'admin')) ||
      (audience === 'user' && recipientUid && (currentUser.uid === recipientUid || authUid === recipientUid));

    if (matchesCurrentSession) {
      triggerPushOnce(newNotif);
      setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
      lastSeenNotifIdsRef.current.add(newNotif.id);
    }

    // Siempre guarda en Firestore salvo localOnly
    if (!data.localOnly) {
      upsertNotificationFirestore(newNotif).catch((err) => {
        console.warn('Firestore upsertNotification error:', err);
      });
    }
  };

  const notifyAdmin = async (data: {
    title: string;
    message: string;
    type: NotificationType;
    linkTab?: 'agenda' | 'pedidos' | 'inventario' | 'servicios' | 'catalogo' | 'logistica';
  }) => {
    return sendPushNotification({
      ...data,
      audience: 'admin',
      recipientUid: null,
    });
  };

  const notifyCustomer = async (
    uid: string | null | undefined,
    data: {
      title: string;
      message: string;
      type: NotificationType;
      linkTab?: 'agenda' | 'pedidos' | 'inventario' | 'servicios' | 'catalogo' | 'logistica';
    }
  ) => {
    if (!uid) return;
    return sendPushNotification({
      ...data,
      audience: 'user',
      recipientUid: uid,
    });
  };

  const updateOrderShipping = async (
    orderId: string,
    shippingUpdates: Partial<ShippingDetails>,
    newStatus?: OrderStatus
  ) => {
    const target = orders.find((o) => o.id === orderId);
    if (!target) return;

    const mergedShipping: ShippingDetails = {
      ...(target.shippingDetails || {}),
      ...shippingUpdates,
    };

    const updatedOrder: Order = {
      ...target,
      shippingDetails: mergedShipping,
      ...(newStatus ? { status: newStatus } : {}),
    };

    setOrders((prev) => prev.map((o) => (o.id === orderId ? updatedOrder : o)));
    await saveOrderFirestore(updatedOrder).catch((err) => console.warn('saveOrderFirestore error:', err));

    if (newStatus && newStatus !== target.status) {
      updateOrderStatus(orderId, newStatus);
    }
  };

  const markNotificationAsRead = async (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    markNotificationReadFirestore(id).catch(() => {});
  };

  const markAllNotificationsAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    notifications.forEach((n) => {
      if (!n.read) markNotificationReadFirestore(n.id).catch(() => {});
    });
  };

  const deleteNotification = async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    deleteNotificationFirestore(id).catch(() => {});
  };

  const clearAllNotifications = async () => {
    const ids = notifications.map((n) => n.id);
    setNotifications([]);
    clearAllNotificationsFirestore(ids).catch(() => {});
  };

  const sendTestPushNotification = async () => {
    let perm = getPushPermission();
    if (perm !== 'granted') {
      perm = await requestPushPermission();
      setPushPermission(perm);
    }
    await sendPushNotification({
      title: '🔔 Alerta de Prueba - Spa Nath',
      message: '¡Notificaciones push activadas correctamente! Recibirás avisos instantáneos de citas y pedidos en pantalla.',
      type: 'system_alert',
      linkTab: 'agenda',
      localOnly: true,
      audience: isAdminUser ? 'admin' : 'user',
      recipientUid: currentUser.uid || null,
    });
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  // --- MÓDULO DE SERVICIOS DE SPA (Separados de Productos, sin Stock ni SKU) ---
  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('bl_services_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_SERVICES;
  });

  useEffect(() => {
    localStorage.setItem('bl_services_list', JSON.stringify(services));
  }, [services]);

  const addService = (serviceData: Omit<Service, 'id'>): string => {
    const id = `serv-${Date.now()}`;
    const newService: Service = { ...serviceData, id };
    setServices((prev) => [newService, ...prev]);
    upsertServiceFirestore(newService).catch((err) => console.warn('Firestore addService error:', err));
    return id;
  };

  const updateService = (id: string, updates: Partial<Service>) => {
    setServices((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...updates } : s));
      const target = updated.find((s) => s.id === id);
      if (target) {
        upsertServiceFirestore(target).catch((err) => console.warn('Firestore updateService error:', err));
      }
      return updated;
    });
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
    deleteServiceFirestore(id).catch((err) => console.warn('Firestore deleteService error:', err));
  };

  // Centralized total duration calculation in agenda (duración + pausa + traslado según modalidad y ida/vuelta)
  const calculateServiceTotalDuration = (
    service: Service,
    modality: 'local' | 'domicilio' = 'local'
  ): {
    baseMinutes: number;
    bufferMinutes: number;
    travelMinutes: number;
    totalMinutes: number;
  } => {
    const baseMinutes = Math.max(10, service.durationMinutes || 60);
    const bufferMinutes = Math.max(0, service.bufferMinutes || 0);
    let travelMinutes = 0;
    if (modality === 'domicilio') {
      const legMinutes = Math.max(0, service.travelTimeMinutes || 0);
      travelMinutes = service.roundTripTravel ? legMinutes * 2 : legMinutes;
    }
    const totalMinutes = baseMinutes + bufferMinutes + travelMinutes;
    return {
      baseMinutes,
      bufferMinutes,
      travelMinutes,
      totalMinutes,
    };
  };

  // --- MÓDULO DE AGENDAMIENTO ---
  const [providers, setProviders] = useState<Provider[]>(() => {
    const saved = localStorage.getItem('bl_providers_list');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_PROVIDERS;
  });

  useEffect(() => {
    localStorage.setItem('bl_providers_list', JSON.stringify(providers));
  }, [providers]);

  const addProvider = (provider: Omit<Provider, 'id'>): string => {
    const id = `prov-${Date.now()}`;
    const newProv: Provider = { ...provider, id };
    setProviders(prev => [newProv, ...prev]);
    upsertProviderFirestore(newProv).catch(() => {});
    return id;
  };

  const updateProvider = (id: string, updates: Partial<Provider>) => {
    setProviders(prev => {
      const updated = prev.map(p => p.id === id ? { ...p, ...updates } : p);
      const target = updated.find(p => p.id === id);
      if (target) upsertProviderFirestore(target).catch(() => {});
      return updated;
    });
  };

  const deleteProvider = (id: string) => {
    setProviders(prev => prev.filter(p => p.id !== id));
    deleteProviderFirestore(id).catch(() => {});
  };

  const [weeklySchedule, setWeeklySchedule] = useState<DaySchedule[]>(() => {
    const saved = localStorage.getItem('bl_weekly_schedule');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return INITIAL_WEEKLY_SCHEDULE;
  });

  useEffect(() => {
    localStorage.setItem('bl_weekly_schedule', JSON.stringify(weeklySchedule));
  }, [weeklySchedule]);

  const updateDaySchedule = (daySchedule: DaySchedule) => {
    setWeeklySchedule(prev => {
      const updated = prev.map(s => s.dayOfWeek === daySchedule.dayOfWeek ? daySchedule : s);
      saveDayScheduleFirestore(daySchedule).catch(() => {});
      return updated;
    });
  };

  const updateProviderWeeklySchedule = (providerId: string, newSchedule: DaySchedule[]) => {
    setProviders(prev => {
      const updated = prev.map(p => p.id === providerId ? { ...p, weeklySchedule: newSchedule } : p);
      const target = updated.find(p => p.id === providerId);
      if (target) upsertProviderFirestore(target).catch(() => {});
      return updated;
    });
  };

  const [exceptions, setExceptions] = useState<ScheduleException[]>(() => {
    const saved = localStorage.getItem('bl_schedule_exceptions');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('bl_schedule_exceptions', JSON.stringify(exceptions));
  }, [exceptions]);

  const addException = (exc: Omit<ScheduleException, 'id'>): string => {
    const id = `exc-${Date.now()}`;
    const newExc: ScheduleException = { ...exc, id };
    setExceptions(prev => [newExc, ...prev]);
    upsertExceptionFirestore(newExc).catch(() => {});
    return id;
  };

  const deleteException = (id: string) => {
    setExceptions(prev => prev.filter(e => e.id !== id));
    deleteExceptionFirestore(id).catch(() => {});
  };

  const [busySlots, setBusySlots] = useState<BusySlot[]>([]);

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('bl_appointments_list');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (e) {}
    }
    return INITIAL_APPOINTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('bl_appointments_list', JSON.stringify(appointments));
  }, [appointments]);

  const createAppointment = async (data: {
    serviceId: string;
    providerId: string;
    customerName: string;
    customerPhone: string;
    customerNotes?: string;
    customerAddress?: string;
    modality?: 'local' | 'domicilio';
    dateStr: string;
    timeStr: string;
    privacyAcceptedAt?: string;
    healthConsent?: boolean;
  }): Promise<Appointment> => {
    if (!currentUser.isLoggedIn) {
      setIsAuthModalOpen(true);
      throw new Error('Debes iniciar sesión para agendar citas.');
    }
    const foundService =
      services.find((s) => s.id === data.serviceId) ||
      products.find((p) => p.id === data.serviceId) ||
      services[0];

    const service = foundService || {
      id: data.serviceId || 'serv-limpieza-espalda',
      name: 'Limpieza profunda en espalda',
      description: 'Tratamiento en cabina',
      price: 450,
      priceType: 'fijo' as const,
      durationMinutes: 60,
      bufferMinutes: 15,
      modality: 'local' as const,
      travelSurcharge: 0,
      travelTimeMinutes: 0,
      roundTripTravel: false,
      maxHomeZoneKm: 10,
      confirmationType: 'automatica' as const,
      hybridHoursThreshold: 6,
      providerResponseDeadlineMinutes: 120,
      minCancellationHours: 4,
      minNoticeHours: 2,
      providerIds: ['prov-1'],
      available: true,
    };

    const provider = providers.find((p) => p.id === data.providerId) || providers[0] || {
      id: 'prov-1',
      name: 'Nathaly Ibarra',
      role: 'Terapeuta & Especialista Principal',
      active: true,
      weeklySchedule: INITIAL_WEEKLY_SCHEDULE,
    };

    const appointmentModality: 'local' | 'domicilio' =
      data.modality ||
      (('modality' in service && service.modality === 'domicilio') ? 'domicilio' : 'local');

    const durationInfo =
      'priceType' in service
        ? calculateServiceTotalDuration(service as Service, appointmentModality)
        : {
            baseMinutes: service.durationMinutes || 60,
            bufferMinutes: service.bufferMinutes || 0,
            travelMinutes: 0,
            totalMinutes: (service.durationMinutes || 60) + (service.bufferMinutes || 0),
          };

    const dateParts = (data.dateStr || '').split('-').map(Number);
    const timeParts = (data.timeStr || '10:00').split(':').map(Number);
    const year = dateParts[0] || new Date().getFullYear();
    const month = dateParts[1] || new Date().getMonth() + 1;
    const day = dateParts[2] || new Date().getDate();
    const hour = timeParts[0] || 10;
    const minute = timeParts[1] || 0;

    const startDate = new Date(year, month - 1, day, hour, minute, 0);
    const endDate = new Date(startDate.getTime() + durationInfo.totalMinutes * 60 * 1000);
    const now = new Date();

    let totalPrice = 0;
    const isServiceObj = 'priceType' in service;
    const servObj = isServiceObj ? (service as Service) : null;

    if (servObj && servObj.priceType === 'a_cotizar') {
      totalPrice = 0;
    } else {
      const basePrice = service.price || 0;
      const travelExtra =
        appointmentModality === 'domicilio' && servObj ? servObj.travelSurcharge || 0 : 0;
      totalPrice = basePrice + travelExtra;
    }

    let status: AppointmentStatus = 'confirmada';
    if (servObj) {
      if (servObj.priceType === 'a_cotizar' || servObj.confirmationType === 'aprobacion') {
        status = 'pendiente';
      } else if (servObj.confirmationType === 'hibrida') {
        const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60);
        const threshold = servObj.hybridHoursThreshold || 6;
        status = hoursUntilStart < threshold ? 'pendiente' : 'confirmada';
      } else {
        status = 'confirmada';
      }
    } else {
      const isSameDay =
        startDate.getFullYear() === now.getFullYear() &&
        startDate.getMonth() === now.getMonth() &&
        startDate.getDate() === now.getDate();
      status = isSameDay ? 'pendiente' : 'confirmada';
    }

    const deadlineMinutes = servObj ? servObj.providerResponseDeadlineMinutes || 120 : 120;
    const deadlineMs = Math.min(now.getTime() + deadlineMinutes * 60 * 1000, startDate.getTime());
    const providerResponseDeadlineUtc = new Date(deadlineMs).toISOString();

    const appointmentNumber = `CITA-${Date.now().toString().slice(-5)}${Math.floor(100 + Math.random() * 900)}`;

    const newAppointmentRef = doc(collection(db, 'appointments'));
    const newAppointment: Appointment = {
      id: newAppointmentRef.id,
      appointmentNumber,
      serviceId: service.id,
      serviceName: service.name,
      providerId: data.providerId || provider?.id || 'prov-1',
      providerName: provider ? provider.name : 'Personal de Spa',
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      customerNotes: data.customerNotes || '',
      customerAddress: data.customerAddress || '',
      customerUid: currentUser.uid || null,
      privacyAcceptedAt: data.privacyAcceptedAt || new Date().toISOString(),
      healthConsent: Boolean(data.healthConsent),
      modality: appointmentModality,
      travelDistanceKm: Number((appointmentModality === 'domicilio' && servObj) ? servObj.maxHomeZoneKm || 0 : 0),
      travelSurcharge: Number((appointmentModality === 'domicilio' && servObj) ? servObj.travelSurcharge || 0 : 0),
      priceType: servObj && servObj.priceType ? servObj.priceType : 'fijo',
      startTimeUtc: startDate.toISOString(),
      endTimeUtc: endDate.toISOString(),
      status,
      totalPrice: Number(totalPrice) || 0,
      confirmationType: servObj && servObj.confirmationType ? servObj.confirmationType : 'automatica',
      providerResponseDeadlineUtc,
      minCancellationHours: Number(servObj?.minCancellationHours || 4),
      createdAt: new Date().toISOString(),
    };

    const cleanedAppointment = cleanObject(newAppointment);

    try {
      await setDoc(newAppointmentRef, cleanedAppointment);
      const busySlot: BusySlot = {
        id: newAppointment.id,
        providerId: newAppointment.providerId,
        startTimeUtc: newAppointment.startTimeUtc,
        endTimeUtc: newAppointment.endTimeUtc,
        appointmentId: newAppointment.id,
      };
      await upsertBusySlotFirestore(busySlot);
    } catch (saveError) {
      console.error('Error al guardar cita en Firestore:', saveError);
      throw saveError;
    }



    setAppointments((prev) => [newAppointment, ...prev]);

    // Send push notification: notifyAdmin + notifyCustomer
    notifyAdmin({
      title: '¡Nueva Cita Agendada!',
      message: `${data.customerName} reservó ${service.name} para el ${data.dateStr} a las ${data.timeStr}`,
      type: 'appointment_created',
      linkTab: 'agenda',
    });

    if (currentUser.uid) {
      notifyCustomer(currentUser.uid, {
        title: 'Cita registrada',
        message: `Tu cita #${appointmentNumber} para ${service.name} ha sido registrada con éxito.`,
        type: 'appointment_created',
        linkTab: 'agenda',
      });
    }

    return newAppointment;
  };

  const cancelAppointment = async (id: string) => {
    const app = appointments.find((a) => a.id === id);
    if (!app) throw new Error('Cita no encontrada');

    const now = new Date();
    const startTime = new Date(app.startTimeUtc);
    const diffHours = (startTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (diffHours < (app.minCancellationHours || 4)) {
      throw new Error(`No se puede cancelar con menos de ${app.minCancellationHours || 4} horas de anticipación.`);
    }

    try {
      await runTransaction(db, async (transaction) => {
        const appRef = doc(db, 'appointments', id);
        transaction.update(appRef, { status: 'cancelada' });
      });
    } catch (txError) {
      console.warn('Error en transacción de cancelación:', txError);
      await updateAppointmentStatusFirestore(id, 'cancelada').catch(() => {});
    }

    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: 'cancelada' } : a))
    );

    await deleteBusySlotFirestore(id).catch(() => {});

    // Send push notification for cancellation: gerente vs clienta
    const isActingAsAdmin = isAdminUser || currentUser.role === 'admin';
    if (isActingAsAdmin) {
      if (app.customerUid) {
        notifyCustomer(app.customerUid, {
          title: 'Cita Cancelada',
          message: `Tu cita #${app.appointmentNumber} (${app.serviceName}) ha sido cancelada por el spa.`,
          type: 'appointment_cancelled',
          linkTab: 'agenda',
        });
      }
    } else {
      notifyAdmin({
        title: 'Cita Cancelada por Cliente',
        message: `La cita #${app.appointmentNumber} (${app.customerName}) ha sido cancelada.`,
        type: 'appointment_cancelled',
        linkTab: 'agenda',
      });
    }
  };

  const getAvailableSlotsForDate = (
    serviceId: string,
    dateStr: string,
    providerId: string,
    modality?: 'local' | 'domicilio'
  ): string[] => {
    const service = services.find(s => s.id === serviceId) || products.find(p => p.id === serviceId);
    if (!service) return [];

    const effectiveModality = modality || (('modality' in service && service.modality === 'domicilio') ? 'domicilio' : 'local');

    // Centralized total duration calculation
    const durationInfo = 'priceType' in service
      ? calculateServiceTotalDuration(service as Service, effectiveModality)
      : {
          baseMinutes: service.durationMinutes || 60,
          bufferMinutes: service.bufferMinutes || 0,
          travelMinutes: 0,
          totalMinutes: (service.durationMinutes || 60) + (service.bufferMinutes || 0),
        };

    const totalDuration = durationInfo.totalMinutes;
    const buffer = durationInfo.bufferMinutes;

    const [year, month, day] = dateStr.split('-').map(Number);
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay();

    const today = new Date();
    today.setHours(0,0,0,0);
    const maxDay = new Date();
    maxDay.setDate(maxDay.getDate() + 30);
    maxDay.setHours(23,59,59,999);
    if (targetDate < today || targetDate > maxDay) return [];

    const provider = providers.find(p => p.id === providerId);
    const providerSchedule = provider?.weeklySchedule || weeklySchedule;
    const daySched = providerSchedule.find(s => s.dayOfWeek === dayOfWeek);
    if (!daySched || !daySched.enabled) return [];

    const matchingExceptions = exceptions.filter(e => e.date === dateStr && (e.providerId === 'all' || e.providerId === providerId));
    if (matchingExceptions.some(e => e.type === 'bloqueo_total')) return [];

    let startHour = daySched.startTime;
    let endHour = daySched.endTime;

    const specialHoursException = matchingExceptions.find(e => e.type === 'horario_especial' && e.startTime && e.endTime);
    if (specialHoursException && specialHoursException.startTime && specialHoursException.endTime) {
      startHour = specialHoursException.startTime;
      endHour = specialHoursException.endTime;
    }

    const [startH, startM] = startHour.split(':').map(Number);
    const [endH, endM] = endHour.split(':').map(Number);
    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    let breakStartMin = -1;
    let breakEndMin = -1;
    if (daySched.breakStartTime && daySched.breakEndTime && !specialHoursException) {
      const [bh1, bm1] = daySched.breakStartTime.split(':').map(Number);
      const [bh2, bm2] = daySched.breakEndTime.split(':').map(Number);
      breakStartMin = bh1 * 60 + bm1;
      breakEndMin = bh2 * 60 + bm2;
    }

    const providerBusySlots = busySlots.filter(slot => {
      if (slot.providerId !== providerId) return false;
      const slotStart = new Date(slot.startTimeUtc);
      return slotStart.getFullYear() === year && slotStart.getMonth() === month - 1 && slotStart.getDate() === day;
    });

    const activeAppointments = appointments.filter(a => {
      if (a.status === 'cancelada') return false;
      if (a.providerId !== providerId) return false;
      const aStart = new Date(a.startTimeUtc);
      return aStart.getFullYear() === year && aStart.getMonth() === month - 1 && aStart.getDate() === day;
    });

    const now = new Date();
    const minNoticeHours = ('minNoticeHours' in service && typeof service.minNoticeHours === 'number') ? service.minNoticeHours : 2;
    const minNoticeTime = new Date(now.getTime() + minNoticeHours * 60 * 60 * 1000);

    const slots: string[] = [];

    while (currentMinutes + totalDuration <= endMinutes) {
      const slotStartH = Math.floor(currentMinutes / 60);
      const slotStartM = currentMinutes % 60;
      const slotEndMinutes = currentMinutes + totalDuration;

      const overlapsBreak = breakStartMin !== -1 && !(slotEndMinutes <= breakStartMin || currentMinutes >= breakEndMin);

      const overlapsBusySlot = providerBusySlots.some(slot => {
        const slotStart = new Date(slot.startTimeUtc);
        const slotEnd = new Date(slot.endTimeUtc);
        const slotStartMin = slotStart.getHours() * 60 + slotStart.getMinutes();
        const slotEndMin = slotEnd.getHours() * 60 + slotEnd.getMinutes();
        return !(slotEndMinutes <= slotStartMin || currentMinutes >= slotEndMin);
      });

      const overlapsAppointment = activeAppointments.some(a => {
        const aStart = new Date(a.startTimeUtc);
        const aEnd = new Date(a.endTimeUtc);
        const aStartMin = aStart.getHours() * 60 + aStart.getMinutes();
        const aEndMin = aEnd.getHours() * 60 + aEnd.getMinutes();
        return !(slotEndMinutes <= aStartMin || currentMinutes >= aEndMin);
      });

      const overlapsApp = overlapsBusySlot || overlapsAppointment;

      const slotDateTime = new Date(year, month - 1, day, slotStartH, slotStartM);
      const isPastMinNotice = slotDateTime >= minNoticeTime;

      if (!overlapsBreak && !overlapsApp && isPastMinNotice) {
        const formattedTime = `${String(slotStartH).padStart(2, '0')}:${String(slotStartM).padStart(2, '0')}`;
        slots.push(formattedTime);
      }

      currentMinutes += 30;
    }

    return slots;
  };

  // Synchronize All Local Data to Firestore on Demand
  const syncAllToFirestore = async () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      console.warn('Operación cancelada: No se puede sincronizar con la base de datos sin conexión.');
      setFirebaseSyncStatus('offline');
      return;
    }
    setFirebaseSyncStatus('syncing');
    try {
      await pushAllToFirestore({
        products,
        ingredients,
        banners,
        orders,
        profile: businessProfile,
        services,
      });
      setFirebaseSyncStatus('synced');
    } catch (e) {
      console.error('Error syncing all data to Firestore:', e);
      setFirebaseSyncStatus('error');
      throw e;
    }
  };

  // Real-time Firestore Listeners - Single source of truth is always Firestore
  useEffect(() => {
    let isMounted = true;

    // Detect browser online/offline status
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setFirebaseSyncStatus('offline');
    }

    const handleOnline = () => {
      if (isMounted) setFirebaseSyncStatus('synced');
    };
    const handleOffline = () => {
      if (isMounted) setFirebaseSyncStatus('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to products directly from database without any automatic seeding
    const unsubProducts = subscribeProducts(
      (remoteProducts) => {
        if (!isMounted) return;
        setProducts(remoteProducts);
        isCloudLoadedRef.current = true;
        setFirebaseSyncStatus('synced');
      },
      () => {
        if (isMounted) setFirebaseSyncStatus('offline');
      }
    );

    // Subscribe to ingredients directly from database
    const unsubIngredients = subscribeIngredients(
      (remoteIngredients) => {
        if (!isMounted) return;
        setIngredients(remoteIngredients);
        setFirebaseSyncStatus('synced');
      },
      () => {}
    );

    // Subscribe to promotional banners directly from database
    const unsubBanners = subscribeBanners(
      (remoteBanners) => {
        if (!isMounted) return;
        setBanners(remoteBanners);
        setFirebaseSyncStatus('synced');
      },
      () => {}
    );

    // Subscribe to scheduling data
    const unsubProviders = subscribeProviders((remote) => {
      if (!isMounted) return;
      if (remote.length > 0) setProviders(remote);
    }, () => {});

    const unsubSchedule = subscribeWeeklySchedule((remote) => {
      if (!isMounted) return;
      if (remote.length > 0) setWeeklySchedule(remote);
    }, () => {});

    const unsubExceptions = subscribeExceptions((remote) => {
      if (!isMounted) return;
      setExceptions(remote);
    }, () => {});

    // Subscribe to services directly from database
    const unsubServices = subscribeServices((remote) => {
      if (!isMounted) return;
      if (remote.length > 0) {
        setServices(remote);
      }
    }, () => {});

    // Subscribe to business profile
    const unsubProfile = subscribeBusinessProfile(
      (remoteProfile) => {
        if (!isMounted) return;
        if (remoteProfile && remoteProfile.name) {
          setBusinessProfileState((prev) => ({ ...prev, ...remoteProfile }));
          try {
            localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(remoteProfile));
          } catch (_) {}
          if (remoteProfile.currentTheme) {
            setThemeIdState(remoteProfile.currentTheme);
          }
          setFirebaseSyncStatus('synced');
        }
      },
      () => {}
    );

    return () => {
      isMounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubProducts();
      unsubIngredients();
      unsubBanners();
      unsubProfile();
      unsubProviders();
      unsubSchedule();
      unsubExceptions();
      unsubServices();
    };
  }, []);

  // Auth / Current User
  const [currentUser, setCurrentUser] = useState<CurrentUser>(() => {
    const savedUser = localStorage.getItem('bl_current_user_profile');
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        if (parsed && typeof parsed === 'object') {
          const emailVerified = Boolean(parsed.emailVerified);
          const isAuthorized = parsed.email && emailVerified && isUserAdminEmail(parsed.email);
          return {
            role: isAuthorized && parsed.role === 'admin' ? 'admin' : 'client',
            name: parsed.name || '',
            phone: parsed.phone || '',
            address: parsed.address || '',
            email: parsed.email,
            emailVerified,
            uid: parsed.uid,
            photoUrl: parsed.photoUrl,
            isLoggedIn: Boolean(parsed.isLoggedIn),
            authProvider: parsed.authProvider || 'guest',
          };
        }
      } catch (e) {}
    }
    return {
      role: 'client',
      name: '',
      phone: '',
      address: '',
      emailVerified: false,
      isLoggedIn: false,
      authProvider: 'guest',
    };
  });

  const [authUid, setAuthUid] = useState<string | null | undefined>(undefined);

  const isAdminUser = Boolean(
    currentUser.isLoggedIn && currentUser.emailVerified && isUserAdminEmail(currentUser.email)
  );

  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const clearAuthError = () => setAuthError(null);

  // Subscribe to real-time Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setAuthUid(fbUser ? fbUser.uid : null);
      if (fbUser) {
        try {
          const profile = await getUserProfileFirestore(fbUser.uid);
          const emailVerified = Boolean(fbUser.emailVerified);
          const isAuthorizedAdmin = emailVerified && isUserAdminEmail(fbUser.email);

          const savedRole = localStorage.getItem(STORAGE_KEYS.ROLE) as UserRole;
          const assignedRole: UserRole = isAuthorizedAdmin
            ? (savedRole === 'client' ? 'client' : 'admin')
            : 'client';

          setCurrentUser((prev) => {
            const updated: CurrentUser = {
              role: assignedRole,
              name: profile?.displayName || fbUser.displayName || prev.name || (isAuthorizedAdmin ? 'Administrador' : 'Cliente'),
              email: fbUser.email || '',
              emailVerified,
              phone: profile?.phone || fbUser.phoneNumber || prev.phone || '',
              address: profile?.address || prev.address || '',
              uid: fbUser.uid,
              photoUrl: fbUser.photoURL || profile?.photoURL || undefined,
              isLoggedIn: true,
              authProvider: fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'password',
            };
            try {
              localStorage.setItem('bl_current_user_profile', JSON.stringify(updated));
              localStorage.setItem(STORAGE_KEYS.ROLE, assignedRole);
            } catch (_) {}
            return updated;
          });
        } catch (err) {
          console.warn('Error synchronizing user profile:', err);
        }
      } else {
        setCurrentUser(() => {
          const updated: CurrentUser = {
            role: 'client',
            name: '',
            phone: '',
            address: '',
            email: undefined,
            emailVerified: false,
            uid: undefined,
            photoUrl: undefined,
            isLoggedIn: false,
            authProvider: 'guest',
          };
          try {
            localStorage.setItem('bl_current_user_profile', JSON.stringify(updated));
            localStorage.setItem(STORAGE_KEYS.ROLE, 'client');
          } catch (_) {}
          return updated;
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Scoped subscriptions for orders, appointments, and notifications
  useEffect(() => {
    // Si authUid es undefined (Auth no ha resuelto), no hace nada
    if (authUid === undefined) {
      return;
    }

    // Limpia orders, appointments y notifications al cambiar de sesión
    setOrders([]);
    setAppointments([]);
    setNotifications([]);

    // Si no hay sesión, no se suscribe a nada
    if (!authUid) {
      return;
    }

    // Si el perfil aún no sincronizó su UID con authUid, esperar
    if (currentUser.uid !== authUid) {
      return;
    }

    let isEffectMounted = true;
    const isManager = Boolean(isAdminUser && currentUser.uid === authUid);

    // 1. Pedidos: gerente sin filtro (isAll: true); clienta filtrado por authUid
    const unsubOrders = subscribeOrders(
      (remoteOrders) => {
        if (!isEffectMounted) return;
        setOrders(remoteOrders);
        setFirebaseSyncStatus('synced');
      },
      () => {},
      isManager ? undefined : authUid,
      isManager ? true : false
    );

    // 2. Citas: gerente sin filtro (isAll: true); clienta filtrado por authUid
    const unsubAppointments = subscribeAppointments(
      (remoteApps) => {
        if (!isEffectMounted) return;
        setAppointments(remoteApps);
      },
      () => {},
      isManager ? undefined : authUid,
      isManager ? true : false
    );

    // Subscribe busy_slots for all sessions (no filter)
    const unsubBusySlots = subscribeBusySlots(
      (remoteSlots) => {
        if (!isEffectMounted) return;
        setBusySlots(remoteSlots);

        if (isManager && appointments.length > 0) {
          appointments.forEach(app => {
            if (app.status !== 'cancelada') {
              const exists = remoteSlots.some(b => b.appointmentId === app.id);
              if (!exists) {
                upsertBusySlotFirestore({
                  id: app.id,
                  providerId: app.providerId,
                  startTimeUtc: app.startTimeUtc,
                  endTimeUtc: app.endTimeUtc,
                  appointmentId: app.id,
                }).catch(() => {});
              }
            }
          });
        }
      },
      () => {}
    );

    // 3. Notificaciones: gerente colección completa; clienta recipientUid == authUid
    let initialLoadDone = false;
    const unsubNotifs = subscribeNotifications(
      (remoteNotifs) => {
        if (!isEffectMounted) return;

        // La gerente conserva solo las de audience 'admin'; la clienta solo las de recipientUid igual a su uid
        const filtered = remoteNotifs.filter((n) => {
          if (isManager) {
            return n.audience === 'admin';
          }
          return n.recipientUid === authUid;
        });

        setNotifications(filtered);

        // Dispara push solo para notificaciones nuevas no leídas (no en la carga inicial)
        if (initialLoadDone) {
          filtered.forEach((n) => {
            if (!lastSeenNotifIdsRef.current.has(n.id) && !n.read) {
              triggerPushOnce(n);
            }
          });
        }

        filtered.forEach((n) => lastSeenNotifIdsRef.current.add(n.id));
        initialLoadDone = true;
      },
      () => {},
      { isAdmin: isManager, uid: authUid }
    );

    return () => {
      isEffectMounted = false;
      unsubOrders();
      unsubAppointments();
      unsubBusySlots();
      unsubNotifs();
    };
  }, [authUid, isAdminUser, currentUser.uid]);

  const switchRole = (role: UserRole) => {
    const emailVerified = Boolean(currentUser.emailVerified);
    const canAccessAdmin = currentUser.isLoggedIn && emailVerified && isUserAdminEmail(currentUser.email);
    if (role === 'admin' && !canAccessAdmin) {
      console.warn('Acceso denegado: Solo el administrador asignado puede acceder al panel gerencial.');
      return;
    }
    localStorage.setItem(STORAGE_KEYS.ROLE, role);
    setCurrentUser((prev) => {
      const updated = {
        ...prev,
        role,
      };
      try {
        localStorage.setItem('bl_current_user_profile', JSON.stringify(updated));
      } catch (_) {}
      return updated;
    });
  };

  const updateCurrentUser = (updates: Partial<CurrentUser>) => {
    setCurrentUser((prev) => {
      const updated = { ...prev, ...updates };
      try {
        localStorage.setItem('bl_current_user_profile', JSON.stringify(updated));
      } catch (_) {}
      // If user is authenticated in Firebase, sync changes to their Firestore profile
      if (prev.uid) {
        upsertUserProfileFirestore({
          uid: prev.uid,
          displayName: updated.name,
          phone: updated.phone,
          address: updated.address,
        }).catch((e) => console.warn('Sync profile Firestore error:', e));
      }
      return updated;
    });
  };

  const loginWithGoogleHandler = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Google login error:', err);
      let msg = 'No se pudo iniciar sesión con Google.';
      if (err.code === 'auth/popup-closed-by-user') {
        msg = 'La ventana de inicio de sesión fue cerrada antes de completar el acceso.';
      } else if (err.code === 'auth/popup-blocked') {
        msg = 'El navegador bloqueó la ventana emergente. Por favor permite las ventanas emergentes.';
      } else if (err.code === 'auth/cancelled-popup-request') {
        msg = 'Solicitud cancelada.';
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const loginWithEmailHandler = async (email: string, pass: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithEmail(email, pass);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email login error:', err);
      let msg = 'Error al iniciar sesión.';
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        msg = 'Correo electrónico o contraseña incorrectos.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El formato del correo electrónico no es válido.';
      } else if (err.code === 'auth/too-many-requests') {
        msg = 'Demasiados intentos fallidos. Intenta más tarde o restablece tu contraseña.';
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const registerWithEmailHandler = async (email: string, pass: string, name: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await registerWithEmail(email, pass, name);
      setIsAuthModalOpen(false);
    } catch (err: any) {
      console.error('Email register error:', err);
      let msg = 'Error al crear la cuenta.';
      if (err.code === 'auth/email-already-in-use') {
        msg = 'Ya existe una cuenta registrada con este correo electrónico.';
      } else if (err.code === 'auth/weak-password') {
        msg = 'La contraseña debe tener al menos 6 caracteres.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El correo electrónico ingresado no es válido.';
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const sendPasswordResetEmailHandler = async (email: string) => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await sendPasswordReset(email);
    } catch (err: any) {
      console.error('Password reset error:', err);
      let msg = 'No se pudo enviar el correo de recuperación.';
      if (err.code === 'auth/user-not-found') {
        msg = 'No se encontró ninguna cuenta registrada con este correo.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El correo electrónico no es válido.';
      } else if (err.message) {
        msg = err.message;
      }
      setAuthError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logoutHandler = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await logoutUser();
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setAuthLoading(false);
    }
  };


  // Cart
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CART);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  const addToCart = (item: CartItem) => {
    setCart((prev) => [...prev, item]);
    setIsCartDrawerOpen(true);
  };

  const updateCartItemQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, quantity } : item)));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Modals & Navigation States
  const [modalProductId, setModalProductId] = useState<string | null>(null);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);

  const deleteMyAccount = async (password?: string) => {
    const user = auth.currentUser;
    if (!user) throw new Error('No hay usuario autenticado.');
    const uid = user.uid;

    const providerId = user.providerData[0]?.providerId;
    if (providerId === 'google.com') {
      await reauthenticateWithPopup(user, googleAuthProvider);
    } else if (password) {
      const credential = EmailAuthProvider.credential(user.email || '', password);
      await reauthenticateWithCredential(user, credential);
    } else {
      throw new Error('Se requiere contraseña para confirmar la eliminación de cuenta.');
    }

    const now = new Date().getTime();
    const userApps = appointments.filter((a) => a.customerUid === uid || (currentUser.phone && a.customerPhone === currentUser.phone));
    for (const app of userApps) {
      if (new Date(app.startTimeUtc).getTime() > now && app.status !== 'cancelada') {
        try {
          await cancelAppointment(app.id);
        } catch (e) {}
      }
      try {
        await deleteBusySlotFirestore(app.id);
      } catch (e) {}
      try {
        const appRef = doc(db, 'appointments', app.id);
        await setDoc(appRef, {
          customerName: 'Cuenta eliminada',
          customerPhone: '',
          customerNotes: '',
          customerAddress: '',
          customerUid: null,
        }, { merge: true });
      } catch (e) {}
    }
    setBusySlots((prev) => prev.filter((b) => !userApps.some((a) => a.id === b.appointmentId)));

    const userOrders = orders.filter((o) => o.customerUid === uid || (currentUser.phone && o.customerPhone === currentUser.phone));
    for (const ord of userOrders) {
      try {
        const ordRef = doc(db, 'orders', ord.id);
        await setDoc(ordRef, {
          customerName: 'Cuenta eliminada',
          customerPhone: '',
          customerNotes: '',
          customerUid: null,
        }, { merge: true });
      } catch (e) {}
    }

    try {
      await deleteDoc(doc(db, 'users', uid));
    } catch (e) {}

    await deleteUser(user);

    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('bl_')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k));

    setCurrentUser({
      role: 'client',
      name: '',
      phone: '',
      address: '',
      isLoggedIn: false,
      authProvider: 'guest',
    });
    setCustomerTab('catalogo');
  };
  const [adminTab, setAdminTab] = useState<'resumen' | 'pedidos' | 'logistica' | 'inventario' | 'servicios' | 'catalogo' | 'banners' | 'configuracion' | 'agenda'>('resumen');
  const [customerTab, setCustomerTab] = useState<'catalogo' | 'pedidos' | 'perfil'>('catalogo');

  const openProductModal = (productId: string) => {
    setModalProductId(productId);
  };

  const closeProductModal = () => {
    setModalProductId(null);
  };

  // Reset to default
  const resetToDefaultData = () => {
    setProducts(INITIAL_PRODUCTS);
    setIngredients(INITIAL_INGREDIENTS);
    setBanners(INITIAL_BANNERS);
    setOrders([]);
    setBusinessProfileState(INITIAL_BUSINESS_PROFILE);
    setThemeId('default');
    localStorage.clear();
  };

  // Load sample business presets
  const loadBusinessPreset = (presetType: 'cafe' | 'grill' | 'boutique') => {
    if (presetType === 'cafe') {
      updateBusinessProfile({
        name: 'Aroma & Grano Specialty Coffee',
        slogan: 'Cafetería de especialidad, métodos de extracción y repostería fina',
        category: 'Cafetería & Pastelería',
        currentTheme: 'cafe',
      });
      setThemeId('cafe');
    } else if (presetType === 'grill') {
      updateBusinessProfile({
        name: 'Red Bull Smash & Smokehouse',
        slogan: 'Hamburguesas al carbón, cortes selectos y papas trufadas',
        category: 'Restaurante & Grill',
        currentTheme: 'rojo',
      });
      setThemeId('rojo');
    } else if (presetType === 'boutique') {
      updateBusinessProfile({
        name: 'Ámbar Estudio & Concept Store',
        slogan: 'Objetos de diseño, accesorios de autor y productos exclusivos',
        category: 'Tienda & Concept Store',
        currentTheme: 'naranja',
      });
      setThemeId('naranja');
    }
  };

  return (
    <AppContext.Provider
      value={{
        theme,
        themeId,
        setThemeId,
        firebaseSyncStatus,
        firebaseInfo,
        syncAllToFirestore,
        businessProfile,
        updateBusinessProfile,
        resetToDefaultData,
        loadBusinessPreset,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        setProductRecipe,
        clearProductRecipe,
        clearAllRecipes,
        ingredients,
        addIngredient,
        updateIngredient,
        deleteIngredient,
        adjustIngredientStock,
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        toggleBannerActive,
        orders,
        createOrder,
        updateOrderStatus,
        markOrderPaymentReceived,
        deleteOrder,
        clearAllOrders,
        currentUser,
        isAdminUser,
        switchRole,
        updateCurrentUser,
        loginWithGoogle: loginWithGoogleHandler,
        loginWithEmail: loginWithEmailHandler,
        registerWithEmail: registerWithEmailHandler,
        sendPasswordResetEmail: sendPasswordResetEmailHandler,
        logout: logoutHandler,
        authLoading,
        authError,
        clearAuthError,
        cart,
        addToCart,
        updateCartItemQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,
        modalProductId,
        openProductModal,
        closeProductModal,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        isNotificationDrawerOpen,
        setIsNotificationDrawerOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        isPrivacyModalOpen,
        setIsPrivacyModalOpen,
        deleteMyAccount,
        adminTab,
        setAdminTab,
        customerTab,
        setCustomerTab,
        services,
        addService,
        updateService,
        deleteService,
        calculateServiceTotalDuration,
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
        appointments,
        createAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        cancelAppointment,
        getAvailableSlotsForDate,
        notifications,
        unreadNotificationsCount,
        pushPermission,
        pushPreferences,
        requestPushPermission,
        updatePushPreferences,
        sendPushNotification,
        notifyAdmin,
        notifyCustomer,
        updateOrderShipping,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        clearAllNotifications,
        sendTestPushNotification,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
