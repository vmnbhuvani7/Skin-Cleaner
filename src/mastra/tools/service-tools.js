import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Service from '@/models/Service';

export const servicesTool = createTool({
  id: 'get-services',
  description: 'Fetch available skin and hair care services from the database',
  inputSchema: z.object({
    category: z.string().optional().describe('The category of services to filter by (e.g., skin, hair)'),
  }),
  execute: async ({ category }) => {
    await dbConnect();
    console.log("🚀 ~ query servicesTool category:", category)
    const query = category ? { desc: { $regex: category, $options: 'i' } } : {};
    const services = await Service.find({ ...query, isActive: true });
    
    return services.map((s) => ({
      id: s._id,
      title: s.title,
      description: s.desc,
      icon: s.icon,
    }));
  },
});
