import type { Express } from 'express'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import type { } from 'morgan'

import rateLimit from 'express-rate-limit'

import { notFoundHandler } from './errors/notFound.js'
import { errorHandler } from './errors/errorHandler.js'
import { registerRoutes } from './routes/index.js'


export function initApp(app: Express) {
    // Security
    app.use(helmet())
    // Fix 8: CORS — never default to wildcard; only allow explicitly listed origins
    app.use(
        cors({
            origin: process.env.CORS_ORIGIN
                ? process.env.CORS_ORIGIN.split(',').map((s) => s.trim())
                : ['http://127.0.0.1:5173', 'http://localhost:5173'],
            credentials: true,
        })
    )

    // Parsing
    app.use(express.json({ limit: '2mb' }))
    app.use(express.urlencoded({ extended: true, limit: '2mb' }))

    // Performance
    app.use(compression())

    // Logging
    app.use(morgan(process.env.MORGAN_FORMAT ?? 'combined'))

    // Rate limit (baseline)
    app.use(
        rateLimit({
            windowMs: 15 * 60 * 1000,
            limit: Number(process.env.RATE_LIMIT_WINDOW_LIMIT ?? 300),
            standardHeaders: true,
            legacyHeaders: false,
        })
    )

    // Routes
    registerRoutes(app)

    // 404 + errors
    app.use(notFoundHandler)
    app.use(errorHandler)
}

