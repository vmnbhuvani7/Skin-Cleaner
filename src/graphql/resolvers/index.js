import { authResolvers } from './auth';
import { doctorResolvers } from './doctor';
import { serviceResolvers } from './service';
import { patientResolvers } from './patient';
import { appointmentResolvers } from './appointment';

export const resolvers = [authResolvers, doctorResolvers, serviceResolvers, patientResolvers, appointmentResolvers];
