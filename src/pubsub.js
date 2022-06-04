import axios from 'axios'
import { Consumer } from 'sqs-consumer'
import fs from 'fs'
import logger from './winston.js'
import config from './config.js'
import JSZip from 'jszip'

class Pubsub {
  constructor (app) {
    this.app = app
    const queueUrl = app.get('sqsQueueUrl')
    this.handleMessage = this.handleMessage.bind(this)

    this.pubsubApp = Consumer.create({
      queueUrl,
      handleMessage: this.handleMessage
    })
  }

  async handleMessage (message) {
    const messageBody = JSON.parse(message.Body)
    const { type: messageType, urls, hash } = messageBody

    switch (messageType) {
      case 'prepare_archive':
        const dirPath = `${config.dirPath}/${hash}`
        const fileArr = await Promise.all(urls.map(url => {
          return this.saveFileToDirectory(url, `${dirPath}/${(url.split('/')).pop()}`)
        }))

        const zip = new JSZip()

        for (const file of fileArr) {
          if(file) {
            const fileData = fs.readFileSync(file)
            zip.file(file.split('/').pop(), fileData)
          }
        }

        zip
          .generateNodeStream({ streamFiles: true })
          .pipe(fs.createWriteStream(`${dirPath}/${hash}.zip`))
          .on('finish', function () {
            console.log('out.zip written.')
          })

        // TODO: Send message to another SQS queue with type=send_archive_payload which has max receive count set so failed webhook submission retries for few times.
        break
      case 'send_archive_payload':
        // TODO: Implement webhook functionality
        break

      default:
        logger.info(`Sorry! we do not handle '${messageType}' type of messages`)
        break
    }
  }

  async saveFileToDirectory (fileUrl, outputLocationPath) {
    return new Promise((resolve, reject) => {
      const writer = fs.createWriteStream(outputLocationPath)
      axios({
        method: 'get',
        url: fileUrl,
        responseType: 'stream'
      }).then(response => {
        response.data.pipe(writer)
        let error = null
        writer.on('error', err => {
          error = err
          writer.close()
          reject(err)
        })
        writer.on('close', () => {
          if (!error) {
            resolve(outputLocationPath)
          }
        })
      }).catch(error => {
        fs.unlinkSync(outputLocationPath)
        if ([404, 403, 401].includes(error.response.status)) {
          resolve()
        } else {
          reject()
        }
      })
    })
  }
}

export default Pubsub
