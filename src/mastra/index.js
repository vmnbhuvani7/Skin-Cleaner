import { Mastra } from '@mastra/core/mastra';
import { consultationAgent } from './agents/consultation-agent';

export const mastra = new Mastra({
  agents: { consultationAgent },
});
