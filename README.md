# Lecturer Scheduling System

A web application for managing lecturer schedules and workloads. This project is built with a React frontend and a Node.js/Express backend, using MongoDB for data storage. The app uses AWS Cognito for authentication, AWS API Gateway for secure API routing, and AWS IAM for access control.

Table of Contents
Project Overview
Features
Tech Stack
Project Structure
Getting Started
Setup Instructions
Usage Guide
Contributing
Project Overview
The Lecturer Scheduling System enables lecturers to log in, view their schedules, and update availability or workloads. Admin users can assign subjects to lecturers and adjust schedules. The app ensures secure access and data integrity through AWS services and follows a robust data flow model.

Features
User Authentication: AWS Cognito-based login for lecturers and admin users.
Scheduling Management: CRUD operations for managing lecturer schedules.
Database: Uses MongoDB for storing lecturer data, schedules, and subject assignments.
Real-Time Monitoring: AWS CloudWatch for tracking system performance and issues.
Tech Stack
Frontend: React, Axios
Backend: Node.js, Express.js, Mongoose
Database: MongoDB
Authentication: AWS Cognito
API Gateway: AWS API Gateway
Monitoring: AWS CloudWatch

Project Structure

![image](https://github.com/user-attachments/assets/4921f3f9-8630-4802-b931-b9e64e9ba41f)


Getting Started
Prerequisites

Node.js and npm installed (ensure node -v and npm -v work in your terminal).

MongoDB: Set up a local instance or MongoDB Atlas for database management.

AWS Account: Configure AWS Cognito, API Gateway, and IAM permissions.


Usage Guide

Authentication

Lecturers and admin users can log in via AWS Cognito. Ensure your AWS Cognito configuration in .env matches the project.

API Endpoints

Backend API endpoints are available under /api. Use Axios in React to send requests to these endpoints.

Example Routes:

POST /api/lecturers/add: Add a new lecturer

GET /api/lecturers: Get a list of all lecturers

POST /api/schedule/assign: Assign a subject to a lecturer

Monitoring
AWS CloudWatch is set up for monitoring. Use CloudWatch logs to track errors, API usage, and system performance.

Contributing

Branch Naming: Follow the naming convention feature/your-feature-name for feature branches.

Pull Requests: Submit a pull request with a detailed description. Each pull request should be reviewed by another team member.

Code Reviews: All code should be reviewed before merging into the main branch.

Issues: Use GitHub Issues for bug tracking, new feature requests, and task assignment.


