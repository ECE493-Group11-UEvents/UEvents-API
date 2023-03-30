#!/bin/bash
folder_name="UEvents-API"

echo 'run application_start.sh: ' >> /home/ec2-user/"$folder_name"/deploy.log

echo 'pm2 restart UEvents' >> /home/ec2-user/"$folder_name"/deploy.log
sudo DB_ACCESS_KEY=$DB_ACCESS_KEY DB_SECRET_ACCESS_KEY=$DB_SECRET_ACCESS_KEY REGION=$REGION pm2 restart UEvents --update-env >> /home/ec2-user/"$folder_name"/deploy.log