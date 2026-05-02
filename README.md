# Navexa AI - Full Stack AI Conversational Platform

Navexa AI is a premium, multi-mode AI assistant built with React and Node.js, powered by the Google Gemini API.

## Project Structure
- `backend/`: Node.js Express server
- `frontend/`: React.js (Vite) frontend

## Getting Started

### 1. Backend Setup
1. Open a terminal in the `backend` folder.
2. Run `npm install`.
3. The `.env` file is already configured with your API key.
4. Run `npm start` to start the backend on `http://localhost:5000`.

### 2. Frontend Setup
1. Open a terminal in the `frontend` folder.
2. Run `npm install`.
3. Run `npm run dev` to start the frontend.
4. Open your browser to the URL provided (usually `http://localhost:5173`).

## Key Features
- **Auto-Detection**: Backend automatically detects if you want to Chat, Code, or Research.
- **Coding Mode**: Provides structured responses with Language, Description, Code, and Usage.
- **Research Mode**: Provides structured analysis with Overview, Key Points, Analysis, and Conclusion.
- **Premium UI**: Dark mode, glassmorphism, smooth animations, and responsive design.
- **Secure API**: API key is kept on the backend, never exposed to the frontend.
