'use client';

import React from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, User, Phone, Mail, MapPin, ClipboardList, 
  Edit, Plus, Activity
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import { useRouter, useParams } from 'next/navigation';
import { useQuery } from '@apollo/client';
import { GET_PATIENT } from '@/graphql/queries/patient';
import PatientTreatments from '@/components/clinical/PatientTreatments';

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { theme } = useTheme();

  // Queries
  const { data: patientData, loading: patientLoading } = useQuery(GET_PATIENT, {
    variables: { id },
    skip: !id
  });

  if (patientLoading) {
    return (
      <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </main>
      </div>
    );
  }

  const patient = patientData?.getPatient;

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
        
        <div className="max-w-4xl mx-auto pb-20">
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
                variant="secondary" 
                onClick={() => router.push(`/patients/edit/${id}`)}
                icon={Edit}
              >
                Edit Profile
              </Button>
              <Button 
                onClick={() => router.push(`/treatments?patient=${id}`)}
                icon={Activity}
                variant="secondary"
              >
                New Treatment
              </Button>
              <Button 
                onClick={() => router.push(`/appointments/add?patient=${id}`)}
                icon={Plus}
              >
                Book Appointment
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Header Card */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-600/5 blur-[40px] rounded-full pointer-events-none"></div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20 shadow-inner overflow-hidden">
                  {patient.image ? (
                    <img src={patient.image} alt={patient.name} className="w-full h-full object-cover" />
                  ) : (
                    <User size={40} />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-[var(--foreground)] mb-1">{patient.name}</h1>
                <p className="text-indigo-400 font-bold uppercase tracking-[0.2em] text-[10px] mb-4">{patient.gender} • {patient.age} Years</p>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border ${patient.isActive ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                    {patient.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <div className="mt-8 space-y-4 pt-8 border-t border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Phone size={14} className="text-gray-500" />
                  <span className="text-sm text-[var(--text-muted)]">{patient.mobile}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail size={14} className="text-gray-500" />
                  <span className="text-sm text-[var(--text-muted)] truncate">{patient.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={14} className="text-gray-500" />
                  <span className="text-sm text-[var(--text-muted)] leading-tight">{patient.address || 'No address'}</span>
                </div>
              </div>
            </div>

            {/* Medical History */}
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 shadow-sm">
              <h3 className="text-sm font-bold text-[var(--foreground)] uppercase tracking-widest mb-6 flex items-center gap-2">
                <ClipboardList size={16} className="text-indigo-400" /> Medical Summary
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 ">Conditions</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">{patient.medicalHistory || 'None recorded.'}</p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 ">Ongoing Treatments</p>
                  <p className="text-sm text-[var(--text-muted)] leading-relaxed">{patient.ongoingTreatments || 'None.'}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <PatientTreatments patientId={id} />
          </div>
        </div>
      </main>
    </div>
  );
}
