import { Router } from 'express'
import crypto from 'crypto'
import type { Request, Response, NextFunction } from 'express'
import { prisma } from '../../../lib/prisma.js'

import nodemailer from 'nodemailer'

export const adminRoutes = Router()

adminRoutes.get('/test-email', async (req: Request, res: Response) => {
    try {
        const smtpHost = process.env.SMTP_HOST
        const smtpPort = Number(process.env.SMTP_PORT ?? 587)
        const smtpUser = process.env.SMTP_USER
        const smtpPass = process.env.SMTP_PASS
        const smtpFrom = process.env.SMTP_FROM ?? smtpUser
        const smtpTo = process.env.SMTP_TO ?? smtpUser

        if (!smtpHost || !smtpUser || !smtpPass) {
            res.status(400).json({
                success: false,
                message: 'SMTP is not configured. Missing environment variables.',
                config: { smtpHost, smtpPort, smtpUser, hasPassword: !!smtpPass }
            })
            return
        }

        const transporter = nodemailer.createTransport({
            host: smtpHost,
            port: smtpPort,
            secure: smtpPort === 465,
            auth: {
                user: smtpUser,
                pass: smtpPass,
            },
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 20000,
            family: 4,
        } as any)

        await transporter.verify()

        await transporter.sendMail({
            from: `"DayZero Test" <${smtpFrom}>`,
            to: smtpTo,
            subject: '[DayZero] Test Email',
            text: 'This is a test email from the DayZero diagnostic endpoint to confirm SMTP delivery works!',
        })

        res.json({
            success: true,
            message: `SMTP connection and test email sent successfully to: ${smtpTo}`,
            config: { smtpHost, smtpPort, smtpUser, smtpFrom, smtpTo }
        })
    } catch (err: any) {
        console.error('[test-email] failed:', err)
        res.status(500).json({
            success: false,
            message: 'SMTP Verification Failed',
            error: err?.message || String(err),
            stack: err?.stack,
            config: {
                SMTP_HOST: process.env.SMTP_HOST,
                SMTP_PORT: process.env.SMTP_PORT,
                SMTP_USER: process.env.SMTP_USER,
                SMTP_FROM: process.env.SMTP_FROM,
                SMTP_TO: process.env.SMTP_TO,
                hasPassword: !!process.env.SMTP_PASS
            }
        })
    }
})

// ── In-memory token store (process-scoped, sufficient for single-instance) ───
// Token → expiry timestamp. Tokens expire after 8 hours.
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000
const activeTokens = new Map<string, number>()

// Purge expired tokens periodically to avoid unbounded growth
setInterval(() => {
    const now = Date.now()
    for (const [tok, exp] of activeTokens.entries()) {
        if (exp < now) activeTokens.delete(tok)
    }
}, 60 * 60 * 1000)

// ── Auth middleware — verifies Bearer token issued by /admin/login ────────────
function requireAdminToken(req: Request, res: Response, next: NextFunction) {
    const header = req.headers['authorization'] ?? ''
    const token = header.startsWith('Bearer ') ? header.slice(7) : ''
    const expiry = activeTokens.get(token)
    if (!token || !expiry || expiry < Date.now()) {
        res.status(401).json({
            success: false,
            message: 'Unauthorised — invalid or expired session token',
            data: null,
            errors: [{ code: 'TOKEN_EXPIRED' }],
        })
        return
    }
    next()
}

// ── POST /api/v1/admin/login ─────────────────────────────────────────────────
// Verifies the admin password server-side and issues a short-lived token.
// The password is NEVER sent to the client — comparison happens here only.
adminRoutes.post('/login', (req: Request, res: Response) => {
    const { password } = req.body as { password?: string }
    const adminPassword = process.env.ADMIN_PASSWORD

    if (!adminPassword || adminPassword === 'change-me') {
        res.status(503).json({
            success: false,
            message: 'Admin password not configured on this server',
            data: null,
            errors: [{ message: 'Set ADMIN_PASSWORD in the server .env file' }],
        })
        return
    }

    if (!password || typeof password !== 'string') {
        res.status(400).json({
            success: false,
            message: 'Password is required',
            data: null,
            errors: [{ field: 'password', message: 'Required' }],
        })
        return
    }

    // Constant-time comparison prevents timing attacks
    const expected = Buffer.from(adminPassword)
    const provided = Buffer.from(password)
    const match =
        expected.length === provided.length &&
        crypto.timingSafeEqual(expected, provided)

    if (!match) {
        res.status(401).json({
            success: false,
            message: 'Invalid password',
            data: null,
            errors: [{ message: 'Invalid password' }],
        })
        return
    }

    // Issue a 32-byte random token valid for 8 hours
    const token = crypto.randomBytes(32).toString('hex')
    activeTokens.set(token, Date.now() + TOKEN_TTL_MS)

    res.status(200).json({
        success: true,
        message: 'Authenticated',
        data: { token, expiresIn: TOKEN_TTL_MS / 1000 },
        pagination: null,
        errors: null,
    })
})

// ── All routes below require a valid admin token ──────────────────────────────
adminRoutes.use(requireAdminToken)

// ── POST /api/v1/admin/logout ────────────────────────────────────────────────
adminRoutes.post('/logout', (req: Request, res: Response) => {
    const token = req.headers['authorization']?.slice(7) ?? ''
    activeTokens.delete(token)
    res.status(200).json({ success: true, message: 'Logged out', data: null, pagination: null, errors: null })
})

// ── GET /api/v1/admin/submissions ────────────────────────────────────────────
// Returns in-memory submission log. In a production system this would query
// the database. Submissions are accumulated here until the process restarts.
const submissionLog: Array<{
    id: string
    castId: string
    name: string
    email: string
    role: string
    affiliation: string
    category: string
    idea: string
    ip: string
    createdAt: string
}> = []

// Export so intake.ts can append to it
export function logSubmission(entry: (typeof submissionLog)[number]) {
    submissionLog.unshift(entry) // newest first
    if (submissionLog.length > 1000) submissionLog.pop() // cap at 1000
}

adminRoutes.get('/submissions', async (_req: Request, res: Response) => {
    try {
        const submissions = await prisma.submission.findMany({
            orderBy: { createdAt: 'desc' },
            include: { files: true }
        })

        // Serialize BigInt safely for JSON
        const serialized = submissions.map(sub => ({
            ...sub,
            files: sub.files.map(f => ({
                ...f,
                bytes: f.bytes ? Number(f.bytes) : null
            }))
        }))

        res.status(200).json({
            success: true,
            message: 'OK',
            data: serialized,
            pagination: { total: serialized.length },
            errors: null,
        })
    } catch (err: any) {
        console.error('[admin] fetch submissions error:', err)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch submissions',
            data: null,
            errors: [{ message: 'Database error' }]
        })
    }
})

// ── GET /api/v1/admin/dashboard ──────────────────────────────────────────────
adminRoutes.get('/dashboard', async (_req: Request, res: Response) => {
    try {
        const totalSubmissions = await prisma.submission.count()
        const latestSubmission = await prisma.submission.findFirst({
            orderBy: { createdAt: 'desc' },
            include: { files: true }
        })

        const serializedLatest = latestSubmission ? {
            ...latestSubmission,
            files: latestSubmission.files.map(f => ({
                ...f,
                bytes: f.bytes ? Number(f.bytes) : null
            }))
        } : null

        res.status(200).json({
            success: true,
            message: 'OK',
            data: {
                totalSubmissions,
                latestSubmission: serializedLatest,
            },
            pagination: null,
            errors: null,
        })
    } catch (err) {
        console.error('[admin] fetch dashboard error:', err)
        res.status(500).json({
            success: false,
            message: 'Failed to fetch dashboard stats',
            data: null,
            errors: [{ message: 'Database error' }]
        })
    }
})
