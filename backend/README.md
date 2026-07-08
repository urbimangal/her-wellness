
# 🌸 HerWellness Backend

A production-ready backend for the **HerWellness** platform built using **Node.js**, **Express.js**, **MongoDB**, and **JWT Authentication** following the **MVC Architecture**.

The backend provides APIs for authentication, profile management, AI-powered health assistance, menstrual cycle tracking, and future pregnancy care modules.

---

# 🚀 Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs
- Google Gemini API
- REST APIs

---

# 📂 Project Structure

```text
backend/

├── config/
├── controllers/
├── middleware/
├── models/
├── prompts/
├── routes/
├── services/
├── utils/
├── validators/
├── app.js
├── server.js
├── package.json
├── .env.example
└── README.md
```

---

# ⚙️ Setup

### Install Dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file.

Example:

```env
PORT=5000

MONGO_URI=YOUR_MONGODB_URI

JWT_SECRET=YOUR_SECRET

JWT_EXPIRES_IN=7d

GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

---

### Start Server

Development

```bash
npm run dev
```

Production

```bash
npm start
```

Server runs on

```
http://localhost:5000
```

---

# 📌 Available Modules

## 🔐 Authentication

- Register User
- Login User
- JWT Authentication

> Firebase Phone OTP integration will be added during frontend integration.

---

## 👤 Profile

- Get User Profile
- Update User Profile

---

## 🤖 AI Health Assistant

Features

- AI Chatbot
- Symptom Analysis
- Lifestyle Disease Risk Prediction
- Personalized Health Recommendations

---

## 🌸 Menstrual Tracker

Features

- Save Menstrual Cycle
- Cycle History
- Predict Next Period
- Fertile Window Prediction
- Calendar API

---

## 🚼 Pregnancy Care (Coming Soon)

Features

- Pregnancy Week Tracker
- Baby Growth Information
- Weekly Health Tips
- Reminder APIs

---

# 📚 API Modules

```
Authentication

POST   /api/auth/register

POST   /api/auth/login
```

```
Profile

GET    /api/profile

PUT    /api/profile
```

```
AI

POST   /api/ai/chat

POST   /api/ai/symptom-check

POST   /api/ai/risk-prediction

POST   /api/ai/recommendations
```

```
Menstrual Tracker

POST   /api/menstrual/save

GET    /api/menstrual/history

GET    /api/menstrual/predict

GET    /api/menstrual/calendar

PUT    /api/menstrual/update/:id

DELETE /api/menstrual/delete/:id
```

---

# 🔒 Security

- Passwords encrypted using bcryptjs
- JWT Authentication
- Environment Variables
- MVC Architecture
- Input Validation
- Centralized Error Handling

---

# 🚧 Upcoming Features

- Firebase Phone Authentication
- Pregnancy Care APIs
- Medicine Reminder APIs
- SOS APIs
- Reports & Analytics
- Notification System

---

# 👩‍💻 Developed By

**Urbi Mangal**
