'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase';
import { AdminProtected } from '../components/AdminProtected';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';

interface Product {
  id: string;
  name: string;
  price: number;
  createdBy: string;
  createdAt: Date;
}

function firestoreTimestampToDate(timestamp: Timestamp | undefined): Date | undefined {
  if (!timestamp) return undefined;
  return new Date(timestamp?.seconds * 1000);
}

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth(app);
  const functions = getFunctions(app);

  const [products, setProducts] = useState<Product[]>([]);
  const [productName, setProductName] = useState('');
  const [productPrice, setProductPrice] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  // If user is not authenticated, redirect to signin page
  useEffect(() => {
    if (!user) {
      router.push('/signin');
    }
  }, [user, router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleCreateProduct = async (productName: string, productPrice: number) => {
    console.log('Product name:', productName);
    console.log('Product price:', productPrice);
    const createProductFunction = httpsCallable<any, { data: Product }>(functions, 'createProduct');
    const result = await createProductFunction({name: productName, price: productPrice});
    const { data } = result.data;
    console.log('Product data:', data);
    fetchProducts();
  };

  //directly from firebase
  const fetchProducts = async () => {    
    try {
      const db = getFirestore(app);
      const productRef = collection(db, 'products');

      try {
        const querySnapshot = await getDocs(productRef);
        
        const fetchedProduct: Product[] = [];
        querySnapshot.forEach((doc) => {
          const productData = doc.data() as Product;
          fetchedProduct.push({
            id: productData.id,
            name: productData.name,
            price: productData.price,
            createdBy: productData.createdBy,
            createdAt: productData.createdAt,
          });
        });
        
        setProducts(fetchedProduct);
      } catch (permissionError) {
        console.error('Permission error fetching products:', permissionError);                
      }
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <AdminProtected>
      <div className="min-h-screen bg-gray-100">
        {/* Dashboard Header */}
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold text-indigo-600 mr-10">
                SaaS Template
              </Link>
              <nav className="hidden md:flex space-x-8">
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Dashboard</a>
                <a href="#" className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium">Settings</a>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{user.email}</span>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Sign Out
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center sm:text-left">
              <h1 className="text-3xl font-bold text-gray-900">User Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700">
                Welcome to your dashboard. This is a template dashboard page that you can customize for your application.
              </p>
            </div>

            {/* Dashboard Stats */}
            <div className="mt-8">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {/* Stat Card 1 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">1,234</dd>
                  </div>
                </div>
                
                {/* Stat Card 2 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Projects</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">12</dd>
                  </div>
                </div>
                
                {/* Stat Card 3 */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <dt className="text-sm font-medium text-gray-500 truncate">Completion Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-gray-900">98.5%</dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Create Product Form */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Create New Product</h2>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-6 py-4">
              <form className="space-y-4">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                      Product Name
                    </label>
                    <input
                      onChange={(e) => setProductName(e.target.value)}
                      type="text"
                      name="productName"
                      id="productName"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Enter product name"
                    />
                  </div>

                  <div className="col-span-2">
                    <label htmlFor="productPrice" className="block text-sm font-medium text-gray-700">
                      Price
                    </label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">$</span>
                      </div>
                      <input
                        onChange={(e) => setProductPrice(e.target.value)}
                        type="number"
                        name="productPrice"
                        id="productPrice"
                        className="pl-7 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="0.00"
                        step="0.01"
                      />
                    </div>
                  </div>
                </div>

                <button                  
                  onClick={(e) => {
                    e.preventDefault();
                    handleCreateProduct(productName, Number(productPrice));
                  }}
                  type="button"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Create Product
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Products</h2>
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Name
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id}>                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {product.createdBy}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {firestoreTimestampToDate(product.createdAt as any)?.toLocaleString()}
                    </td> 
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
    </AdminProtected>
  );
}