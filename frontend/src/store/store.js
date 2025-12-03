import { configureStore } from '@reduxjs/toolkit'
import authReducer from '../features/authSlice.js'
import employeeReducer from '../features/employeeSlice.js'
import designationReducer from '../features/designationSlice.js'
import departmentReducer from '../features/departmentSlice.js'
import { projectsReducer } from '../features/projectSlice'
import { stageReducer } from '../features/stageSlice'
import { substageReducer } from '../features/subStageSlice.js'

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    designation: designationReducer,
    department: departmentReducer,
    projects: projectsReducer,
    stages: stageReducer,
    substages: substageReducer,
  },
})

export default store
