'use client';

import { useEffect, useState } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  seller: string;
  batteryLife?: string;
  age?: number;
  size?: string;
  material?: string;
  averageRating: number;
  totalReviews: number;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        setError('');
        const res = await fetch('https://cloud495the1.onrender.com/api/items');
        if (!res.ok) {
          throw new Error('Failed to fetch items');
        }
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error('Error fetching items:', err);
        setError('Failed to load items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'GPS Sport Watches', name: 'GPS Sport Watches' },
    { id: 'Antique Furniture', name: 'Antique Furniture' },
    { id: 'Vinyls', name: 'Vinyls' },
    { id: 'Running Shoes', name: 'Running Shoes' }
  ];

  const filteredItems = selectedCategory === 'all'
    ? items
    : items.filter(item => item.category === selectedCategory);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading items...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">E-Commerce Store</h1>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span className="text-gray-600">Welcome, {session.user?.name}</span>
                  <Link
                    href="https://cloud495the1.onrender.com/profile"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Profile
                  </Link>
                  {session.user?.role === 'admin' && (
                    <Link
                      href="https://cloud495the1.onrender.com/admin"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={() => {
                      signOut({ redirect: false }).then(() => {
                        window.location.href = 'https://cloud495the1.onrender.com/';
                      });
                    }}
                    className="text-red-600 hover:text-red-800"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <button
                  onClick={() => signIn(undefined, { callbackUrl: 'https://cloud495the1.onrender.com/' })}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-6">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Category
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full max-w-xs p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <Link 
              href={`https://cloud495the1.onrender.com/items/${item._id}`}
              key={item._id} 
              className="bg-white rounded-lg shadow-md p-4 flex gap-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <p className="mt-1 text-gray-600 text-sm line-clamp-2">{item.description}</p>
                <div className="mt-2 flex justify-between items-center">
                  <span className="text-lg font-bold text-gray-900">${item.price}</span>
                  <span className="text-sm text-gray-500">Stock: {item.stock}</span>
                </div>
                <div className="mt-2 text-sm text-gray-500">
                  {item.batteryLife && <p>Battery Life: {item.batteryLife}</p>}
                  {item.age && <p>Age: {item.age} years</p>}
                  {item.size && <p>Size: {item.size}</p>}
                  {item.material && <p>Material: {item.material}</p>}
                </div>
                <div className="mt-2 flex items-center">
                  <span className="text-yellow-400">★</span>
                  <span className="ml-1 text-sm text-gray-600">
                    {item.averageRating.toFixed(1)} ({item.totalReviews} reviews)
                  </span>
                </div>
              </div>

              <div className="relative w-32 h-32 flex-shrink-0">
                <Image
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  width={128}
                  height={128}
                  className="object-cover rounded-lg"
                  priority
                />
              </div>
            </Link>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No items found in this category.</p>
          </div>
        )}
      </main>
    </div>
  );
} 