# APIs
1. Create archive - POST: /api/archive/create
2. Archive Status - GET: /api/archive/status/{hash_id}
3. Check Generated Link - GET: /archive/get/{hash_id.zip}

# Docker
Docker Commands to run project

1. docker build -t archive-app .
2. docker run -d -it -p 3000:3000 -e "PORT=3000" -e "AWS_ACCESS_KEY_ID=xxxxxxxxxxxx" -e "AWS_SECRET_ACCESS_KEY=xxxxxxxxxxxx" -e "AWS_REGION=us-east-1" -e "DIR_PATH=/uploads" -e "QUEUE_NAME=requests_queue" archive-app
3. docker logs -f <container_id> to check logs