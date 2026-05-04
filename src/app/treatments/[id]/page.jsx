'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { 
  ChevronLeft, Calendar, User, Activity, Clock, 
  CheckCircle2, AlertCircle, Plus, Edit3, Trash2, 
  Wallet, IndianRupee, Info, MoreHorizontal,
  ArrowRight
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import Sidebar from '@/components/Sidebar';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';
import { useTheme } from '@/context/ThemeContext';
import { toast } from 'react-toastify';
import { GET_DOCTORS } from '@/graphql/queries/doctor';

import { GET_TREATMENT_DETAILS } from '@/graphql/queries/treatment';
import { UPDATE_SESSION, ADD_SESSION, DELETE_SESSION, UPDATE_TREATMENT } from '@/graphql/mutations/treatment';
import TreatmentForm from '@/components/clinical/TreatmentForm';

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount || 0);
};

export default function TreatmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const { loading, error, data, refetch } = useQuery(GET_TREATMENT_DETAILS, {
    variables: { id }
  });

  const [updateSession] = useMutation(UPDATE_SESSION, {
    onCompleted: () => {
      toast.success('Session updated');
      setIsSessionModalOpen(false);
    },
    onError: (err) => toast.error(err.message)
  });

  const [addSession, { loading: addingSession }] = useMutation(ADD_SESSION, {
    onCompleted: () => {
      toast.success('Extra session added');
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteSession] = useMutation(DELETE_SESSION, {
    onCompleted: () => {
      toast.success('Session removed');
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateTreatment] = useMutation(UPDATE_TREATMENT, {
    onCompleted: () => {
      // Manual refetch will be handled in callers
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

  const handleAddExtraSession = async () => {
    const nextSessionNumber = sessions.length > 0 ? Math.max(...sessions.map(s => s.sessionNumber)) + 1 : 1;
    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    const estimatedDate = new Date();
    if (lastSession && lastSession.date) {
        estimatedDate.setTime(new Date(lastSession.date).getTime());
        estimatedDate.setDate(estimatedDate.getDate() + (treatment.intervalDays || 7));
    }
    
    try {
      await addSession({
        variables: {
          input: {
            treatmentId: id,
            sessionNumber: nextSessionNumber,
            date: estimatedDate.toISOString(),
            status: 'ESTIMATED'
          }
        }
      });

      // Increment total sessions in treatment plan
      await updateTreatment({
        variables: {
          id: id,
          input: {
            totalSessions: treatment.totalSessions + 1
          }
        }
      });

      refetch();
    } catch (err) {
      console.error(err);
    }
  };



  const handleDeleteSessionClick = (sessionId) => {
    setDeleteSessionId(sessionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSession = async () => {
    if (deleteSessionId) {
      try {
        await deleteSession({ variables: { id: deleteSessionId } });
        
        // Decrement total sessions in treatment plan
        await updateTreatment({
          variables: {
            id: id,
            input: {
              totalSessions: Math.max(1, treatment.totalSessions - 1)
            }
          }
        });

        refetch();
        setIsDeleteModalOpen(false);
        setDeleteSessionId(null);
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <div className="max-w-5xl mx-auto space-y-6 pb-20">
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
              <Button onClick={() => setIsEditModalOpen(true)} variant="secondary" icon={Edit3} className="rounded-2xl h-12">
                Edit Plan
              </Button>
            </div>
          </div>

          {/* Treatment Overview Card */}
          <div className="bg-[var(--surface)] rounded-[2.5rem] shadow-xl border border-[var(--border)] overflow-hidden transition-all duration-500">
            <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 p-8 text-white relative overflow-hidden">
              <div className="absolute -right-10 -top-10 opacity-10 rotate-12">
                <Activity size={240} />
              </div>
              
              <div className="relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                  <div className="space-y-6 flex-1">
                    <div className="flex items-center gap-3">
                      <span className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/10">
                        {treatment.type.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg ${
                        treatment.status === 'COMPLETED' ? 'bg-emerald-400 text-emerald-900 shadow-emerald-400/20' : 'bg-blue-400 text-blue-900 shadow-blue-400/20'
                      }`}>
                        {treatment.status.replace('_', ' ')}
                      </span>
                    </div>
                    
                    <div>
                      <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-3 leading-tight">{treatment.service.title}</h1>
                      <div className="flex flex-wrap items-center gap-4 text-indigo-100 text-[13px] font-bold">
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                          <User size={16} /> {treatment.patient.name}
                        </span>
                        <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                          <Calendar size={16} /> Started {treatment.createdAt ? new Date(treatment.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {treatment.type === 'MULTI_SESSION' && (
                      <div className="space-y-3 pt-2 max-w-md">
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-70">
                          <span>Progress: {completedSessions} / {treatment.totalSessions} Sessions</span>
                          <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden border border-white/10 p-0.5">
                          <div 
                            className="h-full bg-white rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(255,255,255,0.4)]"
                            style={{ width: `${progress}%` }}
                          ></div>
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-widest opacity-50 flex items-center gap-1.5">
                          <Clock size={12} /> Interval: Every {treatment.intervalDays} days
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="bg-white/10 backdrop-blur-3xl p-6 rounded-[2rem] border border-white/10 min-w-[280px] shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors"></div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-50 mb-5 flex items-center gap-2">
                      <Wallet size={12} /> Financial Status
                    </p>
                    <div className="space-y-4 relative z-10">
                      <div className="flex justify-between items-center opacity-80">
                        <span className="font-bold text-[10px] uppercase tracking-widest">Total Amount</span>
                        <span className="font-black text-lg">₹{formatAmount(treatment.finalAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center text-emerald-300">
                        <span className="font-bold text-[10px] uppercase tracking-widest">Paid so far</span>
                        <span className="font-black text-lg">₹{formatAmount(totalPaid)}</span>
                      </div>
                      <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                        <span className="text-[11px] font-black uppercase tracking-widest opacity-60">Balance Due</span>
                        <span className={`text-2xl font-black ${remainingBalance > 0 ? 'text-rose-300 drop-shadow-[0_0_10px_rgba(253,164,175,0.3)]' : 'text-emerald-300'}`}>₹{formatAmount(remainingBalance)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Timeline */}
          <div className="space-y-6 mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-black text-[var(--foreground)] tracking-tight">Timeline</h2>
              {treatment.type === 'MULTI_SESSION' && (
                 <Button 
                   onClick={handleAddExtraSession} 
                   disabled={addingSession}
                   variant="outline" 
                   className="rounded-2xl border-[var(--border)] h-10 px-5 gap-2 bg-[var(--surface)] text-[var(--foreground)] font-black text-[10px] uppercase tracking-widest transition-all hover:border-indigo-500/30 shadow-sm"
                 >
                   <Plus size={16} /> {addingSession ? 'Adding...' : 'Add Extra Session'}
                 </Button>
              )}
            </div>

            <div className="space-y-4 relative before:absolute before:left-[19px] md:before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-[var(--border)]">
              {sessions.map((session, index) => (
                <SessionCard 
                  key={session.id} 
                  session={session} 
                  onComplete={() => handleCompleteSession(session)}
                  onDelete={() => handleDeleteSessionClick(session.id)}
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
            onClose={() => setIsSessionModalOpen(false)}
            onSubmit={(values) => {
              updateSession({
                variables: {
                  id: selectedSession.id,
                  input: {
                    ...values,
                    status: 'COMPLETED'
                  }
                }
              }).then(() => refetch());
            }}
          />
        )}
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Treatment Plan"
        size="4xl"
      >
        <div className="max-h-[80vh] overflow-y-auto hide-scrollbar">
          <TreatmentForm 
            treatment={treatment} 
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => {
              setIsEditModalOpen(false);
              refetch();
            }}
          />
        </div>
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        size="max-w-md"
      >
        <div className="text-center pt-2">
          <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
            <Trash2 size={40} />
          </div>
          <h4 className="text-[var(--foreground)] text-lg font-black tracking-tight mb-2">Are you absolutely sure?</h4>
          <p className="text-[var(--text-muted)] text-sm mb-10 font-medium">
            This action cannot be undone. This will permanently remove the session record.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-4 px-6 bg-[var(--surface-hover)] hover:bg-indigo-500/10 text-[var(--foreground)] font-bold rounded-2xl transition-all border border-[var(--border)]"
            >
              Cancel
            </button>
            <button 
              onClick={confirmDeleteSession}
              className="flex-1 py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all uppercase tracking-widest text-xs"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function SessionCard({ session, onComplete, onDelete, isNext }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isCompleted = session.status === 'COMPLETED';
  const isEstimated = session.status === 'ESTIMATED';
  
  return (
    <div className="relative flex gap-4 md:gap-6 items-start group">
      <div className={`z-10 w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
        isNext ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-105' :
        'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]'
      }`}>
        {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-black text-base md:text-lg">{session.sessionNumber}</span>}
      </div>

      <div className={`flex-1 bg-[var(--surface)] rounded-2xl p-4 md:p-5 border transition-all duration-300 ${
        isNext ? 'border-indigo-500/30 shadow-md ring-1 ring-indigo-500/10' : 'border-[var(--border)] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-base md:text-lg font-black text-[var(--foreground)]">Session {session.sessionNumber}</h4>
              <div className="flex gap-1.5">
                {isEstimated && (
                  <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Estimated
                  </span>
                )}
                {isNext && (
                  <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Next
                  </span>
                )}
              </div>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] flex items-center gap-1.5 font-bold opacity-70">
              <Calendar size={12} className="opacity-50" />
              {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              {isCompleted && (
                <>
                  <span className="opacity-30">•</span>
                  <Clock size={12} className="opacity-50" />
                  {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </>
              )}
            </p>
          </div>

          <div className="flex items-center gap-4 justify-between sm:justify-end">
            {isCompleted ? (
              <div className="text-right">
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Paid Amount</p>
                <p className="text-lg font-black text-emerald-500">₹{formatAmount(session.paidAmount)}</p>
              </div>
            ) : (
              <Button 
                onClick={onComplete}
                className="rounded-xl px-4 md:px-6 h-9 md:h-10 text-xs font-black transition-all bg-indigo-600 hover:bg-indigo-700 text-white shadow-md uppercase tracking-widest"
              >
                Complete
              </Button>
            )}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <MoreHorizontal size={20} />
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border)] z-50">
                  <div className="p-1">
                    <button 
                      onClick={() => {
                        onComplete();
                        setIsMenuOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-indigo-500/10 hover:text-indigo-400 rounded-lg flex items-center gap-2"
                    >
                      <Edit3 size={16} /> {isCompleted ? 'Edit Payment' : 'Update Session'}
                    </button>
                    <button 
                      onClick={() => {
                        onDelete();
                        setIsMenuOpen(false);
                      }} 
                      className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                    >
                      <Trash2 size={16} /> Delete Session
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isCompleted && session.notes && (
          <div className="mt-4 p-3 bg-[var(--surface-hover)] rounded-xl border border-[var(--border)]">
             <p className="text-xs text-[var(--text-muted)] italic">"{session.notes}"</p>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCompletionForm({ session, treatment, onSubmit, onClose }) {
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
      {/* Top Section: Schedule & Notes */}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Session Date & Time</label>
            <DateTimePicker
              date={date}
              setDate={setDate}
              placeholder="Select date and time"
              className="w-full h-11 bg-[var(--surface-hover)] border-[var(--border)] rounded-xl font-bold shadow-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Consulting Doctor</label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger className="w-full h-11 rounded-xl border border-[var(--border)] bg-[var(--surface-hover)] focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-xs text-[var(--foreground)] shadow-sm">
                <SelectValue placeholder="Select Doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctorsData?.getDoctors?.doctors?.map(d => (
                  <SelectItem key={d.id} value={d.id} className="font-bold">{d.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Observations / Notes</label>
          <textarea 
            className="w-full p-4 rounded-xl border border-[var(--border)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-[110px] text-sm font-medium bg-[var(--surface-hover)] text-[var(--foreground)] shadow-sm placeholder:opacity-30"
            placeholder="Add any observations or treatment remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* Payment Details Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
          <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Session Settlement Details</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--surface-hover)]/50 p-4 rounded-2xl border border-[var(--border)]">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">Online Payment</label>
            <Input
              type="number"
              value={online}
              onChange={(e) => setOnline(parseFloat(e.target.value) || 0)}
              icon={IndianRupee}
              className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10"
            />
          </div>
          <div className="bg-[var(--surface-hover)]/50 p-4 rounded-2xl border border-[var(--border)]">
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">Cash Payment</label>
            <Input
              type="number"
              value={cash}
              onChange={(e) => setCash(parseFloat(e.target.value) || 0)}
              icon={IndianRupee}
              className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10"
            />
          </div>
          <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
            <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 ml-1">Extra Discount</label>
            <Input
              type="number"
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              icon={IndianRupee}
              className="h-12 rounded-xl bg-[var(--surface)] border-rose-500/20 text-rose-500 font-bold pl-10 placeholder:text-rose-200"
            />
          </div>
        </div>
      </div>

      {/* Highlight Summary Bar */}
      <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 flex flex-col items-center justify-between overflow-hidden relative group">
        <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
          <Activity size={100} />
        </div>

        <div className="flex flex-wrap items-center gap-6 md:gap-10 relative z-10 w-full justify-between sm:justify-start">
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100/40 mb-1">Session Total</span>
            <span className="text-2xl font-black text-white">₹{formatAmount(totalThisSession)}</span>
          </div>
          <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100/40 mb-1">Prev. Balance</span>
            <span className="text-2xl font-black text-white/90">₹{formatAmount(remainingAtStart)}</span>
          </div>
          <div className="w-px h-10 bg-white/20 hidden sm:block"></div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-100/40 mb-1">New Balance</span>
            <span className={`text-2xl font-black ${newRemaining > 0 ? 'text-rose-300' : 'text-emerald-300'}`}>
              ₹{formatAmount(newRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 bg-[var(--surface)] pt-6 border-t border-[var(--border)] flex justify-end gap-3 z-10 pb-2 mt-4">
        <Button 
          variant="ghost" 
          onClick={onClose} 
          className="px-8 h-12 rounded-xl font-black text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--foreground)]"
        >
          Cancel
        </Button>
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
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-12 rounded-xl font-black shadow-xl shadow-indigo-600/20 tracking-widest uppercase text-[10px] flex items-center justify-center gap-2 group/btn transition-all active:scale-95"
        >
          <span>Complete Settlement</span>
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
