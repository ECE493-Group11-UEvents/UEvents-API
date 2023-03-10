#!/bin/bash
folder_name="UEvents-API"

echo 'run after_install.sh: ' >> /home/ec2-user/"$folder_name"/deploy.log

echo 'cd /home/ec2-user/UEvents-API' >> /home/ec2-user/"$folder_name"/deploy.log
cd /home/ec2-user/"$folder_name" >> /home/ec2-user/"$folder_name"/deploy.log

echo 'npm install' >> /home/ec2-user/"$folder_name"/deploy.log 
npm install >> /home/ec2-user/"$folder_name"/deploy.log
