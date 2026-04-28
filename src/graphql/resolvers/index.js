import { authResolvers } from './auth';
import { doctorResolvers } from './doctor';
import { serviceResolvers } from './service';

export const resolvers = [authResolvers, doctorResolvers, serviceResolvers];
