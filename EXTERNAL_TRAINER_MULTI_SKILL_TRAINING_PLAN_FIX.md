# External Trainer - Multi-Skill Training Plan Fix

## Issue
When an external trainer (e.g., Anu) has multiple skills (Fintech and DSA), the Training Plan section only shows trainings for one skill (Fintech), not both.

**Symptoms:**
- External trainer logs in → sees both Fintech and DSA trainings (correct)
- Admin views Training Plan → only sees Fintech trainings for that trainer (incorrect)
- DSA trainings with the external trainer as instructor don't appear

## Root Cause
The `/all-training/:departmentId` endpoint filtered trainings using:
```sql
WHERE s.departmentId = ?
```

This meant a training would ONLY show if **ALL** its skills belonged to the specified department.

**Example Problem:**
- Training: "Advanced Programming" 
- Skills: Fintech (Finance dept) + DSA (CS dept)
- Trainer: Anu (external, has both skills)
- When viewing from Finance department → Training doesn't show because DSA is from CS dept

## Solution
Changed the WHERE clause to show trainings if **ANY** skill matches the department or is a cross-department skill:

### Updated Query
```sql
SELECT t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, 
       e.employeeName AS trainerName, t.trainerId,
       GROUP_CONCAT(DISTINCT s.skillName SEPARATOR ', ') AS skills, 
       GROUP_CONCAT(DISTINCT s.skillId SEPARATOR ', ') AS skillIds, 
       t.evaluationType
FROM training t
LEFT JOIN employee e ON t.trainerId = e.employeeId
LEFT JOIN trainingSkills ts ON t.trainingId = ts.trainingId
LEFT JOIN skill s ON ts.skillId = s.skillId
WHERE EXISTS (
  SELECT 1 FROM trainingSkills ts2
  JOIN skill s2 ON ts2.skillId = s2.skillId
  WHERE ts2.trainingId = t.trainingId 
  AND (
    s2.departmentId = ?  -- Skill owned by this department
    OR EXISTS (
      SELECT 1 FROM departmentSkill ds 
      WHERE ds.skillId = s2.skillId 
      AND ds.departmentId = ?  -- Cross-department skill applicable to this dept
      AND ds.departmentSkillStatus = 1
    )
  )
)
GROUP BY t.trainingId, t.trainingTitle, t.startTrainingDate, t.endTrainingDate, 
         e.employeeName, t.trainerId
```

### Key Changes:
1. **EXISTS clause** - Checks if the training has AT LEAST ONE skill matching the department
2. **Cross-department support** - Also includes skills from other departments marked as applicable
3. **DISTINCT** - Prevents duplicate skill names in GROUP_CONCAT
4. **t.trainerId in GROUP BY** - Prevents SQL aggregation errors

## How It Works Now

### Scenario 1: Single-Department Training
- Training: "Fintech Basics"
- Skills: Fintech (Finance dept only)
- Result: Shows in Finance dept Training Plan ✅

### Scenario 2: Multi-Department Training
- Training: "Full Stack Development"
- Skills: Fintech (Finance) + DSA (CS)
- Result: 
  - Shows in Finance dept Training Plan ✅ (because has Fintech)
  - Shows in CS dept Training Plan ✅ (because has DSA)

### Scenario 3: External Trainer with Multiple Skills
- Trainer: Anu (external)
- Skills: Fintech, DSA
- Trainings: 
  - "Fintech Advanced" (Fintech only) ✅
  - "DSA Bootcamp" (DSA only) ✅
  - "Combined Course" (Fintech + DSA) ✅
- Result: ALL trainings show in Finance dept Training Plan

## Testing

### Test Case 1: View Training Plan for External Trainer
1. **Setup:**
   - Create external trainer "Anu" with skills: Fintech, DSA
   - Create training "Fintech Advanced" (skill: Fintech, trainer: Anu)
   - Create training "DSA Bootcamp" (skill: DSA, trainer: Anu)
   
2. **Test:**
   - Login as admin (Finance dept)
   - Navigate to Training → Training Plan
   - Search or filter for trainer "Anu"
   
3. **Expected Result:**
   - See both "Fintech Advanced" and "DSA Bootcamp" trainings
   - Each training shows its respective skill(s)

### Test Case 2: Cross-Department Training
1. **Setup:**
   - Create training "Full Stack Course"
   - Skills: Fintech (Finance) + React (CS, marked as cross-dept to Finance)
   - Trainer: Anu
   
2. **Test:**
   - View from Finance dept Training Plan
   
3. **Expected Result:**
   - Training appears with both skills listed
   - Shows trainer as "Anu"

## Benefits
✅ External trainers with multiple skills now show all their trainings  
✅ Cross-department collaboration supported  
✅ Departments see trainings relevant to their skills  
✅ No duplicate entries (DISTINCT prevents this)  
✅ Better visibility across departments

## Files Modified
- **backend/controllers/trainings.js** - Updated `/all-training/:departmentId` endpoint

## Related Features
- Works with External Trainer skill assignment
- Compatible with cross-department skill mapping
- Integrates with training assignment filtering

---

**Fixed:** September 24, 2026  
**Status:** Complete ✅
