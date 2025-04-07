'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { FaStar, FaTrash, FaHome } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Review {
  id: string;
  itemId: string;
  itemName: string;
  itemImage: string;
  rating: number;
  review: string;
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
}

interface ProfileResponse {
  user: User;
  reviews: Review[];
  reviewsCount: number;
  averageRating: number;
  success: boolean;
}

export default function ProfileClient() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchProfile() {
      if (!session?.user?.id) {
        setIsLoading(false);
        setError('User not logged in');
        return;
      }

      try {
        console.log('Fetching profile for user ID:', session.user.id);
        const response = await fetch(`/api/users/${session.user.id}`);
        const data = await response.json();
        
        console.log('Profile data received:', data);
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch profile');
        }
        
        setProfile(data);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    }

    fetchProfile();
  }, [session]);

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Bu incelemeyi silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setIsDeleting(reviewId);
    
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete review');
      }
      
      // Refresh the profile data
      if (profile && session?.user?.id) {
        const updatedResponse = await fetch(`/api/users/${session.user.id}`);
        const updatedData = await updatedResponse.json();
        
        if (updatedResponse.ok) {
          setProfile(updatedData);
        }
      }
    } catch (err) {
      console.error('Error deleting review:', err);
      alert(err instanceof Error ? err.message : 'Failed to delete review');
    } finally {
      setIsDeleting(null);
    }
  };

  if (isLoading) {
    return <div className="text-center p-8">Loading profile...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div className="text-center p-8">No profile data available</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center">
          <FaHome className="mr-2" /> Ana Sayfaya Dön
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
        <h2 className="text-2xl font-bold mb-4">Profile Information</h2>
        <div className="mb-4">
          <p className="text-lg">
            <span className="font-semibold">Name:</span> {profile.user.name}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Username:</span> {profile.user.username}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Email:</span> {profile.user.email}
          </p>
          <p className="text-lg">
            <span className="font-semibold">Role:</span> {profile.user.role}
          </p>
        </div>
        <div className="flex items-center">
          <div className="flex items-center mr-2">
            <FaStar className="text-black mr-1" />
          </div>
          <p>
            {profile.averageRating.toFixed(1)} / 10 ({profile.reviewsCount} reviews)
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Your Reviews</h2>
        {profile.reviews.length === 0 ? (
          <p>You haven't written any reviews yet.</p>
        ) : (
          <div className="space-y-4">
            {profile.reviews.map((review) => (
              <div key={review.id} className="border-b pb-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center mb-2">
                    <img
                      src={review.itemImage}
                      alt={review.itemName}
                      className="w-12 h-12 object-cover rounded mr-4"
                    />
                    <div>
                      <h3 className="font-semibold">{review.itemName}</h3>
                      <div className="flex items-center">
                        <FaStar className="text-black mr-1" />
                        <span>
                          {review.rating.toFixed(1)} / 10
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={isDeleting === review.id}
                    className={`text-red-500 hover:text-red-700 p-2 rounded-full ${
                      isDeleting === review.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="İncelemeyi Sil"
                  >
                    <FaTrash />
                  </button>
                </div>
                <p className="text-gray-700 dark:text-gray-300">{review.review}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 