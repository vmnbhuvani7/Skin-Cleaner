'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { 
  ArrowLeft, User, Phone, Mail, Calendar, MapPin, ClipboardList, 
  Activity, Clock, ShieldCheck, Edit, Trash2, Plus, CheckCircle2, 
  XCircle, AlertCircle, ChevronRight, MoreVertical 
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
  UPDATE_SESSION_STATUS, DELETE_SESSION 
} from '@/graphql/treatmentSession';

export default function PatientDetailPage() {
  const router = useRouter();
  const { id } = useParams();
  const { theme } = useTheme();

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleData, setScheduleData] = useState({
    appointmentDate: '',
    serviceId: '',
    doctorId: '',
    notes: ''
  });

  // Queries
  const { data: patientData, loading: patientLoading } = useQuery(GET_PATIENT, {
    variables: { id },
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
      setScheduleData({ appointmentDate: '', serviceId: '', doctorId: '', notes: '' });
      refetchSessions();
    }
  });

  const [updateStatus] = useMutation(UPDATE_SESSION_STATUS, {
    onCompleted: () => {
      toast.success('Session updated');
      refetchSessions();
    }
  });

  const handleSchedule = (e) => {
    e.preventDefault();
    if (!scheduleData.appointmentDate) return toast.error('Please select a date');
    
    scheduleSession({
      variables: {
        patientId: id,
        ...scheduleData
      }
    });
  };

  const markAsCompleted = (sessionId) => {
    updateStatus({
      variables: { id: sessionId, status: 'Completed' }
    });
  };

  const markAsMissed = (sessionId) => {
    updateStatus({
      variables: { id: sessionId, status: 'Missed' }
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
  const sessions = sessionsData?.getPatientSessions || [];

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
          className="max-w-xl"
        >
          <form onSubmit={handleSchedule} className="space-y-6">
            <DateTimePicker 
              label="Appointment Date & Time"
              date={scheduleData.appointmentDate}
              setDate={(date) => setScheduleData({ ...scheduleData, appointmentDate: date })}
              placeholder="Select date and time"
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Service</label>
                <Select 
                  value={scheduleData.serviceId} 
                  onValueChange={(value) => setScheduleData({ ...scheduleData, serviceId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Service" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicesData?.getServices?.services?.map(s => (
                      <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Doctor</label>
                <Select 
                  value={scheduleData.doctorId} 
                  onValueChange={(value) => setScheduleData({ ...scheduleData, doctorId: value })}
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
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest ml-1">Notes</label>
              <textarea 
                placeholder="Session instructions or notes..."
                className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-2xl py-3.5 px-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all text-sm min-h-[100px]"
                value={scheduleData.notes}
                onChange={(e) => setScheduleData({ ...scheduleData, notes: e.target.value })}
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsScheduleModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" isLoading={scheduling}>Schedule Session</Button>
            </div>
          </form>
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
                  <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-6 border border-indigo-500/20 shadow-inner">
                    <User size={40} />
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
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-tighter">Conditions</p>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed italic">{patient.medicalHistory || 'None recorded.'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-tighter">Ongoing Treatments</p>
                    <p className="text-sm text-[var(--text-muted)] leading-relaxed">{patient.ongoingTreatments || 'None.'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Treatment Tracking Panel */}
            <div className="lg:col-span-8 space-y-8">
              {/* Active / Next Appointment */}
              {sessions.find(s => s.status === 'Scheduled') && (
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
                      const next = [...sessions].filter(s => s.status === 'Scheduled').sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))[0];
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
                              onClick={() => markAsCompleted(next.id)}
                              className="px-6 py-3 bg-white text-indigo-600 font-bold rounded-2xl hover:bg-indigo-50 transition-all shadow-lg"
                            >
                              Arrived & Treat
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
                    {sessions.length} Total Sessions
                  </div>
                </div>

                {sessionsLoading ? (
                  <div className="py-20 text-center">
                    <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-6 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-px before:bg-[var(--border)]">
                    {sessions.map((session) => (
                      <div key={session.id} className="relative pl-12 group">
                        <div className={`absolute left-0 top-1 w-10 h-10 rounded-xl border flex items-center justify-center z-10 transition-all ${
                          session.status === 'Completed' ? 'bg-emerald-500/10 border-emerald-500/20' : 
                          session.status === 'Missed' ? 'bg-rose-500/10 border-rose-500/20' :
                          'bg-indigo-500/10 border-indigo-500/20'
                        }`}>
                          {getStatusIcon(session.status)}
                        </div>
                        
                        <div className="bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] rounded-3xl p-6 transition-all">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                              <div className="flex items-center gap-3 mb-1">
                                <span className="text-sm font-bold text-[var(--foreground)]">
                                  {new Date(session.appointmentDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                                <span className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest border ${getStatusClass(session.status)}`}>
                                  {session.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-tighter">
                                {new Date(session.appointmentDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • 
                                {session.service?.title || 'General Consultation'} with {session.doctor?.name || 'Staff'}
                              </p>
                            </div>
                            
                            {session.status === 'Scheduled' && (
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => markAsCompleted(session.id)}
                                  className="text-[10px] font-bold uppercase text-emerald-500 hover:bg-emerald-500/10 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Complete
                                </button>
                                <button 
                                  onClick={() => markAsMissed(session.id)}
                                  className="text-[10px] font-bold uppercase text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg transition-all"
                                >
                                  Missed
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {session.notes && (
                            <div className="text-xs text-[var(--text-muted)] bg-[var(--surface-hover)] p-4 rounded-2xl border border-[var(--border)] italic">
                              "{session.notes}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center bg-[var(--surface-hover)] rounded-[2.5rem] border border-dashed border-[var(--border)]">
                    <p className="text-[var(--text-muted)] text-sm mb-6">No treatment history available for this patient.</p>
                    <Button variant="outline" icon={Plus} onClick={() => setIsScheduleModalOpen(true)}>Start Treatment Plan</Button>
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
