<div align="center">

# 🃏 AlgoDeck

### *Your Personal DSA Learning Companion*

[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org)

*A full-stack MERN application for organizing DSA notes and tracking coding questions*

[Features](#-features) • [Tech Stack](#-tech-stack) • [Installation](#-installation) • [API Reference](#-api-reference) • [Database Design](#-database-design)

</div>

---

## 📖 Introduction

**AlgoDeck** is a comprehensive full-stack web application built using the **MERN Stack** (MongoDB, Express.js, React, Node.js) designed to help developers and students organize their **Data Structures & Algorithms (DSA)** learning journey.

This project demonstrates:
- 📝 **Notes Management** - Create, organize, and pin important notes with folder support
- ❓ **Question Tracking** - Track coding problems with difficulty levels and completion status
- 🔐 **User Authentication** - Secure Google OAuth integration with JWT tokens
- 📊 **Progress Dashboard** - Visual overview of learning progress and recent activity
- 🎨 **Modern UI/UX** - Responsive design with dark/light theme support

AlgoDeck showcases how MongoDB's flexible document model handles complex, nested data structures for a real-world application.

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📁 **Folder Organization** | Organize notes and questions into custom folders with subfolder support |
| 📌 **Pin Important Notes** | Pin frequently accessed notes for quick access |
| 🏷️ **Tagging System** | Add tags to notes and questions for easy filtering |
| 🎯 **Difficulty Tracking** | Categorize questions as Easy, Medium, or Hard |
| ✅ **Completion Status** | Track solved vs unsolved questions |
| 🔗 **External Links** | Store problem links to LeetCode, HackerRank, etc. |
| 🌓 **Theme Toggle** | Switch between light and dark modes |
| 🔍 **Search & Filter** | Quickly find notes and questions |
| 📱 **Responsive Design** | Works seamlessly on desktop and mobile |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 19** | UI Library |
| **React Router v7** | Client-side routing |
| **Vite** | Build tool & dev server |
| **Lucide React** | Icon library |
| **React Hot Toast** | Toast notifications |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | MongoDB ODM |
| **Passport.js** | Authentication middleware |
| **JWT** | Token-based auth |
| **bcryptjs** | Password hashing |

---

## 📁 Project Structure

```
algodeck/
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js              # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── User.js              # User schema
│   │   │   ├── Note.js              # Notes schema
│   │   │   ├── NoteFolder.js        # Note folders schema
│   │   │   ├── Question.js          # Questions schema
│   │   │   └── QuestionFolder.js    # Question folders with subfolders
│   │   ├── routes/
│   │   │   ├── auth.js              # Authentication routes
│   │   │   ├── notes.js             # Notes CRUD routes
│   │   │   ├── noteFolders.js       # Note folder routes
│   │   │   ├── questions.js         # Questions CRUD routes
│   │   │   └── questionFolders.js   # Question folder routes
│   │   └── server.js                # Express app entry point
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── common/              # Reusable UI components
    │   │   └── layout/              # Layout components
    │   ├── context/
    │   │   ├── AuthContext.jsx      # Authentication state
    │   │   ├── DataContext.jsx      # App data management
    │   │   └── ThemeContext.jsx     # Theme management
    │   ├── pages/
    │   │   ├── Dashboard/           # Overview & stats
    │   │   ├── Notes/               # Notes management
    │   │   ├── Questions/           # Question tracking
    │   │   ├── Settings/            # User preferences
    │   │   └── Login/               # Authentication
    │   ├── services/
    │   │   └── api.js               # API service layer
    │   └── App.jsx                  # Main app component
    └── package.json
```

---

## 🗂️ Database Design

### Collections Overview

AlgoDeck uses **5 MongoDB collections** to manage all application data:

---

### Collection 1: `users`

Stores user account information and preferences.

| Field | Data Type | Description |
|-------|-----------|-------------|
| `googleId` | String | Google OAuth identifier |
| `email` | String | User's email (unique) |
| `name` | String | Display name |
| `avatar` | String | Profile picture URL |
| `preferences` | Object | Nested: `{ theme, defaultView }` |
| `createdAt` | Date | Account creation timestamp |

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  googleId: "117234567890",
  email: "user@example.com",
  name: "John Doe",
  avatar: "https://lh3.googleusercontent.com/...",
  preferences: {
    theme: "dark",
    defaultView: "dashboard"
  },
  createdAt: ISODate("2024-01-15T10:30:00Z")
}
```

---

### Collection 2: `notefolders`

Organizes notes into folders.

| Field | Data Type | Description |
|-------|-----------|-------------|
| `userId` | ObjectId | Reference to User |
| `name` | String | Folder name |
| `noteCount` | Number | Count of notes in folder |

---

### Collection 3: `notes`

Stores user notes with rich content support.

| Field | Data Type | Description |
|-------|-----------|-------------|
| `userId` | ObjectId | Reference to User |
| `folderId` | ObjectId | Reference to NoteFolder |
| `title` | String | Note title |
| `heading` | String | Note heading/subtitle |
| `content` | String | Note content (supports markdown) |
| `tags` | Array | List of tags |
| `isPinned` | Boolean | Pin status for quick access |
| `createdAt` | Date | Creation timestamp |
| `updatedAt` | Date | Last modified timestamp |

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  folderId: ObjectId("..."),
  title: "Binary Search Algorithm",
  heading: "Divide and Conquer Approach",
  content: "Binary search is an efficient algorithm...",
  tags: ["searching", "algorithms", "divide-conquer"],
  isPinned: true,
  createdAt: ISODate("2024-02-10T14:20:00Z"),
  updatedAt: ISODate("2024-02-15T09:45:00Z")
}
```

---

### Collection 4: `questionfolders`

Organizes questions with **nested subfolder** support.

| Field | Data Type | Description |
|-------|-----------|-------------|
| `userId` | ObjectId | Reference to User |
| `name` | String | Folder name |
| `subfolders` | Array | Nested documents with subfolder details |

**Sample Document with Nested Subfolders:**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  name: "LeetCode",
  subfolders: [
    { _id: ObjectId("..."), name: "Arrays" },
    { _id: ObjectId("..."), name: "Strings" },
    { _id: ObjectId("..."), name: "Dynamic Programming" }
  ]
}
```

---

### Collection 5: `questions`

Tracks coding problems with completion status.

| Field | Data Type | Description |
|-------|-----------|-------------|
| `userId` | ObjectId | Reference to User |
| `folderId` | String | Reference to folder/subfolder |
| `questionNumber` | Number | Question number for ordering |
| `title` | String | Question title |
| `difficulty` | String | Enum: `easy`, `medium`, `hard` |
| `link` | String | External problem URL |
| `tags` | Array | Topic tags |
| `notes` | String | Personal notes/approach |
| `isCompleted` | Boolean | Completion status |
| `completedAt` | Date | Completion timestamp |

**Sample Document:**
```javascript
{
  _id: ObjectId("..."),
  userId: ObjectId("..."),
  folderId: "subfolder_id",
  questionNumber: 1,
  title: "Two Sum",
  difficulty: "easy",
  link: "https://leetcode.com/problems/two-sum/",
  tags: ["arrays", "hash-table"],
  notes: "Use HashMap for O(n) solution",
  isCompleted: true,
  completedAt: ISODate("2024-02-20T16:30:00Z")
}
```

---

## 🚀 Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- npm or yarn

### 1. Clone the Repository

```bash
git clone https://github.com/DevSudhanshuRanjan/algodeck.git
cd algodeck
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/algodeck
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback
```

Start backend server:
```bash
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### 4. Access Application

Open `http://localhost:5173` in your browser.

---

## 📡 API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/auth/google` | Initiate Google OAuth |
| `GET` | `/api/auth/google/callback` | OAuth callback |
| `POST` | `/api/auth/demo-login` | Demo login |
| `GET` | `/api/auth/me` | Get current user |
| `PATCH` | `/api/auth/preferences` | Update preferences |

### Notes

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/notes` | Get all notes |
| `POST` | `/api/notes` | Create note |
| `PATCH` | `/api/notes/:id` | Update note |
| `PATCH` | `/api/notes/:id/pin` | Toggle pin status |
| `DELETE` | `/api/notes/:id` | Delete note |

### Questions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/questions` | Get all questions |
| `POST` | `/api/questions` | Create question |
| `PATCH` | `/api/questions/:id` | Update question |
| `PATCH` | `/api/questions/:id/complete` | Toggle completion |
| `DELETE` | `/api/questions/:id` | Delete question |

---

## 📊 MongoDB Queries Examples

### Insert Operations

**Query 1: Create a new note**
```javascript
db.notes.insertOne({
  userId: ObjectId("user_id"),
  folderId: ObjectId("folder_id"),
  title: "Graph Traversal",
  heading: "BFS and DFS",
  content: "Breadth-First Search explores neighbors first...",
  tags: ["graphs", "bfs", "dfs"],
  isPinned: false
});
```

**Query 2: Add multiple questions**
```javascript
db.questions.insertMany([
  { 
    title: "Valid Parentheses", 
    difficulty: "easy", 
    tags: ["stack"], 
    isCompleted: false 
  },
  { 
    title: "Merge Intervals", 
    difficulty: "medium", 
    tags: ["arrays", "sorting"], 
    isCompleted: true 
  }
]);
```

### Read Operations

**Query 3: Find all pinned notes**
```javascript
db.notes.find({ isPinned: true }).sort({ updatedAt: -1 });
```

**Query 4: Get completed questions by difficulty**
```javascript
db.questions.find({ 
  isCompleted: true, 
  difficulty: "hard" 
});
```

**Query 5: Search notes by tag**
```javascript
db.notes.find({ 
  tags: { $in: ["dynamic-programming"] } 
});
```

### Update Operations

**Query 6: Mark question as completed**
```javascript
db.questions.updateOne(
  { _id: ObjectId("question_id") },
  { 
    $set: { 
      isCompleted: true, 
      completedAt: new Date() 
    } 
  }
);
```

### Delete Operations

**Query 7: Delete a note folder and its notes**
```javascript
db.notes.deleteMany({ folderId: ObjectId("folder_id") });
db.notefolders.deleteOne({ _id: ObjectId("folder_id") });
```

---

## 🎯 Conclusion

Building **AlgoDeck** provided hands-on experience with the complete MERN stack and demonstrated MongoDB's power for modern web applications.

### Key Takeaways:

- ✅ **Document Model** - MongoDB's flexible schema perfectly suits hierarchical data like folders and subfolders
- ✅ **Arrays & Nested Objects** - Storing tags as arrays and subfolders as nested documents simplifies data modeling
- ✅ **Indexing** - Compound indexes on `userId + folderId` optimize common queries
- ✅ **Text Search** - MongoDB's text indexes enable full-text search across notes
- ✅ **References** - ObjectId references maintain relationships between collections
- ✅ **CRUD Operations** - Mongoose provides elegant APIs for database operations

This project demonstrates how MongoDB's document-oriented approach enables rapid development while maintaining data integrity and query performance.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📄 License

This project is licensed under the ISC License.

---

<div align="center">

### Made with ❤️ by [Sudhanshu Ranjan](https://github.com/DevSudhanshuRanjan)

⭐ **Star this repo if you found it helpful!** ⭐

</div>
