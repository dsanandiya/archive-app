import bodyParser from 'body-parser'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import logger from './winston.js'

import routes from './routes/index.js'
import sqs from './utils/sqs.js'
import config from './config.js'

const app = express()

app.use(bodyParser.json())
app.use(helmet())
app.use(cors())
app.use(morgan('combined', { stream: logger.stream }))
app.use('/api', routes)

sqs.upsertQueue(config.sqsQueueName).then((data) => {
  logger.info(`SQS queue created: ${data.QueueUrl}`)
  app.set('sqsQueueUrl', data.QueueUrl)
}).then((data) => {
  app.emit('ready')
}).catch((e) => {
  logger.error(`Failed to start app due to ${e.message}`)
  process.exit(1)
})

export default app
