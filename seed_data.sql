USE aakar;

-- Seed Departments
INSERT IGNORE INTO department (departmentId, departmentName, departmentSlug, departmentStartDate, departmentEndDate) VALUES
(1, 'HR', 'hr', '2023-01-01', NULL),
(2, 'IT', 'it', '2023-01-01', NULL),
(3, 'Finance', 'finance', '2023-01-01', NULL),
(4, 'Sales', 'sales', '2023-01-01', NULL),
(5, 'Marketing', 'marketing', '2023-01-01', NULL);

-- Seed Designations
INSERT IGNORE INTO designation (designationId, designationName, designationSlug, access) VALUES
(1, 'Admin', 'admin', ''),
(2, 'HOD', 'hod', ''),
(3, 'Executive', 'executive', ''),
(4, 'Assignee', 'assignee', '');

-- Seed Employee-Designation mappings for existing employees
-- Check which employees exist and assign them to departments
INSERT IGNORE INTO employeedesignation (employeeId, departmentId, designationId, managerId)
SELECT e.employeeId, 2, 1, NULL
FROM employee e
WHERE NOT EXISTS (
    SELECT 1 FROM employeedesignation ed WHERE ed.employeeId = e.employeeId
);
