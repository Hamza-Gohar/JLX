# JLX — JLHS Learning Assistant

JLX is an AI-powered learning assistant built for the students of Jauhar Lyceum High School. It provides guided assistance across various subjects to help students master every topic.

## ✨ Features

- **Multi-Subject Support**: Get expert help in Mathematics, Physics, Chemistry, Biology, and more.
- **Interactive Chat**: An intuitive chat interface for asking questions and receiving step-by-step explanations.
- **Rich Content**: Supports formatted text, code blocks, and mathematical equations (LaTeX).
- **Image Uploads**: Users can upload images for context in their questions.
- **Quiz Generation**: Test your knowledge with AI-generated quizzes based on the conversation history.
- **Secure Backend**: Uses Vercel Serverless Functions to protect the Gemini API key.
- **Demo Mode**: Can be run in a demo mode with canned responses for offline use or exhibitions.

## 🛠️ Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **AI**: Google Gemini API

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or newer)
- A Vercel account for deployment
- A Google Gemini API Key

### Installation & Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-repo/jlx-ai-assistant.git
    cd jlx-ai-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**

    Create a file named `.env.local` at the root of the project and add your Gemini API key.

    ```
    VITE_GEMINI_MODEL="gemini-2.5-flash"
    API_KEY="YOUR_GEMINI_API_KEY"
    VITE_DEMO_MODE="false"
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

### Environment Variables

- `VITE_GEMINI_MODEL`: The specific Gemini model to use (e.g., `gemini-2.5-flash`). This is exposed to the client.
- `API_KEY`: Your secret Google Gemini API key. This is **only** used on the server-side and should never be exposed to the client.
- `VITE_DEMO_MODE`: Set to `"true"` to enable demo mode, which uses pre-written responses instead of calling the live API. Set to `"false"` for normal operation.

## 🧠 API Endpoints

The app uses a serverless backend to securely communicate with the Gemini API.

- `POST /api/chat`: Handles streaming chat responses. It receives the subject, conversation history, and new user message, and streams the AI's response back to the client.
- `POST /api/quiz`: Handles quiz generation. It receives the subject and conversation history and returns a JSON object containing a multiple-choice quiz.

**Rate Limiting**: To prevent abuse, it is recommended to configure rate limiting on these API routes through the Vercel dashboard or by integrating a service like Upstash.

## 📦 Deployment on Vercel

1.  **Push your code to a Git repository** (GitHub, GitLab, Bitbucket).
2.  **Import your project on Vercel**. Vercel will automatically detect that it is a Vite application.
3.  **Configure Environment Variables** in the Vercel project settings. Add `API_KEY`, `VITE_GEMINI_MODEL`, and `VITE_DEMO_MODE` with their corresponding values.
4.  **Deploy**. Vercel will build and deploy your application. Any subsequent pushes to the main branch will trigger automatic redeployments.

The `vercel.json` file is configured to handle client-side routing correctly, ensuring that all paths are directed to the main `index.html` file.
