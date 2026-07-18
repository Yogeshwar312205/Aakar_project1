const createCrudFlags = (segment = '', offset = 0) => ({
  add: segment[offset] === '1',
  read: segment[offset + 1] === '1',
  update: segment[offset + 2] === '1',
  delete: segment[offset + 3] === '1',
})

export const getProjectManagementAccess = (employeeAccess = '') => {
  const projectSegment = (employeeAccess.split(',')[1] || '').trim().padEnd(21, '0')
  const moduleEnabled = projectSegment[0] === '1'

  if (!moduleEnabled) {
    return {
      moduleEnabled: false,
      project: createCrudFlags(),
      stage: createCrudFlags(),
      substage: createCrudFlags(),
      bom: createCrudFlags(),
      template: createCrudFlags(),
    }
  }

  return {
    moduleEnabled,
    project: createCrudFlags(projectSegment, 1),      // Bits 1-4
    stage: createCrudFlags(projectSegment, 5),        // Bits 5-8
    substage: createCrudFlags(projectSegment, 9),     // Bits 9-12
    bom: createCrudFlags(projectSegment, 13),         // Bits 13-16
    template: createCrudFlags(projectSegment, 17),    // Bits 17-20
  }
}
