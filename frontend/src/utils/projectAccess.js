const createCrudFlags = (segment = '', offset = 0) => ({
  add: segment[offset] === '1',
  read: segment[offset + 1] === '1',
  update: segment[offset + 2] === '1',
  delete: segment[offset + 3] === '1',
})

export const getProjectManagementAccess = (employeeAccess = '') => {
  const projectSegment = (employeeAccess.split(',')[1] || '').trim().padEnd(13, '0')
  const moduleEnabled = projectSegment[0] === '1'

  if (!moduleEnabled) {
    return {
      moduleEnabled: false,
      project: createCrudFlags(),
      stage: createCrudFlags(),
      substage: createCrudFlags(),
    }
  }

  return {
    moduleEnabled,
    project: createCrudFlags(projectSegment, 1),
    stage: createCrudFlags(projectSegment, 5),
    substage: createCrudFlags(projectSegment, 9),
  }
}
