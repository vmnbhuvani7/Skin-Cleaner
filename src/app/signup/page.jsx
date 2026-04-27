'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Sparkles, CheckSquare, Square } from 'lucide-react';
import * as Apollo from '@apollo/client';
const { useMutation, gql } = Apollo;
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

const SIGNUP_MUTATION = gql`
  mutation Signup($name: String!, $email: String!, $mobile: String!, $password: String!) {
    signup(name: $name, email: $email, mobile: $mobile, password: $password) {
      token
      user {
        id
        name
      }
    }
  }
`;

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.signup.token);
      router.push('/chat');
    },
    onError: (err) => {
      setError(err.message || 'Signup failed. Please try again.');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    signup({
      variables: {
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        password: formData.password,
      }
    });
  };

  return (
    <div className="min-h-screen w-full bg-[#fafaf9] flex items-center justify-center p-6 py-16 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-100/40 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-100/40 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-[640px] z-10"
      >
        <div className="bg-white/70 backdrop-blur-3xl border border-white rounded-[3rem] p-10 md:p-16 shadow-2xl shadow-stone-200/50 relative overflow-hidden">
          <div className="mb-12 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-stone-50 border border-stone-100 mb-8 group transition-all duration-500 hover:rotate-12 hover:scale-110 shadow-sm">
              <Sparkles className="text-stone-900" size={36} />
            </div>
            <h1 className="text-4xl font-bold text-stone-900 tracking-tight mb-3">Create Account</h1>
            <p className="text-stone-400 text-sm font-medium">Join our community of skincare enthusiasts</p>
          </div>

          {error && (
            <div className="mb-8 p-4 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600 text-xs font-bold uppercase tracking-wider text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Full Name"
                icon={User}
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email Address"
                icon={Mail}
                type="email"
                required
                placeholder="name@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <Input
              label="Mobile Number"
              icon={Phone}
              type="tel"
              required
              placeholder="+91 00000 00000"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Password"
                icon={Lock}
                type="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
              <Input
                label="Confirm Password"
                icon={Lock}
                type="password"
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
            </div>

            <div 
              className="flex items-start gap-4 pt-2 ml-1 cursor-pointer group" 
              onClick={() => setFormData({ ...formData, acceptTerms: !formData.acceptTerms })}
            >
              <div className="mt-0.5 shrink-0 transition-transform group-active:scale-90">
                {formData.acceptTerms ? (
                  <CheckSquare size={22} className="text-stone-900" />
                ) : (
                  <Square size={22} className="text-stone-300 group-hover:text-stone-400" />
                )}
              </div>
              <p className="text-xs text-stone-400 font-medium leading-relaxed group-hover:text-stone-500 transition-colors">
                I agree to the <Link href="#" className="text-stone-900 font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-stone-900 font-bold hover:underline">Privacy Policy</Link>.
              </p>
            </div>

            <Button
              type="submit"
              disabled={!formData.acceptTerms}
              isLoading={loading}
              className="w-full mt-6"
              icon={ArrowRight}
            >
              Create Account
            </Button>
          </form>

          <p className="mt-12 text-center text-sm text-stone-400 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-stone-900 font-bold hover:text-stone-700 transition-colors border-b-2 border-stone-100 pb-0.5">
              Sign In
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
