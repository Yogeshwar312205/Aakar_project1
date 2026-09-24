# External Trainer - Training Status Fix

## Issue
External trainers couldn't see their assigned trainings in the "My Status" page. The page showed "No trainings found!" even after being assigned to conduct trainings.

## Root Cause
The `/employee/:employeeId` endpoint only fetched trainings where the employee was a **trainee** (registered in `trainingRegistration` table). It didn't check if the employee was a **trainer** conducting trainings.

### Previous Query Logic
```sql
SELECT ... FROM training t
JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
WHERE tr.employeeId = ?  -- Only finds trainings as attendee
```

## Solution
Updated the endpoint to detect if the user is a trainer (internal grade 4 OR external trainer) and fetch appropriate trainings:

### New Logic Flow
1. **Check Employee Type**: Query `userType` and `grade` from employee table
2. **Branch Based on Role**:
   - **If Trainer** (`userType='external_trainer'` OR `grade=4`): Fetch trainings where `trainerId = employeeId`
   - **If Regular Employee**: Fetch trainings where they are registered as trainee

### Trainer Query
```sql
SELECT
  t.trainingTitle,
  t.trainingId,
  t.startTrainingDate,
  t.endTrainingDate,
  e.employeeName AS trainerName,
  GROUP_CONCAT(DISTINCT s.skillName) AS skillNames,
  GROUP_CONCAT(DISTINCT emp.employeeName) AS traineesNames,
  COUNT(DISTINCT tr.employeeId) AS traineeCount
FROM training t
LEFT JOIN employee e ON t.trainerId = e.employeeId
LEFT JOIN trainingSkills ts ON t.trainingId = ts.trainingId
LEFT JOIN skill s ON ts.skillId = s.skillId
LEFT JOIN trainingRegistration tr ON t.trainingId = tr.trainingId
LEFT JOIN employee emp ON tr.employeeId = emp.employeeId
WHERE t.trainerId = ?  -- Finds trainings where they are the trainer
GROUP BY t.trainingId
```

## Files Modified
- **`backend/controllers/employees.js`** - Updated `/employee/:employeeId` endpoint with role-based logic

## Testing
1. **Create External Trainer** with skills (e.g., Fintech)
2. **Assign Training** to the external trainer
3. **Login as External Trainer**
4. **Navigate to**: Training → My Status
5. **Expected Result**: See assigned training with:
   - Training Title
   - Start/End Dates
   - Skills (skill badges)
   - Trainees assigned (count)
   - Training Status (Upcoming/Ongoing/Completed)

## Benefits
✅ External trainers can now see trainings they are conducting  
✅ Internal trainers (grade 4) also benefit from this fix  
✅ Regular employees continue to see trainings they are attending  
✅ Single endpoint handles both trainer and trainee views  
✅ Additional info for trainers: trainee count and names

## Related Features
- Works with existing External Trainer skill-based assignment
- Respects date-based access control for external trainers
- Training status calculation (Upcoming/Ongoing/Completed) works correctly

---

**Fixed:** September 24, 2026  
**Status:** Complete ✅
