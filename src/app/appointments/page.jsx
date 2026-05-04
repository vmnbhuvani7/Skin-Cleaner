'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Check, X, Calendar, Clock, User, Search, Trash2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useMutation, useLazyQuery, useQuery } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';
import { Waypoint } from 'react-waypoint';

import { GET_APPOINTMENTS, GET_APPOINTMENT_STATS } from '@/graphql/queries/appointment';
import { APPROVE_APPOINTMENT, REJECT_APPOINTMENT, DELETE_APPOINTMENT } from '@/graphql/mutations/appointment';

export default function AppointmentsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listData, setListData] = useState({
    appointments: [],
    hasMore: true
  });
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'Pending', 'Approved', 'Rejected', 'today'
  
  const getStatusFilterValue = (filter) => {
    if (filter === 'all' || filter === 'today') return undefined;
    return filter;
  };

  const getTodayDateRange = () => {
    if (statusFilter !== 'today') return {};
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return {
      dateFrom: today.toISOString(),
      dateTo: tomorrow.toISOString()
    };
  };

  const [getAppointments, { data: appointmentsData, loading: appointmentsLoading }] = useLazyQuery(GET_APPOINTMENTS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    onCompleted: (res) => {
      if (res?.getAppointments) {
        if (page === 1) {
          setListData({
            appointments: res.getAppointments.appointments || [],
            hasMore: res.getAppointments.currentPage < res.getAppointments.totalPages
          });
        } else {
          setListData(prev => ({
            appointments: [...prev.appointments, ...res.getAppointments.appointments],
            hasMore: res.getAppointments.currentPage < res.getAppointments.totalPages
          }));
        }
      }
    }
  });

  const { data: statsData, loading: statsLoading } = useQuery(GET_APPOINTMENT_STATS, {
    fetchPolicy: 'cache-and-network'
  });

  useEffect(() => {
    getAppointments({
      variables: { 
        page, 
        limit: 10, 
        status: getStatusFilterValue(statusFilter),
        ...getTodayDateRange()
      },
    });
  }, [page, statusFilter, getAppointments]);

  useEffect(() => {
    setPage(1);
    setListData({
      appointments: [],
      hasMore: true
    });
  }, [statusFilter]);

  const [approveAppointment] = useMutation(APPROVE_APPOINTMENT);
  const [rejectAppointment] = useMutation(REJECT_APPOINTMENT);
  const [deleteAppointment] = useMutation(DELETE_APPOINTMENT);

  const loadMore = () => {
    const current = appointmentsData?.getAppointments?.currentPage || 1;
    const total = appointmentsData?.getAppointments?.totalPages || 1;
    if (current < total && !appointmentsLoading) {
      setPage(prev => prev + 1);
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const handleApprove = async (e, id) => {
    e.stopPropagation();
    try {
      await approveAppointment({ 
        variables: { id },
      });
      getAppointments({
        variables: { 
          page: 1, 
          limit: 10, 
          status: getStatusFilterValue(statusFilter)
        },
      });
      toast.success('Appointment approved successfully');
    } catch (err) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleReject = async (e, id) => {
    e.stopPropagation();
    try {
      await rejectAppointment({ 
        variables: { id },
      });
      getAppointments({
        variables: { 
          page: 1, 
          limit: 10, 
          status: getStatusFilterValue(statusFilter)
        },
      });
      toast.success('Appointment rejected');
    } catch (err) {
      toast.error('Failed to reject appointment');
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setAppointmentToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!appointmentToDelete) return;
    try {
      await deleteAppointment({ 
        variables: { id: appointmentToDelete },
      });
      setPage(1);
      getAppointments({
        variables: { 
          page: 1, 
          limit: 10, 
          status: getStatusFilterValue(statusFilter)
        },
      });
      toast.success('Appointment deleted successfully');
      setDeleteModalOpen(false);
      setAppointmentToDelete(null);
    } catch (err) {
      toast.error('Failed to delete appointment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const { theme } = useTheme();

  const stats = statsData?.getAppointmentStats || {
    totalPending: 0,
    totalApproved: 0,
    totalRejected: 0,
    todayAppointments: 0,
    todayPending: 0,
    todayApproved: 0,
    todayRejected: 0
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
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
            <h4 className="text-white text-lg font-bold mb-2">Are you absolutely sure?</h4>
            <p className="text-gray-500 text-sm mb-10">
              This action cannot be undone. This will permanently remove the appointment record.
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
        
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-2">Appointments</h1>
              <p className="text-[var(--text-muted)] text-sm">Manage and track all patient appointments.</p>
            </div>
            
            <div className="flex sm:flex-row items-center gap-4 w-full sm:w-auto">
              <Button onClick={() => router.push('/appointments/add')} icon={Plus}>Book Appointment</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div 
              className={`bg-[var(--surface)] border rounded-[2rem] p-6 cursor-pointer transition-all ${
                statusFilter === 'Pending' 
                  ? 'border-amber-500/30 shadow-lg shadow-amber-500/10' 
                  : 'border-[var(--border)] hover:border-amber-500/20'
              }`}
              onClick={() => setStatusFilter('Pending')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <Clock size={24} />
                </div>
                <span className="bg-amber-500/10 text-amber-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-500/20">
                  Pending
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalPending}</p>
              <p className="text-[var(--text-muted)] text-sm">Pending Appointments</p>
            </div>

            <div 
              className={`bg-[var(--surface)] border rounded-[2rem] p-6 cursor-pointer transition-all ${
                statusFilter === 'Approved' 
                  ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/10' 
                  : 'border-[var(--border)] hover:border-emerald-500/20'
              }`}
              onClick={() => setStatusFilter('Approved')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <Check size={24} />
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                  Approved
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalApproved}</p>
              <p className="text-[var(--text-muted)] text-sm">Approved Appointments</p>
            </div>

            <div 
              className={`bg-[var(--surface)] border rounded-[2rem] p-6 cursor-pointer transition-all ${
                statusFilter === 'Rejected' 
                  ? 'border-rose-500/30 shadow-lg shadow-rose-500/10' 
                  : 'border-[var(--border)] hover:border-rose-500/20'
              }`}
              onClick={() => setStatusFilter('Rejected')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                  <X size={24} />
                </div>
                <span className="bg-rose-500/10 text-rose-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-rose-500/20">
                  Rejected
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.totalRejected}</p>
              <p className="text-[var(--text-muted)] text-sm">Rejected Appointments</p>
            </div>

            <div 
              className={`bg-[var(--surface)] border rounded-[2rem] p-6 cursor-pointer transition-all ${
                statusFilter === 'today' 
                  ? 'border-indigo-500/30 shadow-lg shadow-indigo-500/10' 
                  : 'border-[var(--border)] hover:border-indigo-500/20'
              }`}
              onClick={() => setStatusFilter('today')}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Calendar size={24} />
                </div>
                <span className="bg-indigo-500/10 text-indigo-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-indigo-500/20">
                  Today
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{stats.todayAppointments}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-amber-500 text-xs">{stats.todayPending} Pending</span>
                <span className="text-emerald-500 text-xs">{stats.todayApproved} Approved</span>
              </div>
            </div>
          </div>

          <div className="flex bg-[var(--surface)] border border-[var(--border)] p-1 rounded-2xl mb-8 w-fit">
            <button 
              onClick={() => setStatusFilter('all')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${statusFilter === 'all' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              All
            </button>
            <button 
              onClick={() => setStatusFilter('Pending')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${statusFilter === 'Pending' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              Pending
            </button>
            <button 
              onClick={() => setStatusFilter('Approved')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${statusFilter === 'Approved' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              Approved
            </button>
            <button 
              onClick={() => setStatusFilter('Rejected')}
              className={`px-6 py-3 rounded-xl text-sm font-bold transition-all ${statusFilter === 'Rejected' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              Rejected
            </button>
          </div>

          <div className="space-y-4">
            {listData.appointments.map((appointment) => (
              <div 
                key={appointment.id} 
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 hover:bg-[var(--surface-hover)] transition-all shadow-sm"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <User size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-[var(--foreground)]">{appointment.patient.name}</h3>
                      <p className="text-indigo-400 text-sm font-medium mb-2">{appointment.service.title}</p>
                      {appointment.doctor && (
                        <p className="text-emerald-400 text-xs font-medium mb-2">
                          <User size={12} className="inline mr-1" /> {appointment.doctor.name} - {appointment.doctor.specialization}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-[var(--text-muted)] text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} />
                          {formatDate(appointment.appointmentDate)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={16} />
                          {formatTime(appointment.appointmentDate)}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest ${
                      appointment.status === 'Pending' 
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                        : appointment.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                    }`}>
                      {appointment.status}
                    </span>

                    {appointment.status === 'Pending' && (
                      <>
                        <button 
                          onClick={(e) => handleApprove(e, appointment.id)} 
                          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 hover:text-emerald-400 transition-all"
                        >
                          <Check size={18} />
                        </button>
                        <button 
                          onClick={(e) => handleReject(e, appointment.id)} 
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 hover:text-rose-400 transition-all"
                        >
                          <X size={18} />
                        </button>
                      </>
                    )}

                    <button 
                      onClick={(e) => handleDeleteClick(e, appointment.id)} 
                      className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {listData.hasMore && !appointmentsLoading && listData.appointments.length > 0 && (
              <div className="h-10">
                <Waypoint onEnter={loadMore} />
              </div>
            )}

            {appointmentsLoading && (
              <div className="py-10 text-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Loading appointments...</p>
              </div>
            )}

            {!appointmentsLoading && listData.appointments.length === 0 && (
              <div className="py-20 text-center bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-[2.5rem]">
                <p className="text-[var(--text-muted)] font-medium">No appointments found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
