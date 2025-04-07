'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface User {
  _id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

interface NewUser {
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
}

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

interface NewItem {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  batteryLife: string;
  age: string;
  size: string;
  material: string;
}

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newUser, setNewUser] = useState<NewUser>({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'user'
  });
  const [newItem, setNewItem] = useState<NewItem>({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: 'GPS Sport Watches',
    batteryLife: '',
    age: '',
    size: '',
    material: ''
  });

  const categories = [
    'GPS Sport Watches',
    'Antique Furniture',
    'Vinyls',
    'Running Shoes'
  ];

  useEffect(() => {
    console.log('Session in admin page:', session);
    console.log('Status:', status);
    
    if (status === 'loading') return;
    
    if (!session) {
      console.log('No session, redirecting to login');
      router.push('/login');
      return;
    }
    
    if (session.user.role !== 'admin') {
      console.log('Not admin, redirecting to home');
      router.push('/');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        console.log('Fetching admin data...');
        const [usersRes, itemsRes] = await Promise.all([
          fetch('/api/admin/users', {
            headers: {
              'Cache-Control': 'no-cache'
            }
          }),
          fetch('/api/admin/items', {
            headers: {
              'Cache-Control': 'no-cache'
            }
          })
        ]);

        console.log('User response status:', usersRes.status);
        console.log('Items response status:', itemsRes.status);

        if (!usersRes.ok) {
          const errorData = await usersRes.json();
          throw new Error(`Failed to fetch users: ${errorData.error || usersRes.statusText}`);
        }

        if (!itemsRes.ok) {
          const errorData = await itemsRes.json();
          throw new Error(`Failed to fetch items: ${errorData.error || itemsRes.statusText}`);
        }

        const [usersData, itemsData] = await Promise.all([
          usersRes.json(),
          itemsRes.json()
        ]);

        console.log('Users data:', usersData);
        console.log('Items data:', itemsData);

        setUsers(usersData);
        setItems(itemsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(`Error fetching data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [session, status, router]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to create user');
      }

      const createdUser = await res.json();
      setUsers([...users, createdUser]);
      setNewUser({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'user'
      });
    } catch (err) {
      console.error('Error creating user:', err);
      setError('Failed to create user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const res = await fetch(`/api/admin/items/${itemId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Failed to delete item');
      }

      setItems(items.filter(item => item._id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Kategori bazlı resim URL'si seç
      let imageUrl;
      switch(newItem.category) {
        case 'GPS Sport Watches':
          imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop";
          break;
        case 'Antique Furniture':
          imageUrl = "https://images.unsplash.com/photo-1550226891-ef816aed4a98?q=80&w=1000&auto=format&fit=crop";
          break;
        case 'Vinyls':
          imageUrl = "https://images.unsplash.com/photo-1603048588665-791ca8aea617?q=80&w=1000&auto=format&fit=crop";
          break;
        case 'Running Shoes':
          imageUrl = "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=1000&auto=format&fit=crop";
          break;
        default:
          imageUrl = "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1000&auto=format&fit=crop";
      }

      const response = await fetch('/api/admin/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newItem.name,
          description: newItem.description,
          price: Number(newItem.price),
          stock: Number(newItem.stock),
          category: newItem.category,
          image: imageUrl,
          ...(newItem.category === 'GPS Sport Watches' && { batteryLife: newItem.batteryLife }),
          ...((['Antique Furniture', 'Vinyls'].includes(newItem.category)) && { age: Number(newItem.age) }),
          ...(newItem.category === 'Running Shoes' && { size: newItem.size }),
          ...((['Antique Furniture', 'Running Shoes'].includes(newItem.category)) && { material: newItem.material }),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create item');
      }

      // Reset form and refresh items
      setNewItem({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: 'GPS Sport Watches',
        batteryLife: '',
        age: '',
        size: '',
        material: ''
      });
      
      // Refresh items list
      const itemsResponse = await fetch('/api/admin/items');
      const items = await itemsResponse.json();
      setItems(items);
    } catch (error) {
      console.error('Error creating item:', error);
    }
  };

  if (status === 'loading' || loading) {
    return <div className="p-4">Loading...</div>;
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="space-x-4">
          <Link href="/" className="text-blue-500 hover:text-blue-700">
            Home
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-red-500 hover:text-red-700"
          >
            Sign Out
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold mb-4">Users</h2>
          <form onSubmit={handleCreateUser} className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Name"
                value={newUser.name}
                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="Username"
                value={newUser.username}
                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email"
                value={newUser.email}
                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={newUser.password}
                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <select
                value={newUser.role}
                onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="w-full p-2 border rounded"
                required
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add User
            </button>
          </form>

          <div className="space-y-4">
            {users.map(user => (
              <div
                key={user._id}
                className="border p-4 rounded shadow-sm flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                  <p className="text-sm text-gray-500">Role: {user.role}</p>
                </div>
                {user.role !== 'admin' && (
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Items</h2>
          <form onSubmit={handleSubmit} className="mb-6 space-y-4">
            <div>
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={e => setNewItem({ ...newItem, name: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <textarea
                placeholder="Description"
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Price"
                value={newItem.price}
                onChange={e => setNewItem({ ...newItem, price: e.target.value })}
                className="p-2 border rounded"
                min="0"
                step="0.01"
                required
              />
              <input
                type="number"
                placeholder="Stock"
                value={newItem.stock}
                onChange={e => setNewItem({ ...newItem, stock: e.target.value })}
                className="p-2 border rounded"
                min="0"
                required
              />
            </div>
            <div>
              <select
                value={newItem.category}
                onChange={e => {
                  const category = e.target.value;
                  setNewItem(prev => ({
                    ...prev,
                    category,
                    batteryLife: '',
                    age: '',
                    size: '',
                    material: ''
                  }));
                }}
                className="w-full p-2 border rounded"
                required
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            {newItem.category === 'GPS Sport Watches' && (
              <div>
                <input
                  type="text"
                  placeholder="Battery Life"
                  value={newItem.batteryLife}
                  onChange={e => setNewItem({ ...newItem, batteryLife: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            )}

            {['Antique Furniture', 'Vinyls'].includes(newItem.category) && (
              <div>
                <input
                  type="number"
                  placeholder="Age (years)"
                  value={newItem.age}
                  onChange={e => setNewItem({ ...newItem, age: e.target.value })}
                  className="w-full p-2 border rounded"
                  min="0"
                  required
                />
              </div>
            )}

            {newItem.category === 'Running Shoes' && (
              <div>
                <input
                  type="text"
                  placeholder="Size"
                  value={newItem.size}
                  onChange={e => setNewItem({ ...newItem, size: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            )}

            {['Antique Furniture', 'Running Shoes'].includes(newItem.category) && (
              <div>
                <input
                  type="text"
                  placeholder="Material"
                  value={newItem.material}
                  onChange={e => setNewItem({ ...newItem, material: e.target.value })}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
            >
              Add Item
            </button>
          </form>

          <div className="space-y-4">
            {items.map(item => (
              <div
                key={item._id}
                className="border p-4 rounded shadow-sm"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Price: ${item.price} | Stock: {item.stock}
                    </p>
                    <p className="text-sm text-gray-600">Category: {item.category}</p>
                    {item.batteryLife && (
                      <p className="text-sm text-gray-600">Battery Life: {item.batteryLife}</p>
                    )}
                    {item.age && (
                      <p className="text-sm text-gray-600">Age: {item.age} years</p>
                    )}
                    {item.size && (
                      <p className="text-sm text-gray-600">Size: {item.size}</p>
                    )}
                    {item.material && (
                      <p className="text-sm text-gray-600">Material: {item.material}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      Rating: {item.averageRating.toFixed(1)} ({item.totalReviews} reviews)
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteItem(item._id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 