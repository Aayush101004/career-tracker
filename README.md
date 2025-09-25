# StepWise
An advanced MERN stack application designed to be a comprehensive, AI-powered assistant for job seekers. This toolkit helps users track their projects, analyze career paths, tailor resumes for specific roles, and practice for interviews with a personalized AI coach.

Live Demo: https://career-tracker-two.vercel.app/

## ✨ Key Features
This application is a suite of powerful, interconnected tools designed to streamline the job application process:

- 👤 **Full Authentication System:** Secure user registration and login using JWT (JSON Web Tokens) for session management. User data is kept private and secure.

- 🗂️ **Career Project Tracker:**

  - **Manual Entry:** Add project details, descriptions, technologies, and GitHub links through a simple form.

  - **GitHub Import:** Simply provide a public GitHub repository URL, and the app's AI will fetch the repository name, summarize the ```README.md``` file for a professional description, and list the technologies used.

  - **Resume Parsing:** Upload your resume (PDF), and the AI will automatically find the "Projects" section and extract all your projects into the tracker.

- 🧭 **Career Path Analyzer:**

  - Based on the technologies listed in your tracked projects, the AI analyzes your skillset and suggests the most suitable career path (e.g., Frontend Developer, Machine Learning Engineer, Backend Developer).

- 📄 **AI Resume Modifier:**

  - Upload your existing resume and provide a target job role and description.

  - The AI analyzes your resume's content and provides actionable feedback, listing "Good Points" that align with the role and "Areas for Improvement" to make your resume stronger.

- **🎙️ Interactive AI Interview Coach:**

  - Select projects from your tracker and enter a target job role.

  - The AI generates a personalized set of interview questions, including:

    - **Technical Deep Dives:** Questions directly about the technologies and architecture of your projects.

    - **Behavioral Questions:** Scenarios based on challenges you might have faced in your work.
  
    - **CS/AI Fundamentals:** Questions on core concepts tailored to whether the job is a general software role or an AI-specific role.

  - **Practice Mode:** Answer each question using your microphone. The app uses speech-to-text to capture your answer.

  - **Instant Feedback:** Submit your spoken answer, and the AI will evaluate its quality, providing a score out of 10, a summary of the feedback, and a list of what you did well and what you can improve.

## 🛠️ Technology Stack
- **Frontend:** React.js, React Router, Axios, ```react-speech-recognition```

- **Backend:** Node.js, Express.js

- **Database:** MongoDB with Mongoose

- **Authentication:** JSON Web Tokens (JWT), bcrypt.js

- **AI Integration:** Google Gemini API

- **File Handling:** Multer (for uploads), pdf-parse (for text extraction)

- **Deployment:**

  - Backend on Render (Web Service)

  - Frontend on Vercel (Static Site)

## 🚀 Getting Started
To get a local copy up and running, follow these simple steps.

### Prerequisites
- Node.js and npm installed

- MongoDB (a local instance or a free MongoDB Atlas cluster)

- A valid API key for the Google Gemini API.

- A GitHub Personal Access Token with ```public_repo``` permissions.

### Installation & Setup
- **Clone the repository:**

  ```
  git clone https://github.com/Aayush101004/career-tracker.git
  cd career-tracker
  ```
- **Install Backend Dependencies:**

  ```
  cd server
  npm install
  ```
- **Install Frontend Dependencies:**

  ```
  cd ../client
  npm install
  ```
- **Create the Root Environment File:**
  In the main ```career-tracker``` directory, create a ```.env``` file and add your secret keys. This single file is used for both the local server and Docker environments.

  ```
  # For local development, use your localhost MongoDB string
  MONGO_URI=mongodb://localhost:27017/careerTrackerDB
  
  # Your secret for signing JWTs
  JWT_SECRET=your_jwt_secret_here
  
  # Your API keys
  GEMINI_API_KEY=your_gemini_api_key_here
  GITHUB_TOKEN=your_github_personal_access_token_here
  ```
### Running the Application
You need to run two separate processes in two separate terminals.

- **Start the Backend Server:**  

  - Navigate to the ```server``` directory.

  - Run the command:

    ```
      npm start
    ```
  - Your server will be running on ```http://localhost:5001```.

- **Start the Frontend Client:**

  - Navigate to the ```client``` directory.

  - Run the command:

    ```
      npm start
    ```
  - Your React application will open in your browser at ```http://localhost:3000```.
