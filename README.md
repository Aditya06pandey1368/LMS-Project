#ScholarHub (Learning Management System Portal)
A full-stack, production-grade Learning Management System (LMS) built to deliver online courses with video lectures, quizzes, progress tracking, payment integration, and an admin dashboard.
Designed with a scalable architecture, clean UI, and industry-standard best practices.

##🎥 Demo Video
👉 YouTube Demo: https://youtu.be/s6PmXxvdVZ0?si=RQHmBbdrQeOHhO8A

https://github.com/user-attachments/assets/2ddf23a7-b3a3-4d0d-9864-4f931777e671



##🚀 Key Features

###👤 User Features (Students)
Secure login and account management (JWT-based)
Browse and view detailed course information
Enroll in courses using Stripe payment integration
Watch lectures with real-time progress tracking
Attempt quizzes after course completion
AI-generated notes
Light/Dark mode
Search and filter courses

###🛠️ Admin Features
Create and manage courses
Upload lectures (stored securely on Cloudinary)
Delete lectures (removes video from database + Cloudinary)
Track student learning progress
**Platform analytics dashboard:**
Total students
Revenue
Top courses
**Lecture Management:**
HD video upload via Cloudinary
Metadata stored in MongoDB
Lecture progress tracking per student

##🧩 Tech Stack
###Frontend : 
React.js
Redux Toolkit + RTK Query
Tailwind CSS + ShadCN
React Router
###Backend :
Node.js
Express.js
Mongoose (MongoDB)
###Integrations :
Cloudinary (video & image storage)
Stripe Payments
JSON Web Tokens (JWT authentication)
Gemini Api

##📁 Project Structure
client/        # React frontend
server/        # Express backend
controllers/   # Business logic
models/        # MongoDB schemas
routes/        # API endpoints
utils/         # Cloudinary, Stripe, JWT helpers

##🧠 What This Project Demonstrates
Full-stack web development (frontend + backend)
Scalable architecture using the MERN stack
Role-based authentication
Cloud video storage and secure uploads
Payment gateway integration (Stripe)
REST API design & state management with RTK Query
End-to-end product building: UI → API → DB 

##🔮 Future Enhancements
AI-powered course recommendations
Gamification (badges, XP, streaks)
Live classes using WebRTC
Discussion forums & community spaces
Multi-language support
