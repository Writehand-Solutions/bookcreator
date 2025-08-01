import React from 'react';
import { BookOpenIcon } from '@heroicons/react/24/outline';

const BookList = ({ books, handleReadBook }) => {
  return (
    <>
      <div className="px-4 py-2">My Books</div>
      {books.map((book) => (
        <button
          key={book.id}
          className="w-full text-left text-sm px-4 py-2 rounded-sm hover:bg-gray-200 flex
            focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          onClick={() => handleReadBook(book.id)}
        >
          <BookOpenIcon className="size-4 mr-2 flex-none mt-1" />
          {book.title}
        </button>
        
      ))}
    </>
  );
};

export default BookList;