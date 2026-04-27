'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { Plus, Edit, Trash2, Phone, Award, DollarSign, UserCheck, UserMinus, Search } from 'lucide-react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { GET_DOCTORS } from '@/graphql/queries/doctor';
import { UPDATE_DOCTOR, DELETE_DOCTOR } from '@/graphql/mutations/doctor';

export default function DoctorsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [listData, setListData] = useState({
    doctors: [],
    hasMore: true
  });
  
  const { data, loading, refetch, fetchMore } = useQuery(GET_DOCTORS, {
    variables: { page: 1, limit: 10, search: debouncedSearch },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      if (data?.getDoctors) {
        setListData({
          doctors: data.getDoctors.doctors || [],
          hasMore: data.getDoctors.hasMore
        });
      }
    }
  });

  const [updateDoctor] = useMutation(UPDATE_DOCTOR);
  const [deleteDoctor] = useMutation(DELETE_DOCTOR);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const loadMore = async () => {
    if (!listData.hasMore || loading) return;
    
    const nextPage = page + 1;
    const { data: moreData } = await fetchMore({
      variables: { page: nextPage, limit: 10, search: debouncedSearch },
    });

    if (moreData?.getDoctors) {
      setListData(prev => ({
        doctors: [...prev.doctors, ...moreData.getDoctors.doctors],
        hasMore: moreData.getDoctors.hasMore
      }));
      setPage(nextPage);
    }
  };

  // Intersection Observer for infinite scroll
  const observer = React.useRef();
  const lastDoctorElementRef = React.useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && listData.hasMore) {
        loadMore();
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, listData.hasMore, page]);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);

  const toggleStatus = async (id, currentStatus) => {
    try {
      await updateDoctor({ 
        variables: { id, isActive: !currentStatus },
      });
      refetch();
      toast.success(`Doctor status updated successfully`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleDeleteClick = (id) => {
    setDoctorToDelete(id);
    setDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!doctorToDelete) return;
    try {
      await deleteDoctor({ 
        variables: { id: doctorToDelete },
      });
      refetch();
      toast.success('Doctor deleted successfully');
      setDeleteModalOpen(false);
      setDoctorToDelete(null);
    } catch (err) {
      toast.error('Failed to delete doctor');
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0c10]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-10">
        <ToastContainer theme="dark" />
        
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
              This action cannot be undone. This will permanently remove the doctor from your clinical staff directory.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-4 px-6 bg-white/5 hover:bg-white/10 text-white font-bold rounded-2xl transition-all border border-white/5"
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
                <h1 className="text-4xl font-bold text-white tracking-tight">Clinical Staff</h1>
                <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold uppercase tracking-[0.2em] px-3 py-1 rounded-full border border-indigo-500/20">
                  {data?.getDoctors?.totalCount || 0} Total Available
                </span>
              </div>
              <p className="text-gray-500 text-sm">Manage your specialized skin and hair medical team.</p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative group min-w-[300px]">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-indigo-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search by name or specialty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                />
              </div>
              <Button onClick={() => router.push('/doctors/add')} icon={Plus}>Add Doctor</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {listData.doctors.map((doctor, index) => (
              <div 
                key={doctor.id} 
                ref={index === listData.doctors.length - 1 ? lastDoctorElementRef : null}
                className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 hover:bg-white/[0.07] transition-all relative overflow-hidden group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                    <Award size={32} />
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => router.push(`/doctors/edit/${doctor.id}`)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all">
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDeleteClick(doctor.id)} className="p-2 bg-white/5 hover:bg-rose-500/10 rounded-xl text-gray-400 hover:text-rose-400 transition-all">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-1">{doctor.name}</h3>
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">{doctor.specialization} Specialist</p>

                <div className="space-y-4 mb-8">
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Phone size={16} className="text-gray-600" />
                    <span>{doctor.mobile}</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <Award size={16} className="text-gray-600" />
                    <span>{doctor.experience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <DollarSign size={16} className="text-gray-600" />
                    <span>Consultation: ₹{doctor.consultationFee}</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${doctor.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-600'}`}></div>
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${doctor.isActive ? 'text-emerald-500' : 'text-gray-500'}`}>
                      {doctor.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button 
                    onClick={() => toggleStatus(doctor.id, doctor.isActive)}
                    className={`text-[10px] font-bold uppercase tracking-widest py-1.5 px-3 rounded-lg border transition-all ${
                      doctor.isActive 
                        ? 'border-gray-800 text-gray-500 hover:text-rose-400 hover:border-rose-500/20' 
                        : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/5'
                    }`}
                  >
                    {doctor.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                </div>
              </div>
            ))}

            {loading && (
              <div className="col-span-full py-10 text-center">
                <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Fetching more experts...</p>
              </div>
            )}

            {!loading && listData.doctors.length === 0 && (
              <div className="col-span-full py-20 text-center bg-white/5 border border-white/10 border-dashed rounded-[2.5rem]">
                <p className="text-gray-500 font-medium">No doctors found matching your search.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
