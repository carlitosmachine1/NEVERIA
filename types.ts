
export interface Category {
  id: string;
  label: string;
  iconType: 'ICE_CREAM' | 'POPSICLE' | 'COFFEE' | 'CAKE' | 'CHERRY' | 'STAR';
  color: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string; // References Category.id
  color: string; // Tailwind color class helper
}

export interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  date: Date;
  paymentMethod: 'EFECTIVO' | 'TARJETA';
  receivedAmount?: number;
  change?: number;
}

export interface ReportData {
  totalSales: number;
  totalOrders: number;
  sortedProducts: { name: string; qty: number; total: number }[];
  dailySales: Record<string, number>;
  weeklySales: Record<string, number>;
  monthlySales: Record<string, number>;
}

export interface StoreState {
  businessName: string;
  address: string;
  phone: string;
  adminPin: string;
  cajeroPin: string;
  receiptLogo: string | null; // Base64 string for the image
  categories: Category[];
  products: Product[];
  orders: Order[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  addCategory: (category: Category) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  updateBusinessName: (name: string) => void;
  updateAddress: (address: string) => void;
  updatePhone: (phone: string) => void;
  updateAdminPin: (pin: string) => void;
  updateCajeroPin: (pin: string) => void;
  updateReceiptLogo: (base64: string | null) => void;
  addOrder: (order: Order) => void;
}
