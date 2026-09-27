import { z } from 'zod';

export const noteSchema = z.object({
  content: z.string().min(1).max(2000)
});
