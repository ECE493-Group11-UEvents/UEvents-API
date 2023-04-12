[![CI/CD Pipeline](https://github.com/ECE493-Group11-UEvents/UEvents-API/actions/workflows/Aws_Deploy.yml/badge.svg?branch=main)](https://github.com/ECE493-Group11-UEvents/UEvents-API/actions/workflows/Aws_Deploy.yml)

# UEvents Backend API
This directory contains the working backend API routes Group 11 Capstone Design Project submission, UEvents. This project portion utilizes NodeJS and ExpressJS and interfaces with DynamoDB, SendGrid, S3, and others to complete our functional requirements.

## To see our application
1. Navigate [here](https://uevents.app/home)

## To run locally: 
1. Have npm installed and clone this repo.
2. Navigate to the working directory and run `npm i`.
3. After packages are installed, run `npm run start-dev`.
NOTE: You will need a `.env` file in the root directory of this repo with credentials for the DB (and other systems) in order for the app to run successfully. This information can be seen in the submission details on our OneDrive folder for submission (as the information is sensitive).

## testing
1. Follow and complete the installation guide
2. Run `npm run test`
