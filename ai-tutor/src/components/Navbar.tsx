'use client';

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface ProfileData {
  profileImage: string;
}

export function Navbar() {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [profileImage, setProfileImage] = useState('/images/profile/dog.png');
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile();
    }
  }, [status]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch profile');
      }
      const data = await response.json();
      setProfileImage(data.profileImage);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Listen for profile updates
  useEffect(() => {
    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener('profileUpdated', handleProfileUpdate);
    return () => {
      window.removeEventListener('profileUpdated', handleProfileUpdate);
    };
  }, []);

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AI Tutor
        </Link>
        <div className="flex items-center space-x-4">
          <Link href="/onboarding" className="text-sm hover:text-primary">
            Onboarding
          </Link>
          <Link href="/dashboard" className="text-sm hover:text-primary">
            Dashboard
          </Link>
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 focus:outline-none"
            >
              <div className="w-8 h-8 rounded-full overflow-hidden">
                <Image
                  src={profileImage}
                  alt="Profile"
                  width={32}
                  height={32}
                  className="object-cover"
                  priority
                />
              </div>
            </button>
            {showProfileMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setShowProfileMenu(false)}
                >
                  Profile
                </Link>
                <button
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => {
                    // TODO: Implement logout functionality
                    setShowProfileMenu(false);
                  }}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
} 