import User from '@/models/User';
import dbConnect from '@/lib/mongodb';
import { createToken } from '@/utils/auth';
import validate from 'deep-email-validator';

export const authResolvers = {
  Query: {
    me: async (_, __, { getMe }) => {
      return await getMe();
    },
  },
  Mutation: {
    login: async (_, { identifier, password }) => {
      await dbConnect();

      // Find user by email or mobile
      const user = await User.findOne({
        $or: [{ email: identifier }, { mobile: identifier }],
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isMatch = await user.matchPassword(password);
      if (!isMatch) {
        throw new Error('Invalid credentials');
      }

      return {
        token: createToken(user),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        },
      };
    },

    signup: async (_, { name, email, mobile, password }) => {
      await dbConnect();

      // 1. Email Validation using deep-email-validator
      const emailValidate = await validate({
        email,
        sender: email,
        validateRegex: true,
        validateMx: false,
        validateTypo: false,
        validateDisposable: true,
        validateSMTP: false,
      });
      if (!emailValidate.valid) {
        throw new Error(`Invalid email: ${res.reason || 'Please provide a real email address'}`);
      }

      // 2. Check if user already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        throw new Error('User already exists with this email');
      }

      // 3. Create User
      const user = await User.create({
        name,
        email,
        mobile,
        password,
      });

      if (user) {
        return {
          token: createToken(user),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
          },
        };
      } else {
        throw new Error('Invalid user data');
      }
    },
  },
};
