'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation } from '@apollo/client';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { GET_PATIENTS } from '@/graphql/queries/patient';
import { GET_SERVICES } from '@/graphql/queries/service';
import { GET_DOCTORS } from '@/graphql/queries/doctor';
import { toast } from 'react-toastify';
import Loader from '@/components/ui/Loader';
import { Activity } from 'lucide-react';

import { CREATE_TREATMENT, UPDATE_TREATMENT } from '@/graphql/mutations/treatment';

const schema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  serviceId: z.string().min(1, 'Service is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  type: z.enum(['ONE_TIME', 'MULTI_SESSION']),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  discount: z.number().min(0, 'Discount must be positive').default(0),
  finalAmount: z.number().min(0),
  totalSessions: z.number().min(1, 'At least 1 session is required').default(1),
  intervalDays: z.number().min(0, 'Interval must be positive').default(0),
  paidAmount: z.number().min(0, 'Paid amount must be positive').default(0),
  sessionDiscount: z.number().min(0).default(0),
  onlinePayment: z.number().min(0).default(0),
  cashPayment: z.number().min(0).default(0),
  notes: z.string().optional(),
});

export default function TreatmentForm({ treatment, initialPatientId, onClose, onSuccess }) {
  const { data: patientsData, loading: patientsLoading } = useQuery(GET_PATIENTS, { variables: { limit: 100 } });
  const { data: servicesData, loading: servicesLoading } = useQuery(GET_SERVICES, { variables: { limit: 100 } });
  const { data: doctorsData, loading: doctorsLoading } = useQuery(GET_DOCTORS, { variables: { limit: 100 } });

  const [createTreatment, { loading: creating }] = useMutation(CREATE_TREATMENT);
  const [updateTreatment, { loading: updating }] = useMutation(UPDATE_TREATMENT);

  const { register, handleSubmit, watch, setValue, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: treatment ? {
      patientId: treatment.patient.id,
      serviceId: treatment.service.id,
      doctorId: treatment.doctor.id,
      type: treatment.type,
      totalAmount: treatment.totalAmount,
      discount: treatment.discount,
      finalAmount: treatment.finalAmount,
      totalSessions: treatment.totalSessions,
      intervalDays: treatment.intervalDays,
      paidAmount: treatment.sessions?.[0]?.paidAmount || 0,
      onlinePayment: treatment.sessions?.[0]?.onlinePayment || 0,
      cashPayment: treatment.sessions?.[0]?.cashPayment || 0,
    } : {
      patientId: initialPatientId || '',
      type: 'ONE_TIME',
      totalAmount: 0,
      discount: 0,
      finalAmount: 0,
      totalSessions: 1,
      intervalDays: 0,
      paidAmount: 0,
      onlinePayment: 0,
      cashPayment: 0,
    }
  });

  const watchType = watch('type');
  const watchTotalAmount = watch('totalAmount');
  const watchDiscount = watch('discount');
  const watchOnlinePayment = watch('onlinePayment');
  const watchCashPayment = watch('cashPayment');

  // Calculate final amount whenever total or discount changes
  useEffect(() => {
    const final = Math.max(0, (watchTotalAmount || 0) - (watchDiscount || 0));
    setValue('finalAmount', final);
  }, [watchTotalAmount, watchDiscount, setValue]);

  // Calculate total paid whenever online or cash changes
  useEffect(() => {
    const totalPaid = (watchOnlinePayment || 0) + (watchCashPayment || 0);
    setValue('paidAmount', totalPaid);
  }, [watchOnlinePayment, watchCashPayment, setValue]);

  const onSubmit = async (values) => {
    try {
      if (treatment) {
        await updateTreatment({
          variables: {
            id: treatment.id,
            input: {
              doctorId: values.doctorId,
              totalAmount: values.totalAmount,
              discount: values.discount,
              finalAmount: values.finalAmount,
              totalSessions: values.totalSessions,
              intervalDays: values.intervalDays,
            }
          }
        });
        toast.success('Treatment updated successfully');
      } else {
        await createTreatment({
          variables: {
            input: values
          }
        });
        toast.success('Treatment created successfully');
      }
      onSuccess();
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (patientsLoading || servicesLoading || doctorsLoading) return <Loader />;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Basic Info */}
        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Patient</label>
            <select 
              {...register('patientId')}
              disabled={!!treatment}
              className={`w-full h-12 px-4 rounded-2xl border ${errors.patientId ? 'border-rose-500' : 'border-[var(--border)]'} bg-[var(--surface-hover)] text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-sm`}
            >
              <option value="">Select Patient</option>
              {patientsData?.getPatients?.patients?.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            {errors.patientId && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.patientId.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Service</label>
            <select 
              {...register('serviceId')}
              disabled={!!treatment}
              className={`w-full h-12 px-4 rounded-2xl border ${errors.serviceId ? 'border-rose-500' : 'border-[var(--border)]'} bg-[var(--surface-hover)] text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-sm`}
            >
              <option value="">Select Service</option>
              {servicesData?.getServices?.services?.map(s => (
                <option key={s.id} value={s.id}>{s.title}</option>
              ))}
            </select>
            {errors.serviceId && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.serviceId.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Doctor</label>
            <select 
              {...register('doctorId')}
              className={`w-full h-12 px-4 rounded-2xl border ${errors.doctorId ? 'border-rose-500' : 'border-[var(--border)]'} bg-[var(--surface-hover)] text-[var(--foreground)] focus:ring-2 focus:ring-indigo-500 transition-all outline-none font-bold text-sm`}
            >
              <option value="">Select Doctor</option>
              {doctorsData?.getDoctors?.doctors?.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            {errors.doctorId && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.doctorId.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Treatment Type</label>
            <div className="flex gap-4">
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${watchType === 'ONE_TIME' ? 'border-indigo-500 bg-indigo-500/10 text-white font-black' : 'border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:border-indigo-500/30'}`}>
                <input type="radio" value="ONE_TIME" {...register('type')} className="hidden" />
                <span>One-Time</span>
              </label>
              <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all ${watchType === 'MULTI_SESSION' ? 'border-indigo-500 bg-indigo-500/10 text-white font-black' : 'border-[var(--border)] bg-[var(--surface-hover)] text-[var(--text-muted)] hover:border-indigo-500/30'}`}>
                <input type="radio" value="MULTI_SESSION" {...register('type')} className="hidden" />
                <span>Multi-Session</span>
              </label>
            </div>
          </div>
        </div>

        {/* Financial Info */}
        <div className="space-y-6 bg-[var(--surface-hover)]/30 p-8 rounded-[2.5rem] border border-[var(--border)] shadow-inner">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Service Amount</label>
              <Input 
                type="number" 
                {...register('totalAmount', { valueAsNumber: true })}
                className="h-12 rounded-2xl bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] font-bold"
              />
            </div>
            <div>
              <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Discount</label>
              <Input 
                type="number" 
                {...register('discount', { valueAsNumber: true })}
                className="h-12 rounded-2xl bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] font-bold"
              />
            </div>
          </div>

          <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                <Activity size={100} />
            </div>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-2">Total Payable Amount</p>
            <p className="text-4xl font-black">₹{watch('finalAmount')}</p>
          </div>

          {watchType === 'MULTI_SESSION' && (
            <div className="grid grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <div>
                <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Total Sessions</label>
                <Input 
                  type="number" 
                  {...register('totalSessions', { valueAsNumber: true })}
                  className="h-12 rounded-2xl bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] font-bold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2">Interval (Days)</label>
                <Input 
                  type="number" 
                  {...register('intervalDays', { valueAsNumber: true })}
                  className="h-12 rounded-2xl bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] font-bold"
                />
              </div>
            </div>
          )}

          <div className="pt-6 border-t border-[var(--border)] space-y-4">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                Initial Payment Details
            </p>
            <div className="grid grid-cols-3 gap-6">
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Online</label>
                <Input 
                  type="number" 
                  {...register('onlinePayment', { valueAsNumber: true })}
                  className="h-11 rounded-xl bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5">Cash</label>
                <Input 
                  type="number" 
                  {...register('cashPayment', { valueAsNumber: true })}
                  className="h-11 rounded-xl bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] font-bold"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-rose-400 uppercase tracking-widest mb-1.5">Session Disc.</label>
                <Input 
                  type="number" 
                  {...register('sessionDiscount', { valueAsNumber: true })}
                  className="h-11 rounded-xl bg-[var(--surface)] border-rose-500/20 text-rose-500 font-bold placeholder:text-rose-200"
                />
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
                <div className="flex justify-between items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <span>Total Paid Today:</span>
                <span className="text-emerald-500 text-lg font-black">₹{watch('paidAmount')}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest">
                <span>Balance Remaining:</span>
                <span className="text-rose-500 text-lg font-black">₹{Math.max(0, watch('finalAmount') - watch('paidAmount') - (watch('sessionDiscount') || 0))}</span>
                </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-8">
        <Button variant="ghost" onClick={onClose} type="button" className="px-8 h-12 rounded-2xl font-bold">Cancel</Button>
        <Button 
          type="submit" 
          disabled={creating || updating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-12 h-12 rounded-2xl font-black shadow-xl shadow-indigo-600/20 tracking-wide uppercase text-xs"
        >
          {creating || updating ? 'Processing...' : (treatment ? 'Update Treatment' : 'Confirm Treatment')}
        </Button>
      </div>
    </form>
  );
}
