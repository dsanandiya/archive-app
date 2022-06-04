import express from 'express'
import controllers from '../controllers/index.js'

const router = express.Router()

router.post('/archive/create', controllers.archive.create)
router.get('/archive/status/:id', controllers.archive.status)
router.get('/archive/get/:id', controllers.archive.get)

export default router
