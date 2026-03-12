
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
  aiMessage?: string;
}

export interface StoreState {
  businessName: string;
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
  updateReceiptLogo: (base64: string | null) => void;
  addOrder: (order: Order) => void;
}
