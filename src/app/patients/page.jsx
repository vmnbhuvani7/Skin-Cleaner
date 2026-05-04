'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit, Trash2, Phone, User, Mail, Search, ChevronRight, ArrowRight } from 'lucide-react';
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

import { GET_PATIENTS } from '@/graphql/queries/patient';
import { UPDATE_PATIENT, DELETE_PATIENT } from '@/graphql/mutations/patient';

export default function PatientsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('both');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const { data, loading, refetch } = useQuery(GET_PATIENTS, {
    variables: { 
      page: 1, 
      limit: 100, 
      search: '',
      isActive: statusFilter === 'both' ? undefined : statusFilter === 'active'
    },
    fetchPolicy: 'cache-and-network'
  });

  const [updatePatient] = useMutation(UPDATE_PATIENT);
  const [deletePatient] = useMutation(DELETE_PATIENT);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const toggleStatus = async (e, id, currentStatus) => {
    e.stopPropagation();
    try {
      await updatePatient({ variables: { id, isActive: !currentStatus } });
      refetch();
      toast.success(`Patient status updated successfully`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setPatientToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    try {
      await deletePatient({ variables: { id: patientToDelete } });
      refetch();
      toast.success('Patient deleted successfully');
      setDeleteModalOpen(false);
      setPatientToDelete(null);
    } catch (err) {
      toast.error('Failed to delete patient');
    }
  };

  const filteredPatients = data?.getPatients?.patients?.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.mobile.includes(searchTerm) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPatients.slice(indexOfFirstItem, indexOfLastItem);

  const columns = [
    {
      header: 'Patient',
      accessor: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 overflow-hidden shrink-0">
            {row.image ? (
              <img src={row.image} alt={row.name} className="w-full h-full object-cover" />
            ) : (
              <User size={18} />
            )}
          </div>
          <div>
            <p className="font-bold text-[var(--foreground)] leading-none mb-1">{row.name}</p>
            <p className="text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest">ID: {row.id?.slice(-6)}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Contact',
      accessor: (row) => (
        <div className="space-y-1">
          <p className="text-xs font-bold text-[var(--foreground)] flex items-center gap-2">
            <Phone size={12} className="text-indigo-400" /> {row.mobile}
          </p>
          <p className="text-[10px] font-medium text-[var(--text-muted)] flex items-center gap-2 opacity-60">
            <Mail size={12} /> {row.email}
          </p>
        </div>
      )
    },
    {
      header: 'Details',
      accessor: (row) => (
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--surface-hover)] px-2 py-1 rounded-lg border border-[var(--border)]">
            {row.gender}
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--surface-hover)] px-2 py-1 rounded-lg border border-[var(--border)] text-indigo-400">
            {row.age}Y
          </span>
        </div>
      )
    },
    {
      header: 'Status',
      accessor: (row) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className={`w-2 h-2 rounded-full ${row.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></div>
          <button 
            onClick={(e) => toggleStatus(e, row.id, row.isActive)}
            className={`text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full border transition-all ${
              row.isActive 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-500' 
                : 'bg-gray-500/10 text-gray-500 border-gray-500/20 hover:bg-emerald-500/10 hover:text-emerald-500'
            }`}
          >
            {row.isActive ? 'Active' : 'Inactive'}
          </button>
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => router.push(`/patients/edit/${row.id}`)} className="p-2 hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-400 transition-all">
            <Edit size={16} />
          </button>
          <button onClick={(e) => handleDeleteClick(e, row.id)} className="p-2 hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all">
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => router.push(`/patients/${row.id}`)}
            className="p-2 hover:bg-emerald-500/10 rounded-xl text-emerald-500 transition-all"
          >
            <ArrowRight size={16} />
          </button>
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
            <p className="text-[var(--text-muted)] text-sm mb-10 font-medium">This will permanently remove the patient record.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-4 px-6 bg-[var(--surface-hover)] font-bold rounded-2xl border border-[var(--border)]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 px-6 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 uppercase tracking-widest text-xs">Delete</button>
            </div>
          </div>
        </Modal>

        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-2">Patients</h1>
              <p className="text-[var(--text-muted)] text-sm font-medium opacity-80">Manage patient records and medical history</p>
            </div>
            <Button onClick={() => router.push('/patients/add')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]">
              <Plus size={18} />
              <span>Add Patient</span>
            </Button>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search name, phone, email..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-12 h-14 rounded-2xl border border-[var(--border)] focus:ring-indigo-500 bg-[var(--surface)] shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex bg-[var(--surface)] border border-[var(--border)] p-1.5 rounded-2xl shadow-sm">
                {['both', 'active', 'inactive'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => setStatusFilter(f)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <ViewToggle mode={viewMode} setMode={setViewMode} />
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
              <DataTable 
                columns={columns} 
                data={currentItems} 
                onRowClick={(row) => router.push(`/patients/${row.id}`)}
                isLoading={loading}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {currentItems.map((patient) => (
                <div key={patient.id} onClick={() => router.push(`/patients/${patient.id}`)} className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:bg-[var(--surface-hover)] transition-all relative overflow-hidden group shadow-sm cursor-pointer flex flex-col h-full">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 overflow-hidden">
                      {patient.image ? (
                        <img src={patient.image} alt={patient.name} className="w-full h-full object-cover" />
                      ) : (
                        <User size={32} />
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); router.push(`/patients/edit/${patient.id}`); }} className="p-2 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={(e) => handleDeleteClick(e, patient.id)} className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{patient.name}</h3>
                  <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-6">{patient.gender}, {patient.age}Y</p>
                  <div className="space-y-4 mb-8 flex-1">
                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
                      <Phone size={16} className="opacity-50" />
                      <span className="font-medium">{patient.mobile}</span>
                    </div>
                    <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
                      <Mail size={16} className="opacity-50" />
                      <span className="truncate font-medium">{patient.email}</span>
                    </div>
                  </div>
                  <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${patient.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${patient.isActive ? 'text-emerald-500' : 'text-gray-500'}`}>{patient.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <ChevronRight size={16} className="text-[var(--text-muted)] opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}

          <Pagination totalItems={filteredPatients.length} itemsPerPage={itemsPerPage} currentPage={currentPage} onPageChange={setCurrentPage} />

          {filteredPatients.length === 0 && !loading && (
            <div className="py-20 text-center space-y-4 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[2.5rem]">
              <div className="bg-indigo-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-400">
                <User size={40} />
              </div>
              <p className="text-[var(--text-muted)] text-lg font-medium">No patients found matching your search.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
