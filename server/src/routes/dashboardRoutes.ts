import { Router } from 'express';
import { getStaffDashboard, getRequesterDashboard } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth';

const router = Router();

router.get('/staff', authenticate, getStaffDashboard);
router.get('/requester', authenticate, getRequesterDashboard);

export default router;
