'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { Plus, Search, Filter, MoreVertical, Trash2, Edit2, Calendar, User, Activity, ArrowRight, CheckCircle, Clock } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Modal from '@/components/ui/Modal';
import Loader from '@/components/ui/Loader';
import TreatmentForm from '@/components/clinical/TreatmentForm';
import { toast } from 'react-toastify';
import { useTheme } from '@/context/ThemeContext';

import { GET_TREATMENTS } from '@/graphql/queries/treatment';
import { DELETE_TREATMENT } from '@/graphql/mutations/treatment';

import { Suspense } from 'react';

function TreatmentsContent() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTreatment, setEditingTreatment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const { theme } = useTheme();

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="p-8 text-red-500">Error: {error.message}</div>;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-2">Treatments</h1>
              <p className="text-[var(--text-muted)] text-sm">Manage patient treatments and multi-session plans</p>
            </div>
            <Button 
              onClick={handleAdd}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl flex items-center gap-2 shadow-lg transition-all active:scale-95"
            >
              <Plus size={20} />
              <span>New Treatment</span>
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 cursor-pointer hover:border-indigo-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                  <Activity size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{data?.getTreatments?.length || 0}</p>
              <p className="text-[var(--text-muted)] text-sm">Total Treatments</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 cursor-pointer hover:border-blue-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                  <Clock size={24} />
                </div>
                <span className="bg-blue-500/10 text-blue-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-blue-500/20">
                  In Progress
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{data?.getTreatments?.filter(t => t.status === 'IN_PROGRESS').length || 0}</p>
              <p className="text-[var(--text-muted)] text-sm">Active Treatments</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 cursor-pointer hover:border-emerald-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                  <CheckCircle size={24} />
                </div>
                <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                  Completed
                </span>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{data?.getTreatments?.filter(t => t.status === 'COMPLETED').length || 0}</p>
              <p className="text-[var(--text-muted)] text-sm">Completed Plans</p>
            </div>
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] p-6 cursor-pointer hover:border-purple-500/20 transition-all">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                  <MoreVertical size={24} />
                </div>
              </div>
              <p className="text-3xl font-bold text-[var(--foreground)]">{data?.getTreatments?.filter(t => t.type === 'MULTI_SESSION').length || 0}</p>
              <p className="text-[var(--text-muted)] text-sm">Multi-Session Plans</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input 
                placeholder="Search by patient or service..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-2xl border border-[var(--border)] focus:ring-indigo-500 focus:border-indigo-500 bg-[var(--surface-hover)] text-[var(--foreground)]"
              />
            </div>
            <Button variant="outline" className="flex items-center gap-2 h-12 px-6 rounded-2xl border-[var(--border)] bg-[var(--surface)]">
              <Filter size={18} />
              <span>Filters</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredTreatments.map((treatment) => (
              <TreatmentCard 
                key={treatment.id} 
                treatment={treatment} 
                onEdit={handleEdit}
                onDelete={handleDeleteClick}
              />
            ))}
            {filteredTreatments.length === 0 && (
              <div className="col-span-full py-20 text-center space-y-4 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[2.5rem]">
                <div className="bg-indigo-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-400">
                  <Activity size={40} />
                </div>
                <p className="text-[var(--text-muted)] text-lg font-medium">No treatments found. Start by adding a new one!</p>
              </div>
            )}
          </div>

          {/* Delete Confirmation Modal */}
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
                This action cannot be undone. This will permanently remove the treatment and all its sessions.
              </p>
              <div className="flex gap-4">
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-4 px-6 bg-[var(--surface-hover)] hover:bg-indigo-500/10 text-[var(--foreground)] font-bold rounded-2xl transition-all border border-[var(--border)]"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmDelete}
                  className="flex-1 py-4 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 transition-all uppercase tracking-widest text-xs"
                >
                  Delete
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            title={editingTreatment ? 'Edit Treatment' : 'New Treatment'}
            size="4xl"
          >
            <TreatmentForm 
              treatment={editingTreatment} 
              initialPatientId={patientId}
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                setIsModalOpen(false);
                refetch();
              }}
            />
          </Modal>
        </div>
      </main>
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
    <div className="bg-[var(--surface)] rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all group overflow-hidden">
      <div className="p-8 space-y-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className={`text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full border ${statusColors[treatment.status]}`}>
              {treatment.status.replace('_', ' ')}
            </span>
            <h3 className="text-2xl font-bold text-[var(--foreground)] mt-2 group-hover:text-indigo-400 transition-colors">{treatment.service.title}</h3>
          </div>
          <div className="flex gap-2">
            <button onClick={() => onEdit(treatment)} className="p-2 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-400 transition-all">
              <Edit2 size={18} />
            </button>
            <button onClick={() => onDelete(treatment.id)} className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all">
              <Trash2 size={18} />
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-[var(--text-muted)] bg-[var(--background)] p-4 rounded-2xl border border-[var(--border)]">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shadow-inner">
              <User size={20} />
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

        {treatment.type === 'MULTI_SESSION' && (
          <div className="space-y-3 pt-2">
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
        )}
      </div>

      <div className="bg-[var(--surface-hover)]/50 p-6 border-t border-[var(--border)] flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[9px] text-[var(--text-muted)] uppercase font-bold tracking-widest">Amount Paid</p>
          <p className="text-2xl font-black text-[var(--foreground)]">₹{treatment.sessions?.reduce((acc, s) => acc + (s.paidAmount || 0), 0) || 0}</p>
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
