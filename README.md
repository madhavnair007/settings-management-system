# Settings Management System
The purpose of this project is to create a simple system management system. Here is the tech stack that I decided to implement with:

Frontend - React + TS
Backend - Express + TS

## How frontend talks to backend
Frontend uses a dev proxy so it calls /api/... and the dev server forwards to the backend. I do this to avoid potential issues I may run into using CORS. This is a simple alternative.

## How to run this app locally
### Frontend
You can run the frontend by going into the frontend folder (/cd frontend) and running npm run dev. The frontend runs on port 5173. You can access it using: http://localhost:5173/ once the port is running.

### Backend
You can run the backend by going into the backend folder (/cd backend) and running node index.js. The backend runs on port 3000. you can access using: http://localhost:3000/ once the port is running.