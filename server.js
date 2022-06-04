import 'dotenv/config'

import logger from './src/winston.js'
import app from './src/app.js'
import Pubsub from './src/pubsub.js'

const { PORT = 3000 } = process.env

app.on('ready', () => {
  const pubsubApp = new Pubsub(app).pubsubApp

  pubsubApp.on('error', (err) => {
    logger.error(`Failed to start app due to ${err.message}`)
    process.exit(1)
  })

  pubsubApp.start()

  app.listen(PORT, () => {
    logger.info(`Listening on port ${PORT}`)
  })
})
