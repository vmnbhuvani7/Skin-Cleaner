'use client';

import React, { useState } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Save, Scissors, Zap, Droplets, Smile, Heart } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';
import { useMutation } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTheme } from '@/context/ThemeContext';
import { CREATE_SERVICE } from '@/graphql/mutations/service';
import { GET_SERVICES } from '@/graphql/queries/service';

const icons = [
  { name: 'Zap', Icon: Zap },
  { name: 'Droplets', Icon: Droplets },
  { name: 'Scissors', Icon: Scissors },
  { name: 'Smile', Icon: Smile },
  { name: 'Heart', Icon: Heart },
];

export default function AddServicePage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [formData, setFormData] = useState({
    title: '',
    desc: '',
    icon: 'Zap',
    image: '',
  });

  const [createService, { loading }] = useMutation(CREATE_SERVICE, {
    refetchQueries: ["GetServices"]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createService({
        variables: formData,
      });
      toast.success('Service created successfully!');
      setTimeout(() => router.push('/services'), 1500);
    } catch (err) {
      toast.error(err.message || 'Failed to create service');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        <div className="max-w-3xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-400 hover:text-indigo-300 transition-colors mb-8 group"
          >
            <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
            <span className="font-bold">Back to Services</span>
          </button>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-8 md:p-12 shadow-xl">
            <h1 className="text-3xl font-bold text-[var(--foreground)] mb-2">Add New Service</h1>
            <p className="text-[var(--text-muted)] mb-10">Define a new treatment or service for your clinic.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--foreground)] ml-1">Service Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Laser Hair Removal"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--foreground)] ml-1">Description</label>
                <textarea 
                  required
                  rows="4"
                  placeholder="Describe the service in detail..."
                  value={formData.desc}
                  onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all resize-none"
                ></textarea>
              </div>

              <div className="space-y-4">
                <label className="text-sm font-bold text-[var(--foreground)] ml-1">Select Icon</label>
                <div className="grid grid-cols-5 gap-4">
                  {icons.map(({ name, Icon }) => (
                    <button
                      key={name}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon: name })}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl border transition-all ${
                        formData.icon === name 
                          ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' 
                          : 'bg-[var(--background)] border-[var(--border)] text-[var(--text-muted)] hover:border-indigo-500/50'
                      }`}
                    >
                      <Icon size={24} />
                      <span className="text-[10px] mt-2 font-bold uppercase">{name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-[var(--foreground)] ml-1">Image URL (Optional)</label>
                <input 
                  type="text" 
                  placeholder="https://example.com/image.png"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl py-4 px-6 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all"
                />
              </div>

              <div className="pt-6">
                <Button 
                  type="submit" 
                  className="w-full py-5 text-lg" 
                  loading={loading}
                  icon={Save}
                >
                  Create Service
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
