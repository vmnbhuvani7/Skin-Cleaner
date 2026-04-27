export const authResolvers = {
  Query: {
    me: () => ({ id: '1', name: 'Demo User', email: 'demo@example.com' }),
  },
  Mutation: {
    login: (_, { identifier, password }) => {
      // Mock implementation
      console.log('Login mutation called:', { identifier, password });
      return {
        token: 'mock-token',
        user: { id: '1', name: 'Demo User', email: identifier.includes('@') ? identifier : 'demo@example.com' }
      };
    },
    signup: (_, { name, email, mobile, password }) => {
      // Mock implementation
      console.log('Signup mutation called:', { name, email, mobile, password });
      return {
        token: 'mock-token',
        user: { id: '2', name, email, mobile }
      };
    },
  },
};
