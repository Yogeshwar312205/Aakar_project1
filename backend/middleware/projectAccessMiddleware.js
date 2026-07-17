const accessOffsets = {
  project: { add: 1, read: 2, update: 3, delete: 4 },
  stage: { add: 5, read: 6, update: 7, delete: 8 },
  substage: { add: 9, read: 10, update: 11, delete: 12 },
}

const getEmployeeRecord = (user) => {
  if (Array.isArray(user)) {
    return user[0] || null
  }
  return user || null
}

const getProjectAccessSegment = (user) => {
  const employee = getEmployeeRecord(user)
  const employeeAccess = employee?.employeeAccess || ''
  return (employeeAccess.split(',')[1] || '').trim().padEnd(13, '0')
}

export const requireProjectAccess = (entity, operation) => {
  return (req, res, next) => {
    const entityAccess = accessOffsets[entity]
    const accessIndex = entityAccess?.[operation]

    if (!accessIndex) {
      return res.status(500).json({ message: 'Invalid access rule configuration' })
    }

    const segment = getProjectAccessSegment(req.user)
    const moduleEnabled = segment[0] === '1'

    if (!moduleEnabled || segment[accessIndex] !== '1') {
      return res.status(403).json({
        message: `You do not have ${operation} access for ${entity} management.`,
      })
    }

    next()
  }
}
