'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Zap, CheckSquare, Square, Eye, EyeOff } from 'lucide-react';
import * as Apollo from '@apollo/client';
const { useMutation } = Apollo;
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SIGNUP_MUTATION } from '@/graphql/mutations/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.signup.token);
      router.push(DEFAULT_LOGIN_REDIRECT);
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
    <AuthLayout
      title="Start Your"
      subtitle="Skin Journey."
      description="Join thousands of satisfied patients who trust our AI-driven approach for clinical skincare and aesthetic perfection."
    >
      <div className="bg-white dark:bg-[#0f1117] border border-gray-100 dark:border-white/5 rounded-[2.5rem] p-8 md:p-12 shadow-2xl dark:shadow-indigo-500/5 relative overflow-hidden">
        {/* Mobile Branding */}
        <div className="lg:hidden flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl mb-4">
            <Zap size={32} className="text-white fill-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Skin Cleaner</h2>
        </div>

        <div className="mb-10 text-center lg:text-left">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">Create Account</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Experience the next generation of aesthetic care</p>
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
            <div className="relative">
              <Input
                label="Confirm Password"
                icon={Lock}
                type={showConfirmPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 bottom-3.5 text-gray-400 hover:text-indigo-500 transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div 
            className="flex items-start gap-4 pt-2 ml-1 cursor-pointer group" 
            onClick={() => setFormData({ ...formData, acceptTerms: !formData.acceptTerms })}
          >
            <div className="mt-0.5 shrink-0 transition-transform group-active:scale-90">
              {formData.acceptTerms ? (
                <CheckSquare size={24} className="text-indigo-500" />
              ) : (
                <Square size={24} className="text-gray-300 dark:text-gray-600 group-hover:text-gray-400" />
              )}
            </div>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              I agree to the <Link href="#" className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline underline-offset-4">Terms of Service</Link> and <Link href="#" className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline underline-offset-4">Privacy Policy</Link>.
            </p>
          </div>

          <Button
            type="submit"
            disabled={!formData.acceptTerms}
            className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:shadow-none transition-all duration-300 mt-4"
            isLoading={loading}
            icon={ArrowRight}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Already have an account?{' '}
            <Link href="/login" className="text-indigo-500 dark:text-indigo-400 font-bold hover:underline underline-offset-8 transition-all">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
