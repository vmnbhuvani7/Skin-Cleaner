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
      refetch();
      setIsSessionModalOpen(false);
    },
    onError: (err) => toast.error(err.message)
  });

  const [addSession, { loading: addingSession }] = useMutation(ADD_SESSION, {
    onCompleted: () => {
      toast.success('Extra session added');
      refetch();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteSession] = useMutation(DELETE_SESSION, {
    onCompleted: () => {
      toast.success('Session removed');
      refetch();
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

  const handleAddExtraSession = () => {
    const nextSessionNumber = sessions.length > 0 ? Math.max(...sessions.map(s => s.sessionNumber)) + 1 : 1;
    const lastSession = sessions.length > 0 ? sessions[sessions.length - 1] : null;
    const estimatedDate = new Date();
    if (lastSession && lastSession.date) {
        estimatedDate.setTime(new Date(lastSession.date).getTime());
        estimatedDate.setDate(estimatedDate.getDate() + (treatment.intervalDays || 7));
    }
    
    addSession({
      variables: {
        input: {
          treatmentId: id,
          sessionNumber: nextSessionNumber,
          date: estimatedDate.toISOString(),
          status: 'ESTIMATED'
        }
      }
    });
  };



  const handleDeleteSessionClick = (sessionId) => {
    setDeleteSessionId(sessionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteSession = () => {
    if (deleteSessionId) {
      deleteSession({ variables: { id: deleteSessionId } });
      setIsDeleteModalOpen(false);
      setDeleteSessionId(null);
    }
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
              <Button onClick={() => setIsEditModalOpen(true)} variant="secondary" icon={Edit3} className="rounded-2xl h-12">
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
                 <Button 
                   onClick={handleAddExtraSession} 
                   disabled={addingSession}
                   variant="outline" 
                   className="rounded-2xl border-[var(--border)] h-12 gap-2 bg-[var(--surface)] text-[var(--foreground)] font-bold"
                 >
                   <Plus size={20} /> {addingSession ? 'Adding...' : 'Add Extra Session'}
                 </Button>
              )}
            </div>

            <div className="space-y-6 relative before:absolute before:left-[23px] before:top-4 before:bottom-4 before:w-0.5 before:bg-[var(--border)]">
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

      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Treatment Plan"
        size="4xl"
      >
        <div className="pt-4 max-h-[80vh] overflow-y-auto hide-scrollbar">
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
        size="sm"
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
  const isCompleted = session.status === 'COMPLETED';
  const isEstimated = session.status === 'ESTIMATED';
  
  return (
    <div className={`relative flex gap-6 items-start group`}>
      <div className={`z-10 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 ${
        isCompleted ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 
        isNext ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-110' :
        'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]'
      }`}>
        {isCompleted ? <CheckCircle2 size={24} /> : <span className="font-black text-lg">{session.sessionNumber}</span>}
      </div>

      <div className={`flex-1 bg-[var(--surface)] rounded-2xl p-5 border transition-all duration-300 ${
        isNext ? 'border-indigo-500/30 shadow-md ring-1 ring-indigo-500/10' : 'border-[var(--border)] shadow-sm'
      }`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h4 className="text-lg font-black text-[var(--foreground)]">Session {session.sessionNumber}</h4>
              {isEstimated && (
                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Estimated
                </span>
              )}
              {isNext && (
                <span className="bg-indigo-500/10 text-indigo-500 border border-indigo-500/20 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Next Action
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
              <Clock size={14} className="opacity-50" />
              {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {isCompleted && ` at ${new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </p>
          </div>

          <div className="flex items-center gap-4">
            {isCompleted ? (
              <div className="text-right">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Paid</p>
                <p className="text-lg font-black text-emerald-500">₹{session.paidAmount}</p>
              </div>
            ) : (
              <Button 
                onClick={onComplete}
                className={`rounded-xl px-6 h-10 font-bold transition-all ${
                  isNext ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md' : 'bg-[var(--surface-hover)] hover:bg-indigo-500/10 text-[var(--text-muted)] hover:text-indigo-500'
                }`}
              >
                Mark as Completed
              </Button>
            )}
            <div className="relative">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  const menu = e.currentTarget.nextElementSibling;
                  menu.classList.toggle('hidden');
                }}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-lg text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
              >
                <MoreHorizontal size={20} />
              </button>
              <div className="hidden absolute right-0 mt-2 w-48 bg-[var(--surface)] rounded-xl shadow-xl border border-[var(--border)] z-50">
                <div className="p-1">
                  <button 
                    onClick={() => {
                      onComplete();
                      // Assuming a way to close the menu
                    }} 
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-[var(--foreground)] hover:bg-indigo-500/10 hover:text-indigo-400 rounded-lg flex items-center gap-2"
                  >
                    <Edit3 size={16} /> {isCompleted ? 'Edit Payment' : 'Update Session'}
                  </button>
                  <button 
                    onClick={onDelete} 
                    className="w-full text-left px-4 py-2 text-sm font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg flex items-center gap-2"
                  >
                    <Trash2 size={16} /> Delete Session
                  </button>
                </div>
              </div>
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
      <div className="bg-[var(--surface-hover)] p-5 rounded-2xl border border-[var(--border)] flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
            <Info className="text-indigo-500" size={20} />
            <div>
                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Overall Status</p>
                <p className="text-sm font-bold text-[var(--foreground)] leading-tight">
                Session {session.sessionNumber} Completion
                </p>
            </div>
        </div>
        <div className="flex gap-6 md:gap-10">
            <div className="text-right">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Already Paid</p>
                <p className="text-lg font-black text-emerald-500">₹{currentPaid}</p>
            </div>
            <div className="text-right">
                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-0.5">Remaining</p>
                <p className="text-lg font-black text-[var(--foreground)]">₹{remainingAtStart}</p>
            </div>
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
          <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">Consulting Doctor</label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-sm text-[var(--foreground)]">
              <SelectValue placeholder="Select Doctor" />
            </SelectTrigger>
            <SelectContent>
              {doctorsData?.getDoctors?.doctors?.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Online</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-xs">₹</span>
              <Input 
                type="number" 
                value={online} 
                onChange={(e) => setOnline(parseFloat(e.target.value) || 0)}
                className="pl-8 h-12 rounded-2xl bg-[var(--surface-hover)] border-[var(--border)] font-bold text-[var(--foreground)]"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Cash</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] font-bold text-xs">₹</span>
              <Input 
                type="number" 
                value={cash} 
                onChange={(e) => setCash(parseFloat(e.target.value) || 0)}
                className="pl-8 h-12 rounded-2xl bg-[var(--surface-hover)] border-[var(--border)] font-bold text-[var(--foreground)]"
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
                className="pl-8 h-12 rounded-2xl bg-rose-500/10 border-rose-500/20 text-rose-500 font-bold placeholder:text-rose-500/50"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Notes</label>
          <textarea 
            className="w-full p-4 rounded-2xl border border-[var(--border)] focus:ring-2 focus:ring-indigo-500 outline-none transition-all h-24 text-sm font-medium bg-[var(--surface-hover)] text-[var(--foreground)]"
            placeholder="Add any observations or treatment remarks..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="p-6 bg-[var(--foreground)] rounded-[2.5rem] text-[var(--background)] flex flex-col gap-4 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/20 blur-2xl rounded-full"></div>
        
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
