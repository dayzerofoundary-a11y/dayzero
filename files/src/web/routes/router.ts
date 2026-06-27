import { Router } from 'express'

import { intakeRoutes } from './v1/intake.js'
import { adminRoutes } from './v1/admin.js'


export const router = Router()

router.use('/v1/intake', intakeRoutes)
router.use('/v1/admin', adminRoutes)



