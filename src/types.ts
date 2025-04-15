export interface Product {
  id: string;
  name: string;
  category: string;
  quantity: number;
  price: number;
  user_id: string;
  created_at?: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at?: string;
}

export interface User {
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
}