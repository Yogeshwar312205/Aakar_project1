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

  const projectPOLink = req.files?.projectPOLink
    ? req.files.projectPOLink[0].filename
    : null
  const projectDesignDocLink = req.files?.projectDesignDocLink
    ? req.files.projectDesignDocLink[0].filename
    : null

  const projectValues = [
    req.body.projectNumber,
    req.body.companyName,
    req.body.dieName,
    req.body.dieNumber,
    req.body.projectStatus,
    req.body.startDate || null,
    req.body.endDate || null,
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
      const today = new Date().toISOString().split('T')[0]
      const stageInserts = stages.map((stage) => {
        return new Promise((resolve, reject) => {
          // Extract customEmployeeId from owner field
          const ownerStr = stage.owner || ''
          const match = ownerStr.match(/\(([^)]+)\)/) // Extracts customEmployeeId
          const customEmployeeId = match ? match[1] : null

          // If no owner provided, insert stage with null owner
          if (!customEmployeeId) {
            const stageValues = [
              projectNumber,
              stage.stageName,
              stage.startDate || today,
              stage.endDate || today,
              null, // No owner
              stage.machine || '',
              stage.duration || 0,
              null, // seqPrevStage will be updated later
              req.user[0].employeeId,
              stage.progress || 0,
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
              stage.startDate || today,
              stage.endDate || today,
              employeeId, // Use employeeId instead of customEmployeeId
              stage.machine || '',
              stage.duration || 0,
              null, // seqPrevStage will be updated later
              req.user[0].employeeId,
              stage.progress || 0,
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

          return Promise.all(updatePromises).then(() => insertedStages)
        })
        .then((insertedStages) => {
          // Now insert substages for each stage
          const substageQuery = `INSERT INTO substage (
            stageId, projectNumber, substageName, startDate, endDate, owner, 
            machine, duration, createdBy, progress, parentSubstageId
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

          // Helper function to get employeeId from owner string
          const getEmployeeId = (ownerStr) => {
            return new Promise((resolve, reject) => {
              if (!ownerStr) {
                resolve(null)
                return
              }
              const match = ownerStr.match(/\(([^)]+)\)/)
              const customEmployeeId = match ? match[1] : null
              if (!customEmployeeId) {
                resolve(null)
                return
              }
              const employeeQuery = `SELECT employeeId FROM employee WHERE customEmployeeId = ?`
              db.query(employeeQuery, [customEmployeeId], (err, result) => {
                if (err || result.length === 0) {
                  resolve(null)
                } else {
                  resolve(result[0].employeeId)
                }
              })
            })
          }

          // Recursive function to insert substages
          const insertSubstagesRecursive = async (substages, stageId, parentSubstageId = null) => {
            if (!substages || substages.length === 0) return []

            const insertedSubstages = []
            const today = new Date().toISOString().split('T')[0]
            for (const substage of substages) {
              const employeeId = await getEmployeeId(substage.owner)
              const substageValues = [
                stageId,
                projectNumber,
                substage.substageName || substage.stageName || '',
                substage.startDate || today,
                substage.endDate || today,
                employeeId || req.user[0].employeeId, // Default to createdBy if no owner
                substage.machine || '',
                substage.duration || 0,
                req.user[0].employeeId,
                substage.progress || 0,
                parentSubstageId,
              ]

              const insertedSubstage = await new Promise((resolve, reject) => {
                db.query(substageQuery, substageValues, (err, result) => {
                  if (err) {
                    console.error('Substage insert error:', err)
                    reject(err)
                  } else {
                    resolve({ ...substage, substageId: result.insertId })
                  }
                })
              })

              insertedSubstages.push(insertedSubstage)

              // Recursively insert child substages
              if (substage.substages && substage.substages.length > 0) {
                await insertSubstagesRecursive(
                  substage.substages,
                  stageId,
                  insertedSubstage.substageId
                )
              }
            }
            return insertedSubstages
          }

          // Insert substages for all stages
          const allSubstageInserts = insertedStages.map((stage) => {
            if (stage.substages && stage.substages.length > 0) {
              return insertSubstagesRecursive(stage.substages, stage.stageId, null)
            }
            return Promise.resolve([])
          })

          return Promise.all(allSubstageInserts)
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
                  'Project, stages, and substages created successfully.'
                )
              )
          })
        })
        .catch((err) => {
          console.error('Stages/Substages Insert Error:', err)
          db.rollback(() => {
            res.status(500).json(new ApiError(500, 'Error creating stages or substages'))
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

// Get full project history (all stage + substage changes)
export const getProjectHistory = asyncHandler(async (req, res) => {
  const projectNumber = req.params.id

  // Get project creation info
  const projectCreationQuery = `
    SELECT 
      'project' as type,
      p.projectNumber as itemId,
      CONCAT(p.companyName, ' - ', p.dieName) as itemName,
      'Project created' as updateReason,
      p.timestamp,
      p.timestamp as createdAt,
      p.progress,
      p.startDate,
      p.endDate,
      p.projectStatus as status,
      p.projectType,
      p.companyName,
      p.dieName,
      p.dieNumber,
      e.employeeName as updatedBy,
      e.employeeName as createdBy,
      NULL as ownerName,
      NULL as machine,
      NULL as duration,
      NULL as historyOf,
      'created' as action,
      NULL as parentStageName
    FROM project p
    LEFT JOIN employee e ON p.projectCreatedBy = e.employeeId
    WHERE p.projectNumber = ? AND p.historyOf IS NULL
  `

  // Get project version history
  const projectHistoryQuery = `
    SELECT 
      'project' as type,
      p.projectNumber as itemId,
      CONCAT(p.companyName, ' - ', p.dieName) as itemName,
      p.updateReason,
      p.timestamp,
      p.timestamp as createdAt,
      p.progress,
      p.startDate,
      p.endDate,
      p.projectStatus as status,
      p.projectType,
      p.companyName,
      p.dieName,
      p.dieNumber,
      e.employeeName as updatedBy,
      e.employeeName as createdBy,
      NULL as ownerName,
      NULL as machine,
      NULL as duration,
      p.historyOf,
      'updated' as action,
      NULL as parentStageName
    FROM project p
    LEFT JOIN employee e ON p.projectCreatedBy = e.employeeId
    WHERE p.historyOf = ?
  `

  // Get ALL stages (both current and historical)
  const stageQuery = `
    SELECT 
      'stage' as type,
      s.stageId as itemId,
      s.stageName as itemName,
      s.updateReason,
      s.timestamp,
      s.timestamp as createdAt,
      s.progress,
      s.startDate,
      s.endDate,
      NULL as status,
      NULL as projectType,
      NULL as companyName,
      NULL as dieName,
      NULL as dieNumber,
      creator.employeeName as updatedBy,
      creator.employeeName as createdBy,
      owner.employeeName as ownerName,
      s.machine,
      s.duration,
      s.historyOf,
      CASE 
        WHEN s.progress >= 100 THEN 'completed'
        WHEN s.historyOf IS NOT NULL THEN 'updated'
        ELSE 'created'
      END as action,
      NULL as parentStageName
    FROM stage s
    LEFT JOIN employee creator ON s.createdBy = creator.employeeId
    LEFT JOIN employee owner ON s.owner = owner.employeeId
    WHERE s.projectNumber = ?
    ORDER BY s.timestamp DESC
  `

  // Get ALL substages (both current and historical)
  const substageQuery = `
    SELECT 
      'substage' as type,
      ss.substageId as itemId,
      ss.substageName as itemName,
      ss.updateReason,
      ss.timestamp,
      ss.timestamp as createdAt,
      ss.progress,
      ss.startDate,
      ss.endDate,
      NULL as status,
      NULL as projectType,
      NULL as companyName,
      NULL as dieName,
      NULL as dieNumber,
      creator.employeeName as updatedBy,
      creator.employeeName as createdBy,
      owner.employeeName as ownerName,
      ss.machine,
      ss.duration,
      ss.historyOf,
      CASE 
        WHEN ss.progress >= 100 THEN 'completed'
        WHEN ss.historyOf IS NOT NULL THEN 'updated'
        ELSE 'created'
      END as action,
      st.stageName as parentStageName
    FROM substage ss
    LEFT JOIN employee creator ON ss.createdBy = creator.employeeId
    LEFT JOIN employee owner ON ss.owner = owner.employeeId
    LEFT JOIN stage st ON ss.stageId = st.stageId
    WHERE ss.projectNumber = ?
    ORDER BY ss.timestamp DESC
  `

  // Execute all queries
  const executeQuery = (query, params) => {
    return new Promise((resolve, reject) => {
      db.query(query, params, (err, data) => {
        if (err) reject(err)
        else resolve(data)
      })
    })
  }

  try {
    const [projectCreation, projectHistory, stages, substages] = await Promise.all([
      executeQuery(projectCreationQuery, [projectNumber]),
      executeQuery(projectHistoryQuery, [projectNumber]),
      executeQuery(stageQuery, [projectNumber]),
      executeQuery(substageQuery, [projectNumber]),
    ])

    // Combine all history entries
    let allHistory = [
      ...projectCreation,
      ...projectHistory,
      ...stages,
      ...substages,
    ]

    // Format dates and sort by timestamp (newest first)
    allHistory = allHistory
      .map((item) => ({
        ...item,
        startDate: item.startDate ? new Date(item.startDate).toLocaleDateString('en-CA') : null,
        endDate: item.endDate ? new Date(item.endDate).toLocaleDateString('en-CA') : null,
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : null,
      }))
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 200) // Limit to 200 entries

    res.status(200).json(new ApiResponse(200, allHistory, 'Project history retrieved.'))
  } catch (err) {
    console.error('Error fetching project history:', err)
    return res.status(500).send(new ApiError(500, 'Error fetching history'))
  }
})
