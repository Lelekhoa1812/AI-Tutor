'use client';

import { useEffect } from 'react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Add blur class to navbar when auth layout mounts
    const navbar = document.querySelector('nav');
    if (navbar) {
      navbar.classList.add('backdrop-blur-xl', 'bg-white/30', 'pointer-events-none');
    }

    // Remove blur class when auth layout unmounts
    return () => {
      if (navbar) {
        navbar.classList.remove('backdrop-blur-xl', 'bg-white/30', 'pointer-events-none');
      }
    };
  }, []);

  return (
    <div className="relative">
      {children}
    </div>
  );
} 