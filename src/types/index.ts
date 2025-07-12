// src/types/index.ts

export interface Product {
    id: string;
    title: string;
    image: string;
    description: string;
    price: number;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: string;
    _id?: string;
}

export interface ProductFormData {
    title: string;
    image: string;
    description: string;
    price: number | string;
}

export interface Toast {
    type: 'success' | 'error';
    message: string;
}

export interface User {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
}

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
}