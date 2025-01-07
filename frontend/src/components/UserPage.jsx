import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './UserPage.css';

const UserPage = () => {
  const [books, setBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const navigate = useNavigate();

  // Fetch books from backend
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    const res = await axios.get('http://localhost:5000/books');
    setBooks(res.data);
    setBorrowedBooks(res.data.filter((book) => book.isBorrowed)); // Update borrowed books
  };

  // Borrow a book
  const borrowBook = async (id) => {
    const user = prompt("Enter your name to borrow the book");
    const contact = prompt("Enter your contact information");

    if (user && contact) {
      try {
        const res = await axios.post(`http://localhost:5000/books/${id}/borrow`, { userName: user, contactInfo: contact });

        // Update books and borrowedBooks state
        setBooks(books.map((book) => (book._id === res.data._id ? res.data : book)));
        setBorrowedBooks([...borrowedBooks, res.data]);
      } catch (error) {
        console.error("Error borrowing book:", error);
      }
    }
  };

  // Return a book
  const returnBook = async (id) => {
    const res = await axios.post(`http://localhost:5000/books/${id}/return`);
    // Update books and borrowedBooks state
    setBooks(books.map((book) => (book._id === res.data._id ? res.data : book)));
    setBorrowedBooks(borrowedBooks.filter((book) => book._id !== id));
  };

  // Navigate to root page
  const goBack = () => {
    navigate('/');
  };

  return (
    <div className="user-container">
      <button className="back-button" onClick={goBack}>Back</button>
      <h1>User Dashboard</h1>
      
      <h2>Available Books</h2>
      <ul>
        {books.map((book) => (
          !book.isBorrowed && (
            <li key={book._id}>
              {book.title} by {book.author} ({book.publicationYear})
              <button onClick={() => borrowBook(book._id)}>Borrow</button>
            </li>
          )
        ))}
      </ul>

      <h2>Your Borrowed Books</h2>
      <ul>
        {borrowedBooks.map((book) => (
          <li key={book._id}>
            {book.title} by {book.author} ({book.publicationYear})
            <button onClick={() => returnBook(book._id)}>Return</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default UserPage;
