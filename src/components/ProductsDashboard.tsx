import React, { useEffect, useState } from 'react';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Plus, Edit2, Trash2, X, Package, Search, Grid, List, CheckCircle, AlertCircle, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Product {
    _id: string;
    id: string;
    title: string;
    image: string;
    description: string;
    price: number;
    createdAt: string;
    createdBy: string;
}

interface ProductFormData {
    title: string;
    image: string;
    description: string;
    price: number | string;
}

interface Toast {
    type: 'success' | 'error';
    message: string;
}

// Environment-based API URL configuration
const getApiBaseUrl = (): string => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_API_URL || 'https://your-backend-app.onrender.com/api';
    } else {
        return import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
    }
};

const productSchema = Yup.object().shape({
    title: Yup.string().required('Title is required').min(2, 'Title must be at least 2 characters'),
    image: Yup.string().url('Must be a valid URL').required('Image URL is required'),
    description: Yup.string().required('Description is required').min(10, 'Description must be at least 10 characters'),
    price: Yup.number().positive('Price must be a positive number').required('Price is required'),
});

// Toast Component
const Toast: React.FC<{ toast: Toast | null; onClear: () => void }> = ({ toast, onClear }) => {
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
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    {toast.type === 'success' ? (
                        <CheckCircle size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <span>{toast.message}</span>
                </div>
                <button onClick={onClear} className="ml-2 text-white hover:text-gray-200">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

// Loading Spinner
const Spinner: React.FC = () => (
    <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
);

// Product Modal
const ProductModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSubmit: (values: ProductFormData) => void;
    isSubmitting: boolean;
}> = ({ isOpen, onClose, product, onSubmit, isSubmitting }) => {
    if (!isOpen) return null;

    const initialValues: ProductFormData = {
        title: product?.title || '',
        image: product?.image || 'https://via.placeholder.com/300x200',
        description: product?.description || '',
        price: product?.price || '',
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">
                        {product ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                        disabled={isSubmitting}
                    >
                        <X size={24} />
                    </button>
                </div>

                <Formik
                    initialValues={initialValues}
                    validationSchema={productSchema}
                    onSubmit={(values, { setSubmitting }) => {
                        onSubmit(values);
                        setSubmitting(false);
                    }}
                    enableReinitialize
                >
                    {({ handleSubmit, values }) => (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Product Title
                                </label>
                                <Field
                                    name="title"
                                    placeholder="Enter product title"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Image URL
                                </label>
                                <Field
                                    name="image"
                                    placeholder="https://example.com/image.jpg"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <ErrorMessage name="image" component="div" className="text-red-500 text-sm mt-1" />
                                {values.image && (
                                    <div className="mt-2">
                                        <img
                                            src={values.image}
                                            alt="Preview"
                                            className="w-full h-32 object-cover rounded"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Invalid+Image';
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <Field
                                    as="textarea"
                                    name="description"
                                    placeholder="Enter product description"
                                    rows={4}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Price ($)
                                </label>
                                <Field
                                    name="price"
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <ErrorMessage name="price" component="div" className="text-red-500 text-sm mt-1" />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    disabled={isSubmitting}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleSubmit()}
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center space-x-2"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            <span>Saving...</span>
                                        </>
                                    ) : (
                                        <span>{product ? 'Update Product' : 'Create Product'}</span>
                                    )}
                                </button>
                            </div>
                        </div>
                    )}
                </Formik>
            </div>
        </div>
    );
};

// Product Card
const ProductCard: React.FC<{
    product: Product;
    onEdit: (product: Product) => void;
    onDelete: (productId: string) => void;
    viewMode: 'grid' | 'list';
}> = ({ product, onEdit, onDelete, viewMode }) => {
    if (viewMode === 'list') {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center space-x-4">
                <img
                    src={product.image}
                    alt={product.title}
                    className="w-20 h-20 object-cover rounded-lg"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80x80?text=No+Image';
                    }}
                />
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800">{product.title}</h3>
                    <p className="text-gray-600 text-sm line-clamp-2">{product.description}</p>
                    <p className="text-xl font-bold text-green-600 mt-1">${product.price}</p>
                </div>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(product)}
                        className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 flex items-center space-x-1"
                    >
                        <Edit2 size={16} />
                        <span>Edit</span>
                    </button>
                    <button
                        onClick={() => onDelete(product.id)}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-1"
                    >
                        <Trash2 size={16} />
                        <span>Delete</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
            <img
                src={product.image}
                alt={product.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Image+Not+Found';
                }}
            />
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{product.title}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{product.description}</p>
                <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-green-600">${product.price}</span>
                    <div className="flex space-x-2">
                        <button
                            onClick={() => onEdit(product)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 flex items-center space-x-1"
                        >
                            <Edit2 size={14} />
                            <span>Edit</span>
                        </button>
                        <button
                            onClick={() => onDelete(product.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 flex items-center space-x-1"
                        >
                            <Trash2 size={14} />
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Main Products Dashboard Component
const ProductsDashboard: React.FC = () => {
    const { user, isAuthenticated, makeAuthenticatedRequest } = useAuth();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState<Toast | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const showToast = (type: 'success' | 'error', message: string) => {
        setToast({ type, message });
    };

    const clearToast = () => {
        setToast(null);
    };

    // Fetch products
    const fetchProducts = async () => {
        if (!isAuthenticated) return;

        setLoading(true);
        try {
            const response = await makeAuthenticatedRequest('/products');
            const data = await response.json();

            if (response.ok) {
                setProducts(data.products || []);
            } else {
                showToast('error', data.error || 'Failed to fetch products');
            }
        } catch (error) {
            showToast('error', 'Network error while fetching products');
            console.error('Fetch products error:', error);
        } finally {
            setLoading(false);
        }
    };

    // Create product
    const handleCreateProduct = async (values: ProductFormData) => {
        setIsSubmitting(true);
        try {
            const response = await makeAuthenticatedRequest('/products', {
                method: 'POST',
                body: JSON.stringify(values),
            });
            const data = await response.json();

            if (response.ok) {
                setProducts(prev => [...prev, data.product]);
                showToast('success', 'Product created successfully!');
                setModalOpen(false);
            } else {
                showToast('error', data.error || 'Failed to create product');
            }
        } catch (error) {
            showToast('error', 'Network error while creating product');
            console.error('Create product error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Update product
    const handleEditProduct = async (values: ProductFormData) => {
        if (!editingProduct) return;

        setIsSubmitting(true);
        try {
            const response = await makeAuthenticatedRequest(`/products/${editingProduct.id}`, {
                method: 'PUT',
                body: JSON.stringify(values),
            });
            const data = await response.json();

            if (response.ok) {
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? data.product : p));
                showToast('success', 'Product updated successfully!');
                setModalOpen(false);
                setEditingProduct(null);
            } else {
                showToast('error', data.error || 'Failed to update product');
            }
        } catch (error) {
            showToast('error', 'Network error while updating product');
            console.error('Update product error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete product
    const handleDeleteProduct = async (productId: string) => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;

        try {
            const response = await makeAuthenticatedRequest(`/products/${productId}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (response.ok) {
                setProducts(prev => prev.filter(p => p.id !== productId));
                showToast('success', 'Product deleted successfully!');
            } else {
                showToast('error', data.error || 'Failed to delete product');
            }
        } catch (error) {
            showToast('error', 'Network error while deleting product');
            console.error('Delete product error:', error);
        }
    };

    const openEditModal = (product: Product) => {
        setEditingProduct(product);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditingProduct(null);
    };

    // Filter products based on search
    const filteredProducts = products.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        fetchProducts();
    }, [isAuthenticated]);

    // Show authentication required message if not logged in
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="bg-white p-8 rounded-lg shadow-md text-center max-w-md">
                    <Lock className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Authentication Required</h2>
                    <p className="text-gray-600 mb-4">
                        Please log in to access the Products Dashboard.
                    </p>
                    <div className="text-sm text-gray-500">
                        Use the Login page to authenticate and gain access to product management features.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                                <Package className="h-8 w-8 text-blue-600" />
                                <span>Products Dashboard</span>
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Welcome back, <span className="font-medium">{user?.name}</span>!
                                Manage your products here.
                            </p>
                        </div>
                        <div className="mt-4 md:mt-0">
                            <button
                                onClick={() => setModalOpen(true)}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 transition-colors"
                            >
                                <Plus size={20} />
                                <span>Add Product</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Controls */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div className="text-sm text-gray-500">
                                {filteredProducts.length} of {products.length} products
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-400 hover:bg-gray-100'}`}
                            >
                                <List size={20} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && <Spinner />}

                {/* Products Grid/List */}
                {!loading && (
                    <>
                        {filteredProducts.length === 0 ? (
                            <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-xl font-medium text-gray-600 mb-2">
                                    {searchTerm ? 'No products found' : 'No products yet'}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm
                                        ? 'Try adjusting your search terms'
                                        : 'Get started by adding your first product!'
                                    }
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={() => setModalOpen(true)}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
                                    >
                                        <Plus size={20} />
                                        <span>Add Your First Product</span>
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className={viewMode === 'grid'
                                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
                                : 'space-y-4'
                            }>
                                {filteredProducts.map((product) => (
                                    <ProductCard
                                        key={product.id}
                                        product={product}
                                        onEdit={openEditModal}
                                        onDelete={handleDeleteProduct}
                                        viewMode={viewMode}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Product Modal */}
                <ProductModal
                    isOpen={modalOpen}
                    onClose={closeModal}
                    product={editingProduct}
                    onSubmit={editingProduct ? handleEditProduct : handleCreateProduct}
                    isSubmitting={isSubmitting}
                />

                {/* Toast */}
                <Toast toast={toast} onClear={clearToast} />
            </div>
        </div>
    );
};

export default ProductsDashboard;