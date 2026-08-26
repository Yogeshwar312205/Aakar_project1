-- ============================================
-- RBAC Diagnostic Queries
-- Run these to identify the root cause
-- ============================================

-- 1. Check what project numbers exist and their format
SELECT projectNumber, dieName, projectCreatedBy, projectStatus 
FROM project 
WHERE projectNumber LIKE '%445%' OR dieName LIKE '%JT%' OR dieName LIKE '%XYZ%'
ORDER BY projectNumber;

-- 2. Check employee IDs for Tanmay and Yogendra
SELECT employeeId, customEmployeeId, employeeName 
FROM employee 
WHERE customEmployeeId IN ('98', '99')
OR employeeName LIKE '%Tanmay%' 
OR employeeName LIKE '%Yogendra%';

-- 3. Check stages for project 445 (try multiple formats)
SELECT stageId, stageName, owner, projectNumber, historyOf 
FROM stage 
WHERE (projectNumber = '445' OR projectNumber = '#445' OR projectNumber = 'P445' OR projectNumber LIKE '%445%')
AND historyOf IS NULL;

-- 4. Check stage_assignment records for project 445
SELECT sa.*, e.employeeName, e.customEmployeeId
FROM stage_assignment sa
LEFT JOIN employee e ON sa.employeeId = e.employeeId
WHERE sa.projectNumber = '445' 
   OR sa.projectNumber = '#445' 
   OR sa.projectNumber = 'P445'
   OR sa.projectNumber LIKE '%445%';

-- 5. Check who created project 445
SELECT p.projectNumber, p.projectCreatedBy, e.employeeName, e.customEmployeeId
FROM project p
LEFT JOIN employee e ON p.projectCreatedBy = e.employeeId
WHERE p.projectNumber LIKE '%445%';

-- 6. Verify Manager detection logic
-- Replace 293 with actual employeeId from query #2
SELECT 
    p.projectNumber,
    p.projectCreatedBy,
    e1.employeeName as projectCreator,
    e1.customEmployeeId as creatorCustomId,
    CASE 
        WHEN p.projectCreatedBy = 293 THEN 'IS MANAGER'
        ELSE 'NOT MANAGER'
    END as managerStatus
FROM project p
LEFT JOIN employee e1 ON p.projectCreatedBy = e1.employeeId
WHERE p.projectNumber LIKE '%445%';

-- 7. Check stages with their owners
SELECT 
    s.stageId,
    s.stageName,
    s.projectNumber,
    s.owner as ownerEmployeeId,
    e.employeeName as ownerName,
    e.customEmployeeId as ownerCustomId,
    s.historyOf
FROM stage s
LEFT JOIN employee e ON s.owner = e.employeeId
WHERE s.projectNumber LIKE '%445%'
ORDER BY s.historyOf, s.stageId;

-- 8. Check substages with owners
SELECT 
    ss.substageId,
    ss.substageName,
    ss.stageId,
    ss.owner as ownerEmployeeId,
    e.employeeName as ownerName,
    e.customEmployeeId as ownerCustomId,
    ss.historyOf
FROM substage ss
LEFT JOIN employee e ON ss.owner = e.employeeId
WHERE ss.projectNumber LIKE '%445%'
AND ss.historyOf IS NULL
ORDER BY ss.stageId, ss.substageId;

-- 9. Summary: Who should see what for project 445
SELECT 
    'Project Creator (Manager)' as role,
    e.employeeName,
    e.customEmployeeId,
    e.employeeId,
    p.projectNumber,
    'ALL STAGES' as shouldSee
FROM project p
JOIN employee e ON p.projectCreatedBy = e.employeeId
WHERE p.projectNumber LIKE '%445%'

UNION ALL

SELECT 
    'Stage Owner' as role,
    e.employeeName,
    e.customEmployeeId,
    e.employeeId,
    s.projectNumber,
    CONCAT('Stage ', s.stageId, ': ', s.stageName) as shouldSee
FROM stage s
JOIN employee e ON s.owner = e.employeeId
WHERE s.projectNumber LIKE '%445%'
AND s.historyOf IS NULL

UNION ALL

SELECT 
    'Substage Owner' as role,
    e.employeeName,
    e.customEmployeeId,
    e.employeeId,
    ss.projectNumber,
    CONCAT('Substage ', ss.substageId, ': ', ss.substageName) as shouldSee
FROM substage ss
JOIN employee e ON ss.owner = e.employeeId
WHERE ss.projectNumber LIKE '%445%'
AND ss.historyOf IS NULL

ORDER BY employeeId, role;

-- ============================================
-- EXPECTED RESULTS INTERPRETATION
-- ============================================
-- 
-- Query #1: Should show exact projectNumber format (445, #445, P445, etc.)
-- Query #2: Should show employeeId for Tanmay (98) and Yogendra (99)
-- Query #3: Should show all active stages for project
-- Query #4: Should show who has assignments (might be empty or have Manager)
-- Query #5: Should show who created the project (should be Tanmay's employeeId)
-- Query #6: Should verify if Tanmay is detected as Manager
-- Query #7-8: Should show all stages/substages with their owners
-- Query #9: Summary of who should see what
--
-- COMMON ISSUES TO LOOK FOR:
-- - projectCreatedBy is NULL (Query #5)
-- - projectCreatedBy doesn't match Tanmay's employeeId (Query #6)
-- - projectNumber format mismatch (Query #1 vs URL)
-- - Type mismatch: projectCreatedBy is string but employeeId is number
-- - stage_assignment has records for Manager (Query #4) - unnecessary but not harmful
-- ============================================
