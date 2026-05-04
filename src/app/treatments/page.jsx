'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Search, Filter, MoreVertical, Trash2, Edit2, Calendar, User, Activity, ArrowRight, CheckCircle, Clock, IndianRupee } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import DataTable from '@/components/ui/DataTable';
import ViewToggle from '@/components/ui/ViewToggle';
import Pagination from '@/components/ui/Pagination';
import TreatmentForm from '@/components/clinical/TreatmentForm';
import { toast } from 'react-toastify';
import { useTheme } from '@/context/ThemeContext';

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount || 0);
};

import { GET_TREATMENTS } from '@/graphql/queries/treatment';
import { DELETE_TREATMENT } from '@/graphql/mutations/treatment';
import { ITEMS_PER_PAGE } from '@/constants/settings';

import { Suspense } from 'react';

function TreatmentsContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);

  const { loading, error, data, refetch } = useQuery(GET_TREATMENTS);

  useEffect(() => {
    if (patientId) {
      setIsModalOpen(true);
    }
  }, [patientId]);

  const [deleteTreatment] = useMutation(DELETE_TREATMENT, {
    onCompleted: () => {
      toast.success('Treatment deleted successfully');
      refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [treatmentToDelete, setTreatmentToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setTreatmentToDelete(id);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (treatmentToDelete) {
      deleteTreatment({ variables: { id: treatmentToDelete } });
      setIsDeleteModalOpen(false);
      setTreatmentToDelete(null);
    }
  };

  const handleEdit = (treatment) => {
    setEditingTreatment(treatment);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingTreatment(null);
    setIsModalOpen(true);
  };

  const filteredTreatments = data?.getTreatments?.filter(t =>
    t.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.service.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Pagination Logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = filteredTreatments.slice(indexOfFirstItem, indexOfLastItem);

  const { theme } = useTheme();

  const columns = [
    {
      header: 'Patient',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 overflow-hidden shrink-0">
            {row.patient.image ? (
              <img src={row.patient.image} alt={row.patient.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
          </div>
          <div>
            <p className="font-bold text-[var(--foreground)] leading-none mb-1">{row.patient.name}</p>
            <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">ID: {row.patient.id?.slice(-6)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Service / Plan',
      accessor: (row) => (
        <div>
          <p className="font-bold text-[var(--foreground)] mb-0.5">{row.service.title}</p>
          <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] opacity-50">
            {row.type === 'ONE_TIME' ? 'One-time' : `${row.totalSessions} Sessions`}
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => {
        const statusColors = {
          'IN_PROGRESS': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
          'COMPLETED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
          'CANCELLED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
        };
        return (
          <span className={`inline-flex text-[9px] uppercase font-black tracking-[0.1em] px-3 py-1 rounded-full border ${statusColors[row.status]}`}>
            {row.status.replace('_', ' ')}
          </span>
        );
      }
    },
    {
      header: 'Progress',
      accessor: (row) => {
        const completedSessions = row.sessions?.filter(s => s.status === 'COMPLETED').length || 0;
        const progress = row.type === 'MULTI_SESSION'
          ? (completedSessions / row.totalSessions) * 100
          : (row.status === 'COMPLETED' ? 100 : 0);
        return (
          <div className="flex items-center gap-4 min-w-[120px]">
            <div className="flex-1 h-1.5 bg-[var(--surface-hover)] rounded-full overflow-hidden border border-[var(--border)]">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-[10px] font-black text-[var(--text-muted)] w-8">{Math.round(progress)}%</span>
          </div>
        );
      }
    },
    {
      header: 'Financials',
      align: 'right',
      accessor: (row) => {
        const totalPaid = row.sessions?.reduce((acc, s) => acc + (s.paidAmount || 0), 0) || 0;
        return (
          <div className="flex flex-col items-end">
            <p className="font-black text-[var(--foreground)]">₹{formatAmount(totalPaid)}</p>
            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter opacity-50">of ₹{formatAmount(row.finalAmount)}</p>
          </div>
        );
      }
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => handleEdit(row)} className="p-2 hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-400 transition-all">
            <Edit2 size={16} />
          </button>
          <button onClick={() => handleDeleteClick(row.id)} className="p-2 hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all">
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => window.location.href = `/treatments/${row.id}`}
            className="p-2 hover:bg-emerald-500/10 rounded-xl text-emerald-500 transition-all"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )
    }
  ];

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        {/* Modals */}
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Deletion" size="max-w-md">
          <div className="text-center pt-2">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h4 className="text-[var(--foreground)] text-lg font-black tracking-tight mb-2">Are you absolutely sure?</h4>
            <p className="text-[var(--text-muted)] text-sm mb-10 font-medium">This action cannot be undone.</p>
            <div className="flex gap-4">
              <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-4 px-6 bg-[var(--surface-hover)] font-bold rounded-2xl border border-[var(--border)]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 px-6 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 uppercase tracking-widest text-xs">Delete</button>
            </div>
          </div>
        </Modal>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTreatment ? 'Edit Treatment' : 'New Treatment'} size="4xl">
          <TreatmentForm treatment={editingTreatment} initialPatientId={patientId} onClose={() => setIsModalOpen(false)} onSuccess={() => { setIsModalOpen(false); refetch(); }} />
        </Modal>

        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-2">Treatments</h1>
              <p className="text-[var(--text-muted)] text-sm font-medium opacity-80">Manage patient treatments and multi-session plans</p>
            </div>
            <Button onClick={handleAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]">
              <Plus size={18} />
              <span>New Treatment</span>
            </Button>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard icon={<Activity size={24}/>} title="Total" value={data?.getTreatments?.length || 0} color="indigo" />
            <StatCard icon={<Clock size={24}/>} title="Active" value={data?.getTreatments?.filter(t => t.status === 'IN_PROGRESS').length || 0} color="blue" badge="In Progress" />
            <StatCard icon={<CheckCircle size={24}/>} title="Completed" value={data?.getTreatments?.filter(t => t.status === 'COMPLETED').length || 0} color="emerald" badge="Done" />
            <StatCard icon={<IndianRupee size={24}/>} title="Multi-Session" value={data?.getTreatments?.filter(t => t.type === 'MULTI_SESSION').length || 0} color="purple" />
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search by patient or service..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-12 h-14 rounded-2xl border border-[var(--border)] focus:ring-indigo-500 bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <ViewToggle mode={viewMode} setMode={setViewMode} />
              <Button variant="outline" className="h-14 px-6 rounded-2xl border-[var(--border)] bg-[var(--surface)] font-bold flex items-center gap-2">
                <Filter size={18} />
                <span className="hidden sm:inline">Filters</span>
              </Button>
            </div>
          </div>

          {/* Content Area */}
          {viewMode === 'list' ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
              <DataTable 
                columns={columns} 
                data={currentItems} 
                onRowClick={(row) => window.location.href = `/treatments/${row.id}`}
                isLoading={loading}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((treatment) => (
                <TreatmentCard key={treatment.id} treatment={treatment} onEdit={handleEdit} onDelete={handleDeleteClick} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <Pagination 
            totalItems={filteredTreatments.length}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {filteredTreatments.length === 0 && (
            <div className="py-20 text-center space-y-4 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[2.5rem]">
              <div className="bg-indigo-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-400">
                <Activity size={40} />
              </div>
              <p className="text-[var(--text-muted)] text-lg font-medium">No treatments found.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon, title, value, color, badge }) {
  const colorMap = {
    indigo: 'text-indigo-500 bg-indigo-500/10',
    blue: 'text-blue-500 bg-blue-500/10',
    emerald: 'text-emerald-500 bg-emerald-500/10',
    purple: 'text-purple-500 bg-purple-500/10',
  };
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 hover:border-indigo-500/20 transition-all shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[color]}`}>{icon}</div>
        {badge && <span className={`${colorMap[color]} text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-current opacity-70`}>{badge}</span>}
      </div>
      <p className="text-3xl font-black text-[var(--foreground)] tracking-tight">{value}</p>
      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{title}</p>
    </div>
  );
}

export default function TreatmentsPage() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <TreatmentsContent />
    </Suspense>
  );
}

function TreatmentCard({ treatment, onEdit, onDelete }) {
  const completedSessions = treatment.sessions?.filter(s => s.status === 'COMPLETED').length || 0;
  const progress = treatment.type === 'MULTI_SESSION'
    ? (completedSessions / treatment.totalSessions) * 100
    : (treatment.status === 'COMPLETED' ? 100 : 0);

  const statusColors = {
    'IN_PROGRESS': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    'COMPLETED': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    'CANCELLED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
  };

  return (
    <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all group overflow-hidden flex flex-col h-full">
      <div className="p-8 space-y-6 flex-1">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${statusColors[treatment.status]}`}>
              {treatment.status.replace('_', ' ')}
            </span>
            <div className="flex gap-2">
              <button onClick={() => onEdit(treatment)} className="p-2 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-400 transition-all">
                <Edit2 size={18} />
              </button>
              <button onClick={() => onDelete(treatment.id)} className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-[var(--foreground)] group-hover:text-indigo-400 transition-colors line-clamp-1">{treatment.service.title}</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner overflow-hidden">
              {treatment.patient.image ? (
                <img src={treatment.patient.image} alt={treatment.patient.name} className="w-full h-full object-cover" />
              ) : (
                <User size={20} />
              )}
            </div>
            <div>
              <p className="font-bold text-[var(--foreground)]">{treatment.patient.name}</p>
              <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">Patient</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <Activity size={14} className="text-indigo-400" />
              <span>{treatment.type === 'ONE_TIME' ? 'One-time' : 'Multi-session'}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
              <Calendar size={14} className="text-indigo-400" />
              <span>{new Date(treatment.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Progress section with fixed height for alignment */}
        <div>
          {treatment.type === 'MULTI_SESSION' ? (
            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <span>Progress</span>
                <span className="text-indigo-400">{completedSessions} / {treatment.totalSessions} Sessions</span>
              </div>
              <div className="w-full h-2.5 bg-[var(--background)] rounded-full overflow-hidden border border-[var(--border)]">
                <div
                  className="h-full bg-indigo-500 rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(99,102,241,0.4)]"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center">
              <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 italic">Single Session Record</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-[var(--surface-hover)]/50 p-6 border-t border-[var(--border)] flex items-center justify-between mt-auto">
        <div className="space-y-0.5">
          <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Financial Status</p>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl font-black text-emerald-500">₹{formatAmount(treatment.sessions?.reduce((acc, s) => acc + (s.paidAmount || 0), 0))}</p>
            <p className="text-sm font-bold text-[var(--text-muted)] opacity-40">/</p>
            <p className="text-lg font-bold text-[var(--foreground)] opacity-60">₹{formatAmount(treatment.finalAmount)}</p>
          </div>
        </div>
        <Button
          variant="secondary"
          className="rounded-xl px-6 h-11 flex items-center gap-2 group/btn font-bold text-sm"
          onClick={() => window.location.href = `/treatments/${treatment.id}`}
        >
          <span>Details</span>
          <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
