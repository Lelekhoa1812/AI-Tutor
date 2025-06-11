'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Pencil } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface ProfileData {
  name: string;
  gradeLevel: string;
  learningStyle: string;
  profileImage: string;
}

const defaultProfile: ProfileData = {
  name: '',
  gradeLevel: '',
  learningStyle: '',
  profileImage: '/images/profile/dog.png'
};

const profileImages = [
  'robot.png',
  'cat.png',
  'dog.png',
  'dolphin.png',
  'elephant.png',
  'frog.png',
  'jaguar.png',
  'kangaroo.png',
  'lion.png',
  'monkey.png',
  'ox.png',
  'rabbit.png',
  'bear.png',
  'bee1.png',
  'bee2.png',
  'bee3.png',
  'eagle1.png',
  'eagle2.png',
  'owl1.png',
  'owl2.png',
  'parrot1.png',
  'parrot2.png',
  'peacock1.png',
  'peacock2.png',
];

export function Profile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData>(defaultProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentImageIndex < profileImages.length - 5) {
      setCurrentImageIndex(prev => prev + 5);
    }
    if (isRightSwipe && currentImageIndex > 0) {
      setCurrentImageIndex(prev => Math.max(0, prev - 5));
    }
  };

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfile(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile data');
    }
  };

  const handleImageChange = (imageName: string) => {
    setProfile(prev => ({ ...prev, profileImage: `/images/profile/${imageName}` }));
    setShowImageModal(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: profile.name,
          profileImage: profile.profileImage,
          gradeLevel: profile.gradeLevel,
          learningStyle: profile.learningStyle,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      setProfile(updatedProfile);
      setIsEditing(false);
      setError(null);
      
      // Dispatch event to notify other components of profile update
      window.dispatchEvent(new Event('profileUpdated'));
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to save profile changes');
    } finally {
      setIsLoading(false);
    }
  };

  const visibleImages = profileImages.slice(currentImageIndex, currentImageIndex + 5);

  if (status === 'loading') {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}
      <div className="rounded-lg shadow-lg p-6">
        {/* Profile Image Section */}
        <div className="relative w-32 h-32 mx-auto mb-6 group">
          <Image
            src={profile.profileImage}
            alt="Profile"
            width={128}
            height={128}
            className="rounded-full"
            priority
          />
          <button
            onClick={() => setShowImageModal(true)}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Pencil className="text-white" />
          </button>
        </div>

        {/* Profile Form */}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          <div>
            <label className="block text-sm font-medium">Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              disabled={!isEditing}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Grade Level</label>
            <select
              value={profile.gradeLevel}
              onChange={(e) => setProfile(prev => ({ ...prev, gradeLevel: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              disabled={!isEditing}
            >
              <option value="">Select Grade</option>
              <option value="elementary">Elementary School</option>
              <option value="middle">Middle School</option>
              <option value="high">High School</option>
              <option value="college">College</option>
              <option value="college">Higher Education</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Learning Style</label>
            <select
              value={profile.learningStyle}
              onChange={(e) => setProfile(prev => ({ ...prev, learningStyle: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              disabled={!isEditing}
            >
              <option value="">Select Learning Style</option>
              <option value="visual">Visual</option>
              <option value="auditory">Auditory</option>
              <option value="reading">Reading/Writing</option>
              <option value="kinesthetic">Kinesthetic</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
              >
                Edit Profile
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>

      {/* Image Selection Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div 
            ref={modalRef}
            className="rounded-lg p-6 max-w-2xl w-full"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Choose Profile Picture</h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentImageIndex(prev => Math.max(0, prev - 5))}
                disabled={currentImageIndex === 0}
                className="px-3 py-1 bg-secondary rounded-md disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentImageIndex(prev => Math.min(profileImages.length - 5, prev + 5))}
                disabled={currentImageIndex >= profileImages.length - 5}
                className="px-3 py-1 bg-secondary rounded-md disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="grid grid-cols-5 gap-4">
              {visibleImages.map((imageName) => (
                <button
                  key={imageName}
                  onClick={() => handleImageChange(imageName)}
                  className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-primary"
                >
                  <Image
                    src={`/images/profile/${imageName}`}
                    alt={imageName}
                    fill
                    className="object-cover"
                    priority
                  />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 