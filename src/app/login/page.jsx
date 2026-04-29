'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Zap, Eye, EyeOff } from 'lucide-react';
import * as Apollo from '@apollo/client';
const { useMutation } = Apollo;
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { LOGIN_MUTATION } from '@/graphql/mutations/auth';
import AuthLayout from '@/components/auth/AuthLayout';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [login, { loading }] = useMutation(LOGIN_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.login.token);
      router.push('/chat');
    },
    onError: (err) => {
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    login({ variables: formData });
  };

  return (
    <AuthLayout
      title="Intelligent Care"
      subtitle="For Your Skin."
      description="Experience the future of aesthetic medicine with our AI-powered diagnosis and personalised treatment plans."
    >
      <div className="bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-10 md:p-12 shadow-2xl dark:shadow-indigo-500/5 relative overflow-hidden">
        {/* Mobile Branding */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mb-4">
            <Zap size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skin Cleaner</h2>
        </div>

        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome Back</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Please sign in to continue to your dashboard</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-xs font-bold uppercase tracking-wider text-center"
          >
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email or Mobile"
            icon={Mail}
            type="text"
            required
            placeholder="name@example.com"
            value={formData.identifier}
            onChange={(e) => setFormData({ ...formData, identifier: e.target.value })}
          />

          <div className="space-y-1">
            <div className="relative">
              <Input
                label="Password"
                icon={Lock}
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 bottom-3.5 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className="flex justify-end pr-1">
              <Link href="#" className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 hover:text-indigo-600 uppercase tracking-widest transition-colors">
                Forgot Password?
              </Link>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 transition-all duration-300"
            isLoading={loading}
            icon={ArrowRight}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline underline-offset-8 transition-all">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
