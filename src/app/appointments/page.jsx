'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Check, X, Calendar, Clock, User, Trash2, LayoutGrid, List, Filter, ArrowRight, Edit2, Activity } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/ui/DataTable';
import ViewToggle from '@/components/ui/ViewToggle';
import Pagination from '@/components/ui/Pagination';
import Loader from '@/components/ui/Loader';
import FilterDrawer from '@/components/ui/FilterDrawer';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';

import { GET_APPOINTMENTS, GET_APPOINTMENT_STATS } from '@/graphql/queries/appointment';
import { GET_PATIENTS } from '@/graphql/queries/patient';
import { APPROVE_APPOINTMENT, REJECT_APPOINTMENT, DELETE_APPOINTMENT } from '@/graphql/mutations/appointment';
import { ITEMS_PER_PAGE } from '@/constants/settings';
import { isOrganization } from '@/utils/roleUtils';
import { APPOINTMENT_STATUS_OPTIONS } from '@/utils/constants';

const getLocalDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const { theme } = useTheme();

  const { todayStr, tomorrowStr, initialDefaultFilters } = useMemo(() => {
    const today = new Date();
    const tStr = getLocalDateStr(today);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomStr = getLocalDateStr(tomorrow);
    return {
      todayStr: tStr,
      tomorrowStr: tomStr,
      initialDefaultFilters: {
        search: '',
        dateFrom: tStr,
        dateTo: tomStr,
        status: 'all',
        patient: 'all'
      }
    };
  }, []);

  const [filters, setFilters] = useState(initialDefaultFilters);
  
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [userRole, setUserRole] = useState('');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role?.name || '');
    }
  }, []);

  const isOrg = isOrganization(userRole);

  const { data: patientsData } = useQuery(GET_PATIENTS, {
    variables: { limit: 100 },
    skip: !isOrg
  });

  const { data: appointmentsData, loading, refetch } = useQuery(GET_APPOINTMENTS, {
    variables: { 
      page: currentPage, 
      limit: ITEMS_PER_PAGE, 
      filter: JSON.stringify({
        status: filters.status,
        patientId: filters.patient,
        dateFrom: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
        dateTo: filters.dateTo ? new Date(filters.dateTo).toISOString() : undefined,
        searchTerm: filters.search
      })
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

  const handleApprove = useCallback(async (e, id) => {
    e.stopPropagation();
    try {
      await approveAppointment({ variables: { id } });
      refetch();
      toast.success('Appointment approved successfully');
    } catch (err) {
      toast.error('Failed to approve appointment');
    }
  }, [approveAppointment, refetch]);

  const handleReject = useCallback(async (e, id) => {
    e.stopPropagation();
    try {
      await rejectAppointment({ variables: { id } });
      refetch();
      toast.success('Appointment rejected');
    } catch (err) {
      toast.error('Failed to reject appointment');
    }
  }, [rejectAppointment, refetch]);

  const handleDeleteClick = useCallback((e, id) => {
    e.stopPropagation();
    setAppointmentToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const confirmDelete = useCallback(async () => {
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
  }, [appointmentToDelete, deleteAppointment, refetch]);

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

  const currentItems = appointmentsData?.getAppointments?.appointments || [];
  const totalCount = appointmentsData?.getAppointments?.totalCount || 0;

  const stats = statsData?.getAppointmentStats || {
    totalPending: 0, totalApproved: 0, totalRejected: 0, todayAppointments: 0
  };

  const activeFilters = useMemo(() => {
    const arr = [];
    if (filters.search) arr.push({ id: 'search', label: `Search: ${filters.search}` });
    if (filters.status !== 'all') arr.push({ id: 'status', label: `Status: ${filters.status}` });
    if (filters.patient !== 'all') {
      const patientName = patientsData?.getPatients?.patients?.find(p => p.id === filters.patient)?.name || 'Patient';
      arr.push({ id: 'patient', label: `Patient: ${patientName}` });
    }
    if (filters.dateFrom || filters.dateTo) {
      let dateLabel = 'Date';
      if (filters.dateFrom && filters.dateTo) {
         if (filters.dateFrom === filters.dateTo) dateLabel = `Date: ${filters.dateFrom}`;
         else dateLabel = `Date: ${filters.dateFrom} to ${filters.dateTo}`;
      } else if (filters.dateFrom) {
         dateLabel = `Date: From ${filters.dateFrom}`;
      } else {
         dateLabel = `Date: Until ${filters.dateTo}`;
      }
      arr.push({ id: 'date', label: dateLabel });
    }
    return arr;
  }, [filters, patientsData]);

  const activeFiltersCount = activeFilters.length;

  const removeFilter = useCallback((id) => {
    setFilters(prev => {
      const next = { ...prev };
      if (id === 'search') next.search = '';
      if (id === 'status') next.status = 'all';
      if (id === 'patient') next.patient = 'all';
      if (id === 'date') { next.dateFrom = ''; next.dateTo = ''; }
      return next;
    });
    setCurrentPage(1);
  }, []);

  const columns = useMemo(() => [
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
          row.status === 'Completed' ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' :
          'bg-rose-500/10 text-rose-500 border-rose-500/20'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      align: 'right',
      accessor: (row) => (
        <div className="flex items-center justify-end gap-2 pr-4" onClick={(e) => e.stopPropagation()}>
          {isOrg && row.status === 'Pending' && (
            <>
              <button onClick={(e) => handleApprove(e, row.id)} className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 rounded-xl text-emerald-500 transition-all"><Check size={16} /></button>
              <button onClick={(e) => handleReject(e, row.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-all"><X size={16} /></button>
            </>
          )}
          {isOrg && row.status === 'Approved' && (
            <button 
              onClick={() => router.push(`/treatments?appointmentId=${row.id}`)} 
              className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 rounded-xl text-indigo-500 transition-all flex items-center gap-1"
              title="Start Treatment"
            >
              <Activity size={16} />
            </button>
          )}
          <button onClick={() => router.push(`/appointments/edit/${row.id}`)} className="p-2 hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 transition-all"><Edit2 size={16} /></button>
          <button onClick={(e) => handleDeleteClick(e, row.id)} className="p-2 hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
        </div>
      )
    }
  ], [isOrg, router, handleApprove, handleReject, handleDeleteClick]);

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

        <div className="max-w-[1600px] mx-auto space-y-4">
          {/* Top Header & Filters Toggle */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-6">
              <div>
                <h1 className="text-xl font-black text-[var(--foreground)] tracking-tight leading-none mb-0.5">Appointments</h1>
                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-[0.2em] opacity-60">Control Panel</p>
              </div>

              {/* Stats Strip */}
              <div className="hidden lg:flex items-center gap-6 pl-6 border-l border-[var(--border)]">
                {[
                  { label: 'Pending', count: stats.totalPending, icon: Clock, color: 'amber', filter: 'Pending' },
                  { label: 'Approved', count: stats.totalApproved, icon: Check, color: 'emerald', filter: 'Approved' },
                  { label: 'Rejected', count: stats.totalRejected, icon: X, color: 'rose', filter: 'Rejected' },
                  { label: 'Today', count: stats.todayAppointments, icon: Calendar, color: 'indigo', filter: 'today' }
                ].map((s) => (
                  <div 
                    key={s.label}
                    onClick={() => {
                      setFilters(prev => ({ ...prev, status: s.filter }));
                      setCurrentPage(1);
                    }}
                    className={`flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 ${filters.status === s.filter ? 'opacity-100 scale-105' : 'opacity-50 hover:opacity-100'}`}
                  >
                    <div className={`w-7 h-7 rounded-lg bg-${s.color}-500/10 flex items-center justify-center text-${s.color}-500`}>
                      <s.icon size={14} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-[var(--foreground)] leading-none mb-0.5">{s.count}</p>
                      <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-wider">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-3">
              <ViewToggle mode={viewMode} setMode={setViewMode} />
              
              <button 
                onClick={() => {
                  setIsFilterDrawerOpen(true);
                }}
                className="relative h-[42px] px-4 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-xl border border-[var(--border)] text-[var(--foreground)] transition-all flex items-center gap-2"
              >
                <Filter size={16} className="text-indigo-500" />
                <span className="text-xs font-bold uppercase tracking-widest">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-[var(--surface)] shadow-sm">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <Button onClick={() => router.push('/appointments/add')} className="h-[42px] bg-indigo-600 hover:bg-indigo-700 text-white px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]">
                <Plus size={16} />
                <span className="hidden sm:inline">Book Appointment</span>
              </Button>
            </div>
          </div>

          {/* Active Filters Bar */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3 px-4 shadow-sm">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-2">Active Filters:</span>
              {activeFilters.map(filter => (
                <span key={filter.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-500/10 text-indigo-500 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                  {filter.label}
                  <X 
                    size={14} 
                    className="cursor-pointer hover:text-rose-500 transition-colors ml-1" 
                    onClick={() => removeFilter(filter.id)} 
                  />
                </span>
              ))}
              <button 
                onClick={() => {
                  setFilters({ search: '', status: 'all', patient: 'all', dateFrom: '', dateTo: '' });
                  setCurrentPage(1);
                }}
                className="text-[10px] font-bold text-rose-500 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg uppercase tracking-wider ml-auto transition-colors"
              >
                Clear All
              </button>
            </div>
          )}

          {viewMode === 'list' ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-sm">
              <DataTable columns={columns} data={currentItems} isLoading={loading} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {currentItems.map((appointment) => (
                <div key={appointment.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-4 hover:bg-[var(--surface-hover)] transition-all relative overflow-hidden group shadow-sm flex flex-col h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 flex items-center justify-center text-indigo-400 shrink-0">
                      <User size={20} />
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                      appointment.status === 'Pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                      appointment.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                      'bg-rose-500/10 text-rose-500 border-rose-500/20'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-[var(--foreground)] mb-0.5 truncate">{appointment.patient.name}</h3>
                  <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.15em] mb-4 truncate">{appointment.service.title}</p>
                  <div className="space-y-2 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] font-medium opacity-80">
                      <Calendar size={12} className="opacity-50" />
                      <span>{formatDate(appointment.appointmentDate)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[var(--text-muted)] text-[11px] font-medium opacity-80">
                      <Clock size={12} className="opacity-50" />
                      <span>{formatTime(appointment.appointmentDate)}</span>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-[var(--border)] flex items-center justify-end gap-2 mt-auto">
                    {isOrg && appointment.status === 'Pending' && (
                      <>
                        <button onClick={(e) => handleApprove(e, appointment.id)} className="flex-1 py-2 bg-emerald-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all hover:bg-emerald-600 shadow-md">Approve</button>
                        <button onClick={(e) => handleReject(e, appointment.id)} className="flex-1 py-2 bg-rose-500/10 text-rose-500 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all hover:bg-rose-500/20 border border-rose-500/20">Reject</button>
                      </>
                    )}
                    {isOrg && appointment.status === 'Approved' && (
                      <button 
                        onClick={() => router.push(`/treatments?appointmentId=${appointment.id}`)} 
                        className="flex-1 py-2 bg-indigo-500 text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all hover:bg-indigo-600 shadow-md flex items-center justify-center gap-2"
                      >
                        <Activity size={12} /> Start Treatment
                      </button>
                    )}
                    <button onClick={() => router.push(`/appointments/edit/${appointment.id}`)} className="p-2 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-lg text-[var(--text-muted)] hover:text-indigo-500 transition-all"><Edit2 size={14} /></button>
                    <button onClick={(e) => handleDeleteClick(e, appointment.id)} className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-lg text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          ) }

          <Pagination totalItems={totalCount} itemsPerPage={ITEMS_PER_PAGE} currentPage={currentPage} onPageChange={setCurrentPage} />
        </div>
      </main>

      {/* Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Filters"
        subtitle="Refine appointments"
        activeFilters={filters}
        onReset={() => {
          const clearedFilters = { search: '', status: 'all', patient: 'all', dateFrom: '', dateTo: '' };
          setFilters(clearedFilters);
          setCurrentPage(1);
          setIsFilterDrawerOpen(false);
        }}
        onApply={(newFilters) => {
          setFilters(newFilters);
          setCurrentPage(1);
          setIsFilterDrawerOpen(false);
        }}
        filtersConfig={[
          { type: 'select', key: 'status', label: 'Status', placeholder: 'All Status', options: APPOINTMENT_STATUS_OPTIONS },
          { 
            type: 'select', 
            key: 'patient', 
            label: 'Patient', 
            placeholder: 'All Patients', 
            options: patientsData?.getPatients?.patients?.map(p => ({ label: p.name, value: p.id })) || [], 
            hidden: !isOrg 
          },
          { type: 'dateRange', keyFrom: 'dateFrom', keyTo: 'dateTo', label: 'Date Range' }
        ]}
      />
    </div>
  );
}
