import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

interface User {
    _id: string;
    name: string;
    email: string;
    fullName?: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    logout: () => void;
    makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const API_BASE_URL = getApiBaseUrl();

    useEffect(() => {
        console.log('🔗 API Base URL:', API_BASE_URL);

        // Check for existing token on app load
        const savedToken = localStorage.getItem('jwt_token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                setIsAuthenticated(true);
                console.log('✅ Restored authentication from localStorage');
            } catch (error) {
                console.warn('⚠️ Invalid stored auth data, clearing...');
                // Clear invalid data
                localStorage.removeItem('jwt_token');
                localStorage.removeItem('user');
            }
        }
    }, [API_BASE_URL]);

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            console.log('🔐 Attempting login with:', { email, password: '***' });
            console.log('📡 Login URL:', `${API_BASE_URL}/auth/login`);

            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            console.log('📊 Login response status:', response.status);
            const data = await response.json();
            console.log('📋 Login response data:', data);

            if (response.ok) {
                // Handle different possible response structures
                const token = data.token || data.accessToken || data.jwt;
                const userInfo = data.user || data.data || data;

                if (token && userInfo) {
                    const userData = {
                        _id: userInfo._id || userInfo.id,
                        name: userInfo.fullName || userInfo.name || userInfo.email,
                        email: userInfo.email,
                        fullName: userInfo.fullName || userInfo.name
                    };

                    console.log('✅ Setting user data:', userData);

                    setToken(token);
                    setUser(userData);
                    setIsAuthenticated(true);

                    // Save to localStorage
                    localStorage.setItem('jwt_token', token);
                    localStorage.setItem('user', JSON.stringify(userData));

                    return true;
                } else {
                    console.error('❌ Missing token or user data in response:', data);
                    return false;
                }
            } else {
                console.error('❌ Login failed with status:', response.status, 'Data:', data);
                return false;
            }
        } catch (error) {
            console.error('💥 Login error:', error);
            return false;
        }
    };

    const logout = () => {
        console.log('👋 Logging out user');
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('jwt_token');
        localStorage.removeItem('user');
    };

    const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}): Promise<Response> => {
        // Convert relative URLs to absolute URLs
        const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url.startsWith('/') ? url.slice(4) : `/${url}`}`;

        console.log('🌐 Making authenticated request to:', fullUrl);

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
            ...options.headers as Record<string, string>,
        };

        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
            ...options,
            headers,
        });

        // If token is invalid, logout
        if (response.status === 401) {
            console.warn('🔒 Token expired or invalid, logging out');
            logout();
        }

        return response;
    };

    const value: AuthContextType = {
        user,
        isAuthenticated,
        login,
        logout,
        makeAuthenticatedRequest,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};