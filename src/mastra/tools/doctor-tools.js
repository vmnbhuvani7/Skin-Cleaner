import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import dbConnect from '@/lib/mongodb';
import Doctor from '@/models/Doctor';

export const doctorsTool = createTool({
  id: 'get-doctors',
  description: 'Fetch available doctors for skin and hair consultation',
  inputSchema: z.object({
    specialization: z.enum(['Skin', 'Hair', 'Both']).optional().describe('Filter doctors by specialization'),
  }),
  execute: async ({ specialization }) => {
    await dbConnect();
    console.log("🚀 ~ query doctorsTool specialization:", specialization)
    const query = specialization ? { specialization } : {};
    const doctors = await Doctor.find({ ...query, isActive: true });

    return doctors.map((d) => ({
      id: d._id,
      name: d.name,
      specialization: d.specialization,
      experience: d.experience,
      fee: d.consultationFee,
    }));
  },
});
