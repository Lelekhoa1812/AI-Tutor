'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      case 'OAuthSignin':
        return 'Error in the OAuth sign-in process.';
      case 'OAuthCallback':
        return 'Error in the OAuth callback process.';
      case 'OAuthCreateAccount':
        return 'Could not create OAuth provider user in the database.';
      case 'EmailCreateAccount':
        return 'Could not create email provider user in the database.';
      case 'Callback':
        return 'Error in the OAuth callback process.';
      case 'OAuthAccountNotLinked':
        return 'Email on the account already exists with different credentials.';
      case 'EmailSignin':
        return 'Check your email address.';
      case 'CredentialsSignin':
        return 'Sign in failed. Check the details you provided are correct.';
      case 'SessionRequired':
        return 'Please sign in to access this page.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-[400px] p-8 bg-white rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Authentication Error</h1>
        <p className="text-gray-600 mb-6">{getErrorMessage(error)}</p>
        <Link
          href="/auth/login"
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Return to Login
        </Link>
      </div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="w-[400px] p-8 bg-white rounded-lg shadow-lg text-center">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
} 