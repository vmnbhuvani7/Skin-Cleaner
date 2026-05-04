'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { 
  ChevronLeft, Calendar, User, Activity, Clock, 
  CheckCircle2, AlertCircle, Plus, Edit3, Trash2, 
  Wallet, IndianRupee, Info, MoreHorizontal
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Sidebar from '@/components/Sidebar';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-toastify';
import { GET_DOCTORS } from '@/graphql/queries/doctor';

import { GET_TREATMENT_DETAILS } from '@/graphql/queries/treatment';
import { UPDATE_SESSION } from '@/graphql/mutations/treatment';

export default function TreatmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const { loading, error, data, refetch } = useQuery(GET_TREATMENT_DETAILS, {
    variables: { id }
  });

  const [updateSession] = useMutation(UPDATE_SESSION, {
    onCompleted: () => {
      toast.success('Session updated');
      refetch();
      setIsSessionModalOpen(false);
    },
    onError: (err) => toast.error(err.message)
  });

  const { theme } = useTheme();

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  const treatment = data.getTreatment;
  const sessions = treatment.sessions || [];
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
  const totalPaid = sessions.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const remainingBalance = treatment.finalAmount - totalPaid;
  const progress = (completedSessions / treatment.totalSessions) * 100;

  const handleCompleteSession = (session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <div className="max-w-5xl mx-auto space-y-8 pb-20">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-4">
            <button 
              onClick={() => router.push('/treatments')}
              className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 font-bold text-sm transition-all group w-fit"
            >
              <ChevronLeft size={18} className="transition-transform group-hover:-translate-x-1" />
              <span>Back to Treatments</span>
            </button>
            <div className="flex gap-3">
              <Button variant="secondary" icon={Edit3} className="rounded-2xl h-12">
                Edit Plan
              </Button>
            </div>
          </div>

          {/* Treatment Overview Card */}
          <div className="bg-[var(--surface)] rounded-[3rem] shadow-xl border border-[var(--border)] overflow-hidden">
            <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12">
                <Activity size={180} />
              </div>
              
              <div className="relative z-10 space-y-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                        {treatment.type.replace('_', ' ')}
                      </span>
                      <span className="bg-emerald-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-emerald-900 shadow-lg shadow-emerald-400/20">
                        {treatment.status}
                      </span>
                    </div>
                    <h1 className="text-5xl font-black tracking-tight">{treatment.service.title}</h1>
                    <div className="flex flex-wrap items-center gap-6 text-indigo-100 text-sm font-bold">
                      <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"><User size={18} /> {treatment.patient.name}</span>
                      <span className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/10"><Calendar size={18} /> Started {new Date(parseInt(treatment.createdAt)).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-2xl p-6 rounded-[2rem] border border-white/20 min-w-[280px] shadow-2xl">
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-4">Financial Status</p>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="opacity-80 font-bold text-xs uppercase tracking-wider">Total Amount</span>
                        <span className="font-black text-xl">₹{treatment.finalAmount}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="opacity-80 font-bold text-xs uppercase tracking-wider">Paid so far</span>
                        <span className="font-black text-xl text-emerald-300">₹{totalPaid}</span>
                      </div>
                      <div className="pt-3 mt-1 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest">Balance Due</span>
                        <span className={`text-2xl font-black ${remainingBalance > 0 ? 'text-rose-300 drop-shadow-[0_0_10px_rgba(253,164,175,0.3)]' : 'text-emerald-300'}`}>₹{remainingBalance}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {treatment.type === 'MULTI_SESSION' && (
                  <div className="space-y-4 pt-6">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest opacity-80">
                      <span>Treatment Progress</span>
                      <span>{completedSessions} of {treatment.totalSessions} sessions completed</span>
                    </div>
                    <div className="h-4 w-full bg-white/10 rounded-full overflow-hidden border border-white/10">
                      <div 
                        className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_25px_rgba(255,255,255,0.6)]"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between items-center">
                       <p className="text-[10px] font-black uppercase tracking-widest opacity-60 flex items-center gap-2 italic">
                         <Clock size={12} /> Interval: Every {treatment.intervalDays} days
                       </p>
                       <p className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-lg">{Math.round(progress)}% Complete</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sessions Timeline */}
          <div className="space-y-8 mt-12">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Timeline</h2>
              {treatment.type === 'MULTI_SESSION' && (
                 <Button variant="outline" className="rounded-2xl border-[var(--border)] h-12 gap-2 bg-[var(--surface)] text-[var(--foreground)] font-bold">
                   <Plus size={20} /> Add Extra Session
                 </Button>
              )}
            </div>

            <div className="space-y-6 relative before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-[var(--border)]">
              {sessions.map((session, index) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onComplete={() => handleCompleteSession(session)}
                  isNext={session.status !== 'COMPLETED' && (index === 0 || sessions[index-1].status === 'COMPLETED')}
                />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Modal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        title={`Session ${selectedSession?.sessionNumber} Details`}
        size="md"
      >
        {selectedSession && (
          <SessionCompletionForm 
            session={selectedSession}
            treatment={data.getTreatment}
            onSubmit={(values) => {
              updateSession({
                variables: {
                  id: selectedSession.id,
                  input: {
                    ...values,
                    status: 'COMPLETED'
                  }
                }
              });
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function SessionCard({ session, onComplete, isNext }) {
  const isCompleted = session.status === 'COMPLETED';
  const isEstimated = session.status === 'ESTIMATED';
  
  return (
    <div className={`relative flex gap-6 items-start group`}>
      <div className={`z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100' : 
        isNext ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 scale-110' :
        'bg-white border-gray-200 text-gray-400'
      }`}>
        {isCompleted ? <CheckCircle2 size={24} /> : <span className="font-black text-lg">{session.sessionNumber}</span>}
      </div>

      <div className={`flex-1 bg-white rounded-2xl p-5 border transition-all duration-300 ${
        isNext ? 'border-indigo-200 shadow-md ring-1 ring-indigo-50' : 'border-gray-100 shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black text-gray-900">Session {session.sessionNumber}</h4>
              {isEstimated && (
                <span className="bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Estimated
                </span>
              )}
              {isNext && (
                <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Next Action
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 flex items-center gap-1.5 font-medium">
              <Clock size={14} className="text-gray-400" />
              {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {isCompleted && ` at ${new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isCompleted ? (
              <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Paid</p>
                <p className="text-lg font-black text-emerald-600">₹{session.paidAmount}</p>
              </div>
            ) : (
              <Button 
                onClick={onComplete}
                className={`rounded-xl px-6 h-10 font-bold transition-all ${
                  isNext ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                Mark as Completed
              </Button>
            )}
            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {isCompleted && session.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
             <p className="text-xs text-gray-600 italic">"{session.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCompletionForm({ session, treatment, onSubmit }) {
  const { data: doctorsData } = useQuery(GET_DOCTORS, { variables: { limit: 100 } });
  const [date, setDate] = useState(session.date ? new Date(session.date) : new Date());
  const [online, setOnline] = useState(0);
  const [cash, setCash] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [doctorId, setDoctorId] = useState(session.doctor?.id || '');
  const [notes, setNotes] = useState('');

  const currentPaid = treatment.sessions?.reduce((acc, s) => acc + (s.paidAmount || 0), 0) || 0;
  const currentDiscount = treatment.sessions?.reduce((acc, s) => acc + (s.discount || 0), 0) || 0;
  const remainingAtStart = treatment.finalAmount - currentPaid - currentDiscount;
  const totalThisSession = online + cash;
  const newRemaining = remainingAtStart - totalThisSession - discount;

  return (
    <div className="space-y-6 pt-2">
      <div className="bg-indigo-50 p-5 rounded-2xl border border-indigo-100 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Info className="text-indigo-600" size={20} />
            <div>
                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Overall Status</p>
                <p className="text-sm font-bold text-indigo-900 leading-tight">
                Session {session.sessionNumber} Completion
                </p>
            </div>
        </div>
        <div className="text-right">
            <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Remaining Balance</p>
            <p className="text-lg font-black text-indigo-900">₹{remainingAtStart}</p>
        </div>
      </div>

      <div className="space-y-5">
        <DateTimePicker
          label="Session Date & Time"
          date={date}
          setDate={setDate}
          placeholder="Select date and time"
          className="h-12 bg-[var(--surface-hover)] border-[var(--border)] rounded-2xl"
        />

        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Consulting Doctor</label>
          <select 
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
            className="w-full h-12 px-4 rounded-2xl border border-gray-200 bg-white focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-sm"
          >
            <option value="">Select Doctor</option>
            {doctorsData?.getDoctors?.doctors?.map(d => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Online</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
              <Input 
                type="number" 
                value={online} 
                onChange={(e) => setOnline(parseFloat(e.target.value) || 0)}
                className="pl-8 h-12 rounded-2xl bg-white border-gray-200 font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Cash</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xs">₹</span>
              <Input 
                type="number" 
                value={cash} 
                onChange={(e) => setCash(parseFloat(e.target.value) || 0)}
                className="pl-8 h-12 rounded-2xl bg-white border-gray-200 font-bold"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest ml-1">Discount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-300 font-bold text-xs">₹</span>
              <Input 
                type="number" 
                value={discount} 
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="pl-8 h-12 rounded-2xl bg-white border-rose-100 text-rose-600 font-bold placeholder:text-rose-200"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Notes</label>
          <textarea 
            className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 text-sm font-medium bg-white"
            placeholder="Add any observations or treatment remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="p-6 bg-gray-900 rounded-[2.5rem] text-white flex flex-col gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 blur-2xl rounded-full"></div>
        
        <div className="flex justify-between items-center relative z-10">
          <div>
            <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">Total Payment</p>
            <p className="text-3xl font-black">₹{totalThisSession}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1">New Balance</p>
            <p className={`text-xl font-black ${newRemaining > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>₹{newRemaining}</p>
          </div>
        </div>
        
        <Button 
          onClick={() => onSubmit({ 
            onlinePayment: online, 
            cashPayment: cash, 
            paidAmount: totalThisSession, 
            discount: discount,
            date: date instanceof Date ? date.toISOString() : date,
            notes, 
            doctorId 
          })}
          className="bg-emerald-500 hover:bg-emerald-600 text-white font-black h-14 rounded-2xl shadow-lg shadow-emerald-900/40 uppercase tracking-widest text-xs"
        >
          Confirm & Complete Session
        </Button>
      </div>
    </div>
  );
}
