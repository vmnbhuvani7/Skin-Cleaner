'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, Zap, CheckSquare, Square, Eye, EyeOff, Building2, Calendar } from 'lucide-react';
import * as Apollo from '@apollo/client';
const { useMutation, useQuery } = Apollo;
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { SIGNUP_MUTATION, GET_PUBLIC_ORGANIZATIONS } from '@/graphql/mutations/auth';
import AuthLayout from '@/components/auth/AuthLayout';
import { DEFAULT_LOGIN_REDIRECT } from '@/constants/routes';
import { DatePicker } from '@/components/ui/DatePicker';
import { calculateAge } from '@/utils/dateUtils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    roleName: 'Patient',
    organizationName: '',
    organizationId: '',
    birthdate: null,
    gender: 'Male',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});
  const [age, setAge] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (formData.birthdate) {
      setAge(calculateAge(formData.birthdate));
    } else {
      setAge('');
    }
  }, [formData.birthdate]);

  const [signup, { loading }] = useMutation(SIGNUP_MUTATION, {
    onCompleted: (data) => {
      localStorage.setItem('token', data.signup.token);
      localStorage.setItem('user', JSON.stringify(data.signup.user));
      router.push(DEFAULT_LOGIN_REDIRECT);
    },
    onError: (err) => {
      setError(err.message || 'Signup failed. Please try again.');
    }
  });

  const { data: orgData } = useQuery(GET_PUBLIC_ORGANIZATIONS);

  useEffect(() => {
    if (orgData?.publicGetOrganizations?.length > 0 && !formData.organizationId) {
      setFormData(prev => ({ ...prev, organizationId: orgData.publicGetOrganizations[0].id }));
    }
  }, [orgData, formData.organizationId]);

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
        roleName: formData.roleName,
        organizationName: formData.roleName === 'Organization' ? formData.organizationName : undefined,
        organizationId: formData.roleName === 'Patient' ? formData.organizationId : undefined,
        birthdate: formData.roleName === 'Patient' ? formData.birthdate : undefined,
        gender: formData.roleName === 'Patient' ? formData.gender : undefined,
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

        {/* Role Selection */}
        <div className="flex gap-4 mb-8">
          <div
            onClick={() => setFormData({ ...formData, roleName: 'Patient' })}
            className={`flex-1 cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.roleName === 'Patient'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                : 'border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${formData.roleName === 'Patient' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                <User size={20} />
              </div>
              <div>
                <h3 className={`font-bold ${formData.roleName === 'Patient' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Patient</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Personal account</p>
              </div>
            </div>
          </div>
          <div
            onClick={() => setFormData({ ...formData, roleName: 'Organization' })}
            className={`flex-1 cursor-pointer p-4 rounded-2xl border-2 transition-all ${formData.roleName === 'Organization'
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10'
                : 'border-gray-100 dark:border-white/5 hover:border-indigo-200 dark:hover:border-indigo-500/30'
              }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${formData.roleName === 'Organization' ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-white/5 text-gray-500 dark:text-gray-400'}`}>
                <Zap size={20} />
              </div>
              <div>
                <h3 className={`font-bold ${formData.roleName === 'Organization' ? 'text-indigo-700 dark:text-indigo-300' : 'text-gray-700 dark:text-gray-300'}`}>Organization</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Business account</p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {formData.roleName === 'Patient' && orgData?.publicGetOrganizations?.length > 0 && (
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 flex items-center gap-2">
                <Building2 size={12} />
                Select Clinic / Organization
              </label>
              <Select
                value={formData.organizationId}
                onValueChange={(val) => setFormData({ ...formData, organizationId: val })}
              >
                <SelectTrigger className="h-14 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium focus:ring-indigo-500 shadow-sm">
                  <SelectValue placeholder="Choose Organization" />
                </SelectTrigger>
                <SelectContent>
                  {orgData.publicGetOrganizations.map((org) => (
                    <SelectItem key={org.id} value={org.id} className="font-medium">
                      {org.organizationName || org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {formData.roleName === 'Organization' && (
            <Input
              label="Organization Name"
              icon={Zap}
              required
              placeholder="Apex Clinical Center"
              value={formData.organizationName}
              onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
            />
          )}

          {formData.roleName === 'Patient' && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Gender</label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({ ...formData, gender: value })}
                >
                  <SelectTrigger className="h-14">
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <DatePicker
                label="Birth Date"
                date={formData.birthdate}
                setDate={(date) => {
                  setFormData({ ...formData, birthdate: date });
                  if (errors.birthdate) setErrors({ ...errors, birthdate: null });
                }}
                error={errors.birthdate}
                placeholder="Select date"
                className="h-14"
              />

              <Input
                label="Age"
                icon={Calendar}
                type="text"
                placeholder="Auto"
                value={age !== '' ? `${age} Years` : ''}
                disabled
                className="bg-[var(--surface-hover)]/50 opacity-70 cursor-not-allowed h-14"
              />
            </div>
          )}

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
