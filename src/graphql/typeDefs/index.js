import { authTypeDefs } from './auth';
import { doctorTypeDefs } from './doctor';
import { serviceTypeDefs } from './service';
import { patientTypeDefs } from './patient';
import { treatmentSessionTypeDefs } from './treatmentSession';
import { treatmentPlanTypeDefs } from './treatmentPlan';

export const typeDefs = [authTypeDefs, doctorTypeDefs, serviceTypeDefs, patientTypeDefs, treatmentSessionTypeDefs, treatmentPlanTypeDefs];
