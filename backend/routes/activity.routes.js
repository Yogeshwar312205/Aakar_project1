import express from 'express';
import {
    createActivity,
    getAllActivities,
    getActivityById,
    updateActivity,
    deleteActivity,
} from '../controllers/activity.controller.js';
import {
  getActivitiesBySubStageId,
  getHistoryActivitiesByActivityId,
  getActiveActivitiesBySubStageId,
  getActivitiesByProjectNumber,
  updateActivity1,
  createActivity1,
  deleteActivity1,
  addSubstageActivity,
  removeSubstageActivity,
} from '../controllers/activity1.controller.js';

const router = express.Router();

// Route to create a new activity
router.post('/addactivity', createActivity);   //working

// Route to get all activities
router.get('/getallactivities', getAllActivities);  //working

// Route to get a single activity by its ID
router.get('/getactivity/:id', getActivityById);    //working

// Route to update a single activity by its ID
router.put('/updateactivity/:id', updateActivity1);  //working

// Route to delete a single activity by its ID
router.delete('/deleteactivity/:id', deleteActivity); //

// Get all activities for a substage
router.get('/activities/:id', getActivitiesBySubStageId)

// Get history activities for an activity
router.get('/historyActivities/:id', getHistoryActivitiesByActivityId)

// Get active activities for a substage
router.get('/activeActivities/:id', getActiveActivitiesBySubStageId)

// Get activities by project number
router.get('/project/activities/:projectNumber', getActivitiesByProjectNumber)

// Update activity
router.put('/activities/:id', updateActivity1)

// Create activity
router.post('/activities', createActivity1)

// Delete activity
router.delete('/activities/:id', deleteActivity1)

// Add mapping between substage and activity
router.post('/substage-activity', addSubstageActivity)

// Remove mapping between substage and activity
router.delete('/substage-activity', removeSubstageActivity)

export default router;