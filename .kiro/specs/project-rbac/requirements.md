# Requirements Document

## Introduction

This document specifies the requirements for implementing role-based access control (RBAC) in the Project Management section of the ERP system. The current system allows any employee with project access to view and edit all stages, substages, and Bills of Materials (BOMs) within a project. This creates security and data integrity concerns. The new RBAC system will enforce granular access controls, ensuring that managers have full visibility and control, while assignees (employees) can only access the specific stages and substages assigned to them.

## Glossary

- **System**: The ERP Project Management module responsible for managing projects, stages, substages, and BOMs
- **Manager**: An employee with full administrative rights to view, edit, and assign all stages and substages within a project they manage
- **Stage_Owner**: An employee who is assigned ownership of a specific stage, granting them rights to edit the stage, edit its BOM, and view (but not edit) all child substages unless they also own those substages
- **Substage_Owner**: An employee who is assigned ownership of a specific substage, granting them rights to edit only that substage and its data, but not the parent stage or sibling substages
- **Other_Assignee**: An employee who has been granted read-only access to a project or stage but does not own any stages or substages
- **Stage**: A major phase or milestone within a project that can contain multiple substages
- **Substage**: A child task or sub-phase within a stage, which can be nested hierarchically
- **BOM**: Bill of Materials - a list of materials, components, or resources associated with a specific stage
- **Stage_Assignment**: A record linking an employee to a specific stage or substage, defining their ownership and access rights
- **Project_Access**: The ability of an employee to access a project and its related data
- **Backend_API**: Server-side application programming interface that processes requests and enforces access control
- **Frontend_UI**: Client-side user interface that displays project data and interaction controls
- **Role**: The permission level assigned to a user (Manager, Stage_Owner, Substage_Owner, or Other_Assignee) within a project context
- **Ownership**: The rights granted to an employee to edit a specific stage or substage, tracked in the Stage_Assignment table

## Requirements

### Requirement 1: Stage and Substage Assignment Tracking

**User Story:** As a Manager, I want to assign specific stages and substages to employees, so that I can control who works on which parts of the project.

#### Acceptance Criteria

1. THE System SHALL store Stage_Assignment records that link an employeeId to a stageId or substageId
2. WHEN a Manager assigns a stage or substage to an Assignee, THE System SHALL create a Stage_Assignment record with the employeeId and the corresponding stageId or substageId
3. THE System SHALL allow a Manager to assign multiple Assignees to the same stage or substage
4. THE System SHALL allow an Assignee to be assigned to multiple stages or substages within the same project
5. WHEN a stage or substage is deleted, THE System SHALL delete all associated Stage_Assignment records
6. THE System SHALL provide an API endpoint to retrieve all Stage_Assignment records for a given projectNumber
7. THE System SHALL provide an API endpoint to retrieve all employeeIds assigned to a specific stageId or substageId

### Requirement 2: Role Detection and Differentiation

**User Story:** As the System, I want to identify whether a user is a Manager, Stage_Owner, Substage_Owner, or Other_Assignee for a given project, so that I can apply appropriate access controls.

#### Acceptance Criteria

1. WHEN a user requests access to a project, THE System SHALL determine if the user is the project creator (Manager role)
2. WHEN a user requests access to a project, THE System SHALL determine if the user has any Stage_Assignment records for that project
3. IF a user is the project creator, THEN THE System SHALL grant Manager role privileges
4. IF a user has a Stage_Assignment record with ownership of a stage (stageId is set), THEN THE System SHALL grant Stage_Owner role for that specific stage
5. IF a user has a Stage_Assignment record with ownership of a substage (substageId is set), THEN THE System SHALL grant Substage_Owner role for that specific substage
6. IF a user has Stage_Assignment records for multiple stages or substages, THEN THE System SHALL maintain a list of owned stageIds and substageIds for that user
7. IF a user is neither the project creator nor has Stage_Assignment records, THEN THE System SHALL deny access to the project
8. THE System SHALL include the user's role (Manager, Stage_Owner, Substage_Owner) and list of owned IDs in the authentication context for all subsequent requests

### Requirement 3: Manager Full Access Rights

**User Story:** As a Manager, I want to view and edit all stages, substages, and BOMs in my project, so that I can oversee and manage the entire project lifecycle.

#### Acceptance Criteria

1. WHEN a Manager requests project data, THE System SHALL return all stages and substages for that project without filtering
2. THE System SHALL allow a Manager to view all BOMs associated with any stage in the project
3. THE System SHALL allow a Manager to edit any stage or substage in the project
4. THE System SHALL allow a Manager to edit any BOM in the project
5. THE System SHALL allow a Manager to create new stages, substages, and BOMs
6. THE System SHALL allow a Manager to delete stages, substages, and BOMs
7. THE System SHALL allow a Manager to update stage and substage progress values
8. THE Frontend_UI SHALL display edit controls for all stages, substages, and BOMs when the user has Manager role

### Requirement 4: Stage Owner Visibility Rights

**User Story:** As a Stage_Owner, I want to view and edit my owned stage, view its BOM, and view (but not edit) all child substages, so that I can manage my assigned work and coordinate with substage owners.

#### Acceptance Criteria

1. WHEN a Stage_Owner requests stage data, THE Backend_API SHALL return the stage where the user has a Stage_Assignment record with that stageId
2. WHEN a Stage_Owner requests substage data, THE Backend_API SHALL return all substages that are direct or nested children of the owned stage
3. THE Backend_API SHALL include a flag indicating whether each substage is owned by the current user (for determining edit permissions)
4. WHEN a Stage_Owner requests BOM data, THE Backend_API SHALL return the BOM associated with the owned stage
5. THE Frontend_UI SHALL display edit controls for the owned stage
6. THE Frontend_UI SHALL display edit controls for the stage's BOM
7. THE Frontend_UI SHALL display child substages in read-only mode unless the user also owns those specific substages
8. THE Frontend_UI SHALL NOT display stages that are not owned by the user

### Requirement 5: Substage Owner Visibility and Edit Rights

**User Story:** As a Substage_Owner, I want to view and edit only my owned substage, without access to the parent stage or sibling substages, so that I can focus on my specific task.

#### Acceptance Criteria

1. WHEN a Substage_Owner requests substage data, THE Backend_API SHALL return only the substage where the user has a Stage_Assignment record with that substageId
2. WHEN a Substage_Owner requests substage data, THE Backend_API SHALL optionally include the parent stage in read-only mode for context (this is a configuration decision)
3. THE Backend_API SHALL NOT return sibling substages or unrelated stages to a Substage_Owner
4. WHEN a Substage_Owner attempts to edit their owned substage, THE Backend_API SHALL allow the edit operation
5. WHEN a Substage_Owner attempts to edit the parent stage, THE Backend_API SHALL return an authorization error with status code 403
6. WHEN a Substage_Owner attempts to edit sibling substages, THE Backend_API SHALL return an authorization error with status code 403
7. THE Frontend_UI SHALL display edit controls only for the owned substage
8. THE Frontend_UI SHALL NOT display edit controls for the parent stage or sibling substages, even if they are visible for context

### Requirement 6: BOM Access Control for Stage Owners Only

**User Story:** As a Stage_Owner, I want to edit the BOM for my owned stage, so that I can manage materials for my work, while Substage_Owners cannot access the stage BOM.

#### Acceptance Criteria

1. WHEN a Stage_Owner requests BOM data, THE Backend_API SHALL return the BOM associated with the owned stage
2. WHEN a Stage_Owner attempts to edit a BOM, THE Backend_API SHALL verify that the user has a Stage_Assignment record for that BOM's associated stageId
3. WHEN a Substage_Owner requests BOM data for the parent stage, THE Backend_API SHALL return an authorization error with status code 403
4. WHEN a Substage_Owner attempts to edit a BOM, THE Backend_API SHALL return an authorization error with status code 403
5. IF a user attempts to edit a BOM for a stage they do not own, THEN THE Backend_API SHALL return an authorization error with status code 403
6. THE Frontend_UI SHALL display BOM edit controls only for stages that are owned by the user (not substages)
7. THE Frontend_UI SHALL NOT display BOM data or edit controls to Substage_Owners

### Requirement 7: Backend API Data Filtering

**User Story:** As a Backend Developer, I want to filter API responses based on user role and assignments, so that unauthorized data is never sent to the client.

#### Acceptance Criteria

1. WHEN the Backend_API receives a request for project stages, THE System SHALL apply role-based filtering before returning results
2. WHEN the Backend_API receives a request for project substages, THE System SHALL apply role-based filtering before returning results
3. WHEN the Backend_API receives a request for BOMs, THE System SHALL apply role-based filtering before returning results
4. THE Backend_API SHALL extract the user's employeeId and role from the authentication context
5. IF the user has Manager role, THEN THE Backend_API SHALL return all requested data without filtering
6. IF the user has Assignee role, THEN THE Backend_API SHALL filter data based on Stage_Assignment records
7. THE Backend_API SHALL use SQL JOIN operations with the Stage_Assignment table to efficiently filter results

### Requirement 8: Frontend UI Display Filtering

**User Story:** As a Frontend Developer, I want to display only authorized stages, substages, and BOMs, so that the UI reflects the user's access permissions.

#### Acceptance Criteria

1. WHEN the Frontend_UI receives stage data from the Backend_API, THE System SHALL render only the stages included in the API response
2. WHEN the Frontend_UI receives substage data from the Backend_API, THE System SHALL render only the substages included in the API response
3. THE Frontend_UI SHALL NOT attempt to fetch or display stages and substages that were not returned by the Backend_API
4. THE Frontend_UI SHALL hide or disable navigation elements that would lead to unauthorized stages or substages
5. WHEN displaying a project tree view, THE Frontend_UI SHALL show only the authorized branches of the stage and substage hierarchy
6. THE Frontend_UI SHALL display a user-friendly message when an Assignee has no assigned stages or substages in a project

### Requirement 9: Hierarchical Access Rules

**User Story:** As a Stage_Owner, I want to view all child substages under my stage (even if owned by others), so that I can coordinate work, while Substage_Owners should only see their specific substage.

#### Acceptance Criteria

1. WHEN a Stage_Owner is assigned to a stage, THE System SHALL grant VIEW access to all substages that are direct children of that stage
2. WHEN a Stage_Owner is assigned to a stage, THE System SHALL grant VIEW access to all nested substages (grandchildren, great-grandchildren, etc.) under that stage
3. WHEN a Stage_Owner is assigned to a stage, THE System SHALL grant EDIT access to substages only if the user also has a Stage_Assignment record for those specific substages
4. WHEN a Substage_Owner is assigned to a specific substage only, THE System SHALL grant EDIT access to that substage and VIEW access to nested children substages
5. WHEN a Substage_Owner is assigned to a specific substage only, THE System SHALL NOT grant EDIT access to parent stages or sibling substages
6. THE Backend_API SHALL use recursive queries or hierarchical filtering to include all descendant substages when a parent stage is owned
7. THE Frontend_UI SHALL display child substages in read-only mode for Stage_Owners unless they also own those substages
8. THE Frontend_UI SHALL clearly indicate which substages are editable vs read-only using visual cues (e.g., disabled buttons, lock icons)

### Requirement 10: Authorization Error Handling

**User Story:** As a user, I want to receive clear error messages when I attempt unauthorized actions, so that I understand why my request was denied.

#### Acceptance Criteria

1. WHEN an Assignee attempts to access an unassigned stage, THE Backend_API SHALL return an error response with status code 403
2. WHEN an Assignee attempts to edit an unassigned stage or substage, THE Backend_API SHALL return an error response with status code 403
3. WHEN an Assignee attempts to edit an unassigned BOM, THE Backend_API SHALL return an error response with status code 403
4. THE Backend_API SHALL include an error message that states "You do not have permission to access this resource" in the response body
5. THE Frontend_UI SHALL display the error message from the Backend_API in a user-friendly notification
6. THE Frontend_UI SHALL log authorization errors to the browser console for debugging purposes
7. IF a user is not authenticated, THEN THE Backend_API SHALL return an error response with status code 401 before checking authorization

### Requirement 11: Database Schema for Stage Assignments

**User Story:** As a Database Administrator, I want a dedicated table to store stage and substage assignments, so that the system can efficiently manage and query access permissions.

#### Acceptance Criteria

1. THE System SHALL provide a database table named "stage_assignment" with columns: assignmentId, projectNumber, stageId, substageId, employeeId, assignedBy, assignedDate
2. THE System SHALL ensure that the stageId column references the stage table with a foreign key constraint
3. THE System SHALL ensure that the substageId column references the substage table with a foreign key constraint
4. THE System SHALL ensure that the employeeId column references the employee table with a foreign key constraint
5. THE System SHALL allow either stageId or substageId to be set, but not both simultaneously
6. THE System SHALL create indexes on projectNumber, employeeId, stageId, and substageId columns for query performance
7. WHEN a stage or substage is deleted, THE System SHALL automatically delete related stage_assignment records through cascading foreign key constraints

### Requirement 12: Assignment Management API Endpoints

**User Story:** As a Manager, I want API endpoints to create, update, and delete stage assignments, so that I can manage team access through the application interface.

#### Acceptance Criteria

1. THE System SHALL provide a POST endpoint to create a new Stage_Assignment record
2. THE System SHALL provide a GET endpoint to retrieve all Stage_Assignment records for a given projectNumber
3. THE System SHALL provide a GET endpoint to retrieve all Stage_Assignment records for a specific employeeId
4. THE System SHALL provide a DELETE endpoint to remove a Stage_Assignment record by assignmentId
5. WHEN creating a Stage_Assignment, THE Backend_API SHALL verify that the requesting user has Manager role for the project
6. WHEN deleting a Stage_Assignment, THE Backend_API SHALL verify that the requesting user has Manager role for the project
7. THE Backend_API SHALL validate that either stageId or substageId is provided, but not both, when creating an assignment

### Requirement 13: Middleware for Access Control

**User Story:** As a Backend Developer, I want reusable middleware to enforce access control rules, so that I can consistently apply authorization across all project-related endpoints.

#### Acceptance Criteria

1. THE System SHALL provide middleware named "checkStageAccess" that verifies user access to a specific stageId
2. THE System SHALL provide middleware named "checkSubstageAccess" that verifies user access to a specific substageId
3. THE System SHALL provide middleware named "checkBOMAccess" that verifies user access to a BOM by its associated stageId
4. WHEN middleware detects a Manager role, THE System SHALL allow the request to proceed without further checks
5. WHEN middleware detects an Assignee role, THE System SHALL query the Stage_Assignment table to verify access
6. IF access is denied, THEN THE middleware SHALL return a 403 error response and prevent the request from reaching the controller
7. THE middleware SHALL extract stageId, substageId, or bomId from request parameters or request body

### Requirement 14: Audit Trail for Access Control Changes

**User Story:** As a Manager, I want to track who assigned stages to which employees and when, so that I can audit access control changes for compliance and troubleshooting.

#### Acceptance Criteria

1. WHEN a Stage_Assignment is created, THE System SHALL record the employeeId of the Manager who created the assignment in the assignedBy column
2. WHEN a Stage_Assignment is created, THE System SHALL record the current timestamp in the assignedDate column
3. THE System SHALL provide a GET endpoint to retrieve the history of Stage_Assignment records for a given projectNumber, ordered by assignedDate
4. THE System SHALL provide a GET endpoint to retrieve all Stage_Assignment changes made by a specific Manager
5. WHEN a Stage_Assignment is deleted, THE System SHALL optionally log the deletion event with the Manager's employeeId and timestamp
6. THE Frontend_UI SHALL display assignment history to Managers, showing who assigned each stage and when

### Requirement 15: Edge Case - Multiple Managers

**User Story:** As a System Administrator, I want to handle scenarios where multiple managers can manage the same project, so that access control works correctly in collaborative environments.

#### Acceptance Criteria

1. WHERE a project has multiple Managers, THE System SHALL grant Manager role privileges to all users who are listed as project creators or co-managers
2. THE System SHALL provide a mechanism to designate additional co-managers for a project beyond the original projectCreatedBy
3. WHEN checking Manager role, THE Backend_API SHALL verify if the user is either the projectCreatedBy or listed in a project managers table
4. THE System SHALL allow any Manager or co-manager to create, update, or delete Stage_Assignment records for the project
5. THE System SHALL allow any Manager or co-manager to edit any stage, substage, or BOM in the project
6. THE Frontend_UI SHALL display Manager-level controls to all users with Manager or co-manager privileges

### Requirement 16: Edge Case - Reassignment of Stages

**User Story:** As a Manager, I want to reassign stages from one employee to another, so that I can adapt to team changes and project needs.

#### Acceptance Criteria

1. WHEN a Manager creates a new Stage_Assignment for a stage or substage that is already assigned to another employee, THE System SHALL create the new assignment without deleting the existing one
2. THE System SHALL support multiple employees being assigned to the same stage or substage simultaneously
3. WHEN a Manager wants to replace an assignment, THE Backend_API SHALL provide an endpoint to delete the old Stage_Assignment and create a new one
4. THE Frontend_UI SHALL display all current assignees for a given stage or substage
5. THE Frontend_UI SHALL allow a Manager to add or remove individual assignees without affecting other assignees
6. THE System SHALL maintain the audit trail showing historical assignments even after reassignment

### Requirement 17: Edge Case - Nested Substage Assignment Conflicts

**User Story:** As a Manager, I want the system to handle scenarios where a parent substage is assigned to one employee and a child substage is assigned to another, so that access permissions are clear and predictable.

#### Acceptance Criteria

1. WHEN an Assignee is assigned to a parent substage, THE System SHALL grant access to all child substages under that parent
2. WHEN an Assignee is assigned to a specific child substage, THE System SHALL grant access to that child substage and its descendants
3. WHEN an Assignee is assigned to a child substage but not the parent, THE System SHALL NOT grant access to the parent or sibling substages
4. THE Backend_API SHALL resolve hierarchical access by traversing the parentSubstageId relationships
5. THE Frontend_UI SHALL display the complete accessible subtree for each assigned substage
6. THE System SHALL prevent logical conflicts by allowing multiple overlapping assignments for the same substage hierarchy

### Requirement 18: Performance Optimization for Large Projects

**User Story:** As a Backend Developer, I want optimized queries for access control checks, so that the system performs well even with large projects containing hundreds of stages and substages.

#### Acceptance Criteria

1. THE Backend_API SHALL use indexed JOIN queries to filter stages and substages based on Stage_Assignment records
2. THE Backend_API SHALL cache role determination results for the duration of a user session
3. THE Backend_API SHALL use SQL query optimization techniques such as EXPLAIN to verify query performance
4. WHEN filtering substages hierarchically, THE Backend_API SHALL use recursive common table expressions (CTEs) where supported
5. THE System SHALL execute access control queries in less than 200 milliseconds for projects with up to 500 stages and substages
6. THE System SHALL use database indexes on projectNumber, employeeId, stageId, and substageId columns in the Stage_Assignment table
7. THE Backend_API SHALL paginate results when returning large lists of stages or substages

### Requirement 19: Backward Compatibility with Existing Projects

**User Story:** As a System Administrator, I want existing projects to continue functioning after RBAC is implemented, so that current users are not disrupted.

#### Acceptance Criteria

1. WHEN RBAC is deployed, THE System SHALL automatically grant Manager role to all existing projectCreatedBy users for their projects
2. WHEN RBAC is deployed, THE System SHALL analyze existing project access records and create Stage_Assignment records for employees who previously had project access
3. IF no assignment data exists for an employee with existing project access, THEN THE System SHALL assign all stages and substages to that employee to maintain their current access level
4. THE Backend_API SHALL provide a migration script to populate the Stage_Assignment table based on existing project access data
5. THE migration script SHALL be idempotent, allowing it to be run multiple times without creating duplicate assignments
6. THE System SHALL log all migration activities for audit and rollback purposes

### Requirement 21: Access Control Matrix

**User Story:** As a System Developer, I want a clear access control matrix defining permissions for each role and resource combination, so that I can implement consistent authorization logic.

#### Acceptance Criteria

1. THE System SHALL implement the following access control matrix:

   | User Role        | Stage (Owned) | Stage (Others) | Child Substages (Owned) | Child Substages (Others) | Stage BOM (Owned) | Stage BOM (Others) |
   |------------------|---------------|----------------|-------------------------|--------------------------|-------------------|--------------------|
   | Manager          | View + Edit   | View + Edit    | View + Edit             | View + Edit              | View + Edit       | View + Edit        |
   | Stage_Owner      | View + Edit   | ❌ No Access   | View + Edit             | View Only                | View + Edit       | ❌ No Access       |
   | Substage_Owner   | View Only*    | ❌ No Access   | View + Edit             | ❌ No Access             | ❌ No Access      | ❌ No Access       |
   | Other_Assignee   | ❌ No Access  | ❌ No Access   | ❌ No Access            | ❌ No Access             | ❌ No Access      | ❌ No Access       |

   *Note: Whether Substage_Owners can view the parent Stage is a configuration decision

2. WHEN a Stage_Owner owns a stage, THE System SHALL grant:
   - Full edit rights to that stage
   - Full edit rights to the stage's BOM
   - View-only access to all child substages (direct and nested descendants)
   - Full edit rights to child substages only if the user also has a Substage_Assignment for those specific substages

3. WHEN a Substage_Owner owns a substage, THE System SHALL grant:
   - Full edit rights to that substage only
   - View-only access to nested child substages under the owned substage
   - No access to the parent stage (or optionally read-only for context)
   - No access to sibling substages
   - No access to any BOM

4. WHEN checking edit permissions, THE Backend_API SHALL verify:
   - For stage edits: User must be Manager OR Stage_Owner with stageId in Stage_Assignment
   - For substage edits: User must be Manager OR Stage_Owner (if substage is child of owned stage) OR Substage_Owner with substageId in Stage_Assignment
   - For BOM edits: User must be Manager OR Stage_Owner with stageId matching the BOM's associated stage

5. THE Frontend_UI SHALL render edit controls (buttons, forms, inputs) only when the access control matrix grants edit permissions
6. THE Frontend_UI SHALL render view-only controls (read-only fields, disabled buttons) when the access control matrix grants view-only permissions
7. THE Frontend_UI SHALL not render or hide components when the access control matrix shows "No Access"
8. THE Backend_API SHALL enforce these permissions at the API endpoint level, returning 403 errors for unauthorized edit attempts

**User Story:** As a Backend Developer, I want RBAC to integrate seamlessly with existing authentication and project access middleware, so that the security model is layered and consistent.

#### Acceptance Criteria

1. THE Backend_API SHALL continue to use the existing authMiddleware for user authentication before applying RBAC checks
2. THE Backend_API SHALL continue to use the existing projectAccessMiddleware to verify that a user has project-level access before checking stage-level permissions
3. THE new RBAC middleware SHALL be applied after authMiddleware and projectAccessMiddleware in the middleware chain
4. WHEN a user passes projectAccessMiddleware but fails RBAC checks, THE Backend_API SHALL return a 403 error indicating insufficient stage-level permissions
5. THE System SHALL maintain compatibility with existing project access control tables and logic
6. THE Backend_API SHALL enhance rather than replace existing access control mechanisms


### Requirement 20: Integration with Existing Authentication and Project Access

**User Story:** As a Backend Developer, I want RBAC to integrate seamlessly with existing authentication and project access middleware, so that the security model is layered and consistent.

#### Acceptance Criteria

1. THE Backend_API SHALL continue to use the existing authMiddleware for user authentication before applying RBAC checks
2. THE Backend_API SHALL continue to use the existing projectAccessMiddleware to verify that a user has project-level access before checking stage-level permissions
3. THE new RBAC middleware SHALL be applied after authMiddleware and projectAccessMiddleware in the middleware chain
4. WHEN a user passes projectAccessMiddleware but fails RBAC checks, THE Backend_API SHALL return a 403 error indicating insufficient stage-level permissions
5. THE System SHALL maintain compatibility with existing project access control tables and logic
6. THE Backend_API SHALL enhance rather than replace existing access control mechanisms
