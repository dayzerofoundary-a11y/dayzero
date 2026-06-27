import type { Express } from 'express'
import { router as apiRouter } from './router.js'


export function registerRoutes(app: Express) {
    app.use('/api', apiRouter)

    app.get('/healthz', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'ok',
            data: null,
        })
    })
}

