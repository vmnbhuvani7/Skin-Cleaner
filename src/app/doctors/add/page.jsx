'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, User, Award, IndianRupee, Phone, Sparkles } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/Select';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { CREATE_DOCTOR } from '@/graphql/mutations/doctor';
import ImageUpload from '@/components/ui/ImageUpload';
import { twMerge } from 'tailwind-merge';
import { SPECIALIST_OPTIONS } from '@/utils/constants';

export default function AddDoctorPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: '',
    specialization: '',
    experience: '',
    consultationFee: '',
    mobile: '',
    image: ''
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
    if (!formData.specialization) newErrors.specialization = 'Specialization is required';
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-8 px-0 text-primary-400 hover:text-primary-300 hover:bg-transparent"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to List
          </Button>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary-600/5 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8">
                <div className="w-12 h-12 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400 shrink-0">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Add New Specialist</h1>
                  <p className="text-[var(--text-muted)] text-xs">Onboard a new medical professional to your clinical team.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-3 flex justify-center md:justify-start">
                    <ImageUpload
                      label="Photo"
                      value={formData.image}
                      onChange={(val) => setFormData({ ...formData, image: val })}
                      className="w-full max-w-[140px]"
                    />
                  </div>

                  <div className="md:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Specialization</label>
                      <Select
                        value={formData.specialization || undefined}
                        onValueChange={(value) => {
                          setFormData({ ...formData, specialization: value });
                          if (errors.specialization) setErrors({ ...errors, specialization: null });
                        }}
                      >
                        <SelectTrigger className={twMerge("h-12", errors.specialization && "border-danger-500 ring-danger-500/10")}>
                          <SelectValue placeholder="Select Specialization" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALIST_OPTIONS?.map(data => {
                            return (
                              <SelectItem key={data.value} value={data.value}>{data.label}</SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                      {errors.specialization && <p className="text-[10px] font-bold text-danger-500 ml-1 mt-1 uppercase tracking-wider">{errors.specialization}</p>}
                    </div>

                    <Input
                      label="Experience (Years)"
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
                      icon={IndianRupee}
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

                  <div className="flex items-end">
                    <Button
                      type="submit"
                      className="w-full h-12"
                      isLoading={loading}
                      icon={Sparkles}
                    >
                      Register Doctor
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
