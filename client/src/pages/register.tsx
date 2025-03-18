import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage: React.FC = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);
  
  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Custodian Integration Tool</h1>
        <p className="text-gray-600 mt-2">Create a new account</p>
      </div>
      
      <RegisterForm />
      
      <div className="mt-4 text-center">
        <p className="text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 hover:text-blue-800">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage; 