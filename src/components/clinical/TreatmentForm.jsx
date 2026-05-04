'use client';

import React, { useEffect, useMemo } from 'react';
import { useForm, useWatch, Controller } from 'react-hook-form';
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
import { Activity, IndianRupee } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/Select';

import { CREATE_TREATMENT, UPDATE_TREATMENT } from '@/graphql/mutations/treatment';

const schema = z.object({
  patientId: z.string().min(1, 'Patient is required'),
  serviceId: z.string().min(1, 'Service is required'),
  doctorId: z.string().min(1, 'Doctor is required'),
  type: z.enum(['ONE_TIME', 'MULTI_SESSION']),
  totalAmount: z.number().min(1, 'Service amount is required'),
  discount: z.number().min(0, 'Discount must be positive').default(0),
  finalAmount: z.number().min(0),
  totalSessions: z.number().min(1, 'At least 1 session is required').default(1),
  intervalDays: z.number().min(0, 'Interval must be positive').default(0),
  paidAmount: z.number().min(0, 'Paid amount must be positive').default(0),
  onlinePayment: z.number().min(0).default(0),
  cashPayment: z.number().min(0).default(0),
  notes: z.string().optional(),
});

const formatAmount = (amount) => {
  return new Intl.NumberFormat('en-IN').format(amount || 0);
};

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
      serviceId: '',
      doctorId: '',
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
console.log("errors",errors)
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
      const inputData = {
        ...values,
        totalSessions: values.type === 'ONE_TIME' ? 1 : values.totalSessions,
        intervalDays: values.type === 'ONE_TIME' ? 0 : values.intervalDays,
      };

      if (treatment) {
        await updateTreatment({
          variables: {
            id: treatment.id,
            input: {
              doctorId: inputData.doctorId,
              totalAmount: inputData.totalAmount,
              discount: inputData.discount,
              finalAmount: inputData.finalAmount,
              totalSessions: inputData.totalSessions,
              intervalDays: inputData.intervalDays,
            }
          }
        });
        toast.success('Treatment updated successfully');
      } else {
        await createTreatment({
          variables: {
            input: inputData
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 flex flex-col h-full">
      <div className="flex-1 space-y-6">
        {/* Top Header Row: Type & Basic Info */}
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h4 className="text-xs font-black text-[var(--foreground)] uppercase tracking-widest">Plan Configuration</h4>
            <p className="text-[9px] text-[var(--text-muted)] font-bold uppercase tracking-widest">Define patient and session structure</p>
          </div>

          <div className="bg-[var(--surface)] p-1 rounded-xl border border-[var(--border)] flex shadow-inner">
            <button
              type="button"
              onClick={() => setValue('type', 'ONE_TIME')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${watchType === 'ONE_TIME' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              One-Time
            </button>
            <button
              type="button"
              onClick={() => setValue('type', 'MULTI_SESSION')}
              className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${watchType === 'MULTI_SESSION' ? 'bg-indigo-600 text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              Multi-Session
            </button>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <div className="space-y-1">
              <Controller
                name="patientId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!!treatment}>
                    <SelectTrigger className={`h-11 rounded-xl bg-[var(--surface-hover)] border-[var(--border)] font-bold text-xs ${errors.patientId ? 'border-rose-500 ring-rose-500/10' : ''}`}>
                      <SelectValue placeholder="Select Patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patientsData?.getPatients?.patients?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.patientId && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider ml-1">{errors.patientId.message}</p>}
            </div>
            <div className="space-y-1">
              <Controller
                name="serviceId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange} disabled={!!treatment}>
                    <SelectTrigger className={`h-11 rounded-xl bg-[var(--surface-hover)] border-[var(--border)] font-bold text-xs ${errors.serviceId ? 'border-rose-500 ring-rose-500/10' : ''}`}>
                      <SelectValue placeholder="Select Service" />
                    </SelectTrigger>
                    <SelectContent>
                      {servicesData?.getServices?.services?.map(s => <SelectItem key={s.id} value={s.id}>{s.title}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.serviceId && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider ml-1">{errors.serviceId.message}</p>}
            </div>
            <div className="space-y-1">
              <Controller
                name="doctorId"
                control={control}
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className={`h-11 rounded-xl bg-[var(--surface-hover)] border-[var(--border)] font-bold text-xs ${errors.doctorId ? 'border-rose-500 ring-rose-500/10' : ''}`}>
                      <SelectValue placeholder="Select Doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctorsData?.getDoctors?.doctors?.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.doctorId && <p className="text-[9px] text-rose-500 font-bold uppercase tracking-wider ml-1">{errors.doctorId.message}</p>}
            </div>
          </div>
        </div>

        {/* Financials & Sessions Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-[var(--surface-hover)]/30 rounded-2xl border border-[var(--border)]">
          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 ml-1">Service Amount</label>
            <Input
              type="number"
              {...register('totalAmount', { valueAsNumber: true })}
              icon={IndianRupee}
              error={errors.totalAmount?.message}
              className="h-11 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10 text-sm"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 ml-1">Discount</label>
            <Input
              type="number"
              {...register('discount', { valueAsNumber: true })}
              icon={IndianRupee}
              className="h-11 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10 text-sm"
            />
          </div>
          {watchType === 'MULTI_SESSION' && (
            <>
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 ml-1">Total Sessions</label>
                <Input
                  type="number"
                  {...register('totalSessions', { valueAsNumber: true })}
                  className="h-11 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold text-center text-sm"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-1.5 ml-1">Interval (Days)</label>
                <Input
                  type="number"
                  {...register('intervalDays', { valueAsNumber: true })}
                  className="h-11 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold text-center text-sm"
                />
              </div>
            </>
          )}
        </div>

        {/* Full Width Initial Payment Details */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Initial Payment Details</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[var(--surface-hover)]/50 p-4 rounded-2xl border border-[var(--border)]">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">Online Payment</label>
              <Input
                type="number"
                {...register('onlinePayment', { valueAsNumber: true })}
                icon={IndianRupee}
                className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10"
              />
            </div>
            <div className="bg-[var(--surface-hover)]/50 p-4 rounded-2xl border border-[var(--border)]">
              <label className="block text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-2 ml-1">Cash Payment</label>
              <Input
                type="number"
                {...register('cashPayment', { valueAsNumber: true })}
                icon={IndianRupee}
                className="h-12 rounded-xl bg-[var(--surface)] border-[var(--border)] font-bold pl-10"
              />
            </div>
            <div className="bg-rose-500/5 p-4 rounded-2xl border border-rose-500/10">
              <label className="block text-[10px] font-black text-rose-500 uppercase tracking-widest mb-2 ml-1">Session Discount</label>
              <Input
                type="number"
                {...register('sessionDiscount', { valueAsNumber: true })}
                icon={IndianRupee}
                className="h-12 rounded-xl bg-[var(--surface)] border-rose-500/20 text-rose-500 font-bold pl-10 placeholder:text-rose-200"
              />
            </div>
          </div>
        </div>
        {/* Highlight Summary Bar */}
        <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 flex items-center justify-between overflow-hidden relative group">
          <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Activity size={100} />
          </div>

          <div className="flex items-center gap-8 md:gap-16 relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Total Payable</span>
              <span className="text-2xl md:text-3xl font-black">₹{formatAmount(watch('finalAmount'))}</span>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Paid Today</span>
              <span className="text-2xl md:text-3xl font-black text-emerald-300">₹{formatAmount(watch('paidAmount'))}</span>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-70 mb-1">Remaining</span>
              <span className="text-2xl md:text-3xl font-black text-rose-300">₹{formatAmount(Math.max(0, watch('finalAmount') - watch('paidAmount') - (watch('sessionDiscount') || 0)))}</span>
            </div>
          </div>
        </div>
      </div>


      {/* Sticky Action Footer */}
      <div className="sticky bottom-0 bg-[var(--surface)] pt-6 border-t border-[var(--border)] flex justify-end gap-3 z-10 pb-2 mt-4">
        <Button variant="ghost" onClick={onClose} type="button" className="px-6 h-11 rounded-xl font-bold text-xs uppercase tracking-wider">Cancel</Button>
        <Button
          type="submit"
          disabled={creating || updating}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-10 h-11 rounded-xl font-black shadow-xl shadow-indigo-600/20 tracking-widest uppercase text-[10px] min-w-fit"
        >
          {creating || updating ? 'Processing...' : (treatment ? 'Update Plan' : 'Create Treatment')}
        </Button>
      </div>
    </form>
  );
}
