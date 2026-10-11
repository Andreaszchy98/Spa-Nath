import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  Check,
  AlertCircle,
  Sparkles,
  Layers,
  ChevronDown,
  DollarSign,
  Package,
  ChefHat,
  Scale,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { GoogleDriveInput } from '../common/GoogleDriveInput';
import {
  IngredientUnit,
  Product,
  ProductOption,
  ProductOptionGroup,
  ProductRecipeItem,
  ProductType,
} from '../../types';

export const AdminCatalog: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    businessProfile,
    theme,
    ingredients,
    addIngredient,
  } = useApp();

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);

  // Quick register central ingredient for an option
  const [optionForNewIng, setOptionForNewIng] = useState<{
    groupId: string;
    optionId: string;
    initialName: string;
  } | null>(null);
  const [newIngName, setNewIngName] = useState('');
  const [newIngUnit, setNewIngUnit] = useState<IngredientUnit>('unidad');
  const [newIngStock, setNewIngStock] = useState<number>(1000);
  const [newIngMinAlert, setNewIngMinAlert] = useState<number>(200);
  const [newIngCost, setNewIngCost] = useState<number>(0.1);
  const [newIngCategory, setNewIngCategory] = useState('Insumos de Opciones');
  const [newIngConsumeQty, setNewIngConsumeQty] = useState<number>(1);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Productos');
  const [type, setType] = useState<ProductType>('producto_fisico');
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStockAlert, setMinStockAlert] = useState<number>(5);
  const [imageUrl, setImageUrl] = useState('');
  const [badge, setBadge] = useState('');
  const [optionGroups, setOptionGroups] = useState<ProductOptionGroup[]>([]);
  const [recipe, setRecipe] = useState<ProductRecipeItem[]>([]);

  const handleOpenNewProduct = () => {
    setEditingProductId(null);
    setName('');
    setDescription('');
    setCategory('Productos');
    setType('producto_fisico');
    setPrice(0);
    setCostPrice(0);
    setStock(0);
    setMinStockAlert(5);
    setImageUrl('');
    setBadge('');
    setRecipe([]);
    setOptionGroups([]);
    setIsEditorOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProductId(prod.id);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category);
    setType(prod.type);
    setPrice(prod.price);
    setCostPrice(prod.costPrice);
    setStock(prod.stock);
    setMinStockAlert(prod.minStockAlert);
    setImageUrl(prod.imageUrl);
    setBadge(prod.badge || '');
    setOptionGroups(JSON.parse(JSON.stringify(prod.optionGroups || [])));
    setRecipe(prod.recipe ? JSON.parse(JSON.stringify(prod.recipe)) : []);
    setIsEditorOpen(true);
  };

  // Recipe (Many-to-Many BOM) Actions
  const handleAddRecipeIngredient = () => {
    if (ingredients.length === 0) return;
    const available = ingredients.find((i) => !recipe.some((r) => r.ingredientId === i.id)) || ingredients[0];
    setRecipe((prev) => [...prev, { ingredientId: available.id, quantity: 1 }]);
  };

  const handleUpdateRecipeIngredient = (index: number, updates: Partial<ProductRecipeItem>) => {
    setRecipe((prev) => prev.map((item, i) => (i === index ? { ...item, ...updates } : item)));
  };

  const handleRemoveRecipeIngredient = (index: number) => {
    setRecipe((prev) => prev.filter((_, i) => i !== index));
  };

  // Option Group Actions
  const handleAddGroup = () => {
    const newGroup: ProductOptionGroup = {
      id: `group-${Date.now()}`,
      title: 'Nuevo Grupo de Opciones',
      type: 'single',
      required: true,
      options: [
        { id: `opt-${Date.now()}-1`, name: 'Opción 1', priceDelta: 0 },
        { id: `opt-${Date.now()}-2`, name: 'Opción 2 con costo extra', priceDelta: 20 },
      ],
    };
    setOptionGroups((prev) => [...prev, newGroup]);
  };

  const handleRemoveGroup = (groupId: string) => {
    setOptionGroups((prev) => prev.filter((g) => g.id !== groupId));
  };

  const handleUpdateGroup = (groupId: string, updates: Partial<ProductOptionGroup>) => {
    setOptionGroups((prev) =>
      prev.map((g) => (g.id === groupId ? { ...g, ...updates } : g))
    );
  };

  const handleAddOptionToGroup = (groupId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: [
              ...g.options,
              {
                id: `opt-${Date.now()}-${Math.random()}`,
                name: 'Nueva opción',
                priceDelta: 0,
              },
            ],
          };
        }
        return g;
      })
    );
  };

  const handleRemoveOption = (groupId: string, optId: string) => {
    setOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.filter((o) => o.id !== optId),
          };
        }
        return g;
      })
    );
  };

  const handleUpdateOption = (
    groupId: string,
    optId: string,
    updates: Partial<ProductOption>
  ) => {
    setOptionGroups((prev) =>
      prev.map((g) => {
        if (g.id === groupId) {
          return {
            ...g,
            options: g.options.map((o) => (o.id === optId ? { ...o, ...updates } : o)),
          };
        }
        return g;
      })
    );
  };

  const handleOpenQuickCreateIngredient = (groupId: string, opt: ProductOption) => {
    const optName = opt.name.trim();
    const lower = optName.toLowerCase();
    let suggestedUnit: IngredientUnit = 'unidad';
    let suggestedConsume = 1;
    let suggestedStock = 100;
    let suggestedAlert = 20;

    if (
      lower.includes('leche') ||
      lower.includes('jarabe') ||
      lower.includes('salsa') ||
      lower.includes('agua') ||
      lower.includes('shot') ||
      lower.includes('vainilla') ||
      lower.includes('caramelo')
    ) {
      suggestedUnit = 'ml';
      suggestedConsume = lower.includes('leche') ? 220 : 25;
      suggestedStock = 10000;
      suggestedAlert = 2000;
    } else if (
      lower.includes('carne') ||
      lower.includes('café') ||
      lower.includes('grano') ||
      lower.includes('queso') ||
      lower.includes('tocino')
    ) {
      if (lower.includes('carne')) {
        suggestedUnit = 'g';
        suggestedConsume = 80;
        suggestedStock = 5000;
        suggestedAlert = 1000;
      } else if (lower.includes('café')) {
        suggestedUnit = 'g';
        suggestedConsume = 18;
        suggestedStock = 3000;
        suggestedAlert = 500;
      } else {
        suggestedUnit = 'unidad';
        suggestedConsume = 2;
        suggestedStock = 100;
        suggestedAlert = 20;
      }
    }

    setOptionForNewIng({
      groupId,
      optionId: opt.id,
      initialName: optName || 'Nuevo Insumo',
    });
    setNewIngName(optName || 'Nuevo Insumo');
    setNewIngUnit(suggestedUnit);
    setNewIngStock(suggestedStock);
    setNewIngMinAlert(suggestedAlert);
    setNewIngCost(suggestedUnit === 'ml' || suggestedUnit === 'g' ? 0.05 : 5);
    setNewIngCategory('Insumos de Opciones');
    setNewIngConsumeQty(suggestedConsume);
  };

  const handleSaveQuickCreateIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!optionForNewIng || !newIngName.trim()) return;

    const newId = addIngredient({
      name: newIngName.trim(),
      unit: newIngUnit,
      stock: Math.max(0, newIngStock),
      minStockAlert: Math.max(0, newIngMinAlert),
      costPerUnit: Math.max(0, newIngCost),
      category: newIngCategory.trim() || 'Insumos de Opciones',
      supplier: 'Almacén Central',
    });

    handleUpdateOption(optionForNewIng.groupId, optionForNewIng.optionId, {
      extraIngredientId: newId,
      extraIngredientQuantity: Math.max(0.01, newIngConsumeQty),
    });

    setOptionForNewIng(null);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const payload = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim(),
      type,
      price: Number(price),
      costPrice: Number(costPrice),
      stock: Number(stock),
      minStockAlert: Number(minStockAlert),
      imageUrl: imageUrl.trim() || '',
      badge: badge.trim() || undefined,
      available: true,
      optionGroups,
      recipe,
    };

    if (editingProductId) {
      updateProduct(editingProductId, payload);
    } else {
      addProduct(payload);
    }

    setIsEditorOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Catálogo de Productos
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gestiona productos físicos para venta y retail con control de inventario, stock, SKU y fotos. Los servicios de spa se declaran y configuran en el <strong>Catálogo de Servicios</strong>.
          </p>
        </div>

        <button
          onClick={handleOpenNewProduct}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition-all active:scale-95 ${theme.buttonClass}`}
        >
          <Plus className="w-4 h-4" />
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <Package className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-slate-800">No hay productos registrados</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            El catálogo está listo para que registres tus productos físicos cuando los subas. Haz clic en "Nuevo Producto" para comenzar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs flex flex-col justify-between"
          >
            <div>
              <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/90 text-slate-900">
                    {product.type}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="p-4 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm leading-snug">
                    {product.name}
                  </h3>
                  <span className="font-mono font-extrabold text-slate-900 text-sm shrink-0">
                    {businessProfile.currency}{product.price}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2">
                  {product.description}
                </p>

                {/* Modifiers Count Summary */}
                <div className="pt-1 flex items-center gap-2 text-[11px] text-slate-500">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    {product.optionGroups?.length || 0} grupo(s) de opciones configurados
                  </span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
              <span className="text-[11px] text-slate-500">
                Stock: <strong>{product.stock}</strong> unidades
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => handleOpenEditProduct(product)}
                  className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 rounded-lg font-semibold flex items-center gap-1 transition-colors"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Editar & Opciones</span>
                </button>
                <button
                  type="button"
                  onClick={() => setProductToDelete(product)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Eliminar producto"
                  aria-label="Eliminar producto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      )}

      {/* Product Creator & Customizer Builder Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
          <form
            onSubmit={handleSaveProduct}
            className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-6 max-h-[92vh] flex flex-col"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                  {editingProductId ? 'Editar Producto & Modificadores' : 'Crear Nuevo Producto'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configura precios, control de stock, fotos de Google Drive y grupos de personalización para el cliente.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-slate-400 hover:text-slate-800 p-1"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Form Body */}
            <div className="p-4 sm:p-6 overflow-y-auto overflow-x-hidden space-y-6 flex-1 text-xs">
              {/* Section 1: Basic Info */}
              <div className="space-y-4">
                <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-600">
                  <Package className="w-3.5 h-3.5" />
                  1. Información Básica del Producto
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Nombre del Producto *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ej: Facial Hidratante Premium"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Descripción para el Cliente
                    </label>
                    <textarea
                      rows={2}
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Ingredientes, beneficios, aplicación..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Tipo de Producto *
                    </label>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as ProductType)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="producto_fisico">Producto Físico / Retail</option>
                      <option value="servicio">Servicio / Tratamiento</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Categoría
                    </label>
                    <input
                      type="text"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Ej: Faciales, Masajes, Cremas..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Precio de Venta Base ({businessProfile.currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm font-bold focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Costo de Adquisición/Preparación ({businessProfile.currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={costPrice}
                      onChange={(e) => setCostPrice(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Stock Inicial en Inventario
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Alerta de Bajo Stock (Mínimo)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={minStockAlert}
                      onChange={(e) => setMinStockAlert(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="font-semibold text-slate-700 block mb-1">
                      Insignia / Badge Destacado (Opcional)
                    </label>
                    <input
                      type="text"
                      value={badge}
                      onChange={(e) => setBadge(e.target.value)}
                      placeholder="Ej: Más Vendido, Recomendado del Chef, Nuevo..."
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Google Drive Image Normalizer */}
              <div className="pt-4 border-t border-slate-200">
                <GoogleDriveInput
                  value={imageUrl}
                  onChange={(normalized) => setImageUrl(normalized)}
                  label="Fotografía del Producto (Soporta Google Drive normalizado o URL directa)"
                  placeholder="https://drive.google.com/file/d/... o https://..."
                  helperText="Puedes pegar el enlace para compartir de Google Drive y el sistema lo normalizará al instante."
                />
              </div>

              {/* Section 3: Option Groups & Customizer Builder */}
              <div className="pt-4 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 text-slate-600">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      3. Grupos de Opciones Personalizables por el Cliente
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Define tamaños, extras que cambien o no el precio, y cuáles son obligatorios.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddGroup}
                    className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Añadir Grupo</span>
                  </button>
                </div>

                {optionGroups.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500">
                    No has configurado opciones personalizadas para este producto.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {optionGroups.map((group, groupIdx) => (
                      <div
                        key={group.id}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3"
                      >
                        {/* Group Header Controls */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <span className="font-bold text-slate-400 text-xs shrink-0">
                              #{groupIdx + 1}
                            </span>
                            <input
                              type="text"
                              value={group.title}
                              onChange={(e) =>
                                handleUpdateGroup(group.id, { title: e.target.value })
                              }
                              placeholder="Nombre del grupo (ej: Tamaño, Tipo de Leche)"
                              className="w-full px-2.5 py-1 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 min-w-0"
                            />
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            {/* Single vs Multiple */}
                            <select
                              value={group.type}
                              onChange={(e) =>
                                handleUpdateGroup(group.id, {
                                  type: e.target.value as 'single' | 'multiple',
                                })
                              }
                              className="px-2 py-1 text-[11px] font-medium bg-white border border-slate-300 rounded"
                            >
                              <option value="single">Selección Única (1 opción)</option>
                              <option value="multiple">Selección Múltiple (Varios)</option>
                            </select>

                            {/* Required toggle */}
                            <label className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={group.required}
                                onChange={(e) =>
                                  handleUpdateGroup(group.id, { required: e.target.checked })
                                }
                                className="w-3.5 h-3.5 rounded text-slate-900"
                              />
                              <span>Obligatorio</span>
                            </label>

                            <button
                              type="button"
                              onClick={() => handleRemoveGroup(group.id)}
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors shrink-0"
                              title="Eliminar grupo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Options in this group */}
                        <div className="space-y-2">
                          <div className="text-[11px] text-slate-500 font-medium">
                            Opciones que el cliente podrá elegir:
                          </div>

                          {group.options.map((opt) => {
                            const linkedIng = opt.extraIngredientId
                              ? ingredients.find((i) => i.id === opt.extraIngredientId)
                              : null;

                            return (
                              <div
                                key={opt.id}
                                className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs space-y-2.5 transition-all hover:border-slate-300 overflow-hidden"
                              >
                                {/* Fila 1: Nombre de la opción, Precio Extra y Eliminar */}
                                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                  {/* Nombre de la opción */}
                                  <div className="flex-1 min-w-0">
                                    <input
                                      type="text"
                                      value={opt.name}
                                      onChange={(e) =>
                                        handleUpdateOption(group.id, opt.id, {
                                          name: e.target.value,
                                        })
                                      }
                                      placeholder="Nombre de la opción (ej. Leche de Avena Barista, Doble Queso)"
                                      className="w-full px-2.5 py-1.5 text-xs bg-slate-50/70 border border-slate-200 rounded-lg focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900 transition-colors font-medium text-slate-900"
                                    />
                                  </div>

                                  {/* Precio Extra y Botón Eliminar */}
                                  <div className="flex items-center justify-between sm:justify-end gap-2 shrink-0">
                                    <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200">
                                      <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 whitespace-nowrap">
                                        Extra: +{businessProfile.currency}
                                      </span>
                                      <input
                                        type="number"
                                        min="0"
                                        value={opt.priceDelta}
                                        onChange={(e) =>
                                          handleUpdateOption(group.id, opt.id, {
                                            priceDelta: Number(e.target.value),
                                          })
                                        }
                                        placeholder="0"
                                        className="w-16 px-1.5 py-0.5 text-xs bg-white border border-slate-300 rounded font-mono font-bold text-slate-900 text-right focus:outline-none focus:ring-1 focus:ring-slate-900"
                                      />
                                    </div>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveOption(group.id, opt.id)}
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0"
                                      title="Eliminar opción"
                                      aria-label="Eliminar opción"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>

                                {/* Fila 2: Vinculación con Inventario Central (Contenido en frame) */}
                                <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
                                  {/* Selector de Insumo Central */}
                                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                                    <Scale className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span className="text-[11px] font-semibold text-slate-600 shrink-0">
                                      Insumo:
                                    </span>
                                    <select
                                      value={opt.extraIngredientId || ''}
                                      onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === '__CREATE_NEW__') {
                                          handleOpenQuickCreateIngredient(group.id, opt);
                                        } else if (val) {
                                          const foundIng = ingredients.find((i) => i.id === val);
                                          const defaultQty =
                                            opt.extraIngredientQuantity ||
                                            (foundIng?.unit === 'ml' ? 220 : foundIng?.unit === 'g' ? 30 : 1);
                                          handleUpdateOption(group.id, opt.id, {
                                            extraIngredientId: val,
                                            extraIngredientQuantity: defaultQty,
                                          });
                                        } else {
                                          handleUpdateOption(group.id, opt.id, {
                                            extraIngredientId: undefined,
                                            extraIngredientQuantity: undefined,
                                          });
                                        }
                                      }}
                                      className={`min-w-0 flex-1 w-full px-2 py-1 text-xs rounded-lg border font-medium truncate transition-colors ${
                                        opt.extraIngredientId
                                          ? 'bg-amber-50/70 border-amber-300 text-amber-950 font-semibold'
                                          : 'bg-white border-slate-200 text-slate-600'
                                      }`}
                                    >
                                      <option value="">(Sin insumo vinculado)</option>
                                      <option value="__CREATE_NEW__">
                                        ✨ + Registrar nuevo insumo...
                                      </option>
                                      <optgroup label="Insumos Centrales Registrados">
                                        {ingredients.map((ing) => (
                                          <option key={ing.id} value={ing.id}>
                                            {ing.name} (Disp: {ing.stock.toLocaleString()} {ing.unit})
                                          </option>
                                        ))}
                                      </optgroup>
                                    </select>
                                  </div>

                                  {/* Si está vinculado: Cantidad a descontar por venta y Stock badge sin desbordar */}
                                  {linkedIng ? (
                                    <div className="flex items-center gap-1.5 shrink-0 bg-amber-50/90 px-2 py-1 rounded-lg border border-amber-200 max-w-full overflow-hidden flex-wrap">
                                      <span className="text-[11px] text-amber-900 font-semibold shrink-0">
                                        Descuenta:
                                      </span>
                                      <input
                                        type="number"
                                        min="0.01"
                                        step="any"
                                        value={opt.extraIngredientQuantity ?? 1}
                                        onChange={(e) =>
                                          handleUpdateOption(group.id, opt.id, {
                                            extraIngredientQuantity: Number(e.target.value),
                                          })
                                        }
                                        className="w-14 px-1 py-0.5 text-xs bg-white border border-amber-300 rounded font-mono font-bold text-amber-950 text-right focus:outline-none focus:ring-1 focus:ring-amber-500 shrink-0"
                                      />
                                      <span className="text-[11px] font-bold text-amber-900 uppercase shrink-0">
                                        {linkedIng.unit}
                                      </span>
                                      <span className="text-[10px] text-amber-900 font-medium bg-amber-200/70 px-1.5 py-0.5 rounded border border-amber-300/70 shrink-0 truncate max-w-[130px] sm:max-w-none">
                                        Stock: {linkedIng.stock.toLocaleString()} {linkedIng.unit}
                                      </span>
                                    </div>
                                  ) : (
                                    /* Botón rápido si no está vinculado */
                                    <button
                                      type="button"
                                      onClick={() => handleOpenQuickCreateIngredient(group.id, opt)}
                                      className="px-2 py-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1 transition-colors shrink-0 self-start md:self-auto"
                                      title="Registrar esta opción como nuevo insumo en el inventario central"
                                    >
                                      <Plus className="w-3 h-3 text-amber-700" />
                                      <span>Registrar Insumo</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                          <button
                            type="button"
                            onClick={() => handleAddOptionToGroup(group.id)}
                            className="text-[11px] text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1 pt-1"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Agregar otra opción a este grupo</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recipe / Ficha Técnica (Relación Many-to-Many con Ingredientes Centrales) */}
              <div className="pt-4 border-t border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <ChefHat className="w-4 h-4 text-amber-600" />
                      <span>Ficha Técnica & Insumos Requeridos</span>
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Insumos y cosméticos del catálogo central que se descuentan automáticamente por cada venta o servicio.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {recipe.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setRecipe([])}
                        className="px-2.5 py-1.5 text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 flex items-center gap-1.5 transition-colors"
                        title="Vaciar los insumos de esta ficha para empezar a configurarla desde cero"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                        <span>Borrar Ficha</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleAddRecipeIngredient}
                      disabled={ingredients.length === 0}
                      className="px-3 py-1.5 text-[11px] font-bold bg-amber-50 text-amber-900 border border-amber-200 rounded-lg hover:bg-amber-100 flex items-center gap-1.5 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar Insumo a la Ficha</span>
                    </button>
                  </div>
                </div>

                {recipe.length === 0 ? (
                  <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-500">
                    Este producto o servicio no tiene ficha técnica configurada aún. Pulsa <strong>"Agregar Insumo a la Ficha"</strong> para asociarle insumos del catálogo central.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recipe.map((item, idx) => {
                      const ing = ingredients.find((i) => i.id === item.ingredientId);
                      const costEst = ing ? Number((ing.costPerUnit * item.quantity).toFixed(2)) : 0;
                      return (
                        <div
                          key={idx}
                          className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"
                        >
                          {/* Selector de ingrediente */}
                          <div className="flex-1 min-w-0">
                            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                              Insumo del catálogo central:
                            </label>
                            <select
                              value={item.ingredientId}
                              onChange={(e) =>
                                handleUpdateRecipeIngredient(idx, { ingredientId: e.target.value })
                              }
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900 truncate"
                            >
                              {ingredients.map((i) => (
                                <option key={i.id} value={i.id}>
                                  {i.name} ({i.unit}) — Disp: {i.stock.toLocaleString()} {i.unit}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Cantidad requerida */}
                          <div className="w-28 sm:w-32 shrink-0">
                            <label className="text-[10px] font-semibold text-slate-500 block mb-0.5">
                              Porción ({ing?.unit || 'unidad'}):
                            </label>
                            <div className="flex items-center gap-1 bg-white px-2 py-1 border border-slate-300 rounded-lg">
                              <input
                                type="number"
                                min="0.01"
                                step="any"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleUpdateRecipeIngredient(idx, {
                                    quantity: Math.max(0.01, parseFloat(e.target.value) || 0),
                                  })
                                }
                                className="w-full text-xs font-mono font-bold text-slate-900 focus:outline-none"
                              />
                              <span className="text-[10px] text-slate-400 font-bold shrink-0">{ing?.unit}</span>
                            </div>
                          </div>

                          {/* Costo estimado y Stock */}
                          <div className="flex items-center gap-2 shrink-0 sm:pt-4">
                            <div className="text-[11px] text-slate-500 font-mono">
                              Costo: <span className="font-bold text-slate-800">{businessProfile.currency}{costEst}</span>
                            </div>
                            {ing && (
                              <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium truncate max-w-[120px]">
                                Stock: {ing.stock.toLocaleString()} {ing.unit}
                              </span>
                            )}
                          </div>

                          {/* Botón quitar */}
                          <button
                            type="button"
                            onClick={() => handleRemoveRecipeIngredient(idx)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors shrink-0 self-end sm:self-auto sm:mt-4"
                            title="Quitar de la receta"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })}

                    {/* Resumen costo receta */}
                    <div className="flex items-center justify-between p-2.5 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs text-amber-950 font-medium">
                      <span>Costo estimado total de insumos por unidad:</span>
                      <span className="font-mono font-bold text-sm">
                        {businessProfile.currency}
                        {recipe
                          .reduce((sum, r) => {
                            const i = ingredients.find((ing) => ing.id === r.ingredientId);
                            return sum + (i ? i.costPerUnit * r.quantity : 0);
                          }, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2">
              {editingProductId ? (
                <button
                  type="button"
                  onClick={() => {
                    const p = products.find((item) => item.id === editingProductId);
                    if (p) {
                      setIsEditorOpen(false);
                      setProductToDelete(p);
                    }
                  }}
                  className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border border-rose-200"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Eliminar Producto</span>
                </button>
              ) : (
                <div />
              )}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-100 text-slate-700 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-xs font-bold shadow-xs ${theme.buttonClass}`}
                >
                  {editingProductId ? 'Guardar Cambios' : 'Publicar Producto'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Delete Product Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">¿Eliminar producto?</h3>
                <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <p className="text-xs text-slate-600">
              ¿Estás seguro de que deseas eliminar <strong className="text-slate-900 font-semibold">{productToDelete.name}</strong> del catálogo?
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold hover:bg-slate-50 text-slate-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteProduct(productToDelete.id);
                  setProductToDelete(null);
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Registro Rápido de Insumo Central para una Opción */}
      {optionForNewIng && (
        <div className="fixed inset-0 z-60 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-slate-950 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm">Registrar en Inventario Central</h3>
              </div>
              <button
                type="button"
                onClick={() => setOptionForNewIng(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickCreateIngredient} className="p-5 space-y-4 text-xs">
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Este insumo vivirá en el catálogo central de almacén y se descontará automáticamente cuando los clientes elijan esta opción.
              </p>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre del Insumo *</label>
                <input
                  type="text"
                  required
                  value={newIngName}
                  onChange={(e) => setNewIngName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Unidad de Medida</label>
                  <select
                    value={newIngUnit}
                    onChange={(e) => setNewIngUnit(e.target.value as IngredientUnit)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    <option value="ml">ml (Mililitros)</option>
                    <option value="l">l (Litros)</option>
                    <option value="g">g (Gramos)</option>
                    <option value="kg">kg (Kilogramos)</option>
                    <option value="unidad">unidad (Piezas)</option>
                    <option value="porcion">porcion (Porciones)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Descuento por Venta</label>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      min="0.01"
                      step="any"
                      required
                      value={newIngConsumeQty}
                      onChange={(e) => setNewIngConsumeQty(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                    />
                    <span className="text-[11px] font-bold text-slate-600 uppercase">{newIngUnit}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Inicial Almacén</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newIngStock}
                    onChange={(e) => setNewIngStock(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alerta Stock Bajo</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newIngMinAlert}
                    onChange={(e) => setNewIngMinAlert(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={newIngCost}
                    onChange={(e) => setNewIngCost(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <input
                    type="text"
                    value={newIngCategory}
                    onChange={(e) => setNewIngCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setOptionForNewIng(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  Guardar y Vincular
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
