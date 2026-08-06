import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingCart, Trash2, Plus, Minus, Printer, Settings, LucideIceCream, LucidePopsicle, LucideCoffee, LucideCakeSlice, LucideCherry, LucideStar, LogOut, Maximize, Minimize, X, ChevronUp } from 'lucide-react';
import { TAX_RATE } from './constants';
import { Product, CartItem, Order, ReportData } from './types';
import PaymentModal from './components/PaymentModal';
import Receipt from './components/Receipt';
import ReportReceipt from './components/ReportReceipt';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import { useStore } from './context/StoreContext';

// Helper to map icon types to components
const getCategoryIcon = (iconType: string) => {
  switch (iconType) {
    case 'ICE_CREAM': return <LucideIceCream className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'POPSICLE': return <LucidePopsicle className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'COFFEE': return <LucideCoffee className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'CAKE': return <LucideCakeSlice className="w-5 h-5 sm:w-6 sm:h-6" />;
    case 'CHERRY': return <LucideCherry className="w-5 h-5 sm:w-6 sm:h-6" />;
    default: return <LucideStar className="w-5 h-5 sm:w-6 sm:h-6" />;
  }
};

const App: React.FC = () => {
  const { products, categories, businessName, addOrder } = useStore();
  
  // Auth & Roles State
  const [currentUser, setCurrentUser] = useState<'ADMIN' | 'CAJERO' | null>(null);
  const [showSwitchPrompt, setShowSwitchPrompt] = useState(false);

  const [currentCategory, setCurrentCategory] = useState<string>(categories[0]?.id || '');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lastOrder, setLastOrder] = useState<Order | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);
  
  const [printType, setPrintType] = useState<'RECEIPT' | 'REPORT'>('RECEIPT');
  const [reportToPrint, setReportToPrint] = useState<{data: ReportData, filter: string, timeframe: string} | null>(null);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Inactivity Lock Logic
  useEffect(() => {
    if (!currentUser) return; // Don't track if already locked/logged out

    let timeout: NodeJS.Timeout;
    const resetTimer = () => {
      clearTimeout(timeout);
      // Lock after 2 minutes of inactivity
      timeout = setTimeout(() => {
        setCurrentUser(null);
        setIsAdminOpen(false); // Close admin panel if open
      }, 120000);
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(e => document.addEventListener(e, resetTimer));
    resetTimer();

    return () => {
      clearTimeout(timeout);
      events.forEach(e => document.removeEventListener(e, resetTimer));
    };
  }, [currentUser]);

  // Trigger print automatically when lastOrder updates
  useEffect(() => {
    if (lastOrder) {
      setPrintType('RECEIPT');
      const timer = setTimeout(() => {
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lastOrder]);
  
  const handlePrintReport = (report: ReportData, filter: string, timeframe: string) => {
    setReportToPrint({ data: report, filter, timeframe });
    setPrintType('REPORT');
    setTimeout(() => {
      window.print();
    }, 500);
  };

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

  const cartCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
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

    const order: Order = {
      id: Date.now().toString(),
      items: [...cart],
      subtotal: cartTotal / (1 + TAX_RATE),
      tax: cartTotal - (cartTotal / (1 + TAX_RATE)),
      total: cartTotal,
      date: new Date(),
      paymentMethod: method,
      receivedAmount,
      change: method === 'EFECTIVO' ? receivedAmount - cartTotal : 0
    };

    addOrder(order);
    setCart([]);
    setIsPaymentModalOpen(false);
    setIsMobileCartOpen(false);
    setLastOrder(order);
    setIsProcessing(false);
  };

  const handleReprint = () => {
    if (lastOrder) {
      setPrintType('RECEIPT');
      setTimeout(() => {
        window.print();
      }, 100);
    }
  };

  // --- SECURITY LAYER ---
  if (!currentUser) {
    return <LoginScreen onLogin={(role) => setCurrentUser(role)} />;
  }

  if (showSwitchPrompt) {
    return (
      <div className="fixed inset-0 z-[100]">
        <LoginScreen 
          onLogin={(role) => {
            setCurrentUser(role);
            setShowSwitchPrompt(false);
          }} 
          message="Cambiar de usuario" 
        />
        <button 
          onClick={() => setShowSwitchPrompt(false)}
          className="absolute top-4 right-4 bg-white p-4 rounded-full shadow-lg text-gray-500 font-bold"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-gray-100 overflow-hidden font-sans relative">
      
      {/* Hidden Receipt Component - rendered at root level for printing */}
      {printType === 'RECEIPT' ? (
        <Receipt order={lastOrder} />
      ) : (
        <ReportReceipt 
          report={reportToPrint?.data || null} 
          filter={reportToPrint?.filter || 'ALL'} 
          timeframe={reportToPrint?.timeframe || 'DAY'} 
        />
      )}

      {/* Main Content Area (Menu) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative min-w-0">
        
        {/* Top Header */}
        <header className="bg-white px-3 py-2.5 sm:px-4 sm:py-4 shadow-sm flex justify-between items-center z-10 shrink-0">
          <div 
            onClick={() => {
              if (currentUser === 'CAJERO') {
                setShowSwitchPrompt(true);
              }
            }}
            className={`min-w-0 pr-2 ${currentUser === 'CAJERO' ? 'cursor-pointer select-none' : ''}`}
          >
            <h1 className="text-lg sm:text-2xl font-display font-bold text-pink-600 truncate">{businessName} 🍦</h1>
            <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">
              {currentUser === 'ADMIN' ? 'Administrador' : 'Cajero 1'}
            </p>
          </div>
          <div className="flex items-center gap-2 sm:gap-6 shrink-0">
             <div className="text-right hidden sm:block">
                <div className="text-lg sm:text-xl font-bold text-gray-700">
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="text-xs sm:text-sm text-gray-500 hidden md:block">
                  {new Date().toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
                </div>
             </div>
             
             <div className="flex items-center gap-1.5 sm:gap-2">
               <button
                 onClick={toggleFullscreen}
                 className="p-2 sm:p-3 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                 title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
               >
                 {isFullscreen ? <Minimize className="w-4 h-4 sm:w-5 sm:h-5" /> : <Maximize className="w-4 h-4 sm:w-5 sm:h-5" />}
               </button>
               {/* Admin Button - Only visible to ADMIN */}
               {currentUser === 'ADMIN' && (
                 <button 
                   onClick={() => setIsAdminOpen(true)}
                   className="p-2 sm:p-3 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600 transition-colors"
                   title="Administración"
                 >
                   <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
               )}
  
               <button 
                 onClick={() => setCurrentUser(null)}
                 className="p-2 sm:p-3 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
                 title="Cerrar Sesión / Bloquear"
               >
                 <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
               </button>
             </div>
          </div>
        </header>

        {/* Categories Bar */}
        <div className="bg-white border-b overflow-x-auto whitespace-nowrap p-2 flex gap-2 shrink-0 no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCurrentCategory(cat.id)}
              className={`
                flex items-center gap-2 px-3.5 py-2.5 sm:px-6 sm:py-4 rounded-xl transition-all duration-200 outline-none shrink-0
                ${currentCategory === cat.id 
                  ? `${cat.color} shadow-md scale-105 ring-2 ring-opacity-50 ring-offset-1` 
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-transparent'
                }
              `}
            >
              {getCategoryIcon(cat.iconType)}
              <span className="font-bold text-sm sm:text-lg">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-4 pb-28 lg:pb-20">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                className={`
                  relative h-32 sm:h-48 rounded-xl sm:rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between items-start text-left
                  shadow-xs hover:shadow-md active:scale-95 duration-100 border
                  ${product.color} border-opacity-20 bg-opacity-70
                `}
              >
                <div className="w-full">
                  <span className="font-display font-bold text-sm sm:text-xl leading-tight text-gray-800 block mb-1 line-clamp-2">
                    {product.name}
                  </span>
                </div>
                <div className="w-full flex justify-between items-end">
                   <span className="bg-white/80 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-md sm:rounded-lg font-bold text-gray-900 text-sm sm:text-lg shadow-xs">
                     ${product.price}
                   </span>
                   <div className="w-7 h-7 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center text-pink-500 shadow-xs">
                     <Plus className="w-4 h-4 sm:w-6 sm:h-6" strokeWidth={3} />
                   </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Floating Order Bar on Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-md border-t shadow-2xl z-20 flex items-center justify-between gap-2">
          <button 
            onClick={() => setIsMobileCartOpen(true)}
            className="flex items-center gap-2 bg-pink-50 text-pink-700 px-3 py-2.5 rounded-xl border border-pink-200 font-bold text-sm"
          >
            <div className="relative">
              <ShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Orden ({cartCount})</span>
            <ChevronUp size={16} />
          </button>

          <button 
            disabled={cart.length === 0}
            onClick={() => setIsPaymentModalOpen(true)}
            className="flex-1 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-2.5 px-4 rounded-xl font-bold text-base shadow-md transition-all disabled:opacity-40 disabled:shadow-none text-center"
          >
            Cobrar ${cartTotal}
          </button>
        </div>
      </div>

      {/* Cart Sidebar / Drawer Modal on Mobile */}
      <div 
        className={`
          fixed lg:static inset-0 z-40 lg:z-20 bg-white shadow-2xl flex flex-col h-full border-l
          transition-transform duration-300 ease-in-out
          ${isMobileCartOpen ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'}
          ${!isMobileCartOpen ? 'hidden lg:flex' : 'flex'}
          lg:w-96 w-full
        `}
      >
        <div className="p-4 bg-gray-50 border-b flex justify-between items-center shrink-0">
          <h2 className="text-lg sm:text-xl font-bold flex items-center gap-2 text-gray-700">
            <ShoppingCart className="text-pink-500" />
            Orden Actual ({cartCount})
          </h2>
          <div className="flex items-center gap-2">
            <button 
              onClick={clearCart} 
              disabled={cart.length === 0}
              className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-30 transition-colors"
              title="Vaciar carrito"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={() => setIsMobileCartOpen(false)}
              className="lg:hidden p-2 text-gray-500 hover:bg-gray-200 rounded-lg transition-colors"
              title="Cerrar"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-4 py-8">
              <ShoppingCart size={64} />
              <p className="text-lg font-medium">Carrito Vacío</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-xs">
                <div className="flex-1 min-w-0 pr-2">
                  <h3 className="font-bold text-gray-800 text-sm sm:text-base truncate">{item.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">${item.price} c/u</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                   <button 
                    onClick={() => updateQuantity(item.id, -1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-red-100 text-gray-600 hover:text-red-600 transition-colors"
                   >
                     <Minus size={14} />
                   </button>
                   <span className="font-bold text-base sm:text-lg w-5 sm:w-6 text-center">{item.quantity}</span>
                   <button 
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-green-100 text-gray-600 hover:text-green-600 transition-colors"
                   >
                     <Plus size={14} />
                   </button>
                </div>
                <div className="ml-3 font-bold text-gray-900 w-14 sm:w-16 text-right text-sm sm:text-base">
                  ${(item.price * item.quantity).toFixed(0)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals Section */}
        <div className="p-4 sm:p-6 bg-gray-50 border-t shrink-0">
           <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4 text-sm sm:text-base">
             <div className="flex justify-between text-gray-500">
               <span>Subtotal</span>
               <span>${(cartTotal / (1 + TAX_RATE)).toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-gray-500">
               <span>IVA (16%)</span>
               <span>${(cartTotal - (cartTotal / (1 + TAX_RATE))).toFixed(2)}</span>
             </div>
             <div className="flex justify-between text-xl sm:text-2xl font-bold text-gray-900 pt-2 border-t border-gray-200">
               <span>Total</span>
               <span>${cartTotal.toFixed(2)}</span>
             </div>
           </div>

           <div className="grid grid-cols-4 gap-2">
              <button 
                disabled={cart.length === 0}
                onClick={() => setIsPaymentModalOpen(true)}
                className="col-span-3 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white py-3.5 sm:py-4 rounded-xl font-bold text-lg sm:text-xl shadow-lg shadow-green-200 transition-all disabled:opacity-50 disabled:shadow-none"
              >
                Cobrar ${cartTotal}
              </button>
              
              <button
                onClick={handleReprint}
                disabled={!lastOrder}
                className="col-span-1 bg-white border-2 border-gray-200 text-gray-600 rounded-xl flex items-center justify-center hover:bg-gray-50 disabled:opacity-30"
                title="Reimprimir último ticket"
              >
                <Printer size={22} />
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
        <AdminPanel 
          onClose={() => setIsAdminOpen(false)} 
          onPrintReport={handlePrintReport}
        />
      )}
    </div>
  );
};

export default App;