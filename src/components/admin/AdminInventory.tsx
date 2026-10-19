import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Plus,
  Minus,
  Search,
  Filter,
  DollarSign,
  Layers,
  Coffee,
  Scale,
  Edit2,
  Trash2,
  ChefHat,
  Info,
  Sparkles,
  ArrowRight,
  Check,
  X,
  RefreshCw,
  Boxes,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Ingredient, IngredientUnit, Product, ProductRecipeItem } from '../../types';

export const AdminInventory: React.FC = () => {
  const {
    products,
    adjustStock,
    updateProduct,
    toggleProductAvailability,
    setProductRecipe,
    clearProductRecipe,
    clearAllRecipes,
    ingredients,
    addIngredient,
    updateIngredient,
    deleteIngredient,
    adjustIngredientStock,
    businessProfile,
    updateBusinessProfile,
    theme,
  } = useApp();

  // Sub-tab selection
  const [activeSubTab, setActiveSubTab] = useState<'insumos' | 'recetas' | 'productos'>('insumos');

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out'>('all');

  // Clear Recipes Modals
  const [isClearAllRecipesModalOpen, setIsClearAllRecipesModalOpen] = useState(false);
  const [productToClearRecipe, setProductToClearRecipe] = useState<Product | null>(null);

  // Ingredient Editor Modal
  const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState<Ingredient | null>(null);
  const [ingName, setIngName] = useState('');
  const [ingUnit, setIngUnit] = useState<IngredientUnit>('unidad');
  const [ingStock, setIngStock] = useState<number>(100);
  const [ingMinAlert, setIngMinAlert] = useState<number>(20);
  const [ingCost, setIngCost] = useState<number>(10);
  const [ingCategory, setIngCategory] = useState('Insumos Generales');
  const [ingSupplier, setIngSupplier] = useState('');

  // Restock Quick Modal
  const [restockIngredient, setRestockIngredient] = useState<Ingredient | null>(null);
  const [restockAmount, setRestockAmount] = useState<number>(500);

  // Recipe Editor Modal
  const [recipeModalProduct, setRecipeModalProduct] = useState<Product | null>(null);
  const [editingRecipe, setEditingRecipe] = useState<ProductRecipeItem[]>([]);

  // Filtering Ingredients
  const filteredIngredients = ingredients.filter((ing) => {
    if (
      searchQuery &&
      !ing.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !ing.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filterStatus === 'low') {
      return ing.stock > 0 && ing.stock <= ing.minStockAlert;
    }
    if (filterStatus === 'out') {
      return ing.stock <= 0;
    }
    return true;
  });

  // Filtering Products (Finished goods)
  const filteredProducts = products.filter((p) => {
    if (
      searchQuery &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.category.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    if (filterStatus === 'low') {
      return p.stock > 0 && p.stock <= p.minStockAlert;
    }
    if (filterStatus === 'out') {
      return p.stock <= 0;
    }
    return true;
  });

  // Calculate Metrics for Ingredients
  const totalIngredientValue = ingredients.reduce(
    (sum, ing) => sum + ing.stock * ing.costPerUnit,
    0
  );
  const lowStockIngredientsCount = ingredients.filter(
    (ing) => ing.stock > 0 && ing.stock <= ing.minStockAlert
  ).length;
  const outOfStockIngredientsCount = ingredients.filter((ing) => ing.stock <= 0).length;

  // Products and Options using a specific ingredient
  const getIngredientUsages = (ingId: string) => {
    const usages: Array<{
      productId: string;
      productName: string;
      type: 'recipe' | 'option';
      label: string;
      quantity: number;
    }> = [];

    products.forEach((p) => {
      // 1. Recipe
      p.recipe?.forEach((r) => {
        if (r.ingredientId === ingId) {
          usages.push({
            productId: p.id,
            productName: p.name,
            type: 'recipe',
            label: 'Receta Base',
            quantity: r.quantity,
          });
        }
      });

      // 2. Option Groups
      p.optionGroups?.forEach((g) => {
        g.options.forEach((opt) => {
          if (opt.extraIngredientId === ingId) {
            usages.push({
              productId: p.id,
              productName: p.name,
              type: 'option',
              label: `Opción: ${opt.name}`,
              quantity: opt.extraIngredientQuantity || 1,
            });
          }
        });
      });
    });

    return usages;
  };

  // Calculate theoretical capacity (bottleneck ingredient)
  const getTheoreticalCapacity = (product: Product) => {
    if (!product.recipe || product.recipe.length === 0) return null;
    let minServings = Infinity;
    let bottleneckIng: Ingredient | null = null;

    for (const item of product.recipe) {
      const ing = ingredients.find((i) => i.id === item.ingredientId);
      if (!ing || item.quantity <= 0) continue;
      const possible = Math.floor(ing.stock / item.quantity);
      if (possible < minServings) {
        minServings = possible;
        bottleneckIng = ing;
      }
    }

    if (minServings === Infinity) return null;
    return {
      servings: minServings,
      bottleneck: bottleneckIng,
    };
  };

  // Open Ingredient Modal
  const handleOpenNewIngredient = () => {
    setEditingIngredient(null);
    setIngName('');
    setIngUnit('unidad');
    setIngStock(100);
    setIngMinAlert(20);
    setIngCost(10);
    setIngCategory('Insumos Generales');
    setIngSupplier('');
    setIsIngredientModalOpen(true);
  };

  const handleOpenEditIngredient = (ing: Ingredient) => {
    setEditingIngredient(ing);
    setIngName(ing.name);
    setIngUnit(ing.unit);
    setIngStock(ing.stock);
    setIngMinAlert(ing.minStockAlert);
    setIngCost(ing.costPerUnit);
    setIngCategory(ing.category);
    setIngSupplier(ing.supplier || '');
    setIsIngredientModalOpen(true);
  };

  const handleSaveIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ingName.trim()) return;

    if (editingIngredient) {
      updateIngredient(editingIngredient.id, {
        name: ingName.trim(),
        unit: ingUnit,
        stock: Math.max(0, Number(ingStock) || 0),
        minStockAlert: Math.max(0, Number(ingMinAlert) || 0),
        costPerUnit: Math.max(0, Number(ingCost) || 0),
        category: ingCategory.trim(),
        supplier: ingSupplier.trim() || undefined,
      });
    } else {
      addIngredient({
        name: ingName.trim(),
        unit: ingUnit,
        stock: Math.max(0, Number(ingStock) || 0),
        minStockAlert: Math.max(0, Number(ingMinAlert) || 0),
        costPerUnit: Math.max(0, Number(ingCost) || 0),
        category: ingCategory.trim(),
        supplier: ingSupplier.trim() || undefined,
      });
    }
    setIsIngredientModalOpen(false);
  };

  // Open Restock Modal
  const handleOpenRestock = (ing: Ingredient) => {
    setRestockIngredient(ing);
    setRestockAmount(ing.unit === 'g' ? 1000 : ing.unit === 'ml' ? 2000 : 20);
  };

  const handleConfirmRestock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockIngredient || restockAmount <= 0) return;
    adjustIngredientStock(restockIngredient.id, Number(restockAmount));
    setRestockIngredient(null);
  };

  // Open Recipe Modal
  const handleOpenRecipeModal = (product: Product) => {
    setRecipeModalProduct(product);
    setEditingRecipe(product.recipe ? JSON.parse(JSON.stringify(product.recipe)) : []);
  };

  const handleSaveRecipeModal = () => {
    if (!recipeModalProduct) return;
    setProductRecipe(recipeModalProduct.id, editingRecipe);
    setRecipeModalProduct(null);
  };

  return (
    <div className="space-y-6">
      {/* Header & Main Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Gestión de Inventario & Fichas Técnicas
          </h2>

        </div>

        {/* Global stock control toggle */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
            <input
              type="checkbox"
              checked={businessProfile.enableStockControl}
              onChange={(e) =>
                updateBusinessProfile({ enableStockControl: e.target.checked })
              }
              className="w-4 h-4 rounded text-slate-900 focus:ring-slate-900"
            />
            <span>Control de Stock Activo</span>
          </label>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('insumos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeSubTab === 'insumos'
              ? 'shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
          style={
            activeSubTab === 'insumos'
              ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
              : undefined
          }
        >
          <Scale className="w-4 h-4" />
          <span>Insumos y Cosméticos Centrales ({ingredients.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('recetas')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeSubTab === 'recetas'
              ? 'shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
          style={
            activeSubTab === 'recetas'
              ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
              : undefined
          }
        >
          <ChefHat className="w-4 h-4" />
          <span>Fichas Técnicas de Servicios</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('productos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all ${
            activeSubTab === 'productos'
              ? 'shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
          style={
            activeSubTab === 'productos'
              ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
              : undefined
          }
        >
          <Package className="w-4 h-4" />
          <span>Stock de Mostrador / Unidades ({products.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VISTA 1: CATÁLOGO CENTRAL DE INSUMOS E INGREDIENTES */}
      {/* ========================================================================= */}
      {activeSubTab === 'insumos' && (
        <div className="space-y-5">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 block">Total Insumos Centrales</span>
              <span className="text-xl font-bold text-slate-900 font-mono">
                {ingredients.length} insumos
              </span>
              <span className="text-[11px] text-slate-400 block">
                Catálogo único para todo el negocio
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 block">Valuación de Insumos</span>
              <span className="text-xl font-bold text-slate-900 font-mono">
                {businessProfile.currency}
                {Math.round(totalIngredientValue).toLocaleString()}
              </span>
              <span className="text-[11px] text-slate-400 block">
                Capital en bodega/materia prima
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-1">
              <span className="text-slate-500 block">Alertas de Reabastecimiento</span>
              <span className="text-xl font-bold text-amber-700 font-mono">
                {lowStockIngredientsCount + outOfStockIngredientsCount} críticas
              </span>
              <span className="text-[11px] text-rose-600 block">
                {outOfStockIngredientsCount} agotados · {lowStockIngredientsCount} por agotarse
              </span>
            </div>

            <div
              className="text-white p-4 rounded-xl text-xs flex flex-col justify-between shadow-xs"
              style={{ backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }}
            >
              <div>
                <span className="opacity-80 block font-semibold text-[11px]">Acción Directa</span>
                <span className="text-sm font-bold block mt-0.5">Añadir Nuevo Insumo</span>
              </div>
              <button
                type="button"
                onClick={handleOpenNewIngredient}
                className="mt-2 w-full py-2 bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Nuevo Insumo</span>
              </button>
            </div>
          </div>

          {/* Search, Filter & Actions Bar */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar insumo (ej: aceites, cremas, toallas, envases)..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs flex-wrap">
              <button
                type="button"
                onClick={() => setFilterStatus('all')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === 'all'
                    ? 'shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                }`}
                style={
                  filterStatus === 'all'
                    ? { backgroundColor: theme.raw.primaryBtn, color: theme.raw.primaryBtnText }
                    : undefined
                }
              >
                Todos ({ingredients.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('low')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === 'low'
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
                }`}
              >
                Bajo Stock ({lowStockIngredientsCount})
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus('out')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  filterStatus === 'out'
                    ? 'bg-rose-600 text-white'
                    : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
                }`}
              >
                Agotados ({outOfStockIngredientsCount})
              </button>
            </div>
          </div>

          {/* Ingredients Central Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Insumo</th>
                    <th className="py-3 px-4">Categoría & Proveedor</th>
                    <th className="py-3 px-4">Stock Central</th>
                    <th className="py-3 px-4">Alerta Mínima</th>
                    <th className="py-3 px-4">Costo x Unidad</th>
                    <th className="py-3 px-4">Productos que lo Utilizan (Relación N:M)</th>
                    <th className="py-3 px-4 text-center">Ajuste Rápido</th>
                    <th className="py-3 px-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredIngredients.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-400">
                        <Scale className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-bold text-slate-700 text-sm">No hay insumos registrados</p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Haz clic en "+ Nuevo Insumo" para registrar el primer insumo en tu bodega o almacén.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredIngredients.map((ing, ingIdx) => {
                    const isOut = ing.stock <= 0;
                    const isLow = !isOut && ing.stock <= ing.minStockAlert;
                    const usages = getIngredientUsages(ing.id);

                    return (
                      <tr key={`${ing.id}-${ingIdx}`} className="hover:bg-slate-50/80 transition-colors">
                        {/* Name */}
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5 text-slate-400" />
                            <span>{ing.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {ing.id}
                          </span>
                        </td>

                        {/* Category & Supplier */}
                        <td className="py-3 px-4 text-slate-600">
                          <div className="font-medium text-slate-800">{ing.category}</div>
                          {ing.supplier && (
                            <span className="text-[10px] text-slate-400 block">
                              Prov: {ing.supplier}
                            </span>
                          )}
                        </td>

                        {/* Current Stock */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-mono font-bold text-sm ${
                                isOut
                                  ? 'text-rose-600'
                                  : isLow
                                  ? 'text-amber-600'
                                  : 'text-slate-900'
                              }`}
                            >
                              {ing.stock.toLocaleString()}
                            </span>
                            <span className="text-[11px] text-slate-500 font-semibold uppercase">
                              {ing.unit}
                            </span>
                          </div>
                          {isOut ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-rose-100 text-rose-800">
                              Agotado
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800">
                              Bajo Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                              Óptimo
                            </span>
                          )}
                        </td>

                        {/* Min Stock */}
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {ing.minStockAlert} {ing.unit}
                        </td>

                        {/* Cost per unit */}
                        <td className="py-3 px-4 font-mono text-slate-700">
                          {businessProfile.currency}
                          {ing.costPerUnit} / {ing.unit}
                        </td>

                        {/* Linked Products & Options (Many-to-Many) */}
                        <td className="py-3 px-4 max-w-sm">
                          {usages.length === 0 ? (
                            <span className="text-[11px] text-slate-400 italic">
                              Sin productos ni opciones vinculadas
                            </span>
                          ) : (
                            <div className="flex flex-wrap gap-1.5">
                              {usages.map((u, uIdx) => (
                                <span
                                  key={`${u.productId}-${uIdx}`}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                    u.type === 'option'
                                      ? 'bg-amber-50 text-amber-950 border-amber-200'
                                      : 'bg-slate-100 text-slate-800 border-slate-200'
                                  }`}
                                  title={`${u.productName} • ${u.label}: Descuenta ${u.quantity} ${ing.unit}`}
                                >
                                  <span className="font-semibold">{u.productName}</span>
                                  <span className="text-slate-500 text-[9px]">({u.label})</span>
                                  <span className="text-amber-800 font-mono font-bold">
                                    (-{u.quantity}{ing.unit})
                                  </span>
                                </span>
                              ))}
                            </div>
                          )}
                        </td>

                        {/* Quick Adjust (+ / -) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                adjustIngredientStock(
                                  ing.id,
                                  -(ing.unit === 'g' || ing.unit === 'ml' ? 100 : 1)
                                )
                              }
                              className="w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                              title={`Restar ${ing.unit === 'g' || ing.unit === 'ml' ? 100 : 1} ${ing.unit}`}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                adjustIngredientStock(
                                  ing.id,
                                  ing.unit === 'g' || ing.unit === 'ml' ? 100 : 1
                                )
                              }
                              className="w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                              title={`Sumar ${ing.unit === 'g' || ing.unit === 'ml' ? 100 : 1} ${ing.unit}`}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleOpenRestock(ing)}
                              className="px-2 h-7 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold transition-colors"
                              title="Registrar entrada de compras / reabastecimiento"
                            >
                              +Entrada
                            </button>
                          </div>
                        </td>

                        {/* Actions (Edit / Delete) */}
                        <td className="py-3 px-4 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleOpenEditIngredient(ing)}
                              className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Editar insumo"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteIngredient(ing.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Eliminar insumo del catálogo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 2: RECETAS & FICHAS TÉCNICAS (BOM / RELACIÓN MUCHOS A MUCHOS) */}
      {/* ========================================================================= */}
      {activeSubTab === 'recetas' && (
        <div className="space-y-6">
          {/* Header de Gestión de Fichas Técnicas con botón para borrar todas */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-amber-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Fichas Técnicas de Servicios & Tratamientos
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Configura qué insumos y cosméticos del catálogo central consume cada servicio al agendarse.{' '}
                <strong className="text-slate-800">
                  {products.filter((p) => (p.recipe || []).length > 0).length} de {products.length} servicios
                </strong>{' '}
                tienen ficha técnica activa.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsClearAllRecipesModalOpen(true)}
                disabled={products.every((p) => !p.recipe || p.recipe.length === 0)}
                className="px-3.5 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 shrink-0 disabled:opacity-40 disabled:cursor-not-allowed bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 hover:border-rose-300 shadow-2xs"
                title="Borrar todas las fichas técnicas para empezar a configurarlas desde cero"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                <span>Borrar Todas las Fichas</span>
              </button>
            </div>
          </div>

          {/* Products Recipes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {products.map((prod, pIdx) => {
              const capacity = getTheoreticalCapacity(prod);
              const recipeCost = (prod.recipe || []).reduce((sum, r) => {
                const ing = ingredients.find((i) => i.id === r.ingredientId);
                return sum + (ing ? ing.costPerUnit * r.quantity : 0);
              }, 0);
              const profitMargin =
                prod.price > 0 ? Math.round(((prod.price - recipeCost) / prod.price) * 100) : 0;
              const hasRecipe = (prod.recipe || []).length > 0;

              return (
                <div
                  key={`${prod.id}-${pIdx}`}
                  className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4"
                >
                  {/* Product Header */}
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={prod.imageUrl}
                          alt={prod.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                        <div>
                          <h3 className="font-bold text-slate-900 text-sm">{prod.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-semibold text-slate-400 capitalize">
                              {prod.category}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-800">
                              Venta: {businessProfile.currency}{prod.price}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {hasRecipe && (
                          <button
                            type="button"
                            onClick={() => setProductToClearRecipe(prod)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center transition-colors border border-transparent hover:border-rose-200"
                            title={`Borrar receta de ${prod.name} para comenzar de cero`}
                            aria-label={`Borrar receta de ${prod.name}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleOpenRecipeModal(prod)}
                          className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors border border-indigo-200"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>{hasRecipe ? 'Editar Receta' : 'Configurar'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Bottleneck / Theoretical Capacity Badge */}
                    {capacity && (
                      <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs">
                        <span className="text-slate-600 font-medium">Capacidad teórica inmediata:</span>
                        <div className="text-right">
                          <span className="font-mono font-bold text-slate-900">
                            {capacity.servings.toLocaleString()} unidades
                          </span>
                          {capacity.bottleneck && (
                            <span className="text-[10px] text-amber-700 block">
                              Insumo limitante: {capacity.bottleneck.name} ({capacity.bottleneck.stock} {capacity.bottleneck.unit} disp.)
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Recipe Ingredients Breakdown */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>Insumos consumidos por cada venta:</span>
                      <span className="text-slate-500 font-normal text-[11px]">
                        {(prod.recipe || []).length} insumos en receta
                      </span>
                    </div>

                    {(!prod.recipe || prod.recipe.length === 0) ? (
                      <div className="p-3 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                        Sin receta configurada. Este producto no descuenta insumos centrales.
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        {prod.recipe.map((r, idx) => {
                          const ing = ingredients.find((i) => i.id === r.ingredientId);
                          const singleCost = ing ? Number((ing.costPerUnit * r.quantity).toFixed(2)) : 0;
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-2 rounded-lg bg-slate-50/80 text-xs border border-slate-100"
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                <span className="font-semibold text-slate-800 truncate">
                                  {ing?.name || 'Insumo desconocido'}
                                </span>
                              </div>
                              <div className="flex items-center gap-3 shrink-0 font-mono">
                                <span className="font-bold text-amber-900">
                                  {r.quantity} {ing?.unit}
                                </span>
                                <span className="text-slate-400 text-[11px]">
                                  ({businessProfile.currency}{singleCost})
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Insumos Vinculados a Opciones del Cliente (Modificadores) */}
                  {(() => {
                    const linkedOptions: Array<{
                      groupTitle: string;
                      optionName: string;
                      ingName: string;
                      quantity: number;
                      unit: string;
                    }> = [];

                    prod.optionGroups?.forEach((g) => {
                      g.options.forEach((opt) => {
                        if (opt.extraIngredientId) {
                          const ing = ingredients.find((i) => i.id === opt.extraIngredientId);
                          linkedOptions.push({
                            groupTitle: g.title,
                            optionName: opt.name,
                            ingName: ing?.name || 'Insumo central',
                            quantity: opt.extraIngredientQuantity || 1,
                            unit: ing?.unit || 'unidad',
                          });
                        }
                      });
                    });

                    if (linkedOptions.length === 0) return null;

                    return (
                      <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                          <span className="flex items-center gap-1 text-[11px] text-amber-900">
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            <span>Insumos en Opciones del Cliente:</span>
                          </span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            {linkedOptions.length} vinculados
                          </span>
                        </div>

                        <div className="space-y-1">
                          {linkedOptions.map((lo, i) => (
                            <div
                              key={i}
                              className="flex items-center justify-between p-1.5 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px]"
                            >
                              <div className="truncate pr-2">
                                <span className="font-semibold text-slate-800">{lo.optionName}</span>
                                <span className="text-slate-500 text-[10px] ml-1">({lo.groupTitle})</span>
                              </div>
                              <div className="font-mono font-bold text-amber-900 shrink-0">
                                -{lo.quantity} {lo.unit}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Recipe Cost Summary */}
                  <div className="border-t border-slate-100 pt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Costo Teórico Receta:</span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {businessProfile.currency}{recipeCost.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block text-[11px]">Margen Bruto Receta:</span>
                      <span
                        className={`font-mono font-bold text-sm ${
                          profitMargin >= 60
                            ? 'text-emerald-700'
                            : profitMargin >= 40
                            ? 'text-slate-800'
                            : 'text-amber-700'
                        }`}
                      >
                        {profitMargin}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VISTA 3: STOCK DE MOSTRADOR / UNIDADES DIRECTAS */}
      {/* ========================================================================= */}
      {activeSubTab === 'productos' && (
        <div className="space-y-5">
          {/* Inventory Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Producto</th>
                    <th className="py-3 px-4">Categoría</th>
                    <th className="py-3 px-4">Costo Producción</th>
                    <th className="py-3 px-4">Precio Venta</th>
                    <th className="py-3 px-4">Margen %</th>
                    <th className="py-3 px-4">Existencias Mostrador</th>
                    <th className="py-3 px-4 text-center">Ajuste Rápido (+ / -)</th>
                    <th className="py-3 px-4">Estado Stock</th>
                    <th className="py-3 px-4 text-center">Visibilidad Catálogo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((product, pIdx) => {
                    const margin =
                      product.price > 0
                        ? Math.round(
                            ((product.price - product.costPrice) / product.price) * 100
                          )
                        : 0;

                    const isOut = product.stock <= 0;
                    const isLow = !isOut && product.stock <= product.minStockAlert;

                    return (
                      <tr key={`${product.id}-${pIdx}`} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0 border border-slate-200"
                              referrerPolicy="no-referrer"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <div className="min-w-0">
                              <div className="font-bold text-slate-900 truncate max-w-xs">
                                {product.name}
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                ID: {product.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-4 text-slate-600">
                          <div>{product.category}</div>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {product.type.replace('_', ' ')}
                          </span>
                        </td>

                        <td className="py-3 px-4 font-mono text-slate-600">
                          {businessProfile.currency}{product.costPrice}
                        </td>

                        <td className="py-3 px-4 font-mono font-bold text-slate-900">
                          {businessProfile.currency}{product.price}
                        </td>

                        <td className="py-3 px-4 font-mono font-semibold">
                          <span
                            className={
                              margin >= 50
                                ? 'text-emerald-700'
                                : margin >= 30
                                ? 'text-slate-800'
                                : 'text-amber-700'
                            }
                          >
                            {margin}%
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={product.stock}
                              onChange={(e) =>
                                updateProduct(product.id, {
                                  stock: Math.max(0, parseInt(e.target.value) || 0),
                                })
                              }
                              className="w-16 px-2 py-1 border border-slate-300 rounded font-mono font-bold text-slate-900 text-center text-xs"
                            />
                            <span className="text-[10px] text-slate-400">
                              (min: {product.minStockAlert})
                            </span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() => adjustStock(product.id, -1)}
                              className="w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                              title="Restar 1"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustStock(product.id, 1)}
                              className="w-7 h-7 rounded border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                              title="Sumar 1"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => adjustStock(product.id, 10)}
                              className="px-1.5 h-7 rounded border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700 transition-colors"
                              title="Sumar 10 unidades"
                            >
                              +10
                            </button>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          {isOut ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <AlertTriangle className="w-3 h-3" />
                              Agotado
                            </span>
                          ) : isLow ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" />
                              Bajo Stock
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              Óptimo
                            </span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => toggleProductAvailability(product.id)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold inline-flex items-center gap-1.5 transition-all shadow-2xs ${
                              product.available === false
                                ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-bold'
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
                            }`}
                            title={
                              product.available === false
                                ? 'Producto Oculto · Haz clic para activarlo y mostrarlo en el catálogo'
                                : 'Producto Visible · Haz clic para desactivarlo y ocultarlo del catálogo de clientes'
                            }
                          >
                            {product.available === false ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5 text-amber-600" />
                                <span>Oculto</span>
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Visible</span>
                              </>
                            )}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CREAR / EDITAR INGREDIENTE O INSUMO */}
      {/* ========================================================================= */}
      {isIngredientModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Scale className="w-4 h-4 text-slate-700" />
                <span>
                  {editingIngredient ? 'Editar Insumo Central' : 'Nuevo Insumo en Catálogo Central'}
                </span>
              </h3>
              <button
                type="button"
                onClick={() => setIsIngredientModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Nombre del Insumo *
                </label>
                <input
                  type="text"
                  required
                  value={ingName}
                  onChange={(e) => setIngName(e.target.value)}
                  placeholder="Ej. Aceite esencial de lavanda, Toalla facial, Crema hidratante..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Unidad de Medida
                  </label>
                  <select
                    value={ingUnit}
                    onChange={(e) => setIngUnit(e.target.value as IngredientUnit)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="g">Gramos (g)</option>
                    <option value="kg">Kilogramos (kg)</option>
                    <option value="ml">Mililitros (ml)</option>
                    <option value="l">Litros (l)</option>
                    <option value="unidad">Unidades / Piezas</option>
                    <option value="oz">Onzas (oz)</option>
                    <option value="porcion">Porción</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Categoría
                  </label>
                  <input
                    type="text"
                    value={ingCategory}
                    onChange={(e) => setIngCategory(e.target.value)}
                    placeholder="Ej. Aceites, Cosméticos, Descartables, Esencias..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Stock Central
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={ingStock}
                    onChange={(e) => setIngStock(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Alerta Mínima
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ingMinAlert}
                    onChange={(e) => setIngMinAlert(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Costo x {ingUnit}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={ingCost}
                    onChange={(e) => setIngCost(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Proveedor de Origen (Opcional)
                </label>
                <input
                  type="text"
                  value={ingSupplier}
                  onChange={(e) => setIngSupplier(e.target.value)}
                  placeholder="Ej. Finca Las Nubes, Distribuidora Central..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsIngredientModalOpen(false)}
                  className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-xs"
                >
                  {editingIngredient ? 'Guardar Cambios' : 'Registrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: REABASTECIMIENTO RÁPIDO / ENTRADA DE INSUMO */}
      {/* ========================================================================= */}
      {restockIngredient && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 bg-amber-50 flex items-center justify-between">
              <h3 className="font-bold text-amber-950 text-sm flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-amber-700" />
                <span>Entrada de Insumo a Bodega</span>
              </h3>
              <button
                type="button"
                onClick={() => setRestockIngredient(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRestock} className="p-5 space-y-4 text-xs">
              <div>
                <span className="text-slate-500 block">Insumo a reabastecer:</span>
                <span className="font-bold text-slate-900 text-sm block mt-0.5">
                  {restockIngredient.name}
                </span>
                <span className="text-[11px] text-slate-400 font-mono block">
                  Stock actual: {restockIngredient.stock} {restockIngredient.unit}
                </span>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Cantidad a ingresar ({restockIngredient.unit}) *
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="any"
                  required
                  value={restockAmount}
                  onChange={(e) => setRestockAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-lg text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Quick presets */}
              <div className="flex items-center gap-1.5">
                {[
                  restockIngredient.unit === 'g' ? 500 : restockIngredient.unit === 'ml' ? 1000 : 10,
                  restockIngredient.unit === 'g' ? 1000 : restockIngredient.unit === 'ml' ? 5000 : 50,
                  restockIngredient.unit === 'g' ? 5000 : restockIngredient.unit === 'ml' ? 10000 : 100,
                ].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setRestockAmount(amt)}
                    className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-md font-mono text-[11px] font-bold"
                  >
                    +{amt} {restockIngredient.unit}
                  </button>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRestockIngredient(null)}
                  className="px-3 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-colors shadow-xs"
                >
                  Confirmar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: EDITOR DE RECETA RÁPIDO PARA UN PRODUCTO */}
      {/* ========================================================================= */}
      {recipeModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <ChefHat className="w-4 h-4 text-amber-600" />
                  <span>Ficha Técnica / Receta: {recipeModalProduct.name}</span>
                </h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Configura qué insumos del catálogo central consume cada unidad vendida.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRecipeModalProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700">Insumos Requeridos:</span>
                <div className="flex items-center gap-2">
                  {editingRecipe.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setEditingRecipe([])}
                      className="px-2.5 py-1 text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg font-bold flex items-center gap-1 transition-colors"
                      title="Vaciar todos los insumos de esta receta para configurarla desde cero"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                      <span>Vaciar Receta</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (ingredients.length === 0) return;
                      const available =
                        ingredients.find((i) => !editingRecipe.some((r) => r.ingredientId === i.id)) ||
                        ingredients[0];
                      setEditingRecipe((prev) => [
                        ...prev,
                        { ingredientId: available.id, quantity: 1 },
                      ]);
                    }}
                    className="px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-lg font-bold flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar Insumo</span>
                  </button>
                </div>
              </div>

              {editingRecipe.length === 0 ? (
                <div className="p-6 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center text-slate-400">
                  No hay insumos asociados. Pulsa "+ Agregar Insumo" para empezar.
                </div>
              ) : (
                <div className="space-y-2">
                  {editingRecipe.map((item, idx) => {
                    const ing = ingredients.find((i) => i.id === item.ingredientId);
                    return (
                      <div
                        key={idx}
                        className="flex flex-col sm:flex-row sm:items-center gap-2 p-2.5 bg-slate-50 border border-slate-200 rounded-xl overflow-hidden"
                      >
                        <div className="flex-1 min-w-0">
                          <label className="text-[10px] text-slate-500 block mb-0.5">
                            Insumo Central:
                          </label>
                          <select
                            value={item.ingredientId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              setEditingRecipe((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, ingredientId: newId } : r))
                              );
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium truncate"
                          >
                            {ingredients.map((i) => (
                              <option key={i.id} value={i.id}>
                                {i.name} ({i.unit}) — Disp: {i.stock.toLocaleString()} {i.unit}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-28 shrink-0">
                          <label className="text-[10px] text-slate-500 block mb-0.5">
                            Porción ({ing?.unit}):
                          </label>
                          <input
                            type="number"
                            min="0.01"
                            step="any"
                            value={item.quantity}
                            onChange={(e) => {
                              const qty = Math.max(0.01, parseFloat(e.target.value) || 0);
                              setEditingRecipe((prev) =>
                                prev.map((r, i) => (i === idx ? { ...r, quantity: qty } : r))
                              );
                            }}
                            className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg font-mono font-bold text-xs"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingRecipe((prev) => prev.filter((_, i) => i !== idx));
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg self-end sm:self-auto sm:mt-4 transition-colors"
                          title="Quitar insumo"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Recipe Cost Calculation */}
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-950">
                <span>Costo estimado total de insumos:</span>
                <span className="font-mono font-bold text-sm">
                  {businessProfile.currency}
                  {editingRecipe
                    .reduce((sum, r) => {
                      const ing = ingredients.find((i) => i.id === r.ingredientId);
                      return sum + (ing ? ing.costPerUnit * r.quantity : 0);
                    }, 0)
                    .toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setRecipeModalProduct(null)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveRecipeModal}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-xs"
              >
                Guardar Ficha Técnica
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAR BORRAR TODAS LAS RECETAS */}
      {/* ========================================================================= */}
      {isClearAllRecipesModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-rose-50/50">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ¿Borrar todas las recetas configuradas?
                </h3>
                <p className="text-xs text-slate-500">
                  Esta acción no se puede deshacer.
                </p>
              </div>
            </div>

            <div className="p-5 space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>
                Al confirmar, se vaciarán las recetas de los{' '}
                <strong className="text-slate-900">
                  {products.filter((p) => (p.recipe || []).length > 0).length} productos
                </strong>{' '}
                que actualmente tienen insumos asociados.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-900 text-[11px] space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <ChefHat className="w-3.5 h-3.5 text-amber-700" />
                  <span>Empezar desde cero</span>
                </div>
                <p>
                  Tus productos y el catálogo central de insumos seguirán intactos. Podrás ir producto por producto ingresando las recetas exactas que utilice tu negocio.
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsClearAllRecipesModalOpen(false)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllRecipes();
                  setIsClearAllRecipesModalOpen(false);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sí, borrar todas las recetas</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: CONFIRMAR BORRAR RECETA DE UN PRODUCTO INDIVIDUAL */}
      {/* ========================================================================= */}
      {productToClearRecipe && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-rose-50/50">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">
                  ¿Borrar receta de este producto?
                </h3>
                <p className="text-xs text-slate-500 font-medium truncate max-w-[200px]">
                  {productToClearRecipe.name}
                </p>
              </div>
            </div>

            <div className="p-5 text-xs text-slate-600 leading-relaxed">
              <p>
                Se eliminarán los{' '}
                <strong className="text-slate-900">
                  {(productToClearRecipe.recipe || []).length} insumos
                </strong>{' '}
                asociados a la ficha técnica de este producto para que puedas cargarla desde cero.
              </p>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setProductToClearRecipe(null)}
                className="px-3.5 py-2 text-slate-600 hover:bg-slate-200 rounded-xl font-semibold transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  clearProductRecipe(productToClearRecipe.id);
                  setProductToClearRecipe(null);
                }}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Vaciar receta</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
