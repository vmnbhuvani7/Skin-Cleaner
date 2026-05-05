import Doctor from '@/models/Doctor';
import dbConnect from '@/lib/mongodb';
import { isAuthenticated, isOrganization } from '@/graphql/middleware/auth';

export const doctorResolvers = {
  Query: {
    getDoctors: isAuthenticated(async (_, { page = 1, limit = 10, search = "", isActive }, context) => {
      await dbConnect();
      
      let query = {};
      if (context.user.role === 'Organization') {
        query.organization = context.user.id;
      }
      
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { specialization: { $regex: search, $options: 'i' } }
        ];
      }

      if (typeof isActive === 'boolean') {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;
      const doctors = await Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalCount = await Doctor.countDocuments(query);
      
      return {
        doctors,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        currentPage: page,
        hasMore: totalCount > (skip + doctors.length)
      };
    }),
    getDoctor: isAuthenticated(async (_, { id }) => {
      await dbConnect();
      return await Doctor.findById(id);
    }),
  },
  Mutation: {
    createDoctor: isOrganization(async (_, args, context) => {
      await dbConnect();
      return await Doctor.create({ ...args, organization: context.user.id });
    }),
    updateDoctor: isOrganization(async (_, { id, ...args }) => {
      await dbConnect();
      return await Doctor.findByIdAndUpdate(id, args, { new: true });
    }),
    deleteDoctor: isOrganization(async (_, { id }) => {
      await dbConnect();
      await Doctor.findByIdAndDelete(id);
      return true;
    }),
  },
};
