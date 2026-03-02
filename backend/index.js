import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import departmentRoute from './routes/department.route.js'
import employeeRoute from './routes/employee.route.js'
import cookieParser from 'cookie-parser'
import authRoutes from './routes/auth.routes.js'
import designationRoute from './routes/designation.route.js'
import activityRoute from './routes/activity.routes.js'
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
import substagesMasterRoutes from './routes/substagesMaster.routes.js'
import stageTemplateRoutes from './routes/stageTemplate.routes.js'
import morgan from "morgan"

import bomRoute from './routes/bom.route.js';

import inventoryRoute from './routes/inventory.route.js';
import transactionRoute from './routes/transactions.route.js';



const app = express()


app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:5174'], // Your frontend URL (adjust port if necessary)
    credentials: true, // Allow credentials like cookies to be sent
  })
)


dotenv.config({ path: './.env' })
app.use(morgan("dev"))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static('uploads'))
app.use(express.static('public'))
app.use(cookieParser())



const port = process.env.PORT || 3000

app.listen(port, '0.0.0.0', () => {
  console.log('Server running on port: ' + port)
})

app.use('/api/v1/auth/', authRoutes)
app.use('/api/v1/department/', departmentRoute)
app.use('/api/v1/employee/', employeeRoute)
app.use('/api/v1/designation/', designationRoute)

app.use('/api', projectRoutes)
app.use('/api', stageRoutes)
app.use('/api', substageRoutes)
app.use('/api/v1', substagesMasterRoutes)
app.use('/api', stageTemplateRoutes)
app.use('/api/', activityRoute)

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

app.use("/api/v1/bom/",bomRoute);

app.use("/api/v1/inventory", inventoryRoute);
app.use("/api/v1/transactions",transactionRoute);

app.use("/api/v1/activity", activityRoute);
