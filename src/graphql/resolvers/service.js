import Service from '@/models/Service';
import dbConnect from '@/lib/mongodb';

export const serviceResolvers = {
  Query: {
    getServices: async (_, { page = 1, limit = 10, search = "", isActive }) => {
      await dbConnect();
      
      let query = {};
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { desc: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (typeof isActive === 'boolean') {
        query.isActive = isActive;
      }

      const skip = (page - 1) * limit;
      const services = await Service.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const totalCount = await Service.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);
      
      return {
        services,
        totalCount,
        totalPages,
        currentPage: page
      };
    },
    getService: async (_, { id }) => {
      await dbConnect();
      return await Service.findById(id);
    },
  },
  Mutation: {
    createService: async (_, args) => {
      await dbConnect();
      return await Service.create(args);
    },
    updateService: async (_, { id, ...args }) => {
      await dbConnect();
      return await Service.findByIdAndUpdate(id, args, { new: true });
    },
    deleteService: async (_, { id }) => {
      await dbConnect();
      await Service.findByIdAndDelete(id);
      return true;
    },
  },
};
