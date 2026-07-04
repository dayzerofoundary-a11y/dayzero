import { Router } from 'express'
import multer from 'multer'
import nodemailer from 'nodemailer'
import rateLimit from 'express-rate-limit'
import { z } from 'zod'
import { logSubmission } from './admin.js'
import { prisma } from '../../../lib/prisma.js'
import { uploadToCloudinary, deleteFromCloudinary } from '../../../lib/cloudinary.js'

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
    signature:      z.string().optional(),
})

// ── Cast-ID generator (DZ-YY-NNNN) ───────────────────────────────────────────
async function generateCastId(): Promise<string> {
    const yy = new Date().getUTCFullYear().toString().slice(-2)
    const yearPrefix = `DZ-${yy}-`
    
    // Find the latest submission with this year prefix in the database
    const latest = await prisma.submission.findFirst({
        where: {
            castId: {
                startsWith: yearPrefix
            }
        },
        orderBy: {
            castId: 'desc'
        }
    })
    
    let nextSeq = 1
    if (latest) {
        const parts = latest.castId.split('-')
        const lastSeqStr = parts[parts.length - 1]
        const lastSeq = parseInt(lastSeqStr, 10)
        if (!isNaN(lastSeq)) {
            nextSeq = lastSeq + 1
        }
    }
    
    const seq = String(nextSeq).padStart(4, '0')
    return `${yearPrefix}${seq}`
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
        connectionTimeout: 10000,
        greetingTimeout: 10000,
        socketTimeout: 20000,
        family: 4,
    } as any)
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

function buildEmailHtml(fields: EmailFields, castId: string, hasSignature: boolean): string {
    const row = (label: string, value: string) =>
        value
            ? `<tr style="border-bottom: 1px solid rgba(19, 25, 41, 0.05)">
                <td style="padding: 10px 14px; font-weight: 600; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #A8822C; vertical-align: top; width: 150px;">${escapeHtml(label)}</td>
                <td style="padding: 10px 14px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14px; color: #131929; vertical-align: top;">${escapeHtml(value).replace(/\n/g, '<br>')}</td>
               </tr>`
            : ''

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { background-color: #0D1220; margin: 0; padding: 0; }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0D1220; -webkit-font-smoothing: antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0D1220; padding: 40px 0; width: 100%;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #F4EFE4; border: 1px solid rgba(168, 130, 44, 0.45); max-width: 600px; width: 100%; box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);">
          
          <!-- Navy Gold Header -->
          <tr>
            <td style="background-color: #131929; border-bottom: 3px solid #A8822C; padding: 30px 35px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 26px; font-weight: 700; color: #F4EFE4; letter-spacing: 0.02em;">DayZero</span>
                    <span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 18px; font-weight: 600; font-style: italic; color: #C9A24A;">Foundary</span>
                    <div style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.25em; text-transform: uppercase; color: rgba(244, 239, 228, 0.65); margin-top: 6px;">
                      Stealth Registry Record
                    </div>
                  </td>
                  <td align="right" style="vertical-align: top;">
                    <div style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.15em; text-transform: uppercase; color: #C9A24A;">Registry Reference</div>
                    <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-weight: 700; color: #F4EFE4; margin-top: 4px;">${escapeHtml(castId)}</div>
                    <div style="font-family: 'Inter', sans-serif; font-size: 11px; color: rgba(244, 239, 228, 0.55); margin-top: 4px;">${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Legal Certified Stamp Ribbon -->
          <tr>
            <td style="background-color: rgba(168, 130, 44, 0.08); border-bottom: 1px solid rgba(168, 130, 44, 0.15); padding: 12px 35px; text-align: center;">
              <span style="font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #A8822C;">
                🔒 SECURITY CLEARANCE ACTIVE · PROTECTED UNDER EXECUTION NDA
              </span>
            </td>
          </tr>

          <!-- Content Details -->
          <tr>
            <td style="padding: 30px 35px 40px;">
              
              <!-- Idea Box Heading -->
              <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #A8822C; margin-bottom: 15px;">
                I. PROJECT SPECIFICATIONS
              </div>

              <!-- Main Metadata Table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 30px; background-color: #EDE8DC; border: 1px solid rgba(19, 25, 41, 0.08); width: 100%;">
                ${row('Idea Name', fields.ideaName)}
                ${row('Ambition Tier', fields.ambition)}
                ${row('Classification', fields.category)}
              </table>

              <!-- Description Block -->
              <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #A8822C; margin-bottom: 15px;">
                II. CONCEPT MEMORANDUM & SCOPE
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 35px; width: 100%;">
                <tr>
                  <td style="background-color: #FFFFFF; border-left: 3px solid #A8822C; padding: 20px; font-family: 'Cormorant Garamond', Georgia, serif; font-size: 14px; line-height: 1.65; color: #1E2535; border-top: 1px solid rgba(19, 25, 41, 0.06); border-right: 1px solid rgba(19, 25, 41, 0.06); border-bottom: 1px solid rgba(19, 25, 41, 0.06);">
                    ${escapeHtml(fields.description).replace(/\n/g, '<br>')}
                  </td>
                </tr>
              </table>

              <!-- Submitter Block -->
              <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #A8822C; margin-bottom: 15px;">
                III. DISCLOSING PARTY CERTIFICATION
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 30px; background-color: #EDE8DC; border: 1px solid rgba(19, 25, 41, 0.08); width: 100%;">
                ${row('Full Name', fields.name)}
                ${row('Email Address', fields.email)}
                ${row('Designated Role', fields.role)}
                ${row('Affiliation', fields.affiliation)}
                ${fields.fileAttached ? row('Documentation', '✓ File payload attached securely') : ''}
              </table>

              <!-- Signatures Row -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 35px; border-top: 1px dashed rgba(168, 130, 44, 0.3); padding-top: 25px; width: 100%;">
                <tr>
                  <!-- Wax Seal Graphic placeholder style -->
                  <td width="50%" style="vertical-align: middle;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="background-color: #1A4A3C; padding: 12px 18px; border-radius: 2px; text-align: center; border: 1px solid #C9A24A;">
                          <div style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 600; letter-spacing: 0.12em; color: #F4EFE4;">DZF CERTIFIED</div>
                          <div style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 15px; font-weight: 700; color: #C9A24A; margin: 3px 0;">SECURE</div>
                          <div style="font-family: 'Inter', sans-serif; font-size: 7px; color: rgba(244, 239, 228, 0.75);">RECORD RECORDED</div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  <!-- Signature Image -->
                  <td width="50%" align="right" style="vertical-align: middle; text-align: right;">
                    <table cellpadding="0" cellspacing="0" style="float: right; text-align: center; min-width: 180px;">
                      <tr>
                        <td style="border-bottom: 1px solid #131929; padding-bottom: 4px; height: 45px; text-align: center;">
                          ${hasSignature 
                            ? `<img src="cid:signatureImage" alt="Signature" style="max-height: 45px; max-width: 180px; display: block; margin: 0 auto;"/>` 
                            : `<span style="font-family: 'Cormorant Garamond', Georgia, serif; font-size: 20px; font-style: italic; color: #1E2535; font-weight: 500;">${escapeHtml(fields.name)}</span>`}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-family: 'Inter', sans-serif; font-size: 8px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; color: #6A6355; padding-top: 6px;">
                          Disclosing Party Signature
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <!-- Action Button -->
              <div style="font-family: 'Inter', sans-serif; font-size: 11px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; color: #A8822C; margin-top: 35px; margin-bottom: 15px;">
                IV. LEDGER ACTION PORTAL
              </div>
              <table width="100%" cellpadding="0" cellspacing="0" style="width: 100%;">
                <tr>
                  <td align="center" style="background-color: #131929; padding: 20px; border: 1px solid #A8822C;">
                    <div style="font-family: 'Inter', sans-serif; font-size: 12px; color: #F4EFE4; margin-bottom: 12px; font-weight: 300;">
                      This submission has been logged securely in the DayZero Foundary administrative ledger.
                    </div>
                    <a href="https://www.dayzerofoundary.in/admin" target="_blank" style="display: inline-block; background-color: #A8822C; color: #F4EFE4; font-family: 'Inter', sans-serif; font-size: 10px; font-weight: 600; letter-spacing: 0.15em; text-transform: uppercase; text-decoration: none; padding: 12px 24px; border: 1px solid #C9A24A; border-radius: 2px;">
                      Access Ledger Console
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer Certificate Registry Label -->
          <tr>
            <td style="background-color: #131929; padding: 25px 35px; border-top: 1px solid #A8822C; text-align: center;">
              <div style="font-family: 'Inter', sans-serif; font-size: 9px; font-weight: 400; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(244, 239, 228, 0.65);">
                Confidential Registry • DayZero Foundary • NDA Shield Active
              </div>
              <div style="font-family: 'Inter', sans-serif; font-size: 8px; color: #C9A24A; margin-top: 6px; letter-spacing: 0.05em;">
                DayZero Ledger Reference Entry · DZ-LEDGER-2026
              </div>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
// ── POST /api/v1/intake ───────────────────────────────────────────────────────
intakeRoutes.post('/', upload.single('file'), async (req, res) => {
    let uploadResult: any = null
    let castId = ''
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

        const { name, email, role, affiliation, category, idea, turnstileToken, signature } = parsed.data

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

        // ── 4. Upload file to Cloudinary if provided ──────────────────────────
        if (req.file) {
            try {
                uploadResult = await uploadToCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname)
            } catch (uploadErr: any) {
                console.error('[intake] Cloudinary upload error:', uploadErr)
                res.status(502).json({
                    success: false,
                    message: 'Failed to store uploaded file',
                    data: null,
                    errors: [{ field: 'file', message: uploadErr?.message || 'Upload error' }],
                })
                return
            }
        }

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

        // ── 6. Save to Database using Prisma sequential writes ───────────────
        let submission: any = null
        let notification: any = null
        let retries = 3
        while (retries > 0) {
            castId = await generateCastId()
            try {
                submission = await prisma.submission.create({
                    data: {
                        castId,
                        name: fields.name,
                        email: fields.email,
                        role: fields.role,
                        affiliation: fields.affiliation,
                        category: fields.category,
                        idea: `${fields.ideaName} — ${fields.ambition}\n\n${fields.description}`,
                        signature: signature || null,
                    }
                })
                break // Success!
            } catch (dbErr: any) {
                // If it is a Cast-ID uniqueness constraint violation, retry
                if (dbErr.code === 'P2002' && dbErr.meta?.target?.includes('castId')) {
                    retries--
                    if (retries === 0) throw dbErr
                    continue
                }
                throw dbErr
            }
        }

        // Create the files record separately if file was uploaded
        if (uploadResult) {
            await prisma.submissionFile.create({
                data: {
                    submissionId: submission.id,
                    publicId: uploadResult.publicId,
                    secureUrl: uploadResult.secureUrl,
                    format: uploadResult.format,
                    bytes: BigInt(uploadResult.bytes),
                    originalFilename: req.file?.originalname || 'file',
                }
            })
        }

        // Create the notification record separately
        notification = await prisma.notification.create({
            data: {
                submissionId: submission.id,
                recipient: process.env.SMTP_TO ?? process.env.SMTP_USER ?? fields.email,
                status: 'pending',
            }
        })

        // ── 7. Log to admin dashboard (legacy in-memory fallback) ─────────────
        logSubmission({
            id:          submission.id,
            castId,
            name:        fields.name,
            email:       fields.email,
            role:        fields.role,
            affiliation: fields.affiliation,
            category:    fields.category,
            idea:        `${fields.ideaName} — ${fields.ambition}\n\n${fields.description}`,
            ip:          req.ip ?? '',
            createdAt:   submission.createdAt.toISOString(),
        })

        // ── 8. Send email asynchronously in the background (Non-blocking!) ────
        const smtpHost = process.env.SMTP_HOST
        const smtpTo   = process.env.SMTP_TO ?? process.env.SMTP_USER

        if (smtpHost && smtpTo && notification) {
            // Dispatch email dispatch asynchronously
            (async () => {
                try {
                    const transporter = createTransporter()

                    const mailOptions: nodemailer.SendMailOptions = {
                        from:    `"DayZero Foundary" <${process.env.SMTP_FROM ?? process.env.SMTP_USER}>`,
                        to:      smtpTo,
                        replyTo: fields.email,
                        subject: `[DayZero] New Idea — ${fields.ideaName} · ${castId}`,
                        html:    buildEmailHtml(fields, castId, !!signature),
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

                    const mailAttachments: any[] = []
                    if (req.file) {
                        mailAttachments.push({
                            filename:    req.file.originalname,
                            content:     req.file.buffer,
                            contentType: req.file.mimetype,
                        })
                    }

                    if (signature && signature.startsWith('data:image/png;base64,')) {
                        const base64Data = signature.replace(/^data:image\/png;base64,/, '')
                        mailAttachments.push({
                            filename:    'signature.png',
                            content:     Buffer.from(base64Data, 'base64'),
                            contentType: 'image/png',
                            cid:         'signatureImage'
                        })
                    }

                    if (mailAttachments.length > 0) {
                        mailOptions.attachments = mailAttachments
                    }

                    await transporter.sendMail(mailOptions)

                    // Update notification to sent
                    await prisma.notification.update({
                        where: { id: notification.id },
                        data: { status: 'sent' },
                    })
                } catch (emailErr: any) {
                    console.error('[intake] email error:', emailErr)
                    // Update notification to failed
                    await prisma.notification.update({
                        where: { id: notification.id },
                        data: {
                            status: 'failed',
                            lastError: emailErr?.message || String(emailErr),
                        },
                    })
                }
            })().catch(err => {
                console.error('[intake] background email worker error:', err)
            })
        } else {
            console.log('[intake] SMTP not configured — submission logged only:', { castId, name: fields.name })
            if (notification) {
                // Update notification to failed
                prisma.notification.update({
                    where: { id: notification.id },
                    data: {
                        status: 'failed',
                        lastError: 'SMTP not configured',
                    },
                }).catch(err => {
                    console.error('[intake] failed to update notification status:', err)
                })
            }
        }

        // ── 9. Respond ────────────────────────────────────────────────────────
        res.status(201).json({
            success: true,
            message: 'Idea submitted successfully',
            data: { castId },
            pagination: null,
            errors: null,
        })
    } catch (err) {
        console.error('[intake] unexpected error:', err)
        // Cleanup Cloudinary file if transaction failed
        if (uploadResult && uploadResult.publicId) {
            try {
                await deleteFromCloudinary(uploadResult.publicId)
            } catch (cleanupErr) {
                console.error('[intake] Cloudinary cleanup error:', cleanupErr)
            }
        }
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            data: null,
            errors: [{ message: 'Something went wrong' }],
        })
    }
})

// ── POST /api/v1/intake/refine ──────────────────────────────────────────────
intakeRoutes.post('/refine', async (req, res) => {
    try {
        const { ideaName, category, memo } = req.body as { ideaName?: string, category?: string, memo?: string }
        if (!ideaName || !memo) {
            res.status(400).json({
                success: false,
                message: 'ideaName and memo are required',
                data: null,
                errors: [{ message: 'Missing parameters' }]
            })
            return
        }

        const name = ideaName.trim()
        const cat = (category || 'General').trim()
        const desc = memo.trim()

        const prompt = `You are a principal software architect at DayZero Foundary, an elite stealth-mode MVP development studio.
The user has submitted an idea draft with a name, classification category, and a brief description memo.
Your task is to refine this raw idea into a highly professional, technically structured MVP product specification.
You must output a JSON object containing the following exact keys:
1. "coreConcept": A single, powerful, highly technical elevator pitch describing the architectural concept (e.g., describing databases, data ingestion, processing pipelines, or loggers, using professional engineering terminology).
2. "phase1Title": A short title for the Phase 1 MVP milestone.
3. "phase1Desc": A detailed, professional description of the Phase 1 target scope.
4. "phase2Title": A short title for the Phase 2 MVP milestone.
5. "phase2Desc": A detailed, professional description of the Phase 2 target scope.
6. "phase3Title": A short title for the Phase 3 MVP milestone.
7. "phase3Desc": A detailed, professional description of the Phase 3 target scope.

Raw Idea Details:
Name: ${name}
Category: ${cat}
Memo: ${desc}

Respond ONLY with a valid JSON block. Do not write any markdown or introductory text.`

        // 1. Try Gemini
        if (process.env.GEMINI_API_KEY) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { responseMimeType: 'application/json' }
                    })
                })
                if (response.ok) {
                    const data = await response.json() as any
                    const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text
                    if (textResponse) {
                        const parsed = JSON.parse(textResponse.trim())
                        res.json({ success: true, data: parsed })
                        return
                    }
                }
            } catch (err) {
                console.error('[Gemini Refine] failed, falling back:', err)
            }
        }

        // 2. Try Claude
        if (process.env.CLAUDE_API_KEY) {
            try {
                const response = await fetch('https://api.anthropic.com/v1/messages', {
                    method: 'POST',
                    headers: {
                        'x-api-key': process.env.CLAUDE_API_KEY,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'claude-3-5-sonnet-20241022',
                        max_tokens: 1024,
                        messages: [{ role: 'user', content: prompt }]
                    })
                })
                if (response.ok) {
                    const data = await response.json() as any
                    const textResponse = data.content?.[0]?.text
                    if (textResponse) {
                        const parsed = JSON.parse(textResponse.trim())
                        res.json({ success: true, data: parsed })
                        return
                    }
                }
            } catch (err) {
                console.error('[Claude Refine] failed, falling back:', err)
            }
        }

        // 3. Try OpenAI
        if (process.env.OPENAI_API_KEY) {
            try {
                const response = await fetch('https://api.openai.com/v1/chat/completions', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: 'gpt-4o-mini',
                        response_format: { type: 'json_object' },
                        messages: [{ role: 'user', content: prompt }]
                    })
                })
                if (response.ok) {
                    const data = await response.json() as any
                    const textResponse = data.choices?.[0]?.message?.content
                    if (textResponse) {
                        const parsed = JSON.parse(textResponse.trim())
                        res.json({ success: true, data: parsed })
                        return
                    }
                }
            } catch (err) {
                console.error('[OpenAI Refine] failed, falling back:', err)
            }
        }

        // Fallback to local rule-based builder
        const fallbackResult = refineIdeaTextLocal(desc, cat)
        res.json({ success: true, data: fallbackResult })

    } catch (err: any) {
        console.error('[refine] failed:', err)
        res.status(500).json({
            success: false,
            message: 'Failed to refine idea',
            data: null,
            errors: [{ message: err?.message || String(err) }]
        })
    }
})

function refineIdeaTextLocal(input: string, category: string) {
  const text = input.trim();
  const stopwords = new Set([
    "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been", "being",
    "in", "on", "at", "by", "for", "with", "about", "against", "between", "into", "through",
    "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out",
    "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when",
    "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some",
    "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t",
    "can", "will", "just", "don", "should", "now", "app", "application", "website", "web", "platform",
    "create", "build", "make", "want", "need", "needs", "software", "system", "tool", "project", "idea"
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 3 && !stopwords.has(w));

  const uniqueKeywords = Array.from(new Set(words));
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const key1 = uniqueKeywords[0] ? cap(uniqueKeywords[0]) : "User";
  const key2 = uniqueKeywords[1] ? cap(uniqueKeywords[1]) : "Data";
  const key3 = uniqueKeywords[2] ? cap(uniqueKeywords[2]) : "Process";

  const hasAI = /\b(ai|artificial|intelligence|gpt|bot|llm|model|machine|learning)\b/i.test(text);
  const hasDelivery = /\b(delivery|deliver|shipping|courier|laundry|dry|clean|uber|on-demand)\b/i.test(text);
  const hasFinance = /\b(finance|pay|payment|wallet|transaction|crypto|bank|money|card)\b/i.test(text);
  const hasHealth = /\b(health|med|patient|doctor|clinical|hospital|wellness|care)\b/i.test(text);
  const hasEdu = /\b(education|edtech|learn|student|teacher|course|class|school)\b/i.test(text);
  const hasBag = /\b(bag|backpack|suitcase|luggage|fashion|brand|purse|handbag|wallet|product|shop|store|ecommerce|e-commerce)\b/i.test(text);
  const hasTravel = /\b(travel|flight|hotel|trip|booking|vacation|tourism)\b/i.test(text);
  const hasFood = /\b(food|restaurant|chef|dining|recipe|kitchen|groceries|meal)\b/i.test(text);

  let coreConcept = "";
  if (hasDelivery) {
    coreConcept = `A decentralized, high-throughput logistical coordination architecture optimized for real-time dispatch state routing. It leverages low-latency event synchronization to map agent locations directly to consumer queues.`;
  } else if (hasHealth) {
    coreConcept = `A secure, HIPAA-compliant patient diagnostics and scheduling coordinator. It integrates encrypted multi-tenant data containment with fine-grained access tokens to secure patient-practitioner records.`;
  } else if (hasFinance) {
    coreConcept = `A high-assurance transactional settlement engine supporting atomic double-entry bookkeeping, multi-gateway ledger processing, and state verification using secure signature hashes.`;
  } else if (hasAI) {
    coreConcept = `An intelligent cognitive pipeline powered by machine learning architectures. It processes unstructured dataset payloads, extracts semantic vectors, and triggers automated multi-parameter decision trees.`;
  } else if (hasEdu) {
    coreConcept = `A modular educational knowledge broker utilizing micro-progress tracking engines and automated curriculum indexers to deliver structured course flows.`;
  } else if (hasBag) {
    coreConcept = `A Direct-to-Consumer (D2C) inventory lifecycle and order fulfillment broker. It synchronizes online store catalogs with localized stock ledgers to prevent transactional collisions.`;
  } else if (hasTravel) {
    coreConcept = `A multi-modal transit scheduling and itinerary aggregation engine. It dynamically resolves multi-vendor pricing matrices into a unified customer travel sequence.`;
  } else if (hasFood) {
    coreConcept = `An on-demand culinary production and delivery broker. It binds live menu states with kitchen queue pipelines and courier routing matrices.`;
  } else {
    coreConcept = `A high-performance system engineered for the automated coordination of ${key1} structures and ${key2} payloads. It implements a multi-tier database mapping layer to orchestrate ${key3} sequences with sub-second latency.`;
  }

  let phase1Title = `Intake & ${key1} Gateway`;
  let phase1Desc = `A secure, highly responsive portal managing ${key1} uploads, schema inputs, and real-time client validation checks.`;
  let phase2Title = `${key2} Processing & Orchestration Engine`;
  let phase2Desc = `An asynchronous worker node managing database write routing, validation pipelines, and event coordination based on ${key2} states.`;
  let phase3Title = `Stealth ${key3} Administrative Ledger`;
  let phase3Desc = `An encrypted, token-authorized operational portal to oversee transaction logs, configure ${key3} rules, and audit client state audits.`;

  if (hasDelivery) {
    phase1Title = "Geographic Booking & Intake Gateway";
    phase1Desc = "Mobile-optimized interface managing dynamic coordinate inputs, scheduled pickup profiles, and delivery progress indexes.";
    phase2Title = "Asynchronous Routing & Dispatch Matcher";
    phase2Desc = "A back-end scheduler running geographical optimization queries to pair agents with courier targets and emit socket updates.";
    phase3Title = "Settlement Ledger & Carrier Audit Board";
    phase3Desc = "Secure administrator console auditing payload completions, calculating payouts, and managing operator credentials.";
  } else if (hasAI) {
    phase1Title = "Ingress Parser & Vector Interface";
    phase1Desc = "Responsive layout configured for structured document uploads, prompt templates, and schema compliance checks.";
    phase2Title = "Inference & Processing Middleware";
    phase2Desc = "Orchestrates API calls to processing engines, handles request caching, and parses outputs into structured JSON format.";
    phase3Title = "Inference Logs & Precision Tuner";
    phase3Desc = "Control board to review model usage metrics, adjust confidence thresholds, and inspect prompt history.";
  } else if (hasFinance) {
    phase1Title = "Atomic Transaction & Checkout Portal";
    phase1Desc = "High-security payment ingress supporting card tokenization, client account linkups, and instant receipt verification.";
    phase2Title = "Ledger State & Payout Settlement Engine";
    phase2Desc = "Handles database transactions with isolation check locks, integrates Stripe/webhooks, and verifies ledger accounts.";
    phase3Title = "AML Compliance & Audit Registry";
    phase3Desc = "Administrative reporting dashboard to audit transaction logs, flag anomalies, and export tax summaries.";
  } else if (hasHealth) {
    phase1Title = "HIPAA Patient Care & Intake Board";
    phase1Desc = "Fully encrypted portal for medical history forms, scheduler slots, and secure client communication.";
    phase2Title = "Encrypted Patient Record Broker";
    phase2Desc = "Synchronizes clinical records with database storage using AES-256 field-level encryption and full audit trails.";
    phase3Title = "Clinical Administration Ledger";
    phase3Desc = "Authorized dashboard tracking practitioner permissions, shift scheduling logs, and system access checks.";
  } else if (hasEdu) {
    phase1Title = "Learner Portal & Course Dashboard";
    phase1Desc = "Modular curriculum console featuring progress states, video player containers, and quiz forms.";
    phase2Title = "Progress Tracking & Scoring Engine";
    phase2Desc = "Computes score metrics, processes lesson completion states, and updates student certification records.";
    phase3Title = "Educator Curriculum & Analytics Portal";
    phase3Desc = "Teacher console to build modular lessons, adjust scoring, and review aggregate student completion data.";
  } else if (hasBag) {
    phase1Title = "Product Showroom & Ingress Checkout";
    phase1Desc = "D2C catalog interface managing visual variants, dimensional details, and secure cart payment gates.";
    phase2Title = "Stock Registry & Inventory Broker";
    phase2Desc = "Monitors real-time stock balances across warehouses and manages order dispatch queues on incoming purchases.";
    phase3Title = "Logistics Carrier & Fulfillment Portal";
    phase3Desc = "Backend shipping administrator to print dispatch labels, map shipping updates, and track tracking APIs.";
  } else if (hasTravel) {
    phase1Title = "Visual Itinerary & Booking Ingress";
    phase1Desc = "Search dashboard permitting custom date settings, route configurations, and customer details.";
    phase2Title = "External API Aggregator Engine";
    phase2Desc = "Aggregates travel availability databases (flights, hotels) into a single, unified booking payload.";
    phase3Title = "Reservation Ledger & Markup Controller";
    phase3Desc = "Operations dashboard monitoring reservation receipts, configuring ticketing margins, and routing vendor payouts.";
  }

  return {
    coreConcept,
    phase1Title,
    phase1Desc,
    phase2Title,
    phase2Desc,
    phase3Title,
    phase3Desc
  };
}
