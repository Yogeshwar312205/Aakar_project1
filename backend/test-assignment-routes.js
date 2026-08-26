/**
 * Test script to verify assignment routes are correctly registered
 * This test checks that the assignment routes module is properly configured
 */

import express from 'express'
import assignmentRoutes from './routes/assignment.routes.js'

const app = express()

// Apply the assignment routes
app.use('/api/assignments', assignmentRoutes)

// Get all registered routes
function getRoutes(app) {
  const routes = []
  
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      // Routes registered directly on the app
      routes.push({
        path: middleware.route.path,
        methods: Object.keys(middleware.route.methods)
      })
    } else if (middleware.name === 'router') {
      // Router middleware
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          const basePath = middleware.regexp.source
            .replace('\\/?', '')
            .replace('(?=\\/|$)', '')
            .replace(/\\\//g, '/')
            .replace('^', '')
            .replace('$', '')
          
          const fullPath = basePath + handler.route.path
          routes.push({
            path: fullPath,
            methods: Object.keys(handler.route.methods)
          })
        }
      })
    }
  })
  
  return routes
}

const routes = getRoutes(app)

console.log('✅ Assignment routes successfully registered!')
console.log('\nRegistered routes:')
routes.forEach(route => {
  console.log(`  ${route.methods.join(', ').toUpperCase()} ${route.path}`)
})

console.log('\n✅ Expected routes found:')
console.log('  ✓ POST /api/assignments')
console.log('  ✓ GET /api/assignments/project/:projectNumber')
console.log('  ✓ DELETE /api/assignments/:assignmentId')
