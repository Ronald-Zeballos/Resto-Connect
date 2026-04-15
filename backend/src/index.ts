import express from 'express'
import 'reflect-metadata'
import routes from './infrastructure/http/routes'

const app = express()
const PORT = process.env.PORT || 3000

// ============ PARSERS FIRST ============
// IMPORTANTE: Los parsers deben estar ANTES del logging middleware
// para que req.body esté disponible
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// ============ LOGGING MIDDLEWARE ============
app.use((req, res, next) => {
  const timestamp = new Date().toISOString()
  console.log(`\n📩 [${timestamp}] ${req.method} ${req.path}`)
  
  // Solo loguear body si existe y tiene contenido
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('📦 Body:', JSON.stringify(req.body, null, 2))
  }
  
  // Interceptar response para loguear
  const origSend = res.send
  res.send = function (data) {
    console.log(`✅ Response Status: ${res.statusCode}`)
    if (typeof data === 'string') {
      try {
        const parsed = JSON.parse(data)
        console.log('📄 Response:', JSON.stringify(parsed, null, 2))
      } catch (e) {
        console.log('📄 Response:', data.substring(0, 200))
      }
    }
    return origSend.call(this, data)
  }
  
  next()
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() })
})

// API Routes
console.log('📌 Registro de rutas /api')
app.use('/api', routes)

// 404 Handler
app.use((req, res) => {
  console.warn(`⚠️ 404 NOT FOUND: ${req.method} ${req.path}`)
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    method: req.method,
  })
})

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('💥 ERROR:', err)
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`📚 API: http://localhost:${PORT}/api`)
})

export default app
