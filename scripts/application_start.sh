#!/bin/bash
folder_name="UEvents-API"

echo 'run application_start.sh: ' >> /home/ec2-user/"$folder_name"/deploy.log

echo 'pm2 restart UEvents-API' >> /home/ec2-user/"$folder_name"/deploy.log
pm2 restart "$folder_name" >> /home/ec2-user/"$folder_name"/deploy.log