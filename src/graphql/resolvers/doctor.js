import Doctor from '@/models/Doctor';
import dbConnect from '@/lib/mongodb';

export const doctorResolvers = {
  Query: {
    getDoctors: async (_, { page = 1, limit = 10, search = "" }) => {
      await dbConnect();
      
      const query = search ? {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { specialization: { $regex: search, $options: 'i' } }
        ]
      } : {};

      const skip = (page - 1) * limit;
      const doctors = await Doctor.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalCount = await Doctor.countDocuments(query);
      
      return {
        doctors,
        totalCount,
        hasMore: totalCount > skip + doctors.length
      };
    },
    getDoctor: async (_, { id }) => {
      await dbConnect();
      return await Doctor.findById(id);
    },
  },
  Mutation: {
    createDoctor: async (_, args) => {
      await dbConnect();
      return await Doctor.create(args);
    },
    updateDoctor: async (_, { id, ...args }) => {
      await dbConnect();
      return await Doctor.findByIdAndUpdate(id, args, { new: true });
    },
    deleteDoctor: async (_, { id }) => {
      await dbConnect();
      await Doctor.findByIdAndDelete(id);
      return true;
    },
  },
};
