# Cross-Department Skills Visibility Fix

## Problem Summary

Previously, when one department added a skill, that skill was **not visible to other departments**. This prevented other departments from selecting or adding that skill under the **"Applicable to My Department"** section.

## Root Cause

The issue was in the backend API endpoint `/skills/:departmentId` in `backend/controllers/skills.js`, which was filtering skills only by the creating department:

```sql
-- OLD QUERY (INCORRECT)
SELECT skillId, skillName, departmentIdGivingTraining, skillDescription 
FROM skill 
WHERE departmentId = ? AND skillActivityStatus = 1
```

This query only returned skills **created by** the specified department, completely ignoring the `departmentSkill` junction table that tracks which departments have access to which skills.

## Solution Implemented

### 1. Backend Changes

#### Modified: `backend/controllers/skills.js`

Updated the `/skills/:departmentId` endpoint to use a LEFT JOIN with the `departmentSkill` table:

```sql
-- NEW QUERY (CORRECT)
SELECT DISTINCT s.skillId, s.skillName, s.departmentIdGivingTraining, s.skillDescription, s.departmentId
FROM skill s
LEFT JOIN departmentSkill ds ON s.skillId = ds.skillId
WHERE s.skillActivityStatus = 1
  AND (
    s.departmentId = ? 
    OR (ds.departmentId = ? AND ds.departmentSkillType IN (1, 3) AND ds.departmentSkillStatus = 1)
  )
ORDER BY s.skillName
```

This query now returns:
1. Skills owned by the department (`s.departmentId = ?`)
2. Skills from other departments where this department has access (`ds.departmentSkillType IN (1, 3)`)

### 2. Frontend Changes

#### Modified: `frontend/src/pages/Manager/UpdateSkill.jsx`

**Key Changes:**

1. **Refactored `fetchDepartmentSkill()` function** to properly handle cross-department skills:
   - Uses the `/expected-department-skill` endpoint to get all department-skill relationships
   - Filters to show skills where the current department has access (type 1, 2, or 3)
   - Uses a Map to deduplicate skills and correctly display the department's relationship type
   - Excludes type 2 entries from OTHER departments (since they're taking training, not giving)

2. **Removed duplicate API call** that was overwriting the skills state:
   - The `departmentExpectedSkills()` function was being called after `fetchDepartmentSkill()`
   - This was causing the skills list to be overwritten with incorrect data
   - Removed the redundant call from the useEffect hook

## Understanding departmentSkillType

The `departmentSkill` table uses `departmentSkillType` to define the relationship between a department and a skill:

- **Type 1**: "Giving Training" - Department offers/provides training for this skill
- **Type 2**: "Taking Training" - Department wants to receive/take training for this skill (from another department)
- **Type 3**: "Applicable to my department" - Department both offers AND can receive training (bi-directional)

## How It Works Now

### Scenario: Department A creates a skill, Department B wants to use it

1. **Department A creates a skill** called "React Development"
   - A record is created in the `skill` table with `departmentId = A`
   - A record is created in `departmentSkill` with `skillId`, `departmentId = A`, `departmentSkillType = 1`

2. **Department A's view:**
   - Shows "React Development" as their skill
   - Type shows as "Giving Training"
   - Can check the "Expected Skill" checkbox to change it to type 3 ("Applicable to my department")

3. **Department B's view (THE FIX):**
   - **NOW SEES** "React Development" in their skills list (created by Department A)
   - Shows as "Giving Training" (because it's from another department)
   - Can check the "Expected Skill" checkbox to add a type 2 relationship
   - This creates a new record: `skillId`, `departmentId = B`, `departmentSkillType = 2`

4. **After Department B marks it as applicable:**
   - Department A still sees it as type 1 (Giving Training)
   - Department B now shows the checkbox as checked (they're taking training)
   - Both departments can use this skill in their training modules

## Testing the Fix

### Manual Testing Steps

1. **Login as Department A Manager:**
   - Navigate to Training → Skills
   - Add a new skill (e.g., "Cross-Department Test Skill")
   - Keep it as "Giving Training" (don't check the "Expected Skill" checkbox yet)

2. **Login as Department B Manager:**
   - Navigate to Training → Skills
   - **Verify:** You should now see "Cross-Department Test Skill" in the list
   - The skill should show as "Giving Training" with Department A's name
   - Check the "Expected Skill" checkbox for this skill
   - **Verify:** Checkbox should be checked and skill is now applicable to Department B

3. **Switch back to Department A:**
   - **Verify:** The skill still shows as "Giving Training" for Department A
   - Department B's action didn't affect Department A's view

4. **Test in Training Module:**
   - Both departments should be able to select this skill when creating trainings
   - Employees from both departments should see the skill in their skill matrices

### Automated Testing

Run the provided test script:

```bash
cd backend
node test-cross-department-skills.js
```

This script will:
1. Create a test skill for Department A
2. Verify Department B can see it
3. Add a type 2 relationship for Department B
4. Verify both departments see the skill correctly
5. Clean up the test data

**Note:** Update the `DEPT_A_ID` and `DEPT_B_ID` constants in the script to match your database.

## Database Schema Reference

### skill table
```sql
CREATE TABLE skill(
    skillId TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    skillName VARCHAR(50),
    departmentId TINYINT UNSIGNED,           -- Department that created the skill
    skillDescription VARCHAR(200),
    departmentIdGivingTraining TINYINT UNSIGNED,
    skillActivityStatus BOOLEAN DEFAULT TRUE
);
```

### departmentSkill table (Junction table)
```sql
CREATE TABLE departmentSkill (
    skillId TINYINT UNSIGNED,
    departmentId TINYINT UNSIGNED,
    departmentSkillType TINYINT UNSIGNED,    -- 1=Giving, 2=Taking, 3=Both
    departmentSkillStatus BOOLEAN DEFAULT 1,  -- Active/Inactive
    PRIMARY KEY (skillId, departmentId, departmentSkillType)
);
```

## Files Modified

1. **backend/controllers/skills.js** - Fixed the main GET endpoint
2. **frontend/src/pages/Manager/UpdateSkill.jsx** - Fixed the skills fetching and display logic

## Backward Compatibility

✅ **The changes are backward compatible:**
- Existing skills will continue to work as before
- Departments that have already created skills will see them normally
- The enhanced query will simply show additional skills from other departments
- No database migration is required

## Edge Cases Handled

1. **Inactive skills:** Only active skills (`skillActivityStatus = 1` and `departmentSkillStatus = 1`) are shown
2. **Type 2 from other departments:** Not shown (they're taking training, not giving)
3. **Duplicate skills:** Using Map to deduplicate when a skill has multiple department relationships
4. **Department owns skill and has access:** Correctly shows the department's own relationship type

## Potential Improvements for Future

1. Add a visual indicator showing which department created/owns the skill
2. Add filtering/search to help departments find relevant skills from other departments
3. Add notifications when another department marks your skill as applicable
4. Add analytics showing cross-department skill adoption

## Support

If you encounter any issues:
1. Check the browser console for any errors
2. Check the backend server logs
3. Verify the database has the correct `departmentSkill` relationships
4. Run the test script to validate the backend endpoints
