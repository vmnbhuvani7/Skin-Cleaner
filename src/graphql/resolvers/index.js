import { authResolvers } from './auth';
import { doctorResolvers } from './doctor';
import { serviceResolvers } from './service';
import { patientResolvers } from './patient';

export const resolvers = [authResolvers, doctorResolvers, serviceResolvers, patientResolvers];
