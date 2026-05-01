'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit, Trash2, Search, Scissors, Zap, Droplets, Smile, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useLazyQuery } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';
import { Waypoint } from 'react-waypoint';

import { GET_SERVICES } from '@/graphql/queries/service';
import { UPDATE_SERVICE, DELETE_SERVICE } from '@/graphql/mutations/service';

const iconMap = {
  Zap,
  Droplets,
  Scissors,
  Smile,
  Heart
};

export default function ServicesPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listData, setListData] = useState({
    services: [],
    hasMore: true
  });
  const { theme } = useTheme();

  const [statusFilter, setStatusFilter] = useState('both'); // 'active', 'inactive', 'both'

  const getIsActiveValue = (filter) => {
    if (filter === 'active') return true;
    if (filter === 'inactive') return false;
    return undefined;
  };

  const [getServices, { data, loading }] = useLazyQuery(GET_SERVICES, {
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
    onCompleted: (res) => {
      if (res?.getServices) {
        if (page === 1) {
          setListData({
            services: res.getServices.services || [],
            hasMore: res.getServices.currentPage < res.getServices.totalPages
          });
        } else {
          setListData(prev => ({
            services: [...prev.services, ...res.getServices.services],
            hasMore: res.getServices.currentPage < res.getServices.totalPages
          }));
        }
      }
    }
  });

  useEffect(() => {
    getServices({
      variables: { 
        page, 
        limit: 6, 
        search: debouncedSearch,
        isActive: getIsActiveValue(statusFilter)
      },
    });
  }, [page, debouncedSearch, statusFilter, getServices]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setPage(1);
    setListData({
      services: [],
      hasMore: true
    });
  }, [debouncedSearch, statusFilter]);

  const [updateService] = useMutation(UPDATE_SERVICE);
  const [deleteService] = useMutation(DELETE_SERVICE);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateService({ 
        variables: { id, isActive: !currentStatus },
      });
      getServices({
        variables: { 
          page: 1, 
          limit: 6, 
          search: debouncedSearch,
          isActive: getIsActiveValue(statusFilter)
        },
      });
      toast.success(`Service status updated successfully`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);

  const handleDeleteClick = (id) => {
    setServiceToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService({ 
        variables: { id: serviceToDelete },
      });
      getServices({
        variables: { 
          page: 1, 
          limit: 6, 
          search: debouncedSearch,
          isActive: getIsActiveValue(statusFilter)
        },
      });
      toast.success('Service deleted successfully');
      setDeleteModalOpen(false);
      setServiceToDelete(null);
    } catch (err) {
      toast.error('Failed to delete service');
    }
  };

  const loadMore = () => {
    const current = data?.getServices?.currentPage || 1;
    const total = data?.getServices?.totalPages || 1;
    if (current < total && !loading) {
      setPage(prev => prev + 1);
    }
  };

  const services = listData.services;

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
            <h4 className="text-white text-lg font-bold mb-2">Are you sure?</h4>
            <p className="text-gray-500 text-sm mb-10">
              This will permanently remove this service from the landing page.
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
                <h1 className="text-4xl font-bold text-[var(--foreground)] tracking-tight">Services</h1>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-indigo-500/20">
                  {data?.getServices?.totalCount || 0} Total
                </span>
              </div>
              <p className="text-[var(--text-muted)] text-sm">Manage the services displayed on your landing page.</p>
            </div>
            
            <div className="flex sm:flex-row items-center gap-4 w-full sm:w-auto">
              <div className="relative group w-full max-w-[200px] sm:max-w-none sm:min-w-[300px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search services..."
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

              <Button className="whitespace-nowrap min-w-fit" onClick={() => router.push('/services/add')} icon={Plus}>Add Service</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {services.map((service, index) => {
              const IconComponent = iconMap[service.icon] || Zap;
              return (
                <div 
                  key={service.id} 
                  className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 hover:bg-[var(--surface-hover)] transition-all relative overflow-hidden group shadow-sm"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <IconComponent size={32} />
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => router.push(`/services/edit/${service.id}`)} className="p-2 bg-[var(--surface-hover)] hover:bg-indigo-500/10 rounded-xl text-[var(--text-muted)] hover:text-indigo-500 transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDeleteClick(service.id)} className="p-2 bg-[var(--surface-hover)] hover:bg-rose-500/10 rounded-xl text-[var(--text-muted)] hover:text-rose-400 transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-[var(--foreground)] mb-3">{service.title}</h3>
                  <p className="text-[var(--text-muted)] text-sm leading-relaxed mb-6 line-clamp-3">
                    {service.desc}
                  </p>
                  

                  <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${service.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></div>
                      <span className={`text-[10px] font-bold uppercase tracking-widest ${service.isActive ? 'text-emerald-500' : 'text-gray-500'}`}>
                        {service.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <button 
                      onClick={() => toggleStatus(service.id, service.isActive)}
                      className={`text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg border transition-all ${
                        service.isActive 
                          ? 'border-gray-800 text-gray-500 hover:text-rose-400 hover:border-rose-500/20' 
                          : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5'
                      }`}
                    >
                      {service.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </div>
              );
            })}

            {listData.hasMore && !loading && services.length > 0 && (
              <div className="col-span-full h-10">
                <Waypoint onEnter={loadMore} />
              </div>
            )}

            {loading && (
              <div className="col-span-full py-10 text-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Loading more services...</p>
              </div>
            )}

            {!loading && services.length === 0 && (
              <div className="col-span-full py-20 text-center bg-[var(--surface)] border border-[var(--border)] border-dashed rounded-[2.5rem]">
                <p className="text-[var(--text-muted)] font-medium">No services found.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
