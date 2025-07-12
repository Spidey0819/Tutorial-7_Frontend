import React, { useState, useEffect } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import type { FormikHelpers } from 'formik';
import * as Yup from 'yup';
import { Mail, Lock, CheckCircle, AlertCircle, X, LogIn, Package, User, Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LoginFormData {
    email: string;
    password: string;
}

interface Toast {
    type: 'success' | 'error';
    title: string;
    message: string;
}

// Validation Schema
const loginSchema = Yup.object().shape({
    email: Yup.string()
        .email('Must be a valid email format')
        .required('Email is required')
        .lowercase()
        .trim(),

    password: Yup.string()
        .required('Password is required')
        .min(6, 'Password must be at least 6 characters long'),
});

// Toast Component
interface ToastProps {
    toast: Toast | null;
    onClear: () => void;
}

const ToastComponent: React.FC<ToastProps> = ({ toast, onClear }) => {
    useEffect(() => {
        if (toast) {
            const timer = setTimeout(onClear, 4000);
            return () => clearTimeout(timer);
        }
    }, [toast, onClear]);

    if (!toast) return null;

    return (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 max-w-sm ${
            toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                    {toast.type === 'success' ? (
                        <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                    ) : (
                        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                        <p className="font-medium">{toast.title}</p>
                        <p className="text-sm opacity-90">{toast.message}</p>
                    </div>
                </div>
                <button onClick={onClear} className="ml-2 text-white hover:text-gray-200">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

// Input Field Component
interface InputFieldProps {
    name: string;
    type: string;
    placeholder: string;
    icon: React.ComponentType<{ className?: string }>;
}

const InputField: React.FC<InputFieldProps> = ({ name, type, placeholder, icon: Icon }) => {
    return (
        <div className="space-y-1">
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Icon className="h-5 w-5 text-gray-400" />
                </div>
                <Field
                    name={name}
                    type={type}
                    placeholder={placeholder}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
            </div>
            <ErrorMessage
                name={name}
                component="div"
                className="text-red-500 text-sm mt-1 flex items-center space-x-1"
            >
                {(msg: string) => (
                    <span className="flex items-center space-x-1">
                        <AlertCircle size={14} />
                        <span>{msg}</span>
                    </span>
                )}
            </ErrorMessage>
        </div>
    );
};

interface LoginFormProps {
    onPageChange?: (page: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onPageChange }) => {
    const [toast, setToast] = useState<Toast | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const { login, isAuthenticated, user, logout } = useAuth();

    const showToast = (type: 'success' | 'error', title: string, message: string): void => {
        setToast({ type, title, message });
    };

    const clearToast = (): void => {
        setToast(null);
    };

    const handleSubmit = async (
        values: LoginFormData,
        { setSubmitting, setFieldError, resetForm }: FormikHelpers<LoginFormData>
    ): Promise<void> => {
        setIsSubmitting(true);
        console.log('Login form submitted with values:', { email: values.email, password: '***' });
        
        try {
            const success = await login(values.email, values.password);
            
            if (success) {
                showToast('success', 'Login Successful', 'Welcome back! Redirecting...');
                resetForm();
                
                // Redirect to products page after successful login
                setTimeout(() => {
                    if (onPageChange) {
                        onPageChange('products');
                    }
                }, 1500); // Give time for the user to see the success message
                
            } else {
                showToast('error', 'Authentication Failed', 'Invalid email or password. Please check your credentials and try again.');
                setFieldError('password', 'Invalid credentials');
            }
        } catch (error) {
            console.error('Login submission error:', error);
            showToast('error', 'Connection Error', 'Unable to connect to the server. Please try again later.');
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };

    const handleLogout = () => {
        logout();
                        showToast('success', 'Logged Out', 'You have been successfully signed out.');
    };

    const initialValues: LoginFormData = {
        email: '',
        password: ''
    };

    // If user is already authenticated, show user dashboard
    if (isAuthenticated && user) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                        <div className="text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-green-100 rounded-full p-3">
                                    <CheckCircle className="h-12 w-12 text-green-600" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
                                Welcome Back
                            </h2>
                            <p className="text-sm text-gray-600 mb-4">
                                You are successfully authenticated
                            </p>
                            
                            {/* User Info Card */}
                            <div className="bg-blue-50 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center mb-2">
                                    <User className="h-5 w-5 text-blue-600 mr-2" />
                                    <span className="text-lg font-medium text-gray-900">
                                        {user.name}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    {user.email}
                                </p>
                                <div className="flex items-center justify-center mt-2">
                                    <Shield className="h-4 w-4 text-green-600 mr-1" />
                                    <span className="text-xs text-green-700 font-medium">
                                        Authenticated
                                    </span>
                                </div>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    onClick={() => onPageChange && onPageChange('products')}
                                    className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    <Package className="h-4 w-4 mr-2" />
                                    Access Products
                                </button>
                                
                                <button
                                    onClick={() => onPageChange && onPageChange('home')}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                                >
                                    Return to Home
                                </button>
                                
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                                >
                                    Sign Out
                                </button>
                            </div>
                            
                            {/* Feature Info */}
                            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                                <h3 className="text-sm font-medium text-gray-800 mb-2">
                                    Product Management Features
                                </h3>
                                <ul className="text-xs text-gray-600 space-y-1">
                                    <li>• Create and manage products</li>
                                    <li>• Edit product details and pricing</li>
                                    <li>• Organize with search and filters</li>
                                    <li>• Multiple view options available</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <ToastComponent toast={toast} onClear={clearToast} />
            </div>
        );
    }

    // Login form for unauthenticated users
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="bg-blue-100 rounded-full p-3">
                        <LogIn className="h-12 w-12 text-blue-600" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Sign In
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Access your product management dashboard
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
                    <Formik
                        initialValues={initialValues}
                        validationSchema={loginSchema}
                        onSubmit={handleSubmit}
                    >
                        {({ handleSubmit, isSubmitting: formSubmitting }) => (
                            <div className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <InputField
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email address"
                                        icon={Mail}
                                    />
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <InputField
                                        name="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        icon={Lock}
                                    />
                                </div>

                                <div>
                                    <button
                                        type="button"
                                        onClick={() => handleSubmit()}
                                        disabled={isSubmitting || formSubmitting}
                                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        {(isSubmitting || formSubmitting) ? (
                                            <div className="flex items-center space-x-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Signing In</span>
                                            </div>
                                        ) : (
                                            <div className="flex items-center space-x-2">
                                                <LogIn className="h-4 w-4" />
                                                <span>Sign In</span>
                                            </div>
                                        )}
                                    </button>
                                </div>

                                {/* Additional Info */}
                                <div className="mt-6 text-center">
                                    <p className="text-sm text-gray-600">
                                        Don't have an account?{' '}
                                        <button
                                            type="button"
                                            onClick={() => onPageChange && onPageChange('register')}
                                            className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                                        >
                                            Create one here
                                        </button>
                                    </p>
                                </div>
                            </div>
                        )}
                    </Formik>
                </div>
            </div>

            <ToastComponent toast={toast} onClear={clearToast} />
        </div>
    );
};

export default LoginForm;