#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

# Navigate to the client directory and build the project
echo "Building the client..."
cd client
npm install
npm run build

# Verify the build directory exists
if [ ! -d "build" ]; then
  echo "Build directory does not exist. Exiting."
  exit 1
fi

# Sync the build files to your S3 bucket
echo "Deploying the client to S3..."
aws s3 sync build/ s3://sweetpluscakehouse.com --delete

# Optional: Invalidate CloudFront cache (replace with your CloudFront distribution ID)
echo "Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id E3U0JTSOHLBCBE --paths "/*"

# Navigate to the server directory and deploy using Elastic Beanstalk CLI
echo "Deploying the server to Elastic Beanstalk..."
cd ..
eb init -p node.js sweetpluscakehouse --region us-west-2
eb deploy sweetpluscake-dev


echo "Deployment completed successfully."
