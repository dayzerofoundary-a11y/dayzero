import dotenv from 'dotenv'
dotenv.config()

// ── Fix 14: Warn loudly about insecure default secrets ───────────────────────
const INSECURE_DEFAULTS = ['change-me-access', 'change-me-refresh', 'change-me']
const SECRETS_TO_CHECK = ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET', 'ADMIN_PASSWORD']
for (const key of SECRETS_TO_CHECK) {
    const val = process.env[key]
    if (!val || INSECURE_DEFAULTS.includes(val)) {
        if (process.env.NODE_ENV === 'production') {
            console.error(`[FATAL] ${key} is not set or uses an insecure default. Refusing to start in production.`)
            process.exit(1)
        } else {
            console.warn(`[WARN] ${key} is using an insecure default value. Change it before deploying.`)
        }
    }
}

import express from 'express'
import { initApp } from './web/app.js'

async function main() {
    const app = express()
    initApp(app)

    const port = process.env.PORT ? Number(process.env.PORT) : 4000
    app.listen(port, () => {
        console.log(`[api] listening on :${port}`)
    })
}

main().catch((err) => {
    console.error(err)
    process.exit(1)
})
