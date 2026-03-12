import { Category, Product } from './types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'HELADOS', label: 'Helados', iconType: 'ICE_CREAM', color: 'bg-pink-100 text-pink-700 border-pink-200' },
  { id: 'PALETAS', label: 'Paletas', iconType: 'POPSICLE', color: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
  { id: 'BEBIDAS', label: 'Bebidas', iconType: 'COFFEE', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'POSTRES', label: 'Postres', iconType: 'CAKE', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  { id: 'TOPPINGS', label: 'Extras', iconType: 'CHERRY', color: 'bg-green-100 text-green-700 border-green-200' },
];

export const DEFAULT_PRODUCTS: Product[] = [
  // Helados
  { id: 'h1', name: 'Vainilla Clásica', price: 35, category: 'HELADOS', color: 'bg-amber-50' },
  { id: 'h2', name: 'Chocolate Belga', price: 40, category: 'HELADOS', color: 'bg-stone-200' },
  { id: 'h3', name: 'Fresa Natural', price: 35, category: 'HELADOS', color: 'bg-red-50' },
  { id: 'h4', name: 'Menta Granizada', price: 40, category: 'HELADOS', color: 'bg-emerald-50' },
  { id: 'h5', name: 'Dulce de Leche', price: 40, category: 'HELADOS', color: 'bg-orange-50' },
  { id: 'h6', name: 'Cookies & Cream', price: 45, category: 'HELADOS', color: 'bg-slate-100' },
  
  // Paletas
  { id: 'p1', name: 'Paleta de Agua Limón', price: 20, category: 'PALETAS', color: 'bg-lime-50' },
  { id: 'p2', name: 'Paleta de Leche Coco', price: 25, category: 'PALETAS', color: 'bg-slate-50' },
  { id: 'p3', name: 'Paleta Gourmet Nuez', price: 35, category: 'PALETAS', color: 'bg-amber-100' },
  { id: 'p4', name: 'Paleta Frutas', price: 22, category: 'PALETAS', color: 'bg-rose-50' },

  // Bebidas
  { id: 'b1', name: 'Malteada Chocolate', price: 65, category: 'BEBIDAS', color: 'bg-stone-100' },
  { id: 'b2', name: 'Malteada Fresa', price: 65, category: 'BEBIDAS', color: 'bg-pink-50' },
  { id: 'b3', name: 'Café Americano', price: 30, category: 'BEBIDAS', color: 'bg-stone-50' },
  { id: 'b4', name: 'Agua Mineral', price: 25, category: 'BEBIDAS', color: 'bg-blue-50' },
  
  // Postres
  { id: 'd1', name: 'Waffle Belga', price: 55, category: 'POSTRES', color: 'bg-yellow-50' },
  { id: 'd2', name: 'Crepa Dulce', price: 50, category: 'POSTRES', color: 'bg-orange-100' },
  { id: 'd3', name: 'Banana Split', price: 85, category: 'POSTRES', color: 'bg-yellow-100' },
  
  // Toppings
  { id: 't1', name: 'Chispas Chocolate', price: 10, category: 'TOPPINGS', color: 'bg-stone-200' },
  { id: 't2', name: 'Nuez Picada', price: 15, category: 'TOPPINGS', color: 'bg-amber-100' },
  { id: 't3', name: 'Cereza', price: 5, category: 'TOPPINGS', color: 'bg-red-200' },
  { id: 't4', name: 'Jarabe Chocolate', price: 10, category: 'TOPPINGS', color: 'bg-stone-300' },
];

export const TAX_RATE = 0.16; // 16% IVA example
