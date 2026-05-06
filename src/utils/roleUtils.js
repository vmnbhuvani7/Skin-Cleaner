export const ROLES = {
  ORGANIZATION: 'Organization',
  PATIENT: 'Patient',
};

export const ROLE_ROUTES = {
  [ROLES.ORGANIZATION]: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/doctors', label: 'Doctors', icon: 'User' },
    { path: '/patients', label: 'Patients', icon: 'Users' },
    { path: '/services', label: 'Services', icon: 'MessageSquare' },
    { path: '/appointments', label: 'Appointments', icon: 'Calendar' },
    { path: '/treatments', label: 'Treatments', icon: 'Activity' },
    { path: '/reports', label: 'Reports', icon: 'BarChart' },
  ],
  [ROLES.PATIENT]: [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/appointments', label: 'Appointments', icon: 'Calendar' },
    { path: '/treatments', label: 'Treatments', icon: 'Activity' },
  ]
};

export const isOrganization = (role) => role === ROLES.ORGANIZATION;
export const isPatient = (role) => role === ROLES.PATIENT;

export const hasAccess = (userRole, path) => {
  if (!userRole) return false;
  // Let Organization access everything defined for them
  // Let Patient access everything defined for them
  const allowedRoutes = ROLE_ROUTES[userRole];
  if (!allowedRoutes) return false;
  
  return allowedRoutes.some(route => 
    path === route.path || path.startsWith(`${route.path}/`)
  );
};
