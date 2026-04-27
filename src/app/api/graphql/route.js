import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/graphql/typeDefs';
import { resolvers } from '@/graphql/resolvers';

import { verifyToken } from '@/utils/auth';

import User from '@/models/User';
import dbConnect from '@/lib/mongodb';

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

const handler = startServerAndCreateNextHandler(server, {
  context: async (req, res) => {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace('Bearer ', '');
    let decodedUser = null;

    if (token) {
      decodedUser = verifyToken(token);
    }

    const getMe = async () => {
      if (!decodedUser) return null;
      await dbConnect();
      return await User.findById(decodedUser.id).select('-password');
    };

    return { user: decodedUser, getMe };
  },
});

export { handler as GET, handler as POST };
