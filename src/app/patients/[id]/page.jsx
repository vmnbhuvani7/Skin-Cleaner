'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, MapPin, ClipboardList, 
  Activity, Clock, ShieldCheck, Edit, Trash2, Plus, CheckCircle2, 
  XCircle, AlertCircle, ChevronRight, MoreVertical, Lock, Sparkles,
  CalendarDays, History,
  TrendingUp
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/Select';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GET_PATIENT } from '@/graphql/queries/patient';
import { GET_DOCTORS } from '@/graphql/queries/doctor';
import { GET_SERVICES } from '@/graphql/queries/service';
import { 
  GET_PATIENT_SESSIONS, SCHEDULE_SESSION, 
  UPDATE_SESSION_STATUS, DELETE_SESSION, UPDATE_SESSION
} from '@/graphql/treatmentSession';
import { 
  GET_PATIENT_PLANS, UPDATE_TREATMENT_PLAN, CANCEL_PLAN 
} from '@/graphql/queries/treatmentPlan';
import { COMPLETE_SESSION } from '@/graphql/mutations/treatmentSession';

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { theme } = useTheme();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isEditPlanModalOpen, setIsEditPlanModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState(null);
  const [editingSession, setEditingSession] = useState(null);
  const [editingPlan, setEditingPlan] = useState(null);
  const [expandedPlans, setExpandedPlans] = useState({});
  const [scheduleData, setScheduleData] = useState({
    appointmentDate: '',
    serviceId: '',
    doctorId: '',
    notes: '',
    treatmentPlanId: '',
    areaTreated: '',
    dosage: '',
    complications: '',
    status: '',
    actualDate: '',
    treatmentStartTime: '',
    treatmentEndTime: '',
    baseAmount: '',
    paidAmount: '',
    discount: ''
  });
  const [activePlanSummary, setActivePlanSummary] = useState(null);
  const [planEditData, setPlanEditData] = useState({
    totalSessions: 1,
    intervalWeeks: 4,
    status: 'In Progress',
    doctorId: ''
  });

  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [sessionToProcess, setSessionToProcess] = useState(null);
  
  // Clinical Record States
  const [areaTreated, setAreaTreated] = useState('');
  const [dosage, setDosage] = useState('');
  const [complications, setComplications] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');
  const [actualDate, setActualDate] = useState(new Date().toISOString());

  // Follow-up Logic States
  const [shouldAutoSchedule, setShouldAutoSchedule] = useState(true);
  const [nextSuggestedDate, setNextSuggestedDate] = useState('');
  const [existingNextSession, setExistingNextSession] = useState(null);

  // Queries
  const { data: patientData, loading: patientLoading } = useQuery(GET_PATIENT, {
    variables: { id },
    skip: !id
  });

  const { data: plansData, loading: plansLoading, refetch: refetchPlans } = useQuery(GET_PATIENT_PLANS, {
    variables: { patientId: id },
    skip: !id
  });

  const { data: sessionsData, loading: sessionsLoading, refetch: refetchSessions } = useQuery(GET_PATIENT_SESSIONS, {
    variables: { patientId: id },
    skip: !id
  });

  const { data: doctorsData } = useQuery(GET_DOCTORS, {
    variables: { page: 1, limit: 100 }
  });

  const { data: servicesData } = useQuery(GET_SERVICES, {
    variables: { page: 1, limit: 100 }
  });

  // Mutations
  const [scheduleSession, { loading: scheduling }] = useMutation(SCHEDULE_SESSION, {
    onCompleted: () => {
      toast.success('Session scheduled successfully');
      setIsScheduleModalOpen(false);
      setScheduleData({ 
        appointmentDate: '', 
        serviceId: '', 
        doctorId: '', 
        notes: '', 
        treatmentPlanId: '',
        areaTreated: '',
        dosage: '',
        complications: '',
        status: '',
        actualDate: '',
        treatmentStartTime: '',
        treatmentEndTime: '',
        baseAmount: '',
        paidAmount: ''
      });
      setSelectedPlanId(null);
      refetchSessions();
      refetchPlans();
    }
  });

  const [updateStatus] = useMutation(UPDATE_SESSION_STATUS, {
    onCompleted: () => {
      toast.success('Session updated');
      setIsCompleteModalOpen(false);
      setCancelModalOpen(false);
      setSessionToProcess(null);
      refetchSessions();
    }
  });

  const [updateSession, { loading: updatingSession }] = useMutation(UPDATE_SESSION, {
    onCompleted: () => {
      toast.success('Session updated successfully');
      setIsEditModalOpen(false);
      setEditingSession(null);
      setScheduleData({ 
        appointmentDate: '', 
        serviceId: '', 
        doctorId: '', 
        notes: '', 
        treatmentPlanId: '',
        areaTreated: '',
        dosage: '',
        complications: '',
        status: '',
        actualDate: '',
        treatmentStartTime: '',
        treatmentEndTime: '',
        baseAmount: '',
        paidAmount: ''
      });
      refetchSessions();
      refetchPlans();
    }
  });

  const [updatePlan, { loading: updatingPlan }] = useMutation(UPDATE_TREATMENT_PLAN, {
    onCompleted: () => {
      toast.success('Treatment plan updated');
      setIsEditPlanModalOpen(false);
      setEditingPlan(null);
      refetchPlans();
    }
  });

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!scheduleData.appointmentDate) return toast.error('Please select a date');
    
    scheduleSession({
      variables: {
        ...scheduleData,
        patientId: id,
        treatmentPlanId: selectedPlanId || scheduleData.treatmentPlanId,
        sessionNumber: scheduleData.sessionNumber,
        baseAmount: parseFloat(scheduleData.baseAmount) || 0,
        paidAmount: parseFloat(scheduleData.paidAmount) || 0,
        discount: parseFloat(scheduleData.discount) || 0
      }
    });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!scheduleData.appointmentDate) return toast.error('Please select a date');

    updateSession({
      variables: {
        id: editingSession.id,
        appointmentDate: scheduleData.appointmentDate,
        serviceId: scheduleData.serviceId,
        doctorId: scheduleData.doctorId,
        notes: scheduleData.notes,
        areaTreated: scheduleData.areaTreated,
        dosage: scheduleData.dosage,
        complications: scheduleData.complications,
        status: scheduleData.status,
        actualDate: scheduleData.actualDate,
        treatmentStartTime: scheduleData.treatmentStartTime,
        treatmentEndTime: scheduleData.treatmentEndTime,
        baseAmount: parseFloat(scheduleData.baseAmount) || 0,
        paidAmount: parseFloat(scheduleData.paidAmount) || 0,
        discount: parseFloat(scheduleData.discount) || 0
      }
    });

    if (editingSession.treatmentPlan && activePlanSummary) {
      updatePlan({
        variables: {
          id: editingSession.treatmentPlan.id,
          totalAmount: parseFloat(activePlanSummary.total) || 0,
          paidAmount: parseFloat(activePlanSummary.paid) || 0,
          discount: parseFloat(activePlanSummary.discount) || 0
        }
      });
    }
  };

  const handleUpdatePlan = (e) => {
    e.preventDefault();
    updatePlan({
      variables: {
        id: editingPlan.id,
        ...planEditData
      }
    });
  };

  const openAddSessionModal = (plan) => {
    setSelectedPlanId(plan.id);
    const planRemaining = (plan.totalAmount || 0) - (plan.discount || 0) - (plan.paidAmount || 0);
    const suggestedSessionAmount = (plan.totalAmount || 0) / (plan.totalSessions || 1);
    
    setScheduleData({
      appointmentDate: '',
      notes: '',
      areaTreated: '',
      dosage: '',
      complications: '',
      serviceId: plan.service.id,
      doctorId: plan.doctor?.id || '',
      treatmentPlanId: plan.id,
      sessionNumber: (plan.sessions?.length || 0) + 1,
      baseAmount: suggestedSessionAmount.toString(),
      paidAmount: Math.max(0, planRemaining).toString(),
      discount: ''
    });
    
    setActivePlanSummary({
      total: plan.totalAmount,
      discount: plan.discount,
      paid: plan.paidAmount,
      remaining: planRemaining
    });
    
    setIsScheduleModalOpen(true);
  };

  const openNewSessionModal = () => {
    setSelectedPlanId(null);
    setScheduleData({
      appointmentDate: '',
      serviceId: '',
      doctorId: '',
      notes: '',
      treatmentPlanId: '',
      areaTreated: '',
      dosage: '',
      complications: '',
      status: 'Scheduled',
      actualDate: '',
      treatmentStartTime: '',
      treatmentEndTime: '',
      baseAmount: '',
      paidAmount: ''
    });
    setIsScheduleModalOpen(true);
  };

  const openEditSessionModal = (session) => {
    setEditingSession(session);
    setScheduleData({
      appointmentDate: session.appointmentDate,
      serviceId: session.service?.id || '',
      doctorId: session.doctor?.id || '',
      notes: session.notes || '',
      areaTreated: session.areaTreated || '',
      dosage: session.dosage || '',
      complications: session.complications || '',
      treatmentPlanId: session.treatmentPlan?.id || '',
      status: session.status || '',
      actualDate: session.actualDate || session.appointmentDate || '',
      baseAmount: session.baseAmount || '',
      paidAmount: session.paidAmount || '',
      discount: session.discount || ''
    });

    if (session.treatmentPlan) {
      const plan = session.treatmentPlan;
      const planRemaining = (plan.totalAmount || 0) - (plan.discount || 0) - (plan.paidAmount || 0);
      setActivePlanSummary({
        total: plan.totalAmount,
        discount: plan.discount,
        paid: plan.paidAmount,
        remaining: planRemaining
      });
    } else {
      setActivePlanSummary(null);
    }

    setIsEditModalOpen(true);
  };

  const openEditPlanModal = (plan) => {
    setEditingPlan(plan);
    setPlanEditData({
      totalSessions: plan.totalSessions,
      intervalWeeks: plan.intervalWeeks,
      status: plan.status,
      doctorId: plan.doctor?.id || ''
    });
    setIsEditPlanModalOpen(true);
  };

  const togglePlanExpansion = (planId) => {
    setExpandedPlans(prev => ({
      ...prev,
      [planId]: !prev[planId]
    }));
  };

  const markAsCompleted = (session) => {
    setSessionToProcess(session);
    setAreaTreated(session.areaTreated || '');
    setDosage(session.dosage || '');
    setComplications(session.complications || '');
    setClinicalNotes(session.notes || '');
    setActualDate(new Date().toISOString());
    setPaidAmount(''); // Reset for completion

    // Logic to detect next session or calculate suggested date
    if (session.treatmentPlan) {
      const plan = plansData?.getPatientPlans?.find(p => p.id === session.treatmentPlan.id);
      const sessions = sessionsData?.getPatientSessions || [];
      
      const planRemaining = (plan?.totalAmount || 0) - (plan?.discount || 0) - (plan?.paidAmount || 0);
      setPaidAmount(Math.max(0, planRemaining).toString());

      setActivePlanSummary({
        total: plan?.totalAmount,
        discount: plan?.discount,
        paid: plan?.paidAmount,
        remaining: planRemaining
      });

      // Find if next session number is already scheduled
      const nextNum = session.sessionNumber + 1;
      const existingNext = sessions.find(s => 
        s.treatmentPlan?.id === session.treatmentPlan.id && 
        s.sessionNumber === nextNum &&
        s.status === 'Scheduled'
      );

      if (existingNext) {
        setExistingNextSession(existingNext);
        setShouldAutoSchedule(false);
        setNextSuggestedDate(existingNext.appointmentDate);
      } else {
        setExistingNextSession(null);
        setShouldAutoSchedule(nextNum <= (plan?.totalSessions || 1));
        
        // Calculate suggested date (current date + interval)
        const suggested = new Date();
        suggested.setDate(suggested.getDate() + ((plan?.intervalWeeks || 4) * 7));
        setNextSuggestedDate(suggested.toISOString());
      }
    } else {
      setExistingNextSession(null);
      setShouldAutoSchedule(false);
      setActivePlanSummary(null);
      setPaidAmount('');
    }

    setIsCompleteModalOpen(true);
  };

  const [paidAmount, setPaidAmount] = useState('');
  const [sessionDiscount, setSessionDiscount] = useState('');

  const [completeSession, { loading: completing }] = useMutation(COMPLETE_SESSION, {
    onCompleted: () => {
      toast.success('Treatment record saved');
      setIsCompleteModalOpen(false);
      setSessionToProcess(null);
      setPaidAmount('');
      setSessionDiscount('');
      refetchSessions();
      refetchPlans();
    },
    onError: (err) => toast.error(err.message)
  });

  const handleCompleteSubmit = (e) => {
    e.preventDefault();
    completeSession({
      variables: {
        id: sessionToProcess.id,
        actualDate,
        areaTreated,
        dosage,
        complications,
        notes: clinicalNotes,
        shouldAutoSchedule,
        nextSessionDate: (shouldAutoSchedule || existingNextSession) ? nextSuggestedDate : null,
        updateNextSessionId: existingNextSession?.id,
        paidAmount: parseFloat(paidAmount) || 0,
        discount: parseFloat(sessionDiscount) || 0
      }
    });
  };

  const markAsMissed = (sessionId) => {
    setSessionToProcess({ id: sessionId });
    setCancelModalOpen(true);
  };

  const confirmCancel = () => {
    updateStatus({
      variables: { id: sessionToProcess.id, status: 'Cancelled' }
    });
  };

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
  const plans = plansData?.getPatientPlans || [];
  const allSessions = sessionsData?.getPatientSessions || [];
  
  // Identify sessions that are NOT part of any plan
  const planSessionIds = new Set(plans.flatMap(p => p.sessions?.map(s => s.id) || []));
  const standaloneSessions = allSessions.filter(s => !s.treatmentPlan);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="text-emerald-500" size={18} />;
      case 'Missed': return <AlertCircle className="text-rose-500" size={18} />;
      case 'Cancelled': return <XCircle className="text-gray-500" size={18} />;
      default: return <Clock className="text-indigo-400" size={18} />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'Missed': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
      case 'Cancelled': return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
      default: return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        {/* Schedule Modal */}
        <Modal 
          isOpen={isScheduleModalOpen} 
          onClose={() => setIsScheduleModalOpen(false)}
          title="Schedule Next Session"
          className="max-w-4xl"
        >
          <form onSubmit={handleSchedule}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Appointment Info */}
              <div className="space-y-6">
                {scheduleData.sessionNumber && (
                  <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-4">
                    <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest leading-none">
                      Scheduling Session {scheduleData.sessionNumber}
                    </p>
                    <p className="text-[11px] text-[var(--text-muted)] mt-1">For {selectedPlanId ? 'current treatment plan' : 'standalone treatment'}</p>
                  </div>
                )}
                
                <DateTimePicker 
                  label="Appointment Date & Time"
                  date={scheduleData.appointmentDate}
                  setDate={(date) => setScheduleData({ ...scheduleData, appointmentDate: date })}
                  placeholder="Select date and time"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Service</label>
                    <Select 
                      value={scheduleData.serviceId} 
                      onValueChange={(value) => setScheduleData({ ...scheduleData, serviceId: value })}
                      disabled={!!selectedPlanId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesData?.getServices?.services?.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Doctor</label>
                    <Select 
                      value={scheduleData.doctorId} 
                      onValueChange={(value) => setScheduleData({ ...scheduleData, doctorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorsData?.getDoctors?.doctors?.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Instructions / Notes</label>
                  <textarea 
                    placeholder="Enter any specific instructions..."
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm min-h-[100px]"
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Side: Financials & Actions */}
              <div className="space-y-6 lg:border-l lg:border-[var(--border)] lg:pl-8">
                {activePlanSummary && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-amber-600/80">
                      <span>Plan Total:</span>
                      <span>₹{(activePlanSummary.total || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-600/80">
                      <span>Paid So Far:</span>
                      <span>₹{(activePlanSummary.paid || 0).toLocaleString()}</span>
                    </div>
                    {activePlanSummary.discount > 0 && (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-indigo-600/80">
                        <span>Plan Discount:</span>
                        <span>-₹{(activePlanSummary.discount || 0).toLocaleString()}</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-amber-500/10 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-amber-700">
                      <span>Plan Balance:</span>
                      <span>₹{Math.max(0, activePlanSummary.remaining).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="p-6 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 space-y-6">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <TrendingUp size={16} />
                    </div>
                    <h4 className="text-[11px] font-bold text-[var(--foreground)] uppercase tracking-widest">Session Billing</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Service Amount</label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={scheduleData.baseAmount}
                        onChange={(e) => setScheduleData({ ...scheduleData, baseAmount: e.target.value })}
                        icon={TrendingUp}
                        className="h-12"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest ml-1">Discount</label>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          value={scheduleData.discount}
                          onChange={(e) => setScheduleData({ ...scheduleData, discount: e.target.value })}
                          icon={Sparkles}
                          className="h-12"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Initial Payment (Advance)</label>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          value={scheduleData.paidAmount}
                          onChange={(e) => setScheduleData({ ...scheduleData, paidAmount: e.target.value })}
                          icon={TrendingUp}
                          className="h-12 border-emerald-500/30"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-indigo-500/10">
                    <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                      <span>Session Balance:</span>
                      <span className="text-rose-400">₹{Math.max(0, (parseFloat(scheduleData.baseAmount) || 0) - (parseFloat(scheduleData.paidAmount) || 0) - (parseFloat(scheduleData.discount) || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-2 h-14 rounded-2xl shadow-xl shadow-indigo-600/20" isLoading={scheduling}>Schedule Session</Button>
                </div>
              </div>
            </div>
          </form>
        </Modal>

        {/* Edit Session Modal */}
        <Modal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)}
          title="Edit Treatment Session"
          className="max-w-4xl"
        >
          <form onSubmit={handleUpdate}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Side: Session Details */}
              <div className="space-y-6">
                <DateTimePicker 
                  label="Appointment Date & Time"
                  date={scheduleData.appointmentDate}
                  setDate={(date) => setScheduleData({ ...scheduleData, appointmentDate: date })}
                  placeholder="Select date and time"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Service</label>
                    <Select 
                      value={scheduleData.serviceId} 
                      onValueChange={(value) => setScheduleData({ ...scheduleData, serviceId: value })}
                      disabled={!!editingSession?.treatmentPlan}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Service" />
                      </SelectTrigger>
                      <SelectContent>
                        {servicesData?.getServices?.services?.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Status</label>
                    <Select 
                      value={scheduleData.status} 
                      onValueChange={(value) => setScheduleData({ ...scheduleData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Missed">Missed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Doctor</label>
                    <Select 
                      value={scheduleData.doctorId} 
                      onValueChange={(value) => setScheduleData({ ...scheduleData, doctorId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctorsData?.getDoctors?.doctors?.map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {scheduleData.status === 'Completed' && (
                  <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <DateTimePicker 
                      label="Actual Treatment Date"
                      date={scheduleData.actualDate}
                      setDate={(date) => setScheduleData({ ...scheduleData, actualDate: date })}
                    />
                  </div>
                )}
              </div>

              {/* Right Side: Clinical & Financial */}
              <div className="space-y-6 lg:border-l lg:border-[var(--border)] lg:pl-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Area Treated</label>
                    <Input 
                      placeholder="e.g. Face"
                      value={scheduleData.areaTreated}
                      onChange={(e) => setScheduleData({ ...scheduleData, areaTreated: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Intensity</label>
                    <Input 
                      placeholder="e.g. 20J"
                      value={scheduleData.dosage}
                      onChange={(e) => setScheduleData({ ...scheduleData, dosage: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Notes</label>
                  <textarea 
                    placeholder="Details..."
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm min-h-[80px]"
                    value={scheduleData.notes}
                    onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
                  />
                </div>

                {editingSession?.treatmentPlan && (
                  <div className="bg-amber-500/5 border border-amber-500/10 rounded-[2rem] p-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600">
                        <Sparkles size={16} />
                      </div>
                      <h4 className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Plan Financials</h4>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-amber-600/80 uppercase tracking-widest ml-1">Total Plan Amount</label>
                        <Input 
                          type="number"
                          value={activePlanSummary?.total || 0}
                          onChange={(e) => setActivePlanSummary({ ...activePlanSummary, total: parseFloat(e.target.value) || 0 })}
                          className="h-10 border-amber-500/20"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest ml-1">Plan Discount</label>
                          <Input 
                            type="number"
                            value={activePlanSummary?.discount || 0}
                            onChange={(e) => setActivePlanSummary({ ...activePlanSummary, discount: parseFloat(e.target.value) || 0 })}
                            className="h-10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Cumulative Paid</label>
                          <Input 
                            type="number"
                            value={activePlanSummary?.paid || 0}
                            onChange={(e) => setActivePlanSummary({ ...activePlanSummary, paid: parseFloat(e.target.value) || 0 })}
                            className="h-10"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-amber-500/10 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-amber-700">
                      <span>Total Remaining:</span>
                      <span>₹{Math.max(0, (activePlanSummary?.total || 0) - (activePlanSummary?.paid || 0) - (activePlanSummary?.discount || 0)).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                <div className="p-5 bg-indigo-500/5 rounded-[2rem] border border-indigo-500/10 space-y-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <TrendingUp size={16} />
                    </div>
                    <h4 className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Session Billing</h4>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Service Amount</label>
                      <Input 
                        type="number"
                        placeholder="0.00"
                        value={scheduleData.baseAmount}
                        onChange={(e) => setScheduleData({ ...scheduleData, baseAmount: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest ml-1">Discount</label>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          value={scheduleData.discount}
                          onChange={(e) => setScheduleData({ ...scheduleData, discount: e.target.value })}
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Initial Payment (Advance)</label>
                        <Input 
                          type="number"
                          placeholder="0.00"
                          value={scheduleData.paidAmount}
                          onChange={(e) => setScheduleData({ ...scheduleData, paidAmount: e.target.value })}
                          className="h-10"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-indigo-500/10 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    <span>Session Balance:</span>
                    <span className="text-rose-400">₹{Math.max(0, (parseFloat(scheduleData.baseAmount) || 0) - (parseFloat(scheduleData.paidAmount) || 0) - (parseFloat(scheduleData.discount) || 0)).toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1 h-14 rounded-2xl" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                  <Button type="submit" className="flex-2 h-14 rounded-2xl shadow-xl shadow-indigo-600/20" isLoading={updatingSession}>Save Changes</Button>
                </div>
              </div>
            </div>
          </form>
        </Modal>

        {/* Edit Plan Modal */}
        <Modal 
          isOpen={isEditPlanModalOpen} 
          onClose={() => setIsEditPlanModalOpen(false)}
          title="Edit Treatment Plan"
          className="max-w-xl"
        >
          <form onSubmit={handleUpdatePlan} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Total Sessions</label>
                <Input 
                  type="number"
                  value={planEditData.totalSessions}
                  onChange={(e) => setPlanEditData({ ...planEditData, totalSessions: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Interval (Weeks)</label>
                <Input 
                  type="number"
                  value={planEditData.intervalWeeks}
                  onChange={(e) => setPlanEditData({ ...planEditData, intervalWeeks: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Doctor</label>
                <Select 
                  value={planEditData.doctorId} 
                  onValueChange={(value) => setPlanEditData({ ...planEditData, doctorId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctorsData?.getDoctors?.doctors?.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Status</label>
                <Select 
                  value={planEditData.status} 
                  onValueChange={(value) => setPlanEditData({ ...planEditData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                    <SelectItem value="Cancelled">Cancelled</SelectItem>
                    <SelectItem value="Abandoned">Abandoned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsEditPlanModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={updatingPlan}>Save Plan Changes</Button>
            </div>
          </form>
        </Modal>

        {/* Clinical Treatment Record Modal */}
        <Modal 
          isOpen={isCompleteModalOpen} 
          onClose={() => setIsCompleteModalOpen(false)}
          title="Clinical Treatment Record"
          className="max-w-5xl"
          footer={
            <Button 
              form="clinical-record-form"
              type="submit" 
              className="w-full h-14 rounded-2xl text-base font-bold shadow-xl shadow-indigo-500/20"
              variant="primary"
              isLoading={completing}
            >
              Finalize Treatment & Save Record
            </Button>
          }
        >
          <form id="clinical-record-form" onSubmit={handleCompleteSubmit}>
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Clinical Details */}
              <div className="flex-1 space-y-6">
                <div className="bg-indigo-500/5 p-5 rounded-[2rem] border border-indigo-500/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-[var(--foreground)] text-lg leading-tight">{patientData?.getPatient?.name}</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{sessionToProcess?.service?.title || 'Treatment'}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20`}>
                      Session {sessionToProcess?.sessionNumber}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Area(s) Treated</label>
                    <Input value={areaTreated} onChange={(e) => setAreaTreated(e.target.value)} placeholder="e.g., Full Face" className="h-11" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Intensity / Dosage</label>
                    <Input value={dosage} onChange={(e) => setDosage(e.target.value)} placeholder="e.g., 20J/cm²" className="h-11" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Clinical Notes</label>
                  <textarea 
                    value={clinicalNotes} 
                    onChange={(e) => setClinicalNotes(e.target.value)} 
                    placeholder="Treatment details..." 
                    className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl p-4 text-sm min-h-[100px] max-h-[120px] outline-none focus:border-indigo-500/50 transition-all" 
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-rose-400 uppercase tracking-widest ml-1">Complications / Reactions</label>
                  <input 
                    value={complications} 
                    onChange={(e) => setComplications(e.target.value)} 
                    placeholder="Any adverse effects?" 
                    className="w-full bg-rose-500/5 border border-rose-500/10 rounded-2xl h-11 px-4 text-sm outline-none focus:border-rose-500/50 text-rose-500" 
                  />
                </div>
              </div>

              {/* Right Column: Date, Payment & Follow-up */}
              <div className="w-full lg:w-[380px] space-y-6">
                <div className="space-y-4">
                  <DateTimePicker 
                    label="Actual Treatment Date"
                    date={actualDate}
                    setDate={setActualDate}
                  />
                  
                  {activePlanSummary && (
                    <div className="p-5 bg-amber-500/5 rounded-2xl border border-amber-500/10 space-y-3">
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-amber-600/80">
                        <span>Plan Total:</span>
                        <span>₹{(activePlanSummary.total || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-emerald-600/80">
                        <span>Paid So Far:</span>
                        <span>₹{(activePlanSummary.paid || 0).toLocaleString()}</span>
                      </div>
                      <div className="pt-2 border-t border-amber-500/10 flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-amber-700">
                        <span>Plan Balance:</span>
                        <span>₹{Math.max(0, activePlanSummary.remaining).toLocaleString()}</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest ml-1">Amount Paid Today</label>
                      <Input type="number" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0.00" icon={TrendingUp} className="h-11 border-emerald-500/30" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest ml-1">Discount</label>
                      <Input type="number" value={sessionDiscount} onChange={(e) => setSessionDiscount(e.target.value)} placeholder="0.00" icon={Sparkles} className="h-11" />
                    </div>
                  </div>

                  <div className="flex justify-between items-center px-1 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                    <span>Session Amount:</span>
                    <span className="text-[var(--foreground)]">₹{(sessionToProcess?.baseAmount || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-[var(--border)]">
                  <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                    Follow-up Logic <Sparkles size={12} />
                  </p>
                  
                  {existingNextSession ? (
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                          <CalendarDays size={16} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-[var(--foreground)] leading-tight">Next Session Scheduled</p>
                          <p className="text-[10px] text-[var(--text-muted)]">Set for {new Date(existingNextSession.appointmentDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <DateTimePicker 
                        label="Update Next Date"
                        date={nextSuggestedDate}
                        setDate={setNextSuggestedDate}
                      />
                    </div>
                  ) : (
                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${shouldAutoSchedule ? 'bg-emerald-500/10 text-emerald-500' : 'bg-gray-500/10 text-gray-400'}`}>
                            <History size={16} />
                          </div>
                          <p className="text-[11px] font-bold text-[var(--foreground)]">Auto-schedule?</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setShouldAutoSchedule(!shouldAutoSchedule)}
                          className={`w-10 h-5 rounded-full transition-all relative ${shouldAutoSchedule ? 'bg-emerald-500' : 'bg-gray-400'}`}
                        >
                          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${shouldAutoSchedule ? 'left-5.5' : 'left-0.5'}`} />
                        </button>
                      </div>

                      {shouldAutoSchedule && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <DateTimePicker 
                            label="Suggested Date"
                            date={nextSuggestedDate}
                            setDate={setNextSuggestedDate}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </form>
        </Modal>

        {/* Cancel Session Modal */}
        <Modal 
          isOpen={cancelModalOpen} 
          onClose={() => setCancelModalOpen(false)}
          title="Cancel Treatment Session"
          className="max-w-md"
        >
          <div className="text-center">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
              <XCircle size={40} />
            </div>
            <h4 className="text-[var(--foreground)] text-lg font-bold mb-2">Are you sure?</h4>
            <p className="text-[var(--text-muted)] text-sm mb-10">
              This will mark the session as cancelled. You can always reschedule or edit it later.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setCancelModalOpen(false)}
                className="flex-1 py-4 px-6 bg-[var(--surface-hover)] hover:bg-indigo-500/10 text-[var(--foreground)] font-bold rounded-2xl transition-all border border-[var(--border)]"
              >
                Back
              </button>
              <button 
                onClick={confirmCancel}
                className="flex-1 py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </Modal>

        <div className="max-w-6xl mx-auto pb-20">
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
              <Button icon={Plus} onClick={() => setIsScheduleModalOpen(true)}>Schedule Session</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Info Panel */}
            <div className="lg:col-span-4 space-y-8">
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

            {/* Right Treatment Tracking Panel */}
            <div className="lg:col-span-8 space-y-8">
              {/* Active / Next Appointment */}
              {allSessions.find(s => s.status === 'Scheduled') && (
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[60px] rounded-full -mr-20 -mt-20"></div>
                  <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                        <Clock size={20} />
                      </div>
                      <h3 className="text-lg font-bold">Upcoming Appointment</h3>
                    </div>
                    
                    {(() => {
                      const next = [...allSessions].filter(s => s.status === 'Scheduled').sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
                      return (
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                          <div>
                            <div className="text-3xl font-bold mb-2">
                              {new Date(next.appointmentDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                            </div>
                            <div className="text-indigo-100 flex items-center gap-4 text-sm font-medium">
                              <span className="flex items-center gap-1.5"><Clock size={14} /> {new Date(next.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              {next.service && <span className="flex items-center gap-1.5"><Activity size={14} /> {next.service.title}</span>}
                              {next.doctor && <span className="flex items-center gap-1.5"><User size={14} /> {next.doctor.name}</span>}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => markAsCompleted(next)}
                              className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2"
                            >
                              <CheckCircle2 size={18} />
                              Arrived & Treat
                            </button>
                            <button 
                              onClick={() => openEditSessionModal(next)}
                              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all border border-white/10"
                              title="Edit Details"
                            >
                              <Edit size={20} />
                            </button>
                            <button 
                              onClick={() => markAsMissed(next.id)}
                              className="p-3 bg-rose-500/20 hover:bg-rose-500/40 text-white rounded-2xl transition-all border border-white/10"
                              title="Mark as Missed"
                            >
                              <XCircle size={20} />
                            </button>
                          </div>
                        </div>
                      )
                    })()}
                  </div>
                </div>
              )}

              {/* Treatment History List */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 md:p-10 shadow-sm min-h-[400px]">
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Activity size={20} />
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)]">Treatment Timeline</h3>
                  </div>
                  <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em]">
                    {allSessions.length} Total Sessions
                  </div>
                </div>

                {plansLoading || sessionsLoading ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : (plans.length > 0 || standaloneSessions.length > 0) ? (
                  <div className="space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
                    {[
                      ...plans.map(p => ({ type: 'plan', item: p, date: new Date(p.createdAt) })),
                      ...standaloneSessions.map(s => ({ type: 'session', item: s, date: new Date(s.appointmentDate) }))
                    ].sort((a, b) => b.date - a.date).map((entry) => {
                      if (entry.type === 'plan') {
                        const plan = entry.item;
                        const isMultiSession = plan.totalSessions > 1;
                        const progress = (plan.completedSessions / plan.totalSessions) * 100;
                        const isExpanded = expandedPlans[plan.id];
                        const nextSession = plan.sessions?.find(s => s.status === 'Scheduled');
                        const lastSession = [...(plan.sessions || [])].sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate))[0];

                        return (
                          <div key={plan.id} className="relative pl-12 group">
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl border flex items-center justify-center z-10 transition-all ${
                              plan.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                              plan.status === 'Cancelled' ? 'bg-rose-500/10 border-rose-500/20' :
                              'bg-indigo-500/10 border-indigo-500/20'
                            }`}>
                              {plan.status === 'Completed' ? <CheckCircle2 className="text-emerald-500" size={18} /> : <Activity className="text-indigo-400" size={18} />}
                            </div>

                            <div className={`rounded-3xl p-6 transition-all border ${
                              isMultiSession 
                              ? 'bg-indigo-500/[0.03] border-indigo-500/20 shadow-sm' 
                              : 'bg-[var(--surface-hover)] border-[var(--border)]'
                            }`}>
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-[var(--foreground)]">
                                      {plan.service?.title}
                                    </h4>
                                    <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${
                                      plan.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                      plan.status === 'In Progress' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                    }`}>
                                      {plan.status.toUpperCase()} ●
                                    </span>
                                  </div>
                                  
                                  {isMultiSession ? (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)] font-medium uppercase mt-2">
                                      <span className="flex items-center gap-1"><Calendar size={12} /> Started: {new Date(plan.createdAt).toLocaleDateString()}</span>
                                      {nextSession && <span className="flex items-center gap-1 text-indigo-400 font-bold"><Clock size={12} /> Next: {new Date(nextSession.appointmentDate).toLocaleDateString()}</span>}
                                      <span className="flex items-center gap-1"><ShieldCheck size={12} /> {plan.doctor?.name || 'TBA'}</span>
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)] font-medium uppercase mt-2">
                                      <span className="flex items-center gap-1"><Calendar size={12} /> Date: {new Date(lastSession?.appointmentDate || plan.createdAt).toLocaleDateString()}</span>
                                      <span className="flex items-center gap-1"><ShieldCheck size={12} /> {plan.doctor?.name || 'Dr. Sharma'}</span>
                                    </div>
                                  )}
                                </div>

                                <div className="flex gap-2">
                                  {isMultiSession && (
                                    <Button 
                                      variant="outline" 
                                      size="sm" 
                                      onClick={() => openAddSessionModal(plan)}
                                      icon={Plus}
                                      className="h-9 text-[10px] px-3"
                                    >
                                      Add Session
                                    </Button>
                                  )}
                                  <Button 
                                    variant="secondary" 
                                    size="sm"
                                    className="h-9 text-[10px] px-3"
                                    onClick={() => isMultiSession ? openEditPlanModal(plan) : openEditSessionModal(plan.sessions[0])}
                                    icon={Edit}
                                  >
                                    {isMultiSession ? 'Edit Plan' : 'Edit Session'}
                                  </Button>
                                </div>
                              </div>

                              {isMultiSession && (
                                <div className="mt-6 space-y-3">
                                  <div className="flex items-center justify-between text-[10px] font-bold uppercase">
                                    <span className="text-[var(--text-muted)]">Progress: {plan.completedSessions} of {plan.totalSessions} sessions completed</span>
                                    <span className="text-indigo-400">{Math.round(progress)}%</span>
                                  </div>
                                  <div className="w-full bg-indigo-500/10 h-2 rounded-full overflow-hidden">
                                    <div 
                                      className="bg-indigo-500 h-full transition-all duration-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                                      style={{ width: `${progress}%` }}
                                    ></div>
                                  </div>
                                  <div className="flex items-center gap-3 pt-2">
                                    <span className="text-[10px] text-[var(--text-muted)] font-medium uppercase">Interval: {plan.intervalWeeks} weeks between sessions</span>
                                  </div>
                                </div>
                              )}

                              {isMultiSession && (
                                <div className="mt-6 pt-4 border-t border-indigo-500/10">
                                  <button 
                                    onClick={() => togglePlanExpansion(plan.id)}
                                    className="flex items-center gap-2 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 transition-colors uppercase tracking-widest"
                                  >
                                    {isExpanded ? 'Hide Sessions ▲' : 'View All Sessions ▼'}
                                  </button>

                                  {isExpanded && (
                                    <div className="mt-6 space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-indigo-500/10">
                                      {plan.sessions?.map((session, idx) => {
                                        const isLocked = session.actualDate && (new Date() - new Date(session.actualDate)) > (48 * 60 * 60 * 1000);
                                        return (
                                          <div key={session.id} className="relative pl-8">
                                            <div className={`absolute left-0 top-1 w-6 h-6 rounded-lg border flex items-center justify-center z-10 ${
                                              session.status === 'Completed' ? 'bg-emerald-500 text-white border-emerald-500' : 
                                              session.status === 'Missed' ? 'bg-rose-500 text-white border-rose-500' :
                                              'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                            }`}>
                                              {session.status === 'Completed' ? <CheckCircle2 size={12} /> : <span className="text-[10px] font-bold">{session.sessionNumber}</span>}
                                            </div>
                                            
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                              <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                  <span className="text-xs font-bold text-[var(--foreground)]">Session {session.sessionNumber}</span>
                                                  <span className="text-[10px] text-[var(--text-muted)]">|</span>
                                                  <span className="text-xs text-[var(--text-muted)]">{new Date(session.appointmentDate).toLocaleString([], { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                  <span className={`ml-2 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest ${getStatusClass(session.status)}`}>
                                                    {session.status}
                                                  </span>
                                                  {isLocked && <Lock size={10} className="text-[var(--text-muted)] ml-1" />}
                                                </div>
                                                <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-2">
                                                  <span>→ {session.doctor?.name || 'TBA'}</span>
                                                  {session.status === 'Completed' && (
                                                    <>
                                                      <span className="w-1 px-1 opacity-20">|</span>
                                                      <span className="text-indigo-400 font-bold">{session.areaTreated || 'Full Body'}</span>
                                                      <span className="w-1 px-1 opacity-20">|</span>
                                                      <span className="text-indigo-400 font-bold">{session.dosage || 'Standard'}</span>
                                                    </>
                                                  )}
                                                  <span className="w-1 px-1 opacity-20">|</span>
                                                  <span>Next: {
                                                    idx < plan.sessions.length - 1 
                                                    ? new Date(plan.sessions[idx+1].appointmentDate).toLocaleDateString()
                                                    : 'Not yet scheduled'
                                                  }</span>
                                                </p>
                                              </div>
                                              
                                              {!isLocked && (session.status === 'Scheduled' || session.status === 'Missed') && (
                                                <div className="flex gap-2">
                                                  <button onClick={() => markAsCompleted(session)} className="text-[9px] font-bold uppercase text-emerald-500 hover:bg-emerald-500/10 px-2 py-1 rounded transition-all">[Complete]</button>
                                                  <button onClick={() => openEditSessionModal(session)} className="text-[9px] font-bold uppercase text-indigo-400 hover:bg-indigo-500/10 px-2 py-1 rounded transition-all">[Edit Details]</button>
                                                  <button onClick={() => markAsMissed(session.id)} className="text-[9px] font-bold uppercase text-rose-500 hover:bg-rose-500/10 px-2 py-1 rounded transition-all">[Cancel]</button>
                                                </div>
                                              )}
                                              {isLocked && (
                                                <span className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest opacity-60">Locked (Audit Trail)</span>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}

                                      {/* Show estimated future sessions */}
                                      {Array.from({ length: plan.totalSessions - (plan.sessions?.length || 0) }).map((_, i) => {
                                        const sessionNum = (plan.sessions?.length || 0) + i + 1;
                                        const lastDate = lastSession ? new Date(lastSession.appointmentDate) : new Date(plan.createdAt);
                                        const estDate = new Date(lastDate);
                                        estDate.setDate(estDate.getDate() + (plan.intervalWeeks * 7 * (i + 1)));

                                        return (
                                          <div key={`est-${sessionNum}`} className="relative pl-8 opacity-50">
                                            <div className="absolute left-0 top-1 w-6 h-6 rounded-lg border border-dashed border-gray-400 flex items-center justify-center z-10 text-gray-400">
                                              <span className="text-[10px] font-bold">{sessionNum}</span>
                                            </div>
                                            <div className="flex flex-col">
                                              <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-xs font-bold text-[var(--foreground)]">Session {sessionNum}</span>
                                                <span className="text-[10px] text-[var(--text-muted)]">|</span>
                                                <span className="text-xs text-[var(--text-muted)]">{estDate.toLocaleDateString()} (estimated)</span>
                                                <span className="ml-2 px-1.5 py-0.5 rounded text-[7px] font-bold uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-gray-500/20">
                                                  PENDING
                                                </span>
                                              </div>
                                              <p className="text-[10px] text-[var(--text-muted)]">→ Not yet scheduled</p>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      } else {
                        const session = entry.item;
                        return (
                          <div key={session.id} className="relative pl-12 group">
                            <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl border flex items-center justify-center z-10 transition-all ${
                              session.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                              session.status === 'Missed' ? 'bg-rose-500/10 border-rose-500/20' :
                              'bg-indigo-500/10 border-indigo-500/20'
                            }`}>
                              {getStatusIcon(session.status)}
                            </div>
                            
                            <div className="bg-[var(--surface-hover)] border border-[var(--border)] rounded-3xl p-6 transition-all">
                              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="text-lg font-bold text-[var(--foreground)]">
                                      {session.service?.title || 'Consultation & Assessment'}
                                    </h4>
                                    <div className="flex flex-col items-end gap-1 text-right ml-auto">
                                      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--foreground)]">
                                        <span className="text-[10px] text-[var(--text-muted)]">Paid:</span>
                                        <span className="text-emerald-500">₹{session.paidAmount || 0}</span>
                                        <span className="text-[10px] text-[var(--text-muted)]">/ ₹{session.baseAmount || 0}</span>
                                      </div>
                                      <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${getStatusClass(session.status)}`}>
                                        {session.status.toUpperCase()} ●
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-[var(--text-muted)] font-medium uppercase mt-2">
                                    <span className="flex items-center gap-1"><Calendar size={12} /> Date: {new Date(session.appointmentDate).toLocaleString()}</span>
                                    <span className="flex items-center gap-1"><ShieldCheck size={12} /> Doctor: {session.doctor?.name || 'Dr. Sharma'}</span>
                                    {session.status === 'Completed' && (
                                      <>
                                        <span className="flex items-center gap-1 text-indigo-400 font-bold"><Activity size={12} /> Area: {session.areaTreated || 'N/A'}</span>
                                        <span className="flex items-center gap-1 text-indigo-400 font-bold"><TrendingUp size={12} /> Dosage: {session.dosage || 'N/A'}</span>
                                      </>
                                    )}
                                  </div>
                                  {session.notes && (
                                    <p className="mt-3 text-xs text-[var(--text-muted)] italic">Notes: {session.notes}</p>
                                  )}
                                </div>
                                <div className="flex gap-2">
                                  <Button variant="secondary" size="sm" className="h-9 text-[10px] px-3" onClick={() => openEditSessionModal(session)}>Edit Session</Button>
                                  <Button variant="outline" size="sm" className="h-9 text-[10px] px-3" onClick={() => openAddSessionModal({ id: null, service: session.service, doctor: session.doctor })}>Redo</Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-[var(--surface-hover)] rounded-[2.5rem] border border-dashed border-[var(--border)]">
                    <p className="text-[var(--text-muted)] text-sm mb-6">No treatment history available for this patient.</p>
                    <Button variant="outline" icon={Plus} onClick={openNewSessionModal}>Schedule First Session</Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
