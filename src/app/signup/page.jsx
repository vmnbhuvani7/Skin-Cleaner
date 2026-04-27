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
    <div className="min-h-screen w-full bg-[#0a0c10] flex items-center justify-center p-6 py-12 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          {/* Accent Line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>

          <div className="mb-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 mb-6 group transition-all duration-500 hover:scale-110">
              <Sparkles className="text-indigo-400 group-hover:text-indigo-300 transition-colors" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Create Account</h1>
            <p className="text-gray-400 text-sm">Join Skin Cleaner AI to experience the future</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-400 text-xs font-bold uppercase tracking-wider text-center">
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
                  <CheckSquare size={22} className="text-indigo-500" />
                ) : (
                  <Square size={22} className="text-gray-600 group-hover:text-gray-500" />
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed group-hover:text-gray-400 transition-colors">
                I agree to the <Link href="#" className="text-indigo-400 font-bold hover:underline">Terms of Service</Link> and <Link href="#" className="text-indigo-400 font-bold hover:underline">Privacy Policy</Link>.
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

          <p className="mt-10 text-center text-sm text-gray-500 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-400 font-bold hover:text-indigo-300 transition-colors underline underline-offset-4 decoration-2 decoration-indigo-400/30">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-8 text-center">
          <p className="text-[10px] text-gray-600 font-bold uppercase tracking-[0.2em]">
            Skin Cleaner AI • Pure Intelligence
          </p>
        </div>
      </motion.div>
    </div>
  );
}
