'use client';

import React from 'react';
import { useQuery } from '@apollo/client';
import { Activity, ArrowRight, CheckCircle, Clock, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';

import { GET_PATIENT_TREATMENTS } from '@/graphql/queries/treatment';

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount || 0);
};

export default function PatientTreatments({ patientId }) {
  const router = useRouter();
  const { data, loading, error } = useQuery(GET_PATIENT_TREATMENTS, {
    variables: { patientId },
    skip: !patientId,
    fetchPolicy: 'cache-and-network'
  });

  if (loading) return (
    <div className="py-10 flex flex-col items-center justify-center space-y-3 opacity-50">
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Fetching history...</p>
    </div>
  );
  
  if (error) return (
    <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-2xl flex items-center gap-3 text-rose-500">
      <Activity size={20} />
      <p className="text-sm font-bold">Error loading treatments: {error.message}</p>
    </div>
  );

  const treatments = data?.getPatientTreatments || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest flex items-center gap-2">
            <Activity size={16} className="text-indigo-400" /> Treatment History
          </h3>
          <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Track all clinical records and progress</p>
        </div>
      </div>

      {treatments.length === 0 ? (
        <div className="bg-[var(--surface)] rounded-[2rem] border border-dashed border-[var(--border)] p-12 text-center space-y-4">
          <div className="w-16 h-16 bg-indigo-500/5 rounded-2xl flex items-center justify-center text-indigo-400/30 mx-auto">
            <Activity size={32} />
          </div>
          <p className="text-sm text-[var(--text-muted)] font-medium">No treatment history found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {treatments.map((treatment) => {
             const completedSessions = treatment.sessions?.filter(s => s.status === 'COMPLETED').length || 0;
             const totalPaid = treatment.sessions?.reduce((acc, s) => acc + (s.paidAmount || 0), 0) || 0;
             const progress = treatment.type === 'MULTI_SESSION' 
               ? (completedSessions / treatment.totalSessions) * 100 
               : (treatment.status === 'COMPLETED' ? 100 : 0);
             
             return (
               <div 
                 key={treatment.id}
                 className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 group hover:border-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/5 transition-all cursor-pointer relative overflow-hidden"
                 onClick={() => router.push(`/treatments/${treatment.id}`)}
               >
                 {/* Background Glow */}
                 <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-indigo-500/5 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>

                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 duration-500 shadow-inner ${
                          treatment.status === 'COMPLETED' 
                            ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-emerald-500' 
                            : 'bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 text-indigo-500'
                        }`}>
                            {treatment.status === 'COMPLETED' ? <CheckCircle size={28} /> : <Activity size={28} />}
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-lg font-black text-[var(--foreground)] group-hover:text-indigo-400 transition-colors tracking-tight">
                              {treatment.service.title}
                            </h4>
                            <div className="flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                <span className={`px-2 py-0.5 rounded-md border ${
                                  treatment.type === 'MULTI_SESSION' 
                                    ? 'bg-purple-500/10 border-purple-500/20 text-purple-400' 
                                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                                }`}>
                                  {treatment.type.replace('_', ' ')}
                                </span>
                                <span className="opacity-30">•</span>
                                <span className="flex items-center gap-1.5"><Calendar size={12} className="opacity-50" /> {new Date(treatment.createdAt).toLocaleDateString('en-IN')}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-8 md:gap-12">
                        {treatment.type === 'MULTI_SESSION' && (
                            <div className="space-y-2 min-w-[140px]">
                                <div className="flex justify-between text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                                    <span>Progress</span>
                                    <span className="text-indigo-400">{completedSessions}/{treatment.totalSessions}</span>
                                </div>
                                <div className="w-full h-1.5 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                                    <div 
                                      className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out"
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">Financial Status</p>
                            <p className="text-sm font-black text-[var(--foreground)] flex items-baseline gap-1">
                              <span className="text-emerald-500">₹{formatAmount(totalPaid)}</span>
                              <span className="text-[var(--text-muted)] opacity-30 text-xs">/</span>
                              <span>₹{formatAmount(treatment.finalAmount)}</span>
                            </p>
                        </div>

                      

                        <div className="w-10 h-10 rounded-xl bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-muted)] group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-indigo-500/20">
                            <ArrowRight size={20} />
                        </div>
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
