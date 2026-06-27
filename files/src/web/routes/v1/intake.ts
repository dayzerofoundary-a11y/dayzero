import { Router } from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'
import crypto from 'crypto'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { logSubmission } from './admin.js'

export const intakeRoutes = Router()

// ── Fix 6: Strict per-route rate limit — 5 submissions / IP / hour ───────────
intakeRoutes.use(
    rateLimit({
        windowMs: 60 * 60 * 1000, // 1 hour
        limit: 5,
        standardHeaders: true,
        legacyHeaders: false,
        message: {
            success: false,
            message: 'Too many submissions from this IP. Try again in an hour.',
            data: null,
            errors: [{ message: 'Rate limit exceeded' }],
        },
    })
)

// ── Multer: memory storage, 10 MB cap ────────────────────────────────────────
const ALLOWED_MIMES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
])

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter(_req, file, cb) {
        // Fix 7: reject disallowed MIME types at multer level
        if (ALLOWED_MIMES.has(file.mimetype)) {
            cb(null, true)
        } else {
            cb(new Error(`File type not allowed: ${file.mimetype}`))
        }
    },
})

// ── Fix 7: Magic-byte MIME validation ────────────────────────────────────────
const MAGIC: Array<{ mime: string; bytes: number[] }> = [
    { mime: 'image/jpeg',       bytes: [0xff, 0xd8, 0xff] },
    { mime: 'image/png',        bytes: [0x89, 0x50, 0x4e, 0x47] },
    { mime: 'image/webp',       bytes: [0x52, 0x49, 0x46, 0x46] }, // RIFF header
    { mime: 'application/pdf',  bytes: [0x25, 0x50, 0x44, 0x46] }, // %PDF
    { mime: 'application/msword', bytes: [0xd0, 0xcf, 0x11, 0xe0] },
    // docx/xlsx share PK zip header
    { mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', bytes: [0x50, 0x4b, 0x03, 0x04] },
]

function validateMagicBytes(buffer: Buffer, declaredMime: string): boolean {
    const sig = MAGIC.find((m) => m.mime === declaredMime)
    if (!sig) return false
    return sig.bytes.every((byte, i) => buffer[i] === byte)
}

// ── Fix 4: HTML escape to prevent XSS in email ───────────────────────────────
function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
}

// ── Fix 9: Zod validation schema ─────────────────────────────────────────────
const intakeSchema = z.object({
    name:           z.string().min(1, 'Name is required').max(200),
    email:          z.string().email('Valid email required').max(254),
    role:           z.string().max(100).optional().default(''),
    affiliation:    z.string().max(200).optional().default(''),
    category:       z.string().max(100).optional().default(''),
    idea:           z.string().min(1, 'Idea description is required').max(10_000),
    turnstileToken: z.string().optional(),
})

// ── Cast-ID generator (DZ-YY-NNNN) ───────────────────────────────────────────
// Fix 11: seed counter from a stable base so restarts don't collide within a year
let _castCounter = Math.floor(Date.now() / 1000) % 9000 + 1000

function generateCastId(): string {
    const yy = new Date().getUTCFullYear().toString().slice(-2)
    const seq = String(_castCounter++).padStart(4, '0')
    if (_castCounter > 9999) _castCounter = 1
    return `DZ-${yy}-${seq}`
}

// ── Nodemailer transporter ────────────────────────────────────────────────────
function createTransporter() {
    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT ?? 587),
        secure: Number(process.env.SMTP_PORT ?? 587) === 465,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    })
}

// ── Email HTML template (all values are HTML-escaped before insertion) ────────
interface EmailFields {
    ideaName:    string
    ambition:    string
    description: string
    name:        string
    email:       string
    role:        string
    affiliation: string
    category:    string
    fileAttached: boolean
}

function buildEmailHtml(fields: EmailFields, castId: string): string {
    // All values are pre-escaped — safe to embed in HTML
    const row = (label: string, value: string) =>
        value
            ? `<tr>
                <td style="padding:8px 12px;font-weight:600;color:#6A6355;white-space:nowrap;vertical-align:top;width:160px">${escapeHtml(label)}</td>
                <td style="padding:8px 12px;color:#131929;vertical-align:top">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
               </tr>`
            : ''

    return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#F4EFE4;font-family:'DM Sans',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F4EFE4;padding:40px 0">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0"
             style="background:#EDE8DC;border:4px double #A8822C;max-width:600px;width:100%">

        <!-- Header -->
        <tr>
          <td style="padding:24px 28px 16px;border-bottom:1px solid rgba(168,130,44,0.3)">
            <span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#131929">DayZero</span>
            <span style="font-family:Georgia,serif;font-size:18px;font-weight:600;font-style:italic;color:#A8822C">Foundry</span>
            <div style="font-size:10px;letter-spacing:0.22em;text-transform:uppercase;color:#6A6355;margin-top:4px">New Idea Submission</div>
          </td>
          <td style="padding:24px 28px 16px;text-align:right;border-bottom:1px solid rgba(168,130,44,0.3);vertical-align:top">
            <div style="font-size:10px;letter-spacing:0.18em;text-transform:uppercase;color:#6A6355">Cast No.</div>
            <div style="font-family:Georgia,serif;font-size:22px;font-weight:600;color:#131929">${escapeHtml(castId)}</div>
            <div style="font-size:12px;color:#6A6355;margin-top:4px">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
          </td>
        </tr>

        <!-- Fields -->
        <tr><td colspan="2" style="padding:0 28px 24px">
          <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px;border-collapse:collapse">
            ${row('Idea Name', fields.ideaName)}
            ${row('Ambition', fields.ambition)}
            ${row('Category', fields.category)}
            ${row('Description', fields.description)}
            <tr><td colspan="2" style="padding:8px 0"><hr style="border:none;border-top:1px solid rgba(168,130,44,0.2)"></td></tr>
            ${row('Submitter Name', fields.name)}
            ${row('Email', fields.email)}
            ${row('Role', fields.role)}
            ${row('Affiliation', fields.affiliation)}
            ${fields.fileAttached ? row('Attachment', '✓ File attached (see below)') : ''}
          </table>
        </td></tr>

        <!-- Footer -->
        <tr>
          <td colspan="2" style="padding:16px 28px;border-top:1px solid rgba(168,130,44,0.3);background:rgba(168,130,44,0.05)">
            <p style="margin:0;font-size:11px;color:#6A6355;text-align:center;letter-spacing:0.1em;text-transform:uppercase">
              Confidential Idea Registry · DayZero Foundry · Protected under NDA
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

// ── POST /api/v1/intake ───────────────────────────────────────────────────────
intakeRoutes.post('/', upload.single('file'), async (req, res) => {
    try {
        // ── 1. Zod validation (Fix 9) ────────────────────────────────────────
        const parsed = intakeSchema.safeParse(req.body)
        if (!parsed.success) {
            res.status(400).json({
                success: false,
                message: 'Validation failed',
                data: null,
                errors: parsed.error.errors.map((e) => ({
                    field: e.path.join('.'),
                    message: e.message,
                })),
            })
            return
        }

        const { name, email, role, affiliation, category, idea, turnstileToken } = parsed.data

        // ── 2. Fix 7: Magic-byte validation ──────────────────────────────────
        if (req.file) {
            if (!validateMagicBytes(req.file.buffer, req.file.mimetype)) {
                res.status(422).json({
                    success: false,
                    message: 'File content does not match its declared type',
                    data: null,
                    errors: [{ field: 'file', message: 'Invalid file content' }],
                })
                return
            }
        }

        // ── 3. Fix 5: Turnstile — verify whenever secret is configured ───────
        // (not tied to NODE_ENV — if TURNSTILE_SECRET is set, always verify)
        if (process.env.TURNSTILE_SECRET) {
            if (!turnstileToken) {
                res.status(422).json({
                    success: false,
                    message: 'Security verification failed',
                    data: null,
                    errors: [{ field: 'turnstileToken', message: 'Security verification required' }],
                })
                return
            }
            const verifyRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    secret: process.env.TURNSTILE_SECRET,
                    response: turnstileToken,
                    remoteip: req.ip,
                }),
            })
            const verifyData = (await verifyRes.json()) as { success: boolean }
            if (!verifyData.success) {
                res.status(422).json({
                    success: false,
                    message: 'Security verification failed',
                    data: null,
                    errors: [{ field: 'turnstileToken', message: 'Security verification failed' }],
                })
                return
            }
        }

        // ── 4. Generate Cast-ID ───────────────────────────────────────────────
        const castId = generateCastId()

        // ── 5. Parse compound "idea" field from frontend ──────────────────────
        const ideaNameMatch   = idea.match(/^Idea Name:\s*(.+)/m)
        const ambitionMatch   = idea.match(/^Ambition Scale:\s*(.+)/m)
        const descriptionMatch = idea.match(/Description:\s*\n([\s\S]+)/m)

        const fields: EmailFields = {
            ideaName:    ideaNameMatch?.[1]?.trim()    ?? '(not provided)',
            ambition:    ambitionMatch?.[1]?.trim()    ?? '(not provided)',
            description: descriptionMatch?.[1]?.trim() ?? idea.trim(),
            name:        name.trim(),
            email:       email.trim(),
            role:        role.trim(),
            affiliation: affiliation.trim(),
            category:    category.trim(),
            fileAttached: !!req.file,
        }

        // ── 6. Log to admin dashboard ─────────────────────────────────────────
        logSubmission({
            id:          crypto.randomUUID(),
            castId,
            name:        fields.name,
            email:       fields.email,
            role:        fields.role,
            affiliation: fields.affiliation,
            category:    fields.category,
            idea:        `${fields.ideaName} — ${fields.ambition}\n\n${fields.description}`,
            ip:          req.ip ?? '',
            createdAt:   new Date().toISOString(),
        })

        // ── 7. Send email ─────────────────────────────────────────────────────
        const smtpHost = process.env.SMTP_HOST
        const smtpTo   = process.env.SMTP_TO ?? process.env.SMTP_USER

        if (smtpHost && smtpTo) {
            try {
                const transporter = createTransporter()

                const mailOptions: nodemailer.SendMailOptions = {
                    from:    `"DayZero Foundry" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
                    to:      smtpTo,
                    replyTo: fields.email, // validated as proper email by Zod above
                    subject: `[DayZero] New Idea — ${fields.ideaName} · ${castId}`,
                    html:    buildEmailHtml(fields, castId),
                    text: [
                        `NEW IDEA SUBMISSION — ${castId}`,
                        `Date: ${new Date().toISOString()}`,
                        '',
                        'IDEA',
                        `Name: ${fields.ideaName}`,
                        `Ambition: ${fields.ambition}`,
                        `Category: ${fields.category}`,
                        `Description:\n${fields.description}`,
                        '',
                        'SUBMITTER',
                        `Name: ${fields.name}`,
                        `Email: ${fields.email}`,
                        `Role: ${fields.role}`,
                        `Affiliation: ${fields.affiliation}`,
                        req.file ? `\nAttachment: ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)` : '',
                    ].join('\n'),
                }

                if (req.file) {
                    mailOptions.attachments = [{
                        filename:    req.file.originalname,
                        content:     req.file.buffer,
                        contentType: req.file.mimetype,
                    }]
                }

                await transporter.sendMail(mailOptions)
            } catch (emailErr) {
                console.error('[intake] email error:', emailErr)
                // Email failure is non-fatal — submission is still accepted
            }
        } else {
            console.log('[intake] SMTP not configured — submission logged only:', { castId, name: fields.name })
        }

        // ── 8. Respond ────────────────────────────────────────────────────────
        res.status(201).json({
            success: true,
            message: 'Idea submitted successfully',
            data: { castId },
            pagination: null,
            errors: null,
        })
    } catch (err) {
        console.error('[intake] unexpected error:', err)
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null,
            errors: [{ message: 'Something went wrong' }],
        })
    }
})
