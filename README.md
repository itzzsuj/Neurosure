# 🧠 NeuroSure - AI Insurance Policy Analyzer

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](https://choosealicense.com/licenses/mit/)
[![Python](https://img.shields.io/badge/Python-3.11-blue.svg)](https://python.org)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org)

## 📋 Overview

**NeuroSure** is an AI-powered tool that helps you understand insurance policies. Upload a PDF, select a medical condition, and it finds relevant clauses using smart search that understands meaning, not just keywords.

![Dashboard Screenshot](https://via.placeholder.com/800x400/00695C/FFFFFF?text=NeuroSure+Dashboard)

---

## ✨ Features

- 🔍 **Smart Search** - Finds clauses even when exact words aren't there
- 📄 **PDF Upload** - Drag & drop or click to upload
- 🏥 **25+ Diseases** - Diabetes, Hypertension, Cancer, and more
- 📊 **Simple Metrics** - See relevance scores at a glance
- 🔐 **Google Login** - Secure authentication
- ⚡ **Fast Results** - Get answers in seconds

---

## 🚀 Quick Start (5 minutes)

### What you need:
- Python 3.11
- Node.js
- Redis

### 1. Download the code
```bash
git clone https://github.com/itzzsuj/neurosure.git
cd neurosure
```

### 2. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm
mkdir -p uploads processed
redis-server  # In a new terminal
python app.py
```

### 3. Setup Frontend
```bash
# New terminal, from project root
npm install
cp src/firebase.example.js src/firebase.js
# Edit src/firebase.js with your Firebase details
npm start
```

### 4. Open your browser
Go to `http://localhost:3000`

---

## 🔧 Firebase Setup (2 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create project"
3. Add a web app (</> icon)
4. Copy config to `src/firebase.js`
5. Enable Google Sign-in in Authentication tab

---

## 📖 How to Use

1. **Login** with Google
2. **Upload** your insurance PDF
3. **Pick** a disease (like Diabetes)
4. **Click** "Extract Clauses"
5. **See** results with relevance scores

---

## 📁 Simple Project Structure

```
neurosure/
├── backend/           # Python backend
│   ├── app.py        # Main server
│   ├── utils/        # AI and PDF tools
│   └── requirements.txt
├── src/              # React frontend
│   ├── dashboard.jsx # Main page
│   ├── login.jsx     # Login page
│   └── firebase.js   # Your Firebase config
└── package.json
```

---

## ⚠️ Common Issues & Fixes

**Redis not running?**
```bash
redis-server
```

**Port 5000 already in use?**
```bash
lsof -i :5000
kill -9 [PID]
```

**Firebase not working?**
- Check `firebase.js` has correct keys
- Enable Google Sign-in in Firebase Console

---

## 🛠️ Tech Stack

- **Frontend**: React, Material-UI
- **Backend**: Flask, Python
- **AI**: Sentence-Transformers, FAISS
- **Auth**: Firebase
- **Queue**: Redis

---

## ⭐ Support

If you like this project, give it a star on GitHub!

---

**Made with ❤️ for better insurance understanding**
