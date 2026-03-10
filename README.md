# Life Sync - Productivity App

Life Sync is a full-stack personal productivity web application built using the MERN stack (MongoDB, Express, React, Node.js). 
It features a daily task manager, health tracker, and an AI-assisted natural-language routine planner that automatically generates schedules.

## Project Structure
This repository is a monorepo containing two main directories:
- `/frontend` - React application (Vite, Tailwind CSS, React Router, Axios)
- `/backend` - Node.js Express API (Mongoose, dotenv, CORS)

## Features
- **Dashboard**: A unified view of your daily tasks, current schedule timeline, and health tracking summary.
- **Daily Tasks**: Manage your tasks with categories (Study, Health, Personal, Work) and priority levels (Low, Medium, High).
- **Health Tracker**: Log daily metrics like water intake, sleep hours, exercise minutes, and overall mood.
- **Routine Planner**: Describe your day in natural text (e.g., "Wake up at 6 AM, study Java for 2 hours, exercise 30 mins"). The system will parse this text and automatically generate a timeline for you.

## Setup Instructions

### Prerequisites
- Node.js (v18+)
- Local MongoDB running on `mongodb://127.0.0.1:27017` OR a MongoDB Atlas connection string.

### 1. Backend Setup
1. CD into the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env` file based on `.env.example` OR use the default `.env` file already generated. Ensure `MONGODB_URI` points to your active database.
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The API will run on `http://localhost:5000`*

### 2. Frontend Setup
1. Open a new terminal and CD into the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *The React app will typically run on `http://localhost:5173`. Open this URL in your browser.*

## Tech Stack
- Frontend: React 18+, Vite, Tailwind CSS v4, Lucide React (Icons), React Router DOM.
- Backend: Node.js, Express.js
- Database: MongoDB (via Mongoose)
