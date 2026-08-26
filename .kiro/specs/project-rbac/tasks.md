# Implementation Plan: Project RBAC System

## Overview

This implementation plan breaks down the Project RBAC system into discrete, executable tasks. The system implements role-based access control (RBAC) for the Project Management module, allowing Managers to assign specific stages and substages to employees while enforcing granular permissions at the backend API and frontend UI layers.

**Key Components:**
- Database schema changes (stage_assignment table)
- Backend RBAC middleware (rbacMiddleware, checkStageAccess, checkSubstageAccess, checkBOMAccess)
- Backend controllers (assignment.controller.js, modifications to stage/substage/bom controllers)
- Backend routes (assignment.routes.js, updates to existing routes)
- Frontend utilities (rbacUtils.js)
- Frontend component modifications
- Migration script for backward compatibility

## Tasks

- [x] 1. Set up database schema and migration infrastructure
  - [x] 1.1 Create stage_assignment table
    - Create the `stage_assignment` table with columns: assignmentId (PK), projectNumber, stageId, substageId, employeeId, assignedBy, assignedDate
    - Add foreign key constraints referencing stage, substage, and employee tables with ON DELETE CASCADE
    - Add CHECK constraint ensuring exactly one of stageId or substageId is set
    - Create indexes on projectNumber, employeeId, stageId, and substageId columns
    - Create composite index on (employeeId, projectNumber) for performance
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6, 11.7, 18.6_

  - [x] 1.2 Create migration script for backward compatibility
    - Write SQL script `backend/migrations/003_populate_stage_assignments.sql`
    - Script should populate stage_assignment table from existing project access data
    - Assign all stages to project creators (Managers)
    - Assign all substages to project creators
    - Make script idempotent using INSERT IGNORE or ON DUPLICATE KEY UPDATE
    - Add logging of migration results (total assignments, unique employees, unique projects)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5, 19.6_

- [~] 2. Checkpoint - Verify database setup
  - Ensure the stage_assignment table is created successfully
  - Run migration script and verify data population
  - Check that foreign key constraints and indexes are in place
  - Ask the user if questions arise

- [x] 3. Implement backend RBAC middleware
  - [x] 3.1 Create rbacMiddleware.js
    - Create file `backend/middleware/rbacMiddleware.js`
    - Implement role detection logic: check if user is project creator (Manager)
    - Query stage_assignment table for owned stages and substages
    - Attach req.rbac object with role, ownedStages, ownedSubstages, isManager
    - Return 403 if user has no assignments and is not Manager
    - Use asyncHandler for error handling
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 2.8, 20.3_

  - [x] 3.2 Create checkStageAccess middleware
    - Create file `backend/middleware/checkStageAccess.js`
    - Export function that accepts operation parameter ('read' or 'edit')
    - Verify user has permission to access specific stage
    - For 'edit' operation, check if user owns the stage or is Manager
    - For 'read' operation, check if user owns stage or any descendant substages
    - Return 403 with descriptive error message for unauthorized access
    - _Requirements: 4.1, 4.5, 13.1, 13.4, 13.5, 13.6_

  - [x] 3.3 Create checkSubstageAccess middleware
    - Create file `backend/middleware/checkSubstageAccess.js`
    - Export function that accepts operation parameter ('read' or 'edit')
    - Verify user has permission to access specific substage
    - For 'edit' operation, check if user owns substage, parent stage, or is Manager
    - Query substage table to get stageId for parent stage ownership check
    - Return 403 with descriptive error message for unauthorized access
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 9.3, 9.4, 9.5, 13.2_

  - [x] 3.4 Create checkBOMAccess middleware
    - Create file `backend/middleware/checkBOMAccess.js`
    - Verify user has Stage_Owner permission (not Substage_Owner)
    - Check if user owns the stage associated with the BOM or is Manager
    - Return 403 if user only has substage ownership
    - Include descriptive error message: "Only stage owners can access BOM data"
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 13.3_

- [x] 4. Implement assignment controller
  - [x] 4.1 Create assignment.controller.js
    - Create file `backend/controllers/assignment.controller.js`
    - Import required dependencies (asyncHandler, ApiError, ApiResponse, db connection)
    - Implement createAssignment function: validate input, check Manager role, insert into stage_assignment
    - Implement getAssignmentsByProject function: fetch all assignments with employee and stage/substage names
    - Implement deleteAssignment function: verify Manager role, delete assignment record
    - Add proper error handling and response formatting
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.6, 1.7, 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7, 14.1, 14.2, 14.3_

- [x] 5. Create assignment routes
  - [x] 5.1 Create assignment.routes.js
    - Create file `backend/routes/assignment.routes.js`
    - Set up Express router with authMiddleware and projectAccessMiddleware
    - Define POST / endpoint for creating assignments
    - Define GET /project/:projectNumber endpoint for retrieving assignments
    - Define DELETE /:assignmentId endpoint for deleting assignments
    - Export router
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6_

  - [x] 5.2 Register assignment routes in main application
    - Update `backend/index.js` to import and use assignment routes
    - Mount assignment routes at appropriate path (e.g., /api/assignments)
    - _Requirements: 12.1, 12.2, 12.3, 12.4_

- [~] 6. Checkpoint - Test assignment management
  - Test creating assignments via API
  - Test retrieving assignments for a project
  - Test deleting assignments
  - Verify Manager role enforcement
  - Ask the user if questions arise

- [x] 7. Modify stage controller for RBAC
  - [x] 7.1 Update getActiveStagesByProjectNumber function
    - Modify `backend/controllers/stage.controller.js`
    - Add RBAC filtering logic: if not Manager, filter stages by ownedStages
    - Append `WHERE stageId IN (?)` clause when user is Assignee
    - Add `canEdit` flag to each stage in response based on ownership
    - Ensure backward compatibility: if no RBAC context, return all stages
    - _Requirements: 3.1, 3.2, 4.1, 4.8, 7.1, 7.2, 7.5_

  - [x] 7.2 Update getSingleStageByStageId function
    - Add authorization check using checkStageAccess middleware
    - Add `canEdit` flag to response based on req.rbac
    - _Requirements: 4.1, 4.5_

  - [x] 7.3 Update updateStage function
    - Add authorization check at the beginning of the function
    - Verify user is Manager or owns the specific stage
    - Return 403 if user does not have edit permission
    - _Requirements: 3.3, 4.5, 21.4_

- [x] 8. Modify substage controller for RBAC
  - [x] 8.1 Update getSubStagesByStageId function
    - Modify `backend/controllers/substage.controller.js`
    - Use recursive CTE to fetch all descendant substages
    - Add `canEdit` flag based on substage ownership or parent stage ownership
    - Add `isOwnedByUser` flag to indicate direct ownership
    - Apply hierarchical filtering: Stage_Owners see all children, Substage_Owners see only owned
    - _Requirements: 4.2, 4.3, 4.7, 5.1, 5.2, 7.3, 9.1, 9.2, 9.3, 9.6_

  - [x] 8.2 Update updateSubStage function
    - Add authorization check at the beginning of the function
    - Verify user is Manager, owns the substage, or owns the parent stage
    - Query substage table to get stageId for parent stage check
    - Return 403 if user does not have edit permission
    - _Requirements: 5.4, 5.5, 5.6, 9.3_

- [x] 9. Modify BOM controller for RBAC
  - [x] 9.1 Update fetchBomDetailsByProjectNumber function
    - Modify `backend/controllers/bom.controller.js`
    - Add RBAC filtering: if not Manager, filter BOMs by ownedStages only
    - Append `WHERE bd.stageId IN (?)` clause for Assignees
    - Return empty array if user has no stage ownership (only substage ownership)
    - Ensure Substage_Owners cannot access any BOMs
    - _Requirements: 6.1, 6.2, 6.7, 7.3_

  - [x] 9.2 Update BOM edit endpoints
    - Add checkBOMAccess middleware to all BOM modification endpoints
    - Verify user has Stage_Owner permission before allowing edits
    - Return 403 for Substage_Owners attempting to edit BOMs
    - _Requirements: 6.2, 6.4, 6.5_

- [x] 10. Update route definitions with RBAC middleware
  - [x] 10.1 Update stage.routes.js
    - Modify `backend/routes/stage.routes.js`
    - Add rbacMiddleware to GET /project/:projectNumber endpoint
    - Add rbacMiddleware and checkStageAccess('read') to GET /:id endpoint
    - Add rbacMiddleware and checkStageAccess('edit') to PUT /:id endpoint
    - Keep existing Manager-only routes (POST, DELETE) unchanged
    - _Requirements: 3.1, 3.3, 4.1, 4.5, 20.1, 20.2, 20.3_

  - [x] 10.2 Update substage.routes.js
    - Modify `backend/routes/substage.routes.js`
    - Add rbacMiddleware to GET /stage/:stageId endpoint
    - Add rbacMiddleware and checkSubstageAccess('read') to GET /:id endpoint
    - Add rbacMiddleware and checkSubstageAccess('edit') to PUT /:id endpoint
    - _Requirements: 5.1, 5.4, 5.5, 5.6_

  - [x] 10.3 Update bom.route.js
    - Modify `backend/routes/bom.route.js`
    - Add rbacMiddleware to BOM retrieval endpoints
    - Add checkBOMAccess middleware to all BOM modification endpoints
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 11. Checkpoint - Test backend RBAC enforcement
  - Test stage retrieval with Manager role (should see all stages)
  - Test stage retrieval with Stage_Owner role (should see only owned stages)
  - Test substage retrieval with hierarchical access
  - Test BOM access for Stage_Owners and Substage_Owners
  - Test authorization errors (403 responses)
  - Ask the user if questions arise

- [x] 12. Implement frontend RBAC utilities
  - [x] 12.1 Create rbacUtils.js
    - Create file `frontend/src/utils/rbacUtils.js`
    - Implement canEditStage function: check if user is Manager or owns the stage
    - Implement canEditSubstage function: check if user owns substage or parent stage
    - Implement canAccessBOM function: check if user is Manager or owns the stage
    - Implement extractRoleInfo function: parse role info from user context or API response
    - Export all utility functions
    - _Requirements: 3.8, 4.7, 5.7, 5.8, 6.6, 6.7_

- [x] 13. Modify frontend stage components
  - [x] 13.1 Update StageComponent for permission-aware rendering
    - Modify stage display components to use rbacUtils
    - Import canEditStage and extractRoleInfo from rbacUtils
    - Conditionally render edit controls based on canEdit flag from API
    - Display "Read Only" badge when user cannot edit
    - Conditionally render BOM edit controls based on canAccessBOM
    - _Requirements: 3.8, 4.5, 4.6, 4.7, 4.8, 8.1, 8.2, 8.4_

  - [x] 13.2 Update stage list/table components
    - Filter stage lists based on API response (backend already filters)
    - Do not attempt to fetch unauthorized stages
    - Hide navigation elements that would lead to unauthorized stages
    - Display message when user has no assigned stages
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [x] 14. Modify frontend substage components
  - [x] 14.1 Update SubstageComponent for permission-aware rendering
    - Modify substage display components to use rbacUtils
    - Import canEditSubstage from rbacUtils
    - Conditionally render edit controls based on canEdit flag from API
    - Display lock icon or disabled state for read-only substages
    - Implement visual cues distinguishing editable vs read-only substages
    - _Requirements: 5.7, 5.8, 9.7, 9.8_

  - [x] 14.2 Update substage hierarchy/tree components
    - Display only authorized substages from API response
    - Show hierarchical structure with read-only parent context if needed
    - Hide sibling substages not accessible to Substage_Owners
    - _Requirements: 8.1, 8.2, 8.5_

- [ ] 15. Create assignment management UI
  - [~] 15.1 Create AssignmentManager component
    - Create component for managing stage and substage assignments
    - Implement UI for creating new assignments (select employee, stage/substage)
    - Display list of current assignments with employee names and stage/substage names
    - Implement delete assignment functionality
    - Show "Manager only" message for non-Managers
    - Use API calls to assignment endpoints
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 14.3, 14.4, 14.5, 14.6_

  - [~] 15.2 Integrate AssignmentManager into project management UI
    - Add AssignmentManager component to project detail page or settings
    - Make it accessible only to Managers
    - Display assignment history with timestamps and assignedBy information
    - _Requirements: 14.3, 14.4, 14.5, 14.6_

- [x] 16. Implement error handling and user feedback
  - [x] 16.1 Add authorization error handling to frontend
    - Update axios interceptor or error handling logic
    - Catch 403 Forbidden errors from RBAC middleware
    - Display user-friendly error messages via toast notifications
    - Log authorization errors for debugging
    - Prevent error retry loops for permission errors
    - _Requirements: 15.1, 15.2, 15.3_
    - Display user-friendly notifications for 403 errors
    - Show descriptive messages from backend error responses
    - Log authorization errors to browser console for debugging
    - Implement graceful degradation if backend doesn't return permission metadata
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ] 17. Run migration script and verify backward compatibility
  - [~] 17.1 Execute migration script
    - Run `backend/migrations/003_populate_stage_assignments.sql`
    - Verify all existing project members receive assignments
    - Check that Managers are assigned to all stages and substages
    - Verify migration script is idempotent (can run multiple times)
    - _Requirements: 19.1, 19.2, 19.3, 19.4, 19.5_

  - [~] 17.2 Verify backward compatibility
    - Test with existing projects before and after migration
    - Ensure users retain same effective permissions
    - Verify no breaking changes to existing API responses
    - Test that existing project access mechanisms still work
    - _Requirements: 19.1, 19.2, 19.3, 19.6, 20.5, 20.6_

- [~] 18. Checkpoint - End-to-end testing
  - Test complete workflow: Manager assigns stage to Employee, Employee accesses stage
  - Test hierarchical access: Stage_Owner views child substages
  - Test BOM access control: Stage_Owner can access, Substage_Owner cannot
  - Test reassignment: Remove assignment and verify access is revoked
  - Test error handling and user feedback
  - Ask the user if questions arise

- [ ]* 19. Performance optimization
  - [ ]* 19.1 Add query performance monitoring
    - Use EXPLAIN ANALYZE to verify indexes are used in RBAC queries
    - Measure query execution time for projects with 100, 500 stages
    - Verify queries complete within 200ms threshold
    - _Requirements: 18.1, 18.3, 18.5_

  - [ ]* 19.2 Implement caching for role detection
    - Add session-level caching for req.rbac object
    - Implement cache invalidation when assignments change
    - Measure middleware overhead with and without caching
    - _Requirements: 18.2_

  - [ ]* 19.3 Optimize frontend rendering
    - Implement lazy loading for substage trees
    - Use React.memo for substage components to prevent unnecessary re-renders
    - Add pagination for large substage lists (>100 items)
    - _Requirements: 18.7_

- [ ]* 20. Write unit tests for backend middleware
  - [ ]* 20.1 Test rbacMiddleware
    - Test with Manager user: should set isManager = true
    - Test with Assignee user: should populate ownedStages and ownedSubstages
    - Test with unassigned user: should return 403
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7_

  - [ ]* 20.2 Test checkStageAccess middleware
    - Test edit operation with owned stage: should call next()
    - Test edit operation with unowned stage: should return 403
    - Test read operation with hierarchical access
    - _Requirements: 13.1, 13.4, 13.5_

  - [ ]* 20.3 Test checkSubstageAccess middleware
    - Test with Substage_Owner: should allow edit on owned substage
    - Test with Stage_Owner: should allow view on child substages
    - Test edit on sibling substage: should return 403
    - _Requirements: 13.2, 13.4, 13.5_

  - [ ]* 20.4 Test checkBOMAccess middleware
    - Test with Stage_Owner: should allow access
    - Test with Substage_Owner: should return 403
    - _Requirements: 13.3, 13.4_

- [ ]* 21. Write unit tests for backend controllers
  - [ ]* 21.1 Test assignment controller
    - Test createAssignment: verify Manager role check, validate input
    - Test getAssignmentsByProject: verify correct data retrieval
    - Test deleteAssignment: verify Manager role check
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_

  - [ ]* 21.2 Test stage controller RBAC filtering
    - Test getActiveStagesByProjectNumber with Manager: should return all stages
    - Test getActiveStagesByProjectNumber with Stage_Owner: should return only owned stages
    - Test updateStage authorization check
    - _Requirements: 3.1, 3.2, 3.3, 7.1, 7.2_

  - [ ]* 21.3 Test substage controller hierarchical access
    - Test getSubStagesByStageId with Stage_Owner: should return all descendants
    - Test getSubStagesByStageId with Substage_Owner: should return only owned subtree
    - Test updateSubStage with parent stage ownership
    - _Requirements: 4.2, 4.3, 5.1, 5.4, 9.1, 9.2, 9.3_

  - [ ]* 21.4 Test BOM controller filtering
    - Test fetchBomDetailsByProjectNumber with Manager: should return all BOMs
    - Test fetchBomDetailsByProjectNumber with Stage_Owner: should return BOMs for owned stages
    - Test fetchBomDetailsByProjectNumber with Substage_Owner: should return empty array
    - _Requirements: 6.1, 6.2, 6.3, 6.7, 7.3_

- [ ]* 22. Write integration tests
  - [ ]* 22.1 End-to-end stage access test
    - Create project as Manager
    - Create stage and assign to Employee A
    - Login as Employee A and verify can view and edit assigned stage
    - Login as Employee B and verify receives 403
    - _Requirements: 1.1, 1.2, 2.1, 3.1, 3.3, 4.1, 4.5_

  - [ ]* 22.2 Hierarchical substage access test
    - Create nested substages (parent → child → grandchild)
    - Assign parent substage to Employee A
    - Verify Employee A can view child and grandchild
    - Verify Employee A cannot edit child without explicit assignment
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5, 9.6_

  - [ ]* 22.3 BOM access control test
    - Create stage with BOM
    - Assign substage (not stage) to Employee A
    - Verify Employee A receives 403 when accessing BOM
    - Assign stage to Employee A
    - Verify Employee A can now view and edit BOM
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 6.7_

- [ ]* 23. Write frontend unit tests
  - [ ]* 23.1 Test rbacUtils functions
    - Test canEditStage with Manager: should return true
    - Test canEditStage with Stage_Owner on owned stage: should return true
    - Test canEditStage with Substage_Owner: should return false
    - Test canAccessBOM with different roles
    - _Requirements: 3.8, 4.5, 4.6, 5.7, 6.6_

  - [ ]* 23.2 Test component permission rendering
    - Test StageComponent renders edit controls when canEdit=true
    - Test StageComponent renders read-only badge when canEdit=false
    - Test SubstageComponent renders lock icon for read-only substages
    - _Requirements: 4.7, 4.8, 5.7, 5.8, 9.7, 9.8_

- [~] 24. Final checkpoint - Complete system verification
  - Run all unit tests and integration tests
  - Verify all acceptance criteria from requirements are met
  - Test with various user roles and project configurations
  - Verify performance metrics (query times, rendering times)
  - Verify backward compatibility with existing projects
  - Document any known issues or limitations
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Testing tasks (19-23) are optional but strongly recommended for production deployment
- Each task references specific requirements from requirements.md for traceability
- Performance optimization tasks (19.x) should be done after core functionality is verified
- Migration script (1.2) must be run before deploying RBAC middleware to production
- Backward compatibility verification (17.2) is critical before full rollout
- The implementation uses JavaScript (Node.js with ES modules) as indicated by the existing project structure
- Frontend uses React for UI components
- Database is MySQL with support for recursive CTEs and foreign key constraints

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["3.1", "3.2", "3.3", "3.4"] },
    { "id": 2, "tasks": ["4.1", "5.1"] },
    { "id": 3, "tasks": ["5.2", "7.1", "7.2", "7.3"] },
    { "id": 4, "tasks": ["8.1", "8.2", "9.1", "9.2"] },
    { "id": 5, "tasks": ["10.1", "10.2", "10.3"] },
    { "id": 6, "tasks": ["12.1"] },
    { "id": 7, "tasks": ["13.1", "13.2", "14.1", "14.2"] },
    { "id": 8, "tasks": ["15.1", "15.2", "16.1"] },
    { "id": 9, "tasks": ["17.1", "17.2"] },
    { "id": 10, "tasks": ["19.1", "19.2", "19.3"] },
    { "id": 11, "tasks": ["20.1", "20.2", "20.3", "20.4"] },
    { "id": 12, "tasks": ["21.1", "21.2", "21.3", "21.4"] },
    { "id": 13, "tasks": ["22.1", "22.2", "22.3"] },
    { "id": 14, "tasks": ["23.1", "23.2"] }
  ]
}
```
