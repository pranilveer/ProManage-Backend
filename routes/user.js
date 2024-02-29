const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateUser = require("../middleware/authMiddleware");

// Register a new user
router.post("/users/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "10h",
    });
    res
      .status(201)
      .json({ message: "User registered successfully", user, token });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
});

// Login
router.post("/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: "Authentication failed" });
    }

    console.log(user);
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Authentication failed" });
    }
    // Generate a JWT token and send it in the response
    const token = jwt.sign({ userId: user._id },process.env.JWT_SECRET_KEY, {
      expiresIn: "10h",
    });

    res.status(200).json({ message: "Authentication successful", token, user });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
});


router.put("/users/profile", authenticateUser, async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;

    // Find the user by ID
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Compare the provided old password with the hashed password
    const passwordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Old password is incorrect" });
    }

    // Update the user's password with the new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Profile update failed", error);
    res.status(500).json({ error: "Profile update failed" });
  }
});


// Route to fetch user details by ID
router.get("/users/:userId", authenticateUser, async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    // Return only the necessary user details (e.g., name)
    const { name } = user;
    res.status(200).json({ name });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Route to fetch userId from the authenticated user
router.get("/users/me", authenticateUser, async (req, res) => {
  try {
    const userId = req.userId; // Get userId from the request object
    res.status(200).json({ userId });
  } catch (error) {
    console.error("Error fetching userId:", error);
    res.status(500).json({ error: "Failed to fetch userId" });
  }
});

module.exports = router;