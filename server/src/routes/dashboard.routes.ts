import { Router } from 'express';
import { getStaffDashboard, getRequesterDashboard } from '../controllers/dashboardController';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// 1. IT Staff Dashboard API
router.get('/staff', authenticate, getStaffDashboard);

// 2. Requester Dashboard API
router.get('/requester', authenticate, getRequesterDashboard);

export default router;
