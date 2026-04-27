'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Sparkles } from 'lucide-react';
import * as Apollo from '@apollo/client';
const { useMutation, gql } = Apollo;
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const LOGIN_MUTATION = gql`
  mutation Login($identifier: String!, $password: String!) {
    login(identifier: $identifier, password: $password) {
      token
      user {
        id
        name
        email
      }
    }
  }
`;

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');

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
    <div className="min-h-screen w-full bg-[#fafaf9] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-100/40 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-100/40 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[480px] z-10"
      >
        <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] p-10 md:p-14 shadow-2xl shadow-stone-200/50 relative overflow-hidden">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-stone-50 border border-stone-100 mb-8 group transition-all duration-500 hover:rotate-12 hover:scale-110 shadow-sm">
              <Sparkles className="text-stone-900" size={36} />
            </div>
            <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">Welcome Back</h1>
            <p className="text-stone-400 text-sm font-medium">Continue your journey to radiant skin</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold uppercase tracking-wider text-center">
              {error}
            </div>
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
              <Input
                label="Password"
                icon={Lock}
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <div className="flex justify-end pr-1">
                <Link href="#" className="text-[11px] font-bold text-stone-900 hover:text-stone-700 uppercase tracking-wider transition-colors">Forgot Password?</Link>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              isLoading={loading}
              icon={ArrowRight}
            >
              Sign In
            </Button>
          </form>

          {/* <div className="mt-12">
            <div className="relative mb-10">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-100"></div>
              </div>
              <div className="relative flex justify-center text-[10px] uppercase tracking-[0.3em] font-bold">
                <span className="bg-white/0 px-6 text-stone-300">Or enter with</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <button className="flex items-center justify-center gap-3 bg-white hover:bg-stone-50 border border-stone-100 py-4 rounded-2xl transition-all text-xs font-bold text-stone-600 shadow-sm hover:shadow-md">
                <Chrome size={18} className="text-rose-500" />
                GOOGLE
              </button>
              <button className="flex items-center justify-center gap-3 bg-white hover:bg-stone-50 border border-stone-100 py-4 rounded-2xl transition-all text-xs font-bold text-stone-600 shadow-sm hover:shadow-md">
                <Github size={18} className="text-stone-900" />
                GITHUB
              </button>
            </div>
          </div> */}

          <p className="mt-12 text-center text-sm text-stone-400 font-medium">
            New to Skin Cleaner?{' '}
            <Link href="/signup" className="text-stone-900 font-bold hover:text-stone-700 transition-colors border-b-2 border-stone-100 pb-0.5">
              Create Account
            </Link>
          </p>
        </div>

        <div className="mt-10 text-center">
          <p className="text-[11px] text-stone-300 font-bold uppercase tracking-[0.3em]">
            Skin Cleaner AI • Pure Intelligence
          </p>
        </div>
      </motion.div>
    </div>
  );
}
