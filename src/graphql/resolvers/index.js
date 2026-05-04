import { authResolvers } from './auth';
import { doctorResolvers } from './doctor';
import { serviceResolvers } from './service';
import { patientResolvers } from './patient';
import { appointmentResolvers } from './appointment';
import { treatmentResolvers } from './treatment';

export const resolvers = [authResolvers, doctorResolvers, serviceResolvers, patientResolvers, appointmentResolvers, treatmentResolvers];
