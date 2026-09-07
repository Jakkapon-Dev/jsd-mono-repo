import { Router } from "express";
import { users } from "../../fakeDB/fakeUsers.js";

export const router = Router();

// Read all users
router.get("/users", (req, res, next) => {
  try {
    
  } catch (err) {
    next(err);
  }
});

// Read user by id
router.get("/users/:id", (req, res, next) => {
  try {
   
    return res.status(200).json(user);
  } catch (err) {
    next(err);
  }
});

// Create user
router.post("/users", (req, res, next) => {
  try {
  
  } catch (err) {
    next(err);
  }
});

// Update user
router.put("/users/:id", (req, res, next) => {
  try {
    
  } catch (err) {
    next(err);
  }
});

// Delete user
router.delete("/users/:id", (req, res, next) => {
  try {
    
  } catch (err) {
    next(err);
  }
});