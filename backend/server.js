const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect('mongodb://localhost:27017/library-man', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Updated Book Schema with Author and Publication Year
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true }, // Author of the book
  publicationYear: { type: Number, required: true }, // Year the book was published
  isBorrowed: { type: Boolean, default: false },
  borrowedBy: { type: String, default: null },
  isbn: { type: String, default: uuidv4, unique: true }  // Automatically generates a unique ISBN
});   

const Book = mongoose.model('Book', bookSchema);

// Routes
app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Route to add a new book with title, author, and publication year
app.post('/books', async (req, res) => {
  try {
    const newBook = new Book({
      title: req.body.title,  
      author: req.body.author,  // Adding author
      publicationYear: req.body.publicationYear,  // Adding publication year
    });
    await newBook.save();
    res.status(201).json(newBook);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/books/:id', async (req, res) => {
  try {
    const updatedBook = await Book.findByIdAndUpdate(req.params.id, { 
      title: req.body.title,
      author: req.body.author,  // Updating author
      publicationYear: req.body.publicationYear,  // Updating publication year
    }, { new: true });
    res.json(updatedBook);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/books/:id', async (req, res) => {
  try {
    await Book.findByIdAndDelete(req.params.id);
    res.json({ message: 'Book deleted' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Borrow a book
app.post('/books/:id/borrow', async (req, res) => {
    const { userName, contactInfo } = req.body; // User borrowing the book
    try {
      const book = await Book.findById(req.params.id);
      if (book.isBorrowed) {
        return res.status(400).json({ message: 'Book is already borrowed' });
      }
      book.isBorrowed = true;
      book.borrowedBy = `${userName} (${contactInfo})`;  // Store name and contact info
      await book.save();
      res.json(book);
    } catch (err) {
      res.status(500).send(err.message);
    }
  });
  
  
// Return a book
app.post('/books/:id/return', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book.isBorrowed) {
      return res.status(400).json({ message: 'Book is not borrowed' });
    }
    book.isBorrowed = false;
    book.borrowedBy = null;
    await book.save();
    res.json(book);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
