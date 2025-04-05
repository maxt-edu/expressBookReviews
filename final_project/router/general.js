const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username && !password) {
    return res
      .status(400)
      .json({ message: "Please provide username and password" });
  }

  if (!isValid(username)) {
    return res.status(400).json({
      message: "This username is already taken. Please choose another one",
    });
  }

  users.push({ username, password });
  return res
    .status(200)
    .json({ message: `User ${username} has been registered!` });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

// Get the book list available in the shop asynchronously
public_users.get("/async", async function (req, res) {
  const booksFound = await new Promise((resolve) => {
    setTimeout(() => resolve(books), 1000);
  });

  return res.status(200).json(booksFound);
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const { isbn } = req.params;
  if (!books?.[isbn])
    return res
      .status(404)
      .json({ message: `Book with this ISBN ${isbn} does not exist` });

  return res.status(200).json(books[isbn]);
});

// Get book details based on ISBN asynchronously
public_users.get("/async/isbn/:isbn", async function (req, res) {
  const { isbn } = req.params;

  try {
    const book = await new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!books?.[isbn])
          reject(new Error(`Book with this ISBN ${isbn} does not exist`));
        resolve(books[isbn]);
      }, 1000);
    });

    return res.status(200).json(book);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const { author } = req.params;
  const books_by_author = Object.values(books).filter(
    (book) => book.author.toLowerCase() == author.toLowerCase(),
  );

  if (books_by_author.length == 0) {
    return res
      .status(404)
      .json({ message: `Books by author ${author} were not found` });
  }

  return res.status(200).json(books_by_author);
});

// Get book details based on author asynchronously
public_users.get("/async/author/:author", async function (req, res) {
  const { author } = req.params;

  try {
    const books_by_author = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const books_found = Object.values(books).filter(
          (book) => book.author.toLowerCase() == author.toLowerCase(),
        );
        if (books_found.length == 0) {
          reject(new Error(`Books with author ${author} were not found`));
        }
        resolve(books_found);
      }, 1000);
    });

    return res.status(200).json(books_by_author);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const { title } = req.params;

  const books_by_title = Object.values(books).filter((book) =>
    book.title.toLowerCase().includes(title.toLowerCase()),
  );
  if (books_by_title.length == 0) {
    return res
      .status(404)
      .json({ message: `Books with title ${title} were not found` });
  }

  return res.status(200).json(books_by_title);
});

// Get all books based on title asynchronously
public_users.get("/async/title/:title", async function (req, res) {
  const { title } = req.params;

  try {
    const books_by_title = await new Promise((resolve, reject) => {
      setTimeout(() => {
        const books_found = Object.values(books).filter((book) =>
          book.title.toLowerCase().includes(title.toLowerCase()),
        );
        if (books_found.length == 0) {
          reject(new Error(`Books with title ${title} were not found`));
        }
        resolve(books_found);
      }, 1000);
    });
    return res.status(200).json(books_by_title);
  } catch (e) {
    return res.status(404).json({ message: e.message });
  }
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;

  if (!books?.[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} was not found` });
  }

  return res.status(200).json(books[isbn].reviews);
});

module.exports.general = public_users;
