# 📝 NotesVault — Notes Management System

A full-stack Notes Management System built with **React**, **Node.js/Express**, and **MySQL**. Allows users to create, edit, delete, search, pin, and tag notes with a clean dark-themed UI.
<img width="2880" height="1554" alt="image" src="https://github.com/user-attachments/assets/05cd2f13-2f78-45bb-90a6-28773ac39cf0" />

---

## 📸 Features

- ✅ Create, Read, Update, Delete notes
- 🔍 Live search by title and content (debounced)
- 📌 Pin important notes to the top
- 🏷️ Add and remove tags per note
- 💾 Auto-save while editing (1.5s debounce)
- 🗑️ Delete confirmation modal
- 📊 Word and character count in editor
- 📱 Responsive UI (mobile sidebar toggle)
- 🔔 Toast notifications for all actions
- ⚠️ Validation with error messages

---

## 🛠️ Tech Stack

| Layer      | Technology                                                        |
|------------|-------------------------------------------------------------------|
| Frontend   | React 18, Axios, React Hot Toast, Lucide React, Date-fns          |
| Backend    | Node.js, Express.js                                               |
| Database   | MySQL 8+                                                          |
| Styling    | Custom CSS (dark theme, CSS variables)                            |

---

## 📁 Project Structure

```
notes-app/
│
├── backend/
│   ├── config/
│   │   └── db.js                  # MySQL connection pool
│   ├── controllers/
│   │   └── notesController.js     # CRUD + search logic
│   ├── routes/
│   │   └── notes.js               # API route definitions
│   ├── .env.example               # Environment variable template
│   ├── package.json
│   ├── schema.sql                 # Database schema + seed data
│   └── server.js                  # Express app entry point
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── DeleteModal.jsx     # Confirmation modal
    │   │   ├── NoteEditor.jsx      # Note editing panel
    │   │   ├── NoteItem.jsx        # Sidebar note card
    │   │   └── Sidebar.jsx         # Left sidebar with search
    │   ├── hooks/
    │   │   └── useNotes.js         # Notes state & API calls
    │   ├── utils/
    │   │   └── api.js              # Axios instance + interceptors
    │   ├── App.jsx                 # Root component
    │   ├── index.css               # Global styles
    │   └── index.js                # React entry point
    ├── .env                        # Frontend environment variables
    └── package.json
```

---

## ⚙️ Prerequisites

Make sure you have these installed:

- [Node.js](https://nodejs.org/) v16 or higher
- [MySQL](https://www.mysql.com/) v8 or higher
- [Git](https://git-scm.com/)

---

## 🚀 Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Siddabhade2003/Notes-Management-System.git
cd notes-app
```

---

### 2. Database Setup

Open your MySQL client (MySQL Workbench, TablePlus, or terminal) and run:

```bash
mysql -u root -p < backend/schema.sql
```

Or manually paste the contents of `backend/schema.sql` into your MySQL client.

This will:
- Create the `notes_db` database
- Create the `notes` table with full-text search index

---

### 3. Backend Setup

```bash
cd backend
npm install

```

Edit `.env` with your MySQL credentials:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=notes_db
DB_PORT=3306
```

Start the server:

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

✅ Backend runs on `http://localhost:5000`

Verify it's working by visiting: `http://localhost:5000/health`
```json
{ "status": "ok" }
```

---

### 4. Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

✅ Frontend runs on `http://localhost:3000`

The `.env` file is already set up:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔌 API Reference

**Base URL:** `http://localhost:5000/api`

### Endpoints

| Method | Endpoint           | Description                       |
|--------|--------------------|-----------------------------------|
| GET    | `/notes`           | Get all notes                     |
| GET    | `/notes?search=q`  | Search notes by title and content |
| GET    | `/notes/:id`       | Get a single note by ID           |
| POST   | `/notes`           | Create a new note                 |
| PUT    | `/notes/:id`       | Update an existing note           |
| DELETE | `/notes/:id`       | Delete a note                     |
| PATCH  | `/notes/:id/pin`   | Toggle pin status                 |

---

### Request & Response Examples

#### `POST /api/notes` — Create a Note

```json
// Request Body
{
  "title": "My First Note",
  "content": "This is the note content.",
  "pinned": false,
  "tags": "work,ideas"
}

// Response 201
{
  "success": true,
  "message": "Note created",
  "data": {
    "id": 1,
    "title": "My First Note",
    "content": "This is the note content.",
    "pinned": 0,
    "tags": "work,ideas",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

#### `GET /api/notes` — Query Params

| Param    | Default      | Options                             |
|----------|--------------|-------------------------------------|
| `search` | `""`         | any string                          |
| `sort`   | `updated_at` | `updated_at`, `created_at`, `title` |
| `order`  | `DESC`       | `ASC`, `DESC`                       |

#### Error Response Format

```json
{
  "success": false,
  "message": "Title is required"
}
```

---

## 🗃️ Database Schema

```sql
CREATE TABLE notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  title      VARCHAR(255)  NOT NULL,
  content    LONGTEXT,
  pinned     BOOLEAN       DEFAULT FALSE,
  tags       VARCHAR(500)  DEFAULT NULL,
  created_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_title (title),
  FULLTEXT INDEX ft_search (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

| Field        | Type         | Description                               |
|--------------|--------------|-------------------------------------------|
| `id`         | INT          | Auto-incremented primary key              |
| `title`      | VARCHAR(255) | Note title — required, max 255 chars      |
| `content`    | LONGTEXT     | Full note body                            |
| `pinned`     | BOOLEAN      | Pin to top (stored as 0/1)                |
| `tags`       | VARCHAR(500) | Comma-separated tags e.g. `"work,ideas"`  |
| `created_at` | TIMESTAMP    | Auto-set on insert                        |
| `updated_at` | TIMESTAMP    | Auto-updated on every change              |

---

## ✅ Assignment Features Checklist

| Feature                           | Status |
|-----------------------------------|--------|
| Create multiple notes             | ✅     |
| View all notes                    | ✅     |
| Edit note title and content       | ✅     |
| Delete note with confirmation     | ✅     |
| View single note                  | ✅     |
| Search by title and content       | ✅     |
| Sort by most recently updated     | ✅     |
| Validation — empty title blocked  | ✅     |
| Proper error messages             | ✅     |
| Responsive UI                     | ✅     |
| Loading and empty states          | ✅     |
| **Bonus:** Pin notes              | ✅     |
| **Bonus:** Tags / categories      | ✅     |
| **Bonus:** Auto-save              | ✅     |

---

## 🧰 Scripts

### Backend

| Command         | Description                      |
|-----------------|----------------------------------|
| `npm run dev`   | Start with nodemon (auto-reload) |
| `npm start`     | Start in production mode         |

### Frontend

| Command           | Description                  |
|-------------------|------------------------------|
| `npm start`       | Start development server     |
| `npm run build`   | Build for production         |

---

## 🐛 Troubleshooting

| Problem | Solution |
|---|---|
| `Network error` on frontend | Start backend first: `cd backend && npm run dev` |
| `MySQL connection failed` | Check `.env` credentials; ensure MySQL is running |
| Port already in use | Run `npx kill-port 3000` or `npx kill-port 5000` |
| Notes show `0` before title | Fixed — MySQL returns boolean as `0/1`; use `!!note.pinned` in React |

---


