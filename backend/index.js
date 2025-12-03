import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import departmentRoute from './routes/department.route.js'
import employeeRoute from './routes/employee.route.js'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import designationRoute from './routes/designation.route.js'
import server from './routes/server.js'

// Ticket Import routes
import ticketsRoutes from './ticketRoutes/tickets.js'
import issueTypeRoutes from './ticketRoutes/issue_type.js'
import ticketAssigneeHistoryRoutes from './ticketRoutes/ticketAssigneeHistory.js'
import logsRoutes from './ticketRoutes/logs.js'

import ticketStatusHistoryRoutes from './ticketRoutes/ticketStatusHistory.js'
import ticketTitlesRoutes from './ticketRoutes/ticket_title.js'
import basicSolutionsRoutes from './ticketRoutes/basic_solution.js'
import sendMailToRoutes from './ticketRoutes/sendMailTo.js'
import ticketDepartmentRoutes from './ticketRoutes/department.js'
import ticketEmployeeRoutes from './ticketRoutes/employee.js'

import projectRoutes from './routes/project.routes.js'
import stageRoutes from './routes/stage.routes.js'
import substageRoutes from './routes/substage.routes.js'

const app = express()
const ip = '127.0.0.1'

dotenv.config({ path: './.env' })

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('uploads'))
app.use(express.static('public'))
app.use(cookieParser())
app.use('/ticketRoutes/uploads', express.static('ticketRoutes/uploads'));

app.use(
  cors({
    origin: `http://${ip}:5173`, // Your frontend URL (adjust port if necessary)
    // origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true, // Allow credentials like cookies to be sent
  })
)


const port = process.env.PORT || 3000

app.listen(port, ip, () => {
  console.log('Server running on port: ' + port)
})

app.use('/api/v1/auth/', authRoutes)
app.use('/api/v1/department/', departmentRoute)
app.use('/api/v1/employee/', employeeRoute)
app.use('/api/v1/designation/', designationRoute)

app.use('/api', projectRoutes)
app.use('/api', stageRoutes)
app.use('/api', substageRoutes)

app.use(server)

app.use('/tickets', ticketsRoutes)
app.use('/issue_type', issueTypeRoutes)
app.use('/ticketAssigneeHistory', ticketAssigneeHistoryRoutes)
app.use('/logs', logsRoutes)
app.use('/ticketStatusHistory', ticketStatusHistoryRoutes)
app.use('/ticketTitles', ticketTitlesRoutes)
app.use('/basicSolutions', basicSolutionsRoutes)
app.use('/sendMailTo', sendMailToRoutes)
app.use('/department', ticketDepartmentRoutes)
app.use('/employee', ticketEmployeeRoutes)
