'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { Activity, ArrowRight, CheckCircle, Clock, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';

import { GET_PATIENT_TREATMENTS } from '@/graphql/queries/treatment';

export default function PatientTreatments({ patientId }) {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_PATIENT_TREATMENTS, {
    variables: { patientId },
    skip: !patientId
  });

  if (loading) return <Loader />;
  if (error) return <p className="text-rose-500 text-sm">Error loading treatments: {error.message}</p>;

  const treatments = data?.getPatientTreatments || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Activity size={16} className="text-indigo-400" /> Treatment History
        </h3>
        <Button 
          variant="ghost" 
          className="text-indigo-600 text-[10px] font-bold uppercase tracking-widest p-0 h-auto"
          onClick={() => router.push(`/treatments?patient=${patientId}`)}
        >
          View All
        </Button>
      </div>

      {treatments.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-2xl border border-dashed border-[var(--border)] p-8 text-center">
          <p className="text-sm text-[var(--text-muted)] font-medium">No treatment history found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {treatments.map((treatment) => {
             const completedSessions = treatment.sessions?.filter(s => s.status === 'COMPLETED').length || 0;
             const totalPaid = treatment.sessions?.reduce((acc, s) => acc + (s.paidAmount || 0), 0) || 0;
             
             return (
               <div 
                 key={treatment.id}
                 className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 flex items-center justify-between group hover:border-indigo-500/30 hover:shadow-md transition-all cursor-pointer"
                 onClick={() => router.push(`/treatments/${treatment.id}`)}
               >
                 <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${treatment.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-indigo-500/10 text-indigo-500'}`}>
                        {treatment.status === 'COMPLETED' ? <CheckCircle size={20} /> : <Activity size={20} />}
                    </div>
                    <div>
                        <h4 className="font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors">{treatment.service.title}</h4>
                        <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tighter">
                            <span>{treatment.type.replace('_', '-')}</span>
                            <span className="w-1 h-1 rounded-full bg-[var(--border)]"></span>
                            <span>{new Date(treatment.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                 </div>

                 <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Paid / Total</p>
                        <p className="text-xs font-black text-[var(--foreground)]">₹{totalPaid} / ₹{treatment.finalAmount}</p>
                    </div>
                    {treatment.type === 'MULTI_SESSION' && (
                        <div className="text-right hidden md:block">
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Sessions</p>
                            <p className="text-xs font-black text-[var(--foreground)]">{completedSessions} / {treatment.totalSessions}</p>
                        </div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-indigo-500/10 group-hover:text-indigo-500 transition-all">
                        <ArrowRight size={16} />
                    </div>
                 </div>
               </div>
             );
          })}
        </div>
      )}
    </div>
  );
}
