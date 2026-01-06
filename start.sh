#!/bin/sh

# Start backend
cd /app/backend
node dist/index.js &

# Start nginx for frontend
nginx -g 'daemon off;' &

# Wait for any process to exit
wait -n

# Exit with status of process that exited first
exit $?
