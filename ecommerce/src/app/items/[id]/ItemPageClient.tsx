'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
  };
  rating: number;
  review: string;
  createdAt: string;
}

interface Item {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
  seller: {
    _id: string;
    name: string;
  };
  batteryLife?: string;
  age?: number;
  size?: string;
  material?: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function ItemPageClient({ id }: { id: string }) {
  const { data: session } = useSession();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newReview, setNewReview] = useState({ rating: 5, review: '' });

  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`/api/items/${id}`);
        if (!res.ok) {
          throw new Error('Failed to fetch item');
        }
        const data = await res.json();
        setItem(data);
      } catch (err) {
        console.error('Error fetching item:', err);
        setError('Failed to load item details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      setError('Please sign in to leave a review');
      return;
    }

    try {
      const res = await fetch(`/api/items/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newReview),
      });

      if (!res.ok) {
        throw new Error('Failed to submit review');
      }

      const responseData = await res.json();
      
      // Update item with new data including reviews, averageRating, etc.
      if (responseData) {
        setItem(responseData);
        setNewReview({ rating: 5, review: '' });
      }
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading item details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <p className="text-red-600">{error || 'Item not found'}</p>
            <Link href="/" className="mt-4 text-blue-600 hover:text-blue-800">
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="md:flex gap-8 p-6">
            {/* Item Image */}
            <div className="relative w-64 h-64 flex-shrink-0 mx-auto md:mx-0">
              <Image
                src={item.image || '/placeholder.jpg'}
                alt={item.name}
                width={256}
                height={256}
                className="object-cover rounded-lg"
                priority
              />
            </div>

            {/* Item Details */}
            <div className="flex-1 mt-6 md:mt-0">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>
                  <p className="mt-2 text-gray-600">{item.description}</p>
                </div>
                <Link href="/" className="text-blue-600 hover:text-blue-800">
                  Back to Home
                </Link>
              </div>

              <div className="mt-4">
                <p className="text-3xl font-bold text-gray-900">${item.price}</p>
                <p className="mt-2 text-gray-600">Stock: {item.stock} units</p>
              </div>

              {/* Category-specific details */}
              <div className="mt-4 space-y-2">
                <p className="text-gray-600">Category: {item.category}</p>
                {item.batteryLife && (
                  <p className="text-gray-600">Battery Life: {item.batteryLife}</p>
                )}
                {item.age && (
                  <p className="text-gray-600">Age: {item.age} years</p>
                )}
                {item.size && (
                  <p className="text-gray-600">Size: {item.size}</p>
                )}
                {item.material && (
                  <p className="text-gray-600">Material: {item.material}</p>
                )}
              </div>

              {/* Rating Summary */}
              <div className="mt-6">
                <div className="flex items-center">
                  <span className="text-yellow-400 text-2xl">★</span>
                  <span className="ml-2 text-xl font-semibold">
                    {item.averageRating !== undefined ? item.averageRating.toFixed(1) : '0.0'}
                  </span>
                  <span className="ml-2 text-gray-600">
                    ({item.totalReviews || 0} reviews)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="p-8 border-t">
            <h2 className="text-xl font-semibold mb-4">Customer Reviews</h2>

            {/* Review Form */}
            {session && (
              <form onSubmit={handleSubmitReview} className="mb-8">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Rating
                    </label>
                    <select
                      value={newReview.rating}
                      onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? 'star' : 'stars'}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Review
                    </label>
                    <textarea
                      value={newReview.review}
                      onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                      rows={4}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Write your review here..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                  >
                    Submit Review
                  </button>
                </div>
              </form>
            )}

            {/* Reviews List */}
            <div className="space-y-6">
              {item.reviews && item.reviews.length > 0 ? (
                item.reviews.map((review) => (
                  <div key={review._id} className="border-b pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <span className="text-yellow-400">★</span>
                        <span className="ml-1 font-semibold">{review.rating}</span>
                        <span className="ml-2 text-gray-600">
                          by {review.userId.name}
                        </span>
                      </div>
                      <span className="text-gray-500 text-sm">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-600">{review.review}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to review!</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 