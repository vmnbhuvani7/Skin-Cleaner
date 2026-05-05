import { ApolloServer } from '@apollo/server';
import { startServerAndCreateNextHandler } from '@as-integrations/next';
import { typeDefs } from '@/graphql/typeDefs';
import { resolvers } from '@/graphql/resolvers';

import { verifyToken } from '@/utils/auth';
import mongoose from 'mongoose';

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
      if (decodedUser && decodedUser.id) {
        // Convert to ObjectId for project-level consistency in queries
        decodedUser.id = new mongoose.Types.ObjectId(decodedUser.id);
      }
    }

    const getMe = async () => {
      if (!decodedUser) return null;
      await dbConnect();
      return await User.findById(decodedUser.id)
        .populate('role')
        .populate('organization')
        .select('-password');
    };

    return { user: decodedUser, getMe };
  },
});

export async function GET(request) {
  try {
    return await handler(request);
  } catch (error) {
    console.error('GraphQL GET Error:', error.message);
    return new Response(JSON.stringify({ error: 'Bad Request' }), { status: 400 });
  }
}

export async function POST(request) {
  try {
    // Clone the request to prevent stream issues if Next.js already read it
    return await handler(request);
  } catch (error) {
    console.error('GraphQL POST Error:', error.message);
    return new Response(JSON.stringify({ error: 'Invalid Request Format', details: error.message }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
