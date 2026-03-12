import React, { useState, useMemo } from 'react';
import { X, Save, Plus, Trash2, Edit2, Store, Package, Layers, BarChart3, Upload, Image as ImageIcon, LucideIceCream, LucidePopsicle, LucideCoffee, LucideCakeSlice, LucideCherry, LucideStar } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, Category } from '../types';

interface AdminPanelProps {
  onClose: () => void;
}

const COLOR_PRESETS = [
  { label: 'Vainilla', class: 'bg-amber-50' },
  { label: 'Chocolate', class: 'bg-stone-200' },
  { label: 'Fresa', class: 'bg-red-50' },
  { label: 'Menta', class: 'bg-emerald-50' },
  { label: 'Limón', class: 'bg-lime-50' },
  { label: 'Azul', class: 'bg-blue-50' },
  { label: 'Morado', class: 'bg-purple-100' },
  { label: 'Naranja', class: 'bg-orange-100' },
  { label: 'Blanco', class: 'bg-white border-2' },
  { label: 'Gris', class: 'bg-slate-100' },
];

const CATEGORY_COLORS = [
  { label: 'Rosa', class: 'bg-pink-100 text-pink-700 border-pink-200' },
  { label: 'Amarillo', class: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { label: 'Azul', class: 'bg-blue-100 text-blue-700 border-blue-200' },
  { label: 'Morado', class: 'bg-purple-100 text-purple-700 border-purple-200' },
  { label: 'Verde', class: 'bg-green-100 text-green-700 border-green-200' },
  { label: 'Rojo', class: 'bg-red-100 text-red-700 border-red-200' },
  { label: 'Gris', class: 'bg-gray-100 text-gray-700 border-gray-200' },
];

// Helper to map icon types to components (Local version for Admin)
const getCategoryIcon = (iconType: string) => {
  switch (iconType) {
    case 'ICE_CREAM': return <LucideIceCream size={20} />;
    case 'POPSICLE': return <LucidePopsicle size={20} />;
    case 'COFFEE': return <LucideCoffee size={20} />;
    case 'CAKE': return <LucideCakeSlice size={20} />;
    case 'CHERRY': return <LucideCherry size={20} />;
    default: return <LucideStar size={20} />;
  }
};

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const { 
    products, 
    categories, 
    orders,
    businessName, 
    receiptLogo,
    updateBusinessName, 
    updateReceiptLogo,
    addProduct, 
    updateProduct, 
    deleteProduct,
    addCategory,
    updateCategory,
    deleteCategory
  } = useStore();

  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'CATEGORIES' | 'SETTINGS' | 'REPORTS'>('PRODUCTS');
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);

  // --- PRODUCT HANDLERS ---
  const handleSaveProduct = () => {
    if (!editingProduct || !editingProduct.name || !editingProduct.price || !editingProduct.category) return;

    if (editingProduct.id) {
      updateProduct(editingProduct as Product);
    } else {
      addProduct({
        ...editingProduct,
        id: Date.now().toString(),
        color: editingProduct.color || 'bg-white'
      } as Product);
    }
    setEditingProduct(null);
  };

  // --- CATEGORY HANDLERS ---
  const handleSaveCategory = () => {
    if (!editingCategory || !editingCategory.label) return;

    if (editingCategory.id) {
      updateCategory(editingCategory as Category);
    } else {
      addCategory({
        ...editingCategory,
        id: editingCategory.label?.toUpperCase().replace(/\s+/g, '_') || Date.now().toString(),
        iconType: editingCategory.iconType || 'STAR',
        color: editingCategory.color || CATEGORY_COLORS[0].class
      } as Category);
    }
    setEditingCategory(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        updateReceiptLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // --- REPORT CALCULATIONS ---
  const reports = useMemo(() => {
    const totalSales = orders.reduce((acc, order) => acc + order.total, 0);
    const totalOrders = orders.length;

    // Sales by Product
    const productSales: Record<string, {name: string, qty: number, total: number}> = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        if (!productSales[item.id]) {
          productSales[item.id] = { name: item.name, qty: 0, total: 0 };
        }
        productSales[item.id].qty += item.quantity;
        productSales[item.id].total += item.price * item.quantity;
      });
    });
    const sortedProducts = Object.values(productSales).sort((a, b) => b.total - a.total);

    // Sales by Date
    const dailySales: Record<string, number> = {};
    orders.forEach(order => {
      const dateKey = order.date.toLocaleDateString();
      dailySales[dateKey] = (dailySales[dateKey] || 0) + order.total;
    });

    return { totalSales, totalOrders, sortedProducts, dailySales };
  }, [orders]);

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-5xl h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="bg-gray-800 text-white p-4 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display font-bold">Administración</h2>
            <span className="bg-gray-700 px-2 py-1 rounded text-xs text-gray-300">Backend</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-700 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs & Content Container */}
        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar */}
          <div className="w-48 bg-gray-50 border-r flex flex-col p-2 gap-1 shrink-0">
             <button 
              onClick={() => setActiveTab('PRODUCTS')}
              className={`p-3 rounded-lg flex items-center gap-2 font-medium text-left ${activeTab === 'PRODUCTS' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Package size={20} /> Productos
            </button>
            <button 
              onClick={() => setActiveTab('CATEGORIES')}
              className={`p-3 rounded-lg flex items-center gap-2 font-medium text-left ${activeTab === 'CATEGORIES' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Layers size={20} /> Categorías
            </button>
            <button 
              onClick={() => setActiveTab('REPORTS')}
              className={`p-3 rounded-lg flex items-center gap-2 font-medium text-left ${activeTab === 'REPORTS' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <BarChart3 size={20} /> Reportes
            </button>
            <button 
              onClick={() => setActiveTab('SETTINGS')}
              className={`p-3 rounded-lg flex items-center gap-2 font-medium text-left ${activeTab === 'SETTINGS' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-200'}`}
            >
              <Store size={20} /> Tienda
            </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto p-6 bg-gray-100">
            
            {/* PRODUCTS TAB */}
            {activeTab === 'PRODUCTS' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Catálogo de Productos</h3>
                  <button 
                    onClick={() => setEditingProduct({ name: '', price: 0, category: categories[0]?.id, color: 'bg-white' })}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 shadow-sm"
                  >
                    <Plus size={20} /> Nuevo Producto
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                      <tr>
                        <th className="p-4">Producto</th>
                        <th className="p-4">Categoría</th>
                        <th className="p-4">Precio</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {products.map(product => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="p-4 font-medium flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full border shadow-sm ${product.color}`}></div>
                            {product.name}
                          </td>
                          <td className="p-4 text-gray-500">
                            {categories.find(c => c.id === product.category)?.label || product.category}
                          </td>
                          <td className="p-4 font-bold text-green-700">${product.price.toFixed(2)}</td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingProduct(product)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                <Edit2 size={18} />
                              </button>
                              <button onClick={() => { if(confirm('¿Eliminar producto?')) deleteProduct(product.id) }} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* CATEGORIES TAB */}
            {activeTab === 'CATEGORIES' && (
              <div className="space-y-4">
                 <div className="flex justify-between items-center mb-4">
                  <h3 className="text-2xl font-bold text-gray-800">Gestión de Categorías</h3>
                  <button 
                    onClick={() => setEditingCategory({ label: '', iconType: 'STAR', color: CATEGORY_COLORS[0].class })}
                    className="bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-green-600 shadow-sm"
                  >
                    <Plus size={20} /> Nueva Categoría
                  </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                      <tr>
                        <th className="p-4">Icono</th>
                        <th className="p-4">Nombre (ID)</th>
                        <th className="p-4">Estilo</th>
                        <th className="p-4 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {categories.map(cat => (
                        <tr key={cat.id} className="hover:bg-gray-50">
                          <td className="p-4">
                             <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cat.color}`}>
                                {getCategoryIcon(cat.iconType)}
                             </div>
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-gray-800">{cat.label}</div>
                            <div className="text-xs text-gray-400 font-mono">{cat.id}</div>
                          </td>
                          <td className="p-4">
                            <div className={`text-xs px-2 py-1 rounded border inline-block ${cat.color}`}>
                              Vista Previa
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button onClick={() => setEditingCategory(cat)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                                <Edit2 size={18} />
                              </button>
                              <button 
                                onClick={() => { if(confirm(`¿Eliminar categoría "${cat.label}"? Esto podría afectar productos asociados.`)) deleteCategory(cat.id) }} 
                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                                disabled={categories.length <= 1} // Prevent deleting last category
                                title={categories.length <= 1 ? "No puedes eliminar la última categoría" : "Eliminar"}
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* REPORTS TAB */}
            {activeTab === 'REPORTS' && (
              <div className="space-y-6">
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                       <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Ventas Totales</h4>
                       <p className="text-4xl font-bold text-green-600 mt-2">${reports.totalSales.toFixed(2)}</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                       <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Ordenes</h4>
                       <p className="text-4xl font-bold text-blue-600 mt-2">{reports.totalOrders}</p>
                    </div>
                 </div>

                 <div className="grid lg:grid-cols-2 gap-6">
                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                       <h3 className="font-bold text-lg mb-4 text-gray-800">Productos Más Vendidos</h3>
                       <div className="space-y-3">
                         {reports.sortedProducts.slice(0, 10).map((prod, i) => (
                           <div key={i} className="flex justify-between items-center">
                             <div className="flex items-center gap-2">
                               <span className="w-6 h-6 rounded bg-gray-100 text-xs flex items-center justify-center font-bold text-gray-500">{i+1}</span>
                               <span className="font-medium text-gray-700">{prod.name}</span>
                             </div>
                             <div className="text-right">
                               <span className="block font-bold">${prod.total.toFixed(2)}</span>
                               <span className="text-xs text-gray-400">{prod.qty} vendidos</span>
                             </div>
                           </div>
                         ))}
                         {reports.sortedProducts.length === 0 && <p className="text-gray-500 italic">No hay datos aún.</p>}
                       </div>
                    </div>

                    {/* Sales by Date */}
                    <div className="bg-white p-6 rounded-xl border shadow-sm">
                       <h3 className="font-bold text-lg mb-4 text-gray-800">Ventas Recientes (Por Día)</h3>
                       <div className="space-y-2">
                          {Object.entries(reports.dailySales).slice(-7).map(([date, total]) => (
                            <div key={date} className="flex items-center gap-2">
                               <div className="w-24 text-sm font-mono text-gray-500">{date}</div>
                               <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-green-500" 
                                    style={{ width: `${Math.min(100, (total / (Math.max(...Object.values(reports.dailySales)) || 1)) * 100)}%` }}
                                  ></div>
                               </div>
                               <div className="w-20 text-right font-bold text-sm">${total.toFixed(0)}</div>
                            </div>
                          ))}
                          {Object.keys(reports.dailySales).length === 0 && <p className="text-gray-500 italic">No hay datos aún.</p>}
                       </div>
                    </div>
                 </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'SETTINGS' && (
              <div className="max-w-xl mx-auto space-y-6">
                
                {/* Logo Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <ImageIcon className="text-blue-500" /> Logo del Ticket
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      {receiptLogo ? (
                         <div className="w-24 h-24 border rounded-lg p-2 flex items-center justify-center bg-gray-50 relative group">
                            <img src={receiptLogo} alt="Logo" className="max-w-full max-h-full object-contain" />
                            <button onClick={() => updateReceiptLogo(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600">
                              <X size={12} />
                            </button>
                         </div>
                      ) : (
                        <div className="w-24 h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                          <ImageIcon size={24} />
                          <span className="text-xs mt-1">Sin Logo</span>
                        </div>
                      )}
                      
                      <div className="flex-1">
                        <label className="cursor-pointer bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg flex items-center gap-2 w-fit transition-colors shadow-sm">
                          <Upload size={18} />
                          <span>Subir Imagen</span>
                          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Recomendado: Imágenes en blanco y negro (PNG/JPG), máx 200px de ancho.</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Name */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                  <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Store className="text-pink-500" /> Datos del Negocio
                  </h3>
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-700">Nombre del Establecimiento</label>
                    <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => updateBusinessName(e.target.value)}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500 outline-none text-lg font-bold"
                    />
                    <p className="text-sm text-gray-500">Este nombre aparecerá en el encabezado y en los tickets.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Product Modal Overlay */}
      {editingProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingProduct.id ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={editingProduct.name || ''} 
                  onChange={e => setEditingProduct(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Helado de Vainilla"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio</label>
                    <input 
                      type="number" 
                      value={editingProduct.price || ''} 
                      onChange={e => setEditingProduct(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="0.00"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select 
                      value={editingProduct.category || ''}
                      onChange={e => setEditingProduct(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color de Tarjeta</label>
                <div className="grid grid-cols-5 gap-2">
                  {COLOR_PRESETS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditingProduct(prev => ({ ...prev, color: preset.class }))}
                      className={`h-8 rounded-full border shadow-sm transition-transform hover:scale-110 ${preset.class} ${editingProduct.color === preset.class ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}
                      title={preset.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setEditingProduct(null)}
                className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveProduct}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                <Save size={18} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal Overlay */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">{editingCategory.id ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <input 
                  type="text" 
                  value={editingCategory.label || ''} 
                  onChange={e => setEditingCategory(prev => ({ ...prev, label: e.target.value }))}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Ej. Gelatos Especiales"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Icono</label>
                <div className="grid grid-cols-6 gap-2">
                  {['ICE_CREAM', 'POPSICLE', 'COFFEE', 'CAKE', 'CHERRY', 'STAR'].map((iconType) => (
                    <button
                      key={iconType}
                      onClick={() => setEditingCategory(prev => ({ ...prev, iconType: iconType as any }))}
                      className={`h-12 rounded-lg border flex items-center justify-center transition-all ${editingCategory.iconType === iconType ? 'bg-blue-100 border-blue-500 text-blue-700 ring-2 ring-blue-200' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      {getCategoryIcon(iconType)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Color del Tema</label>
                <div className="grid grid-cols-4 gap-2">
                  {CATEGORY_COLORS.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setEditingCategory(prev => ({ ...prev, color: preset.class }))}
                      className={`h-10 rounded-lg border text-xs font-bold transition-transform hover:scale-105 ${preset.class} ${editingCategory.color === preset.class ? 'ring-2 ring-gray-400 ring-offset-1' : ''}`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => setEditingCategory(null)}
                className="flex-1 py-2 text-gray-600 font-bold hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSaveCategory}
                className="flex-1 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors flex justify-center items-center gap-2"
              >
                <Save size={18} /> Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;