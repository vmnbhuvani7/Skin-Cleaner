import { authTypeDefs } from './auth';
import { doctorTypeDefs } from './doctor';
import { serviceTypeDefs } from './service';
import { patientTypeDefs } from './patient';
import { appointmentTypeDefs } from './appointment';
import { treatmentTypeDefs } from './treatment';

export const typeDefs = [authTypeDefs, doctorTypeDefs, serviceTypeDefs, patientTypeDefs, appointmentTypeDefs, treatmentTypeDefs];
