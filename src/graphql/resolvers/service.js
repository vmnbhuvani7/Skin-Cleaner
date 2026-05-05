import Service from '@/models/Service';
import dbConnect from '@/lib/mongodb';
import { isAuthenticated, isOrganization } from '@/graphql/middleware/auth';

export const serviceResolvers = {
  Query: {
    getServices: isAuthenticated(async (_, { page = 1, limit = 10, search = "", isActive, sortBy, sortOrder }, context) => {
      await dbConnect();
      
      let query = {};
      if (context.user.role === 'Organization') {
        query.organization = context.user.id;
      }
      
      if (search) {
        query.$or = [
          { title: { $regex: search, $options: 'i' } },
          { desc: { $regex: search, $options: 'i' } }
        ];
      }
      
      if (typeof isActive === 'boolean') {
        query.isActive = isActive;
      }

      const sort = {};
      if (sortBy) {
        sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
      } else {
        sort.createdAt = -1;
      }

      const skip = (page - 1) * limit;
      const services = await Service.find(query)
        .sort(sort)
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
    }),
    getService: isAuthenticated(async (_, { id }) => {
      await dbConnect();
      return await Service.findById(id);
    }),
  },
  Mutation: {
    createService: isOrganization(async (_, args, context) => {
      await dbConnect();
      return await Service.create({ ...args, organization: context.user.id });
    }),
    updateService: isOrganization(async (_, { id, ...args }) => {
      await dbConnect();
      return await Service.findByIdAndUpdate(id, args, { new: true });
    }),
    deleteService: isOrganization(async (_, { id }) => {
      await dbConnect();
      await Service.findByIdAndDelete(id);
      return true;
    }),
  },
};
