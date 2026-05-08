'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Sidebar from '@/components/Sidebar';
import { ArrowLeft, Calendar, User, ClipboardList, CheckCircle2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Button from '@/components/ui/Button';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/Select';
import { DateTimePicker } from '@/components/ui/DateTimePicker';
import { useRouter, useParams } from 'next/navigation';
import { useMutation, useQuery } from '@apollo/client';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Loader from '@/components/ui/Loader';

import { UPDATE_APPOINTMENT } from '@/graphql/mutations/appointment';
import { GET_APPOINTMENT } from '@/graphql/queries/appointment';
import { GET_PATIENTS } from '@/graphql/queries/patient';
import { GET_SERVICES } from '@/graphql/queries/service';
import { GET_DOCTORS } from '@/graphql/queries/doctor';
import { isOrganization } from '@/utils/roleUtils';
import { APPOINTMENT_STATUS_OPTIONS } from '@/utils/constants';

function EditAppointmentContent() {
  const router = useRouter();
  const params = useParams();
  const appointmentId = params.id;

  const [userRole, setUserRole] = useState('');
  const [formData, setFormData] = useState({
    patient: '',
    service: '',
    doctor: null,
    appointmentDate: '',
    notes: '',
    status: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setUserRole(user.role?.name || '');
    }
  }, []);

  const isOrg = isOrganization(userRole);

  const { data: appointmentData, loading: appointmentLoading } = useQuery(GET_APPOINTMENT, {
    variables: { id: appointmentId },
    skip: !appointmentId,
    onCompleted: (data) => {
      const appt = data.getAppointment;
      setFormData({
        patient: appt.patient.id,
        service: appt.service.id,
        doctor: appt.doctor?.id || null,
        appointmentDate: appt.appointmentDate,
        notes: appt.notes || '',
        status: appt.status
      });
    }
  });

  const { data: patientsData } = useQuery(GET_PATIENTS, {
    variables: { page: 1, limit: 100, isActive: true },
    skip: !isOrg // Only fetch all patients if organization
  });
  const { data: servicesData } = useQuery(GET_SERVICES, {
    variables: { page: 1, limit: 100, isActive: true }
  });
  const { data: doctorsData } = useQuery(GET_DOCTORS, {
    variables: { page: 1, limit: 100, isActive: true }
  });

  const patients = patientsData?.getPatients?.patients || [];
  const services = servicesData?.getServices?.services || [];
  const doctors = doctorsData?.getDoctors?.doctors || [];

  const [updateAppointment, { loading: updating }] = useMutation(UPDATE_APPOINTMENT, {
    refetchQueries: ['GetAppointments', 'GetAppointmentStats', 'GetAppointment'],
    onCompleted: () => {
      toast.success('Appointment updated successfully!');
      setTimeout(() => router.push('/appointments'), 1500);
    },
    onError: (err) => {
      toast.error(err.message || 'Failed to update appointment');
    }
  });

  const validate = () => {
    const newErrors = {};
    if (!isOrg && !formData.patient) {
        // This shouldn't happen for patients as they edit their own, 
        // but for orgs it might.
    }
    if (!formData.service) newErrors.service = 'Please select a service';
    if (!formData.appointmentDate) newErrors.appointmentDate = 'Please select appointment date and time';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const variables = {
        id: appointmentId,
        ...formData
    };

    // Remove patient if it's a patient editing (resolver handles it, but cleaner to send less)
    if (!isOrg) {
        delete variables.patient;
        delete variables.status; // Patients can't change status
    }

    updateAppointment({ variables });
  };

  const { theme } = useTheme();

  if (appointmentLoading) return <Loader fullScreen />;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[var(--background)]">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-10 pt-24 lg:pt-10 relative">
        <ToastContainer theme={theme === 'system' ? 'dark' : theme} />
        
        <div className="max-w-3xl mx-auto pb-20">
          <button 
            onClick={() => router.back()}
            className="flex items-center gap-2 text-teal-400 hover:text-teal-300 transition-colors text-sm font-bold mb-8 group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
            Back to Appointments
          </button>

          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-teal-600/5 blur-[100px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                  <Calendar size={24} />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-[var(--foreground)] tracking-tight">Edit Appointment</h1>
                  <p className="text-[var(--text-muted)] text-xs">Update your clinical booking details.</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {isOrg && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Select Patient</label>
                    <Select 
                        value={formData.patient} 
                        onValueChange={(value) => {
                            setFormData({ ...formData, patient: value });
                            if (errors.patient) setErrors({ ...errors, patient: null });
                        }}
                    >
                        <SelectTrigger className="h-12">
                        <SelectValue placeholder="Choose a patient" />
                        </SelectTrigger>
                        <SelectContent>
                        {patients.map((patient) => (
                            <SelectItem key={patient.id} value={patient.id}>
                            {patient.name} ({patient.mobile})
                            </SelectItem>
                        ))}
                        </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Select Service</label>
                  <Select 
                    value={formData.service} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, service: value });
                      if (errors.service) setErrors({ ...errors, service: null });
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose a service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.service && <p className="text-[11px] text-rose-500 ml-1 mt-1">{errors.service}</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Select Doctor (Optional)</label>
                  <Select 
                    value={formData.doctor || ''} 
                    onValueChange={(value) => {
                      setFormData({ ...formData, doctor: value || null });
                    }}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Choose a doctor (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {doctors.map((doctor) => (
                        <SelectItem key={doctor.id} value={doctor.id}>
                          {doctor.name} - {doctor.specialization}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <DateTimePicker
                  label="Appointment Date & Time"
                  date={formData.appointmentDate}
                  setDate={(date) => {
                    setFormData({ ...formData, appointmentDate: date });
                    if (errors.appointmentDate) setErrors({ ...errors, appointmentDate: null });
                  }}
                  error={errors.appointmentDate}
                  placeholder="Select date and time"
                  className="h-12"
                />

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Notes (Optional)</label>
                  <div className="relative">
                    <ClipboardList size={16} className="absolute left-4 top-3 text-gray-500" />
                    <textarea 
                      placeholder="Add any additional notes or instructions..."
                      className="w-full bg-[var(--surface-hover)] border border-[var(--border)] rounded-xl py-2.5 pl-11 pr-4 text-[var(--foreground)] focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500/50 transition-all text-sm min-h-[80px] max-h-[150px]"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>

                {isOrg && (
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Status</label>
                    <Select 
                      value={formData.status} 
                      onValueChange={(value) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Change status" />
                      </SelectTrigger>
                      <SelectContent>
                        {APPOINTMENT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="pt-2">
                  <Button
                    type="submit"
                    className="w-full py-4"
                    isLoading={updating}
                    icon={CheckCircle2}
                  >
                    Update Appointment
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function EditAppointmentPage() {
  return (
    <Suspense fallback={<Loader fullScreen />}>
      <EditAppointmentContent />
    </Suspense>
  );
}
