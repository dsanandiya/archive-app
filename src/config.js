const config = {
  sqsQueueName: process.env.QUEUE_NAME || 'requests_queue',
  port: process.env.PORT || 3000,
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  dirPath: process.env.DIR_PATH || '/Users/darshan/Projects/demo/zip-archive/uploads'
}

export default config
