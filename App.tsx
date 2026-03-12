import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Printer, Settings, LucideIceCream, LucidePopsicle, LucideCoffee, LucideCakeSlice, LucideCherry, LucideStar } from 'lucide-react';
import { TAX_RATE } from './constants';
import { Product, CartItem, Order } from './types';
import PaymentModal from './components/PaymentModal';
import Receipt from './components/Receipt';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import { generateReceiptMessage } from './services/geminiService';
import { useStore } from './context/StoreContext';

// Helper to map icon types to components
const getCategoryIcon = (iconType: string) => {
  switch (iconType) {
    case 'ICE_CREAM': return <LucideIceCream size={24} />;
    case 'POPSICLE': return <LucidePopsicle size={24} />;
    case 'COFFEE': return <LucideCoffee size={24} />;
    case 'CAKE': return <LucideCakeSlice size={24} />;
    case 'CHERRY': return <LucideCherry size={24} />;
    default: return <LucideStar size={24} />;
  }
};

const App: React.FC = () => {
  const { products, categories, businessName, addOrder } = useStore();
  
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [currentCategory, setCurrentCategory] = useState<string>(categories[0]?.id || '');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Trigger print automatically when lastOrder updates
  useEffect(() => {
    if (lastOrder) {
      // Timeout ensures the Receipt component has re-rendered with the new data
      // and the modal has fully closed before the print dialog steals focus.
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lastOrder]);

  // Update current category if it doesn't exist anymore
  useMemo(() => {
    if (!categories.find(c => c.id === currentCategory) && categories.length > 0) {
      setCurrentCategory(categories[0].id);
    }
  }, [categories, currentCategory]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => p.category === currentCategory);
  }, [currentCategory, products]);

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === id) {
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      }).filter(item => item.quantity > 0);
    });
  };

  const clearCart = () => setCart([]);

  const handlePayment = async (method: 'EFECTIVO' | 'TARJETA', receivedAmount: number) => {
    setIsProcessing(true);
    
    // Generate AI message for receipt
    // This is awaited, so the spinner will show until this finishes
    const aiMessage = await generateReceiptMessage(cart);

    const order: Order = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal: cartTotal / (1 + TAX_RATE),
      tax: cartTotal - (cartTotal / (1 + TAX_RATE)),
      total: cartTotal,
      date: new Date(),
      paymentMethod: method,
      receivedAmount,
      change: method === 'EFECTIVO' ? receivedAmount - cartTotal : 0,
      aiMessage
    };

    // 1. Save to history
    addOrder(order); 
    
    // 2. Clear cart and close modal
    setCart([]);
    setIsPaymentModalOpen(false);
    
    // 3. Set lastOrder to trigger the print useEffect
    setLastOrder(order);
    
    // 4. Stop processing state
    setIsProcessing(false);
  };

  const handleReprint = () => {
    if (lastOrder) window.print();
  };

  // --- SECURITY LAYER ---
  if (!isAuthenticated) {
    return <LoginScreen onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="flex h-screen w-full bg-gray-100 overflow-hidden font-sans">
      
      {/* Hidden Receipt Component - rendered at root level for printing */}
      <Receipt order={lastOrder} />

      {/* Main Content Area (Menu) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center z-10 shrink-0">
          <div>
            <h1 className="text-2xl font-display font-bold text-pink-600">{businessName} 🍦</h1>
            <p className="text-sm text-gray-500 font-medium">Turno de Mañana • Cajero 1</p>
          </div>
          <div className="flex items-center gap-6">
             <div className="text-right">
                <div className="text-xl font-bold text-gray-700">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-sm text-gray-500">
                  {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
             </div>
             <button 
               onClick={() => setIsAdminOpen(true)}
               className="p-3 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
               title="Administración"
             >
               <Settings size={20} />
             </button>
          </div>
        </header>

        {/* Categories Bar */}
        <div className="bg-white border-b overflow-x-auto whitespace-nowrap p-2 flex gap-2 shrink-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCurrentCategory(cat.id)}
              className={`
                flex items-center gap-2 px-6 py-4 rounded-xl transition-all duration-200 outline-none
                ${currentCategory === cat.id 
                  ? `${cat.color} shadow-md scale-105 ring-2 ring-opacity-50 ring-offset-1` 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'
                }
              `}
            >
              {getCategoryIcon(cat.iconType)}
              <span className="font-bold text-lg">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 pb-20">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className={`
                  relative h-48 rounded-2xl p-4 flex flex-col justify-between items-start text-left
                  shadow-sm hover:shadow-lg transition-all active:scale-95 duration-100 border
                  ${product.color} border-opacity-20 bg-opacity-70
                `}
              >
                <div className="w-full">
                  <span className="font-display font-bold text-xl leading-tight text-gray-800 block mb-1">
                    {product.name}
                  </span>
                </div>
                <div className="w-full flex justify-between items-end">
                   <span className="bg-white/80 backdrop-blur-sm px-3 py-1 rounded-lg font-bold text-gray-900 text-lg shadow-sm">
                     ${product.price}
                   </span>
                   <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-sm">
                     <Plus size={24} strokeWidth={3} />
                   </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Sidebar (Cart) */}
      <div className="w-96 bg-white shadow-2xl z-20 flex flex-col h-full border-l">
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-700">
            <ShoppingCart className="text-pink-500" />
            Orden Actual
          </h2>
          <button 
            onClick={clearCart} 
            disabled={cart.length === 0}
            className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors"
          >
            <Trash2 size={20} />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4">
              <ShoppingCart size={64} />
              <p className="text-lg font-medium">Carrito Vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-gray-800 truncate">{item.name}</h3>
                  <p className="text-sm text-gray-500">${item.price} c/u</p>
                </div>
                <div className="flex items-center gap-3">
                   <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                   >
                     <Minus size={16} />
                   </button>
                   <span className="font-bold text-lg w-6 text-center">{item.quantity}</span>
                   <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors"
                   >
                     <Plus size={16} />
                   </button>
                </div>
                <div className="ml-4 font-bold text-gray-900 w-16 text-right">
                  ${(item.price * item.quantity).toFixed(0)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals Section */}
        <div className="p-6 bg-gray-50 border-t shrink-0">
           <div className="space-y-2 mb-4">
             <div className="flex justify-between text-gray-500">
               <span>Subtotal</span>
               <span>${(cartTotal / (1 + TAX_RATE)).toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-gray-500">
               <span>IVA (16%)</span>
               <span>${(cartTotal - (cartTotal / (1 + TAX_RATE))).toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200">
               <span>Total</span>
               <span>${cartTotal.toFixed(2)}</span>
             </div>
           </div>

           <div className="grid grid-cols-4 gap-2">
              <button 
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className="col-span-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-4 rounded-xl font-bold text-xl shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Cobrar ${cartTotal}
              </button>
              
              <button
                onClick={handleReprint}
                disabled={!lastOrder}
                className="col-span-1 bg-white border-2 border-gray-200 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                title="Reimprimir último ticket"
              >
                <Printer size={24} />
              </button>
           </div>
        </div>
      </div>

      <PaymentModal 
        total={cartTotal}
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onConfirm={handlePayment}
        isProcessing={isProcessing}
      />
      
      {isAdminOpen && (
        <AdminPanel onClose={() => setIsAdminOpen(false)} />
      )}
    </div>
  );
};

export default App;