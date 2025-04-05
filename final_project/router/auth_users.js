const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  if (!username || users.find((user) => user.username == username)) {
    return false;
  }
  return true;
};

const authenticatedUser = (username, password) => {
  return !!users.find(
    (user) => user.username == username && user.password == password,
  );
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password to login" });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(400).json({ message: "You were not authenticated" });
  }

  // Generate JWT access token
  let accessToken = jwt.sign({ username: username }, "secret_key_1234", {
    expiresIn: 60 * 60 * 10,
  });
  // Store access token in session
  req.session.authorization = { accessToken };

  return res
    .status(200)
    .json({ message: `User ${username} has logged in successfully` });
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { review, rating } = req.body;
  const { username } = req.user;
  const { isbn } = req.params;

  if (!review || isNaN(Number(rating))) {
    return res.status(400).json({
      message: "Please provide valid 'review' and numeric 'rating' fields.",
    });
  }

  if (!books?.[isbn]) {
    return res.status(404).json({
      message: `Book with ISBN ${isbn} was not found.`,
    });
  }

  const alreadyReviewed = !!books[isbn].reviews?.[username];

  books[isbn].reviews[username] = {
    review,
    rating: Number(rating),
  };

  return res.status(200).json({
    message: alreadyReviewed
      ? "Your review was updated."
      : "Your review was added!",
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { username } = req.user;
  const { isbn } = req.params;

  if (!books?.[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} was not found.` });
  }

  if (books[isbn].reviews?.[username]) {
    delete books[isbn].reviews?.[username];
    return res.status(200).json({ message: "Your review was deleted" });
  }

  return res
    .status(200)
    .json({ message: "Your review was not found. Nothing to delete" });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
