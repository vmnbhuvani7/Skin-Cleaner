'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, ClipboardList, Activity, Sparkles, Edit, ChevronRight, Cake } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/Select';
import { DatePicker } from '@/components/ui/DatePicker';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GET_PATIENT } from '@/graphql/queries/patient';
import { UPDATE_PATIENT } from '@/graphql/mutations/patient';
import { calculateAge } from '@/utils/dateUtils';

export default function EditPatientPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const { data, loading: queryLoading } = useQuery(GET_PATIENT, {
    variables: { id },
    skip: !id
  });

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    birthdate: '',
    gender: 'Male',
    address: '',
    medicalHistory: '',
    ongoingTreatments: ''
  });

  const [age, setAge] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (data?.getPatient) {
      const { name, email, mobile, birthdate, gender, address, medicalHistory, ongoingTreatments } = data.getPatient;
      const formattedBirthdate = birthdate ? new Date(birthdate).toISOString().split('T')[0] : '';
      setFormData({ 
        name: name || '', 
        email: email || '', 
        mobile: mobile || '', 
        birthdate: formattedBirthdate, 
        gender: gender || 'Male', 
        address: address || '', 
        medicalHistory: medicalHistory || '', 
        ongoingTreatments: ongoingTreatments || '' 
      });
    }
  }, [data]);

  useEffect(() => {
    if (formData.birthdate) {
      setAge(calculateAge(formData.birthdate));
    } else {
      setAge('');
    }
  }, [formData.birthdate]);

  const [updatePatient, { loading: mutationLoading }] = useMutation(UPDATE_PATIENT, {
    refetchQueries: ['GetPatients', 'GetPatient'],
    onCompleted: () => {
      toast.success('Patient information updated!');
      setTimeout(() => router.push('/patients'), 1500);
    },
    onError: (err) => {
      toast.error(err.message || 'Update failed');
    }
  });

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Patient name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Enter a valid email address';
    }
    if (!formData.mobile) newErrors.mobile = 'Contact number is required';
    else if (!/^\d{10}$/.test(formData.mobile.replace(/\s/g, '').replace('+91', ''))) {
      newErrors.mobile = 'Enter a valid 10-digit mobile number';
    }
    if (!formData.birthdate) newErrors.birthdate = 'Birthdate is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    updatePatient({ 
      variables: {
        id,
        ...formData,
      }
    });
  };

  const { theme } = useTheme();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10 relative">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        <div className="max-w-4xl mx-auto pb-20">
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
                  <Edit size={32} />
                </div>
                <h1 className="text-3xl font-bold text-[var(--foreground)] tracking-tight mb-2">Edit Patient Record</h1>
                <p className="text-[var(--text-muted)] text-sm">Update information for {formData.name || 'the patient'}.</p>
              </div>

              {queryLoading ? (
                <div className="py-20 text-center">
                  <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-8" noValidate>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label="Patient Name"
                      icon={User}
                      placeholder="John Doe"
                      value={formData.name}
                      error={errors.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        if (errors.name) setErrors({ ...errors, name: null });
                      }}
                    />
                    <Input
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      placeholder="john@example.com"
                      value={formData.email}
                      error={errors.email}
                      onChange={(e) => {
                        setFormData({ ...formData, email: e.target.value });
                        if (errors.email) setErrors({ ...errors, email: null });
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Input
                      label="Contact Number"
                      icon={Phone}
                      placeholder="98765 43210"
                      value={formData.mobile}
                      error={errors.mobile}
                      onChange={(e) => {
                        setFormData({ ...formData, mobile: e.target.value });
                        if (errors.mobile) setErrors({ ...errors, mobile: null });
                      }}
                    />
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Gender</label>
                      <Select 
                        value={formData.gender} 
                        onValueChange={(value) => setFormData({ ...formData, gender: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <DatePicker
                      label="Birth Date"
                      date={formData.birthdate}
                      setDate={(date) => {
                        setFormData({ ...formData, birthdate: date });
                        if (errors.birthdate) setErrors({ ...errors, birthdate: null });
                      }}
                      error={errors.birthdate}
                      placeholder="Select birth date"
                    />
                    <Input
                      label="Age"
                      icon={Calendar}
                      type="text"
                      placeholder="Auto-calculated"
                      value={age !== '' ? `${age} Years` : ''}
                      disabled
                      className="bg-[var(--surface-hover)]/50 opacity-70 cursor-not-allowed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Home Address</label>
                    <div className="relative">
                      <MapPin size={18} className="absolute left-4 top-4 text-gray-500" />
                      <textarea 
                        placeholder="Enter full address..."
                        className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm min-h-[100px]"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Medical History</label>
                      <div className="relative">
                        <ClipboardList size={18} className="absolute left-4 top-4 text-gray-500" />
                        <textarea 
                          placeholder="Previous conditions, allergies..."
                          className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm min-h-[120px]"
                          value={formData.medicalHistory}
                          onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Ongoing Treatments</label>
                      <div className="relative">
                        <Activity size={18} className="absolute left-4 top-4 text-gray-500" />
                        <textarea 
                          placeholder="Current medications, therapy..."
                          className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm min-h-[120px]"
                          value={formData.ongoingTreatments}
                          onChange={(e) => setFormData({ ...formData, ongoingTreatments: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      type="submit"
                      className="w-full py-5"
                      isLoading={mutationLoading}
                      icon={Sparkles}
                    >
                      Update Patient Record
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
