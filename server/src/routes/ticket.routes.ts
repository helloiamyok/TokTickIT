import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { updateTicketStatus } from '../controllers/ticketController';

const router = Router();

router.patch('/:id/status', authenticate, updateTicketStatus);
router.patch('/:id/indicate-resolved', authenticate, (req, res) => {
  req.body.indicateResolved = true;
  return updateTicketStatus(req, res);
});
router.patch('/:id/resolution-feedback', authenticate, (req, res) => {
  req.body.indicateResolved = true;
  return updateTicketStatus(req, res);
});

export default router;
