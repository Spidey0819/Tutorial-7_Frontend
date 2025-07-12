// src/store/actions.ts

import type { Dispatch } from 'redux';
import type {
    Product,
    ProductFormData,
    ProductActionTypes,
} from '../types';
import {
    CREATE_PRODUCT_REQUEST,
    CREATE_PRODUCT_SUCCESS,
    CREATE_PRODUCT_FAILURE,
    READ_PRODUCTS_REQUEST,
    READ_PRODUCTS_SUCCESS,
    READ_PRODUCTS_FAILURE,
    UPDATE_PRODUCT_REQUEST,
    UPDATE_PRODUCT_SUCCESS,
    UPDATE_PRODUCT_FAILURE,
    DELETE_PRODUCT_REQUEST,
    DELETE_PRODUCT_SUCCESS,
    DELETE_PRODUCT_FAILURE,
    CLEAR_TOAST,
} from '../types';

// Environment-based API URL configuration
const getApiBaseUrl = (): string => {
    // Check if we're in production or development
    if (import.meta.env.PROD) {
        // Production: Use your Render backend URL
        return import.meta.env.VITE_API_URL || 'https://your-backend-app.onrender.com/api';
    } else {
        // Development: Use local backend
        return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    }
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔗 Redux API Base URL:', API_BASE_URL);

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
    const token = localStorage.getItem('jwt_token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
    };
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url : `/${url}`}`;

    const headers = {
        ...getAuthHeaders(),
        ...options.headers,
    };

    console.log('📡 Making request to:', fullUrl);

    const response = await fetch(fullUrl, {
        ...options,
        headers,
    });

    // If token is invalid, clear localStorage and redirect
    if (response.status === 401) {
        console.warn('🔒 Unauthorized request, clearing auth data');
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
        // Redirect to login page if available
        if (typeof window !== 'undefined' && window.location) {
            window.location.href = '/login';
        }
    }

    return response;
};

// Action Creators
export const createProductRequest = (): ProductActionTypes => ({
    type: CREATE_PRODUCT_REQUEST,
});

export const createProductSuccess = (product: Product): ProductActionTypes => ({
    type: CREATE_PRODUCT_SUCCESS,
    payload: product,
});

export const createProductFailure = (error: string): ProductActionTypes => ({
    type: CREATE_PRODUCT_FAILURE,
    payload: error,
});

export const readProductsRequest = (): ProductActionTypes => ({
    type: READ_PRODUCTS_REQUEST,
});

export const readProductsSuccess = (products: Product[]): ProductActionTypes => ({
    type: READ_PRODUCTS_SUCCESS,
    payload: products,
});

export const readProductsFailure = (error: string): ProductActionTypes => ({
    type: READ_PRODUCTS_FAILURE,
    payload: error,
});

export const updateProductRequest = (): ProductActionTypes => ({
    type: UPDATE_PRODUCT_REQUEST,
});

export const updateProductSuccess = (product: Product): ProductActionTypes => ({
    type: UPDATE_PRODUCT_SUCCESS,
    payload: product,
});

export const updateProductFailure = (error: string): ProductActionTypes => ({
    type: UPDATE_PRODUCT_FAILURE,
    payload: error,
});

export const deleteProductRequest = (): ProductActionTypes => ({
    type: DELETE_PRODUCT_REQUEST,
});

export const deleteProductSuccess = (productId: string): ProductActionTypes => ({
    type: DELETE_PRODUCT_SUCCESS,
    payload: productId,
});

export const deleteProductFailure = (error: string): ProductActionTypes => ({
    type: DELETE_PRODUCT_FAILURE,
    payload: error,
});

export const clearToast = (): ProductActionTypes => ({
    type: CLEAR_TOAST,
});

// Async Action Creators (Thunks) with Authentication
export const fetchProducts = (page = 1, limit = 10, sort = '-createdAt', keyword = '') => {
    return async (dispatch: Dispatch<ProductActionTypes>) => {
        dispatch(readProductsRequest());
        try {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
                sort,
                ...(keyword && { keyword }),
            });

            const response = await makeAuthenticatedRequest(`/products?${queryParams}`);
            const data = await response.json();

            if (response.ok) {
                // Handle both pagination response and simple array response
                const products = data.products || data;
                dispatch(readProductsSuccess(products));
            } else {
                dispatch(readProductsFailure(data.error || 'Failed to fetch products'));
            }
        } catch (error) {
            console.error('Fetch products error:', error);
            dispatch(readProductsFailure('Network error: Unable to connect to server'));
        }
    };
};

export const createProduct = (productData: ProductFormData) => {
    return async (dispatch: Dispatch<ProductActionTypes>) => {
        dispatch(createProductRequest());
        try {
            const response = await makeAuthenticatedRequest('/products', {
                method: 'POST',
                body: JSON.stringify(productData),
            });
            const data = await response.json();

            if (response.ok) {
                dispatch(createProductSuccess(data.product));
            } else {
                dispatch(createProductFailure(data.error || 'Failed to create product'));
            }
        } catch (error) {
            console.error('Create product error:', error);
            dispatch(createProductFailure('Network error: Unable to connect to server'));
        }
    };
};

export const updateProduct = (productId: string, productData: Partial<ProductFormData>) => {
    return async (dispatch: Dispatch<ProductActionTypes>) => {
        dispatch(updateProductRequest());
        try {
            const response = await makeAuthenticatedRequest(`/products/${productId}`, {
                method: 'PUT',
                body: JSON.stringify(productData),
            });
            const data = await response.json();

            if (response.ok) {
                dispatch(updateProductSuccess(data.product));
            } else {
                dispatch(updateProductFailure(data.error || 'Failed to update product'));
            }
        } catch (error) {
            console.error('Update product error:', error);
            dispatch(updateProductFailure('Network error: Unable to connect to server'));
        }
    };
};

export const deleteProduct = (productId: string) => {
    return async (dispatch: Dispatch<ProductActionTypes>) => {
        dispatch(deleteProductRequest());
        try {
            const response = await makeAuthenticatedRequest(`/products/${productId}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (response.ok) {
                dispatch(deleteProductSuccess(productId));
            } else {
                dispatch(deleteProductFailure(data.error || 'Failed to delete product'));
            }
        } catch (error) {
            console.error('Delete product error:', error);
            dispatch(deleteProductFailure('Network error: Unable to connect to server'));
        }
    };
};

// Additional action for getting a single product
export const getProduct = (productId: string) => {
    return async () => {
        try {
            const response = await makeAuthenticatedRequest(`/products/${productId}`);
            const data = await response.json();

            if (response.ok) {
                return data.product;
            } else {
                throw new Error(data.error || 'Failed to fetch product');
            }
        } catch (error) {
            console.error('Get product error:', error);
            throw error;
        }
    };
};