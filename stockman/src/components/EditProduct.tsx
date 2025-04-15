import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { supabase } from '../supabase';
import type { Product, Category } from '../types';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productResult, categoriesResult] = await Promise.all([
          supabase.from('products').select('*').eq('id', id).single(),
          supabase.from('categories').select('*')
        ]);

        if (productResult.error) throw productResult.error;
        if (categoriesResult.error) throw categoriesResult.error;

        // Verify user owns this product
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id !== productResult.data.user_id) {
          throw new Error('Unauthorized');
        }

        setProduct(productResult.data);
        setCategories(categoriesResult.data);
      } catch (err) {
        console.error('Error:', err);
        toast.error('Failed to load product');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!product) return;

    setLoading(true);

    try {
      const { error } = await supabase
        .from('products')
        .update({
          name: product.name,
          category: product.category,
          quantity: product.quantity,
          price: product.price
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Product updated successfully');
      navigate('/dashboard');
    } catch (err) {
      console.error('Error:', err);
      toast.error('Failed to update product');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-4">Loading...</div>;
  if (!product) return null;

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Edit Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={product.name}
            onChange={(e) => setProduct({ ...product, name: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Category</label>
          <select
            value={product.category}
            onChange={(e) => setProduct({ ...product, category: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
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
            value={product.quantity}
            onChange={(e) => setProduct({ ...product, quantity: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            value={product.price}
            onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            min="0"
            step="0.01"
          />
        </div>

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}