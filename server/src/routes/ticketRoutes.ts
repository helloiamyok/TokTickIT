import { Router } from 'express';
import { updateTicketWorkflowStatus } from '../controllers/ticketWorkflowController';
import { authenticate } from '../middlewares/auth';

const router = Router();

// ผูก Endpoint สำหรับเปลี่ยนสถานะตั๋ว
router.patch('/:id/status', authenticate, updateTicketWorkflowStatus);

// Aliases for compatibility
router.patch('/:id/indicate-resolved', authenticate, (req, res) => {
  req.body.indicateResolved = true;
  return updateTicketWorkflowStatus(req, res);
});

router.patch('/:id/resolution-feedback', authenticate, (req, res) => {
  req.body.indicateResolved = true;
  return updateTicketWorkflowStatus(req, res);
});

export default router;
