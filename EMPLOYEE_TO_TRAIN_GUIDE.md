# Employee To Train - Troubleshooting Guide

## Overview
The "Employee To Train" section in the Assign Training page shows employees who are eligible to be assigned to a specific training session.

## Why You Might See No Employees

### The employee list will be empty if:

1. **No employees have the required skills**
   - Employees must have the exact skills required by the training
   - Skills must be assigned in the `employeeSkill` table
   - Check: Skill Matrix or Employee Status pages

2. **Employees are in a different department**
   - Employees must belong to the same department as the skill's owner
   - Cross-department skills work, but employees must be in the correct department
   - Check: Employee's department in Employee Management

3. **Missing employeeDesignation records**
   - Every employee must have a record in `employeeDesignation` table
   - This links the employee to their department
   - Check: Database integrity

4. **The trainer is the only eligible employee**
   - The system excludes the trainer from the eligible employee list
   - If only the trainer has the skills, no one else will appear

5. **No skills assigned to the training**
   - The training must have at least one skill selected
   - Check: Training details in the training list

## Example Scenarios

### ✅ Working Example: DSA Training
```
Training: DSA (ID: 4)
Required Skill: cpp (from IT department)
Eligible Employees: 3 employees found
  - Rushikesh Ghodke (IT)
  - Yogeshwar Shinde (IT) 
  - Yogeshwar Shinde (IT)
Result: ✓ Employees appear in "Employee To Train" list
```

### ❌ Not Working Example: Intern Training
```
Training: Intern (ID: 1)
Required Skill: Code (from HR department)
Eligible Employees: 0 employees found
Reason: No HR employees have the "Code" skill
Result: ✗ Empty "Employee To Train" list
```

## How to Fix

### Step 1: Verify Skills Are Assigned to Training
1. Go to Assign Training page
2. Click on the training row to expand
3. Check if skills are shown under "Required Skills"
4. If no skills → Edit training and add required skills

### Step 2: Verify Employees Have the Required Skills
1. Go to Skills → Skill Matrix
2. Select the skill required by the training
3. Check which employees have this skill
4. If none → Assign the skill to employees

### Step 3: Verify Employees Are in Correct Department
1. The query filters by department
2. If skill belongs to IT dept, only IT employees are eligible
3. Cross-department: If Finance selects an IT skill, only Finance employees with that skill appear

### Step 4: Assign Skills to Employees
1. Go to Employee Status page
2. Select an employee
3. Add the required skills
4. Save changes
5. Return to Assign Training → eligible employees should now appear

## Technical Details

### Database Query
The system uses this logic to find eligible employees:

```sql
SELECT DISTINCT employees
FROM training
JOIN trainingSkills (skills required by training)
JOIN employeeSkill (employees who have those skills)
JOIN employeeDesignation (employee department)
WHERE 
  - Training ID matches
  - Employee department matches skill's department
  - Employee is not the trainer
```

### Key Tables Involved
- `training` - Training sessions
- `trainingSkills` - Skills required for each training
- `employeeSkill` - Skills assigned to employees
- `employeeDesignation` - Employee department assignments
- `skill` - Skill master data (includes owner department)

## Test Results Summary

From our testing (as of today):

| Training ID | Title | Department | Required Skills | Eligible Employees |
|------------|-------|------------|----------------|-------------------|
| 22 | Fin Train | Finance | Fintech | 3 ✓ |
| 21 | teastV1 | CS | DAAA | 3 ✓ |
| 9 | test | dep1 | fire extenguisher | 2 ✓ |
| 8 | Aaag | dep1 | fire extenguisher | 2 ✓ |
| 4 | DSA | IT | cpp | 4 ✓ |
| 3 | DSA | HR | Code | 0 ✗ |
| 2 | xyx | HR | Code | 0 ✗ |
| 1 | Intern | HR | Code | 0 ✗ |

**Note:** Trainings with 0 eligible employees will show an empty "Employee To Train" list.

## Quick Checklist

Before expecting employees to appear:

- [ ] Training has skills assigned
- [ ] At least one employee has those skills
- [ ] Employees are in the correct department
- [ ] Employees have employeeDesignation records
- [ ] You're not the only person with those skills (as trainer)

## Need More Help?

Run the diagnostic script to check a specific training:
```bash
node test-eligible-employees-issue.mjs
```

This will show:
- Which trainings exist
- What skills they require
- How many eligible employees are found
- Detailed breakdown if no employees are found
