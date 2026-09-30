import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { 
    getMyTrainings,
    getTodaySessions,
    getAllSessions,
    getTrainingProgress,
    getAttendanceStats
} from '../controllers/myTraining.controller.js';

const router = express.Router();

// All routes require authentication
router.get('/my-training/:employeeId', authMiddleware, getMyTrainings);
router.get('/my-training/:employeeId/today-sessions', authMiddleware, getTodaySessions);
router.get('/my-training/:employeeId/sessions', authMiddleware, getAllSessions);
router.get('/my-training/:employeeId/training/:trainingId/progress', authMiddleware, getTrainingProgress);
router.get('/my-training/:employeeId/attendance-stats', authMiddleware, getAttendanceStats);

export default router;
