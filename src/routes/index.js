import express from 'express'
import archive from './archive.js'

const router = express.Router()

router.use(archive)

export default router
