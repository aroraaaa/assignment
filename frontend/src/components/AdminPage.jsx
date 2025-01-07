import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const AdminPage = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState('');
  const [author, setAuthor] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [editingBook, setEditingBook] = useState(null);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [updatedAuthor, setUpdatedAuthor] = useState('');
  const [updatedPublicationYear, setUpdatedPublicationYear] = useState('');

  const navigate = useNavigate();

  // Fetch books from backend
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await axios.get('http://localhost:5000/books');
    setBooks(res.data);
  };

  // Add a book
  const addBook = async () => {
    if (newBook && author && publicationYear) {
      const res = await axios.post('http://localhost:5000/books', { 
        title: newBook, 
        author, 
        publicationYear 
      });
      setBooks([...books, res.data]);
      setNewBook('');
      setAuthor('');
      setPublicationYear('');
    }
  };

  // Delete a book
  const deleteBook = async (id) => {
    await axios.delete(`http://localhost:5000/books/${id}`);
    setBooks(books.filter((book) => book._id !== id));
  };

  // Open edit mode
  const editBook = (book) => {
    setEditingBook(book);
    setUpdatedTitle(book.title);
    setUpdatedAuthor(book.author);
    setUpdatedPublicationYear(book.publicationYear);
  };

  // Update book
  const updateBook = async () => {
    const res = await axios.put(`http://localhost:5000/books/${editingBook._id}`, { 
      title: updatedTitle,
      author: updatedAuthor,
      publicationYear: updatedPublicationYear 
    });
    setBooks(books.map((book) => (book._id === res.data._id ? res.data : book)));
    setEditingBook(null);
    setUpdatedTitle('');
    setUpdatedAuthor('');
    setUpdatedPublicationYear('');
  };

  // Navigate to root page
  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="admin-container">
      <button className="back-button" onClick={goBack}>Back</button>
      <h1>Admin Dashboard</h1>
      <input
        type="text"
        placeholder="Book Title"
        value={newBook}
        onChange={(e) => setNewBook(e.target.value)}
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
      />
      <input
        type="number"
        placeholder="Publication Year"
        value={publicationYear}
        onChange={(e) => setPublicationYear(e.target.value)}
      />
      <button onClick={addBook}>Add Book</button>
      <ul>
        {books.map((book) => (
          <li key={book._id}>
            {book.title} by {book.author} ({book.publicationYear})
            <button onClick={() => deleteBook(book._id)}>Delete</button>
            <button onClick={() => editBook(book)}>Edit</button>
          </li>
        ))}
      </ul>

      {/* Modal for updating a book */}
      {editingBook && (
        <div className="modal">
          <div className="modal-content">
            <h2>Update Book</h2>
            <input
              type="text"
              value={updatedTitle}
              onChange={(e) => setUpdatedTitle(e.target.value)}
            />
            <input
              type="text"
              value={updatedAuthor}
              onChange={(e) => setUpdatedAuthor(e.target.value)}
            />
            <input
              type="number"
              value={updatedPublicationYear}
              onChange={(e) => setUpdatedPublicationYear(e.target.value)}
            />
            <button onClick={updateBook}>Save</button>
            <button onClick={() => setEditingBook(null)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
