# Personal AI

Personal AI is a web application that allows users to interact with AI models, upload files (images, PDFs, resumes), and receive AI-powered responses. The backend is built with **Node.js**, **Express**, **Cloudinary**, and **Serverless-ready** for deployment on **Vercel**.

## Features

- Upload files (images, PDFs, resumes) directly to Cloudinary.
- AI-powered content generation and processing.
- Fully serverless deployment compatible with Vercel.
- Secure handling of file uploads using `multer.memoryStorage()`.

## Tech Stack

- **Backend:** Node.js, Express
- **File Storage:** Cloudinary
- **File Uploads:** Multer (memory storage for serverless)
- **AI Services:** OpenAI API, Google Generative AI
- **Database:** NeonServerless (PostgreSQL)
- **Deployment:** Vercel

## Project Structure


## Getting Started

### Prerequisites

- Node.js >= 18
- NPM
- Cloudinary account
- OpenAI API key
- Vercel account (for deployment)

### Installation

Clone the repository:

```bash
git clone https://github.com/imvaibhav99/personal-ai.git
cd personal-ai/server
npm install

```
in .env:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url

```bash
npm run server

```

# Personal AI Frontend

The frontend of **Personal AI** is a modern, responsive web application built with **React.js**. Users can interact with AI models, upload files, view AI-generated content, and experience a visually appealing interface.

## Features

- Upload images, PDFs, and resumes.
- AI-powered responses and content display.
- Responsive and interactive UI using React and Tailwind CSS.
- Optional 3D animations using Three.js for engaging visuals.
- Seamless integration with the serverless backend deployed on Vercel.

## Tech Stack

- **Frontend:** React.js, Tailwind CSS, Three.js
- **State Management:** React Context / Redux (if used)
- **API Calls:** Axios
- **Deployment:** Vercel / Netlify
- **File Uploads:** Connected to backend API with Cloudinary

## Project Structure
client/
├─ src/
│ ├─ components/ # Reusable React components
│ ├─ pages/ # React pages (Home, Dashboard, AI Chat, Upload)
│ ├─ services/ # API service calls
│ ├─ App.jsx # Main app entry
│ ├─ index.jsx # React DOM render
│ ├─ styles/ # Tailwind or custom CSS
├─ package.json




## Getting Started

### Prerequisites

- Node.js >= 18
- NPM or Yarn
- Backend API URL (deployed or local)

### Installation

Clone the repository:

```bash
git clone https://github.com/imvaibhav99/personal-ai.git
cd personal-ai/client

npm install
```
Create a .env file in client/:

REACT_APP_API_URL=https://your-backend-api.vercel.app
REACT_APP_CLOUDINARY_CLOUD_NAME=your_cloud_name


```bash
npm start

