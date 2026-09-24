import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { checkExternalTrainerAccess } from '../middleware/checkExternalTrainerAccess.js';
import {
    addExternalTrainer,
    getAllExternalTrainers,
    updateExternalTrainer,
    deleteExternalTrainer,
    getExternalTrainerById,
    resendCredentials
} from '../controllers/externalTrainer.controller.js';

const router = Router();

/**
 * External Trainer Management Routes
 * All routes require:
 * 1. Authentication (authMiddleware)
 * 2. Permission to manage external trainers (checkExternalTrainerAccess)
 */

// Create new external trainer
router.post(
    '/addExternalTrainer', 
    authMiddleware, 
    checkExternalTrainerAccess, 
    addExternalTrainer
);

// Get all external trainers
router.get(
    '/getAllExternalTrainers', 
    authMiddleware, 
    checkExternalTrainerAccess, 
    getAllExternalTrainers
);

// Get single external trainer by ID
router.get(
    '/getExternalTrainer/:id', 
    authMiddleware, 
    checkExternalTrainerAccess, 
    getExternalTrainerById
);

// Update external trainer details
router.put(
    '/updateExternalTrainer/:id', 
    authMiddleware, 
    checkExternalTrainerAccess, 
    updateExternalTrainer
);

// Delete external trainer
router.delete(
    '/deleteExternalTrainer/:id', 
    authMiddleware, 
    checkExternalTrainerAccess, 
    deleteExternalTrainer
);

// Resend login credentials to external trainer
router.post(
    '/resendCredentials/:id', 
    authMiddleware, 
    checkExternalTrainerAccess, 
    resendCredentials
);

export default router;
