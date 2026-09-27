import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { convertCurrency } from '../services/fxService';
import { z } from 'zod';

const router = Router();
router.use(requireAuth);

const fxQuerySchema = z.object({
  base: z.string().length(3),
  target: z.string().length(3),
  amount: z.string().refine(val => !isNaN(Number(val)), "Amount must be a number")
});

router.get('/convert', async (req, res, next) => {
  try {
    const { base, target, amount } = fxQuerySchema.parse(req.query);
    const result = await convertCurrency(base.toUpperCase(), target.toUpperCase(), Number(amount));
    res.json({ success: true, data: result });
  } catch (error: any) {
    console.error('FX conversion error:', error);
    res.status(503).json({ 
      success: false, 
      error: 'fx_unavailable', 
      message: error.message || 'Currency conversion service unavailable' 
    });
  }
});

export default router;
