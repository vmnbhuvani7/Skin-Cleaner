'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit, Trash2, Search, Scissors, Zap, Droplets, Smile, Heart, ArrowRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import DataTable from '@/components/ui/DataTable';
import ViewToggle from '@/components/ui/ViewToggle';
import Pagination from '@/components/ui/Pagination';
import Input from '@/components/ui/Input';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';

import { GET_SERVICES } from '@/graphql/queries/service';
import { UPDATE_SERVICE, DELETE_SERVICE } from '@/graphql/mutations/service';
import { ITEMS_PER_PAGE } from '@/constants/settings';

const iconMap = {
  Zap,
  Droplets,
  Scissors,
  Smile,
  Heart
};

export default function ServicesPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('both');
  const [viewMode, setViewMode] = useState('list');
  const [currentPage, setCurrentPage] = useState(1);

  const { data, loading, refetch } = useQuery(GET_SERVICES, {
    variables: { 
      page: currentPage, 
      limit: ITEMS_PER_PAGE,
      search: searchTerm,
      isActive: statusFilter === 'both' ? undefined : statusFilter === 'active'
    },
    fetchPolicy: 'cache-and-network'
  });

  const [updateService] = useMutation(UPDATE_SERVICE);
  const [deleteService] = useMutation(DELETE_SERVICE);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateService({ variables: { id, isActive: !currentStatus } });
      refetch();
      toast.success(`Service status updated successfully`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setServiceToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService({ variables: { id: serviceToDelete } });
      refetch();
      toast.success('Service deleted successfully');
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const services = data?.getServices?.services || [];
  const totalItems = data?.getServices?.totalCount || 0;

  const columns = [
    {
      header: 'Service',
      accessor: (row) => {
        const IconComponent = iconMap[row.icon] || Zap;
        return (
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 shrink-0">
              <IconComponent size={24} />
            </div>
            <div>
              <p className="font-bold text-[var(--foreground)] mb-0.5">{row.title}</p>
              <p className="text-[10px] text-[var(--text-muted)] line-clamp-1 max-w-[300px] font-medium opacity-60">{row.desc}</p>
            </div>
          </div>
        );
      }
    },
    {
      header: 'Icon Class',
      accessor: (row) => (
        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400/60 bg-indigo-500/5 px-2 py-1 rounded-lg border border-indigo-500/10">
          {row.icon}
        </span>
      )
    },
    {
      header: 'Visibility',
      accessor: (row) => (
        <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
          <div className={`w-2 h-2 rounded-full ${row.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'}`}></div>
          <button 
            onClick={() => toggleStatus(row.id, row.isActive)}
            className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border transition-all ${
              row.isActive 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20' 
                : 'bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/20'
            }`}
          >
            {row.isActive ? 'Active' : 'Hidden'}
          </button>
        </div>
      )
    },
    {
      header: 'Actions',
      align: 'center',
      accessor: (row) => (
        <div className="flex items-center justify-center gap-2" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => router.push(`/services/edit/${row.id}`)} className="p-2 hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-400 transition-all">
            <Edit size={16} />
          </button>
          <button onClick={() => handleDeleteClick(row.id)} className="p-2 hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all">
            <Trash2 size={16} />
          </button>
          <button 
            onClick={() => router.push(`/services/edit/${row.id}`)}
            className="p-2 hover:bg-emerald-500/10 rounded-xl text-emerald-500 transition-all"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} title="Confirm Deletion" className="max-w-md">
          <div className="text-center pt-2">
            <div className="w-20 h-20 bg-rose-500/10 rounded-[2rem] flex items-center justify-center text-rose-500 mx-auto mb-6">
              <Trash2 size={40} />
            </div>
            <h4 className="text-[var(--foreground)] text-lg font-black tracking-tight mb-2">Are you sure?</h4>
            <p className="text-[var(--text-muted)] text-sm mb-10 font-medium">This will permanently remove this service from the platform.</p>
            <div className="flex gap-4">
              <button onClick={() => setDeleteModalOpen(false)} className="flex-1 py-4 px-6 bg-[var(--surface-hover)] font-bold rounded-2xl border border-[var(--border)]">Cancel</button>
              <button onClick={confirmDelete} className="flex-1 py-4 px-6 bg-rose-500 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/20 uppercase tracking-widest text-xs">Delete</button>
            </div>
          </div>
        </Modal>
        
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight mb-2">Services</h1>
              <p className="text-[var(--text-muted)] text-sm font-medium opacity-80">Manage the clinical services and treatment offerings</p>
            </div>
            <Button onClick={() => router.push('/services/add')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-indigo-600/20 transition-all active:scale-95 font-black uppercase tracking-widest text-[10px]">
              <Plus size={18} />
              <span>Add Service</span>
            </Button>
          </div>

          {/* Controls Bar */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <Input
                placeholder="Search services..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-12 h-14 rounded-2xl border border-[var(--border)] focus:ring-indigo-500 bg-[var(--surface)] text-[var(--foreground)] shadow-sm"
              />
            </div>
            
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="flex bg-[var(--surface)] border border-[var(--border)] p-1.5 rounded-2xl shadow-sm">
                {['both', 'active', 'inactive'].map((f) => (
                  <button 
                    key={f}
                    onClick={() => { setStatusFilter(f); setCurrentPage(1); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${statusFilter === f ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
                  >
                    {f}
                  </button>
                ))}
              </div>
              <ViewToggle mode={viewMode} setMode={setViewMode} />
            </div>
          </div>

          {/* Content Area */}
          {viewMode === 'list' ? (
            <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden shadow-sm">
              <DataTable 
                columns={columns} 
                data={services} 
                onRowClick={(row) => router.push(`/services/edit/${row.id}`)}
                isLoading={loading}
              />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => {
                const IconComponent = iconMap[service.icon] || Zap;
                return (
                  <div key={service.id} className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:bg-[var(--surface-hover)] transition-all relative overflow-hidden group shadow-sm flex flex-col h-full">
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                        <IconComponent size={32} />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => router.push(`/services/edit/${service.id}`)} className="p-2 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 transition-all">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => handleDeleteClick(service.id)} className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-500 transition-all">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">{service.title}</h3>
                    <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 line-clamp-3 flex-1">{service.desc}</p>
                    <div className="mt-auto pt-6 border-t border-[var(--border)] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${service.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${service.isActive ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {service.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <button 
                        onClick={() => toggleStatus(service.id, service.isActive)}
                        className="text-[9px] font-black uppercase tracking-widest py-1.5 px-3 rounded-lg border border-indigo-500/10 text-indigo-400 hover:bg-indigo-500/10 transition-all"
                      >
                        {service.isActive ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          <Pagination 
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            currentPage={currentPage}
            onPageChange={setCurrentPage}
          />

          {services.length === 0 && !loading && (
            <div className="py-20 text-center space-y-4 bg-[var(--surface)] border border-dashed border-[var(--border)] rounded-[2.5rem]">
              <div className="bg-indigo-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto text-indigo-400">
                <Scissors size={40} />
              </div>
              <p className="text-[var(--text-muted)] text-lg font-medium">No services found matching your criteria.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
