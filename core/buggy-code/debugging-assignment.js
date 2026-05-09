const express = require("express");
const app = express();
app.use(express.json());

const users = [
  { id: 1, name: "Amit", email: "amit@test.com" },
  { id: 2, name: "Riya", email: "riya@test.com" }
];
const notes = [
  { id: 1, title: "Note 1", content: "Content 1", userId: 1 },
  { id: 2, title: "Note 2", content: "Content 2", userId: 2 }
];

// BUG 1 FIX: `userList` was undefined — should be `allUsers` (or just `users` directly)
app.get("/users", (req, res) => {
  const allUsers = users;
  res.send(allUsers);
});

// BUG 2 FIX: `req.params.id` is a string, but user ids are numbers — added Number() conversion
app.get("/users/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  res.send(user);
});

// BUG 3 FIX: `getUserById` never returned the result
function getUserById(id) {
  const user = users.find(u => u.id === id);
  return user;
}

// BUG 4 FIX: `notes.lenght` is a typo — should be `notes.length`
app.get("/notes/count", (req, res) => {
  const total = notes.length;
  res.send({ total });
});

// BUG 5 FIX: `fetchExternalData()` is async so must be awaited; also added missing await keyword
app.get("/external-data", async (req, res) => {
  const data = await fetchExternalData();
  res.send(data);
});

// BUG 6 FIX: `notes = []` is an assignment, not a comparison — should be `notes.length === 0`
app.get("/notes", (req, res) => {
  if (notes.length === 0) {
    console.log("No notes found");
  }
  res.send(notes);
});

// BUG 7 FIX: `generateNoteId` was assigned without calling it (missing parentheses `()`)
// Also moved inside the route so a new ID is generated per request instead of once at startup
function generateNoteId() {
  return Math.floor(Math.random() * 1000);  // BUG 8 FIX: Math.random() gives floats — wrap with Math.floor() for integer IDs
}

// BUG 9 FIX: Validation used `&&` (both missing) — should be `||` (either missing is invalid)
app.post("/notes", (req, res) => {
  const { title, content, userId } = req.body;
  if (!title || !content) {
    return res.status(400).send("Invalid input");
  }
  const newNote = {
    id: generateNoteId(),  // BUG 7 FIX applied here
    title: title,
    content: content,
    userId: userId
  };
  notes.push(newNote);
  res.status(201).send(newNote);
});

// BUG 10 FIX: No guard when `noteIndex` is -1 (note not found) — splice(-1) deletes the last element
app.delete("/notes/:id", (req, res) => {
  const id = Number(req.params.id);  // also applied BUG 2-style fix here
  const noteIndex = notes.findIndex(n => n.id === id);
  if (noteIndex === -1) {
    return res.status(404).send({ message: "Note not found" });
  }
  notes.splice(noteIndex, 1);
  res.send({ message: "Note deleted" });
});

// BUG 11 FIX: `username` is undefined — should be `name` (destructured from req.body)
// BUG 12 FIX: No null check if user is not found — added guard
app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const { name } = req.body;
  const user = users.find(u => u.id == id);
  if (!user) {
    return res.status(404).send({ message: "User not found" });
  }
  user.name = name;
  res.send(user);
});

// BUG 13 FIX: `n.userId = userId` is an assignment, not a comparison — should be `===`
// Also added Number() conversion for consistent type comparison
app.get("/user-notes/:userId", (req, res) => {
  const userId = Number(req.params.userId);
  const userNotes = notes.filter(n => n.userId === userId);
  res.send(userNotes);
});

// BUG 14 FIX: `||` should be `&&` — both email AND password must match for login
app.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (email === "admin@test.com" && password === "123456") {
    res.send({ message: "Login successful" });
  } else {
    res.send({ message: "Invalid credentials" });
  }
});

// BUG 15 FIX: `users.filter()` returns an array, not a single user — should use `users.find()`
app.get("/profile/:id", (req, res) => {
  const id = Number(req.params.id);
  const user = users.find(u => u.id === id);
  res.send(user.name);
});

app.post("/sum", (req, res) => {
  const { a, b } = req.body;
  const total = a + b;
  res.send({ total });
});

// BUG 16 FIX : app.listen port (3000) didn't match the console.log message (5000) — aligned both to 3000
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
