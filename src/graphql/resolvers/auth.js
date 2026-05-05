import User from '@/models/User';
import Role from '@/models/Role';
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

      // Find user by email or mobile and populate role
      const user = await User.findOne({
        $or: [{ email: identifier }, { mobile: identifier }],
      }).populate('role');

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
          role: user.role ? {
            id: user.role._id,
            name: user.role.name,
          } : null,
        },
      };
    },

    signup: async (_, { name, email, mobile, password, roleName }) => {
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
        throw new Error('Email is already registered in our system.');
      }

      // Ensure roles exist
      let roleDoc = await Role.findOne({ name: roleName });
      if (!roleDoc) {
        // Create default roles if they don't exist
        await Role.create([{ name: 'Organization' }, { name: 'Patient' }]);
        roleDoc = await Role.findOne({ name: roleName });
        if (!roleDoc) {
          throw new Error('Invalid role selected');
        }
      }

      // 3. Create User
      const user = await User.create({
        name,
        email,
        mobile,
        password,
        role: roleDoc._id,
      });

      // Populate role for response
      await user.populate('role');

      if (user) {
        return {
          token: createToken(user),
          user: {
            id: user._id,
            name: user.name,
            email: user.email,
            mobile: user.mobile,
            role: user.role ? {
              id: user.role._id,
              name: user.role.name,
            } : null,
          },
        };
      } else {
        throw new Error('Invalid user data');
      }
    },
  },
};
