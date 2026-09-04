import express from "express";
import dotenv from "dotenv";
import fakeUsers from "./fakeDB/fakeUsers.js";

dotenv.config();

const app = express();
app.use(express.json());

let users = [...fakeUsers];

// Get all users
app.get("/users", (req, res) => {
  res.json(users);
});

// Get user by id
app.get("/users/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);
  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }
  res.json(user);
});

// Create user
app.post("/users", (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "All fields are required!" });
  }
  const newUser = {
    id: String(Date.now()),
    username,
    email,
    password,
  };
  users.push(newUser);
  res.status(201).json(newUser);
});

// Update user
app.put("/users/:id", (req, res, next) => {
  try {
    const user = users.find((u) => u.id === req.params.id);

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: "username, email and password are required!" });
    }

    user.username = username;
    user.email = email;
    user.password = password;

    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Delete user
app.delete("/users/:id", (req, res, next) => {
  try {
    const index = users.findIndex((u) => u.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ error: "User not found!" });
    }

    const deletedUser = users.splice(index, 1)[0];

    return res.status(200).json({
      message: "User deleted successfully",
      deletedUser,
    });
  } catch (err) {
    next(err);
  }
});

// Centralized/Global Error Handling Middleware
app.use((err, req, res, next) => {
  return res.status(500).json({
    error: "Something went wrong on the server...",
    message: err.message,
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on PORT:${PORT} 🟢`);
});
