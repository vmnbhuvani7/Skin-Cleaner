
import User from '@/models/User';
import Role from '@/models/Role';
import dbConnect from '@/lib/mongodb';
import { calculateAge } from '@/utils/dateUtils';
import { isOrganization, isSelfOrOrganization } from '@/graphql/middleware/auth';
import { DEFAULT_PASSWORD } from '@/utils/constants';

export const patientResolvers = {
  Patient: {
    age: (parent) => calculateAge(parent.birthdate),
    birthdate: (parent) => parent.birthdate ? parent.birthdate.toISOString() : null,
  },
  Query: {
    getPatients: isOrganization(async (_, { page = 1, limit = 10, search = "", isActive }, context) => {
      await dbConnect();
      
      let patientRole = await Role.findOne({ name: 'Patient' });
      let query = { role: patientRole._id, organization: context.user.id };
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { mobile: { $regex: search, $options: 'i' } }
        ];
      }

      if (typeof isActive === 'boolean') {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;
      const patients = await User.find(query)
        .populate('role')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalCount = await User.countDocuments(query);
      
      return {
        patients,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: totalCount > (skip + patients.length)
      };
    }),
    getPatient: isSelfOrOrganization(async (_, { id }) => {
      await dbConnect();
      return await User.findById(id).populate('role');
    }),
  },
  Mutation: {
    createPatient: isOrganization(async (_, args, context) => {
      await dbConnect();

      // Check email uniqueness across User model
      const existingUser = await User.findOne({ email: args.email });
      if (existingUser) {
        throw new Error('Email is already registered. Please use a different email.');
      }

      // Find or create 'Patient' role
      let patientRole = await Role.findOne({ name: 'Patient' });
      if (!patientRole) {
        await Role.create([{ name: 'Organization' }, { name: 'Patient' }]);
        patientRole = await Role.findOne({ name: 'Patient' });
      }

      // Set default password if not provided
      const password = args.password || DEFAULT_PASSWORD;

      const newPatient = await User.create({ ...args, password, role: patientRole._id, organization: context.user.id });
      return await newPatient.populate('role');
    }),
    updatePatient: isSelfOrOrganization(async (_, { id, ...args }) => {
      await dbConnect();

      if (args.email) {
        const existingUser = await User.findOne({ email: args.email, _id: { $ne: id } });
        if (existingUser) {
          throw new Error('Email is already registered.');
        }
      }
      return await User.findByIdAndUpdate(id, args, { new: true }).populate('role');
    }),
    deletePatient: isOrganization(async (_, { id }) => {
      await dbConnect();
      await User.findByIdAndDelete(id);
      return true;
    }),
  },
};
