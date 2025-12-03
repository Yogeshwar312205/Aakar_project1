import asyncHandler from '../utils/asyncHandler.js'
import ApiError from '../utils/ApiError.js'
import ApiResponse from '../utils/ApiResponse.js'
import { connection as db } from '../db/index.js'
// Get Company List
export const getCompanyList = asyncHandler(async (req, res) => {
  const query = 'SELECT DISTINCT companyName FROM project'

  db.query(query, (err, data) => {
    if (err) {
      console.error('Error retrieving company names:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error retrieving company names'))
    }
    const companyList = data.map((item) => item.companyName)

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          companyList,
          'Company names retrieved successfully.'
        )
      )
  })
})

// Get all projects
export const getAllProjects = asyncHandler(async (req, res) => {
  const query = 'SELECT * FROM project'

  db.query(query, (err, data) => {
    if (err) {
      const error = new ApiError(400, 'Error retrieving projects')
      return res.status(400).json(error)
    }

    // Convert UTC dates to local time and format as YYYY-MM-DD
    const projects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
    }))

    // Send the response with the modified date formats
    res
      .status(200)
      .json(new ApiResponse(200, projects, 'Projects retrieved successfully.'))
  })
})

// get active projects
export const getActiveProjects = asyncHandler(async (req, res) => {
  // console.log(req.user)
  const query = 'SELECT * FROM project WHERE historyOf IS NULL'
  db.query(query, (err, data) => {
    if (err) {
      const error = new ApiError(400, 'Error retrieving active projects')
      console.log(error)
      return res.status(400).json(error)
    }

    // Convert UTC dates to local time and format as YYYY-MM-DD
    const activeProjects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
    }))

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          activeProjects,
          'Active projects retrieved successfully.'
        )
      )
  })
})

// get history projects whose historyOf == pNo
export const getHistoricalProjects = asyncHandler(async (req, res) => {
  const pNo = req.params.pNo
  const query =
    'SELECT * FROM project WHERE historyOf = ? ORDER BY projectNumber DESC'

  db.query(query, [pNo], (err, data) => {
    if (err) {
      const error = new ApiError(400, 'Error retrieving historical projects')
      return res.status(400).json(error)
    }

    // Convert UTC dates to local time and format as YYYY-MM-DD
    const historicalProjects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null, // Convert to local time
    }))

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          historicalProjects,
          `Historical projects for project number ${pNo} retrieved successfully.`
        )
      )
  })
})

// Get project by ID
export const getProjectById = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id
  const query = 'SELECT * FROM project WHERE projectNumber = ?'

  db.query(query, [projectNumber], (err, data) => {
    if (err) {
      res.status(500).json(new ApiError(500, 'Error retrieving project'))
      return
    }
    if (data.length === 0) {
      res.status(500).json(new ApiError(500, 'Project not found'))
      return
    }
    const projects = data.map((project) => ({
      ...project,
      startDate: project.startDate
        ? new Date(project.startDate).toLocaleDateString('en-CA')
        : null,
      endDate: project.endDate
        ? new Date(project.endDate).toLocaleDateString('en-CA')
        : null,
    }))
    res
      .status(200)
      .json(
        new ApiResponse(200, projects[0], 'Projects retrieved successfully.')
      )
  })
})

// Create a new project
export const createProject = asyncHandler(async (req, res) => {
  console.log(req.user)
  const projectQuery = `INSERT INTO project (
    projectNumber, companyName, dieName, dieNumber, projectStatus, startDate, endDate,
    projectType, projectPOLink, projectDesignDocLink, projectCreatedBy, progress
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const stageQuery = `INSERT INTO stage (
    projectNumber, stageName, startDate, endDate, owner, machine, duration, 
    seqPrevStage, createdBy, progress
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  const updateStageQuery = `UPDATE stage
    SET seqPrevStage = ?
    WHERE stageId = ?`

  const projectPOLink = req.files.projectPOLink
    ? req.files.projectPOLink[0].filename
    : null
  const projectDesignDocLink = req.files.projectDesignDocLink
    ? req.files.projectDesignDocLink[0].filename
    : null

  const projectValues = [
    req.body.projectNumber,
    req.body.companyName,
    req.body.dieName,
    req.body.dieNumber,
    req.body.projectStatus,
    req.body.startDate,
    req.body.endDate,
    req.body.projectType,
    projectPOLink,
    projectDesignDocLink,
    req.user[0].employeeId,
    req.body.progress,
  ]

  // Start a transaction
  db.beginTransaction((err) => {
    if (err) {
      console.error('Transaction Error:', err)
      return res
        .status(500)
        .json(new ApiError(500, 'Error starting transaction'))
    }

    // Insert into project table
    db.query(projectQuery, projectValues, (err, result) => {
      if (err) {
        console.error('Project Insert Error:', err)
        return db.rollback(() => {
          res.status(500).json(new ApiError(500, 'Error creating project'))
        })
      }

      const projectNumber = req.body.projectNumber
      let stages = req.body.stages

      if (typeof stages === 'string') {
        try {
          stages = JSON.parse(stages)
        } catch (parseError) {
          console.error('Stages Parse Error:', parseError)
          return db.rollback(() => {
            res.status(400).json(new ApiError(400, 'Invalid stages format'))
          })
        }
      }

      stages = stages || [] // Default to empty array if undefined

      // Insert each stage
      const stageInserts = stages.map((stage) => {
        return new Promise((resolve, reject) => {
          // Extract customEmployeeId from owner field
          const match = stage.owner.match(/\(([^)]+)\)/) // Extracts customEmployeeId
          const customEmployeeId = match ? match[1] : null

          if (!customEmployeeId) {
            reject(
              new Error('Invalid owner format, customEmployeeId not found.')
            )
            return
          }

          // Query to find the corresponding employeeId
          const employeeQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
          db.query(employeeQuery, [customEmployeeId], (err, employeeResult) => {
            if (err || employeeResult.length === 0) {
              reject(new Error('Employee not found for customEmployeeId.'))
              return
            }

            const employeeId = employeeResult[0].employeeId

            // Prepare stage values with the correct employeeId as owner
            const stageValues = [
              projectNumber,
              stage.stageName,
              stage.startDate,
              stage.endDate,
              employeeId, // Use employeeId instead of customEmployeeId
              stage.machine,
              stage.duration,
              null, // seqPrevStage will be updated later
              req.user[0].employeeId,
              stage.progress,
            ]

            db.query(stageQuery, stageValues, (err, result) => {
              if (err) {
                reject(err)
              } else {
                const stageId = result.insertId
                stage.stageId = stageId
                resolve(stage)
              }
            })
          })
        })
      })

      Promise.all(stageInserts)
        .then((insertedStages) => {
          const updatePromises = insertedStages.map((stage, index) => {
            if (index > 0) {
              const previousStageId = insertedStages[index - 1].stageId
              return new Promise((resolve, reject) => {
                db.query(
                  updateStageQuery,
                  [previousStageId, stage.stageId],
                  (err) => {
                    if (err) {
                      reject(err)
                    } else {
                      resolve()
                    }
                  }
                )
              })
            }
            return Promise.resolve()
          })

          return Promise.all(updatePromises)
        })
        .then(() => {
          db.commit((err) => {
            if (err) {
              console.error('Commit Error:', err)
              return db.rollback(() => {
                res
                  .status(500)
                  .json(new ApiError(500, 'Error committing transaction'))
              })
            }
            res
              .status(201)
              .json(
                new ApiResponse(
                  201,
                  req.body,
                  'Project and stages created successfully.'
                )
              )
          })
        })
        .catch((err) => {
          console.error('Stages Insert Error:', err)
          db.rollback(() => {
            res.status(500).json(new ApiError(500, 'Error creating stages'))
          })
        })
    })
  })
})

// Delete a project
export const deleteProject = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id

  const deleteStagesQuery = 'DELETE FROM stage WHERE projectNumber = ?'
  const deleteProjectQuery =
    'DELETE FROM project WHERE projectNumber = ? OR historyOf= ?'

  db.query(deleteStagesQuery, [projectNumber], (stageErr) => {
    if (stageErr) {
      console.error(stageErr)
      return res.status(500).json({ error: 'Error deleting associated stages' })
    }

    db.query(
      deleteProjectQuery,
      [projectNumber, projectNumber],
      (projectErr) => {
        if (projectErr) {
          console.error(projectErr)
          return res.status(500).json({ error: 'Error deleting project' })
        }

        res
          .status(200)
          .json(
            new ApiResponse(
              200,
              projectNumber,
              'Project and associated stages deleted successfully.'
            )
          )
      }
    )
  })
})

// Update project and store history
export const updateProject = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id
  // console.log(req.body)

  // Query to select the current project data
  const selectQuery = `SELECT * FROM project WHERE projectNumber = ?`

  const countHistoryQuery = `SELECT COUNT(*) AS historyCount FROM project WHERE historyOf = ?`

  const insertQuery = `INSERT INTO project (
    projectNumber, companyName, dieName, dieNumber, projectStatus, startDate, endDate, 
    projectType, projectPOLink, projectDesignDocLink, projectCreatedBy, progress, 
    historyOf, updateReason
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

  // Query to update the project
  const updateQuery = `UPDATE project SET 
    companyName = ?, dieName = ?, dieNumber = ?, projectStatus = ?, 
    startDate = ?, endDate = ?, projectType = ?, projectPOLink = ?, 
    projectDesignDocLink = ?, projectCreatedBy = ?, progress = ?,
    timestamp = ?, historyOf = NULL
    WHERE projectNumber = ?`

  db.query(selectQuery, [projectNumber], (err, projectData) => {
    if (err) {
      console.log(err)
      return res.status(500).send(new ApiError(500, 'Error retrieving project'))
    }

    if (projectData.length === 0) {
      return res.status(404).send(new ApiError(404, 'Project not found'))
    }

    const project = projectData[0]

    // Check if any changes are made
    const isChanged = Object.keys(req.body).some(
      (key) => project[key] !== req.body[key]
    )

    if (!isChanged) {
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, 'No changes detected. No action taken.')
        )
    }

    // Count the number of history records for this project
    db.query(countHistoryQuery, [projectNumber], (err, countData) => {
      if (err) {
        console.log(err)
        return res
          .status(500)
          .send(new ApiError(500, 'Error retrieving history count'))
      }

      const historyCount = countData[0].historyCount // Get the number of history entries
      const prefix = String(historyCount + 1).padStart(4, '0') // Generate a 4-digit prefix like 0001, 0002, etc.
      const paddedProjectNumber = String(projectNumber).padStart(7, '0') // Ensure projectNumber is 7 digits (e.g., 0000001)
      const newProjectNumber = prefix + paddedProjectNumber // Combine the history count prefix and the original project number

      // Insert the existing project into history before updating
      const insertValues = [
        newProjectNumber, // The new projectNumber for the history entry
        project.companyName,
        project.dieName,
        project.dieNumber,
        project.projectStatus,
        project.startDate,
        project.endDate,
        project.projectType,
        project.projectPOLink,
        project.projectDesignDocLink,
        project.projectCreatedBy,
        project.progress,
        projectNumber, // historyOf should store the original projectNumber
        req.body.updateReason, // Pass the reason for the update
      ]

      db.query(insertQuery, insertValues, (err, insertData) => {
        if (err) {
          console.log(err)
          return res
            .status(500)
            .send(new ApiError(500, 'Error creating project history'))
        }

        // Keep existing links if no new file is provided
        const projectPOLink = req.files?.projectPOLink
          ? req.files.projectPOLink[0].filename
          : project.projectPOLink
        const projectDesignDocLink = req.files?.projectDesignDocLink
          ? req.files.projectDesignDocLink[0].filename
          : project.projectDesignDocLink

        // Update the project with new values
        const timestamp = new Date(req.body.timestamp)
          .toISOString()
          .replace('T', ' ')
          .replace('Z', '')
        const updateValues = [
          req.body.companyName,
          req.body.dieName,
          req.body.dieNumber,
          req.body.projectStatus,
          req.body.startDate,
          req.body.endDate,
          req.body.projectType,
          projectPOLink,
          projectDesignDocLink,
          req.user[0].employeeId,
          req.body.progress,
          timestamp,
          projectNumber, // The original projectNumber for updating the project
        ]

        db.query(updateQuery, updateValues, (err, updateData) => {
          if (err) {
            console.log(err)
            return res
              .status(500)
              .send(new ApiError(500, 'Error updating project'))
          }

          res
            .status(200)
            .json(
              new ApiResponse(200, updateData, 'Project updated successfully.')
            )
        })
      })
    })
  })
})
