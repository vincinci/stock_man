import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Plus, Package, Tags, Trash2, Edit, LogOut } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';
import { supabase } from './supabase';
import type { Product, Category } from './types';
import Login from './pages/Login';
import EditProduct from './components/EditProduct';
import EditCategory from './components/EditCategory';

function Dashboard() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        supabase.from('products').select('*'),
        supabase.from('categories').select('*')
      ]);

      if (productsData.error) throw productsData.error;
      if (categoriesData.error) throw categoriesData.error;

      setProducts(productsData.data);
      setCategories(categoriesData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const addProduct = async (product: Omit<Product, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase.from('products').insert([{
        ...product,
        user_id: user.id
      }]);
      
      if (error) throw error;
      
      toast.success('Product added successfully');
      fetchData();
      setIsAddingProduct(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const addCategory = async (category: Omit<Category, 'id' | 'user_id' | 'created_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase.from('categories').insert([{
        ...category,
        user_id: user.id
      }]);
      
      if (error) throw error;
      
      toast.success('Category added successfully');
      fetchData();
      setIsAddingCategory(false);
    } catch (error) {
      console.error('Error adding category:', error);
      toast.error('Failed to add category');
    }
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      toast.success('Product deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const { error } = await supabase.from('categories').delete().eq('id', id);
      if (error) throw error;
      toast.success('Category deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete category');
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      <header className="bg-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Package size={32} />
              <h1 className="text-2xl font-bold">Stockman</h1>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 text-white hover:text-blue-100"
            >
              <LogOut size={20} />
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'products'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Package size={20} />
              <span>Products</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2 rounded-lg font-medium ${
              activeTab === 'categories'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-blue-600 hover:bg-blue-50'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Tags size={20} />
              <span>Categories</span>
            </div>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              {activeTab === 'products' ? 'Products' : 'Categories'}
            </h2>
            <button
              onClick={() =>
                activeTab === 'products'
                  ? setIsAddingProduct(true)
                  : setIsAddingCategory(true)
              }
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <Plus size={20} />
              <span>Add {activeTab === 'products' ? 'Product' : 'Category'}</span>
            </button>
          </div>

          {activeTab === 'products' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Price</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{product.category}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">{product.quantity}</td>
                      <td className="px-4 py-3 text-sm text-gray-800">${product.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/edit-product/${product.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteProduct(product.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-600">Name</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-800">{category.name}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => navigate(`/edit-category/${category.id}`)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => deleteCategory(category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Add Product Modal */}
          {isAddingProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add New Product</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addProduct({
                      name: formData.get('name') as string,
                      category: formData.get('category') as string,
                      quantity: Number(formData.get('quantity')),
                      price: Number(formData.get('price')),
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {categories.map((category) => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      required
                      min="0"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Price</label>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingProduct(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Add Product
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Add Category Modal */}
          {isAddingCategory && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-white rounded-lg p-6 w-full max-w-md">
                <h3 className="text-lg font-semibold mb-4">Add New Category</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    addCategory({
                      name: formData.get('name') as string,
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <input
                      type="text"
                      name="name"
                      required
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setIsAddingCategory(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Add Category
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={session ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/edit-product/:id" element={session ? <EditProduct /> : <Navigate to="/login" />} />
        <Route path="/edit-category/:id" element={session ? <EditCategory /> : <Navigate to="/login" />} />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;