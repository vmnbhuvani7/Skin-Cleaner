'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  Plus, 
  Search, 
  Stethoscope, 
  Calendar, 
  Clock, 
  User, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  ChevronRight,
  Filter,
  ArrowRight,
  UserPlus,
  Activity,
  Layers,
  History,
  TrendingUp,
  FileText,
  Edit,
  Trash2,
  Sparkles,
  CalendarDays
} from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { Waypoint } from 'react-waypoint';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/Select';

import { GET_ALL_SESSIONS } from '@/graphql/queries/treatmentSession';
import { GET_PATIENTS } from '@/graphql/queries/patient';
import { GET_SERVICES } from '@/graphql/queries/service';
import { GET_DOCTORS } from '@/graphql/queries/doctor';
import { GET_GLOBAL_STATS, GET_PATIENT_PLANS } from '@/graphql/queries/treatmentPlan';

import { 
  SCHEDULE_SESSION, 
  COMPLETE_SESSION, 
  UPDATE_SESSION_STATUS,
  UPDATE_SESSION,
  DELETE_SESSION
} from '@/graphql/mutations/treatmentSession';
import { START_TREATMENT_PLAN } from '@/graphql/mutations/treatmentPlan';

export default function TreatmentsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  
  // View State
  const [activeTab, setActiveTab] = useState('Sessions'); // 'Sessions' or 'Plans'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Treatment Form State
  const [treatmentType, setTreatmentType] = useState('One-time'); // 'One-time' or 'Series'
  const [selectedPatient, setSelectedPatient] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [appointmentDate, setAppointmentDate] = useState(new Date().toISOString());
  const [totalSessions, setTotalSessions] = useState(6);
  const [intervalWeeks, setIntervalWeeks] = useState(4);
  const [notes, setNotes] = useState('');

  // Complete Treatment Form State
  const [areaTreated, setAreaTreated] = useState('');
  const [dosage, setDosage] = useState('');
  const [complications, setComplications] = useState('');
  const [beforeNotes, setBeforeNotes] = useState('');
  const [afterNotes, setAfterNotes] = useState('');
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [editForm, setEditForm] = useState({
    appointmentDate: '',
    serviceId: '',
    doctorId: '',
    status: '',
    notes: '',
    areaTreated: '',
    dosage: '',
    complications: '',
    actualDate: ''
  });

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);

  // Follow-up Logic States
  const [shouldAutoSchedule, setShouldAutoSchedule] = useState(true);
  const [nextSuggestedDate, setNextSuggestedDate] = useState('');
  const [existingNextSession, setExistingNextSession] = useState(null);
  const [actualDate, setActualDate] = useState(new Date().toISOString());

  // Pagination State
  const [page, setPage] = useState(1);
  const [listData, setListData] = useState({
    sessions: [],
    hasMore: true
  });

  // Queries
  const [getSessions, { loading: sessionsLoading }] = useLazyQuery(GET_ALL_SESSIONS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    onCompleted: (res) => {
      if (res?.getAllSessions) {
        const newSessions = res.getAllSessions.sessions || [];
        if (page === 1) {
          setListData({
            sessions: newSessions,
            hasMore: res.getAllSessions.hasMore
          });
        } else {
          setListData(prev => ({
            sessions: [...prev.sessions, ...newSessions],
            hasMore: res.getAllSessions.hasMore
          }));
        }
      }
    }
  });

  const refetchSessions = () => {
    setPage(1);
    getSessions({ variables: { page: 1, limit: 10, status: statusFilter, search: searchTerm } });
  };

  // Debounced search effect
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      getSessions({ 
        variables: { 
          page: 1, 
          limit: 10, 
          status: statusFilter, 
          search: searchTerm 
        } 
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  const loadMore = () => {
    if (!sessionsLoading && listData.hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      getSessions({ 
        variables: { 
          page: nextPage, 
          limit: 10, 
          status: statusFilter, 
          search: searchTerm 
        } 
      });
    }
  };
  const { data: statsData } = useQuery(GET_GLOBAL_STATS);
  const { data: patientsData } = useQuery(GET_PATIENTS, { variables: { limit: 100 } });
  const { data: servicesData } = useQuery(GET_SERVICES, { variables: { limit: 100 } });
  const { data: doctorsData } = useQuery(GET_DOCTORS, { variables: { limit: 100 } });

  // Mutations
  const [scheduleSession, { loading: scheduling }] = useMutation(SCHEDULE_SESSION, {
    onCompleted: () => {
      toast.success('Session scheduled');
      setIsAddModalOpen(false);
      // Reset form
      setSelectedPatient('');
      setSelectedService('');
      setSelectedDoctor('');
      setAppointmentDate(new Date().toISOString());
      setNotes('');
      setTreatmentType('One-time');
      refetchSessions();
    },
    onError: (err) => toast.error(err.message)
  });

  const [startPlan, { loading: startingPlan }] = useMutation(START_TREATMENT_PLAN, {
    onCompleted: () => {
      toast.success('Treatment series started');
      setIsAddModalOpen(false);
      // Reset form
      setSelectedPatient('');
      setSelectedService('');
      setSelectedDoctor('');
      setAppointmentDate(new Date().toISOString());
      setNotes('');
      setTotalSessions(6);
      setIntervalWeeks(4);
      setTreatmentType('One-time');
      refetchSessions();
    },
    onError: (err) => toast.error(err.message)
  });

  const [completeSession, { loading: completing }] = useMutation(COMPLETE_SESSION, {
    onCompleted: () => {
      toast.success('Treatment record saved');
      setIsCompleteModalOpen(false);
      // Reset clinical details
      setAreaTreated('');
      setDosage('');
      setComplications('');
      setBeforeNotes('');
      setAfterNotes('');
      setNotes('');
      setSelectedSession(null);
      refetchSessions();
    },
    onError: (err) => toast.error(err.message)
  });

  const [updateSession, { loading: updating }] = useMutation(UPDATE_SESSION, {
    onCompleted: () => {
      toast.success('Treatment updated');
      setIsEditModalOpen(false);
      setEditingSession(null);
      setEditForm({
        appointmentDate: '',
        serviceId: '',
        doctorId: '',
        status: '',
        notes: '',
        areaTreated: '',
        dosage: '',
        complications: '',
        actualDate: '',
        treatmentStartTime: '',
        treatmentEndTime: ''
      });
      refetchSessions();
    },
    onError: (err) => toast.error(err.message)
  });

  const [deleteSession] = useMutation(DELETE_SESSION, {
    onCompleted: () => {
      toast.success('Treatment deleted');
      setDeleteModalOpen(false);
      setTreatmentToDelete(null);
      refetchSessions();
    },
    onError: (err) => {
      toast.error(err.message);
      setDeleteModalOpen(false);
    }
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!selectedPatient || !selectedService) return toast.error('Required fields missing');

    if (treatmentType === 'Series') {
      startPlan({
        variables: {
          patientId: selectedPatient,
          serviceId: selectedService,
          doctorId: selectedDoctor || null,
          totalSessions: parseInt(totalSessions),
          intervalWeeks: parseInt(intervalWeeks),
          firstAppointmentDate: appointmentDate,
          notes
        }
      });
    } else {
      scheduleSession({
        variables: {
          patientId: selectedPatient,
          serviceId: selectedService,
          doctorId: selectedDoctor || null,
          appointmentDate,
          status: 'Scheduled',
          notes
        }
      });
    }
  };

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    completeSession({
      variables: {
        id: selectedSession.id,
        actualDate,
        areaTreated,
        dosage,
        complications,
        beforeNotes,
        afterNotes,
        notes,
        shouldAutoSchedule,
        nextSessionDate: (shouldAutoSchedule || existingNextSession) ? nextSuggestedDate : null,
        updateNextSessionId: existingNextSession?.id
      }
    });
  };

  const openCompleteModal = (session) => {
    setSelectedSession(session);
    setAreaTreated(session.areaTreated || '');
    setDosage(session.dosage || '');
    setComplications(session.complications || '');
    setNotes(session.notes || '');
    setActualDate(new Date().toISOString());

    // Logic to detect next session
    if (session.treatmentPlan) {
      const plan = session.treatmentPlan;
      const sessions = listData.sessions;
      const nextNum = session.sessionNumber + 1;
      
      const existingNext = sessions.find(s => 
        s.treatmentPlan?.id === plan.id && 
        s.sessionNumber === nextNum &&
        s.status === 'Scheduled'
      );

      if (existingNext) {
        setExistingNextSession(existingNext);
        setShouldAutoSchedule(false);
        setNextSuggestedDate(existingNext.appointmentDate);
      } else {
        setExistingNextSession(null);
        setShouldAutoSchedule(nextNum <= (plan.totalSessions || 1));
        
        const suggested = new Date();
        suggested.setDate(suggested.getDate() + ((plan.intervalWeeks || 4) * 7));
        setNextSuggestedDate(suggested.toISOString());
      }
    } else {
      setExistingNextSession(null);
      setShouldAutoSchedule(false);
    }
    
    setIsCompleteModalOpen(true);
  };

  const openEditModal = (session) => {
    setEditingSession(session);
    setEditForm({
      appointmentDate: session.appointmentDate,
      serviceId: session.service?.id || '',
      doctorId: session.doctor?.id || '',
      status: session.status || '',
      notes: session.notes || '',
      areaTreated: session.areaTreated || '',
      dosage: session.dosage || '',
      complications: session.complications || '',
      actualDate: session.actualDate || session.appointmentDate || ''
    });
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (id) => {
    setTreatmentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!treatmentToDelete) return;
    deleteSession({ variables: { id: treatmentToDelete } });
  };

  const handleUpdateSubmit = (e) => {
    e.preventDefault();
    updateSession({
      variables: {
        id: editingSession.id,
        ...editForm
      }
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Scheduled': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Missed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Abandoned': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'Cancelled': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      case 'In Progress': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Scheduled': return <Clock size={14} />;
      case 'Completed': return <CheckCircle2 size={14} />;
      case 'Missed': return <AlertCircle size={14} />;
      case 'Cancelled': return <XCircle size={14} />;
      case 'Abandoned': return <AlertCircle size={14} />;
      default: return null;
    }
  };


  const stats = statsData?.getGlobalStats || { completionRate: 0, dropoutRate: 0, noShowRate: 0 };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />

        {/* Global Analytics Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Completion Rate', value: `${stats?.completionRate?.toFixed(1)}%`, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: 'Dropout Rate', value: `${stats?.dropoutRate?.toFixed(1)}%`, icon: AlertCircle, color: 'text-orange-500' },
            { label: 'No-Show Rate', value: `${stats?.noShowRate?.toFixed(1)}%`, icon: XCircle, color: 'text-rose-500' },
            { label: 'Est. Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-indigo-500' },
          ].map((stat, i) => (
            <div key={i} className="bg-[var(--surface)] border border-[var(--border)] p-5 rounded-[2rem] shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl bg-opacity-10 ${stat.color.replace('text', 'bg')}`}>
                  <stat.icon size={18} className={stat.color} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">{stat.label}</span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Start New Treatment Modal */}
        <Modal 
          isOpen={isAddModalOpen} 
          onClose={() => setIsAddModalOpen(false)}
          title="Initiate New Treatment"
          className="max-w-2xl"
        >
          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="bg-[var(--surface-hover)] p-1 rounded-2xl flex border border-[var(--border)]">
              <button 
                type="button" 
                onClick={() => setTreatmentType('One-time')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${treatmentType === 'One-time' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
              >One-time Visit</button>
              <button 
                type="button" 
                onClick={() => setTreatmentType('Series')}
                className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${treatmentType === 'Series' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
              >Treatment Series (Multi-session)</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Patient</label>
                <Select value={selectedPatient} onValueChange={setSelectedPatient}>
                  <SelectTrigger><SelectValue placeholder="Select Patient" /></SelectTrigger>
                  <SelectContent>
                    {patientsData?.getPatients?.patients?.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.mobile})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Service</label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                  <SelectContent>
                    {servicesData?.getServices?.services?.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Doctor</label>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctorsData?.getDoctors?.doctors?.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {treatmentType === 'Series' && (
                <>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Total Sessions</label>
                    <input type="number" value={totalSessions} onChange={(e) => setTotalSessions(e.target.value)} className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl h-12 px-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Interval (Weeks)</label>
                    <input type="number" value={intervalWeeks} onChange={(e) => setIntervalWeeks(e.target.value)} className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl h-12 px-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 outline-none" />
                  </div>
                </>
              )}

              <div className="md:col-span-2">
                <DateTimePicker label="Appointment Date" date={appointmentDate} setDate={setAppointmentDate} />
              </div>

              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Initial Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4 text-sm min-h-[100px] outline-none" />
              </div>
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl" isLoading={scheduling || startingPlan}>
              {treatmentType === 'Series' ? 'Initialize Treatment Series' : 'Schedule Visit'}
            </Button>
          </form>
        </Modal>

        {/* Complete Treatment / Fill Record Modal */}
        <Modal 
          isOpen={isCompleteModalOpen} 
          onClose={() => setIsCompleteModalOpen(false)}
          title="Clinical Treatment Record"
          footer={
            <Button 
              form="clinical-complete-form"
              type="submit" 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-indigo-500/20"
              variant="primary"
              loading={completing}
            >
              Finalize Treatment & Save Record
            </Button>
          }
        >
          <form id="clinical-complete-form" onSubmit={handleCompleteSubmit} className="space-y-8">
            <div className="bg-indigo-500/5 p-6 rounded-[2rem] border border-indigo-500/10 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-[var(--foreground)] text-lg">{selectedSession?.patient.name}</h4>
                <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyle('Scheduled')}`}>Session {selectedSession?.sessionNumber}</div>
              </div>
              <p className="text-sm text-[var(--text-muted)]">{selectedSession?.service.title} • {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Area(s) Treated</label>
                <Input value={areaTreated} onChange={(e) => setAreaTreated(e.target.value)} placeholder="e.g., Full Face, Underarms" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Intensity / Dosage</label>
                <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 20J/cm², Pulse 30ms" />
              </div>

              <div className="md:col-span-2">
                <DateTimePicker 
                  label="Actual Treatment Date & Time"
                  date={actualDate}
                  setDate={setActualDate}
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Clinical Notes</label>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Clinical observations and treatment details..." className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-5 text-sm min-h-[120px] outline-none focus:border-indigo-500/50" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">Complications / Reactions</label>
                <input value={complications} onChange={(e) => setComplications(e.target.value)} placeholder="Any adverse effects?" className="w-full bg-rose-500/5 border border-rose-500/10 rounded-2xl h-12 px-5 text-sm outline-none focus:border-rose-500/50 text-rose-500" />
              </div>

              <div className="md:col-span-2 space-y-2">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
                  Follow-up Logic <Sparkles size={12} />
                </p>
                
                {existingNextSession ? (
                  <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                          <CalendarDays size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--foreground)]">Next Session Already Scheduled</p>
                          <p className="text-xs text-[var(--text-muted)]">Session {existingNextSession.sessionNumber} is currently set for {new Date(existingNextSession.appointmentDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded-lg border border-emerald-500/20 uppercase">
                        Confirmed
                      </div>
                    </div>

                    <div className="pt-4 border-t border-indigo-500/10">
                      <DateTimePicker 
                        label="Update Scheduled Date"
                        date={nextSuggestedDate}
                        setDate={setNextSuggestedDate}
                      />
                      <p className="mt-2 text-[10px] text-indigo-400 flex items-center gap-1">
                        <AlertCircle size={10} /> Changing this will update the existing Session {existingNextSession.sessionNumber}.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${shouldAutoSchedule ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'}`}>
                          <History size={20} />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-[var(--foreground)]">Auto-schedule Next Session?</p>
                          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Based on plan interval settings</p>
                        </div>
                      </div>
                      <button 
                        type="button"
                        onClick={() => setShouldAutoSchedule(!shouldAutoSchedule)}
                        className={`w-12 h-6 rounded-full transition-all relative ${shouldAutoSchedule ? 'bg-emerald-500' : 'bg-gray-400'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${shouldAutoSchedule ? 'left-7' : 'left-1'}`} />
                      </button>
                    </div>

                    {shouldAutoSchedule && (
                      <div className="pt-4 border-t border-indigo-500/10 animate-in fade-in slide-in-from-top-2 duration-300">
                        <DateTimePicker 
                          label="Suggested Next Date"
                          date={nextSuggestedDate}
                          setDate={setNextSuggestedDate}
                        />
                        <p className="mt-2 text-[10px] text-indigo-400 flex items-center gap-1">
                          <AlertCircle size={10} /> You can modify this date before finalizing.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Modal>

        {/* Edit Treatment Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Treatment Session"
          className="max-w-2xl"
        >
          <form onSubmit={handleUpdateSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <DateTimePicker 
                  label="Appointment Date & Time" 
                  date={editForm.appointmentDate} 
                  setDate={(date) => setEditForm({ ...editForm, appointmentDate: date })} 
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Service</label>
                <Select 
                  value={editForm.serviceId} 
                  onValueChange={(val) => setEditForm({ ...editForm, serviceId: val })}
                  disabled={!!editingSession?.treatmentPlan}
                >
                  <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                  <SelectContent>
                    {servicesData?.getServices?.services?.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Status</label>
                <Select value={editForm.status} onValueChange={(val) => setEditForm({ ...editForm, status: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Scheduled">Scheduled</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Missed">Missed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Doctor</label>
                <Select value={editForm.doctorId} onValueChange={(val) => setEditForm({ ...editForm, doctorId: val })}>
                  <SelectTrigger><SelectValue placeholder="Select Doctor" /></SelectTrigger>
                  <SelectContent>
                    {doctorsData?.getDoctors?.doctors?.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {editForm.status === 'Completed' && (
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2rem] p-6 space-y-6">
                 <DateTimePicker 
                   label="Actual Treatment Date & Time" 
                   date={editForm.actualDate} 
                   setDate={(d) => setEditForm({ ...editForm, actualDate: d })} 
                 />
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Area(s) Treated</label>
                  <Input value={editForm.areaTreated} onChange={(e) => setEditForm({ ...editForm, areaTreated: e.target.value })} placeholder="e.g. Full Face, Underarms" />
               </div>
               <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Intensity / Dosage</label>
                  <Input value={editForm.dosage} onChange={(e) => setEditForm({ ...editForm, dosage: e.target.value })} placeholder="e.g. 20J/cm2, Pulse 30ms" />
               </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Clinical Notes</label>
              <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} placeholder="Clinical observations and treatment details..." className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4 text-sm min-h-[100px] outline-none focus:border-indigo-500/50" />
            </div>

            <Button type="submit" className="w-full h-14 rounded-2xl shadow-xl shadow-indigo-600/20" isLoading={updating}>Save Changes</Button>
          </form>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal 
          isOpen={deleteModalOpen} 
          onClose={() => setDeleteModalOpen(false)}
          title="Confirm Deletion"
          className="max-w-md"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h4 className="text-[var(--foreground)] text-lg font-bold mb-2">Are you absolutely sure?</h4>
            <p className="text-[var(--text-muted)] text-sm mb-10">
              This action cannot be undone. This will permanently remove the treatment session from the clinical registry.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-4 px-6 bg-[var(--surface-hover)] hover:bg-indigo-500/10 text-[var(--foreground)] font-bold rounded-2xl transition-all border border-[var(--border)]"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="flex-1 py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </Modal>

        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight">Treatments</h1>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-indigo-500/20">
                  Clinical Registry
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-sm">Managing patient records, series progress, and automated follow-ups.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative group w-full sm:min-w-[300px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search patient..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all shadow-sm"
                />
              </div>
              
              <Button onClick={() => setIsAddModalOpen(true)} icon={Plus} className="w-full sm:w-auto whitespace-nowrap px-8">New Treatment</Button>
            </div>
          </div>

          {/* Filters & View Toggles */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto gap-4">
             <div className="flex gap-2">
                {['All', 'Scheduled', 'Completed', 'Missed', 'Abandoned'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`px-6 py-2.5 rounded-2xl text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                      statusFilter === status 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-600/20' 
                      : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:bg-[var(--surface-hover)]'
                    }`}
                  >
                    {status}
                  </button>
                ))}
             </div>
          </div>

          {/* Treatment List */}
          <div className="space-y-6">
            {sessionsLoading && listData.sessions.length === 0 ? (
              <div className="py-20 text-center"><div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div></div>
            ) : listData.sessions?.length > 0 ? (
              <>
                {listData.sessions
                  .map((session) => (
                  <div 
                    key={session.id}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all relative overflow-hidden group"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                      <div className="flex items-start gap-6">
                        <div className="w-16 h-16 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/10 group-hover:scale-105 transition-transform shadow-inner shrink-0">
                          <Activity size={32} />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-[var(--foreground)] text-xl tracking-tight">{session.patient.name}</h3>
                            {session.treatmentPlan && (
                               <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-3 py-1 rounded-full border border-indigo-500/20 font-bold uppercase tracking-widest shadow-sm">
                                 Series Session {session.sessionNumber}/{session.treatmentPlan.totalSessions}
                               </span>
                            )}
                            {session.isWalkIn && (
                               <span className="text-[10px] bg-amber-500/10 text-amber-500 px-3 py-1 rounded-full border border-amber-500/20 font-bold uppercase tracking-widest">Walk-in</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[var(--text-muted)]">
                            <span className="flex items-center gap-2 font-medium"><Calendar size={14} className="text-indigo-400" /> {new Date(session.appointmentDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                            <span className="flex items-center gap-2 font-medium"><Clock size={14} className="text-indigo-400" /> {new Date(session.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="flex items-center gap-2 font-medium"><FileText size={14} className="text-indigo-400" /> {session.service?.title || 'General Consultation'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex-1 flex flex-col sm:flex-row items-center justify-end gap-8">
                        <div className="flex flex-col items-end gap-3">
                          <div className={`px-4 py-2 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 w-fit shadow-sm ${getStatusStyle(session.status)}`}>
                            {getStatusIcon(session.status)}
                            {session.status}
                          </div>
                          {session.treatmentPlan && (
                             <div className="w-full min-w-[200px]">
                                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
                                   <span>Plan Progress</span>
                                   <span>{session.treatmentPlan.completedSessions}/{session.treatmentPlan.totalSessions}</span>
                                </div>
                                <div className="h-2 w-full bg-[var(--surface-hover)] rounded-full overflow-hidden border border-[var(--border)] shadow-inner p-0.5">
                                   <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(99,102,241,0.5)]" style={{ width: `${(session.treatmentPlan.completedSessions / session.treatmentPlan.totalSessions) * 100}%` }}></div>
                                </div>
                             </div>
                          )}
                        </div>

                        <div className="flex gap-2">
                          {session.status === 'Scheduled' && (
                            <button 
                              onClick={() => openCompleteModal(session)}
                              className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white text-[10px] font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                            >
                              <CheckCircle2 size={16} /> Complete
                            </button>
                          )}
                          <button 
                            onClick={() => openEditModal(session)}
                            className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl hover:bg-indigo-500 hover:text-white transition-all border border-indigo-500/20"
                            title="Edit Details"
                          >
                            <Edit size={20} />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(session.id)}
                            className="p-3 bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                            title="Delete Session"
                          >
                            <Trash2 size={20} />
                          </button>
                          <button 
                            onClick={() => router.push(`/patients/${session.patient.id}`)}
                            className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] flex items-center justify-center text-[var(--text-muted)] hover:text-indigo-400 transition-all border border-[var(--border)] hover:border-indigo-500/20 shadow-sm group/btn shrink-0"
                          >
                            <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Waypoint for infinite scroll */}
                {listData.hasMore && (
                  <div className="py-10 flex justify-center">
                    <Waypoint onEnter={loadMore}>
                      <div className="flex items-center gap-3 text-indigo-400 font-bold uppercase tracking-widest text-xs">
                        <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        Loading more treatments...
                      </div>
                    </Waypoint>
                  </div>
                )}
              </>
            ) : (
              <div className="py-20 text-center bg-[var(--surface)] rounded-[2.5rem] border border-dashed border-[var(--border)]">
                <div className="w-20 h-20 bg-indigo-500/10 rounded-[2rem] flex items-center justify-center text-indigo-400 mx-auto mb-6">
                  <Activity size={40} />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">No treatments found</h3>
                <p className="text-[var(--text-muted)] text-sm mb-8">Try adjusting your search or filters.</p>
                <Button onClick={() => { setSearchTerm(''); setStatusFilter('All'); }} variant="outline">Clear All Filters</Button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
