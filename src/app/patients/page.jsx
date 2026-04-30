'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit, Trash2, Phone, User, Mail, Search, Calendar, ChevronRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useMutation, useLazyQuery } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';
import { Waypoint } from 'react-waypoint';

import { GET_PATIENTS } from '@/graphql/queries/patient';
import { UPDATE_PATIENT, DELETE_PATIENT } from '@/graphql/mutations/patient';

export default function PatientsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listData, setListData] = useState({
    patients: [],
    hasMore: true
  });
  const [statusFilter, setStatusFilter] = useState('both'); // 'active', 'inactive', 'both'
  
  const getIsActiveValue = (filter) => {
    if (filter === 'active') return true;
    if (filter === 'inactive') return false;
    return undefined;
  };

  const [getPatients, { data, loading }] = useLazyQuery(GET_PATIENTS, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    onCompleted: (res) => {
      if (res?.getPatients) {
        if (page === 1) {
          setListData({
            patients: res.getPatients.patients || [],
            hasMore: res.getPatients.currentPage < res.getPatients.totalPages
          });
        } else {
          setListData(prev => ({
            patients: [...prev.patients, ...res.getPatients.patients],
            hasMore: res.getPatients.currentPage < res.getPatients.totalPages
          }));
        }
      }
    }
  });

  useEffect(() => {
    getPatients({
      variables: { 
        page, 
        limit: 10, 
        search: debouncedSearch,
        isActive: getIsActiveValue(statusFilter)
      },
    });
  }, [page, debouncedSearch, statusFilter, getPatients]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
    setListData({
      patients: [],
      hasMore: true
    });
  }, [debouncedSearch, statusFilter]);

  const [updatePatient] = useMutation(UPDATE_PATIENT);
  const [deletePatient] = useMutation(DELETE_PATIENT);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMore = () => {
    const current = data?.getPatients?.currentPage || 1;
    const total = data?.getPatients?.totalPages || 1;
    if (current < total && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState(null);

  const toggleStatus = async (e, id, currentStatus) => {
    e.stopPropagation();
    try {
      await updatePatient({ 
        variables: { id, isActive: !currentStatus },
      });
      getPatients({
        variables: { 
          page: 1, 
          limit: 10, 
          search: debouncedSearch,
          isActive: getIsActiveValue(statusFilter)
        },
      });
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
      await deletePatient({ 
        variables: { id: patientToDelete },
      });
      setPage(1);
      getPatients({
        variables: { 
          page: 1, 
          limit: 10, 
          search: debouncedSearch,
          isActive: getIsActiveValue(statusFilter)
        },
      });
      toast.success('Patient deleted successfully');
      setDeleteModalOpen(false);
      setPatientToDelete(null);
    } catch (err) {
      toast.error('Failed to delete patient');
    }
  };

  const { theme } = useTheme();

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
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
            <h4 className="text-white text-lg font-bold mb-2">Are you absolutely sure?</h4>
            <p className="text-gray-500 text-sm mb-10">
              This action cannot be undone. This will permanently remove the patient record from your clinical database.
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
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight">Patients</h1>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-indigo-500/20">
                  {data?.getPatients?.totalCount || 0} Total Registered
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-sm">Manage and view your patient records and medical history.</p>
            </div>
            
            <div className="flex sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative group w-full max-w-[200px] sm:max-w-none sm:min-w-[300px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by name, email or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[var(--surface)] border border-[var(--border)] rounded-2xl py-3.5 pl-12 pr-4 text-sm text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-[var(--text-muted)]"
                />
              </div>
              
              <div className="flex bg-[var(--surface)] border border-[var(--border)] p-1 rounded-2xl">
                <button 
                  onClick={() => setStatusFilter('both')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === 'both' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
                >
                  All
                </button>
                <button 
                  onClick={() => setStatusFilter('active')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === 'active' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
                >
                  Active
                </button>
                <button 
                  onClick={() => setStatusFilter('inactive')}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === 'inactive' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
                >
                  Inactive
                </button>
              </div>

              <Button className="min-w-[155px]" onClick={() => router.push('/patients/add')} icon={Plus}>Add Patient</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {listData.patients.map((patient) => (
              <div 
                key={patient.id} 
                onClick={() => router.push(`/patients/${patient.id}`)}
                className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:bg-[var(--surface-hover)] transition-all relative overflow-hidden group shadow-sm cursor-pointer"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <User size={32} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/patients/edit/${patient.id}`);
                      }} 
                      className="p-2 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 transition-all"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(e, patient.id)} 
                      className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-400 transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{patient.name}</h3>
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">{patient.gender}, {patient.age} Years</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
                    <Phone size={16} className="text-[var(--text-muted)] opacity-50" />
                    <span>{patient.mobile}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[var(--text-muted)] text-sm">
                    <Mail size={16} className="text-[var(--text-muted)] opacity-50" />
                    <span className="truncate">{patient.email}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[var(--border)] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${patient.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${patient.isActive ? 'text-emerald-500' : 'text-gray-500'}`}>
                      {patient.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => toggleStatus(e, patient.id, patient.isActive)}
                      className={`text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg border transition-all ${
                        patient.isActive 
                          ? 'border-gray-800 text-gray-500 hover:text-rose-400 hover:border-rose-500/20' 
                          : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5'
                      }`}
                    >
                      {patient.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <ChevronRight size={16} className="text-[var(--text-muted)] opacity-30 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </div>
                </div>
              </div>
            ))}

            {listData.hasMore && !loading && listData.patients.length > 0 && (
              <div className="col-span-full h-10">
                <Waypoint onEnter={loadMore} />
              </div>
            )}

            {loading && (
              <div className="col-span-full py-10 text-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Loading patients...</p>
              </div>
            )}

            {!loading && listData.patients.length === 0 && (
              <div className="col-span-full py-20 text-center bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-[2.5rem]">
                <p className="text-[var(--text-muted)] font-medium">No patients found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
