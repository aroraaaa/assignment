const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error(err));

// Updated Book Schema with Author and Publication Year
const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  publicationYear: { type: Number, required: true }, 
  isBorrowed: { type: Boolean, default: false },
  borrowedBy: { type: String, default: null },
  isbn: { type: String, default: uuidv4, unique: true }  
});   

const Book = mongoose.model('Book', bookSchema);

app.get('/books', async (req, res) => {
  try {
    const books = await Book.find();
    res.json(books);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/books', async (req, res) => {
  try {
    const newBook = new Book({
      title: req.body.title,  
      author: req.body.author,  
      publicationYear: req.body.publicationYear,  
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
      author: req.body.author,  
      publicationYear: req.body.publicationYear,
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
  const { userName, contactInfo } = req.body; 
  try {
    const book = await Book.findById(req.params.id);
    if (book.isBorrowed) {
      return res.status(400).json({ message: 'Book is already borrowed' });
    }
    book.isBorrowed = true;
    book.borrowedBy = `${userName} (${contactInfo})`; 
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
app.listen(process.env.PORT, () => {
  console.log(`Server is running on http://localhost:${process.env.PORT}`);
});
