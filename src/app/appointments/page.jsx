'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Check, X, Calendar, Clock, User, Search, Trash2, LayoutGrid, List, Filter, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/ui/DataTable';
import ViewToggle from '@/components/ui/ViewToggle';
import Pagination from '@/components/ui/Pagination';
import Input from '@/components/ui/Input';
import Loader from '@/components/ui/Loader';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';

import { GET_APPOINTMENTS, GET_APPOINTMENT_STATS } from '@/graphql/queries/appointment';
import { APPROVE_APPOINTMENT, REJECT_APPOINTMENT, DELETE_APPOINTMENT } from '@/graphql/mutations/appointment';

export default function AppointmentsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

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

  const { data: appointmentsData, loading, refetch } = useQuery(GET_APPOINTMENTS, {
    variables: { 
      page: 1, 
      limit: 100, 
      status: (statusFilter === 'all' || statusFilter === 'today') ? undefined : statusFilter,
      ...getTodayDateRange()
    },
    fetchPolicy: 'cache-and-network'
  });

  const { data: statsData } = useQuery(GET_APPOINTMENT_STATS, {
    fetchPolicy: 'cache-and-network'
  });

  const [approveAppointment] = useMutation(APPROVE_APPOINTMENT);
  const [rejectAppointment] = useMutation(REJECT_APPOINTMENT);
  const [deleteAppointment] = useMutation(DELETE_APPOINTMENT);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);

  const handleApprove = async (e, id) => {
    e.stopPropagation();
    try {
      await approveAppointment({ variables: { id } });
      refetch();
      toast.success('Appointment approved successfully');
    } catch (err) {
      toast.error('Failed to approve appointment');
    }
  };

  const handleReject = async (e, id) => {
    e.stopPropagation();
    try {
      await rejectAppointment({ variables: { id } });
      refetch();
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
      await deleteAppointment({ variables: { id: appointmentToDelete } });
      refetch();
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
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredAppointments = appointmentsData?.getAppointments?.appointments?.filter(a =>
    a.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.service.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  const stats = statsData?.getAppointmentStats || {
    totalPending: 0, totalApproved: 0, totalRejected: 0, todayAppointments: 0
  };

  const columns = [
    {
      header: 'Patient',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
            <User size={18} />
          </div>
          <div>
            <p className="font-bold text-[var(--foreground)] leading-none mb-1">{row.patient.name}</p>
            <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">{row.service.title}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Schedule',
      accessor: (row) => (
        <div className="space-y-1">
          <p className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
            <Calendar size={12} className="text-indigo-400" /> {formatDate(row.appointmentDate)}
          </p>
          <p className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-2 opacity-60">
            <Clock size={12} /> {formatTime(row.appointmentDate)}
          </p>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          row.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
          row.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
          'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          {row.status === 'Pending' && (
            <>
              <button onClick={(e) => handleApprove(e, row.id)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-all"><Check size={16} /></button>
              <button onClick={(e) => handleReject(e, row.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all"><X size={16} /></button>
            </>
          )}
          <button onClick={(e) => handleDeleteClick(e, row.id)} className="p-2 hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
        </div>
      )
    }
  ];

  if (loading) return <Loader fullScreen />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion" size="max-w-md">
          <div className="text-center pt-2">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h4 className="text-[var(--foreground)] text-lg font-black tracking-tight mb-2">Are you sure?</h4>
            <p className="text-[var(--text-muted)] text-sm mb-10 font-medium">This will permanently remove the appointment.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-4 px-6 bg-[var(--surface-hover)] font-bold rounded-2xl border border-[var(--border)]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 px-6 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 uppercase tracking-widest text-xs">Delete</button>
            </div>
          </div>
        </Modal>

        <div className="max-w-7xl mx-auto space-y-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-2">Appointments</h1>
              <p className="text-[var(--text-muted)] text-sm font-medium opacity-80">Track and manage patient clinical bookings</p>
            </div>
            <Button onClick={() => router.push('/appointments/add')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]">
              <Plus size={18} />
              <span>Book Appointment</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Pending', count: stats.totalPending, icon: Clock, color: 'amber', filter: 'Pending' },
              { label: 'Approved', count: stats.totalApproved, icon: Check, color: 'emerald', filter: 'Approved' },
              { label: 'Rejected', count: stats.totalRejected, icon: X, color: 'rose', filter: 'Rejected' },
              { label: 'Today', count: stats.todayAppointments, icon: Calendar, color: 'indigo', filter: 'today' }
            ].map((s) => (
              <div 
                key={s.label}
                onClick={() => setStatusFilter(s.filter)}
                className={`bg-[var(--surface)] border rounded-[2rem] p-6 cursor-pointer transition-all ${statusFilter === s.filter ? `border-${s.color}-500/40 ring-4 ring-${s.color}-500/5 shadow-xl` : 'border-[var(--border)] hover:border-indigo-500/20 shadow-sm'}`}
              >
                <div className={`w-12 h-12 rounded-2xl bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-500 mb-4`}>
                  <s.icon size={24} />
                </div>
                <p className="text-3xl font-bold text-[var(--foreground)] leading-none mb-1">{s.count}</p>
                <p className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest opacity-60">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search patient or service..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-12 h-14 rounded-2xl border border-[var(--border)] focus:ring-indigo-500 bg-[var(--surface)] shadow-sm"
              />
            </div>
            <ViewToggle mode={viewMode} setMode={setViewMode} />
          </div>

          {viewMode === 'list' ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
              <DataTable columns={columns} data={currentItems} isLoading={loading} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((appointment) => (
                <div key={appointment.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:bg-[var(--surface-hover)] transition-all relative overflow-hidden group shadow-sm flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <User size={28} />
                    </div>
                    <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                      appointment.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      appointment.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{appointment.patient.name}</h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{appointment.service.title}</p>
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm font-medium">
                      <Calendar size={16} className="opacity-50" />
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm font-medium">
                      <Clock size={16} className="opacity-50" />
                      <span>{formatTime(appointment.appointmentDate)}</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[var(--border)] flex items-center justify-end gap-3 mt-auto">
                    {appointment.status === 'Pending' && (
                      <>
                        <button onClick={(e) => handleApprove(e, appointment.id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">Approve</button>
                        <button onClick={(e) => handleReject(e, appointment.id)} className="flex-1 py-2 bg-rose-500/10 text-rose-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all hover:bg-rose-500/20 border border-rose-500/20">Reject</button>
                      </>
                    )}
                    <button onClick={(e) => handleDeleteClick(e, appointment.id)} className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination totalItems={filteredAppointments.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </main>
    </div>
  );
}
