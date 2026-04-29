'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, User, Award, DollarSign, Phone, Sparkles, ChevronRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CREATE_DOCTOR } from '@/graphql/mutations/doctor';

export default function AddDoctorPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    specialization: 'Skin',
    experience: '',
    consultationFee: '',
    mobile: ''
  });

  const [errors, setErrors] = useState({});

  const [createDoctor, { loading }] = useMutation(CREATE_DOCTOR, {
    refetchQueries: ['GetDoctors'],
    onCompleted: () => {
      toast.success('Doctor added successfully!');
      setTimeout(() => router.push('/doctors'), 1500);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to add doctor');
    }
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Doctor name is required';
    if (!formData.experience) newErrors.experience = 'Experience is required';
    if (!formData.consultationFee) newErrors.consultationFee = 'Consultation fee is required';
    if (!formData.mobile) newErrors.mobile = 'Contact number is required';
    else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, '').replace('+91', ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    createDoctor({ 
      variables: {
        ...formData,
        experience: parseInt(formData.experience),
        consultationFee: parseInt(formData.consultationFee)
      }
    });
  };

  const { theme } = useTheme();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10 relative">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-bold mb-8 group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to List
          </button>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[3rem] p-6 md:p-14 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="mb-12">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6">
                  <Sparkles size={32} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Add New Specialist</h1>
                <p className="text-[var(--text-muted)] text-sm">Onboard a new medical professional to your clinical team.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="Doctor Name"
                    icon={User}
                    placeholder="Dr. Sarah Johnson"
                    value={formData.name}
                    error={errors.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (errors.name) setErrors({ ...errors, name: null });
                    }}
                  />
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Specialization</label>
                    <div className="relative">
                      <select 
                        className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm appearance-none cursor-pointer"
                        value={formData.specialization}
                        onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                      >
                        <option value="Skin">Skin Specialist</option>
                        <option value="Hair">Hair Specialist</option>
                        <option value="Both">Skin & Hair Specialist</option>
                      </select>
                      <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] rotate-90 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Input
                    label="Years of Experience"
                    icon={Award}
                    type="number"
                    placeholder="e.g. 10"
                    value={formData.experience}
                    error={errors.experience}
                    onChange={(e) => {
                      setFormData({ ...formData, experience: e.target.value });
                      if (errors.experience) setErrors({ ...errors, experience: null });
                    }}
                  />
                  <Input
                    label="Consultation Fee (₹)"
                    icon={DollarSign}
                    type="number"
                    placeholder="e.g. 500"
                    value={formData.consultationFee}
                    error={errors.consultationFee}
                    onChange={(e) => {
                      setFormData({ ...formData, consultationFee: e.target.value });
                      if (errors.consultationFee) setErrors({ ...errors, consultationFee: null });
                    }}
                  />
                </div>

                <Input
                  label="Contact Number"
                  icon={Phone}
                  placeholder="+91 98765 43210"
                  value={formData.mobile}
                  error={errors.mobile}
                  onChange={(e) => {
                    setFormData({ ...formData, mobile: e.target.value });
                    if (errors.mobile) setErrors({ ...errors, mobile: null });
                  }}
                />

                <div className="pt-6">
                  <Button
                    type="submit"
                    className="w-full py-5"
                    isLoading={loading}
                    icon={Sparkles}
                  >
                    Register Doctor
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
