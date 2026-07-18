const createCrudFlags = (segment = '', offset = 0) => ({
  add: segment[offset] === '1',
  read: segment[offset + 1] === '1',
  update: segment[offset + 2] === '1',
  delete: segment[offset + 3] === '1',
})

export const getHRManagementAccess = (employeeAccess = '') => {
  const hrSegment = (employeeAccess.split(',')[0] || '').trim().padEnd(13, '0')
  const moduleEnabled = hrSegment[0] === '1'

  if (!moduleEnabled) {
    return {
      moduleEnabled: false,
      employee: createCrudFlags(),
      department: createCrudFlags(),
      designation: createCrudFlags(),
    }
  }

  return {
    moduleEnabled,
    employee: createCrudFlags(hrSegment, 1),      // Bits 1-4
    department: createCrudFlags(hrSegment, 5),    // Bits 5-8
    designation: createCrudFlags(hrSegment, 9),   // Bits 9-12
  }
}
