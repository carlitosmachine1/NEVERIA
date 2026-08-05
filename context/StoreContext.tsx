import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Category, StoreState, Order } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_PRODUCTS } from '../constants';

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [businessName, setBusinessName] = useState(() => {
    const saved = localStorage.getItem('pos_business_name');
    if (!saved || saved === "La Colonial" || saved === "Alonso Gringo" || saved === "ALONSO INC") {
      return "HelaPOS";
    }
    return saved;
  });

  const [address, setAddress] = useState(() => {
    return localStorage.getItem('pos_address') || "Av. Principal #123, Centro";
  });

  const [phone, setPhone] = useState(() => {
    return localStorage.getItem('pos_phone') || "555-0000";
  });

  const [adminPin, setAdminPin] = useState(() => {
    return localStorage.getItem('pos_admin_pin') || "1234";
  });

  const [cajeroPin, setCajeroPin] = useState(() => {
    return localStorage.getItem('pos_cajero_pin') || "0000";
  });

  const [receiptLogo, setReceiptLogo] = useState<string | null>(() => {
    return localStorage.getItem('pos_receipt_logo') || null;
  });
  
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('pos_categories');
    return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
  });

  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('pos_products');
    return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('pos_orders');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Rehydrate Date objects from strings
        return parsed.map((o: any) => ({
          ...o,
          date: new Date(o.date)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('pos_business_name', businessName);
    document.title = `${businessName} - Punto de Venta`;
  }, [businessName]);

  useEffect(() => {
    localStorage.setItem('pos_address', address);
  }, [address]);

  useEffect(() => {
    localStorage.setItem('pos_phone', phone);
  }, [phone]);

  useEffect(() => {
    localStorage.setItem('pos_admin_pin', adminPin);
  }, [adminPin]);

  useEffect(() => {
    localStorage.setItem('pos_cajero_pin', cajeroPin);
  }, [cajeroPin]);

  useEffect(() => {
    if (receiptLogo) {
      localStorage.setItem('pos_receipt_logo', receiptLogo);
    } else {
      localStorage.removeItem('pos_receipt_logo');
    }
  }, [receiptLogo]);

  useEffect(() => {
    localStorage.setItem('pos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('pos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('pos_orders', JSON.stringify(orders));
  }, [orders]);

  const addProduct = (product: Product) => {
    setProducts(prev => [...prev, product]);
  };

  const updateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const addCategory = (category: Category) => {
    setCategories(prev => [...prev, category]);
  };

  const updateCategory = (updatedCategory: Category) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };

  const deleteCategory = (id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  };

  const updateBusinessName = (name: string) => {
    setBusinessName(name);
  };

  const updateAddress = (newAddress: string) => {
    setAddress(newAddress);
  };

  const updatePhone = (newPhone: string) => {
    setPhone(newPhone);
  };

  const updateAdminPin = (pin: string) => {
    setAdminPin(pin);
  };

  const updateCajeroPin = (pin: string) => {
    setCajeroPin(pin);
  };

  const updateReceiptLogo = (base64: string | null) => {
    setReceiptLogo(base64);
  };

  const addOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]); // Add new order to start of list
  };

  return (
    <StoreContext.Provider value={{
      businessName,
      address,
      phone,
      adminPin,
      cajeroPin,
      receiptLogo,
      categories,
      products,
      orders,
      addProduct,
      updateProduct,
      deleteProduct,
      addCategory,
      updateCategory,
      deleteCategory,
      updateBusinessName,
      updateAddress,
      updatePhone,
      updateAdminPin,
      updateCajeroPin,
      updateReceiptLogo,
      addOrder
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
