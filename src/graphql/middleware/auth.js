export const isAuthenticated = (next) => async (parent, args, context, info) => {
  if (!context.user) {
    throw new Error('Unauthorized access');
  }
  return next(parent, args, context, info);
};

export const isOrganization = (next) => async (parent, args, context, info) => {
  if (!context.user) {
    throw new Error('Unauthorized access');
  }
  if (context.user.role === 'Patient') {
    throw new Error('Unauthorized access: Organizations only');
  }
  return next(parent, args, context, info);
};

export const isPatient = (next) => async (parent, args, context, info) => {
  if (!context.user) {
    throw new Error('Unauthorized access');
  }
  if (context.user.role !== 'Patient') {
    throw new Error('Unauthorized access: Patients only');
  }
  return next(parent, args, context, info);
};

export const isSelfOrOrganization = (next) => async (parent, args, context, info) => {
  if (!context.user) {
    throw new Error('Unauthorized access');
  }
  
  // Need to get the target ID depending on the operation
  // For queries/mutations it's usually args.id or args.patientId or args.input.patientId
  const targetId = args.id || args.patientId || (args.input && (args.input.patientId || args.input.patient));
  
  if (context.user.role === 'Patient' && context.user.id !== targetId) {
    throw new Error('Unauthorized access: You can only access your own data');
  }
  
  return next(parent, args, context, info);
};
