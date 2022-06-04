import { SQSClient, CreateQueueCommand, SendMessageCommand } from '@aws-sdk/client-sqs'
import config from './../config.js'

const upsertQueue = async (queueName, queueAttibutes = {}, awsConfig = { region: config.awsRegion }) => {
  const client = new SQSClient(awsConfig)
  const command = new CreateQueueCommand({ QueueName: queueName, Attributes: queueAttibutes })
  const data = await client.send(command)
  return data
}

const sendMessage = async (queueUrl, message, awsConfig = { region: config.awsRegion }) => {
  const client = new SQSClient(awsConfig)
  const params = { QueueUrl: queueUrl, MessageBody: JSON.stringify(message) }
  const command = new SendMessageCommand(params)
  const data = await client.send(command)
  return data
}

export default {
  upsertQueue,
  sendMessage
}
