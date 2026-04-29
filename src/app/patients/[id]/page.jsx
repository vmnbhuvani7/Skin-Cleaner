'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, User, Phone, Mail, Calendar, MapPin, ClipboardList, Activity, Clock, ShieldCheck, Edit, Trash2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GET_PATIENT } from '@/graphql/queries/patient';

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  
  const { data, loading } = useQuery(GET_PATIENT, {
    variables: { id },
    skip: !id
  });

  const { theme } = useTheme();

  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  const patient = data?.getPatient;

  if (!patient) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex flex-col items-center justify-center p-10">
          <h2 className="text-2xl font-bold text-[var(--foreground)] mb-4">Patient not found</h2>
          <Button onClick={() => router.push('/patients')}>Back to Patients</Button>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        <div className="max-w-5xl mx-auto pb-20">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <button 
              onClick={() => router.push('/patients')}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-bold group"
            >
              <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
              Back to Patients
            </button>
            
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                className="bg-white/5 border-white/10 text-white" 
                onClick={() => router.push(`/patients/edit/${id}`)}
                icon={Edit}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          {/* Patient Header Card */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[3rem] p-8 md:p-12 mb-8 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
              <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-inner">
                <User size={64} />
              </div>
              
              <div className="flex-1">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight">{patient.name}</h1>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${patient.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    {patient.isActive ? 'Active Patient' : 'Inactive'}
                  </span>
                </div>
                <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-xs mb-6">{patient.gender} • {patient.age} Years Old</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                      <Phone size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Phone</p>
                      <p className="text-sm font-medium text-[var(--foreground)]">{patient.mobile}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                      <Mail size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Email</p>
                      <p className="text-sm font-medium text-[var(--foreground)] truncate">{patient.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[var(--text-muted)]">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400">
                      <Clock size={18} />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-widest opacity-50">Registered</p>
                      <p className="text-sm font-medium text-[var(--foreground)]">{new Date(parseInt(patient.createdAt)).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Contact & Address */}
            <div className="lg:col-span-1 space-y-8">
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <MapPin size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Address</h3>
                </div>
                <p className="text-[var(--text-muted)] text-sm leading-relaxed">
                  {patient.address || 'No address provided.'}
                </p>
              </section>

              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                    <ShieldCheck size={16} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--foreground)]">Security</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-xs text-[var(--text-muted)]">Patient ID</span>
                    <span className="text-xs font-mono text-[var(--foreground)]">{patient.id.slice(-8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-[var(--text-muted)]">Status</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-tighter">Verified</span>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column - Medical Details */}
            <div className="lg:col-span-2 space-y-8">
              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <ClipboardList size={120} className="text-indigo-500" />
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <ClipboardList size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Medical History</h3>
                </div>
                
                <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed whitespace-pre-wrap">
                    {patient.medicalHistory || 'No previous medical history recorded for this patient.'}
                  </p>
                </div>
              </section>

              <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 md:p-10 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10 opacity-5 pointer-events-none">
                  <Activity size={120} className="text-rose-500" />
                </div>
                
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                    <Activity size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)]">Ongoing Treatments</h3>
                </div>
                
                <div className="bg-rose-500/5 rounded-3xl p-6 border border-rose-500/10">
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed whitespace-pre-wrap">
                    {patient.ongoingTreatments || 'No ongoing treatments or active prescriptions recorded.'}
                  </p>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
