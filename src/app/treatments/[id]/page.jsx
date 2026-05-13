'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { 
  ChevronLeft, Calendar, User, Activity, Clock, 
  CheckCircle2, AlertCircle, Plus, Edit3, Trash2, 
  Wallet, IndianRupee, Info, MoreHorizontal,
  ArrowRight, ShieldCheck, Heart, Zap, Star
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
import ViewToggle from '@/components/ui/ViewToggle';
import DataTable from '@/components/ui/DataTable';

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount || 0);
};

export default function TreatmentDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { theme } = useTheme();
  
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const { loading, error, data, refetch } = useQuery(GET_TREATMENT_DETAILS, {
    variables: { id }
  });

  const [updateSession] = useMutation(UPDATE_SESSION);
  const [addSession, { loading: addingSession }] = useMutation(ADD_SESSION);
  const [deleteSession] = useMutation(DELETE_SESSION);
  const [updateTreatment] = useMutation(UPDATE_TREATMENT);

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  const treatment = data.getTreatment;
  const sessions = [...(treatment.sessions || [])].sort((a, b) => a.sessionNumber - b.sessionNumber);
  const completedSessions = sessions.filter(s => s.status === 'COMPLETED').length;
  const totalPaid = sessions.reduce((acc, s) => acc + (s.paidAmount || 0), 0);
  const remainingBalance = treatment.finalAmount - totalPaid;
  const progress = (completedSessions / treatment.totalSessions) * 100;

  const handleCompleteSession = (session) => {
    setSelectedSession(session);
    setIsSessionModalOpen(true);
  };

  const sessionColumns = [
    {
      header: 'Session',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${
            row.status === 'COMPLETED' ? 'bg-success-500/10 text-success-500' : 'bg-primary-500/10 text-primary-400'
          }`}>
            {row.sessionNumber}
          </div>
          <span className="font-bold text-[var(--foreground)]">Session {row.sessionNumber}</span>
        </div>
      )
    },
    {
      header: 'Date & Time',
      accessor: (row) => (
        <div className="flex flex-col">
          <span className="text-xs font-bold text-[var(--foreground)]">{new Date(row.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          <span className="text-[10px] text-[var(--text-muted)] font-medium opacity-60">{new Date(row.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
      header: 'Doctor',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-primary-500/10 flex items-center justify-center text-primary-400">
            <User size={12} />
          </div>
          <span className="text-xs font-bold text-[var(--foreground)]">{row.doctor?.name || 'Not assigned'}</span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border ${
          row.status === 'COMPLETED' ? 'bg-success-500/10 text-success-500 border-success-500/20' :
          row.status === 'ESTIMATED' ? 'bg-warning-500/10 text-warning-500 border-warning-500/20' :
          'bg-primary-500/10 text-primary-400 border-primary-500/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Paid Amount',
      accessor: (row) => (
        <span className={`text-sm font-black ${row.paidAmount > 0 ? 'text-success-500' : 'text-[var(--text-muted)] opacity-40'}`}>
          ₹{formatAmount(row.paidAmount)}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
          <Button variant="ghost" size="icon" onClick={() => handleCompleteSession(row)} className="hover:bg-primary-500/10 text-primary-400"><Edit3 size={16} /></Button>
          <Button variant="ghost" size="icon" onClick={() => { setDeleteSessionId(row.id); setIsDeleteModalOpen(true); }} className="hover:bg-danger-500/10 text-danger-500"><Trash2 size={16} /></Button>
        </div>
      )
    }
  ];

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

      await updateTreatment({
        variables: {
          id: id,
          input: { totalSessions: treatment.totalSessions + 1 }
        }
      });

      refetch();
      toast.success('Extra session added');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const confirmDeleteSession = async () => {
    if (!deleteSessionId) return;
    try {
      await deleteSession({ variables: { id: deleteSessionId } });
      await updateTreatment({
        variables: {
          id: id,
          input: { totalSessions: Math.max(1, treatment.totalSessions - 1) }
        }
      });
      refetch();
      setIsDeleteModalOpen(false);
      setDeleteSessionId(null);
      toast.success('Session removed');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <div className="max-w-6xl mx-auto space-y-10 pb-20">
          {/* Ultra-Condensed Header */}
          <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/treatments')}
                className="w-9 h-9 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--text-muted)] hover:text-primary-400 shadow-sm"
              >
                <ChevronLeft size={18} />
              </Button>
              <h1 className="text-xl font-black text-[var(--foreground)] tracking-tight">Treatment Details</h1>
              <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 text-[8px] font-black uppercase tracking-widest rounded-md border border-primary-500/20">
                ID: {treatment.id.slice(-8)}
              </span>
            </div>
            <Button onClick={() => setIsEditModalOpen(true)} variant="outline" className="rounded-lg h-9 px-4 font-black uppercase tracking-widest text-[8px] border-[var(--border)] bg-[var(--surface)]">
              <Edit3 size={14} className="mr-2" /> Edit Plan
            </Button>
          </div>

          {/* 2026 Bento Grid Hero Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Treatment & Patient Module (Bento Tile 1) */}
            <div className="lg:col-span-8 group relative h-full">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-6 shadow-lg h-full flex flex-col justify-between backdrop-blur-xl">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2 bg-primary-500/5 border border-primary-500/10 px-2 py-1 rounded-md text-primary-400">
                        <Zap size={10} />
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{treatment.type.replace('_', ' ')}</span>
                      </div>
                      <div className={`flex items-center gap-2 border px-2 py-1 rounded-md ${
                        treatment.status === 'COMPLETED' ? 'bg-success-500/5 border-success-500/10 text-success-500' : 'bg-primary-500/5 border-primary-500/10 text-primary-400'
                      }`}>
                        <div className={`w-1 h-1 rounded-full ${treatment.status === 'COMPLETED' ? 'bg-success-500' : 'bg-primary-500 animate-pulse'}`}></div>
                        <span className="text-[8px] font-black uppercase tracking-[0.2em]">{treatment.status.replace('_', ' ')}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-6 text-[var(--foreground)] group-hover:text-primary-400 transition-colors">
                      {treatment.service.title}
                    </h2>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border)] p-1.5 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center border border-[var(--border)]">
                          {treatment.patient.image ? <img src={treatment.patient.image} className="w-full h-full object-cover rounded-lg" /> : <User size={16} className="text-primary-400" />}
                        </div>
                        <div className="overflow-hidden">
                          <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">Patient</p>
                          <p className="font-bold text-sm text-[var(--foreground)] truncate">{treatment.patient.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 bg-[var(--surface-hover)] border border-[var(--border)] p-1.5 rounded-xl">
                        <div className="w-9 h-9 rounded-lg bg-primary-500/10 flex items-center justify-center text-primary-400 border border-[var(--border)]">
                          <Calendar size={16} />
                        </div>
                        <div>
                          <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">Launch</p>
                          <p className="font-bold text-sm text-[var(--foreground)]">{new Date(treatment.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {treatment.type === 'MULTI_SESSION' && (
                  <div className="mt-6 pt-4 border-t border-[var(--border)]">
                    <div className="flex justify-between items-center mb-2">
                       <p className="text-[8px] font-black uppercase tracking-[0.2em] text-primary-400">Progression</p>
                       <span className="text-[10px] font-black text-primary-500">{Math.round(progress)}% Complete</span>
                    </div>
                    <div className="h-1.5 w-full bg-[var(--surface-hover)] rounded-full overflow-hidden border border-[var(--border)]">
                      <div className="h-full bg-primary-500 rounded-full transition-all duration-1000" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Financial Health & Stats (Bento Tile 2) */}
            <div className="lg:col-span-4 grid grid-cols-1">
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-400">Financials</p>
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500/50"></div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40">Contract</p>
                        <p className="text-xl font-black text-[var(--foreground)]">₹{formatAmount(treatment.finalAmount)}</p>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-[var(--surface-hover)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)]">
                        <IndianRupee size={16} />
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-[7px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-40">Liquidated</p>
                        <p className="text-xl font-black text-success-500">₹{formatAmount(totalPaid)}</p>
                      </div>
                      <div className="w-9 h-9 rounded-lg bg-success-500/5 border border-success-500/10 flex items-center justify-center text-success-500">
                        <Zap size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)] mt-4">
                  <div className={`p-4 rounded-xl flex items-center justify-between ${remainingBalance > 0 ? 'bg-danger-500/5 border border-danger-500/10' : 'bg-success-500/5 border border-success-500/10'}`}>
                    <div>
                      <p className={`text-[7px] font-black uppercase tracking-widest ${remainingBalance > 0 ? 'text-danger-500/60' : 'text-success-500/60'}`}>Balance</p>
                      <p className={`text-2xl font-black tracking-tight ${remainingBalance > 0 ? 'text-danger-500' : 'text-success-500'}`}>₹{formatAmount(remainingBalance)}</p>
                    </div>
                    {remainingBalance === 0 ? <ShieldCheck size={20} className="text-success-500" /> : <AlertCircle size={20} className="text-danger-500" />}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sessions Timeline Section */}
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                 <h2 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Timeline</h2>
                 <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-500/20">
                   {sessions.length} Events
                 </span>
              </div>
              <div className="flex items-center gap-4">
                <ViewToggle mode={viewMode} setMode={setViewMode} />
                {treatment.type === 'MULTI_SESSION' && (
                  <Button 
                    onClick={handleAddExtraSession} 
                    disabled={addingSession}
                    variant="outline" 
                    className="rounded-2xl border-[var(--border)] h-12 px-6 gap-3 bg-[var(--surface)] text-[var(--foreground)] font-black text-[10px] uppercase tracking-widest transition-all hover:border-primary-500 hover:text-primary-400 shadow-sm active:scale-95"
                  >
                    <Plus size={18} /> {addingSession ? 'Processing...' : 'Add Extra Session'}
                  </Button>
                )}
              </div>
            </div>

            {viewMode === 'grid' ? (
              <div className="space-y-4 relative before:absolute before:left-[19px] md:before:left-[23px] before:top-6 before:bottom-6 before:w-0.5 before:bg-[var(--border)] before:opacity-50">
                {sessions.map((session, index) => (
                  <SessionCard 
                    key={session.id} 
                    session={session} 
                    onComplete={() => handleCompleteSession(session)}
                    onDelete={() => {
                      setDeleteSessionId(session.id);
                      setIsDeleteModalOpen(true);
                    }}
                    isNext={session.status !== 'COMPLETED' && (index === 0 || sessions[index-1].status === 'COMPLETED')}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
                <DataTable columns={sessionColumns} data={sessions} isLoading={loading} />
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Standardized Modals */}
      <Modal isOpen={isSessionModalOpen} onClose={() => setIsSessionModalOpen(false)} title={`Complete Session ${selectedSession?.sessionNumber}`} size="md">
        {selectedSession && (
          <SessionCompletionForm 
            session={selectedSession}
            treatment={treatment}
            onClose={() => setIsSessionModalOpen(false)}
            onSubmit={(values) => {
              updateSession({
                variables: {
                  id: selectedSession.id,
                  input: { ...values, status: 'COMPLETED' }
                }
              }).then(() => {
                refetch();
                toast.success('Session updated');
                setIsSessionModalOpen(false);
              });
            }}
          />
        )}
      </Modal>

      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Modify Treatment Plan" size="4xl">
        <div className="max-h-[80vh] overflow-y-auto hide-scrollbar px-1">
          <TreatmentForm 
            treatment={treatment} 
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={() => { setIsEditModalOpen(false); refetch(); toast.success('Plan updated'); }}
          />
        </div>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" size="max-w-md">
        <div className="text-center pt-2">
          <div className="w-20 h-20 bg-danger-500/10 rounded-[2rem] flex items-center justify-center text-danger-500 mx-auto mb-6">
            <Trash2 size={40} />
          </div>
          <h4 className="text-[var(--foreground)] text-lg font-black tracking-tight mb-2">Delete Session {sessions.find(s => s.id === deleteSessionId)?.sessionNumber}?</h4>
          <p className="text-[var(--text-muted)] text-sm mb-10 font-medium opacity-80 px-4">This will permanently remove the record and adjust the treatment plan. This action cannot be reversed.</p>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => setIsDeleteModalOpen(false)} className="flex-1">Cancel</Button>
            <Button variant="danger" onClick={confirmDeleteSession} className="flex-1">Confirm Delete</Button>
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
      <div className={`z-10 w-10 h-10 md:w-12 md:h-12 rounded-[1.25rem] flex items-center justify-center border-2 transition-all duration-500 shrink-0 ${
        isCompleted ? 'bg-success-500 border-success-500 text-white shadow-xl shadow-success-500/20' : 
        isNext ? 'bg-primary-600 border-primary-600 text-white shadow-xl shadow-primary-600/20 scale-110' :
        'bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)] opacity-60'
      }`}>
        {isCompleted ? <CheckCircle2 size={20} /> : <span className="font-black text-sm md:text-base">{session.sessionNumber}</span>}
      </div>

      <div className={`flex-1 bg-[var(--surface)] rounded-[2rem] p-6 border transition-all duration-300 group-hover:bg-[var(--surface-hover)] ${
        isNext ? 'border-primary-500/40 shadow-xl ring-4 ring-primary-500/5' : 'border-[var(--border)] shadow-sm'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <h4 className="text-lg font-black text-[var(--foreground)]">Session {session.sessionNumber}</h4>
              <div className="flex gap-2">
                {isEstimated && <span className="bg-warning-500/10 text-warning-500 border border-warning-500/20 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Estimated</span>}
                {isNext && <span className="bg-primary-500/10 text-primary-400 border border-primary-500/20 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Up Next</span>}
                {isCompleted && <span className="bg-success-500/10 text-success-500 border border-success-500/20 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">Verified</span>}
              </div>
            </div>
            <p className="text-[12px] text-[var(--text-muted)] flex items-center gap-2 font-bold opacity-70">
              <Calendar size={14} className="text-primary-400" />
              {new Date(session.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              <span className="opacity-30">•</span>
              <Clock size={14} className="text-primary-400" />
              {new Date(session.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          <div className="flex items-center gap-6">
            {isCompleted ? (
              <div className="text-right">
                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-40 mb-1">Paid Amount</p>
                <div className="flex items-center gap-1 text-success-500">
                  <span className="text-sm font-bold">₹</span>
                  <span className="text-2xl font-black">{formatAmount(session.paidAmount)}</span>
                </div>
              </div>
            ) : (
              <Button onClick={onComplete} className="rounded-xl px-8 h-10 text-[10px] font-black transition-all bg-primary-600 hover:bg-primary-700 text-white shadow-xl shadow-primary-600/20 uppercase tracking-[0.2em] active:scale-95">
                Record Entry
              </Button>
            )}
            
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="w-10 h-10 hover:bg-primary-500/10 text-[var(--text-muted)] hover:text-primary-400"
              >
                <MoreHorizontal size={20} />
              </Button>
              {isMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] z-50 p-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <Button variant="ghost" onClick={() => { onComplete(); setIsMenuOpen(false); }} className="w-full justify-start px-4 py-3 text-xs uppercase tracking-widest text-[var(--foreground)] hover:bg-primary-500/10 hover:text-primary-400 gap-3">
                    <Edit3 size={16} /> {isCompleted ? 'Edit Settlement' : 'Modify Entry'}
                  </Button>
                  <Button variant="ghost" onClick={() => { onDelete(); setIsMenuOpen(false); }} className="w-full justify-start px-4 py-3 text-xs uppercase tracking-widest text-danger-500 hover:bg-danger-500/10 gap-3">
                    <Trash2 size={16} /> Delete Record
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {isCompleted && session.notes && (
          <div className="mt-5 p-4 bg-primary-500/[0.03] rounded-2xl border border-primary-500/10 border-dashed">
             <div className="flex items-start gap-3">
                <Info size={14} className="text-primary-400 shrink-0 mt-0.5" />
                <p className="text-xs text-[var(--text-muted)] italic font-medium leading-relaxed">"{session.notes}"</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SessionCompletionForm({ session, treatment, onSubmit, onClose }) {
  const { data: doctorsData } = useQuery(GET_DOCTORS, { variables: { limit: 100 } });
  const [date, setDate] = useState(session.date ? new Date(session.date) : new Date());
  const [online, setOnline] = useState(session.onlinePayment || 0);
  const [cash, setCash] = useState(session.cashPayment || 0);
  const [discount, setDiscount] = useState(session.discount || 0);
  const [doctorId, setDoctorId] = useState(session.doctor?.id || '');
  const [notes, setNotes] = useState(session.notes || '');

  const otherPaid = treatment.sessions?.filter(s => s.id !== session.id).reduce((acc, s) => acc + (s.paidAmount || 0), 0) || 0;
  const otherDiscount = treatment.sessions?.filter(s => s.id !== session.id).reduce((acc, s) => acc + (s.discount || 0), 0) || 0;
  
  const remainingAtStart = treatment.finalAmount - otherPaid - otherDiscount;
  const totalThisSession = online + cash;
  const newRemaining = remainingAtStart - totalThisSession - discount;

  return (
    <div className="space-y-8 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1 flex items-center gap-2">
             <Calendar size={12} /> Schedule Time
          </label>
          <DateTimePicker date={date} setDate={setDate} className="w-full h-12 bg-[var(--surface-hover)] border-[var(--border)] rounded-2xl font-bold shadow-sm" />
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1 flex items-center gap-2">
             <Star size={12} /> Surgeon / Expert
          </label>
          <Select value={doctorId} onValueChange={setDoctorId}>
            <SelectTrigger className="w-full h-12 rounded-2xl border border-[var(--border)] bg-[var(--surface-hover)] font-bold text-xs text-[var(--foreground)] shadow-sm">
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

      <div className="space-y-2">
        <label className="text-[10px] font-black text-primary-400 uppercase tracking-widest ml-1 flex items-center gap-2">
           <Edit3 size={12} /> Treatment Notes
        </label>
        <textarea 
          className="w-full p-5 rounded-3xl border border-[var(--border)] focus:ring-4 focus:ring-primary-500/10 outline-none transition-all h-[120px] text-sm font-medium bg-[var(--surface-hover)] text-[var(--foreground)] shadow-sm placeholder:opacity-30"
          placeholder="Clinical observations or remarks..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        ></textarea>
      </div>

      <div className="space-y-4">
        <p className="text-[10px] font-black text-primary-400 uppercase tracking-[0.2em] ml-1">Payment Settlement</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[var(--surface-hover)]/40 p-5 rounded-3xl border border-[var(--border)]">
            <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">Online</label>
            <Input type="number" value={online} onChange={(e) => setOnline(parseFloat(e.target.value) || 0)} icon={IndianRupee} className="h-12 rounded-2xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10" />
          </div>
          <div className="bg-[var(--surface-hover)]/40 p-5 rounded-3xl border border-[var(--border)]">
            <label className="block text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-3 ml-1">Cash</label>
            <Input type="number" value={cash} onChange={(e) => setCash(parseFloat(e.target.value) || 0)} icon={IndianRupee} className="h-12 rounded-2xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10" />
          </div>
          <div className="bg-danger-500/5 p-5 rounded-3xl border border-danger-500/10">
            <label className="block text-[9px] font-black text-danger-500 uppercase tracking-widest mb-3 ml-1 text-center">Disc.</label>
            <Input type="number" value={discount} onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)} icon={IndianRupee} className="h-12 rounded-2xl bg-[var(--surface)] border-danger-500/20 text-danger-500 font-bold pl-10 text-center" />
          </div>
        </div>
      </div>

      <div className="p-8 bg-primary-600 rounded-[2.5rem] text-white shadow-2xl shadow-primary-600/20 flex flex-col items-center justify-between overflow-hidden relative group">
        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-125 transition-transform duration-700 pointer-events-none rotate-12">
          <IndianRupee size={150} />
        </div>
        <div className="flex flex-wrap items-center gap-10 relative z-10 w-full justify-between sm:justify-start">
          <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-100/40 mb-1">Session Total</p><p className="text-3xl font-black">₹{formatAmount(totalThisSession)}</p></div>
          <div className="w-px h-12 bg-white/20 hidden sm:block"></div>
          <div><p className="text-[9px] font-black uppercase tracking-[0.2em] text-primary-100/40 mb-1">Remaining</p><p className={`text-3xl font-black ${newRemaining > 0 ? 'text-danger-300' : 'text-success-300'}`}>₹{formatAmount(newRemaining)}</p></div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button variant="ghost" onClick={onClose} className="px-10 h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--foreground)]">Cancel</Button>
        <Button onClick={() => onSubmit({ onlinePayment: online, cashPayment: cash, paidAmount: totalThisSession, discount, date: date instanceof Date ? date.toISOString() : date, notes, doctorId })} className="bg-primary-600 hover:bg-primary-700 text-white px-12 h-14 rounded-2xl font-black shadow-2xl shadow-primary-600/20 tracking-[0.2em] uppercase text-[10px] flex items-center justify-center gap-3 group/btn transition-all active:scale-95">
          <span>Confirm Entry</span>
          <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
