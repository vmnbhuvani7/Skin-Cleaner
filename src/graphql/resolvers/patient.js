import Patient from '@/models/Patient';
import dbConnect from '@/lib/mongodb';
import { calculateAge } from '@/utils/dateUtils';

export const patientResolvers = {
  Patient: {
    age: (parent) => calculateAge(parent.birthdate),
    birthdate: (parent) => parent.birthdate ? parent.birthdate.toISOString() : null,
  },
  Query: {
    getPatients: async (_, { page = 1, limit = 10, search = "", isActive }) => {
      await dbConnect();
      
      let query = {};
      
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
      const patients = await Patient.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalCount = await Patient.countDocuments(query);
      
      return {
        patients,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: totalCount > (skip + patients.length)
      };
    },
    getPatient: async (_, { id }) => {
      await dbConnect();
      return await Patient.findById(id);
    },
  },
  Mutation: {
    createPatient: async (_, args) => {
      await dbConnect();
      return await Patient.create(args);
    },
    updatePatient: async (_, { id, ...args }) => {
      await dbConnect();
      return await Patient.findByIdAndUpdate(id, args, { new: true });
    },
    deletePatient: async (_, { id }) => {
      await dbConnect();
      await Patient.findByIdAndDelete(id);
      return true;
    },
  },
};
