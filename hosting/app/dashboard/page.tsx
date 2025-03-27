'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { app } from '../firebase';
import { AdminProtected } from '../components/AdminProtected';
import Link from 'next/link';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

interface Product {
  name: string;
  price: number;
}

interface Data {
    userId: string;
    userEmail: string;
    secretKey: string;
    product: Product;
} 

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const auth = getAuth(app);
  const functions = getFunctions(app);

  const [data, setData] = useState<Data | null>(null);
  const [products, setProducts] = useState<Product[]>([]);  

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

  //directly from firebase
  const fetchProducts = async () => {    
    try {
      const db = getFirestore(app);
      const productRef = collection(db, 'products');

      try {
        const querySnapshot = await getDocs(productRef);
        
        const fetchedProduct: Product[] = [];
        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          fetchedProduct.push({
            name: productData.name,
            price: productData.price,
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

  async function getProduct() {
    const getProductFunction = httpsCallable<any, { data: Data }>(functions, 'getProduct');
    const result = await getProductFunction();
    const { data } = result.data;
    console.log('Product data:', data);
    setData(data);
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
                  <tr key={product.name}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${product.price.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
          <button
            onClick={getProduct}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Call Function
          </button>

          {/* Single Product Display */}
          {data && (
            <div className="mt-4 bg-white shadow overflow-hidden rounded-lg">
              <div className="px-6 py-4">
                <h3 className="text-lg font-medium text-gray-900">User ID: {data.userId}</h3>
                <h3 className="text-lg font-medium text-gray-900">User Email: {data.userEmail}</h3>
                <h3 className="text-lg font-medium text-gray-900">Secret Key: {data.secretKey}</h3>
                <h3 className="text-lg font-medium text-gray-900">{data.product.name}</h3>
                <p className="mt-1 text-sm text-gray-500">${data.product.price.toFixed(2)}</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
    </AdminProtected>
  );
}