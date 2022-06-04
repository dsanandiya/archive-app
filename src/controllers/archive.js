import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import Joi from 'joi'
import logger from '../winston.js'
import sqs from './../utils/sqs.js'
import config from './../config.js'

export const create = async (req, res) => {
  try {
    const schema = Joi.object({
      urls: Joi.array().items(Joi.string()).min(1).required()
    })

    const validationError = schema.validate(req.body)

    if (validationError.error) {
      res.status(400).json({
        error: validationError.error.details
      })
      return
    }

    const hash = uuidv4()
    const { urls } = req.body
    const queueUrl = req.app.get('sqsQueueUrl')
    const dirPath = `${config.dirPath}/${hash}`

    const message = {
      type: 'prepare_archive',
      hash,
      urls
    }

    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      logger.info(`Directory created: '${dirPath}'`)
    }

    await sqs.sendMessage(queueUrl, message)
    logger.info(`Message Sent: ${JSON.stringify(message)}`)

    res.status(200).json({
      archive_hash: hash
    })
  } catch (err) {
    logger.error(err)
    res.status(500).json({ error: err.message })
  }
}

const status = async (req, res) => {
  const { id } = req.params
  const dirPath = `${config.dirPath}/${id}`

  if (!fs.existsSync(dirPath)) {
    res.status(404).json({ error: 'Not Found' })
    return
  }

  if (!fs.existsSync(`${dirPath}/${id}.zip`)) {
    res.status(200).json({ status: 'in-progress' })
    return
  }

  const url = `${req.protocol}://${req.get('host')}/api/archive/get/${id}.zip`

  res.status(200).json({ status: 'completed', url })
}

const get = async (req, res) => {
  const id = req.params.id.split('.')[0]
  const dirPath = `${config.dirPath}/${id}`
  if (!fs.existsSync(dirPath)) {
    res.status(404).json({ error: 'Not Found' })
    return
  }

  res.status(200).sendfile(`${dirPath}/${id}.zip`)
}

export default {
  create,
  status,
  get
}
